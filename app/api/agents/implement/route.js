import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { ImplementAgentSchema, ImplementSynthesisSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { concept, agents, priorContext } = await req.json();

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: "No agents provided" }, { status: 400 });
    }

    // Step 1: Each builder agent contributes their implementation perspective
    const results = await Promise.allSettled(
      agents.map(async (agent) => {
        const response = await callLLM(
          agent.model || "anthropic",
          `You are ${agent.name}. ${agent.persona} You are contributing your implementation expertise to build a concrete plan on the Re\u00b3 platform.`,
          `Concept to implement: "${concept}"
${priorContext ? `Prior context: ${priorContext}\n` : ""}
From your unique expertise, describe how you would contribute to implementing this concept. Focus on your specific domain of knowledge.

Respond in JSON only:
{
  "component": "Name of the component/module you would build (3-6 words)",
  "approach": "Your implementation approach (2-3 sentences)",
  "integrations": ["What this connects to (1-3 items)"],
  "risks": ["Key risks from your perspective (1-2 items)"],
  "timelineWeeks": 1-12
}`,
          { timeout: 30000, maxTokens: 600 }
        );

        const { data: parsed } = parseLLMResponse(response, ImplementAgentSchema);
        if (!parsed) return { agent: agent.name, agentId: agent.id, component: null, status: "parse_error" };
        return {
          agent: agent.name,
          agentId: agent.id,
          color: agent.color,
          avatar: agent.avatar,
          ...parsed,
          status: "success",
        };
      })
    );

    const components = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return {
        agent: agents[i].name,
        agentId: agents[i].id,
        component: null,
        status: "failed",
        error: r.reason?.message || "Unknown error",
      };
    });

    const successfulComponents = components.filter((c) => c.status === "success" && c.component);

    if (successfulComponents.length === 0) {
      return NextResponse.json({ architecture: null, components, sequence: [], risks: [] });
    }

    // Step 2: Hypatia synthesizes into a unified architecture
    const synthResponse = await callLLM(
      "anthropic",
      "You are Hypatia, a systems architect and synthesizer. You combine diverse implementation perspectives into a coherent, unified architecture.",
      `Concept: "${concept}"

${successfulComponents.length} agents have proposed implementation components:

${successfulComponents.map((c, i) => `${i + 1}. [${c.agent}] Component: "${c.component}" - ${c.approach} (Timeline: ${c.timelineWeeks} weeks)`).join("\n")}

Synthesize these into a unified implementation architecture.

Respond in JSON only:
{
  "architecture": "High-level architecture description (2-3 sentences describing how all pieces fit together)",
  "sequence": [
    {
      "phase": "Phase name",
      "components": ["Component names from agents that belong in this phase"],
      "weeks": "1-2",
      "description": "What this phase achieves"
    }
  ],
  "risks": [
    {
      "risk": "Cross-cutting risk description",
      "mitigation": "How to address it",
      "severity": "high OR medium OR low"
    }
  ],
  "totalWeeks": 8
}`,
      { maxTokens: 800 }
    );

    let architecture = null;
    let sequence = [];
    let risks = [];
    let totalWeeks = 0;

    try {
      const { data: synthData } = parseLLMResponse(synthResponse, ImplementSynthesisSchema);
      if (synthData) {
        architecture = synthData.architecture || null;
        sequence = synthData.sequence || [];
        risks = synthData.risks || [];
        totalWeeks = synthData.totalWeeks || 0;
      }
    } catch (e) {
      console.warn("Synthesis parsing failed:", e.message);
    }

    return NextResponse.json({ architecture, components, sequence, risks, totalWeeks });
  } catch (e) {
    console.error("Implementation error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
