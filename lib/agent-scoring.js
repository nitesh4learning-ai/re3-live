// Agent Scoring Engine
// Capability-weighted selection + diversity optimization for team assembly.

import { getAgentCostTier } from "./agent-registry.js";

/**
 * Capability weight profiles for different use case types.
 * Weights must sum to 1.0.
 */
const TASK_PROFILES = {
  "competitive-analysis": {
    research: 0.30, critique: 0.25, synthesize: 0.20, debate: 0.15, ideate: 0.10,
  },
  "communication-plan": {
    ideate: 0.30, synthesize: 0.25, architect: 0.20, implement: 0.15, debate: 0.10,
  },
  "decision-matrix": {
    critique: 0.30, debate: 0.25, synthesize: 0.20, research: 0.15, architect: 0.10,
  },
  "process-recommendation": {
    architect: 0.25, research: 0.25, implement: 0.20, synthesize: 0.20, critique: 0.10,
  },
  "meeting-brief": {
    synthesize: 0.30, research: 0.30, ideate: 0.20, implement: 0.10, critique: 0.10,
  },
};

/** Default balanced profile if use case type is unknown. */
const DEFAULT_PROFILE = {
  research: 0.18, critique: 0.16, synthesize: 0.16, debate: 0.14,
  ideate: 0.14, architect: 0.12, implement: 0.10,
};

/**
 * Score a single agent against a capability weight profile.
 * @param {object} agent - Agent with capabilities object
 * @param {object} weights - Capability weight profile
 * @returns {number} Score 0-5
 */
export function scoreAgent(agent, weights) {
  if (!agent.capabilities) return 0;
  let score = 0;
  for (const [cap, weight] of Object.entries(weights)) {
    score += (agent.capabilities[cap] || 0) * weight;
  }
  return score;
}

/**
 * Score and rank agents for a specific use case type.
 * @param {object[]} agents - Array of agents to score
 * @param {string} useCaseType - One of the TASK_PROFILES keys
 * @returns {object[]} Agents sorted by score descending, with score attached
 */
export function rankAgents(agents, useCaseType) {
  const weights = TASK_PROFILES[useCaseType] || DEFAULT_PROFILE;
  return agents
    .map((agent) => ({ ...agent, _score: scoreAgent(agent, weights) }))
    .sort((a, b) => b._score - a._score);
}

/**
 * Compute a diversity bonus for a candidate team.
 * Rewards variety in cognitive style and domain coverage.
 * @param {object[]} team - Selected agents
 * @returns {number} Bonus score (0 to 1)
 */
export function diversityBonus(team) {
  if (team.length <= 1) return 0;

  // Cognitive disposition diversity
  const dispositions = new Set(
    team.map((a) => a.cognitiveStyle?.disposition).filter(Boolean)
  );
  const dispositionScore = Math.min(dispositions.size / 3, 1); // max 3 types

  // Cognitive type diversity
  const types = new Set(
    team.map((a) => a.cognitiveStyle?.type).filter(Boolean)
  );
  const typeScore = types.size >= 2 ? 1 : 0;

  // Domain diversity
  const domains = new Set(team.map((a) => a.domain).filter(Boolean));
  const domainScore = Math.min(domains.size / team.length, 1);

  return (dispositionScore * 0.4) + (typeScore * 0.2) + (domainScore * 0.4);
}

/**
 * Compute cost penalty for a team. Lower cost = higher score.
 * @param {object[]} team
 * @returns {number} Penalty 0 (all tier 1) to 1 (all tier 3)
 */
export function costPenalty(team) {
  if (team.length === 0) return 0;
  const avgTier =
    team.reduce((sum, a) => sum + getAgentCostTier(a), 0) / team.length;
  return (avgTier - 1) / 2; // Normalize: tier 1 = 0, tier 3 = 1
}

/**
 * Select the optimal team for a use case.
 * Uses greedy selection with diversity and cost constraints.
 *
 * @param {object[]} candidateAgents - Pool of agents to choose from
 * @param {string} useCaseType - Use case type key
 * @param {number} teamSize - How many agents to select (default 5)
 * @param {object} options - { maxCostTier?, requireDomains? }
 * @returns {object[]} Selected team with _score and _role fields
 */
export function selectTeam(candidateAgents, useCaseType, teamSize = 5, options = {}) {
  const { maxCostTier = 3 } = options;
  const weights = TASK_PROFILES[useCaseType] || DEFAULT_PROFILE;

  // Filter by cost tier
  let pool = candidateAgents.filter(
    (a) => getAgentCostTier(a) <= maxCostTier
  );

  // Score all candidates
  const scored = pool.map((agent) => ({
    ...agent,
    _score: scoreAgent(agent, weights),
  }));

  // Greedy selection: pick best scorer, then optimize for diversity
  const team = [];
  const used = new Set();

  for (let i = 0; i < teamSize && scored.length > 0; i++) {
    let bestIdx = -1;
    let bestComposite = -Infinity;

    for (let j = 0; j < scored.length; j++) {
      if (used.has(scored[j].id)) continue;

      // Evaluate adding this agent to the team
      const candidate = [...team, scored[j]];
      const capScore = scored[j]._score;
      const divBonus = diversityBonus(candidate);
      const costPen = costPenalty(candidate);

      // Composite: capability (60%) + diversity (30%) - cost (10%)
      const composite = capScore * 0.6 + divBonus * 0.3 - costPen * 0.1;

      if (composite > bestComposite) {
        bestComposite = composite;
        bestIdx = j;
      }
    }

    if (bestIdx >= 0) {
      team.push(scored[bestIdx]);
      used.add(scored[bestIdx].id);
    }
  }

  return team;
}

/**
 * Assign roles to team members based on their strongest capabilities.
 * @param {object[]} team - Selected agents
 * @param {object[]} tasks - Sub-tasks with requiredCapabilities
 * @returns {object[]} Team with _assignedTask field
 */
export function assignRoles(team, tasks) {
  const assignments = [];
  const assignedTasks = new Set();
  const assignedAgents = new Set();

  // For each task, find the best-fit unassigned agent
  for (const task of tasks) {
    let bestAgent = null;
    let bestScore = -1;

    for (const agent of team) {
      if (assignedAgents.has(agent.id)) continue;

      // Score agent against task's required capabilities
      let score = 0;
      for (const cap of task.requiredCapabilities || []) {
        score += agent.capabilities?.[cap] || 0;
      }
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    if (bestAgent) {
      assignments.push({
        ...bestAgent,
        _assignedTask: task.id,
        _taskTitle: task.title,
        _fitScore: bestScore,
      });
      assignedAgents.add(bestAgent.id);
      assignedTasks.add(task.id);
    }
  }

  // Any unassigned agents get a general "support" role
  for (const agent of team) {
    if (!assignedAgents.has(agent.id)) {
      assignments.push({
        ...agent,
        _assignedTask: null,
        _taskTitle: "Synthesis Support",
        _fitScore: 0,
      });
    }
  }

  return assignments;
}

export { TASK_PROFILES, DEFAULT_PROFILE };
