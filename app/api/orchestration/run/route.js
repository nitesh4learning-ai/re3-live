// POST /api/orchestration/run
// Submit a use case and run the full orchestration pipeline.
// Returns the final deliverable when complete.
// Phase 1: Includes server-side guardrails to enforce light-use-case limits.

import { runOrchestration } from "../../../../lib/orchestration/engine.js";
import { analyzeUseCase } from "../../../../lib/orchestration/intake-analyzer.js";
import { getAuthUser } from "../../../../lib/auth.js";
import { llmRateLimit } from "../../../../lib/rate-limit.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Auth check
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });

    // Rate limit
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Orchestration requires multiple LLM calls — please wait." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, description, type, options = {} } = body;

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, type" },
        { status: 400 }
      );
    }

    // Server-side guardrails — enforce light-use-case limits
    const { guardrails } = analyzeUseCase(title, description);
    if (!guardrails.passed) {
      return NextResponse.json(
        {
          error: "Use case rejected by guardrails: " + guardrails.blocks.join("; "),
          guardrails,
        },
        { status: 422 }
      );
    }

    const useCase = { title, description, type };
    const runOptions = {
      maxAgents: Math.min(options.maxAgents || 5, 6), // Cap at 6 for Phase 1
      tokenBudget: Math.min(options.tokenBudget || 25000, 30000),
      costBudget: options.costBudget || 0.10,
    };

    // Run the orchestration (this is a long-running operation)
    const deliverable = await runOrchestration(useCase, runOptions);

    return NextResponse.json({
      success: true,
      deliverable,
    });
  } catch (err) {
    console.error("Orchestration error:", err);

    // Return partial results if available
    return NextResponse.json(
      {
        error: err.message,
        phase: "orchestration",
      },
      { status: 500 }
    );
  }
}
