// Distributed rate limiting for Re³ API routes.
// Uses Upstash Redis when configured (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN),
// falls back to in-memory sliding window for local dev / missing config.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ==================== UPSTASH REDIS RATE LIMITER ====================

let _redisLimiter = null;

function getRedisLimiter() {
  if (_redisLimiter !== undefined) return _redisLimiter;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      _redisLimiter = new Ratelimit({
        redis,
        // 10 requests per 60 seconds, sliding window
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "re3:ratelimit",
      });
      return _redisLimiter;
    }
  } catch (e) {
    console.warn("Upstash Redis rate limiter init failed, using in-memory fallback:", e.message);
  }
  _redisLimiter = null;
  return null;
}

// ==================== IN-MEMORY FALLBACK ====================

const GLOBAL_KEY = "__re3_rate_limit_windows__";
if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = new Map();
}
const windows = globalThis[GLOBAL_KEY];

function createInMemoryLimiter({ windowMs = 60000, maxRequests = 20 } = {}) {
  return {
    check(identifier) {
      const now = Date.now();
      const key = identifier || "anonymous";
      if (!windows.has(key)) windows.set(key, []);
      const timestamps = windows.get(key);
      const cutoff = now - windowMs;
      while (timestamps.length > 0 && timestamps[0] <= cutoff) timestamps.shift();
      if (timestamps.length >= maxRequests) return { allowed: false, remaining: 0 };
      timestamps.push(now);
      return { allowed: true, remaining: maxRequests - timestamps.length };
    },
  };
}

const inMemoryFallback = createInMemoryLimiter({ windowMs: 60000, maxRequests: 10 });

// ==================== UNIFIED RATE LIMITER ====================

export const llmRateLimit = {
  async check(identifier) {
    const redis = getRedisLimiter();
    if (redis) {
      try {
        const { success, remaining } = await redis.limit(identifier || "anonymous");
        return { allowed: success, remaining };
      } catch (e) {
        // Redis unreachable — fall through to in-memory
        console.warn("Redis rate limit check failed, using fallback:", e.message);
      }
    }
    return inMemoryFallback.check(identifier);
  },
};

// Backward-compatible sync wrapper — API routes that call llmRateLimit.check()
// synchronously still work (returns a thenable that resolves to the check result).
// Routes should migrate to `await llmRateLimit.check(uid)` for full Redis support.
export function createRateLimiter(opts) {
  return createInMemoryLimiter(opts);
}

// ==================== CLEANUP ====================
if (typeof globalThis !== "undefined" && typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  const CLEANUP_KEY = "__re3_rate_limit_cleanup__";
  if (!globalThis[CLEANUP_KEY]) {
    const _cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of windows.entries()) {
        if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - 300000) {
          windows.delete(key);
        }
      }
    }, 300000);
    if (_cleanup.unref) _cleanup.unref();
    globalThis[CLEANUP_KEY] = true;
  }
}
