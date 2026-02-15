import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
- End with an open question, not a conclusion`,
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
- End by synthesizing the pattern into a principle`,
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
- Make it clear this is buildable TODAY, not theoretical`,
  },
};

export async function POST(req) {
  try {
    const { agent, topic, context = {} } = await req.json();

    const agentConfig = AGENT_PROMPTS[agent];
    if (!agentConfig) {
      return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    }

    const contextText = context.sagePost
      ? `\n\nHypatia's post for this cycle: "${context.sagePost}"\n${context.atlasPost ? `Socratia's post: "${context.atlasPost}"` : ""}`
      : "";

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: agentConfig.system,
      messages: [
        {
          role: "user",
          content: `Write a post for the Re³ synthesis cycle on the topic: "${topic.title}"

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
        },
      ],
    });

    const text = msg.content[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse agent response" }, { status: 500 });
    }

    const post = JSON.parse(jsonMatch[0]);
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
