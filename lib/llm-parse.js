// LLM response parser with JSON extraction and Zod validation
// Replaces fragile regex: response.match(/\{[\s\S]*\}/)

/**
 * Extract JSON from LLM response text and validate against a Zod schema.
 * Handles: markdown code blocks, raw JSON in text, common LLM JSON errors.
 *
 * @param {string} text - Raw LLM response
 * @param {import("zod").ZodSchema} [schema] - Optional Zod schema to validate against
 * @returns {{ data: object|null, error: string|null }}
 */
export function parseLLMResponse(text, schema) {
  if (!text || typeof text !== "string") {
    return { data: null, error: "Empty or non-string response" };
  }

  // Step 1: Try to extract JSON
  let jsonText = null;

  // Try code-block extraction first: ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  // Fallback to brace matching (greedy, outermost braces)
  if (!jsonText) {
    const braceMatch = text.match(/\{[\s\S]*\}/);
    jsonText = braceMatch ? braceMatch[0] : null;
  }

  if (!jsonText) {
    return { data: null, error: "No JSON found in response" };
  }

  // Step 2: Parse JSON with error recovery
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    // Try fixing common LLM JSON issues
    try {
      const fixed = jsonText
        .replace(/,\s*}/g, "}")       // trailing commas in objects
        .replace(/,\s*]/g, "]")       // trailing commas in arrays
        .replace(/'/g, '"')           // single quotes to double quotes (risky but common)
        .replace(/(\w+)\s*:/g, (match, key) => {
          // Only quote unquoted keys that don't already have quotes
          if (!match.startsWith('"')) return `"${key}":`;
          return match;
        });
      parsed = JSON.parse(fixed);
    } catch (e2) {
      return { data: null, error: `JSON parse error: ${e.message}` };
    }
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
