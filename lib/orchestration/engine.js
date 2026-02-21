// Orchestration Engine — The Brain
// Runs a use case end-to-end: intake → decompose → assemble → execute → synthesize → deliver.

import { loadRegistry, getAllAgents, getAgentById } from "../agent-registry.js";
import { selectTeam, assignRoles } from "../agent-scoring.js";
import { BudgetTracker } from "../ai-gateway.js";
import {
  createBlackboard,
  setTeam,
  setStatus,
  logEvent,
  writeToBoard,
  snapshot,
  fullSnapshot,
} from "./blackboard.js";
import { decompose, buildExecutionLayers } from "./task-decomposer.js";
import { executeWorkflow } from "./workflow.js";
import { formatSynthesisInput, buildDeliverable } from "./handshake.js";
import { gatewayCall } from "../ai-gateway.js";

// In-memory store for active and completed runs.
// Phase 2+: move to Redis or Firebase.
const _runs = new Map();

/**
 * Validate a use case submission.
 * Enforces light-use-case guardrails.
 */
function validateUseCase(useCase) {
  const errors = [];

  if (!useCase.title || useCase.title.length > 120) {
    errors.push("Title is required and must be under 120 characters");
  }
  if (!useCase.description || useCase.description.length > 2000) {
    errors.push("Description is required and must be under 2000 characters");
  }

  const validTypes = [
    "micro-saas-validator",
    "ai-workflow-blueprint",
    "creator-monetization",
    "vertical-agent-design",
    "growth-experiment",
  ];
  if (!validTypes.includes(useCase.type)) {
    errors.push(`Type must be one of: ${validTypes.join(", ")}`);
  }

  return errors;
}

/**
 * Run a complete orchestration.
 * This is the main entry point — called by the API route.
 *
 * @param {object} useCase - { title, description, type }
 * @param {object} options - { maxAgents?, tokenBudget?, costBudget?, onProgress? }
 * @returns {Promise<object>} Final deliverable
 */
