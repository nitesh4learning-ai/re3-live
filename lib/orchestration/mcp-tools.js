// MCP Tools — External data access for orchestration agents.
// Provides a simple tool registry where agents can access external context
// during task execution. Tools are invoked based on task requirements.
//
// Built-in tools:
// - fetch_url: Fetches and extracts text content from URLs
// - web_context: Extracts URLs from use case description for auto-enrichment

/**
 * Tool registry — maps tool names to handler functions.
 */
const _tools = new Map();

/**
 * Register a new tool.
 * @param {string} name - Tool identifier
 * @param {object} config - { description, handler: async (params) => string }
 */
export function registerTool(name, config) {
  _tools.set(name, config);
}

/**
 * List all registered tools.
 */
export function listTools() {
  return Array.from(_tools.entries()).map(([name, config]) => ({
    name,
    description: config.description,
  }));
}

/**
 * Invoke a tool by name.
 * @param {string} name - Tool name
 * @param {object} params - Tool-specific parameters
 * @returns {Promise<string|null>} Tool output or null if not found
 */
export async function invokeTool(name, params = {}) {
  const tool = _tools.get(name);
  if (!tool) return null;
  try {
    return await tool.handler(params);
  } catch (err) {
    return `[Tool error: ${err.message}]`;
  }
}

// ── Built-in tools ──────────────────────────────────────────────────────

/**
 * URL regex for extracting links from text.
 */
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

/**
 * Extract URLs from a text string.
 */
export function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  // Deduplicate and limit to 3 URLs to keep costs down
  return [...new Set(matches)].slice(0, 3);
}

/**
 * Fetch and extract text from a URL.
 * Server-side only — uses native fetch.
 * Returns a truncated text summary suitable for LLM context.
 */
async function fetchUrlContent(url, maxChars = 2000) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Re3-Orchestration/1.0",
        "Accept": "text/html,text/plain,application/json",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return `[Failed to fetch ${url}: HTTP ${res.status}]`;
    }

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (contentType.includes("application/json")) {
      // JSON — pretty-print and truncate
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        return formatted.slice(0, maxChars);
      } catch {
        return text.slice(0, maxChars);
      }
    }

    // HTML — strip tags for a rough text extraction
    if (contentType.includes("text/html")) {
      const stripped = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return stripped.slice(0, maxChars);
    }

    // Plain text
    return text.slice(0, maxChars);
  } catch (err) {
    if (err.name === "AbortError") {
      return `[Timeout fetching ${url}]`;
    }
    return `[Error fetching ${url}: ${err.message}]`;
  }
}

// Register built-in tools
registerTool("fetch_url", {
  description: "Fetch and extract text content from a URL",
  handler: async ({ url, maxChars }) => fetchUrlContent(url, maxChars),
});

registerTool("fetch_urls", {
  description: "Fetch multiple URLs in parallel and return combined context",
  handler: async ({ urls, maxCharsPerUrl = 1500 }) => {
    if (!urls?.length) return "No URLs provided.";
    const results = await Promise.allSettled(
      urls.map((url) => fetchUrlContent(url, maxCharsPerUrl))
    );
    return results
      .map((r, i) => {
        const content = r.status === "fulfilled" ? r.value : `[Failed: ${r.reason}]`;
        return `### ${urls[i]}\n${content}`;
      })
      .join("\n\n---\n\n");
  },
});

/**
 * Enrich a task's context with external data.
 * Extracts URLs from the use case description and fetches their content.
 * Returns enrichment text to inject into the agent's prompt, or null if no URLs found.
 *
 * @param {object} useCase - { title, description, type }
 * @param {object} task - Task definition
 * @returns {Promise<string|null>} External context or null
 */
export async function enrichTaskContext(useCase, task) {
  // Extract URLs from both the use case description and task description
  const urls = extractUrls(`${useCase.description} ${task.description}`);
  if (urls.length === 0) return null;

  const result = await invokeTool("fetch_urls", {
    urls,
    maxCharsPerUrl: 1500,
  });

  if (!result || result === "No URLs provided.") return null;

  return `EXTERNAL CONTEXT (auto-fetched from URLs in the brief):\n\n${result}`;
}
