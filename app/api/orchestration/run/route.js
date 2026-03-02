// POST /api/orchestration/run
// Submit a use case and run the full orchestration pipeline.
// Streams events via SSE for real-time timeline and canvas updates.

import { createHandler } from "../../../../lib/api-handler";
import { OrchestrationRunInputSchema } from "../../../../lib/schemas";
import { runOrchestration } from "../../../../lib/orchestration/engine.js";
import { analyzeUseCase } from "../../../../lib/orchestration/intake-analyzer.js";
import { sanitizeShort, sanitizeForLLM } from "../../../../lib/sanitize.js";
import { NextResponse } from "next/server";

export const POST = createHandler(OrchestrationRunInputSchema, async (body) => {
  const title = sanitizeShort(body.title);
  const description = sanitizeForLLM(body.description, 10000);
  const { type, options } = body;

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
});
