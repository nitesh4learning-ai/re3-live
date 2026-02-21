// Run Store — Persists completed orchestration runs to localStorage.
// Uses the same DB helper as the rest of the platform (re3_ prefix, JSON serialization).
// Stores the full event stream, deliverable, final snapshot, and budget
// so that any completed run can be replayed with the exact same UI.

import { DB } from "../../app/utils/firebase-client";

const STORE_KEY = "orchestration_runs_v1";
const MAX_RUNS = 50; // Cap to prevent localStorage bloat

/**
 * Save a completed orchestration run.
 * Strips the per-event snapshot/budget to keep storage lean — only the final
 * snapshot is stored separately. Events keep their type, timestamp, annotation,
 * nodeId, and event-specific data fields.
 */
export function saveRun({ deliverable, events, boardSnapshot, budget }) {
  if (!deliverable?.runId) return;

  // Strip heavy snapshot/budget from each event to save space.
  // The timeline only needs type, timestamp, annotation, nodeId, and
  // event-specific fields (taskId, agentName, etc.).
  const leanEvents = events.map((evt) => {
    const { snapshot: _s, budget: _b, ...rest } = evt.data || {};
    return { ...evt, data: rest };
  });

  const record = {
    runId: deliverable.runId,
    useCase: deliverable.useCase,
    deliverable: deliverable.deliverable,
    team: deliverable.team,
    taskResults: deliverable.taskResults,
    metrics: deliverable.metrics,
    completedAt: deliverable.completedAt || Date.now(),
    events: leanEvents,
    boardSnapshot,
    budget,
  };

  const runs = DB.get(STORE_KEY, []);

  // Replace if same runId already exists (idempotent)
  const idx = runs.findIndex((r) => r.runId === record.runId);
  if (idx !== -1) {
    runs[idx] = record;
  } else {
    runs.unshift(record); // Newest first
  }

  // Cap total stored runs
  if (runs.length > MAX_RUNS) {
    runs.length = MAX_RUNS;
  }

  DB.set(STORE_KEY, runs);
  return record;
}

/**
 * Get all saved runs (newest first).
 * Returns lightweight summaries for the tile grid.
 */
export function listRuns() {
  const runs = DB.get(STORE_KEY, []);
  return runs.map((r) => ({
    runId: r.runId,
    useCase: r.useCase,
    team: r.team,
    metrics: r.metrics,
    completedAt: r.completedAt,
    eventCount: r.events?.length || 0,
  }));
}

/**
 * Get a single saved run by ID — full record for replay.
 */
export function getRun(runId) {
  const runs = DB.get(STORE_KEY, []);
  return runs.find((r) => r.runId === runId) || null;
}

/**
 * Delete a saved run.
 */
export function deleteRun(runId) {
  const runs = DB.get(STORE_KEY, []);
  const filtered = runs.filter((r) => r.runId !== runId);
  DB.set(STORE_KEY, filtered);
}
