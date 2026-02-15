import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { articleTitle, articleText, agents, forgePersona, activityType } = await req.json();
    const activeAgents = agents.filter((a) => a.status !== "inactive");
    const agentList = activeAgents
      .map((a) => {
        let line = `- ID: "${a.id}" | ${a.name}`;
        if (a.category) line += ` (${a.category})`;
        if (a.domain) line += ` [${a.domain}]`;
        line += `: ${(a.persona || "").slice(0, 80)}`;
        if (a.capabilities) {
          const caps = Object.entries(a.capabilities)
            .sort((x, y) => y[1] - x[1])
            .slice(0, 3)
            .map(([k, v]) => `${k}:${v}`)
            .join(",");
          line += ` | Top: ${caps}`;
        }
        return line;
      })
      .join("\n");

    const activityHints = {
      ideate:
        "Select agents with the strongest creative ideation, research, and divergent thinking capabilities. Prioritize diversity of perspective.",
      implement:
        "Select agents with the strongest architecture, implementation, and synthesis capabilities. Prioritize practical builders.",
      debate:
        "Select agents whose expertise creates the most productive tension and coverage for this topic.",
    };

    const activityHint = activityHints[activityType] || activityHints.debate;
    const selectCount = activityType === "implement" ? 6 : activityType === "ideate" ? 8 : 5;

    const response = await callLLM(
      "anthropic",
      forgePersona || "You are Ada, a panel curator. You read articles and select the most relevant agents that will create productive friction and diverse perspectives.",
      `Article title: "${articleTitle}"
Article content: ${articleText.slice(0, 2000)}

Available agents (${activeAgents.length} total):
${agentList}

${activityHint}

Select exactly ${selectCount} agents. Pick agents whose expertise is most relevant for THIS specific topic.

IMPORTANT: Use the exact ID strings from the list above. Do NOT invent new IDs.

Respond in JSON only:
{
  "selected": [${Array(selectCount).fill('"agent_xxx"').join(", ")}],
  "rationale": "One paragraph explaining why these were chosen for this topic"
}`,
      { maxTokens: 500 }
    );

    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Failed to parse Ada response" }, { status: 500 });
    const parsed = JSON.parse(match[0]);

    // Validate selected agents exist
    const validIds = activeAgents.map((a) => a.id);
    const selected = parsed.selected.filter((id) => validIds.includes(id)).slice(0, selectCount);

    return NextResponse.json({ selected, rationale: parsed.rationale || "" });
  } catch (e) {
    console.error("Ada select error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
