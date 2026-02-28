// Orchestration Engine — The Brain
// Runs a use case end-to-end: intake → decompose → assemble → execute → synthesize → deliver.
// Emits structured events for real-time UI streaming and educational timeline.
//
// ── Phase 3 Enhancements (planned) ────────────────────────────────────
//
// 1. WORKFLOW VISUALIZATION REWORK
//    Replace the reactive event timeline with a pre-rendered pipeline view.
//    All 7 phases (intake → decompose → assemble → execute → reflect →
//    cross-pollinate → synthesize) render as empty containers the moment
//    a run starts. Sub-components (tasks, agents, outputs) fill in live
//    as SSE events stream. Phases transition: pending → active → completed.
//    Reflect and cross-pollinate containers appear conditionally.
//    Reference: OrchestrationPage.js, ExecutionTimeline.js
//
// 2. COMMON CONSCIOUSNESS BOARD REWORK
//    Transform from a flat key-value viewer into a living shared-memory
//    visualization. Show the board as a spatial canvas where each agent
//    has a "desk" — writes glow when new, reads draw visible connection
//    lines between reader and writer. Upstream/downstream data flow is
//    visible. The board should surface: which agents read whose output,
//    version history per key, conflict detection when two agents write
//    the same key, and a diff view for A2A-refined entries (before/after).
//    The episodic log becomes a filterable activity feed per agent.
//    Reference: BlackboardPanel.js, blackboard.js
// ───────────────────────────────────────────────────────────────────────

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
import { createEvent, resetEventCounter } from "./event-bus.js";
import { crossPollinate } from "./a2a.js";
import { extractUrls } from "./mcp-tools.js";

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
 * @param {object} options - { maxAgents?, tokenBudget?, costBudget?, onEvent? }
 * @returns {Promise<object>} Final deliverable
 */
