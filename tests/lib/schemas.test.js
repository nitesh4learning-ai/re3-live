import { describe, it, expect } from "vitest";
import {
  validateInput,
  SelectInputSchema,
  RoundInputSchema,
  CommentInputSchema,
  CycleGenerateInputSchema,
  OrchestrationRunInputSchema,
  ModerateInputSchema,
  LoomInputSchema,
  GeneratePostInputSchema,
  SuggestTopicsInputSchema,
  IdeateInputSchema,
  ImplementInputSchema,
  AcademyReviewInputSchema,
  OrchestrationAnalyzeInputSchema,
  PillarsInputSchema,
} from "../../lib/schemas.js";

describe("validateInput", () => {
  it("returns parsed data for valid input", () => {
    const input = { articleTitle: "Test", articleText: "Content", agents: [{ id: "a1" }] };
    const { data, error, status } = validateInput(input, SelectInputSchema);
    expect(error).toBeNull();
    expect(status).toBe(200);
    expect(data.articleTitle).toBe("Test");
  });

  it("returns 400 for invalid input", () => {
    const { data, error, status } = validateInput({}, SelectInputSchema);
    expect(data).toBeNull();
    expect(status).toBe(400);
    expect(error).toContain("Invalid input");
  });

  it("limits error issues to 5", () => {
    // Pass an object missing many fields to a complex schema
    const { error } = validateInput({}, LoomInputSchema);
    // Count semicolons to see how many issues are reported
    const issueCount = (error.match(/;/g) || []).length + 1;
    expect(issueCount).toBeLessThanOrEqual(5);
  });
});

describe("SelectInputSchema", () => {
  const validInput = {
    articleTitle: "Test Article",
    articleText: "Some article content here.",
    agents: [{ id: "agent_1" }],
  };

  it("accepts valid input", () => {
    const { data, error } = validateInput(validInput, SelectInputSchema);
    expect(error).toBeNull();
    expect(data.articleTitle).toBe("Test Article");
  });

  it("rejects missing articleTitle", () => {
    const { error, status } = validateInput(
      { articleText: "content", agents: [{ id: "a1" }] },
      SelectInputSchema
    );
    expect(status).toBe(400);
    expect(error).toContain("articleTitle");
  });

  it("rejects articleText exceeding 50000 chars", () => {
    const { error, status } = validateInput(
      { articleTitle: "T", articleText: "a".repeat(50001), agents: [{ id: "a1" }] },
      SelectInputSchema
    );
    expect(status).toBe(400);
  });

  it("rejects empty agents array", () => {
    const { error, status } = validateInput(
      { articleTitle: "T", articleText: "text", agents: [] },
      SelectInputSchema
    );
    expect(status).toBe(400);
  });

  it("accepts optional activityType enum", () => {
    const { data, error } = validateInput(
      { ...validInput, activityType: "ideate" },
      SelectInputSchema
    );
    expect(error).toBeNull();
    expect(data.activityType).toBe("ideate");
  });

  it("rejects invalid activityType enum", () => {
    const { error, status } = validateInput(
      { ...validInput, activityType: "invalid" },
      SelectInputSchema
    );
    expect(status).toBe(400);
  });
});

describe("RoundInputSchema", () => {
  const validInput = {
    articleTitle: "Test",
    articleText: "Content",
    agents: [{ id: "a1" }],
    roundNumber: 1,
  };

  it("accepts valid input", () => {
    const { error } = validateInput(validInput, RoundInputSchema);
    expect(error).toBeNull();
  });

  it("rejects roundNumber > 5", () => {
    const { error, status } = validateInput(
      { ...validInput, roundNumber: 6 },
      RoundInputSchema
    );
    expect(status).toBe(400);
  });

  it("rejects roundNumber < 1", () => {
    const { error, status } = validateInput(
      { ...validInput, roundNumber: 0 },
      RoundInputSchema
    );
    expect(status).toBe(400);
  });

  it("rejects non-integer roundNumber", () => {
    const { error, status } = validateInput(
      { ...validInput, roundNumber: 1.5 },
      RoundInputSchema
    );
    expect(status).toBe(400);
  });

  it("rejects more than 10 agents", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => ({ id: `a${i}` }));
    const { error, status } = validateInput(
      { ...validInput, agents: tooMany },
      RoundInputSchema
    );
    expect(status).toBe(400);
  });

  it("defaults previousRounds to empty array", () => {
    const { data } = validateInput(validInput, RoundInputSchema);
    expect(data.previousRounds).toEqual([]);
  });
});

