// POST /api/orchestration/analyze
// Pre-submission analysis: intent classification, complexity scoring, guardrails.
// Returns analysis results without running the orchestration.
// Uses heuristics first, optional LLM fallback for ambiguous classification.

import { createHandler } from "../../../../lib/api-handler";
import { OrchestrationAnalyzeInputSchema } from "../../../../lib/schemas";
import { analyzeUseCase, classifyWithLLM } from "../../../../lib/orchestration/intake-analyzer.js";
import { sanitizeShort, sanitizeForLLM } from "../../../../lib/sanitize.js";
import { NextResponse } from "next/server";

export const POST = createHandler(OrchestrationAnalyzeInputSchema, async (body) => {
  const title = body.title ? sanitizeShort(body.title) : "";
  const description = body.description ? sanitizeForLLM(body.description, 10000) : "";

  if (!title && !description) {
    return NextResponse.json(
      { error: "Provide at least a title or description to analyze." },
      { status: 400 }
    );
  }

  // Run heuristic analysis (instant, no LLM cost)
  const analysis = analyzeUseCase(title, description);

  // If heuristic classification is low confidence and description is substantial,
  // use cheapest LLM for deeper intent analysis
  if (
    analysis.classification.confidence < 0.5 &&
    description &&
    description.trim().length > 30
  ) {
    try {
      const llmResult = await classifyWithLLM(title || "", description);
      if (llmResult && llmResult.confidence > analysis.classification.confidence) {
        analysis.classification.suggestedType = llmResult.type;
        analysis.classification.confidence = llmResult.confidence;
        analysis.classification.source = "llm";
        analysis.classification.reasoning = llmResult.reasoning;
      }
    } catch {
      // LLM classification is optional — heuristic result stands
    }
  }

  return NextResponse.json(analysis);
}, { rateLimit: false });
