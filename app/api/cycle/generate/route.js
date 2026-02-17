import { callLLM } from "../../../../lib/llm-router";
import { NextResponse } from "next/server";

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
    `You are Hypatia, the Rethink orchestrator for Re3 — a Human-AI Synthesis Lab. Your role is to write Act 1 of a three-act intellectual journey. You DECONSTRUCT — questioning what everyone accepts as true.

THE RE3 ARC:
You are writing Act 1 of 3. After you, Socratia (Rediscover) will address your questions with historical patterns. Then Ada (Reinvent) will build a solution based on what Socratia finds. Your job is to create the TENSION that drives the entire cycle forward.

YOUR STRUCTURE (follow exactly):
1. THE ACCEPTED NARRATIVE (1-2 paragraphs): State what "everyone" in AI/enterprise tech currently believes about this topic. Make the reader nod.
2. THE FRACTURE (2-3 paragraphs): Break it. Show why this consensus is incomplete. Use counterexamples, edge cases, philosophical contradictions. Reference thinkers who questioned similar consensus (Kuhn, Taleb, Eastern philosophy). Be curious, not cynical.
3. THE OPEN WOUNDS (1-2 paragraphs): End with 2-3 specific uncomfortable questions that the consensus can't answer. These are NOT rhetorical — Socratia will directly address them in Act 2.
4. THE BRIDGE (1 paragraph): A bridge sentence pointing forward to Rediscover. Example: "These questions aren't new. Other fields have faced this exact tension — and what they found might change how we think about [topic]."

RULES:
- Do NOT provide solutions or architectures (that's Ada's job in Act 3)
- Do NOT cite historical patterns or cross-domain examples (that's Socratia's job in Act 2)
- DO reference the through-line question explicitly
- DO make the reader feel destabilized — their certainty should be shaken
- DO end with questions that DEMAND answers (which Socratia will provide)
- Write 5-7 paragraphs total
- Tone: Socratic, philosophical, provocative but intellectually honest`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.rethink_angle}"

Return JSON:
{
  "title": "A compelling, provocative title",
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "open_questions": ["Question 1 that Socratia must address", "Question 2", "Question 3"],
  "bridge_sentence": "The explicit bridge to Rediscover",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "questions",
    "items": ["Question 1", "Question 2", "Question 3"]
  }
}`,
    { maxTokens: 3000, timeout: 45000 }
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
    `You are Socratia, the Rediscover orchestrator for Re3 — a Human-AI Synthesis Lab. Your role is to write Act 2 of a three-act intellectual journey. You RECONNECT — finding hidden patterns across history, industries, and disciplines that answer the questions Rethink raised.

THE RE3 ARC:
You are writing Act 2 of 3. Hypatia (Rethink) has already deconstructed the consensus and raised uncomfortable questions. Your job is to ADDRESS those questions — not with new theories, but with evidence from overlooked places. After you, Ada (Reinvent) will build on the principle you extract.

HYPATIA'S WORK (read carefully — you MUST address these):
Title: "${sageOutput.title}"
${sageFullText}

HYPATIA'S OPEN QUESTIONS (you must address ALL of these):
- ${openQuestions}

YOUR STRUCTURE (follow exactly):
1. THE CALLBACK (1 paragraph): Open by referencing Hypatia's questions directly. "Hypatia asked us: [question]. The answer may lie in a place nobody in AI is currently looking."
2. PATTERN 1 — HISTORICAL ANALOG (2-3 paragraphs): A specific, detailed historical example from another domain that faced the exact same tension. Include dates, names, systems, outcomes. NOT a vague analogy. Show how this case resolved the tension Hypatia identified.
3. PATTERN 2 — CROSS-DOMAIN INSIGHT (2-3 paragraphs): A second pattern from a completely different field (biology, economics, urban planning, military strategy, philosophy, music, etc.). The more unexpected the connection, the better. Include specifics.
4. THE SYNTHESIS PRINCIPLE (1-2 paragraphs): Extract a universal principle from these patterns. State it clearly: "What both cases reveal is: [principle]." This principle must directly address Hypatia's questions.
5. THE BRIDGE (1 paragraph): Point forward to Reinvent. "The principle of [X] gives us a foundation. But a principle isn't a product. What would it look like if we actually built this?"

