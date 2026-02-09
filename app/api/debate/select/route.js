import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { articleTitle, articleText, agents, forgePersona } = await req.json();
    const activeAgents = agents.filter((a) => a.status === "active");
    const agentList = activeAgents
      .map((a) => `- ${a.name} (${a.category}): ${a.persona.slice(0, 100)}`)
      .join("\n");

    const response = await callLLM(
      "anthropic",
      forgePersona || "You are Forge, a panel curator. You read articles and select the 5 most relevant debater agents that will create productive friction and diverse perspectives.",
      `Article title: "${articleTitle}"
Article content: ${articleText.slice(0, 3000)}

Available agents (${activeAgents.length} total):
${agentList}

Select exactly 5 agents for this debate. Pick agents whose expertise creates the most productive tension and coverage for THIS specific topic.

Respond in JSON only:
{
  "selected": ["agent_id_1", "agent_id_2", "agent_id_3", "agent_id_4", "agent_id_5"],
  "rationale": "One paragraph explaining why these 5 were chosen for this topic"
}`,
      { maxTokens: 500 }
    );

    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Failed to parse Forge response" }, { status: 500 });
    const parsed = JSON.parse(match[0]);

    // Validate selected agents exist
    const validIds = activeAgents.map((a) => a.id);
    const selected = parsed.selected.filter((id) => validIds.includes(id)).slice(0, 5);

    return NextResponse.json({ selected, rationale: parsed.rationale || "" });
  } catch (e) {
    console.error("Forge select error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
