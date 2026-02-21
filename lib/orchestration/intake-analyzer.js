// Intake Analyzer — NLP-based intent classification, complexity scoring, and guardrails.
// Provides pre-submission analysis of use cases to complete Phase 1 intake requirements.
// Heuristic-first with optional LLM fallback for ambiguous cases.

import { gatewayCall } from "../ai-gateway.js";

// Guardrail thresholds (from requirements doc Section 3.1 + Section 10)
const GUARDRAILS = {
  maxComplexity: 0.85,
  maxEstimatedAgents: 6,
  maxEstimatedTokens: 30000,
  maxEstimatedCost: 0.10,
  minDescriptionWords: 15,
};

// Keyword patterns for each use case type
const TYPE_KEYWORDS = {
  "micro-saas-validator": [
    "saas", "micro-saas", "niche", "mvp", "startup", "subscription",
    "pricing", "demand", "validate", "product", "revenue", "market fit",
    "pain point", "customer", "indie", "bootstrap",
  ],
  "ai-workflow-blueprint": [
    "ai workflow", "automation", "automate", "llm", "pipeline",
    "tool selection", "integrate", "ai-powered", "prompt", "chain",
    "api", "deploy", "implementation", "workflow", "agent",
  ],
  "creator-monetization": [
    "creator", "monetize", "monetization", "audience", "content",
    "community", "course", "digital product", "newsletter", "launch",
    "brand", "influencer", "platform", "subscriber", "funnel",
  ],
  "vertical-agent-design": [
    "agent design", "vertical ai", "persona", "specialized agent",
    "industry ai", "domain", "capabilities", "tech stack", "use case",
    "agent", "chatbot", "assistant", "fine-tune", "vertical",
  ],
  "growth-experiment": [
    "growth", "experiment", "channel", "acquisition", "retention",
    "conversion", "metrics", "a/b test", "hypothesis", "funnel",
    "viral", "referral", "activation", "plg", "product-led",
  ],
};

// Words that signal higher complexity
const COMPLEXITY_AMPLIFIERS = [
  "comprehensive", "detailed", "in-depth", "thorough", "exhaustive",
  "multi-faceted", "enterprise", "global", "cross-functional", "holistic",
  "end-to-end", "full-scale", "deep-dive", "extensive",
];

/**
 * Classify use case intent via keyword matching.
 * Returns ranked suggestions with confidence scores.
 */
export function classifyIntent(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    scores[type] = score;
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score]) => ({
      type,
      score,
      confidence: Math.min(score / 3, 1),
    }));

  const top = ranked[0];
  return {
    suggestedType: top.score > 0 ? top.type : null,
    confidence: top.score > 0 ? Math.round(top.confidence * 100) / 100 : 0,
    rankings: ranked.filter((r) => r.score > 0),
    source: "heuristic",
  };
}

/**
 * Score use case complexity before decomposition.
 * Pure heuristic — no LLM call, instant results.
 */
export function scoreUseCaseComplexity(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const words = description.trim().split(/\s+/).filter(Boolean).length;
  let score = 0;

  // Word count factor
  if (words > 200) score += 0.25;
  else if (words > 100) score += 0.15;
  else if (words > 50) score += 0.1;
  else score += 0.05;

  // Complexity amplifier words
  const amplifierCount = COMPLEXITY_AMPLIFIERS.filter((a) =>
    text.includes(a)
  ).length;
  score += Math.min(amplifierCount * 0.1, 0.3);

  // Multiple deliverables implied
  const andCount = (text.match(/\band\b/g) || []).length;
  const commaCount = (text.match(/,/g) || []).length;
  if (andCount + commaCount > 5) score += 0.2;
  else if (andCount + commaCount > 3) score += 0.1;

  // Domain breadth
  const domains = [
    "technical", "business", "legal", "financial", "marketing",
    "engineering", "regulatory", "compliance", "medical", "scientific",
  ];
  const domainCount = domains.filter((d) => text.includes(d)).length;
  if (domainCount >= 3) score += 0.2;
  else if (domainCount >= 2) score += 0.1;

  // Sentence count — more sentences = more complex
  const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  if (sentences > 8) score += 0.1;

  score = Math.min(score, 1);

  // Derive estimates from complexity score
  const estimatedAgents = Math.min(Math.max(Math.round(3 + score * 3), 3), 6);
  const estimatedTokens = Math.round(8000 + score * 22000);
  // Rough blended cost: mix of SLM ($0.0001/1K) and LLM ($0.003/1K)
  const estimatedCost =
    Math.round(estimatedTokens * 0.000003 * 1000) / 1000;

  let rating;
  if (score < 0.3) rating = "low";
  else if (score < 0.6) rating = "medium";
  else if (score < 0.85) rating = "high";
  else rating = "exceeds-limit";

  return {
    score: Math.round(score * 100) / 100,
    rating,
    estimatedAgents,
    estimatedTokens,
    estimatedCost: Math.round(estimatedCost * 10000) / 10000,
    wordCount: words,
  };
}

