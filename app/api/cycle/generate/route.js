import { callLLM } from "../../../../lib/llm-router";
import { parseLLMResponse } from "../../../../lib/llm-parse";
import { ThroughLineSchema, CycleRethinkSchema, CycleRediscoverSchema, CycleReinventSchema } from "../../../../lib/schemas";
import { getAuthUser } from "../../../../lib/auth";
import { llmRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";

// Shared writing style rules injected into all agent prompts
const WRITING_STYLE_RULES = `
WRITING STYLE (MANDATORY):
- HARD LIMIT: Each article must be UNDER 100 words total (excluding code blocks). Count carefully.
- Use bullet points for every list. **Bold** key terms on first use.
- Max 15 words per sentence. No filler. Every word must earn its place.
- Use simple, everyday words. Write like you are explaining to a smart 15-year-old. Avoid jargon unless absolutely necessary — when you must use a technical term, define it in plain English in parentheses.
- Prefer short, clear sentences over complex ones. Replace fancy words with common ones (e.g. "use" not "utilize", "start" not "initiate", "show" not "demonstrate").
- In JSON paragraphs array, use \\n for line breaks within a single paragraph string.
- Each paragraph string in the array should be short — 1-3 sentences or a bullet list.`;

// Default color palette for dynamic pillars
const PILLAR_COLORS = [
  { color: "#3B6B9B", gradient: "linear-gradient(135deg,#3B6B9B,#6B9FCE)", lightBg: "#E3F2FD" },
  { color: "#E8734A", gradient: "linear-gradient(135deg,#E8734A,#F4A261)", lightBg: "#FFF3E0" },
  { color: "#2D8A6E", gradient: "linear-gradient(135deg,#2D8A6E,#5CC4A0)", lightBg: "#E8F5E9" },
];

// Orchestrator assignments for each act position
const ORCHESTRATORS = [
  { name: "Hypatia", id: "agent_sage", role: "deconstructs and questions" },
  { name: "Socratia", id: "agent_atlas", role: "finds hidden patterns and connections" },
  { name: "Ada", id: "agent_forge", role: "builds concrete solutions and architectures" },
];

// ==================== STEP 0: Through-Line + Dynamic Pillars ====================
async function generateThroughLine(topic) {
  const response = await callLLM(
    "anthropic",
    `You are the Re3 Cycle Architect. Given a topic, you produce:
1. A through-line question driving the entire cycle
2. Three DYNAMIC PILLARS — topic-specific intellectual lenses (NOT always Rethink/Rediscover/Reinvent)

Each pillar should:
- Be a genuinely distinct dimension of the topic (not just relabeling)
- Create productive tension with the other pillars
- Have a short, memorable label (1-2 words)
- Have a tagline (under 10 words)
- Have an angle describing what the agent should explore`,
    `Topic: "${topic.title}"
Context: "${topic.rationale || ""}"

Return JSON only:
{
  "through_line_question": "The single question driving this cycle",
  "pillars": [
    { "label": "Pillar 1 Name", "tagline": "Brief description", "angle": "What should the first agent explore?" },
    { "label": "Pillar 2 Name", "tagline": "Brief description", "angle": "What should the second agent explore?" },
    { "label": "Pillar 3 Name", "tagline": "Brief description", "angle": "What should the third agent explore?" }
  ],
  "rethink_angle": "Same as pillars[0].angle (for backward compat)",
  "rediscover_angle": "Same as pillars[1].angle (for backward compat)",
  "reinvent_angle": "Same as pillars[2].angle (for backward compat)"
}`,
    { maxTokens: 600, timeout: 30000, tier: "light" }
  );

  const { data, error } = parseLLMResponse(response, ThroughLineSchema);
  if (!data) throw new Error("Failed to parse through-line question: " + error);

  // Ensure backward compat: if pillars not returned, build from classic angles
  if (!data.pillars || data.pillars.length < 3) {
    data.pillars = [
      { label: "Rethink", tagline: "Deconstruct assumptions", angle: data.rethink_angle },
      { label: "Rediscover", tagline: "Find hidden patterns", angle: data.rediscover_angle },
      { label: "Reinvent", tagline: "Build what's next", angle: data.reinvent_angle },
    ];
  }

  // Backfill classic angles from dynamic pillars
  if (!data.rethink_angle && data.pillars[0]) data.rethink_angle = data.pillars[0].angle;
  if (!data.rediscover_angle && data.pillars[1]) data.rediscover_angle = data.pillars[1].angle;
  if (!data.reinvent_angle && data.pillars[2]) data.reinvent_angle = data.pillars[2].angle;

  return data;
}

// ==================== GENERIC ACT GENERATOR ====================
// Generates content for any pillar position (1st, 2nd, or 3rd act)
async function generateAct(actIndex, topic, throughLine, previousActs) {
  const pillar = throughLine.pillars[actIndex];
  const orch = ORCHESTRATORS[actIndex];
  const pillarLabel = pillar.label;
  const allPillarLabels = throughLine.pillars.map(p => p.label);

  // Build context from previous acts
  let previousContext = "";
  let previousQuestions = "";
  let previousPrinciple = "";
  previousActs.forEach((act, i) => {
    const prevPillar = throughLine.pillars[i];
    previousContext += `\n--- ${prevPillar.label} (by ${ORCHESTRATORS[i].name}) ---\n`;
    previousContext += act.paragraphs.join("\n\n") + "\n";
    if (act.open_questions?.length) previousQuestions = act.open_questions.join("\n- ");
    if (act.synthesis_principle) previousPrinciple = act.synthesis_principle;
  });

  // Different prompts per act position
  const actPrompts = {
    0: {
      // First act: deconstruct/question
      system: `You are ${orch.name}, writing the "${pillarLabel}" lens for a Re3 cycle. You ${orch.role}. Act 1 of 3 — you create tension for the next two acts (${allPillarLabels[1]}, ${allPillarLabels[2]}).

YOUR OUTPUT (follow exactly — UNDER 100 WORDS TOTAL):
1. THE CONSENSUS: 1-2 bullet points stating what everyone believes. **Bold** key terms.
2. THE FRACTURE: 2-3 bullet points breaking that consensus. Why is it wrong or incomplete?
3. OPEN QUESTIONS: 2-3 bullet-point questions the consensus cannot answer.
4. BRIDGE: 1 sentence pointing to ${allPillarLabels[1]}.

RULES:
- Reference the through-line question.
- Leave room for ${allPillarLabels[1]} and ${allPillarLabels[2]}.
- Tone: Provocative, Socratic, honest.
${WRITING_STYLE_RULES}`,
      user: `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your lens: "${pillarLabel}" — ${pillar.tagline}
Your angle: "${pillar.angle}"

Return JSON:
{
  "title": "Short, provocative title (under 10 words)",
  "tldr": "One sentence (15 words max).",
  "paragraphs": ["- Consensus point 1\\n- Consensus point 2", "- Fracture point 1\\n- Fracture point 2\\n- Fracture point 3", "- Question 1?\\n- Question 2?\\n- Question 3?", "Bridge sentence to ${allPillarLabels[1]}."],
  "open_questions": ["Question 1", "Question 2", "Question 3"],
  "bridge_sentence": "Bridge sentence",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "questions",
    "items": ["Question 1", "Question 2", "Question 3"]
  }
}`,
      schema: CycleRethinkSchema,
    },
    1: {
      // Second act: discover/connect
      system: `You are ${orch.name}, writing the "${pillarLabel}" lens for a Re3 cycle. You ${orch.role}. Act 2 of 3.

${previousQuestions ? `QUESTIONS FROM ${allPillarLabels[0].toUpperCase()} TO ADDRESS:\n- ${previousQuestions}` : ""}

YOUR OUTPUT (follow exactly — UNDER 100 WORDS TOTAL):
1. CALLBACK: 1 sentence referencing ${allPillarLabels[0]}'s question.
2. PATTERN 1: **Bold** the name. Include domain, year, and key insight as 2-3 bullets.
3. PATTERN 2: Different field entirely. 2-3 bullets with specifics.
4. PRINCIPLE: 1 bold sentence — "What both reveal: [principle]."
5. BRIDGE: 1 sentence to ${allPillarLabels[2]}.

RULES:
- Build on ${allPillarLabels[0]}'s work. Do not repeat it.
- Use specific, dated, named examples. No vague analogies.
- Tone: Detective-like, surprising connections.
${WRITING_STYLE_RULES}`,
      user: `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your lens: "${pillarLabel}" — ${pillar.tagline}
Your angle: "${pillar.angle}"
${previousContext}

Return JSON:
{
  "title": "Short title hinting at the surprising connection (under 10 words)",
  "tldr": "One sentence (15 words max).",
  "paragraphs": ["Callback sentence.", "**Pattern Name** (year):\\n- Key insight 1\\n- Key insight 2", "**Cross-domain term**:\\n- Insight 1\\n- Insight 2", "**Principle:** What both cases reveal is: [principle].", "Bridge sentence to ${allPillarLabels[2]}."],
  "patterns": [
    {"domain": "Domain", "year": "Year", "principle": "Key principle", "summary": "One-line"},
    {"domain": "Domain", "principle": "Key principle", "summary": "One-line"}
  ],
  "synthesis_principle": "The principle in one sentence",
  "bridge_sentence": "Bridge sentence",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "principle",
    "statement": "The principle in one sentence",
    "evidence": ["Pattern 1 summary", "Pattern 2 summary"]
  }
}`,
      schema: CycleRediscoverSchema,
    },
    2: {
      // Third act: build/synthesize
      system: `You are ${orch.name}, writing the "${pillarLabel}" lens for a Re3 cycle. You ${orch.role}. Act 3 of 3 — the resolution.

${previousPrinciple ? `PRINCIPLE FROM ${allPillarLabels[1].toUpperCase()} TO BUILD ON:\n${previousPrinciple}` : ""}

YOUR OUTPUT (follow exactly — UNDER 100 WORDS for prose, code block is separate):
1. FOUNDATION: 1 sentence threading the arc. "${allPillarLabels[0]} broke [X]. ${allPillarLabels[1]} found [Y]. Now we build."
2. ARCHITECTURE: 3-4 bullet-point components. **Bold** each name. Be opinionated.
3. CODE ANCHOR: A short working Python snippet (10-20 lines). Embodies the principle.
4. INTEGRATION: 2-3 bullet steps. "Start with X, not Y."
5. OPEN THREAD: 1 sentence seeding the next cycle.

RULES:
- Build on both previous acts. Do not repeat them.
- Working Python code, not pseudocode.
- Tone: Builder, pragmatic, opinionated.
${WRITING_STYLE_RULES}

For code blocks, use \`\`\`python at the start of the paragraph.`,
      user: `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your lens: "${pillarLabel}" — ${pillar.tagline}
Your angle: "${pillar.angle}"
${previousContext}

Return JSON:
{
  "title": "Short, buildable title (under 10 words)",
  "tldr": "One sentence (15 words max).",
  "paragraphs": ["Foundation sentence.", "**Component 1**: description\\n**Component 2**: description\\n**Component 3**: description", "\`\`\`python\\ncode here\\n\`\`\`", "- Integration step 1\\n- Integration step 2\\n- Integration step 3", "Open thread sentence."],
  "architecture_components": ["Component 1", "Component 2", "Component 3"],
  "open_thread": "Next question this raises",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "blueprint",
    "components": ["Component 1", "Component 2"],
    "principle_applied": "Principle from ${allPillarLabels[1]}",
    "code_summary": "What the code demonstrates"
  }
}`,
      schema: CycleReinventSchema,
    },
  };

  const prompt = actPrompts[actIndex];
  const maxTokens = actIndex === 2 ? 1500 : 1200;
  const timeout = actIndex === 2 ? 45000 : 30000;

  const response = await callLLM("anthropic", prompt.system, prompt.user, { maxTokens, timeout, tier: "standard" });
  const { data, error } = parseLLMResponse(response, prompt.schema);
  if (!data) throw new Error(`Failed to parse ${orch.name} response for "${pillarLabel}": ` + error);
  return data;
}

// Legacy wrappers for backward compatibility
async function generateRethink(topic, throughLine) {
  return generateAct(0, topic, throughLine, []);
}
async function generateRediscover(topic, throughLine, sageOutput) {
  return generateAct(1, topic, throughLine, [sageOutput]);
}
async function generateReinvent(topic, throughLine, sageOutput, atlasOutput) {
  return generateAct(2, topic, throughLine, [sageOutput, atlasOutput]);
}

// ==================== MAIN HANDLER ====================
export async function POST(req) {
  try {
    const { user, error, status } = await getAuthUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { allowed } = llmRateLimit.check(user.uid);
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { topic, step, previousData } = await req.json();

    if (!topic?.title) {
      return NextResponse.json({ error: "Topic title is required" }, { status: 400 });
    }

    // Support step-by-step streaming for UI progress updates
    if (step === "through-line") {
      const throughLine = await generateThroughLine(topic);
      // Attach resolved pillar metadata (colors, keys)
      const pillarsWithMeta = throughLine.pillars.map((p, i) => ({
        ...p,
        key: `pillar_${i + 1}`,
        ...PILLAR_COLORS[i % PILLAR_COLORS.length],
        number: String(i + 1).padStart(2, "0"),
      }));
      return NextResponse.json({ step: "through-line", data: { ...throughLine, pillars: pillarsWithMeta } });
    }

    if (step === "rethink" || step === "act_0") {
      const throughLine = previousData?.throughLine;
      if (!throughLine) return NextResponse.json({ error: "throughLine required" }, { status: 400 });
      const pillarKey = throughLine.pillars?.[0]?.key || "rethink";
      const sage = await generateAct(0, topic, throughLine, []);
      return NextResponse.json({ step: "act_0", data: { ...sage, agent: ORCHESTRATORS[0].name, pillar: pillarKey, authorId: ORCHESTRATORS[0].id } });
    }

    if (step === "rediscover" || step === "act_1") {
      const { throughLine, sage } = previousData || {};
      if (!throughLine || !sage) return NextResponse.json({ error: "throughLine and sage required" }, { status: 400 });
      const pillarKey = throughLine.pillars?.[1]?.key || "rediscover";
      const atlas = await generateAct(1, topic, throughLine, [sage]);
      return NextResponse.json({ step: "act_1", data: { ...atlas, agent: ORCHESTRATORS[1].name, pillar: pillarKey, authorId: ORCHESTRATORS[1].id } });
    }

    if (step === "reinvent" || step === "act_2") {
      const { throughLine, sage, atlas } = previousData || {};
      if (!throughLine || !sage || !atlas) return NextResponse.json({ error: "throughLine, sage, and atlas required" }, { status: 400 });
      const pillarKey = throughLine.pillars?.[2]?.key || "reinvent";
      const forge = await generateAct(2, topic, throughLine, [sage, atlas]);
      return NextResponse.json({ step: "act_2", data: { ...forge, agent: ORCHESTRATORS[2].name, pillar: pillarKey, authorId: ORCHESTRATORS[2].id } });
    }

    // Full pipeline (all steps sequentially)
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
        { ...sage, agent: ORCHESTRATORS[0].name, pillar: pillarsWithMeta[0]?.key || "rethink", authorId: ORCHESTRATORS[0].id },
        { ...atlas, agent: ORCHESTRATORS[1].name, pillar: pillarsWithMeta[1]?.key || "rediscover", authorId: ORCHESTRATORS[1].id },
        { ...forge, agent: ORCHESTRATORS[2].name, pillar: pillarsWithMeta[2]?.key || "reinvent", authorId: ORCHESTRATORS[2].id },
      ],
    });
  } catch (error) {
    console.error("Cycle generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
