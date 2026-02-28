import { callLLM } from "../../../../lib/llm-router";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req, { allowGuest: true });
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { articleTitle, articleText, agents, roundNumber, previousRounds = [], pillarNames } = await req.json();

    // Build context from previous rounds
    let context = "";
    previousRounds.forEach((round, i) => {
      context += `\n--- Round ${i + 1} ---\n`;
      round.forEach((r) => {
        context += `${r.name}: ${r.response}\n\n`;
      });
    });

    // Detect if this is a full-cycle debate (longer content with all 3 articles)
    const isCycleDebate = articleText.length > 3000 || articleText.includes("---\n\n");
    const contentSlice1 = isCycleDebate ? articleText.slice(0, 5000) : articleText.slice(0, 2500);
    const contentSlice2 = isCycleDebate ? articleText.slice(0, 3000) : articleText.slice(0, 1500);
    const pillarLabel = pillarNames?.length ? pillarNames.join(", ") : "Rethink, Rediscover, Reinvent";
    const contentLabel = isCycleDebate ? `Re3 Cycle (${pillarNames?.length || 3} connected articles — ${pillarLabel})` : "Article";

    const roundPrompts = {
      1: (agent) =>
        `Read this ${contentLabel} and give your initial position from your unique perspective. Address the full intellectual arc — the questions raised, patterns discovered, and architecture proposed.\n\n${contentLabel}: "${articleTitle}"\n${contentSlice1}\n\nRespond in 1-2 short paragraphs (max 120 words). Be direct, opinionated, and true to your role.`,
      2: (agent) =>
        `Read this ${contentLabel} and the Round 1 responses from other agents. Now respond to the most compelling or problematic points. Reference specific agents by name. Agree, challenge, or build on their ideas.\n\n${contentLabel}: "${articleTitle}"\n${contentSlice2}\n${context}\n\nRespond in 1-2 short paragraphs (max 120 words). Engage directly with what others said.`,
      3: (agent) =>
        `This is the final round. You have seen the ${contentLabel.toLowerCase()} and two rounds of debate. Give your refined final position. What is the one thing this discussion must not lose sight of?\n\n${contentLabel}: "${articleTitle}"\n${context}\n\nRespond in 1 short paragraph (max 80 words). Be sharp and conclusive.`,
    };

    const getPrompt = roundPrompts[roundNumber] || roundPrompts[1];

    // Fire all 5 agents in parallel with individual error handling
    const results = await Promise.allSettled(
      agents.map(async (agent) => {
        const text = await callLLM(
          agent.model || "anthropic",
          `You are ${agent.name}. ${agent.persona} You are participating in a structured debate on the Re³ platform. Keep responses crisp and under 120 words. No filler — every sentence must earn its place.`,
          getPrompt(agent),
          { timeout: 30000, maxTokens: 500 }
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
