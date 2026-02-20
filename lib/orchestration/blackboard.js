// Blackboard — Shared Working Memory for Orchestration Runs
// Central state store that all agents read from and write to.
// Phase 1: In-memory per run. Phase 2+: Redis or Firebase Realtime DB.

/**
 * Create a new Blackboard for an orchestration run.
 * @param {string} runId
 * @param {object} useCase - { title, description, type, complexityScore }
 * @returns {object} Blackboard instance
 */
export function createBlackboard(runId, useCase) {
  return {
    runId,
    createdAt: Date.now(),
    useCase,
    team: [],
    state: {},
    episodicLog: [],
    status: "initialized", // initialized | decomposing | assembling | executing | synthesizing | completed | failed
  };
}

/**
 * Write a value to the Blackboard state.
 * @param {object} board - Blackboard instance
 * @param {string} key - Structured key like "t1.output" or "synthesis.draft"
 * @param {*} value - Any serializable value
 * @param {string} writtenBy - Agent ID that wrote this
 */
export function writeToBoard(board, key, value, writtenBy) {
  board.state[key] = {
    value,
    writtenBy,
    writtenAt: Date.now(),
    version: (board.state[key]?.version || 0) + 1,
  };

  logEvent(board, writtenBy, "write", { key });
}

/**
 * Read a value from the Blackboard state.
 * @param {object} board - Blackboard instance
 * @param {string} key - State key
 * @returns {*} The stored value, or null
 */
export function readFromBoard(board, key) {
  return board.state[key]?.value || null;
}

/**
 * Read multiple keys from the Blackboard.
 * @param {object} board
 * @param {string[]} keys
 * @returns {object} Map of key → value
 */
export function readMultiple(board, keys) {
  const result = {};
  for (const key of keys) {
    result[key] = readFromBoard(board, key);
  }
  return result;
}

/**
 * Get all state keys and their metadata (without full values).
 * Useful for the visual canvas to show what's been written.
 */
export function getBoardSummary(board) {
  const entries = {};
  for (const [key, entry] of Object.entries(board.state)) {
    entries[key] = {
      writtenBy: entry.writtenBy,
      writtenAt: entry.writtenAt,
      version: entry.version,
      hasValue: entry.value != null,
      valuePreview:
        typeof entry.value === "string"
          ? entry.value.slice(0, 150) + (entry.value.length > 150 ? "..." : "")
          : typeof entry.value === "object"
            ? JSON.stringify(entry.value).slice(0, 150)
            : String(entry.value),
    };
  }
  return entries;
}

/**
 * Set the team roster on the Blackboard.
 * @param {object} board
 * @param {object[]} team - Agents with role assignments
 */
export function setTeam(board, team) {
  board.team = team.map((a) => ({
    agentId: a.id,
    name: a.name,
    domain: a.domain,
    specialization: a.specialization,
    assignedTask: a._assignedTask || null,
    taskTitle: a._taskTitle || null,
    model: a.model,
    color: a.color,
    avatar: a.avatar,
  }));
}

/**
 * Log an event to the episodic log.
 * @param {object} board
 * @param {string} agentId - Agent or "system"
 * @param {string} action - started | completed | failed | write | read | status_change
 * @param {object} details - Additional context
 */
export function logEvent(board, agentId, action, details = {}) {
  board.episodicLog.push({
    timestamp: Date.now(),
    agentId,
    action,
    ...details,
  });
}

/**
 * Update the overall run status.
 */
export function setStatus(board, status) {
  board.status = status;
  logEvent(board, "system", "status_change", { status });
}

/**
 * Get the full Blackboard as a serializable snapshot.
 * Used for status polling and game archival.
 */
export function snapshot(board) {
  return {
    runId: board.runId,
    createdAt: board.createdAt,
    useCase: board.useCase,
    team: board.team,
    status: board.status,
    stateEntries: getBoardSummary(board),
    episodicLog: board.episodicLog,
    elapsedMs: Date.now() - board.createdAt,
  };
}

/**
 * Get the full Blackboard including raw state values.
 * Used for final archival (Arena Library).
 */
export function fullSnapshot(board) {
  return {
    ...snapshot(board),
    state: board.state,
  };
}
