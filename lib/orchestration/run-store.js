// Run Store — Persists completed orchestration runs.
// Dual storage: localStorage (fast, offline) + Firestore (cloud, shareable).
// localStorage is the primary read source; Firestore syncs in background.
// If a run isn't found locally (e.g., shared URL), it's fetched from Firestore.

import { DB, getFirestoreModule } from "../../app/utils/firebase-client";

const STORE_KEY = "orchestration_runs_v1";
const MAX_RUNS = 50; // Cap localStorage to prevent bloat
const FIRESTORE_COLLECTION = "orchestration_runs";

/**
 * Save a completed orchestration run.
 * Strips per-event snapshot/budget to keep storage lean.
 * Saves to both localStorage and Firestore (Firestore is non-blocking).
 */
export function saveRun({ deliverable, events, boardSnapshot, budget }) {
  if (!deliverable?.runId) return;

  // Strip heavy snapshot/budget from each event to save space.
  const leanEvents = events.map((evt) => {
    const { snapshot: _s, budget: _b, ...rest } = evt.data || {};
    return { ...evt, data: rest };
  });

  const record = {
    runId: deliverable.runId,
    useCase: deliverable.useCase,
    deliverable: deliverable.deliverable,
    // Structured deliverable sections (blueprint, prototype, etc.)
    blueprint: deliverable.blueprint || null,
    prototype: deliverable.prototype || null,
    executiveSummary: deliverable.executiveSummary || null,
    recommendations: deliverable.recommendations || null,
    team: deliverable.team,
    taskResults: deliverable.taskResults,
    metrics: deliverable.metrics,
    completedAt: deliverable.completedAt || Date.now(),
    events: leanEvents,
    boardSnapshot,
    budget,
  };

  // Save to localStorage (synchronous, fast)
  const runs = DB.get(STORE_KEY, []);
  const idx = runs.findIndex((r) => r.runId === record.runId);
  if (idx !== -1) {
    runs[idx] = record;
  } else {
    runs.unshift(record);
  }
  if (runs.length > MAX_RUNS) {
    runs.length = MAX_RUNS;
  }
  DB.set(STORE_KEY, runs);

  // Save to Firestore (async, non-blocking)
  saveRunToFirestore(record).catch(() => {
    // Firestore unavailable — localStorage has the data
  });

  return record;
}

/**
 * Save a run to Firestore.
 * Events are stored as a compressed JSON string to avoid Firestore's
 * nested array limitations and document size issues.
 */
async function saveRunToFirestore(record) {
  const mod = await getFirestoreModule();
  if (!mod) return;

  // Dynamically import Firestore helpers
  const { db, doc, setDoc, serverTimestamp } = await import("../firebase");

  // Firestore has a 1MB document limit. For large runs, we store the
  // events as a JSON string and the deliverable text separately.
  const firestoreRecord = {
    runId: record.runId,
    useCase: record.useCase,
    deliverableText: record.deliverable,
    // Structured deliverable sections stored as JSON strings (can be large)
    blueprintJson: JSON.stringify(record.blueprint || null),
    prototypeJson: JSON.stringify(record.prototype || null),
    executiveSummary: record.executiveSummary || null,
    recommendationsJson: JSON.stringify(record.recommendations || null),
    team: record.team,
    taskResults: record.taskResults,
    metrics: record.metrics,
    completedAt: record.completedAt,
    // Store events as JSON string to avoid nested array issues
    eventsJson: JSON.stringify(record.events || []),
    boardSnapshotJson: JSON.stringify(record.boardSnapshot || {}),
    budgetJson: JSON.stringify(record.budget || {}),
    updatedAt: serverTimestamp(),
  };

  const ref = doc(db, FIRESTORE_COLLECTION, record.runId);
  await setDoc(ref, firestoreRecord, { merge: true });
}

/**
 * Get all saved runs (newest first).
 * Returns lightweight summaries for the tile grid.
 * Reads from localStorage only (fast).
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
 * List runs from Firestore (for shareable library).
 * Merges with localStorage runs, deduplicating by runId.
 * Cloud-only runs are cached locally so they persist across reloads.
 */