/**
 * Check guardrails for a use case.
 * Returns pass/fail with specific reasons.
 */
export function checkGuardrails(complexity, description) {
  const warnings = [];
  const blocks = [];
  const words = description.trim().split(/\s+/).filter(Boolean).length;

  if (words < GUARDRAILS.minDescriptionWords) {
    warnings.push(
      `Description is too brief (${words} words). Add more context for better agent results.`
    );
  }

  if (complexity.score >= GUARDRAILS.maxComplexity) {
    blocks.push(
      `Use case complexity (${complexity.score}) exceeds the light-use-case threshold. ` +
      `Try narrowing the scope or splitting into multiple use cases.`
    );
  }

  if (complexity.estimatedTokens > GUARDRAILS.maxEstimatedTokens) {
    warnings.push(
      `Estimated token usage (~${complexity.estimatedTokens.toLocaleString()}) is near the budget limit.`
    );
  }

  if (complexity.estimatedCost > GUARDRAILS.maxEstimatedCost) {
    warnings.push(
      `Estimated cost (~$${complexity.estimatedCost.toFixed(3)}) may exceed the $0.10 budget cap.`
    );
  }

  return {
    passed: blocks.length === 0,
    warnings,
    blocks,
  };
}

/**
 * Full analysis pipeline — combines classification, scoring, and guardrails.
 * This is the main function called by the API endpoint.
 */
export function analyzeUseCase(title, description) {
  const classification = classifyIntent(title, description);
  const complexity = scoreUseCaseComplexity(title, description);
  const guardrails = checkGuardrails(complexity, description);

  return { classification, complexity, guardrails };
}

/**
 * LLM-enhanced classification for ambiguous cases.
 * Only called when heuristic confidence is low (<0.5).
 * Uses cheapest model (Llama via Groq) to keep costs near zero.
 */
export async function classifyWithLLM(title, description, budget) {
  const prompt = `Classify this use case into exactly one category.

Title: "${title}"
Description: "${description}"

Categories:
- micro-saas-validator: Niche analysis, demand validation, MVP features, pricing models for micro-SaaS products
- ai-workflow-blueprint: AI automation design, tool selection, LLM pipeline architecture, implementation plans
- creator-monetization: Audience analysis, content monetization, digital product strategy, launch planning
- vertical-agent-design: Specialized AI agent design, persona definition, capabilities, industry-specific AI solutions
- growth-experiment: Growth channel analysis, experiment design, acquisition/retention strategy, metrics frameworks

Respond in JSON only:
{"type": "category-name", "confidence": 0.0-1.0, "reasoning": "one sentence"}`;

  const { text, usage } = await gatewayCall(
    "llama",
    "You are a use case classifier. Respond only with valid JSON.",
    prompt,
    { maxTokens: 150, timeout: 10000 }
  );

  if (budget) {
    budget.record("system", "classify", usage);
  }

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {
    // LLM classification is optional — return null on failure
  }

  return null;
}
