// Agent-to-Agent (A2A) Cross-Pollination
// After all execution layers complete, each agent can optionally refine its
// output based on ALL peer outputs. This creates richer, more integrated
// results before synthesis.
//
// Budget-aware: only runs if sufficient tokens remain.
// Selective: only refines agents whose tasks have completed successfully.

import { gatewayCall, routeModel } from "../ai-gateway.js";
import { writeToBoard, readFromBoard, logEvent } from "./blackboard.js";

/**
 * Minimum tokens remaining to run a cross-pollination round.
 * Each refinement uses ~1500 tokens, and we need at least 2 to be worthwhile.
 */
const MIN_TOKENS_FOR_A2A = 5000;

/**
 * Maximum characters of peer output to include per agent.
 * Keeps context tight to avoid blowing token budgets.
 */
const PEER_OUTPUT_MAX_CHARS = 800;

/**
 * Run a cross-pollination round where each agent refines its output
 * based on all peer outputs.
 *
 * @param {object[]} results - Completed task results from executeWorkflow
 * @param {Map} taskMap - taskId → task definition
 * @param {Map} assignmentMap - taskId → agent
 * @param {object} board - Blackboard
 * @param {object[]} allTasks - All tasks
 * @param {object[]} team - Full team roster
 * @param {object} budget - BudgetTracker
 * @param {function} onEvent - Event emitter
 * @returns {Promise<object[]>} Updated results with refined outputs
 */
export async function crossPollinate(
  results,
  taskMap,
  assignmentMap,
  board,
  allTasks,
  team,
  budget,
  onEvent
) {
  const completedResults = results.filter((r) => r.status === "completed");

  // Need at least 2 completed tasks for cross-pollination to be meaningful
  if (completedResults.length < 2) {
    if (onEvent) {
      onEvent("a2a.skipped", {
        reason: "Not enough completed tasks for cross-pollination",
        completedCount: completedResults.length,
      }, null);
    }
    return results;
  }

  // Budget check
  if (budget && !budget.canAfford(MIN_TOKENS_FOR_A2A)) {
    if (onEvent) {
      onEvent("a2a.skipped", {
        reason: "Insufficient budget for cross-pollination",
        tokensRemaining: budget.remaining().tokens,
      }, null);
    }
    return results;
  }

  if (onEvent) {
    onEvent("a2a.start", {
      agentCount: completedResults.length,
      taskTitles: completedResults.map((r) => {
        const t = taskMap.get(r.taskId);
        return t?.title || r.taskId;
      }),
    }, null);
  }

  logEvent(board, "system", "a2a_start", {
    agentCount: completedResults.length,
  });

  // Build peer output summaries (each agent sees all others)
  const peerSummaries = {};
  for (const result of completedResults) {
    const task = taskMap.get(result.taskId);
    const output = readFromBoard(board, `${result.taskId}.output`);
    if (output) {
      const truncated = typeof output === "string"
        ? output.slice(0, PEER_OUTPUT_MAX_CHARS)
        : JSON.stringify(output).slice(0, PEER_OUTPUT_MAX_CHARS);
      peerSummaries[result.taskId] = {
        agentName: result.agentName,
        taskTitle: task?.title || result.taskId,
        output: truncated,
      };
    }
  }

  // Refine each completed task in parallel
  const refinementPromises = completedResults.map(async (result) => {
    const task = taskMap.get(result.taskId);
    const agent = assignmentMap.get(result.taskId);
    if (!task || !agent) return result;

    const agentNodeId = `agent_${agent.id}`;

    // Build peer context (exclude self)
    const peerContext = Object.entries(peerSummaries)
      .filter(([tid]) => tid !== result.taskId)
      .map(([, p]) => `## ${p.agentName}: ${p.taskTitle}\n${p.output}`)
      .join("\n\n---\n\n");

    const currentOutput = readFromBoard(board, `${result.taskId}.output`);

    if (onEvent) {
      onEvent("a2a.refine.start", {
        taskId: task.id,
        taskTitle: task.title,
        agentId: agent.id,
        agentName: agent.name,
        peerCount: Object.keys(peerSummaries).length - 1,
      }, agentNodeId);
    }

    try {
      const systemPrompt = `You are ${agent.name}. ${agent.persona || ""}

You previously completed your task: "${task.title}"
Now you can see what your teammate agents produced.

CROSS-POLLINATION INSTRUCTIONS:
1. Read your peers' outputs below
2. Refine YOUR original output to:
   - Incorporate relevant insights from peers
   - Resolve any contradictions with peer findings
   - Add cross-references where your work connects to theirs
   - Strengthen weak areas based on peer expertise
3. Keep the same structure and format
4. Don't rewrite from scratch — enhance what you already have
5. Be concise — keep roughly the same length`;

      const userMessage = `YOUR ORIGINAL OUTPUT:
${typeof currentOutput === "string" ? currentOutput.slice(0, 1500) : ""}

---

PEER AGENT OUTPUTS:
${peerContext}

---

Now refine your output based on your peers' work. Maintain your original structure but integrate relevant insights.`;

      const model = routeModel(task._complexity || 0.5, agent.model);

      const { text, usage } = await gatewayCall(model, systemPrompt, userMessage, {
        maxTokens: 2000,
        timeout: 45000,
      });

      // Overwrite the blackboard entry with refined output
      writeToBoard(board, `${task.id}.output`, text, agent.id);
      logEvent(board, agent.id, "a2a_refined", { taskId: task.id });

      if (budget) {
        budget.record(agent.id, `${task.id}_a2a`, usage);
      }

      if (onEvent) {
        onEvent("a2a.refine.complete", {
          taskId: task.id,
          taskTitle: task.title,
          agentId: agent.id,
          agentName: agent.name,
          model: usage.model,
          tokens: usage.estimatedInputTokens + usage.estimatedOutputTokens,
          cost: usage.estimatedCost,
        }, agentNodeId);
      }

      return {
        ...result,
        output: text,
        a2aRefined: true,
      };
    } catch (err) {
      // Refinement failure is non-fatal — keep original output
      logEvent(board, agent.id, "a2a_failed", {
        taskId: task.id,
        error: err.message,
      });

      if (onEvent) {
        onEvent("a2a.refine.failed", {
          taskId: task.id,
          taskTitle: task.title,
          agentId: agent.id,
          agentName: agent.name,
          error: err.message,
        }, agentNodeId);
      }

      return result;
    }
  });

  const refinedResults = await Promise.allSettled(refinementPromises);
  const updatedResults = refinedResults.map((r, i) =>
    r.status === "fulfilled" ? r.value : completedResults[i]
  );

  // Merge refined results back into the full results array
  const resultMap = new Map(updatedResults.map((r) => [r.taskId, r]));
  const finalResults = results.map((r) => resultMap.get(r.taskId) || r);

  const refinedCount = updatedResults.filter((r) => r.a2aRefined).length;

  if (onEvent) {
    onEvent("a2a.complete", {
      refinedCount,
      totalAgents: completedResults.length,
    }, null);
  }

  logEvent(board, "system", "a2a_complete", { refinedCount });

  return finalResults;
}
