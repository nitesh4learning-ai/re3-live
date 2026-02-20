// Task Decomposer — LLM-powered use case → sub-tasks breakdown.
// Uses a lightweight LLM call to decompose a use case into discrete, assignable sub-tasks.

import { gatewayCall, scoreComplexity } from "../ai-gateway.js";
import { parseLLMResponse } from "../llm-parse.js";
import { z } from "zod";

const TaskSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      requiredCapabilities: z.array(z.string()),
      dependsOn: z.array(z.string()),
      outputFormat: z.string(),
    })
  ),
});

const DECOMPOSE_SYSTEM = `You are a task decomposition engine for the Re³ orchestration platform.
Given a use case, break it into 3-6 discrete sub-tasks that can each be assigned to a single AI agent.

Rules:
- Each task must be independently assignable to one agent
- Tasks must have clear input requirements and output descriptions
- Use these capability types: research, critique, ideate, architect, synthesize, implement, debate
- The final task should always be synthesis — combining all prior outputs into the deliverable
- Keep it lean — fewer tasks is better than more. Aim for 4-5 tasks.
- Task IDs must be t1, t2, t3, etc.
- dependsOn lists which task IDs must complete before this one starts. Empty = can run immediately.`;

/**
 * Decompose a use case into sub-tasks.
 * @param {object} useCase - { title, description, type }
 * @param {object} budget - BudgetTracker instance
 * @returns {Promise<{ tasks: object[], complexity: number }>}
 */
export async function decompose(useCase, budget) {
  const prompt = `Use case: "${useCase.title}"
Description: ${useCase.description}
Type: ${useCase.type}

Break this into 3-6 discrete sub-tasks. Each task should map to one agent.

Respond in JSON only:
{
  "tasks": [
    {
      "id": "t1",
      "title": "Task title",
      "description": "What this task does and what it produces",
      "requiredCapabilities": ["research"],
      "dependsOn": [],
      "outputFormat": "Description of the expected output"
    }
  ]
}`;

  // Use a cheaper model for decomposition — it's a structured task
  const { text, usage } = await gatewayCall(
    "gemini",
    DECOMPOSE_SYSTEM,
    prompt,
    { maxTokens: 1000, timeout: 20000 }
  );

  if (budget) {
    budget.record("system", "decompose", usage);
  }

  const { data, error } = parseLLMResponse(text, TaskSchema);
  if (!data) {
    throw new Error("Failed to decompose use case: " + (error || "unknown parse error"));
  }

  // Validate task references
  const taskIds = new Set(data.tasks.map((t) => t.id));
  for (const task of data.tasks) {
    task.dependsOn = task.dependsOn.filter((dep) => taskIds.has(dep));
    // Score complexity for each task
    task._complexity = scoreComplexity(task);
  }

  // Overall use case complexity = average of task complexities
  const avgComplexity =
    data.tasks.reduce((sum, t) => sum + t._complexity, 0) / data.tasks.length;

  return {
    tasks: data.tasks,
    complexity: Math.round(avgComplexity * 100) / 100,
  };
}

/**
 * Build a dependency graph from tasks.
 * Returns execution layers — tasks in the same layer can run in parallel.
 * @param {object[]} tasks
 * @returns {string[][]} Array of layers, each layer is array of task IDs
 */
export function buildExecutionLayers(tasks) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const layers = [];
  const resolved = new Set();

  let remaining = [...tasks];
  let safety = 0;

  while (remaining.length > 0 && safety < 20) {
    safety++;
    const layer = [];

    for (const task of remaining) {
      const depsResolved = task.dependsOn.every((dep) => resolved.has(dep));
      if (depsResolved) {
        layer.push(task.id);
      }
    }

    if (layer.length === 0) {
      // Circular dependency or unresolvable — force remaining into one layer
      layers.push(remaining.map((t) => t.id));
      break;
    }

    layers.push(layer);
    for (const id of layer) {
      resolved.add(id);
    }
    remaining = remaining.filter((t) => !resolved.has(t.id));
  }

  return layers;
}
