import { createHandler } from "../../../../lib/api-handler";
import { RoundInputSchema } from "../../../../lib/schemas";
import { callLLM, streamAnthropicLLM } from "../../../../lib/llm-router";
import { sanitizeForLLM, sanitizeShort } from "../../../../lib/sanitize";
import { NextResponse } from "next/server";

export const POST = createHandler(RoundInputSchema, async (body, user, req) => {
  const { agents, roundNumber, previousRounds, pillarNames } = body;
  const articleTitle = sanitizeShort(body.articleTitle);
  const articleText = sanitizeForLLM(body.articleText);
  const wantsStream = req.headers.get("accept")?.includes("text/event-stream");

  // Build context from previous rounds
  let context = "";
  previousRounds.forEach((round, i) => {
    context += `\n--- Round ${i + 1} ---\n`;
    round.forEach((r) => {
      context += `${r.name}: ${r.response}\n\n`;
    });
  });

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
  const systemFor = (agent) =>
    `You are ${agent.name}. ${agent.persona} You are participating in a structured debate on the Re³ platform. Keep responses crisp and under 120 words. No filler — every sentence must earn its place. Use simple, everyday language that anyone can understand. Avoid jargon — if you must use a technical term, explain it briefly in parentheses. Write like you are talking to a smart friend, not writing an academic paper.`;

  // ==================== SSE STREAMING MODE ====================
  if (wantsStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload) => {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)); } catch {}
        };

        // Stream all agents in parallel — each emits token deltas
        const agentPromises = agents.map(async (agent) => {
          try {
            send({ type: "agent_start", agent: { id: agent.id, name: agent.name } });
            const text = await streamAnthropicLLM(
              systemFor(agent),
              getPrompt(agent),
              {
                timeout: 30000, maxTokens: 500, tier: "standard",
                onChunk: (delta) => send({ type: "agent_delta", agentId: agent.id, delta }),
              }
            );
            const result = { id: agent.id, name: agent.name, response: text, model: agent.model, status: "success" };
            send({ type: "agent_done", agentId: agent.id, result });
            return result;
          } catch (e) {
            const result = { id: agent.id, name: agent.name, response: null, model: agent.model, status: "failed", error: e.message };
            send({ type: "agent_done", agentId: agent.id, result });
            return result;
          }
        });

        const responses = await Promise.all(agentPromises);
        send({ type: "done", data: { round: roundNumber, responses } });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive" },
    });
  }

  // ==================== JSON MODE (backward-compatible) ====================
  const results = await Promise.allSettled(
    agents.map(async (agent) => {
      const text = await callLLM(
        agent.model || "anthropic",
        systemFor(agent),
        getPrompt(agent),
        { timeout: 30000, maxTokens: 500, tier: "standard" }
      );
      return { id: agent.id, name: agent.name, response: text, model: agent.model, status: "success" };
    })
  );

  const responses = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { id: agents[i].id, name: agents[i].name, response: null, model: agents[i].model, status: "failed", error: r.reason?.message || "Unknown error" };
  });

  return NextResponse.json({ round: roundNumber, responses });
}, { allowGuest: true });
