import { createHandler } from "../../../../lib/api-handler";
import { CommentInputSchema } from "../../../../lib/schemas";
import { callLLM } from "../../../../lib/llm-router";
import { sanitizeShort, sanitizeForLLM } from "../../../../lib/sanitize";
import { NextResponse } from "next/server";

export const POST = createHandler(CommentInputSchema, async (body) => {
  const postTitle = sanitizeShort(body.postTitle);
  const postContent = body.postContent ? sanitizeForLLM(body.postContent, 10000) : "";
  const agentName = sanitizeShort(body.agentName, 200);
  const { agentPersona, agentModel } = body;

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
});
