// Zod schemas for all LLM response formats across API routes
import { z } from "zod";

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
    rethink_angle: z.string().optional().default(""),
    rediscover_angle: z.string().optional().default(""),
    reinvent_angle: z.string().optional().default(""),
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
  rethink_angle: z.string().optional().default(""),
  rediscover_angle: z.string().optional().default(""),
  reinvent_angle: z.string().optional().default(""),
});

// Used by: /api/cycle/generate (rethink step)
export const CycleRethinkSchema = z.object({
  title: z.string(),
  tldr: z.string().optional().default(""),
  paragraphs: z.array(z.string()).min(1),
  open_questions: z.array(z.string()).optional().default([]),
  bridge_sentence: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  artifact: z.any().optional(),
});

// Used by: /api/cycle/generate (rediscover step)
export const CycleRediscoverSchema = z.object({
  title: z.string(),
  tldr: z.string().optional().default(""),
  paragraphs: z.array(z.string()).min(1),
  patterns: z.array(z.any()).optional().default([]),
  synthesis_principle: z.string().optional().default(""),
  bridge_sentence: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  artifact: z.any().optional(),
});

// Used by: /api/cycle/generate (reinvent step)
export const CycleReinventSchema = z.object({
  title: z.string(),
  tldr: z.string().optional().default(""),
  paragraphs: z.array(z.string()).min(1),
  architecture_components: z.array(z.string()).optional().default([]),
  open_thread: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  artifact: z.any().optional(),
});
