import { createHandler } from "../../../../lib/api-handler";
import { CycleGenerateInputSchema, ThroughLineSchema, CycleActSchema } from "../../../../lib/schemas";
import { callLLM, callLLMWithRetry } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { NextResponse } from "next/server";

// Shared writing style rules injected into all agent prompts
const WRITING_STYLE_RULES = `
WRITING STYLE (MANDATORY):
- TARGET LENGTH: Each article should be 250-400 words (excluding code blocks). Be substantive — every claim needs evidence or reasoning, not just assertions.
- Use bullet points for every list. **Bold** key terms on first use.
- Max 20 words per sentence. No filler. Every word must earn its place.
- Use simple, everyday words. Write like you are explaining to a smart 15-year-old. Avoid jargon unless absolutely necessary — when you must use a technical term, define it in plain English in parentheses.
- Prefer short, clear sentences over complex ones. Replace fancy words with common ones (e.g. "use" not "utilize", "start" not "initiate", "show" not "demonstrate").
- In JSON paragraphs array, use \\n for line breaks within a single paragraph string.
- Each paragraph string in the array should be short — 2-4 sentences or a bullet list.`;

// Default color palette for dynamic pillars
const PILLAR_COLORS = [
  { color: "#3B6B9B", gradient: "linear-gradient(135deg,#3B6B9B,#6B9FCE)", lightBg: "#E3F2FD" },
  { color: "#E8734A", gradient: "linear-gradient(135deg,#E8734A,#F4A261)", lightBg: "#FFF3E0" },
  { color: "#2D8A6E", gradient: "linear-gradient(135deg,#2D8A6E,#5CC4A0)", lightBg: "#E8F5E9" },
];

// Orchestrator assignments for each act position
const ORCHESTRATORS = [
  { name: "Hypatia", id: "agent_sage" },
  { name: "Socratia", id: "agent_atlas" },
  { name: "Ada", id: "agent_forge" },
];

// ==================== STEP 0: Through-Line + Dynamic Pillars ====================
async function generateThroughLine(topic) {
  const response = await callLLMWithRetry(
    "anthropic",
    `You are the Re3 Cycle Architect. Given a topic, you produce:
1. A through-line question driving the entire cycle
2. Three DYNAMIC PILLARS — topic-specific intellectual lenses (NOT always Rethink/Rediscover/Reinvent)

Each pillar should:
- Be a genuinely distinct dimension of the topic (not just relabeling)
- Create productive tension with the other pillars
- Have a short, memorable label (1-2 words)
- Have a tagline (under 10 words)
- Have an angle describing what the agent should explore
- Have a structure describing the CONTENT FORMAT for that pillar's article

CRITICAL CONSTRAINT: The through-line question MUST directly address the user's original topic.
- Do NOT reinterpret, generalize, or drift to adjacent topics.
- The through-line question should be a SHARPER, more provocative version of the user's topic — not a different topic entirely.
- Every pillar angle MUST be a lens through which to examine the user's SPECIFIC topic, not a related topic.

Each pillar's "structure" field should describe the CONTENT FORMAT for that pillar's article.
The structure must match the pillar's intellectual purpose.
Do NOT use the same structure template for every cycle.
Different topics demand different structures.
For example:
- A pillar examining legal liability might use: "Case analysis → Precedent comparison → Risk mapping"
- A pillar examining organizational impact might use: "Stakeholder map → Impact analysis → Transition scenarios"
- A pillar examining technical architecture might use: "Current state → Proposed design → Code prototype"
- A pillar examining human impact might use: "Personal narratives → Systemic patterns → Policy implications"`,
    `USER'S EXACT TOPIC (do NOT change or reinterpret this): "${topic.title}"
Context: "${topic.rationale || ""}"

Your through-line question must be about "${topic.title}" specifically.
Your 3 pillars must each examine "${topic.title}" from a different angle.
Do NOT drift to adjacent or broader topics.

Return JSON only:
{
  "through_line_question": "The single question driving this cycle",
  "pillars": [
    { "label": "Pillar 1 Name", "tagline": "Brief description", "angle": "What should the first agent explore?", "structure": "Content format for this pillar" },
    { "label": "Pillar 2 Name", "tagline": "Brief description", "angle": "What should the second agent explore?", "structure": "Content format for this pillar" },
    { "label": "Pillar 3 Name", "tagline": "Brief description", "angle": "What should the third agent explore?", "structure": "Content format for this pillar" }
  ]
}`,
    { maxTokens: 1200, timeout: 30000, tier: "light" }
  );

  const { data, error } = parseLLMResponse(response, ThroughLineSchema);
  if (!data) throw new Error("Failed to parse through-line question: " + error);

  // If pillars somehow missing, retry would be better but fall back gracefully
  if (!data.pillars || data.pillars.length < 3) {
    throw new Error("Through-line generation did not return 3 pillars — please retry");
  }

  return data;
}

