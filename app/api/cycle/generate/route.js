import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

// Shared writing style rules injected into all agent prompts
const WRITING_STYLE_RULES = `
WRITING STYLE (MANDATORY):
- HARD LIMIT: Each article must be UNDER 100 words total (excluding code blocks). Count carefully.
- Use bullet points for every list. **Bold** key terms on first use.
- Max 15 words per sentence. No filler. Every word must earn its place.
- Define jargon in parentheses on first use: "ontological drift (when categories stop matching reality)"
- In JSON paragraphs array, use \\n for line breaks within a single paragraph string.
- Each paragraph string in the array should be short — 1-3 sentences or a bullet list.`;

// ==================== STEP 0: Through-Line Question ====================
async function generateThroughLine(topic) {
  const response = await callLLM(
    "anthropic",
    `You are the Re3 Cycle Architect. Your job is to take a topic and produce a single through-line question that will drive an entire intellectual cycle across three acts: Rethink (deconstruct), Rediscover (reconnect), and Reinvent (reconstruct).

The through-line question must:
- Be specific enough that each act can address it directly
- Be provocative enough that the "obvious" answer is wrong or incomplete
- Be AI-relevant and meaningful to enterprise technology leaders
- Not be answerable with a simple yes/no — it should require genuine exploration`,
    `Topic: "${topic.title}"
Context: "${topic.rationale || ""}"

Return JSON only:
{
  "through_line_question": "The single question driving this cycle",
  "rethink_angle": "What assumption should Hypatia challenge?",
  "rediscover_angle": "What domains/history should Socratia explore?",
  "reinvent_angle": "What should Ada build?"
}`,
    { maxTokens: 500, timeout: 30000 }
  );

  const match = response.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse through-line question");
  return JSON.parse(match[0]);
}

// ==================== STEP 1: Hypatia writes Rethink (Act 1) ====================
async function generateRethink(topic, throughLine) {
  const response = await callLLM(
    "anthropic",
    `You are Hypatia, the Rethink orchestrator for Re3. You DECONSTRUCT assumptions. Act 1 of 3 — you create tension, Socratia (Act 2) finds patterns, Ada (Act 3) builds.

YOUR OUTPUT (follow exactly — UNDER 100 WORDS TOTAL):
1. THE CONSENSUS: 1-2 bullet points stating what everyone believes. **Bold** key terms.
2. THE FRACTURE: 2-3 bullet points breaking that consensus. Why is it wrong or incomplete?
3. OPEN QUESTIONS: 2-3 bullet-point questions the consensus cannot answer. Socratia MUST address these.
4. BRIDGE: 1 sentence pointing to Rediscover.

RULES:
- No solutions (Ada's job). No historical patterns (Socratia's job).
- Reference the through-line question.
- Tone: Provocative, Socratic, honest.
${WRITING_STYLE_RULES}`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.rethink_angle}"

Return JSON:
{
  "title": "Short, provocative title (under 10 words)",
  "tldr": "One sentence (15 words max) — what assumption breaks and why it matters.",
  "paragraphs": ["- Consensus point 1\\n- Consensus point 2", "- Fracture point 1\\n- Fracture point 2\\n- Fracture point 3", "- Question 1?\\n- Question 2?\\n- Question 3?", "Bridge sentence to Rediscover."],
  "open_questions": ["Question 1", "Question 2", "Question 3"],
  "bridge_sentence": "Bridge sentence",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "questions",
    "items": ["Question 1", "Question 2", "Question 3"]
  }
}`,
    { maxTokens: 1200, timeout: 30000 }
  );

  const match = response.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse Hypatia response");
  return JSON.parse(match[0]);
}

// ==================== STEP 2: Socratia writes Rediscover (Act 2) ====================
async function generateRediscover(topic, throughLine, sageOutput) {
  const sageFullText = sageOutput.paragraphs.join("\n\n");
  const openQuestions = sageOutput.open_questions?.join("\n- ") || "";

  const response = await callLLM(
    "anthropic",
    `You are Socratia, the Rediscover orchestrator for Re3. You find hidden PATTERNS that answer Rethink's questions. Act 2 of 3.

HYPATIA'S QUESTIONS TO ADDRESS:
- ${openQuestions}

YOUR OUTPUT (follow exactly — UNDER 100 WORDS TOTAL):
1. CALLBACK: 1 sentence referencing Hypatia's question.
2. PATTERN 1: **Bold** the name. Include domain, year, and key insight as 2-3 bullets.
3. PATTERN 2: Different field entirely. 2-3 bullets with specifics.
4. PRINCIPLE: 1 bold sentence — "What both reveal: [principle]."
5. BRIDGE: 1 sentence to Reinvent.

