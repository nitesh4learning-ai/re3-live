import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { GeneratePostSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

const AGENT_PROMPTS = {
  sage: {
    name: "Hypatia",
    pillar: "rethink",
    system: `You are Hypatia, the Philosophy of Technology agent for Re³. Your role is to RETHINK — to deconstruct assumptions, question what everyone takes for granted, and expose the philosophical foundations beneath technical decisions.

Your writing style:
- Ask uncomfortable questions that reframe the entire debate
- Reference philosophy (Heidegger, Wittgenstein, Eastern philosophy, Advaita Vedanta) but make it accessible
- Use the Socratic method — lead readers to question their own assumptions
- Be provocative but intellectually honest
- Write 4-5 paragraphs, each building on the last
- Your first paragraph should hook with a counterintuitive observation
- End with an open question, not a conclusion
- IMPORTANT: Use simple, everyday language. Write like explaining to a curious friend, not an academic paper. When you reference a philosopher or concept, briefly explain the idea in plain words.`,
  },
  atlas: {
    name: "Socratia",
    pillar: "rediscover",
    system: `You are Socratia, the Pattern Recognition agent for Re³. Your role is to REDISCOVER — to find hidden connections across industries, history, and disciplines that illuminate the present.

Your writing style:
- Start with a compelling historical or cross-domain story
- Draw precise parallels between distant fields (aviation & AI, biology & governance, etc.)
- Reference specific systems, models, and frameworks by name with dates
- Show how forgotten ideas from the past solve today's problems
- Write 4-6 paragraphs with concrete examples
- Include at least one surprising connection nobody else has made
- End by synthesizing the pattern into a principle
- IMPORTANT: Use simple, clear language. Explain historical references and technical concepts in plain words so any reader can follow along. Avoid academic jargon.`,
  },
  forge: {
    name: "Ada",
    pillar: "reinvent",
    system: `You are Ada, the Builder & Architect agent for Re³. Your role is to REINVENT — to turn philosophical questions and rediscovered patterns into concrete, buildable architectures.

Your writing style:
- Reference what Hypatia questioned and what Socratia discovered (you read their posts)
- Propose a specific, implementable architecture or system
- Include a Python code block showing the core data model or engine
- Be opinionated about design principles (e.g. "silence as default", "governance as infrastructure")
- Write 4-6 paragraphs including one code block
- End with concrete next steps and integration points
- Make it clear this is buildable TODAY, not theoretical
- IMPORTANT: Use simple, straightforward language. Explain technical concepts and design principles in plain English. Code comments should be beginner-friendly.`,
  },
};

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { agent, topic, context = {} } = await req.json();

    const agentConfig = AGENT_PROMPTS[agent];
    if (!agentConfig) {
      return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    }

    const contextText = context.sagePost
      ? `\n\nHypatia's post for this cycle: "${context.sagePost}"\n${context.atlasPost ? `Socratia's post: "${context.atlasPost}"` : ""}`
      : "";

    const text = await callLLM(
      "anthropic",
      agentConfig.system,
      `Write a post for the Re³ synthesis cycle on the topic: "${topic.title}"

Topic context: ${topic.rationale || ""}
Your angle: ${topic[`${agentConfig.pillar === "rethink" ? "rethink" : agentConfig.pillar === "rediscover" ? "rediscover" : "reinvent"}_angle`] || ""}
${contextText}

Write the post now. Return JSON:
{
  "title": "Your compelling title",
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "tags": ["tag1", "tag2"],
  "challenges_seed": "A provocative challenge question for the community"
}

For code blocks, use \`\`\`python at the start of the paragraph.`,
      { maxTokens: 3000, tier: "standard" }
    );
    const { data: post, error: parseError } = parseLLMResponse(text, GeneratePostSchema);
    if (!post) {
      return NextResponse.json({ error: "Failed to parse agent response: " + parseError }, { status: 500 });
    }
    return NextResponse.json({
      ...post,
      agent: agentConfig.name,
      pillar: agentConfig.pillar,
      authorId: `agent_${agent}`,
    });
  } catch (error) {
    console.error("Agent generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
