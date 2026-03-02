import { describe, it, expect, vi } from "vitest";
import { parseLLMResponse } from "../../lib/llm-parse.js";
import { z } from "zod";

describe("parseLLMResponse", () => {
  // === Empty / non-string input ===
  it("returns error for null input", () => {
    const { data, error } = parseLLMResponse(null);
    expect(data).toBeNull();
    expect(error).toBe("Empty or non-string response");
  });

  it("returns error for undefined input", () => {
    const { data, error } = parseLLMResponse(undefined);
    expect(data).toBeNull();
    expect(error).toBe("Empty or non-string response");
  });

  it("returns error for empty string", () => {
    const { data, error } = parseLLMResponse("");
    expect(data).toBeNull();
    expect(error).toBe("Empty or non-string response");
  });

  it("returns error for non-string input (number)", () => {
    const { data, error } = parseLLMResponse(42);
    expect(data).toBeNull();
    expect(error).toBe("Empty or non-string response");
  });

  it("returns error for non-string input (object)", () => {
    const { data, error } = parseLLMResponse({});
    expect(data).toBeNull();
    expect(error).toBe("Empty or non-string response");
  });

  // === Strategy A: ```json code blocks ===
  it("extracts JSON from ```json code block", () => {
    const text = 'Here is the result:\n```json\n{"name": "test", "value": 42}\n```\nDone.';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ name: "test", value: 42 });
  });

  it("handles ```json block with extra whitespace", () => {
    const text = '```json\n\n  {"key": "val"}\n\n```';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ key: "val" });
  });

  // === Strategy B: Generic code blocks ===
  it("extracts JSON from plain ``` code block", () => {
    const text = 'Result:\n```\n{"title": "hello"}\n```';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ title: "hello" });
  });

  // === Strategy C: Raw braces ===
  it("extracts JSON from raw text without code blocks", () => {
    const text = 'The answer is {"score": 95, "grade": "A"} as expected.';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ score: 95, grade: "A" });
  });

  // === Nested code blocks in JSON values ===
  it("handles embedded code blocks inside JSON string values", () => {
    const text = '```json\n{"code": "```python\\nprint(1)\\n```", "name": "test"}\n```';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toHaveProperty("name", "test");
  });

  // === LLM JSON error fixing ===
  it("fixes trailing commas in objects", () => {
    const text = '{"a": 1, "b": 2,}';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ a: 1, b: 2 });
  });

  it("fixes trailing commas in arrays", () => {
    const text = '{"items": [1, 2, 3,]}';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ items: [1, 2, 3] });
  });

  it("fixes single quotes to double quotes", () => {
    const text = "{'name': 'test', 'value': 42}";
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ name: "test", value: 42 });
  });

  it("fixes unquoted keys", () => {
    const text = '{name: "test", value: 42}';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ name: "test", value: 42 });
  });

  // === No JSON found ===
  it("returns error when no JSON is present", () => {
    const text = "This is just a plain text response with no JSON at all.";
    const { data, error } = parseLLMResponse(text);
    expect(data).toBeNull();
    expect(error).toBe("No JSON found in response");
  });

  // === Complex / nested JSON ===
  it("handles nested objects", () => {
    const text = '```json\n{"outer": {"inner": {"deep": true}}, "list": [1, 2]}\n```';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data.outer.inner.deep).toBe(true);
    expect(data.list).toEqual([1, 2]);
  });

  it("handles arrays at top level inside object", () => {
    const text = '{"agents": [{"id": "a1", "name": "Ada"}, {"id": "a2", "name": "Sage"}]}';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data.agents).toHaveLength(2);
    expect(data.agents[0].name).toBe("Ada");
  });

  // === Zod schema validation ===
  it("validates against a Zod schema and returns parsed data", () => {
    const schema = z.object({ name: z.string(), score: z.number() });
    const text = '{"name": "test", "score": 95}';
    const { data, error } = parseLLMResponse(text, schema);
    expect(error).toBeNull();
    expect(data).toEqual({ name: "test", score: 95 });
  });

  it("warns but still returns data when Zod validation fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const schema = z.object({ name: z.string(), score: z.number() });
    const text = '{"name": "test", "score": "not-a-number"}';
    const { data, error } = parseLLMResponse(text, schema);
    // Non-blocking: returns data even with validation mismatch
    expect(error).toBeNull();
    expect(data).toHaveProperty("name", "test");
    expect(warnSpy).toHaveBeenCalledWith(
      "LLM response validation warning:",
      expect.stringContaining("score")
    );
    warnSpy.mockRestore();
  });

  it("strips extra fields via Zod schema", () => {
    const schema = z.object({ name: z.string() });
    const text = '{"name": "test", "extra": "ignored"}';
    const { data, error } = parseLLMResponse(text, schema);
    expect(error).toBeNull();
    // Zod strip mode: extra fields removed
    expect(data).toEqual({ name: "test" });
  });

  // === Multiline / realistic LLM responses ===
  it("handles typical LLM verbose response with JSON embedded", () => {
    const text = `Sure! Here's the analysis:

\`\`\`json
{
  "on_topic": true,
  "intervention": null,
  "missing_perspectives": ["economic impact", "ethical concerns"]
}
\`\`\`

Let me know if you need anything else!`;
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data.on_topic).toBe(true);
    expect(data.missing_perspectives).toHaveLength(2);
  });

  it("prefers ```json block over raw braces when both exist", () => {
    const text = 'Preamble {"wrong": true}\n```json\n{"correct": true}\n```\nMore text {"also_wrong": true}';
    const { data, error } = parseLLMResponse(text);
    expect(error).toBeNull();
    expect(data).toEqual({ correct: true });
  });
});
