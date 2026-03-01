import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { ModerationSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { articleTitle, rounds, atlasPersona } = await req.json();

    let transcript = "";
    rounds.forEach((round, i) => {
      transcript += `\n--- Round ${i + 1} ---\n`;
      round.forEach((r) => {
        if (r.response) transcript += `${r.name}: ${r.response}\n\n`;
      });
    });

    const response = await callLLM(
      "anthropic",
      atlasPersona || "You are Socratia, the debate moderator for Re³. Your job is to ensure the discussion stays focused on the core question raised by the article. You intervene only when necessary.",
      `Article topic: "${articleTitle}"

Full debate transcript:
${transcript.slice(0, 4000)}

Review this debate. Did the discussion stay on topic and productive?
- If the discussion drifted significantly, write a brief intervention (2-3 sentences) redirecting focus back to the core question.
- If it stayed focused, acknowledge that briefly.
- Note any important perspectives that were missing from the debate.

Respond in JSON:
{
  "on_topic": true/false,
  "intervention": "Your intervention text or acknowledgment",
  "missing_perspectives": "Any important angles not covered"
}`,
      { maxTokens: 500, tier: "light" }
    );

    const { data: parsed } = parseLLMResponse(response, ModerationSchema);
    if (!parsed) return NextResponse.json({ intervention: "Discussion reviewed.", on_topic: true, missing_perspectives: "" });
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Socratia moderation error:", e);
    return NextResponse.json({ intervention: "Moderation unavailable.", on_topic: true, missing_perspectives: "" });
  }
}