export async function runOrchestration(useCase, options = {}) {
  const {
    maxAgents = 5,
    tokenBudget = 25000,
    costBudget = 0.10,
    onProgress,
  } = options;

  // Generate run ID
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Initialize budget tracker
  const budget = new BudgetTracker(tokenBudget, costBudget);

  // Create Blackboard
  const board = createBlackboard(runId, useCase);
  _runs.set(runId, { board, budget, status: "running", result: null });

  const emit = (phase) => {
    if (onProgress) onProgress(runId, phase, snapshot(board), budget.toJSON());
  };

  try {
    // === PHASE 1: INTAKE ===
    setStatus(board, "intake");
    const validationErrors = validateUseCase(useCase);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join("; ")}`);
    }
    logEvent(board, "system", "intake_complete", { useCase });
    emit("intake");

    // === PHASE 2: DECOMPOSE ===
    setStatus(board, "decomposing");
    await loadRegistry();
    const { tasks, complexity } = await decompose(useCase, budget);
    writeToBoard(board, "decomposition", { tasks, complexity }, "system");
    logEvent(board, "system", "decompose_complete", {
      taskCount: tasks.length,
      complexity,
    });
    emit("decomposed");

    // === PHASE 3: ASSEMBLE TEAM ===
    setStatus(board, "assembling");
    const allAgents = await getAllAgents();

    // Select optimal team
    const team = selectTeam(allAgents, useCase.type, maxAgents);

    // Assign roles based on tasks
    const assignedTeam = assignRoles(team, tasks);
    setTeam(board, assignedTeam);

    // Build maps for workflow engine
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const assignmentMap = new Map();
    for (const member of assignedTeam) {
      if (member._assignedTask) {
        // Get full agent profile for execution
        const fullAgent = await getAgentById(member.id);
        assignmentMap.set(member._assignedTask, fullAgent || member);
      }
    }

    // If there are more tasks than agents, assign remaining tasks to best-fit agents
    for (const task of tasks) {
      if (!assignmentMap.has(task.id)) {
        // Find the best unassigned or least-busy agent for this task
        const bestAgent = findBestAgentForTask(task, assignedTeam, assignmentMap);
        if (bestAgent) {
          const fullAgent = await getAgentById(bestAgent.id);
          assignmentMap.set(task.id, fullAgent || bestAgent);
        }
      }
    }

    writeToBoard(
      board,
      "team",
      assignedTeam.map((a) => ({
        id: a.id,
        name: a.name,
        task: a._assignedTask,
      })),
      "system"
    );
    logEvent(board, "system", "assemble_complete", {
      teamSize: assignedTeam.length,
    });
    emit("assembled");

    // === PHASE 4: EXECUTE WORKFLOW ===
    setStatus(board, "executing");
    const layers = buildExecutionLayers(tasks);
    writeToBoard(board, "execution_plan", { layers }, "system");

    const results = await executeWorkflow(
      layers,
      taskMap,
      assignmentMap,
      board,
      tasks,
      assignedTeam,
      budget,
      (layerIdx, layerResults) => {
        emit(`layer_${layerIdx}`);
      }
    );

    logEvent(board, "system", "execute_complete", {
      totalResults: results.length,
      completed: results.filter((r) => r.status === "completed").length,
      failed: results.filter((r) => r.status === "failed").length,
    });
    emit("executed");

    // === PHASE 5: SYNTHESIZE ===
    setStatus(board, "synthesizing");
    const synthesisInput = formatSynthesisInput(board, tasks, results);

    const synthesisSystem = `You are the Synthesis Agent for the Re³ orchestration platform.
Your job is to take the outputs from multiple specialist agents and weave them into a single, coherent deliverable.

The use case was: "${useCase.title}" (${useCase.type})
Description: ${useCase.description}

Create a polished, professional deliverable that:
1. Integrates all agent outputs into a coherent narrative
2. Resolves any contradictions between agents
3. Adds an executive summary at the top
4. Structures the content with clear sections and headers
5. Ends with key recommendations or next steps

Use markdown formatting. Be thorough but concise.`;

    const { text: synthesisText, usage: synthUsage } = await gatewayCall(
      "anthropic", // Synthesis always uses the best model
      synthesisSystem,
      `Here are the outputs from the specialist agents:\n\n${synthesisInput}\n\nNow synthesize these into the final deliverable.`,
      { maxTokens: 3000, timeout: 60000 }
    );

    budget.record("synthesis", "synthesis", synthUsage);
    writeToBoard(board, "synthesis.output", synthesisText, "synthesis");
    logEvent(board, "synthesis", "completed", {});
    emit("synthesized");

    // === PHASE 6: DELIVER ===
    setStatus(board, "completed");
    const deliverable = buildDeliverable(board, synthesisText, results, budget);
    writeToBoard(board, "deliverable", deliverable, "system");

    // Store final result
    _runs.set(runId, {
      board,
      budget,
      status: "completed",
      result: deliverable,
    });

    emit("completed");
    return deliverable;
  } catch (err) {
    setStatus(board, "failed");
    logEvent(board, "system", "error", { error: err.message });
    _runs.set(runId, { board, budget, status: "failed", error: err.message });
    emit("failed");
    throw err;
  }
}

/**
 * Find the best agent for an unassigned task.
 */
function findBestAgentForTask(task, team, assignmentMap) {
  // Count how many tasks each agent already has
  const loadMap = new Map();
  for (const [, agent] of assignmentMap) {
    loadMap.set(agent.id, (loadMap.get(agent.id) || 0) + 1);
  }

  // Score each team member for this task, penalizing overloaded agents
  let bestAgent = null;
  let bestScore = -1;

  for (const agent of team) {
    let score = 0;
    for (const cap of task.requiredCapabilities || []) {
      score += agent.capabilities?.[cap] || 0;
    }
    // Penalize agents with existing assignments
    score -= (loadMap.get(agent.id) || 0) * 2;

    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }

  return bestAgent;
}

/**
 * Get the current status of a run.
 */
export function getRunStatus(runId) {
  const run = _runs.get(runId);
  if (!run) return null;
  return {
    runId,
    status: run.status,
    error: run.error || null,
    board: snapshot(run.board),
    budget: run.budget.toJSON(),
    result: run.result,
  };
}

/**
 * Get the full archived record of a completed run (for Arena Library).
 */
export function getRunArchive(runId) {
  const run = _runs.get(runId);
  if (!run) return null;
  return {
    runId,
    status: run.status,
    board: fullSnapshot(run.board),
    budget: run.budget.toJSON(),
    result: run.result,
  };
}

/**
 * List all runs (recent first).
 */
export function listRuns() {
  return Array.from(_runs.entries())
    .map(([id, run]) => ({
      runId: id,
      status: run.status,
      useCase: run.board.useCase,
      createdAt: run.board.createdAt,
      elapsedMs: Date.now() - run.board.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}
