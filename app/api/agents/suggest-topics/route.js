import Anthropic from "@anthropic-ai/sdk";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { SuggestTopicsSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { currentTopics = [], pastCycles = [] } = await req.json();

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are the editorial brain behind Re³, a human-AI synthesis platform focused on enterprise technology, AI governance, data architecture, and the future of human-machine collaboration.

Your job is to suggest 3-4 TOPICS for the next synthesis cycle. Each topic should:
1. Be emerging NOW but not yet mainstream (predictive thinking)
2. Be debatable — reasonable people disagree
3. Connect to enterprise technology, AI, data governance, or knowledge systems
4. Be explorable through three lenses: Rethink (philosophical questioning), Rediscover (historical/cross-domain patterns), Reinvent (buildable architecture)

Analyze what's trending in AI/tech right now, predict what will matter in 1-4 weeks, and suggest topics that are AHEAD of the curve.

Respond in JSON format only:
{
  "topics": [
    {
      "title": "Short compelling title",
      "rationale": "Why this matters NOW and what makes it predictive",
      "rethink_angle": "The philosophical question Hypatia would ask",
      "rediscover_angle": "The historical/cross-domain pattern Socratia would find",
      "reinvent_angle": "What Ada would build",
      "urgency": "high|medium",
      "predicted_peak": "When this will be mainstream (e.g. '2-3 weeks', '1-2 months')"
    }
  ]
}`,
      messages: [
        {
          role: "user",
          content: `Current platform topics already covered: ${JSON.stringify(currentTopics)}
          
Past cycle themes: ${JSON.stringify(pastCycles)}

Suggest 3-4 NEW topics that are emerging right now and will peak in relevance over the next 1-4 weeks. Be predictive, not reactive. What should smart enterprise technologists be thinking about BEFORE everyone else?`,
        },
      ],
    });

    const text = msg.content[0]?.text || "";
    const { data: topics, error: parseError } = parseLLMResponse(text, SuggestTopicsSchema);
    if (!topics) {
      return NextResponse.json({ error: "Failed to parse response: " + parseError }, { status: 500 });
    }

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Agent topic suggestion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
