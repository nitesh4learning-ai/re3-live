// Simple in-memory sliding window rate limiter
// Per-instance on Vercel serverless — sufficient for alpha stage

const windows = new Map();

/**
 * Create a rate limiter with configurable window and max requests.
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.maxRequests - Max requests per window per identifier (default: 20)
 * @returns {{ check: (identifier: string) => { allowed: boolean, remaining: number } }}
 */
export function createRateLimiter({ windowMs = 60000, maxRequests = 20 } = {}) {
  return {
    check(identifier) {
      const now = Date.now();
      const key = identifier || "anonymous";

      if (!windows.has(key)) {
        windows.set(key, []);
      }

      const timestamps = windows.get(key);

      // Remove expired timestamps
      const cutoff = now - windowMs;
      while (timestamps.length > 0 && timestamps[0] <= cutoff) {
        timestamps.shift();
      }

      if (timestamps.length >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      timestamps.push(now);
      return { allowed: true, remaining: maxRequests - timestamps.length };
    },
  };
}

// Pre-configured rate limiter for LLM API routes: 10 requests per minute per user
export const llmRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 10 });

// Cleanup stale entries every 5 minutes to prevent memory leaks
// Only start in runtime (not during build)
if (typeof globalThis !== "undefined" && typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  const _cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of windows.entries()) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - 300000) {
        windows.delete(key);
      }
    }
  }, 300000);
  // Prevent keeping the process alive in serverless
  if (_cleanup.unref) _cleanup.unref();
}
