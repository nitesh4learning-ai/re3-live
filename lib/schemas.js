// Zod schemas for LLM response formats AND API request input validation
import { z } from "zod";

// ==================== REQUEST INPUT SCHEMAS ====================
// Validate incoming request bodies before processing.
// Prevents malformed input, type errors, and excessive payloads.

// Shared sub-schemas
const AgentRefSchema = z.object({
  id: z.string().max(200),
  name: z.string().max(200).optional(),
  persona: z.string().max(5000).optional(),
  model: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  avatar: z.string().max(10).optional(),
  category: z.string().max(100).optional(),
  domain: z.string().max(200).optional(),
  status: z.string().max(50).optional(),
  role: z.string().max(200).optional(),
  capabilities: z.record(z.number()).optional(),
  cognitiveStyle: z.record(z.any()).optional(),
}).passthrough();

const RoundResponseSchema = z.object({
  id: z.string().max(200).optional(),
  name: z.string().max(200).optional(),
  response: z.string().max(10000).nullable().optional(),
}).passthrough();

// /api/debate/select
export const SelectInputSchema = z.object({
  articleTitle: z.string().min(1).max(500),
  articleText: z.string().min(1).max(50000),
  agents: z.array(AgentRefSchema).min(1).max(200),
  forgePersona: z.string().max(5000).optional(),
  activityType: z.enum(["debate", "ideate", "implement"]).optional(),
});

// /api/debate/round
export const RoundInputSchema = z.object({
  articleTitle: z.string().min(1).max(500),
  articleText: z.string().min(1).max(50000),
  agents: z.array(AgentRefSchema).min(1).max(10),
  roundNumber: z.number().int().min(1).max(5),
  previousRounds: z.array(z.array(RoundResponseSchema)).optional().default([]),
  pillarNames: z.array(z.string().max(100)).optional(),
});

// /api/debate/moderate
export const ModerateInputSchema = z.object({
  articleTitle: z.string().min(1).max(500),
  rounds: z.array(z.array(RoundResponseSchema)).min(1),
  atlasPersona: z.string().max(5000).optional(),
});

// /api/debate/loom
export const LoomInputSchema = z.object({
  articleTitle: z.string().min(1).max(500),
  articleText: z.string().min(1).max(50000),
  rounds: z.array(z.array(RoundResponseSchema)).min(1),
  atlasNote: z.string().max(2000).optional(),
  forgeRationale: z.string().max(2000).optional(),
  panelNames: z.array(z.string().max(200)).min(1),
  sagePersona: z.string().max(5000).optional(),
  pillarNames: z.array(z.string().max(100)).optional(),
});

// /api/debate/pillars
export const PillarsInputSchema = z.object({
  topic: z.string().min(1).max(500),
  context: z.string().max(5000).optional(),
});

// /api/agents/generate-post
export const GeneratePostInputSchema = z.object({
  agent: z.enum(["sage", "atlas", "forge"]),
  topic: z.object({
    title: z.string().min(1).max(500),
    rationale: z.string().max(2000).optional(),
    rethink_angle: z.string().max(2000).optional(),
    rediscover_angle: z.string().max(2000).optional(),
    reinvent_angle: z.string().max(2000).optional(),
  }).passthrough(),
  context: z.object({
    sagePost: z.string().max(20000).optional(),
    atlasPost: z.string().max(20000).optional(),
  }).optional().default({}),
});

// /api/agents/suggest-topics
export const SuggestTopicsInputSchema = z.object({
  currentTopics: z.array(z.string().max(500)).optional().default([]),
  pastCycles: z.array(z.string().max(500)).optional().default([]),
});

// /api/agents/ideate
export const IdeateInputSchema = z.object({
  topic: z.string().min(1).max(500),
  agents: z.array(AgentRefSchema).min(1).max(15),
  context: z.string().max(10000).optional(),
});

// /api/agents/implement
export const ImplementInputSchema = z.object({
  concept: z.string().min(1).max(500),
  agents: z.array(AgentRefSchema).min(1).max(10),
  priorContext: z.string().max(10000).optional(),
});

// /api/agents/comment
export const CommentInputSchema = z.object({
  postTitle: z.string().min(1).max(500),
  postContent: z.string().max(10000).optional(),
  agentName: z.string().min(1).max(200),
  agentPersona: z.string().min(1).max(5000),
  agentModel: z.string().max(50).optional(),
  originalTopic: z.string().max(500).optional().default(""),
  throughLineQuestion: z.string().max(500).optional().default(""),
});

// /api/cycle/generate
export const CycleGenerateInputSchema = z.object({
  topic: z.object({
    title: z.string().min(1).max(500),
    rationale: z.string().max(2000).optional(),
  }).passthrough(),
  step: z.enum(["through-line", "act_0", "act_1", "act_2"]).optional(),
  previousData: z.object({
    throughLine: z.any().optional(),
    sage: z.any().optional(),
    atlas: z.any().optional(),
  }).optional(),
});

// /api/academy/review
export const AcademyReviewInputSchema = z.object({
  courseId: z.string().min(1).max(200),
  courseTitle: z.string().min(1).max(500),
});

