// Multi-provider LLM router
// Routes API calls to the correct provider based on agent.model

export async function callLLM(model, systemPrompt, userMessage, opts = {}) {
  const timeout = opts.timeout || 30000;
  const maxTokens = opts.maxTokens || 1500;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    switch (model) {
      case "openai":
        return await callOpenAI(systemPrompt, userMessage, maxTokens, controller.signal);
      case "gemini":
        return await callGemini(systemPrompt, userMessage, maxTokens, controller.signal);
      case "llama":
        return await callGroq(systemPrompt, userMessage, maxTokens, controller.signal);
      case "anthropic":
      default:
        return await callAnthropic(systemPrompt, userMessage, maxTokens, controller.signal);
    }
  } catch (e) {
    if (e.name === "AbortError") throw new Error(`Timeout after ${timeout / 1000}s`);
    // Fallback to Anthropic if the chosen provider fails and it wasn't already Anthropic
    if (model !== "anthropic" && process.env.ANTHROPIC_API_KEY) {
      console.warn(`${model} failed, falling back to Anthropic: ${e.message}`);
      return await callAnthropic(systemPrompt, userMessage, maxTokens, null);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(system, user, maxTokens, signal) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callOpenAI(system, user, maxTokens, signal) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: maxTokens, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(system, user, maxTokens, signal) {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) throw new Error("GOOGLE_GEMINI_API_KEY not set");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(system, user, maxTokens, signal) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "llama-3.1-70b-versatile", max_tokens: maxTokens, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Call LLM with automatic retry on failure.
 * @param {string} model - Provider name
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {object} opts - { maxTokens, timeout, retries: 2 }
 * @returns {Promise<string>}
 */
export async function callLLMWithRetry(model, systemPrompt, userMessage, opts = {}) {
  const retries = opts.retries ?? 2;
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await callLLM(model, systemPrompt, userMessage, opts);
    } catch (e) {
      lastError = e;
      if (i < retries) {
        console.warn(`LLM call attempt ${i + 1} failed (${e.message}), retrying in ${(i + 1)}s...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}
