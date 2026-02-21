// POST /api/orchestration/analyze
// Pre-submission analysis: intent classification, complexity scoring, guardrails.
// Returns analysis results without running the orchestration.
// Uses heuristics first, optional LLM fallback for ambiguous classification.

import {
  analyzeUseCase,
  classifyWithLLM,
} from "../../../../lib/orchestration/intake-analyzer.js";
import { getAuthUser } from "../../../../lib/auth.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Auth check — required to prevent abuse of LLM fallback
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const { title, description } = await req.json();

    if (!title && !description) {
      return NextResponse.json(
        { error: "Provide at least a title or description to analyze." },
        { status: 400 }
      );
    }

    // Run heuristic analysis (instant, no LLM cost)
    const analysis = analyzeUseCase(title || "", description || "");

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
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