export async function listRunsCloud() {
  const localRuns = listRuns();
  const localIds = new Set(localRuns.map((r) => r.runId));

  try {
    const { db, collection, query, orderBy, limit, getDocs } = await import("../firebase");
    const q = query(
      collection(db, FIRESTORE_COLLECTION),
      orderBy("completedAt", "desc"),
      limit(MAX_RUNS)
    );
    const snap = await getDocs(q);
    if (snap.empty) return localRuns;

    const cloudRuns = [];
    const fullStore = DB.get(STORE_KEY, []);
    const fullStoreIds = new Set(fullStore.map((r) => r.runId));
    let storeChanged = false;

    for (const d of snap.docs) {
      const data = d.data();
      const summary = {
        runId: data.runId,
        useCase: data.useCase,
        team: data.team,
        metrics: data.metrics,
        completedAt: data.completedAt,
        eventCount: 0,
        isCloud: true,
      };

      if (!localIds.has(data.runId)) {
        cloudRuns.push(summary);
      }

      // Cache a lightweight record locally so it survives browser changes
      if (!fullStoreIds.has(data.runId)) {
        fullStore.push({
          runId: data.runId,
          useCase: data.useCase,
          deliverable: data.deliverableText || "",
          blueprint: data.blueprintJson ? JSON.parse(data.blueprintJson) : null,
          prototype: data.prototypeJson ? JSON.parse(data.prototypeJson) : null,
          executiveSummary: data.executiveSummary || null,
          recommendations: data.recommendationsJson ? JSON.parse(data.recommendationsJson) : null,
          team: data.team || [],
          taskResults: data.taskResults || [],
          metrics: data.metrics || {},
          completedAt: data.completedAt || Date.now(),
          events: data.eventsJson ? JSON.parse(data.eventsJson) : [],
          boardSnapshot: data.boardSnapshotJson ? JSON.parse(data.boardSnapshotJson) : {},
          budget: data.budgetJson ? JSON.parse(data.budgetJson) : null,
        });
        storeChanged = true;
      }
    }

    // Persist merged store locally
    if (storeChanged) {
      fullStore.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
      if (fullStore.length > MAX_RUNS) fullStore.length = MAX_RUNS;
      DB.set(STORE_KEY, fullStore);
    }

    return [...localRuns, ...cloudRuns];
  } catch {
    return localRuns;
  }
}

/**
 * Get a single saved run by ID — full record for replay.
 * Tries localStorage first, then Firestore.
 */
export function getRun(runId) {
  const runs = DB.get(STORE_KEY, []);
  return runs.find((r) => r.runId === runId) || null;
}

/**
 * Get a run from Firestore (for shared URLs).
 * Also caches to localStorage for future fast access.
 */
export async function getRunCloud(runId) {
  // Try local first
  const local = getRun(runId);
  if (local) return local;

  try {
    const { db, doc, getDoc } = await import("../firebase");
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTION, runId));
    if (!snap.exists()) return null;

    const data = snap.data();
    const record = {
      runId: data.runId,
      useCase: data.useCase,
      deliverable: data.deliverableText,
      blueprint: data.blueprintJson ? JSON.parse(data.blueprintJson) : null,
      prototype: data.prototypeJson ? JSON.parse(data.prototypeJson) : null,
      executiveSummary: data.executiveSummary || null,
      recommendations: data.recommendationsJson ? JSON.parse(data.recommendationsJson) : null,
      team: data.team,
      taskResults: data.taskResults,
      metrics: data.metrics,
      completedAt: data.completedAt,
      events: data.eventsJson ? JSON.parse(data.eventsJson) : [],
      boardSnapshot: data.boardSnapshotJson ? JSON.parse(data.boardSnapshotJson) : {},
      budget: data.budgetJson ? JSON.parse(data.budgetJson) : null,
    };

    // Cache locally for fast future access
    const runs = DB.get(STORE_KEY, []);
    if (!runs.find((r) => r.runId === runId)) {
      runs.unshift(record);
      if (runs.length > MAX_RUNS) runs.length = MAX_RUNS;
      DB.set(STORE_KEY, runs);
    }

    return record;
  } catch {
    return null;
  }
}

/**
 * Delete a saved run (from localStorage only).
 */
export function deleteRun(runId) {
  const runs = DB.get(STORE_KEY, []);
  const filtered = runs.filter((r) => r.runId !== runId);
  DB.set(STORE_KEY, filtered);
}
