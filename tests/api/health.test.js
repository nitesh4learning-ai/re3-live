import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment variables before importing the route
beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("FIREBASE_PROJECT_ID", "test-project");
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "test-client-key");
});

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const { GET } = await import("../../app/api/health/route.js");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("reports configured keys as 'configured'", async () => {
    const { GET } = await import("../../app/api/health/route.js");
    const response = await GET();
    const body = await response.json();

    expect(body.env.anthropic_key).toBe("configured");
    expect(body.env.firebase_project).toBe("configured");
    expect(body.env.firebase_client).toBe("configured");
  });

  it("reports missing keys as 'MISSING'", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("FIREBASE_PROJECT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");

    // Re-import to pick up new env
    vi.resetModules();
    const { GET } = await import("../../app/api/health/route.js");
    const response = await GET();
    const body = await response.json();

    expect(body.env.anthropic_key).toBe("MISSING");
    expect(body.env.firebase_project).toBe("MISSING");
    expect(body.env.firebase_client).toBe("MISSING");
  });
});
