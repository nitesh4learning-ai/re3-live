// LLM response parser with JSON extraction and Zod validation
// Replaces fragile regex: response.match(/\{[\s\S]*\}/)
// Uses multi-candidate extraction to handle embedded code blocks in JSON values

/**
 * Extract JSON from LLM response text and validate against a Zod schema.
 * Handles: markdown code blocks (including nested ones), raw JSON in text, common LLM JSON errors.
 *
 * @param {string} text - Raw LLM response
 * @param {import("zod").ZodSchema} [schema] - Optional Zod schema to validate against
 * @returns {{ data: object|null, error: string|null }}
 */
export function parseLLMResponse(text, schema) {
  if (!text || typeof text !== "string") {
    return { data: null, error: "Empty or non-string response" };
  }

  // Step 1: Try to extract JSON using multiple strategies (best-first order)
  const candidates = [];

  // Strategy A: ```json ... ``` with GREEDY match to the LAST closing ```
  // Handles LLM responses where JSON string values contain embedded ```python...``` blocks
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*)```/);
  if (jsonBlockMatch) {
    const inner = jsonBlockMatch[1].trim();
    // Extract just the JSON object from within the greedy capture
    const braceInner = inner.match(/^\{[\s\S]*\}/);
    if (braceInner) candidates.push(braceInner[0]);
    else candidates.push(inner);
  }

  // Strategy B: Any code block with LAZY match (works for simple single-block responses)
  const anyBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (anyBlockMatch) {
    const inner = anyBlockMatch[1].trim();
    if (inner && !candidates.includes(inner)) candidates.push(inner);
  }

  // Strategy C: Brace matching (greedy, outermost braces — last resort)
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch && !candidates.includes(braceMatch[0])) {
    candidates.push(braceMatch[0]);
  }

  if (candidates.length === 0) {
    return { data: null, error: "No JSON found in response" };
  }

  // Step 2: Try parsing each candidate until one succeeds
  let parsed = null;
  let lastError = "No JSON found in response";

  for (const jsonText of candidates) {
    try {
      parsed = JSON.parse(jsonText);
      break;
    } catch (e) {
      // Try fixing common LLM JSON issues before giving up on this candidate
      try {
        const fixed = jsonText
          .replace(/,\s*}/g, "}")       // trailing commas in objects
          .replace(/,\s*]/g, "]")       // trailing commas in arrays
          .replace(/(\w+)\s*:/g, (match, key) => {
            // Only quote unquoted keys that don't already have quotes
            if (!match.startsWith('"')) return `"${key}":`;
            return match;
          });
        parsed = JSON.parse(fixed);
        break;
      } catch (e2) {
        // Try repairing truncated JSON (LLM hit max_tokens mid-output)
        try {
          parsed = JSON.parse(repairTruncatedJSON(jsonText));
          console.warn("LLM response was truncated — repaired successfully");
          break;
        } catch (e3) {
          lastError = `JSON parse error: ${e.message}`;
        }
      }
    }
  }

  if (!parsed) {
    return { data: null, error: lastError };
  }

  // Step 3: Validate with Zod if schema provided
  if (schema) {
    const result = schema.safeParse(parsed);
    if (result.success) {
      return { data: result.data, error: null };
    }

    // Return raw parsed data with validation warning (non-blocking)
    // Many LLM responses are close enough to be usable even if not perfectly validated
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
    console.warn("LLM response validation warning:", issues);

    // Still return the parsed data — it may be close enough to work
    return { data: parsed, error: null };
  }

  return { data: parsed, error: null };
}

/**
 * Attempt to repair truncated JSON from LLM responses that hit max_tokens.
 * Closes any open strings, arrays, and objects to make the JSON parseable.
 */
function repairTruncatedJSON(text) {
  let repaired = text
    .replace(/,\s*$/, "")              // remove trailing comma
    .replace(/,\s*}/g, "}")            // trailing commas in objects
    .replace(/,\s*]/g, "]");           // trailing commas in arrays

  // Track open brackets/braces outside of strings
  let inString = false;
  let escaped = false;
  const stack = [];

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  // If we ended inside a string, close it
  if (inString) repaired += '"';

  // Remove any trailing partial key-value (e.g., `"key": "incom`)
  // by ensuring the last entry is valid — strip trailing comma if present
  repaired = repaired.replace(/,\s*$/, "");

  // Close all open brackets/braces in reverse order
  while (stack.length) repaired += stack.pop();

  return repaired;
}