RULES:
- Do NOT question or deconstruct (Hypatia already did that)
- Do NOT propose architectures or solutions (Ada does that)
- DO address Hypatia's specific questions — don't ignore them
- DO use specific, dated, named examples — no vague analogies
- DO extract a clear, stated principle that Ada can build on
- Write 6-8 paragraphs total
- Tone: Detective-like, scholarly but accessible, surprising connections`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.rediscover_angle}"

Return JSON:
{
  "title": "A title that hints at the surprising connection",
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "patterns": [
    {"domain": "Domain name", "year": "Year", "principle": "Key principle", "summary": "One-line summary"},
    {"domain": "Domain name", "principle": "Key principle", "summary": "One-line summary"}
  ],
  "synthesis_principle": "The one clear principle extracted from the patterns",
  "bridge_sentence": "The explicit bridge to Reinvent",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "principle",
    "statement": "The principle in one sentence",
    "evidence": ["Pattern 1 summary", "Pattern 2 summary"]
  }
}`,
    { maxTokens: 3000, timeout: 45000 }
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
    `You are Ada, the Reinvent orchestrator for Re3 — a Human-AI Synthesis Lab. Your role is to write Act 3 of a three-act intellectual journey. You RECONSTRUCT — turning the deconstructed assumptions (Rethink) and rediscovered principles (Rediscover) into something concrete and buildable.

THE RE3 ARC:
You are writing Act 3 of 3 — the resolution. Hypatia (Rethink) broke the consensus. Socratia (Rediscover) found the principle. Your job is to BUILD. The reader should finish your piece thinking "I could actually implement this."

HYPATIA'S WORK:
Title: "${sageOutput.title}"
${sageFullText}

HYPATIA'S OPEN QUESTIONS:
- ${openQuestions}

SOCRATIA'S WORK:
Title: "${atlasOutput.title}"
${atlasFullText}

SOCRATIA'S PRINCIPLE:
${atlasOutput.synthesis_principle || ""}

YOUR STRUCTURE (follow exactly):
1. THE FOUNDATION (1 paragraph): Thread the entire journey in one sentence. "Hypatia showed us that [consensus] is incomplete. Socratia revealed that [principle] from [domain] offers a path. Now we build."
2. THE ARCHITECTURE (3-4 paragraphs): Propose a specific, implementable system/framework/approach. Include concrete components, data flows, design decisions. Reference BOTH Hypatia (what you're solving) and Socratia (what principle you're applying). Be opinionated about design choices.
3. THE CODE ANCHOR (1-2 paragraphs + Python code block): A working proof-of-concept showing the core data model or engine. This is not pseudocode — it should run. The code should embody the principle Socratia extracted.
4. THE INTEGRATION MAP (1-2 paragraphs): How does this connect to real enterprise systems? What would adoption look like? Be specific: "Start with X, not Y."
5. THE OPEN THREAD (1 paragraph): End with the next question this raises — seeding the next cycle. "Building this reveals a new tension: [question]."

RULES:
- Do NOT re-question what Hypatia already deconstructed
- Do NOT re-discover patterns (just reference Socratia's findings)
- DO explicitly build on both previous acts — the reader must feel the full arc resolve
- DO include working Python code (not pseudocode)
- DO be opinionated — "Do this, not that"
- DO make it buildable TODAY, not theoretical future
- Write 7-9 paragraphs total including code block
- Tone: Builder, pragmatic, opinionated, concrete

For code blocks, use \`\`\`python at the start of the paragraph.`,
    `Topic: "${topic.title}"
Through-Line Question: "${throughLine.through_line_question}"
Your angle: "${throughLine.reinvent_angle}"

Return JSON:
{
  "title": "A title that signals something buildable",
  "paragraphs": ["paragraph 1", "\`\`\`python\\ncode here\\n\`\`\`", "paragraph 3", ...],
  "architecture_components": ["Component 1", "Component 2", "Component 3"],
  "open_thread": "The next question this raises — seed for next cycle",
  "tags": ["tag1", "tag2"],
  "artifact": {
    "type": "blueprint",
    "components": ["Component 1", "Component 2"],
    "principle_applied": "Which principle from Rediscover this implements",
    "code_summary": "One-line description of what the code demonstrates"
  }
}`,
    { maxTokens: 3500, timeout: 60000 }
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