// ==================== GENERIC ACT GENERATOR ====================
async function generateAct(actIndex, topic, throughLine, previousActs) {
  const pillar = throughLine.pillars[actIndex];
  const orch = ORCHESTRATORS[actIndex];
  const pillarLabel = pillar.label;
  const allPillarLabels = throughLine.pillars.map(p => p.label);

  // Build context from previous acts
  let previousContext = "";
  let previousInsights = "";
  previousActs.forEach((act, i) => {
    const prevPillar = throughLine.pillars[i];
    previousContext += `\n--- ${prevPillar.label} (by ${ORCHESTRATORS[i].name}) ---\n`;
    previousContext += act.paragraphs.join("\n\n") + "\n";
    if (act.open_questions?.length) previousInsights += `\nOpen questions from ${prevPillar.label}:\n- ${act.open_questions.join("\n- ")}`;
    if (act.key_insights?.length) previousInsights += `\nKey insights from ${prevPillar.label}:\n- ${act.key_insights.join("\n- ")}`;
  });

  const isFirst = actIndex === 0;
  const isLast = actIndex === 2;
  const nextPillar = !isLast ? allPillarLabels[actIndex + 1] : null;
  const otherPillars = allPillarLabels.filter((_, i) => i !== actIndex).join(", ");

  const system = `You are ${orch.name}, writing the "${pillarLabel}" lens for a Re3 cycle.
Your role for this pillar: ${pillar.angle}
Your tagline: ${pillar.tagline}
Act ${actIndex + 1} of 3.${isFirst ? ` You create tension for the next two acts (${otherPillars}).` : isLast ? " This is the resolution — synthesize and build." : ""}

${previousInsights ? `CONTEXT FROM PREVIOUS ACTS:\n${previousInsights}` : ""}

YOUR CONTENT STRUCTURE (follow this, not a generic template):
${pillar.structure || "Raise the core tension, explore it from your angle, and end with open questions for the next pillar."}

ORIGINAL USER TOPIC (do NOT deviate): "${topic.title}"

RULES:
- Reference the through-line question throughout.
- ${isFirst ? `Leave room for the other two pillars: ${otherPillars}.` : `Build on previous acts. Do not repeat them.`}
- ${nextPillar ? `End with a bridge sentence pointing to ${nextPillar}.` : "End with an open thread — one question seeding the next cycle."}
- Tone: Direct, opinionated, substantive.
${WRITING_STYLE_RULES}`;

  const user = `ORIGINAL USER TOPIC (you MUST address this directly — do not deviate): "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your lens: "${pillarLabel}" — ${pillar.tagline}
Your angle: "${pillar.angle}"
${previousContext}

Return JSON:
{
  "title": "Short, compelling title (under 10 words)",
  "tldr": "One sentence (15 words max).",
  "paragraphs": ["paragraph 1", "paragraph 2", "..."],
  "key_insights": ["insight 1", "insight 2"],
  "open_questions": ["question for the next pillar or the community"],
  "bridge_sentence": "${nextPillar ? `Bridge to ${nextPillar}` : "Open thread for next cycle"}",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "questions|principle|blueprint|analysis|framework",
    "items": ["item 1", "item 2"]
  }
}`;

  const maxTokens = actIndex === 2 ? 2000 : 1500;
  const timeout = actIndex === 2 ? 45000 : 30000;

  const response = await callLLMWithRetry("anthropic", system, user, { maxTokens, timeout, retries: 2, tier: "standard" });
  const { data, error } = parseLLMResponse(response, CycleActSchema);
  if (!data) throw new Error(`Failed to parse ${orch.name} response for "${pillarLabel}": ` + error);
  return data;
}

