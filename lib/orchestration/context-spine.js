// Context-as-a-Frontier spine — the "context-comprehension" use-case type.
//
// This is the deterministic backbone for the "Apply this framework" engine on
// the Context as a Frontier page. Unlike the generic LLM-driven decomposer, a
// context-comprehension run ALWAYS expands into exactly six ordered sub-tasks —
// the canonical spine — so every run in the library shares the same structure:
//
//   LOCATE → EXTRACT → RECONSTRUCT → VALIDATE → DECIDE → SUSTAIN
//
// The stages run in parallel (each is self-contained on the user's system
// description + its own stage question); ordering is imposed at synthesis, which
// sequences the six analyses into a roadmap.
//
// Pure data + string builders only — NO imports. This module is bundled on the
// client (the Context page renders these stages live) as well as the server
// (the engine builds tasks from it), so it must stay dependency-free.

export const CONTEXT_COMPREHENSION_TYPE = "context-comprehension";

// One persona per stage.
export const CONTEXT_SPINE_MAX_AGENTS = 6;

// Canonical six stages. `toolingCategories` are the framework's per-stage
// tooling buckets — the required output scaffold. Each stage agent must address
// every category, tailoring the specific tools to the user's described stack and
// marking categories that don't apply, so the library stays structurally
// consistent while contents stay tailored per run.
export const CONTEXT_SPINE = [
  {
    id: "t1",
    num: "01",
    stage: "LOCATE",
    name: "Locate",
    question: "Where does the context actually live?",
    guidance:
      "Map where this system's real logic and truth physically reside — readable code, assembled configuration, vendor black boxes, and the motion between systems. Most enterprise logic isn't in the code; flag where the decisions are actually made.",
    requiredCapabilities: ["research", "architect"],
    toolingCategories: [
      "Source code & repositories",
      "Configuration & rules stores",
      "Vendor / black-box systems",
      "Integration & data-in-motion",
    ],
  },
  {
    id: "t2",
    num: "02",
    stage: "EXTRACT",
    name: "Extract",
    question: "How do we get the context out — the right way for where it lives?",
    guidance:
      "Choose the extraction technique for each home (parse code, reconstruct config wiring, model contracts, trace flows) so it all produces one shape: a graph of nodes and edges an AI agent can reason over. Make it re-runnable, not a one-shot export.",
    requiredCapabilities: ["research", "architect"],
    toolingCategories: [
      "Code parsing & static analysis",
      "Configuration extraction",
      "Contract / API & schema modeling",
      "Flow tracing & graph store",
    ],
  },
  {
    id: "t3",
    num: "03",
    stage: "RECONSTRUCT",
    name: "Reconstruct",
    question: "How do we explain why — not just what?",
    guidance:
      "Walk the graph to explain behavior in business terms (why a specific outcome happened), turning a structure only a specialist could read into an account a business analyst can verify. The graph keeps the explanation honest.",
    requiredCapabilities: ["architect"],
    toolingCategories: [
      "Graph query & traversal",
      "LLM narration & explanation",
      "Knowledge-graph / semantic layer",
      "Lineage & dependency mapping",
    ],
  },
  {
    id: "t4",
    num: "04",
    stage: "VALIDATE",
    name: "Validate",
    question: "What is the ground truth?",
    guidance:
      "Where sources disagree, the running system wins — behavior is truth, documentation is opinion. Replay real historical inputs through the reconstruction and measure how closely it matches reality. The gap you find is the value.",
    requiredCapabilities: ["critique"],
    toolingCategories: [
      "Replay & shadow testing",
      "Historical data & event sources",
      "Equivalence / diff measurement",
      "Observability & telemetry",
    ],
  },
  {
    id: "t5",
    num: "05",
    stage: "DECIDE",
    name: "Decide",
    question: "How does validated context change the call?",
    guidance:
      "Let validated understanding reshape the plan walked in with — re-scope, re-estimate, reverse decisions where the evidence demands it. Comprehension that isn't allowed to change the decision was theater.",
    requiredCapabilities: ["debate", "critique"],
    toolingCategories: [
      "Decision & trade-off frameworks",
      "Scoping & estimation",
      "Risk & impact assessment",
      "Planning & roadmapping",
    ],
  },
  {
    id: "t6",
    num: "06",
    stage: "SUSTAIN",
    name: "Sustain",
    question: "How do we keep it golden?",
    guidance:
      "Wire every commit, transport, and config change to re-derive context automatically, with drift detection when the graph and reality diverge. Context becomes an asset that compounds rather than a document that's wrong in three months.",
    requiredCapabilities: ["architect"],
    toolingCategories: [
      "CI/CD & commit hooks",
      "Change & event triggers",
      "Drift detection & monitoring",
      "Living-graph store & alerting",
    ],
  },
];

