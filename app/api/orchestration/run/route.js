// POST /api/orchestration/run
// Submit a use case and run the full orchestration pipeline.
// Streams events via SSE for real-time timeline and canvas updates.
// Falls back to JSON response on pre-flight errors (auth, validation, guardrails).

import { runOrchestration } from "../../../../lib/orchestration/engine.js";
import { analyzeUseCase } from "../../../../lib/orchestration/intake-analyzer.js";
import { getAuthUser } from "../../../../lib/auth.js";
import { llmRateLimit } from "../../../../lib/rate-limit.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Pre-flight checks return normal JSON errors (not streamed)
  const { user, error, status } = await getAuthUser(req);
  if (error) return NextResponse.json({ error }, { status });

  const { allowed } = llmRateLimit.check(user.uid);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Orchestration requires multiple LLM calls — please wait." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description, type, options = {} } = body;

  if (!title || !description || !type) {
    return NextResponse.json(
      { error: "Missing required fields: title, description, type" },
      { status: 400 }
    );
  }

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

  // All pre-flight checks passed — start SSE stream
  const useCase = { title, description, type };
  const runOptions = {
    maxAgents: Math.min(options.maxAgents || 5, 6),
    tokenBudget: Math.min(options.tokenBudget || 25000, 30000),
    costBudget: options.costBudget || 0.10,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Stream may be closed
        }
      };

      try {
        const deliverable = await runOrchestration(useCase, {
          ...runOptions,
          onEvent: (event) => send(event),
        });

        // Send final result as a special event type
        send({ type: "result", data: { success: true, deliverable } });
      } catch (err) {
        console.error("Orchestration error:", err);
        send({ type: "error", data: { error: err.message } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
