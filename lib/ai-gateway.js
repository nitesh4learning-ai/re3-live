// AI Gateway — Enhanced LLM router with cost tracking, token budgeting, and model routing.
// Wraps the existing llm-router.js and adds orchestration-aware features.

import { callLLM } from "./llm-router.js";

/**
 * Estimated cost per 1K tokens by provider (input/output).
 * Approximate — used for budgeting, not billing.
 */
const COST_PER_1K = {
  anthropic: { input: 0.003, output: 0.015 },
  openai:    { input: 0.00015, output: 0.0006 },
  gemini:    { input: 0.0001, output: 0.0004 },
  llama:     { input: 0.00006, output: 0.00006 },
};

/**
 * Rough token estimation: ~4 chars per token for English text.
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Determine the optimal model for a task based on complexity.
 * SLM-first: simple tasks route to cheaper models.
 *
 * @param {number} complexity - 0 to 1 scale
 * @param {string} preferredModel - Agent's preferred model
 * @returns {string} Model to use
 */
export function routeModel(complexity, preferredModel = "anthropic") {
  // Low complexity → always use cheapest
  if (complexity < 0.3) return "llama";
  // Medium → use gemini (fast + cheap)
  if (complexity < 0.6) return "gemini";
  // High → use agent's preferred model
  return preferredModel;
}

/**
 * Score task complexity based on heuristics.
 * @param {object} task - { description, requiredCapabilities, outputFormat }
 * @returns {number} 0 to 1
 */
export function scoreComplexity(task) {
  let score = 0;

  // Word count of description
  const words = (task.description || "").split(/\s+/).length;
  if (words > 100) score += 0.3;
  else if (words > 50) score += 0.2;
  else score += 0.1;

  // Number of required capabilities
  const caps = (task.requiredCapabilities || []).length;
  if (caps >= 3) score += 0.3;
  else if (caps >= 2) score += 0.2;
  else score += 0.1;

  // Complex output formats need better models
  const format = (task.outputFormat || "").toLowerCase();
  if (format.includes("matrix") || format.includes("framework")) score += 0.2;
  else if (format.includes("analysis") || format.includes("structured")) score += 0.15;
  else score += 0.05;

  // Synthesis tasks are inherently complex
  if ((task.requiredCapabilities || []).includes("synthesize")) score += 0.1;

  return Math.min(score, 1);
}

/**
 * Enhanced LLM call with cost tracking and token budgets.
 *
 * @param {string} model - Provider name
 * @param {string} systemPrompt - System prompt
 * @param {string} userMessage - User message
 * @param {object} opts - { maxTokens, timeout, tokenBudget? }
 * @returns {Promise<{ text: string, usage: object }>}
 */
export async function gatewayCall(model, systemPrompt, userMessage, opts = {}) {
  const maxTokens = opts.maxTokens || 1500;
  const timeout = opts.timeout || 30000;

  // Estimate input tokens for budget check
  const inputTokens = estimateTokens(systemPrompt + userMessage);

  // Budget enforcement
  if (opts.tokenBudget) {
    const estimatedTotal = inputTokens + maxTokens;
    if (estimatedTotal > opts.tokenBudget) {
      throw new Error(
        `Token budget exceeded: estimated ${estimatedTotal} > budget ${opts.tokenBudget}`
      );
    }
  }

  const startMs = Date.now();
  const text = await callLLM(model, systemPrompt, userMessage, { maxTokens, timeout });
  const durationMs = Date.now() - startMs;

  // Estimate output tokens from response
  const outputTokens = estimateTokens(text);
  const rates = COST_PER_1K[model] || COST_PER_1K.anthropic;
  const estimatedCost =
    (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;

  return {
    text,
    usage: {
      model,
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
      estimatedCost: Math.round(estimatedCost * 1000000) / 1000000, // 6 decimal places
      durationMs,
    },
  };
}

/**
 * Budget tracker for an orchestration run.
 * Tracks cumulative token usage and cost across all agent calls.
 */
export class BudgetTracker {
  constructor(totalTokenBudget = 20000, totalCostBudget = 0.10) {
    this.totalTokenBudget = totalTokenBudget;
    this.totalCostBudget = totalCostBudget;
    this.tokensUsed = 0;
    this.costAccumulated = 0;
    this.calls = [];
  }

  /** Record a completed call. */
  record(agentId, taskId, usage) {
    const totalTokens = usage.estimatedInputTokens + usage.estimatedOutputTokens;
    this.tokensUsed += totalTokens;
    this.costAccumulated += usage.estimatedCost;
    this.calls.push({
      agentId,
      taskId,
      model: usage.model,
      tokens: totalTokens,
      cost: usage.estimatedCost,
      durationMs: usage.durationMs,
      timestamp: Date.now(),
    });
  }

  /** Check if budget allows another call. */
  canAfford(estimatedTokens) {
    return this.tokensUsed + estimatedTokens <= this.totalTokenBudget;
  }

  /** Get remaining budget. */
  remaining() {
    return {
      tokens: this.totalTokenBudget - this.tokensUsed,
      cost: this.totalCostBudget - this.costAccumulated,
      percentUsed: Math.round((this.tokensUsed / this.totalTokenBudget) * 100),
    };
  }

  /** Get summary for display. */
  toJSON() {
    return {
      totalTokenBudget: this.totalTokenBudget,
      tokensUsed: this.tokensUsed,
      costAccumulated: Math.round(this.costAccumulated * 1000000) / 1000000,
      percentUsed: Math.round((this.tokensUsed / this.totalTokenBudget) * 100),
      callCount: this.calls.length,
      calls: this.calls,
      modelBreakdown: this._modelBreakdown(),
    };
  }

  _modelBreakdown() {
    const breakdown = {};
    for (const call of this.calls) {
      if (!breakdown[call.model]) {
        breakdown[call.model] = { calls: 0, tokens: 0, cost: 0 };
      }
      breakdown[call.model].calls++;
      breakdown[call.model].tokens += call.tokens;
      breakdown[call.model].cost += call.cost;
    }
    return breakdown;
  }
}
