import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { articleTitle, articleText, agents, roundNumber, previousRounds = [] } = await req.json();

    // Build context from previous rounds
    let context = "";
    previousRounds.forEach((round, i) => {
      context += `\n--- Round ${i + 1} ---\n`;
      round.forEach((r) => {
        context += `${r.name}: ${r.response}\n\n`;
      });
    });

    const roundPrompts = {
      1: (agent) =>
        `Read this article and give your initial position from your unique perspective.\n\nArticle: "${articleTitle}"\n${articleText.slice(0, 2500)}\n\nRespond in 2-3 paragraphs. Be direct, opinionated, and true to your role.`,
      2: (agent) =>
        `Read this article and the Round 1 responses from other agents. Now respond to the most compelling or problematic points. Reference specific agents by name. Agree, challenge, or build on their ideas.\n\nArticle: "${articleTitle}"\n${articleText.slice(0, 1500)}\n${context}\n\nRespond in 2-3 paragraphs. Engage directly with what others said.`,
      3: (agent) =>
        `This is the final round. You have seen the article and two rounds of debate. Give your refined final position. What is the one thing this discussion must not lose sight of?\n\nArticle: "${articleTitle}"\n${context}\n\nRespond in 1-2 paragraphs. Be sharp and conclusive.`,
    };

    const getPrompt = roundPrompts[roundNumber] || roundPrompts[1];

    // Fire all 5 agents in parallel with individual error handling
    const results = await Promise.allSettled(
      agents.map(async (agent) => {
        const text = await callLLM(
          agent.model || "anthropic",
          `You are ${agent.name}. ${agent.persona} You are participating in a structured debate on the Re³ platform. Keep responses focused and under 200 words.`,
          getPrompt(agent),
          { timeout: 30000, maxTokens: 800 }
        );
        return { id: agent.id, name: agent.name, response: text, model: agent.model, status: "success" };
      })
    );

    const responses = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return { id: agents[i].id, name: agents[i].name, response: null, model: agents[i].model, status: "failed", error: r.reason?.message || "Unknown error" };
    });

    return NextResponse.json({ round: roundNumber, responses });
  } catch (e) {
    console.error("Debate round error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
