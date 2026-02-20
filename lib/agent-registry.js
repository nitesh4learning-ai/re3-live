// Agent Registry Service
// Loads the 1,000-agent registry and provides search, filter, and matching capabilities.

let _registry = null;
let _agentMap = null;
let _domainIndex = null;
let _specIndex = null;

/**
 * Load the agent registry from the static JSON file.
 * Caches in memory after first load.
 */
export async function loadRegistry() {
  if (_registry) return _registry;

  // In server context, read from filesystem; in edge/client, fetch
  if (typeof process !== "undefined" && process.cwd) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", "agents-registry.json");
    const raw = await fs.readFile(filePath, "utf-8");
    _registry = JSON.parse(raw);
  } else {
    const res = await fetch("/agents-registry.json");
    _registry = await res.json();
  }

  // Build indexes
  _agentMap = new Map();
  _domainIndex = new Map();
  _specIndex = new Map();

  for (const domain of _registry.domains) {
    const domainAgents = [];
    for (const spec of domain.specializations) {
      const specKey = `${domain.id}::${spec.id}`;
      _specIndex.set(specKey, spec.agents);
      for (const agent of spec.agents) {
        _agentMap.set(agent.id, agent);
        domainAgents.push(agent);
      }
    }
    _domainIndex.set(domain.id, domainAgents);
  }

  return _registry;
}

/** Get all agents as a flat array. */
export async function getAllAgents() {
  await loadRegistry();
  return Array.from(_agentMap.values());
}

/** Get a single agent by ID. */
export async function getAgentById(id) {
  await loadRegistry();
  return _agentMap.get(id) || null;
}

/** Get all agents in a domain. */
export async function filterByDomain(domainId) {
  await loadRegistry();
  return _domainIndex.get(domainId) || [];
}

/** Get all agents in a specific specialization. */
export async function filterBySpecialization(domainId, specId) {
  await loadRegistry();
  return _specIndex.get(`${domainId}::${specId}`) || [];
}

/** Get all domain metadata (without agents). */
export async function getDomains() {
  const reg = await loadRegistry();
  return reg.domains.map((d) => ({
    id: d.id,
    name: d.name,
    color: d.color,
    icon: d.icon,
    description: d.description,
    specializations: d.specializations.map((s) => ({
      id: s.id,
      name: s.name,
      agentCount: s.agents.length,
    })),
  }));
}

/**
 * Filter agents by minimum capability score.
 * @param {string} capability - One of: debate, ideate, critique, architect, implement, research, synthesize
 * @param {number} minScore - Minimum score (1-5)
 */
export async function filterByCapability(capability, minScore = 3) {
  const agents = await getAllAgents();
  return agents.filter(
    (a) => a.capabilities && a.capabilities[capability] >= minScore
  );
}

/**
 * Filter agents by cognitive style dimensions.
 * @param {object} style - { type?, abstraction?, disposition? }
 */
export async function filterByCognitiveStyle(style = {}) {
  const agents = await getAllAgents();
  return agents.filter((a) => {
    if (!a.cognitiveStyle) return false;
    if (style.type && a.cognitiveStyle.type !== style.type) return false;
    if (style.abstraction && a.cognitiveStyle.abstraction !== style.abstraction) return false;
    if (style.disposition && a.cognitiveStyle.disposition !== style.disposition) return false;
    return true;
  });
}

/**
 * Full-text search across agent name, persona, domain, specialization.
 * @param {string} query - Search term
 * @param {number} limit - Max results (default 20)
 */
export async function searchAgents(query, limit = 20) {
  const agents = await getAllAgents();
  const q = query.toLowerCase();
  const scored = [];

  for (const agent of agents) {
    let score = 0;
    const name = (agent.name || "").toLowerCase();
    const persona = (agent.persona || "").toLowerCase();
    const domain = (agent.domain || "").toLowerCase();
    const spec = (agent.specialization || "").toLowerCase();

    // Exact name match is highest
    if (name === q) score += 100;
    else if (name.includes(q)) score += 50;

    // Domain/spec match
    if (domain.includes(q)) score += 30;
    if (spec.includes(q)) score += 30;

    // Persona keyword match
    if (persona.includes(q)) score += 10;

    if (score > 0) {
      scored.push({ agent, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.agent);
}

/**
 * Get the cost tier for an agent based on its model.
 * Tier 1 (cheapest) → Tier 3 (most expensive)
 */
export function getAgentCostTier(agent) {
  switch (agent.model) {
    case "llama": return 1;
    case "gemini": return 2;
    case "openai": return 3;
    case "anthropic": return 3;
    default: return 2;
  }
}

/**
 * Get stats about the registry.
 */
export async function getRegistryStats() {
  const reg = await loadRegistry();
  const agents = await getAllAgents();

  const modelDist = {};
  const dispositionDist = {};
  for (const a of agents) {
    modelDist[a.model] = (modelDist[a.model] || 0) + 1;
    if (a.cognitiveStyle) {
      dispositionDist[a.cognitiveStyle.disposition] =
        (dispositionDist[a.cognitiveStyle.disposition] || 0) + 1;
    }
  }

  return {
    totalAgents: agents.length,
    totalDomains: reg.domains.length,
    totalSpecializations: reg.domains.reduce(
      (sum, d) => sum + d.specializations.length,
      0
    ),
    modelDistribution: modelDist,
    dispositionDistribution: dispositionDist,
    version: reg.version,
    generatedAt: reg.generatedAt,
  };
}
