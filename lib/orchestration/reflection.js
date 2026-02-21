// Reflection — Self-correction loops for failed agent tasks.
// When a task fails, the reflection system retries it once with a diagnostic
// prompt that includes the original error, helping the agent self-correct.
// Budget-aware: skips reflection if remaining budget is too low.

import { gatewayCall, routeModel } from "../ai-gateway.js";
import { writeToBoard, readFromBoard, logEvent } from "./blackboard.js";

/**
 * Minimum tokens remaining to attempt a reflection retry.
 * Reflection uses ~2000 tokens (input + output), so we need at least this much headroom.
 */
const MIN_TOKENS_FOR_REFLECTION = 3000;

/**
 * Attempt to recover a failed task via reflection.
 * Builds a diagnostic prompt with the error context and retries the agent call.
 *
 * @param {object} agent - Agent profile
 * @param {object} task - The failed task
 * @param {string} errorMessage - The original error
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks for context
 * @param {object[]} team - Full team roster
 * @param {object} budget - BudgetTracker
 * @param {function} onEvent - Event emitter
 * @returns {Promise<object>} Result with status "completed" or "failed"
 */
export async function reflectAndRetry(
  agent,
  task,
  errorMessage,
  board,
  allTasks,
  team,
  budget,
  onEvent
) {
  const agentNodeId = `agent_${agent.id}`;

  // Budget check — don't waste tokens on reflection if we're nearly out
  if (budget && !budget.canAfford(MIN_TOKENS_FOR_REFLECTION)) {
    logEvent(board, agent.id, "reflection_skipped", {
      taskId: task.id,
      reason: "insufficient_budget",
    });
    if (onEvent) {
      onEvent("reflection.skipped", {
        taskId: task.id,
        taskTitle: task.title,
        agentId: agent.id,
        agentName: agent.name,
        reason: "Budget too low for reflection retry",
      }, agentNodeId);
    }
    return {
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name,
      status: "failed",
      error: errorMessage,
      reflectionAttempted: false,
    };
  }

  logEvent(board, agent.id, "reflection_start", {
    taskId: task.id,
    originalError: errorMessage,
  });

  if (onEvent) {
    onEvent("reflection.start", {
      taskId: task.id,
      taskTitle: task.title,
      agentId: agent.id,
      agentName: agent.name,
      originalError: errorMessage,
    }, agentNodeId);
  }

  try {
    // Build upstream context (same as original attempt)
    const contextParts = [];
    for (const depId of task.dependsOn || []) {
      const output = readFromBoard(board, `${depId}.output`);
      if (output) {
        const depTask = allTasks.find((t) => t.id === depId);
        const label = depTask ? depTask.title : depId;
        const truncated =
          typeof output === "string"
            ? output.slice(0, 1500)
            : JSON.stringify(output).slice(0, 1500);
        contextParts.push(`--- ${label} (${depId}) ---\n${truncated}`);
      }
    }
    const upstreamContext = contextParts.length > 0
      ? `UPSTREAM WORK:\n\n${contextParts.join("\n\n")}`
      : "No upstream context available.";

    // Build the team preamble
    const teamList = team
      .map((a) => `- ${a.name} (${a.domain || "general"})`)
      .join("\n");

    const reflectionSystem = `You are ${agent.name}. ${agent.persona || ""}

You are part of an orchestrated team on the Re³ platform.
MISSION: ${board.useCase?.title}
YOUR TEAM:\n${teamList}

IMPORTANT: Your previous attempt at this task FAILED.
You must analyze what went wrong and try a different approach.

PREVIOUS ERROR: ${errorMessage}

YOUR TASK: ${task.title}
${task.description}

EXPECTED OUTPUT FORMAT: ${task.outputFormat}

REFLECTION INSTRUCTIONS:
1. Consider what might have caused the failure
2. Try a simpler, more focused approach
3. If the output format was the issue, ensure clean formatting
4. Keep your response concise and well-structured`;

    const userMessage = `${upstreamContext}

Retry your task: "${task.title}"
This is a reflection retry — take a different, more careful approach.`;

    // Use the same model routing but bump complexity slightly (better model for retry)
    const model = routeModel(
      Math.min((task._complexity || 0.5) + 0.2, 1.0),
      agent.model
    );

    const { text, usage } = await gatewayCall(model, reflectionSystem, userMessage, {
      maxTokens: 2000,
      timeout: 45000,
    });

    // Success — write output to blackboard
    writeToBoard(board, `${task.id}.output`, text, agent.id);
    logEvent(board, agent.id, "reflection_success", {
      taskId: task.id,
      tokens: usage.estimatedInputTokens + usage.estimatedOutputTokens,
      model: usage.model,
    });

    if (budget) {
      budget.record(agent.id, `${task.id}_reflection`, usage);
    }

    if (onEvent) {
      onEvent("reflection.success", {
        taskId: task.id,
        taskTitle: task.title,
        agentId: agent.id,
        agentName: agent.name,
        model: usage.model,
        tokens: usage.estimatedInputTokens + usage.estimatedOutputTokens,
        cost: usage.estimatedCost,
        durationMs: usage.durationMs,
        outputPreview: typeof text === "string" ? text.slice(0, 200) : "",
      }, agentNodeId);
    }

    return {
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name,
      status: "completed",
      output: text,
      usage,
      reflectionRecovered: true,
    };
  } catch (retryErr) {
    logEvent(board, agent.id, "reflection_failed", {
      taskId: task.id,
      error: retryErr.message,
    });

    if (onEvent) {
      onEvent("reflection.failed", {
        taskId: task.id,
        taskTitle: task.title,
        agentId: agent.id,
        agentName: agent.name,
        error: retryErr.message,
      }, agentNodeId);
    }

    return {
      taskId: task.id,
      agentId: agent.id,
      agentName: agent.name,
      status: "failed",
      error: `Original: ${errorMessage}; Reflection retry: ${retryErr.message}`,
      reflectionAttempted: true,
    };
  }
}
