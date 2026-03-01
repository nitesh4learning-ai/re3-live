import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "../../lib/rate-limit.js";

describe("createRateLimiter", () => {
  let limiter;

  beforeEach(() => {
    limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3 });
  });

  it("allows requests within the limit", () => {
    const r1 = limiter.check("user1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check("user1");
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check("user1");
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    limiter.check("user1");
    limiter.check("user1");
    limiter.check("user1");

    const r4 = limiter.check("user1");
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("tracks different identifiers separately", () => {
    limiter.check("user1");
    limiter.check("user1");
    limiter.check("user1");

    // user1 is maxed out
    expect(limiter.check("user1").allowed).toBe(false);

    // user2 should still be allowed
    const r = limiter.check("user2");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("uses 'anonymous' for empty/falsy identifiers", () => {
    limiter.check("");
    limiter.check(null);
    limiter.check(undefined);

    // All 3 counted as "anonymous" → should be at limit
    const r = limiter.check("");
    expect(r.allowed).toBe(false);
  });

  it("uses default maxRequests of 20 when not specified", () => {
    const defaultLimiter = createRateLimiter();
    for (let i = 0; i < 20; i++) {
      expect(defaultLimiter.check("test").allowed).toBe(true);
    }
    expect(defaultLimiter.check("test").allowed).toBe(false);
  });

  it("expires old timestamps outside the window", () => {
    // Create a limiter with a very short window
    const shortLimiter = createRateLimiter({ windowMs: 50, maxRequests: 2 });

    shortLimiter.check("user1");
    shortLimiter.check("user1");
    expect(shortLimiter.check("user1").allowed).toBe(false);

    // Wait for the window to expire
    return new Promise((resolve) => {
      setTimeout(() => {
        const r = shortLimiter.check("user1");
        expect(r.allowed).toBe(true);
        resolve();
      }, 60);
    });
  });

  it("returns correct remaining count", () => {
    const limiter5 = createRateLimiter({ windowMs: 60000, maxRequests: 5 });

    expect(limiter5.check("u").remaining).toBe(4);
    expect(limiter5.check("u").remaining).toBe(3);
    expect(limiter5.check("u").remaining).toBe(2);
    expect(limiter5.check("u").remaining).toBe(1);
    expect(limiter5.check("u").remaining).toBe(0);
    expect(limiter5.check("u").remaining).toBe(0); // blocked
  });
});
