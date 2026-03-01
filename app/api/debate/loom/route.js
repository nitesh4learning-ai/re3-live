import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { LoomStreamsSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { articleTitle, articleText, rounds, atlasNote, forgeRationale, panelNames, sagePersona, pillarNames } = await req.json();

    let transcript = "";
    rounds.forEach((round, i) => {
      transcript += `\n--- Round ${i + 1} ---\n`;
      round.forEach((r) => {
        if (r.response) transcript += `${r.name}: ${r.response}\n\n`;
      });
    });

    // Detect cycle debate
    const isCycleDebate = articleText.length > 3000 || articleText.includes("---\n\n");
    const contentSlice = isCycleDebate ? articleText.slice(0, 4000) : articleText.slice(0, 1500);
    const pillarLabel = pillarNames?.length ? pillarNames.join(", ") : "Rethink, Rediscover, Reinvent";
    const contentLabel = isCycleDebate ? `Re3 Cycle (connected articles — ${pillarLabel})` : "Article";

    // Step 1: Hypatia weaves The Loom
    const loomText = await callLLM(
      "anthropic",
      sagePersona || "You are Hypatia, the synthesizer for Re³. You read entire debates and weave them into a reflective conclusion called The Loom. You find unity beneath contradictions, honor perspectives that disagreed, identify emergent insights no individual stated, and end with an open question. Write in simple, clear language that anyone can follow. Avoid fancy words and academic jargon — use plain English. If you must use a technical term, explain it in simple words.",
      `${contentLabel}: "${articleTitle}"
${contentSlice}

Ada selected this panel: ${panelNames.join(", ")}
Ada's rationale: ${forgeRationale}

Full debate transcript:
${transcript.slice(0, 5000)}

Socratia's moderation note: ${atlasNote || "None"}

Now weave The Loom. This is not a summary — it is a synthesis. ${isCycleDebate ? `This debate covered an entire Re³ cycle across these lenses: ${pillarLabel}. Your synthesis should address how the debate enriched or challenged the full intellectual arc across all perspectives.` : "Find the deeper threads, the tensions that reveal something neither side saw alone, and the emergent insight."} Write 3-4 paragraphs. End with one open question for the community.`,
      { maxTokens: 1500, timeout: 45000 }
    );

    // Step 2: Cluster into themed streams
    const clusterResponse = await callLLM(
      "anthropic",
      "You organize debate transcripts into thematic argument streams. Be precise.",
      `Here is a debate with ${panelNames.length} agents across 3 rounds:
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

Keep excerpts under 2 sentences each. Every response should appear in exactly one stream.`,
      { maxTokens: 2000, timeout: 30000 }
    );

    let streams = [];
    try {
      const { data: clusterData } = parseLLMResponse(clusterResponse, LoomStreamsSchema);
      if (clusterData) streams = clusterData.streams || [];
    } catch {
      // Fallback: no clustering, show chronologically
      streams = [];
    }

    return NextResponse.json({ loom: loomText, streams });
  } catch (e) {
    console.error("Loom error:", e);
    return NextResponse.json({ loom: "Hypatia is still reflecting on this debate...", streams: [], error: e.message });
  }
}