// ==================== MAIN HANDLER ====================
export const POST = createHandler(CycleGenerateInputSchema, async (body, user, req) => {
  const { topic, step, previousData } = body;

  // Support step-by-step streaming for UI progress updates
  if (step === "through-line") {
    const throughLine = await generateThroughLine(topic);
    const pillarsWithMeta = throughLine.pillars.map((p, i) => ({
      ...p,
      key: `pillar_${i + 1}`,
      ...PILLAR_COLORS[i % PILLAR_COLORS.length],
      number: String(i + 1).padStart(2, "0"),
    }));
    return NextResponse.json({ step: "through-line", data: { ...throughLine, pillars: pillarsWithMeta } });
  }

  if (step === "act_0") {
    const throughLine = previousData?.throughLine;
    if (!throughLine) return NextResponse.json({ error: "throughLine required" }, { status: 400 });
    const pillarKey = throughLine.pillars?.[0]?.key || "pillar_1";
    const sage = await generateAct(0, topic, throughLine, []);
    return NextResponse.json({ step: "act_0", data: { ...sage, agent: ORCHESTRATORS[0].name, pillar: pillarKey, authorId: ORCHESTRATORS[0].id } });
  }

  if (step === "act_1") {
    const { throughLine, sage } = previousData || {};
    if (!throughLine || !sage) return NextResponse.json({ error: "throughLine and sage required" }, { status: 400 });
    const pillarKey = throughLine.pillars?.[1]?.key || "pillar_2";
    const atlas = await generateAct(1, topic, throughLine, [sage]);
    return NextResponse.json({ step: "act_1", data: { ...atlas, agent: ORCHESTRATORS[1].name, pillar: pillarKey, authorId: ORCHESTRATORS[1].id } });
  }

  if (step === "act_2") {
    const { throughLine, sage, atlas } = previousData || {};
    if (!throughLine || !sage || !atlas) return NextResponse.json({ error: "throughLine, sage, and atlas required" }, { status: 400 });
    const pillarKey = throughLine.pillars?.[2]?.key || "pillar_3";
    const forge = await generateAct(2, topic, throughLine, [sage, atlas]);
    return NextResponse.json({ step: "act_2", data: { ...forge, agent: ORCHESTRATORS[2].name, pillar: pillarKey, authorId: ORCHESTRATORS[2].id } });
  }

  // Full pipeline — stream progress events if client accepts SSE
  const wantsStream = req.headers.get("accept")?.includes("text/event-stream");

  if (wantsStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload) => {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)); } catch {}
        };
        try {
          send({ type: "step", step: "through-line", status: "started" });
          const throughLine = await generateThroughLine(topic);
          const pillarsWithMeta = throughLine.pillars.map((p, i) => ({
            ...p, key: `pillar_${i + 1}`, ...PILLAR_COLORS[i % PILLAR_COLORS.length],
            number: String(i + 1).padStart(2, "0"),
          }));
          const tlWithMeta = { ...throughLine, pillars: pillarsWithMeta };
          send({ type: "step", step: "through-line", status: "done", data: tlWithMeta });

          send({ type: "step", step: "act_0", status: "started", agent: ORCHESTRATORS[0].name });
          const sage = await generateAct(0, topic, tlWithMeta, []);
          const sagePost = { ...sage, agent: ORCHESTRATORS[0].name, pillar: pillarsWithMeta[0]?.key || "pillar_1", authorId: ORCHESTRATORS[0].id };
          send({ type: "step", step: "act_0", status: "done", data: sagePost });

          send({ type: "step", step: "act_1", status: "started", agent: ORCHESTRATORS[1].name });
          const atlas = await generateAct(1, topic, tlWithMeta, [sage]);
          const atlasPost = { ...atlas, agent: ORCHESTRATORS[1].name, pillar: pillarsWithMeta[1]?.key || "pillar_2", authorId: ORCHESTRATORS[1].id };
          send({ type: "step", step: "act_1", status: "done", data: atlasPost });

          send({ type: "step", step: "act_2", status: "started", agent: ORCHESTRATORS[2].name });
          const forge = await generateAct(2, topic, tlWithMeta, [sage, atlas]);
          const forgePost = { ...forge, agent: ORCHESTRATORS[2].name, pillar: pillarsWithMeta[2]?.key || "pillar_3", authorId: ORCHESTRATORS[2].id };
          send({ type: "step", step: "act_2", status: "done", data: forgePost });

          send({ type: "done", data: { throughLine: tlWithMeta, posts: [sagePost, atlasPost, forgePost] } });
        } catch (e) {
          send({ type: "error", error: e.message });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive" },
    });
  }

  // JSON fallback (backward-compatible)
  const throughLine = await generateThroughLine(topic);
  const pillarsWithMeta = throughLine.pillars.map((p, i) => ({
    ...p,
    key: `pillar_${i + 1}`,
    ...PILLAR_COLORS[i % PILLAR_COLORS.length],
    number: String(i + 1).padStart(2, "0"),
  }));
  const tlWithMeta = { ...throughLine, pillars: pillarsWithMeta };

  const sage = await generateAct(0, topic, tlWithMeta, []);
  const atlas = await generateAct(1, topic, tlWithMeta, [sage]);
  const forge = await generateAct(2, topic, tlWithMeta, [sage, atlas]);

  return NextResponse.json({
    throughLine: tlWithMeta,
    posts: [
      { ...sage, agent: ORCHESTRATORS[0].name, pillar: pillarsWithMeta[0]?.key || "pillar_1", authorId: ORCHESTRATORS[0].id },
      { ...atlas, agent: ORCHESTRATORS[1].name, pillar: pillarsWithMeta[1]?.key || "pillar_2", authorId: ORCHESTRATORS[1].id },
      { ...forge, agent: ORCHESTRATORS[2].name, pillar: pillarsWithMeta[2]?.key || "pillar_3", authorId: ORCHESTRATORS[2].id },
    ],
  });
});