// /api/orchestration/run
export const OrchestrationRunInputSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(10000),
  type: z.string().min(1).max(100),
  options: z.object({
    maxAgents: z.number().int().min(1).max(6).optional(),
    tokenBudget: z.number().int().max(30000).optional(),
    costBudget: z.number().max(1.0).optional(),
  }).optional().default({}),
});

// /api/orchestration/analyze
export const OrchestrationAnalyzeInputSchema = z.object({
  title: z.string().max(500).optional().default(""),
  description: z.string().max(10000).optional().default(""),
});

/**
 * Validate a request body against a Zod schema.
 * Returns { data, error, status } — mirrors the auth helper pattern.
 */
export function validateInput(body, schema) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map(i => `${i.path.join(".")}: ${i.message}`)
      .slice(0, 5)
      .join("; ");
    return { data: null, error: `Invalid input: ${issues}`, status: 400 };
  }
  return { data: result.data, error: null, status: 200 };
}

// ==================== LLM RESPONSE SCHEMAS ====================

// Used by: /api/debate/select
export const SelectPanelSchema = z.object({
  selected: z.array(z.string()).min(1),
  rationale: z.string().optional().default(""),
});

// Used by: /api/debate/moderate
export const ModerationSchema = z.object({
  on_topic: z.boolean(),
  intervention: z.string(),
  missing_perspectives: z.string().optional().default(""),
});

// Used by: /api/debate/loom (step 2: clustering into streams)
export const LoomStreamsSchema = z.object({
  streams: z.array(z.object({
    title: z.string(),
    entries: z.array(z.object({
      agent: z.string(),
      round: z.number(),
      excerpt: z.string(),
    })),
  })),
});

// Used by: /api/agents/generate-post
export const GeneratePostSchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional().default([]),
  challenges_seed: z.string().optional().default(""),
});

// Used by: /api/agents/suggest-topics
export const SuggestTopicsSchema = z.object({
  topics: z.array(z.object({
    title: z.string(),
    rationale: z.string(),
    suggested_angles: z.array(z.string()).optional().default([]),
    urgency: z.string().optional().default("medium"),
    predicted_peak: z.string().optional().default(""),
  })),
});

// Used by: /api/agents/ideate (per-agent response)
export const IdeateAgentSchema = z.object({
  ideas: z.array(z.object({
    concept: z.string(),
    rationale: z.string(),
    pillar: z.string().optional().default("rethink"),
    novelty: z.number().optional().default(3),
  })),
});

// Used by: /api/agents/ideate (Hypatia clustering)
export const IdeateClusterSchema = z.object({
  clusters: z.array(z.object({
    theme: z.string(),
    description: z.string(),
    ideaIndices: z.array(z.number()),
    pillar: z.string().optional().default("rethink"),
  })),
});

// Used by: /api/agents/implement (per-agent response)
export const ImplementAgentSchema = z.object({
  component: z.string(),
  approach: z.string(),
  integrations: z.array(z.string()).optional().default([]),
  risks: z.array(z.string()).optional().default([]),
  timelineWeeks: z.number().optional().default(4),
});

// Used by: /api/agents/implement (Hypatia synthesis)
export const ImplementSynthesisSchema = z.object({
  architecture: z.string(),
  sequence: z.array(z.object({
    phase: z.string(),
    components: z.array(z.string()),
    weeks: z.string(),
    description: z.string().optional().default(""),
  })).optional().default([]),
  risks: z.array(z.object({
    risk: z.string(),
    mitigation: z.string(),
    severity: z.string().optional().default("medium"),
  })).optional().default([]),
  totalWeeks: z.number().optional().default(0),
});

// Used by: /api/cycle/generate (through-line step)
export const ThroughLineSchema = z.object({
  through_line_question: z.string(),
  pillars: z.array(z.object({
    label: z.string(),
    tagline: z.string().optional().default(""),
    angle: z.string().optional().default(""),
    structure: z.string().optional().default(""),
  })).min(3).max(4),
  // Kept for backward compat — not used in new code
  rethink_angle: z.string().optional().default(""),
  rediscover_angle: z.string().optional().default(""),
  reinvent_angle: z.string().optional().default(""),
});

// Used by: /api/cycle/generate (all acts — unified schema)
export const CycleActSchema = z.object({
  title: z.string(),
  tldr: z.string().optional().default(""),
  paragraphs: z.array(z.string()).min(1),
  // Generic fields that any pillar might produce
  key_insights: z.array(z.string()).optional().default([]),
  open_questions: z.array(z.string()).optional().default([]),
  bridge_sentence: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  artifact: z.any().optional(),
  // Backward compat fields — optional
  patterns: z.array(z.any()).optional().default([]),
  synthesis_principle: z.string().optional().default(""),
  architecture_components: z.array(z.string()).optional().default([]),
  open_thread: z.string().optional().default(""),
});

// Legacy aliases for backward compatibility with any code that imports the old names
export const CycleRethinkSchema = CycleActSchema;
export const CycleRediscoverSchema = CycleActSchema;
export const CycleReinventSchema = CycleActSchema;
