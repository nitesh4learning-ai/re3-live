// Handshake — Context curation and agent-to-agent output passing protocol.
// Ensures each agent gets exactly the right context without burning tokens.

import { readFromBoard, getBoardSummary } from "./blackboard.js";

/**
 * Curate a context package for a specific agent based on its role and position.
 * Implements cost-conscious consciousness: relevance filtering + progressive context.
 *
 * @param {object} board - Blackboard
 * @param {object} agent - Agent profile
 * @param {object} task - Current task being executed
 * @param {object[]} allTasks - All tasks in the workflow
 * @returns {object} Context package { upstreamOutputs, boardSummary, budgetStatus }
 */
export function curateContextPackage(board, agent, task, allTasks) {
  // 1. Get upstream outputs (only from direct dependencies)
  const upstreamOutputs = {};
  for (const depId of task.dependsOn || []) {
    const output = readFromBoard(board, `${depId}.output`);
    if (output) {
      const depTask = allTasks.find((t) => t.id === depId);
      upstreamOutputs[depId] = {
        taskTitle: depTask?.title || depId,
        output: summarizeOutput(output, 1000),
      };
    }
  }

  // 2. Board summary (what exists, not the full content)
  const boardSummary = getBoardSummary(board);

  // 3. Budget status (so agents can be cost-aware)
  const budgetStatus = {
    status: board.status,
    completedTasks: Object.keys(board.state).filter((k) =>
      k.endsWith(".output")
    ).length,
    totalTasks: allTasks.length,
  };

  return { upstreamOutputs, boardSummary, budgetStatus };
}

/**
 * Summarize an output to fit within a token budget.
 * For long outputs, extract the first and last sections.
 *
 * @param {string|object} output
 * @param {number} maxChars - Maximum character length
 * @returns {string}
 */
function summarizeOutput(output, maxChars = 1000) {
  const text =
    typeof output === "string" ? output : JSON.stringify(output, null, 2);

  if (text.length <= maxChars) return text;

  // Take first 70% and last 30% with ellipsis
  const headLen = Math.floor(maxChars * 0.7);
  const tailLen = maxChars - headLen - 20;
  return (
    text.slice(0, headLen) + "\n\n[... truncated ...]\n\n" + text.slice(-tailLen)
  );
}

/**
 * Format a handshake payload for the synthesis agent.
 * The synthesis agent gets a comprehensive view of all outputs.
 *
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks
 * @param {object[]} results - Execution results
 * @returns {string} Formatted synthesis input
 */
export function formatSynthesisInput(board, allTasks, results) {
  const sections = [];

  for (const task of allTasks) {
    const output = readFromBoard(board, `${task.id}.output`);
    const result = results.find((r) => r.taskId === task.id);

    if (result?.status === "completed" && output) {
      sections.push(
        `## ${task.title} (${task.id})\nAgent: ${result.agentName}\n\n${summarizeOutput(output, 1500)}`
      );
    } else if (result?.status === "failed") {
      sections.push(
        `## ${task.title} (${task.id})\nStatus: FAILED — ${result.error || "unknown error"}`
      );
    }
  }

  return sections.join("\n\n---\n\n");
}

/**
 * Build the final deliverable structure from synthesis output and metadata.
 *
 * @param {object} board - Blackboard
 * @param {string} synthesisText - Output from synthesis agent
 * @param {object[]} results - All execution results
 * @param {object} budget - BudgetTracker
 * @returns {object} Final deliverable
 */
export function buildDeliverable(board, synthesisText, results, budget) {
  const completedCount = results.filter((r) => r.status === "completed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  // Try to parse structured JSON from synthesis output
  let structured = null;
  try {
    const jsonMatch = synthesisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
  } catch {
    // Fallback: synthesis returned plain text instead of JSON
    structured = null;
  }

  return {
    runId: board.runId,
    useCase: board.useCase,
    // Keep raw text for backward compat; structured sections below
    deliverable: structured?.full_report || structured?.executive_summary || synthesisText,
    // Structured deliverable sections
    blueprint: structured?.blueprint || null,
    prototype: structured?.prototype || null,
    executiveSummary: structured?.executive_summary || null,
    recommendations: structured?.recommendations || null,
    team: board.team,
    taskResults: results.map((r) => ({
      taskId: r.taskId,
      agentId: r.agentId,
      agentName: r.agentName,
      status: r.status,
      error: r.error || null,
    })),
    metrics: {
      completedTasks: completedCount,
      failedTasks: failedCount,
      totalTasks: results.length,
      successRate:
        results.length > 0
          ? Math.round((completedCount / results.length) * 100)
          : 0,
      budget: budget?.toJSON() || null,
      elapsedMs: Date.now() - board.createdAt,
    },
    completedAt: Date.now(),
  };
}
