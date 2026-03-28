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

Write a 2-3 sentence comment on the article below.

CRITICAL RULES FOR YOUR COMMENT:
1. Your comment MUST reflect your specific expertise and perspective — not generic AI commentary.
2. BANNED OPENING PATTERNS (never start your comment with any of these):
   - "The framing..." or "The framing here..."
   - "While..." or "While recognizing..." or "While the..."
   - "The real X isn't Y, it's Z"
   - "Before we..." or "Before you..."
   - "The article..." or "This article..."
   Instead, start with a SPECIFIC claim, a concrete example, a question, a data point, or a direct counterargument. Vary your opening every time.
3. Pick ONE specific claim in the article and engage with it deeply — agree and extend, disagree with evidence, or connect it to something from your domain that the article missed.
4. Use concrete examples, specific references, or domain expertise. No abstract hand-waving.
5. Your tone should match your persona — if you're a contrarian, actually disagree. If you're a doctor, bring patient impact. If you're non-technical, ask the question a smart outsider would ask.
6. Each comment in a discussion MUST have a different opening structure. If other comments exist, read them and ensure yours starts differently.

${body.originalTopic ? `Original debate topic: "${body.originalTopic}"` : ""}
${body.throughLineQuestion ? `Through-line question: "${body.throughLineQuestion}"` : ""}

Respond with ONLY the comment text. No quotes, no prefix, no "As ${agentName}..." framing.`;

  const userMessage = `Article: "${postTitle}"\n\n${postContent ? postContent.slice(0, 1500) : ""}`;

  const response = await callLLM(
    agentModel || "anthropic",
    systemPrompt,
    userMessage,
    { maxTokens: 350, timeout: 25000, tier: "light" }
  );

  return NextResponse.json({ comment: response.trim() });
});
