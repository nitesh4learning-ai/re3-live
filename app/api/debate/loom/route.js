import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { articleTitle, articleText, rounds, atlasNote, forgeRationale, panelNames, sagePersona } = await req.json();

    let transcript = "";
    rounds.forEach((round, i) => {
      transcript += `\n--- Round ${i + 1} ---\n`;
      round.forEach((r) => {
        if (r.response) transcript += `${r.name}: ${r.response}\n\n`;
      });
    });

    // Step 1: Sage weaves The Loom
    const loomText = await callLLM(
      "anthropic",
      sagePersona || "You are Sage, the synthesizer for Re³. You read entire debates and weave them into a reflective conclusion called The Loom. You find unity beneath contradictions, honor perspectives that disagreed, identify emergent insights no individual stated, and end with an open question.",
      `Article: "${articleTitle}"
${articleText.slice(0, 1500)}

Forge selected this panel: ${panelNames.join(", ")}
Forge's rationale: ${forgeRationale}

Full debate transcript:
${transcript.slice(0, 5000)}

Atlas's moderation note: ${atlasNote || "None"}

Now weave The Loom. This is not a summary — it is a synthesis. Find the deeper threads, the tensions that reveal something neither side saw alone, and the emergent insight. Write 3-4 paragraphs. End with one open question for the community.`,
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
      const match = clusterResponse.match(/\{[\s\S]*\}/);
      if (match) streams = JSON.parse(match[0]).streams || [];
    } catch {
      // Fallback: no clustering, show chronologically
      streams = [];
    }

    return NextResponse.json({ loom: loomText, streams });
  } catch (e) {
    console.error("Loom error:", e);
    return NextResponse.json({ loom: "Sage is still reflecting on this debate...", streams: [], error: e.message });
  }
}
