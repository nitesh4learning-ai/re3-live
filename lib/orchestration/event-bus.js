// Event Bus — Structured event system for orchestration lifecycle.
// Emits typed, annotated events for real-time UI and educational timeline.
// Phase 2+: Register new event types (a2a.requested, reflection.started, etc.)

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
    "An agent task failed. The orchestrator continues with remaining tasks — partial results are still synthesized. Phase 2 adds reflection loops for automatic retry with self-correction.",

  "layer.complete":
    "Execution layer finished. All parallel tasks resolved. The Blackboard now holds their outputs, available as curated context for subsequent layers.",

  "phase.synthesize.start":
    "The Synthesis Agent (always Anthropic Claude — strongest model) reads ALL completed task outputs and weaves them into a single coherent deliverable. This is the 'conquer' step of the pipeline.",

  "phase.synthesize.complete":
    "Synthesis complete. The deliverable integrates all agent perspectives into a structured document with executive summary, analysis, and recommendations.",

  "phase.complete":
    "Full pipeline finished: intake → decompose → assemble → execute → synthesize → deliver. All cost and performance metrics are finalized.",

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

// Registry for Phase 2+ custom event types.
const _customAnnotations = {};

/**
 * Register a new event type with an educational annotation.
 * Phase 2+: call this when adding A2A, reflection, MCP, etc.
 * @param {string} type - e.g., "a2a.requested"
 * @param {string} annotation - Educational explanation
 */
export function registerEventType(type, annotation) {
  _customAnnotations[type] = annotation;
}
