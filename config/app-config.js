// Centralized application configuration
// Move hardcoded values here to make them easy to change.

export const APP_CONFIG = {
  // Site identity
  siteName: "Re\u00B3",
  siteUrl: "https://re3.live",
  tagline: "Rethink \u00B7 Rediscover \u00B7 Reinvent",
  description: "Where human intuition meets machine foresight.",
  adminEmail: "nitesh4learning@gmail.com",

  // Design tokens (Governance Interaction Mesh)
  colors: {
    primary: "#9333EA",
    rethink: "#3B6B9B",
    rediscover: "#E8734A",
    reinvent: "#2D8A6E",
    text: "#111827",
    textMuted: "#6B7280",
    textFaint: "#9CA3AF",
    bg: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
  },

  // Content limits
  limits: {
    paragraphPreviewLength: 180,
    titleMaxLength: 120,
    commentMaxLength: 2000,
    maxDebateRounds: 3,
    maxDebaters: 5,
    topicSuggestionsPerRound: 5,
  },

  // LLM defaults
  llm: {
    defaultModel: "anthropic",
    defaultTimeout: 30000,
    defaultMaxTokens: 1500,
    retryAttempts: 2,
    retryDelayMs: 1000,
  },

  // Rate limiting (per user per minute)
  rateLimit: {
    llmRequestsPerMinute: 10,
    windowMs: 60000,
  },

  // Persistence keys (localStorage)
  storageKeys: {
    user: "user",
    content: "content_v5",
    themes: "themes",
    articles: "articles_v1",
    agents: "agents_v1",
    projects: "projects_v1",
    forgeSessions: "forge_sessions_v1",
  },
};

export default APP_CONFIG;