export async function runOrchestration(useCase, options = {}) {
  const {
    maxAgents = 5,
    tokenBudget = 25000,
    costBudget = 0.10,
    onEvent,
  } = options;

  // Generate run ID
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Reset event counter for this run
  resetEventCounter();

  // Initialize budget tracker
  const budget = new BudgetTracker(tokenBudget, costBudget);

  // Create Blackboard
  const board = createBlackboard(runId, useCase);
  _runs.set(runId, { board, budget, status: "running", result: null });

  // Emit a structured event with current snapshot + budget
  const emit = (type, data = {}, nodeId = null) => {
    if (!onEvent) return;
    const event = createEvent(
      type,
      { ...data, snapshot: snapshot(board), budget: budget.toJSON() },
      nodeId
    );
    onEvent(event);
  };

  try {
    // === PHASE 1: INTAKE ===
    setStatus(board, "intake");
    const validationErrors = validateUseCase(useCase);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join("; ")}`);
    }
    logEvent(board, "system", "intake_complete", { useCase });
    emit("phase.intake", { title: useCase.title, type: useCase.type }, "usecase");

    // Detect URLs for MCP enrichment (notifies UI but doesn't fetch yet)
    const detectedUrls = extractUrls(useCase.description);
    if (detectedUrls.length > 0) {
      emit("mcp.enrich.start", { urlCount: detectedUrls.length, urls: detectedUrls }, "usecase");
    }

    // === PHASE 2: DECOMPOSE ===
    setStatus(board, "decomposing");
    emit("phase.decompose.start", {}, "usecase");

    await loadRegistry();
    const { tasks, complexity } = await decompose(useCase, budget);
    writeToBoard(board, "decomposition", { tasks, complexity }, "system");
    logEvent(board, "system", "decompose_complete", {
      taskCount: tasks.length,
      complexity,
    });

    const layers = buildExecutionLayers(tasks);
    emit("phase.decompose.complete", {
      taskCount: tasks.length,
      complexity,
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, dependsOn: t.dependsOn })),
      layerCount: layers.length,
      layers: layers.map((l, i) => ({
        index: i,
        taskIds: l,
        taskTitles: l.map((id) => tasks.find((t) => t.id === id)?.title || id),
      })),
    }, "usecase");

    // === PHASE 3: ASSEMBLE TEAM ===
    setStatus(board, "assembling");
    emit("phase.assemble.start", { agentPoolSize: 1000, maxAgents }, null);

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
        const fullAgent = await getAgentById(member.id);
        assignmentMap.set(member._assignedTask, fullAgent || member);
      }
    }

    // If there are more tasks than agents, assign remaining tasks to best-fit agents
    for (const task of tasks) {
      if (!assignmentMap.has(task.id)) {
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
    emit("phase.assemble.complete", {
      teamSize: assignedTeam.length,
      agents: assignedTeam.map((a) => ({
        id: a.id,
        name: a.name,
        domain: a.domain,
        specialization: a.specialization,
        assignedTask: a._assignedTask,
        taskTitle: a._taskTitle,
        model: a.model,
      })),
    }, null);

    // === PHASE 4: EXECUTE WORKFLOW ===
    setStatus(board, "executing");
    writeToBoard(board, "execution_plan", { layers }, "system");

    emit("phase.execute.start", {
      layerCount: layers.length,
      totalTasks: tasks.length,
    }, null);

    const results = await executeWorkflow(
      layers,
      taskMap,
      assignmentMap,
      board,
      tasks,
      assignedTeam,
      budget,
      // onLayerComplete
      (layerIdx, layerResults) => {
        emit("layer.complete", {
          layerIndex: layerIdx,
          completed: layerResults.filter((r) => r.status === "completed").length,
          failed: layerResults.filter((r) => r.status === "failed").length,
          total: layerResults.length,
        }, null);
      },
      // onEvent — forward task-level events from workflow
      (type, data, nodeId) => {
        emit(type, data, nodeId);
      }
    );

    logEvent(board, "system", "execute_complete", {
      totalResults: results.length,
      completed: results.filter((r) => r.status === "completed").length,
      failed: results.filter((r) => r.status === "failed").length,
    });

    // === PHASE 4b: A2A CROSS-POLLINATION ===
    // Each agent refines its output based on all peer outputs
    const refinedResults = await crossPollinate(
      results,
      taskMap,
      assignmentMap,
      board,
      tasks,
      assignedTeam,
      budget,
      (type, data, nodeId) => emit(type, data, nodeId)
    );

    // === PHASE 5: SYNTHESIZE ===
    setStatus(board, "synthesizing");
    emit("phase.synthesize.start", {
      inputCount: refinedResults.filter((r) => r.status === "completed").length,
    }, "synthesis");

    const synthesisInput = formatSynthesisInput(board, tasks, refinedResults);

    const synthesisSystem = `You are the Synthesis Agent for the Re³ orchestration platform.
Your job is to take the outputs from multiple specialist agents and produce a STRUCTURED deliverable with three concrete artifacts.

The use case was: "${useCase.title}" (${useCase.type})
Description: ${useCase.description}

Your output has TWO sections. You MUST output both sections in this exact order:

## SECTION 1: JSON METADATA
Output valid JSON with this structure. Do NOT include prototype code in the JSON — only the component name and description.

{
  "executive_summary": "2-3 sentence executive summary of the entire deliverable",
  "blueprint": {
    "sequence_diagram": "A complete Mermaid.js sequence diagram (sequenceDiagram\\n ...) showing step-by-step interaction between the user, AI orchestration layer, and external data sources. Use proper Mermaid syntax with \\n for newlines.",
    "erd": "A complete Mermaid.js entity-relationship diagram (erDiagram\\n ...) defining the core data objects and their relationships. Use proper Mermaid syntax with \\n for newlines.",
    "technical_constraints": ["Constraint 1", "Constraint 2"],
    "api_integrations": ["API/service 1", "API 2"]
  },
  "prototype": {
    "component_name": "PascalCaseName",
    "description": "What this prototype demonstrates"
  },
  "recommendations": ["Key recommendation 1", "Recommendation 2"],
  "full_report": "The full markdown narrative integrating all agent outputs (executive summary, analysis sections, conclusions). Use \\n for newlines."
}

## SECTION 2: PROTOTYPE CODE
After the JSON, output the React component between these exact delimiters:

===PROTOTYPE_CODE===
function ComponentName() {
  // A complete single-file React component using Tailwind CSS.
  // MUST: (1) be fully self-contained with NO imports (React hooks are globals),
  // (2) use Tailwind utility classes, (3) have interactive elements,
  // (4) include a Status/Analytics section, (5) use useState for interactivity.
  // DO NOT use export/import statements. Just declare the function.
  // Keep under 200 lines.
}
===END_PROTOTYPE_CODE===

CRITICAL RULES:
- The Mermaid diagrams must use valid Mermaid.js syntax. Test mentally that they would render.
- The React component must be a plain function declaration (e.g. "function MyApp() { ... }"). NO import or export statements.
- The component function name MUST match the "component_name" in the JSON.
- Do NOT put the React code inside the JSON. It goes ONLY between the ===PROTOTYPE_CODE=== delimiters.
- Do NOT wrap the JSON in markdown code fences. Output the raw JSON directly.`;

    // Increase token budget for structured output
    const synthesisMaxTokens = 5000;

    const { text: synthesisText, usage: synthUsage } = await gatewayCall(
      "anthropic", // Synthesis always uses the best model
      synthesisSystem,
      `Here are the outputs from the specialist agents:\n\n${synthesisInput}\n\nNow synthesize these into the structured JSON deliverable. Remember: return ONLY valid JSON, no markdown wrapping.`,
      { maxTokens: synthesisMaxTokens, timeout: 90000 }
    );

    budget.record("synthesis", "synthesis", synthUsage);
    writeToBoard(board, "synthesis.output", synthesisText, "synthesis");
    logEvent(board, "synthesis", "completed", {});
    emit("phase.synthesize.complete", {
      model: "anthropic",
      tokens: synthUsage.estimatedInputTokens + synthUsage.estimatedOutputTokens,
      cost: synthUsage.estimatedCost,
    }, "synthesis");

    // === PHASE 6: DELIVER ===
    setStatus(board, "completed");
    const deliverable = buildDeliverable(board, synthesisText, refinedResults, budget);
    writeToBoard(board, "deliverable", deliverable, "system");

    // Store final result
    _runs.set(runId, {
      board,
      budget,
      status: "completed",
      result: deliverable,
    });

    emit("phase.complete", {
      totalTasks: refinedResults.length,
      completedTasks: refinedResults.filter((r) => r.status === "completed").length,
      totalCost: budget.toJSON().costAccumulated,
      tokensUsed: budget.toJSON().tokensUsed,
      elapsedMs: Date.now() - board.createdAt,
      deliverable,
    }, null);

    return deliverable;
  } catch (err) {
    setStatus(board, "failed");
    logEvent(board, "system", "error", { error: err.message });
    _runs.set(runId, { board, budget, status: "failed", error: err.message });
    emit("phase.failed", { error: err.message }, null);
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