describe("CommentInputSchema", () => {
  it("accepts valid input", () => {
    const { error } = validateInput(
      { postTitle: "Title", agentName: "Sage", agentPersona: "A wise synthesizer" },
      CommentInputSchema
    );
    expect(error).toBeNull();
  });

  it("rejects missing agentName", () => {
    const { error, status } = validateInput(
      { postTitle: "Title", agentPersona: "persona" },
      CommentInputSchema
    );
    expect(status).toBe(400);
    expect(error).toContain("agentName");
  });

  it("rejects missing agentPersona", () => {
    const { error, status } = validateInput(
      { postTitle: "Title", agentName: "Sage" },
      CommentInputSchema
    );
    expect(status).toBe(400);
  });
});

describe("CycleGenerateInputSchema", () => {
  it("accepts valid input with step", () => {
    const { data, error } = validateInput(
      { topic: { title: "AI Ethics" }, step: "act_0" },
      CycleGenerateInputSchema
    );
    expect(error).toBeNull();
    expect(data.step).toBe("act_0");
  });

  it("validates step enum values", () => {
    const validSteps = ["through-line", "act_0", "act_1", "act_2"];
    for (const step of validSteps) {
      const { error } = validateInput(
        { topic: { title: "Test" }, step },
        CycleGenerateInputSchema
      );
      expect(error).toBeNull();
    }
  });

  it("rejects invalid step value", () => {
    const { error, status } = validateInput(
      { topic: { title: "Test" }, step: "invalid_step" },
      CycleGenerateInputSchema
    );
    expect(status).toBe(400);
  });

  it("rejects missing topic title", () => {
    const { error, status } = validateInput(
      { topic: {} },
      CycleGenerateInputSchema
    );
    expect(status).toBe(400);
  });
});

describe("OrchestrationRunInputSchema", () => {
  const validInput = {
    title: "Test Task",
    description: "A test description",
    type: "research",
  };

  it("accepts valid input", () => {
    const { error } = validateInput(validInput, OrchestrationRunInputSchema);
    expect(error).toBeNull();
  });

  it("caps maxAgents at 6", () => {
    const { error, status } = validateInput(
      { ...validInput, options: { maxAgents: 7 } },
      OrchestrationRunInputSchema
    );
    expect(status).toBe(400);
  });

  it("accepts maxAgents within range", () => {
    const { data, error } = validateInput(
      { ...validInput, options: { maxAgents: 4 } },
      OrchestrationRunInputSchema
    );
    expect(error).toBeNull();
    expect(data.options.maxAgents).toBe(4);
  });

  it("caps costBudget at 1.0", () => {
    const { error, status } = validateInput(
      { ...validInput, options: { costBudget: 1.5 } },
      OrchestrationRunInputSchema
    );
    expect(status).toBe(400);
  });

  it("defaults options to empty object", () => {
    const { data } = validateInput(validInput, OrchestrationRunInputSchema);
    expect(data.options).toEqual({});
  });
});

describe("ModerateInputSchema", () => {
  it("accepts valid input", () => {
    const { error } = validateInput(
      { articleTitle: "Test", rounds: [[{ response: "Some response" }]] },
      ModerateInputSchema
    );
    expect(error).toBeNull();
  });

  it("rejects empty rounds", () => {
    const { error, status } = validateInput(
      { articleTitle: "Test", rounds: [] },
      ModerateInputSchema
    );
    expect(status).toBe(400);
  });
});

describe("GeneratePostInputSchema", () => {
  it("accepts valid input", () => {
    const { error } = validateInput(
      { agent: "sage", topic: { title: "Test Topic" } },
      GeneratePostInputSchema
    );
    expect(error).toBeNull();
  });

  it("rejects invalid agent enum", () => {
    const { error, status } = validateInput(
      { agent: "invalid", topic: { title: "Test" } },
      GeneratePostInputSchema
    );
    expect(status).toBe(400);
  });

  it("only accepts sage, atlas, forge", () => {
    for (const agent of ["sage", "atlas", "forge"]) {
      const { error } = validateInput(
        { agent, topic: { title: "Test" } },
        GeneratePostInputSchema
      );
      expect(error).toBeNull();
    }
  });
});

describe("PillarsInputSchema", () => {
  it("accepts valid topic", () => {
    const { error } = validateInput({ topic: "AI Ethics" }, PillarsInputSchema);
    expect(error).toBeNull();
  });

  it("rejects empty topic", () => {
    const { error, status } = validateInput({ topic: "" }, PillarsInputSchema);
    expect(status).toBe(400);
  });
});

describe("OrchestrationAnalyzeInputSchema", () => {
  it("defaults empty strings for missing fields", () => {
    const { data, error } = validateInput({}, OrchestrationAnalyzeInputSchema);
    expect(error).toBeNull();
    expect(data.title).toBe("");
    expect(data.description).toBe("");
  });
});
