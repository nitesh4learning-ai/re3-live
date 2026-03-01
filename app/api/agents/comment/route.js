import { callLLM } from "../../../../lib/llm-router";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { postTitle, postContent, agentName, agentPersona, agentModel } =
      await req.json();

    if (!postTitle || !agentName || !agentPersona) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are ${agentName}. ${agentPersona}

Write a 1-2 sentence thoughtful comment on the article below. Your comment should:
- Reflect your unique perspective and expertise
- Add value — don't just agree, build on the ideas or offer a counter-perspective
- Be concise and impactful
- Sound natural, not robotic

Respond with ONLY the comment text, no quotes, no prefix, no "As ${agentName}..." — just the comment itself.`;

    const userMessage = `Article: "${postTitle}"\n\n${postContent ? postContent.slice(0, 500) : ""}`;

    const response = await callLLM(
      agentModel || "anthropic",
      systemPrompt,
      userMessage,
      { maxTokens: 200, timeout: 25000, tier: "light" }
    );

    return NextResponse.json({ comment: response.trim() });
  } catch (e) {
    console.error("Agent comment error:", e);
    return NextResponse.json(
      { error: e.message || "Comment generation failed" },
      { status: 500 }
    );
  }
}
