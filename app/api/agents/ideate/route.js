import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { IdeateAgentSchema, IdeateClusterSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { topic, agents, context } = await req.json();

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: "No agents provided" }, { status: 400 });
    }

    // Step 1: Each agent generates 2-3 ideas in parallel
    const results = await Promise.allSettled(
      agents.map(async (agent) => {
        const response = await callLLM(
          agent.model || "anthropic",
          `You are ${agent.name}. ${agent.persona} You are participating in a creative ideation session on the Re\u00b3 platform. Generate fresh, creative ideas from your unique perspective.`,
          `Topic: "${topic}"
${context ? `Context: ${context}\n` : ""}
Generate 2-3 creative ideas related to this topic. Each idea should reflect your unique expertise and perspective.

Respond in JSON only:
{
  "ideas": [
    {
      "concept": "Short title for the idea (5-10 words)",
      "rationale": "Why this idea matters and how it connects to the topic (2-3 sentences)",
      "pillar": "rethink OR rediscover OR reinvent",
      "novelty": 1-5
    }
  ]
}`,
          { timeout: 30000, maxTokens: 800, tier: "light" }
        );

        const { data: parsed } = parseLLMResponse(response, IdeateAgentSchema);
        if (!parsed) return { agent: agent.name, agentId: agent.id, ideas: [], status: "parse_error" };
        return {
          agent: agent.name,
          agentId: agent.id,
          color: agent.color,
          avatar: agent.avatar,
          ideas: (parsed.ideas || []).map((idea) => ({
            ...idea,
            agent: agent.name,
            agentId: agent.id,
            color: agent.color,
            avatar: agent.avatar,
          })),
          status: "success",
        };
      })
    );

    const agentResults = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return {
        agent: agents[i].name,
        agentId: agents[i].id,
        ideas: [],
        status: "failed",
        error: r.reason?.message || "Unknown error",
      };
    });

    // Collect all ideas
    const allIdeas = agentResults.flatMap((r) => r.ideas || []);

    if (allIdeas.length === 0) {
      return NextResponse.json({ ideas: [], clusters: [], agentResults });
    }

    // Step 2: Hypatia clusters the ideas into themes
    const clusterResponse = await callLLM(
      "anthropic",
      "You are Hypatia, a wise synthesizer. You find patterns and group ideas into coherent thematic clusters.",
      `Here are ${allIdeas.length} ideas from multiple agents on the topic "${topic}":

${allIdeas.map((idea, i) => `${i + 1}. [${idea.agent}] "${idea.concept}" - ${idea.rationale} (pillar: ${idea.pillar})`).join("\n")}

Group these ideas into 2-4 thematic clusters. Each cluster should have a clear theme connecting its ideas.

Respond in JSON only:
{
  "clusters": [
    {
      "theme": "Cluster theme name",
      "description": "What connects these ideas (1 sentence)",
      "ideaIndices": [1, 3, 5],
      "pillar": "rethink OR rediscover OR reinvent"
    }
  ]
}`,
      { maxTokens: 600, tier: "light" }
    );

    let clusters = [];
    try {
      const { data: clusterData } = parseLLMResponse(clusterResponse, IdeateClusterSchema);
      if (clusterData) {
        clusters = (clusterData.clusters || []).map((c) => ({
          ...c,
          ideas: (c.ideaIndices || [])
            .filter((idx) => idx >= 1 && idx <= allIdeas.length)
            .map((idx) => allIdeas[idx - 1]),
        }));
      }
    } catch (e) {
      console.warn("Cluster parsing failed:", e.message);
    }

    return NextResponse.json({ ideas: allIdeas, clusters, agentResults });
  } catch (e) {
    console.error("Ideation error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