RULES:
- No deconstruction (Hypatia did that). No solutions (Ada does that).
- Use specific, dated, named examples. No vague analogies.
- Tone: Detective-like, surprising connections.
${WRITING_STYLE_RULES}`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.rediscover_angle}"

Return JSON:
{
  "title": "Short title hinting at the surprising connection (under 10 words)",
  "tldr": "One sentence (15 words max) — what patterns were found and what principle emerges.",
  "paragraphs": ["Callback sentence referencing Hypatia.", "**Pattern Name** (year):\\n- Key insight 1\\n- Key insight 2", "**Cross-domain term** (definition):\\n- Insight 1\\n- Insight 2", "**Principle:** What both cases reveal is: [principle].", "Bridge sentence to Reinvent."],
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
    { maxTokens: 1200, timeout: 30000 }
  );

  const match = response.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse Socratia response");
  return JSON.parse(match[0]);
}

// ==================== STEP 3: Ada writes Reinvent (Act 3) ====================
async function generateReinvent(topic, throughLine, sageOutput, atlasOutput) {
  const sageFullText = sageOutput.paragraphs.join("\n\n");
  const atlasFullText = atlasOutput.paragraphs.join("\n\n");
  const openQuestions = sageOutput.open_questions?.join("\n- ") || "";

  const response = await callLLM(
    "anthropic",
    `You are Ada, the Reinvent orchestrator for Re3. You BUILD concrete solutions. Act 3 of 3 — the resolution.

SOCRATIA'S PRINCIPLE TO BUILD ON:
${atlasOutput.synthesis_principle || ""}

YOUR OUTPUT (follow exactly — UNDER 100 WORDS for prose, code block is separate):
1. FOUNDATION: 1 sentence threading the arc. "Hypatia broke [X]. Socratia found [Y]. Now we build."
2. ARCHITECTURE: 3-4 bullet-point components. **Bold** each name. Be opinionated.
3. CODE ANCHOR: A short working Python snippet (10-20 lines). Embodies the principle.
4. INTEGRATION: 2-3 bullet steps. "Start with X, not Y."
5. OPEN THREAD: 1 sentence seeding the next cycle.

RULES:
- No re-questioning (Hypatia did that). No pattern-finding (Socratia did that).
- Working Python code, not pseudocode.
- Tone: Builder, pragmatic, opinionated.
${WRITING_STYLE_RULES}

For code blocks, use \`\`\`python at the start of the paragraph.`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.reinvent_angle}"

Return JSON:
{
  "title": "Short, buildable title (under 10 words)",
  "tldr": "One sentence (15 words max) — what you are building and why it works.",
  "paragraphs": ["Foundation sentence.", "**Component 1**: description\\n**Component 2**: description\\n**Component 3**: description", "\`\`\`python\\ncode here\\n\`\`\`", "- Integration step 1\\n- Integration step 2\\n- Integration step 3", "Open thread sentence."],
  "architecture_components": ["Component 1", "Component 2", "Component 3"],
  "open_thread": "Next question this raises",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "blueprint",
    "components": ["Component 1", "Component 2"],
    "principle_applied": "Principle from Rediscover",
    "code_summary": "What the code demonstrates"
  }
}`,
    { maxTokens: 1500, timeout: 45000 }
  );

  const match = response.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse Ada response");
  return JSON.parse(match[0]);
}

// ==================== MAIN HANDLER ====================
export async function POST(req) {
  try {
    const { topic, step, previousData } = await req.json();

    if (!topic?.title) {
      return NextResponse.json({ error: "Topic title is required" }, { status: 400 });
    }

    // Support step-by-step streaming for UI progress updates
    if (step === "through-line") {
      const throughLine = await generateThroughLine(topic);
      return NextResponse.json({ step: "through-line", data: throughLine });
    }

    if (step === "rethink") {
      const throughLine = previousData?.throughLine;
      if (!throughLine) return NextResponse.json({ error: "throughLine required" }, { status: 400 });
      const sage = await generateRethink(topic, throughLine);
      return NextResponse.json({ step: "rethink", data: { ...sage, agent: "Hypatia", pillar: "rethink", authorId: "agent_sage" } });
    }

    if (step === "rediscover") {
      const { throughLine, sage } = previousData || {};
      if (!throughLine || !sage) return NextResponse.json({ error: "throughLine and sage required" }, { status: 400 });
      const atlas = await generateRediscover(topic, throughLine, sage);
      return NextResponse.json({ step: "rediscover", data: { ...atlas, agent: "Socratia", pillar: "rediscover", authorId: "agent_atlas" } });
    }

    if (step === "reinvent") {
      const { throughLine, sage, atlas } = previousData || {};
      if (!throughLine || !sage || !atlas) return NextResponse.json({ error: "throughLine, sage, and atlas required" }, { status: 400 });
      const forge = await generateReinvent(topic, throughLine, sage, atlas);
      return NextResponse.json({ step: "reinvent", data: { ...forge, agent: "Ada", pillar: "reinvent", authorId: "agent_forge" } });
    }

    // Full pipeline (all steps sequentially)
    const throughLine = await generateThroughLine(topic);
    const sage = await generateRethink(topic, throughLine);
    const atlas = await generateRediscover(topic, throughLine, sage);
    const forge = await generateReinvent(topic, throughLine, sage, atlas);

    return NextResponse.json({
      throughLine,
      posts: [
        { ...sage, agent: "Hypatia", pillar: "rethink", authorId: "agent_sage" },
        { ...atlas, agent: "Socratia", pillar: "rediscover", authorId: "agent_atlas" },
        { ...forge, agent: "Ada", pillar: "reinvent", authorId: "agent_forge" },
      ],
    });
  } catch (error) {
    console.error("Cycle generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
