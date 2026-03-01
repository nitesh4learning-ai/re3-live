// Input sanitization for LLM prompts — prevents basic prompt injection attacks.
// Strips control sequences and common injection patterns from user-supplied text
// before it is interpolated into LLM system/user prompts.

const INJECTION_PATTERNS = [
  /\bignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /\byou\s+are\s+now\b/gi,
  /\bsystem\s*:\s*/gi,
  /\bassistant\s*:\s*/gi,
  /\b(act|behave|pretend)\s+as\b/gi,
  /\bdo\s+not\s+follow\s+(any|the)\s+(previous|above)/gi,
  /\bnew\s+instructions?\s*:/gi,
  /\boverride\s+(all\s+)?(instructions?|rules?)/gi,
  /\bforget\s+(all\s+)?(previous|above|prior)/gi,
];

/**
 * Sanitize user-supplied text before interpolating into LLM prompts.
 * - Strips known prompt injection phrases
 * - Removes ASCII control characters (except newlines and tabs)
 * - Truncates to maxLength
 *
 * @param {string} text - Raw user input
 * @param {number} [maxLength=50000] - Maximum allowed length
 * @returns {string} Sanitized text
 */
export function sanitizeForLLM(text, maxLength = 50000) {
  if (!text || typeof text !== "string") return "";

  let clean = text;

  // Remove ASCII control characters except \n \r \t
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Strip known injection patterns (replace with empty string)
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, "[filtered]");
  }

  // Truncate
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean;
}

/**
 * Sanitize a short text field (titles, names, IDs).
 * Stricter: no newlines, shorter limit.
 */
export function sanitizeShort(text, maxLength = 500) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\x00-\x1F\x7F]/g, " ")  // Replace all control chars with space
    .replace(/\s+/g, " ")               // Collapse whitespace
    .trim()
    .slice(0, maxLength);
}
