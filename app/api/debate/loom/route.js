import { createHandler } from "../../../../lib/api-handler";
import { LoomInputSchema, LoomStreamsSchema } from "../../../../lib/schemas";
import { callLLM, streamAnthropicLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { sanitizeForLLM, sanitizeShort } from "../../../../lib/sanitize";
import { NextResponse } from "next/server";

export const POST = createHandler(LoomInputSchema, async (body, user, req) => {
  const { rounds, atlasNote, forgeRationale, panelNames, sagePersona, pillarNames } = body;
  const articleTitle = sanitizeShort(body.articleTitle);
  const articleText = sanitizeForLLM(body.articleText);
  const wantsStream = req.headers.get("accept")?.includes("text/event-stream");

  let transcript = "";
  rounds.forEach((round, i) => {
    transcript += `\n--- Round ${i + 1} ---\n`;
    round.forEach((r) => {
      if (r.response) transcript += `${r.name}: ${r.response}\n\n`;
    });
  });

  const isCycleDebate = articleText.length > 3000 || articleText.includes("---\n\n");
  const contentSlice = isCycleDebate ? articleText.slice(0, 4000) : articleText.slice(0, 1500);
  const pillarLabel = pillarNames?.length ? pillarNames.join(", ") : "Rethink, Rediscover, Reinvent";
  const contentLabel = isCycleDebate ? `Re3 Cycle (connected articles — ${pillarLabel})` : "Article";

  const loomSystem = sagePersona || "You are Hypatia, the synthesizer for Re³. You read entire debates and weave them into a reflective conclusion called The Loom. You find unity beneath contradictions, honor perspectives that disagreed, identify emergent insights no individual stated, and end with an open question. Write in simple, clear language that anyone can follow. Avoid fancy words and academic jargon — use plain English. If you must use a technical term, explain it in simple words.";
  const loomUser = `${contentLabel}: "${articleTitle}"
${contentSlice}

Ada selected this panel: ${panelNames.join(", ")}
Ada's rationale: ${forgeRationale}

Full debate transcript:
${transcript.slice(0, 5000)}

Socratia's moderation note: ${atlasNote || "None"}

Now weave The Loom. This is not a summary — it is a synthesis. ${isCycleDebate ? `This debate covered an entire Re³ cycle across these lenses: ${pillarLabel}. Your synthesis should address how the debate enriched or challenged the full intellectual arc across all perspectives.` : "Find the deeper threads, the tensions that reveal something neither side saw alone, and the emergent insight."} Write 3-4 paragraphs. End with one open question for the community.`;

  const clusterSystem = "You organize debate transcripts into thematic argument streams. Be precise.";
  const clusterUser = `Here is a debate with ${panelNames.length} agents across 3 rounds:
${transcript.slice(0, 4000)}

Group the responses into 2-4 thematic streams. Each stream is a thread of related arguments.

Respond in JSON only:
{
  "streams": [
    {
      "title": "Stream title capturing the core tension",
      "entries": [
        { "agent": "agent name", "round": 1, "excerpt": "key 1-2 sentence excerpt from their response" },
        { "agent": "another agent", "round": 2, "excerpt": "their relevant response to the above" }
      ]
    }
  ]
}

Keep excerpts under 2 sentences each. Every response should appear in exactly one stream.`;

  // ==================== SSE STREAMING MODE ====================
  if (wantsStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload) => {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)); } catch {}
        };

        try {
          // Step 1: Stream The Loom synthesis token-by-token
          send({ type: "loom_start" });
          const loomText = await streamAnthropicLLM(loomSystem, loomUser, {
            maxTokens: 1500, timeout: 45000, tier: "standard",
            onChunk: (delta) => send({ type: "loom_delta", delta }),
          });
          send({ type: "loom_done", loom: loomText });

          // Step 2: Cluster streams (non-streamed, fast light-tier JSON)
          send({ type: "streams_start" });
          let streams = [];
          try {
            const clusterResponse = await callLLM("anthropic", clusterSystem, clusterUser, { maxTokens: 2000, timeout: 30000, tier: "light" });
            const { data: clusterData } = parseLLMResponse(clusterResponse, LoomStreamsSchema);
            if (clusterData) streams = clusterData.streams || [];
          } catch {}

          send({ type: "done", data: { loom: loomText, streams } });
        } catch (e) {
          send({ type: "error", error: e.message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive" },
    });
  }

  // ==================== JSON MODE (backward-compatible) ====================
  const loomText = await callLLM("anthropic", loomSystem, loomUser, { maxTokens: 1500, timeout: 45000, tier: "standard" });

  const clusterResponse = await callLLM("anthropic", clusterSystem, clusterUser, { maxTokens: 2000, timeout: 30000, tier: "light" });
  let streams = [];
  try {
    const { data: clusterData } = parseLLMResponse(clusterResponse, LoomStreamsSchema);
    if (clusterData) streams = clusterData.streams || [];
  } catch {
    streams = [];
  }

  return NextResponse.json({ loom: loomText, streams });
});
