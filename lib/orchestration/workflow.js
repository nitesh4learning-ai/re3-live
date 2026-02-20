// Workflow Engine — Executes task graphs with sequential and parallel patterns.
// Manages agent execution, Blackboard writes, and budget tracking.

import { gatewayCall, routeModel } from "../ai-gateway.js";
import {
  writeToBoard,
  readFromBoard,
  logEvent,
} from "./blackboard.js";

/**
 * Build the System Preamble — shared context injected into every agent's prompt.
 * This is Layer 1 of Common Consciousness (Shared Identity).
 *
 * @param {object} board - Blackboard
 * @param {object[]} team - Full team roster
 * @returns {string}
 */
function buildSystemPreamble(board, team) {
  const uc = board.useCase;
  const teamList = team
    .map(
      (a) =>
        `- ${a.name} (${a.domain} / ${a.specialization}): assigned to "${a._taskTitle || "support"}"`
    )
    .join("\n");

  return `You are part of an orchestrated team on the Re³ platform — a Human-AI Synthesis Lab.

MISSION: ${uc.title}
DESCRIPTION: ${uc.description}
USE CASE TYPE: ${uc.type}

YOUR TEAM:
${teamList}

CONSTRAINTS:
- Keep outputs focused and concise (under 500 words per task)
- Be specific and actionable — no filler or generic statements
- Build on upstream work when available — read context carefully
- Maintain a professional, analytical tone`;
}

/**
 * Build the context for a specific agent, curating relevant Blackboard state.
 * This is Layer 2 of Common Consciousness (Shared Memory) with cost-conscious curation.
 *
 * @param {object} board - Blackboard
 * @param {object} task - The current task
 * @param {object[]} allTasks - All tasks for reference
 * @returns {string} Curated context string
 */
function curateContext(board, task, allTasks) {
  const parts = [];

  // Include outputs from upstream dependencies only
  for (const depId of task.dependsOn || []) {
    const output = readFromBoard(board, `${depId}.output`);
    if (output) {
      const depTask = allTasks.find((t) => t.id === depId);
      const label = depTask ? depTask.title : depId;
      // Truncate long outputs to save tokens
      const truncated =
        typeof output === "string"
          ? output.slice(0, 1500)
          : JSON.stringify(output).slice(0, 1500);
      parts.push(`--- ${label} (${depId}) ---\n${truncated}`);
    }
  }

  if (parts.length === 0) {
    return "No upstream context available — you are the first to execute.";
  }

  return `UPSTREAM WORK COMPLETED:\n\n${parts.join("\n\n")}`;
}

/**
 * Execute a single agent task.
 *
 * @param {object} agent - Agent profile with persona, model, etc.
 * @param {object} task - Task definition
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks for context building
 * @param {object[]} team - Full team for preamble
 * @param {object} budget - BudgetTracker
 * @returns {Promise<{ taskId: string, status: string, output?: string, error?: string, usage?: object }>}
 */
export async function executeTask(agent, task, board, allTasks, team, budget) {
  logEvent(board, agent.id, "started", { taskId: task.id, taskTitle: task.title });

  try {
    // Build prompts with Common Consciousness layers
    const preamble = buildSystemPreamble(board, team);
    const context = curateContext(board, task, allTasks);

    const systemPrompt = `${preamble}

You are ${agent.name}. ${agent.persona}

YOUR TASK: ${task.title}
${task.description}

EXPECTED OUTPUT FORMAT: ${task.outputFormat}`;

    const userMessage = `${context}

Now execute your task: "${task.title}"

Produce your output. Be thorough but concise.`;

    // Route to optimal model based on task complexity
    const model = routeModel(task._complexity || 0.5, agent.model);

    const { text, usage } = await gatewayCall(model, systemPrompt, userMessage, {
      maxTokens: 2000,
      timeout: 45000,
    });

    // Write output to Blackboard
    writeToBoard(board, `${task.id}.output`, text, agent.id);
    logEvent(board, agent.id, "completed", {
      taskId: task.id,
      tokens: usage.estimatedInputTokens + usage.estimatedOutputTokens,
      model: usage.model,
    });

    // Record in budget
    if (budget) {
      budget.record(agent.id, task.id, usage);
    }

    return {
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name,
      status: "completed",
      output: text,
      usage,
    };
  } catch (err) {
    logEvent(board, agent.id, "failed", {
      taskId: task.id,
      error: err.message,
    });

    return {
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name,
      status: "failed",
      error: err.message,
    };
  }
}

/**
 * Execute a layer of tasks (all tasks in the layer run in parallel).
 *
 * @param {string[]} taskIds - Task IDs in this layer
 * @param {Map} taskMap - Map of taskId → task
 * @param {Map} assignmentMap - Map of taskId → agent
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks
 * @param {object[]} team - Full team
 * @param {object} budget - BudgetTracker
 * @returns {Promise<object[]>} Results for each task
 */
export async function executeLayer(
  taskIds,
  taskMap,
  assignmentMap,
  board,
  allTasks,
  team,
  budget
) {
  const promises = taskIds.map((taskId) => {
    const task = taskMap.get(taskId);
    const agent = assignmentMap.get(taskId);

    if (!task || !agent) {
      return Promise.resolve({
        taskId,
        status: "failed",
        error: `No task or agent found for ${taskId}`,
      });
    }

    return executeTask(agent, task, board, allTasks, team, budget);
  });

  const results = await Promise.allSettled(promises);

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      taskId: taskIds[i],
      status: "failed",
      error: r.reason?.message || "Unknown error",
    };
  });
}

/**
 * Execute the full workflow — all layers sequentially, tasks within a layer in parallel.
 *
 * @param {string[][]} layers - Execution layers from buildExecutionLayers
 * @param {Map} taskMap
 * @param {Map} assignmentMap
 * @param {object} board
 * @param {object[]} allTasks
 * @param {object[]} team
 * @param {object} budget
 * @param {function} onLayerComplete - Callback after each layer (for SSE/progress)
 * @returns {Promise<object[]>} All results
 */
export async function executeWorkflow(
  layers,
  taskMap,
  assignmentMap,
  board,
  allTasks,
  team,
  budget,
  onLayerComplete
) {
  const allResults = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    logEvent(board, "system", "layer_start", {
      layerIndex: i,
      taskIds: layer,
    });

    const results = await executeLayer(
      layer,
      taskMap,
      assignmentMap,
      board,
      allTasks,
      team,
      budget
    );

    allResults.push(...results);

    logEvent(board, "system", "layer_complete", {
      layerIndex: i,
      results: results.map((r) => ({
        taskId: r.taskId,
        status: r.status,
      })),
    });

    if (onLayerComplete) {
      onLayerComplete(i, results);
    }
  }

  return allResults;
}