// Stages route to the agent's preferred model (complexity >= 0.6 in routeModel),
// since comprehension quality matters more than shaving cost here.
const STAGE_COMPLEXITY = 0.6;

/**
 * Build the per-stage agent output scaffold (hybrid tech list).
 * Required structure is identical across runs; contents are tailored per stack.
 */
function stageOutputFormat(stage) {
  const cats = stage.toolingCategories.map((c) => `- ${c}`).join("\n");
  return `Respond in GitHub-flavored markdown with exactly these two sections:

### What this means for your system
2-4 sentences describing concretely what the "${stage.name}" stage means for the specific system described — name the real parts of THEIR stack, not generic advice.

### Technology
For each canonical category below, name the specific tools, services, or approaches that fit the described stack. If a category does not apply to this system, keep the heading and write "N/A — <one-line reason>". Do not add or drop categories.
${cats}

Be concrete and concise. No preamble, no conclusion outside these two sections.`;
}

/**
 * Build the deterministic six-stage task list for a context-comprehension run.
 * Each task is self-contained on the user's system description + its stage
 * question, so the six can execute in parallel; ordering is imposed at synthesis.
 *
 * @param {object} useCase - { title, description, type }
 * @returns {{ tasks: object[], complexity: number }}
 */
export function buildContextSpine(useCase) {
  const description = (useCase?.description || "").trim();

  const tasks = CONTEXT_SPINE.map((stage) => ({
    id: stage.id,
    title: `${stage.num} · ${stage.name}`,
    description: `The user's system, in their own words:
"""
${description}
"""

This is the ${stage.stage} stage of the Context-as-a-Frontier spine.
Stage question: ${stage.question}

${stage.guidance}

Answer the stage question for THIS specific system.`,
    requiredCapabilities: stage.requiredCapabilities,
    dependsOn: [], // self-contained — stages run in parallel, sequenced at synthesis
    outputFormat: stageOutputFormat(stage),
    _complexity: STAGE_COMPLEXITY,
    _stage: stage.stage,
  }));

  return { tasks, complexity: STAGE_COMPLEXITY };
}

/**
 * Type-aware synthesis system prompt — sequences the six stage analyses into an
 * ordered roadmap. Replaces the Arena blueprint/prototype synthesis for this
 * type only. Output is JSON parsed by handshake.parseSynthesisOutput; the
 * `roadmap` field is threaded through buildDeliverable.
 */
export function buildSpineSynthesisSystem(useCase) {
  return `You are the Synthesis Agent for the Re³ "Context as a Frontier" framework engine.
Six specialist agents have each analyzed one stage of the spine (LOCATE, EXTRACT, RECONSTRUCT, VALIDATE, DECIDE, SUSTAIN) for this system:

"${useCase.title}"
${useCase.description}

Your job is to weave the six stage analyses into ONE sequenced roadmap for applying the framework to THIS system. Do NOT invent stages or reorder them.

Output ONLY valid JSON (no markdown fences, no prose outside the JSON) with this exact structure:

{
  "executive_summary": "2-3 sentences: the single most important thing about applying this framework to this system.",
  "roadmap": [
    {
      "stage": "LOCATE",
      "objective": "One sentence: what this stage achieves for this system.",
      "actions": ["Concrete, ordered step tailored to their stack", "..."],
      "tools": ["Specific tool/approach for this system", "..."]
    }
    // ... one entry per stage, in spine order: LOCATE, EXTRACT, RECONSTRUCT, VALIDATE, DECIDE, SUSTAIN
  ],
  "full_report": "A markdown narrative that reads as a sequenced plan across the six stages. Use \\n for newlines."
}

Rules:
- The roadmap array MUST have exactly six entries, in spine order.
- Ground every action and tool in what the agents found about THIS system — no generic boilerplate.
- Do NOT include code, Mermaid diagrams, or prototype components.`;
}
