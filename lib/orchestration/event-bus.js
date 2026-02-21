// Event Bus — Structured event system for orchestration lifecycle.
// Emits typed, annotated events for real-time UI and educational timeline.
// Phase 2: Includes reflection, A2A, and MCP event types.

// Educational annotations explain WHY each architectural step happens.
const ANNOTATIONS = {
  "phase.intake":
    "The system validates your use case against guardrails — checking title length, description quality, and complexity thresholds before committing any LLM resources.",

  "phase.decompose.start":
    "Task decomposition uses a cheaper model (Gemini) to break your use case into 3-6 sub-tasks with dependency relationships. This is the 'divide' step of divide-and-conquer orchestration.",

  "phase.decompose.complete":
    "The decomposer produced a task dependency graph. Tasks with no dependencies form Layer 1 and run in parallel. Tasks that depend on others wait in later layers — this is topological sorting.",

  "phase.assemble.start":
    "The scoring engine evaluates all 1,000 agents using a composite formula: capability match (60%) + cognitive diversity (30%) - cost penalty (10%). It picks the optimal team for your use case type.",

  "phase.assemble.complete":
    "Team assembled via greedy optimization — for each task, the best-fit unassigned agent is selected based on required capabilities. Agents with multiple strengths may handle more than one task.",

  "phase.execute.start":
    "The workflow engine executes tasks layer-by-layer. Within each layer, tasks run in parallel (Promise.allSettled). Between layers, execution is sequential so later tasks can read earlier outputs from the Blackboard.",

  "layer.start":
    "Starting a new execution layer. All tasks here have their dependencies satisfied, so they run simultaneously — this is the parallel execution pattern that maximizes throughput while respecting the dependency graph.",

  "task.start":
    "An agent begins work. It receives: (1) a System Preamble with shared team identity, (2) curated upstream context from dependencies only (max 1500 chars each — cost-conscious), and (3) its specific task instructions.",

  "task.complete":
    "The agent wrote its output to the Blackboard — the shared working memory. Downstream tasks in later layers can now read this as context. The AI Gateway tracked token usage and cost for budget accounting.",

  "task.failed":
    "An agent task failed. The reflection system will attempt a self-correction retry with a diagnostic prompt. If reflection also fails, the orchestrator continues with remaining tasks.",

  "layer.complete":
    "Execution layer finished. All parallel tasks resolved. The Blackboard now holds their outputs, available as curated context for subsequent layers.",

  // Reflection events
  "reflection.start":
    "Self-correction activated: the failed agent receives a diagnostic prompt including the error message and instructions to try a different approach. This is reflection — the agent learns from its own failure.",

  "reflection.success":
    "Reflection succeeded — the agent self-corrected and produced a valid output on retry. The Blackboard has been updated with the recovered output.",

  "reflection.failed":
    "Reflection also failed — the agent could not recover. The original failure stands. Partial results from other agents will still be synthesized.",

  "reflection.skipped":
    "Reflection was skipped because the remaining token budget is too low. The system prioritizes completing the pipeline over retrying individual tasks.",

  // A2A events
  "a2a.start":
    "Cross-pollination round: each agent can now see ALL peer outputs (not just upstream dependencies). They'll refine their work by integrating insights from teammates — this creates richer, more interconnected results.",

  "a2a.refine.start":
    "An agent is refining its output based on peer work. It will incorporate relevant insights, resolve contradictions, and add cross-references to strengthen the overall deliverable.",

  "a2a.refine.complete":
    "Agent refined its output with peer insights. The Blackboard entry has been overwritten with the enhanced version — synthesis will use this improved output.",

  "a2a.refine.failed":
    "A2A refinement failed for this agent. The original output is preserved — this is non-fatal.",

  "a2a.complete":
    "Cross-pollination round finished. Agents have integrated peer insights into their outputs, creating more cohesive results for the synthesis agent.",

  "a2a.skipped":
    "Cross-pollination was skipped — either insufficient completed tasks or budget too low. The synthesis agent will work with the original outputs.",

  // MCP events
  "mcp.enrich.start":
    "External data enrichment: the system detected URLs in the use case brief and is fetching them to provide real-world context to agents. This is the MCP (Model Context Protocol) layer.",

  "mcp.enrich.complete":
    "External content fetched and injected into agent context. Agents will have access to real data from the referenced URLs, grounding their analysis in actual sources.",

  "mcp.enrich.failed":
    "External data fetch failed — agents will work without URL context. This is non-fatal; the pipeline continues normally.",

  "phase.synthesize.start":
    "The Synthesis Agent (always Anthropic Claude — strongest model) reads ALL completed task outputs and weaves them into a single coherent deliverable. This is the 'conquer' step of the pipeline.",

  "phase.synthesize.complete":
    "Synthesis complete. The deliverable integrates all agent perspectives into a structured document with executive summary, analysis, and recommendations.",

  "phase.complete":
    "Full pipeline finished: intake → decompose → assemble → execute → reflect → cross-pollinate → synthesize → deliver. All cost and performance metrics are finalized.",

  "phase.failed":
    "Orchestration encountered a fatal error. Partial results may be available on the Blackboard for inspection.",
};

let _idCounter = 0;

/**
 * Create a structured orchestration event.
 * @param {string} type - Event type (e.g., "phase.decompose.start", "task.complete")
 * @param {object} data - Event payload
 * @param {string|null} nodeId - Canvas node ID for linked highlighting (e.g., "agent_xyz", "usecase", "synthesis")
 * @returns {object} Event object
 */
export function createEvent(type, data = {}, nodeId = null) {
  return {
    id: `evt_${++_idCounter}_${Date.now()}`,
    type,
    timestamp: Date.now(),
    data,
    annotation: ANNOTATIONS[type] || _customAnnotations[type] || null,
    nodeId,
  };
}

/** Reset counter between runs. */
export function resetEventCounter() {
  _idCounter = 0;
}

/** Get annotation for an event type. */
export function getAnnotation(type) {
  return ANNOTATIONS[type] || _customAnnotations[type] || null;
}

// Registry for custom event types beyond built-in annotations.
const _customAnnotations = {};

/**
 * Register a new event type with an educational annotation.
 * @param {string} type - e.g., "custom.event"
 * @param {string} annotation - Educational explanation
 */
export function registerEventType(type, annotation) {
  _customAnnotations[type] = annotation;
}
