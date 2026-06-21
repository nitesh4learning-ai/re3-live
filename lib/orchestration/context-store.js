// Context Store — persists "Apply this framework" runs (context-comprehension)
// into a browsable, moderated use-case library.
//
// Mirrors run-store.js, but adds ownership + approval (default PRIVATE):
//   - localStorage cache (key context_runs_v1) so an owner sees their own runs fast
//   - Firestore `context_runs`: owner-read + public-read-if-approved (see firestore.rules)
// New runs are saved approved:false (private to the owner); an admin flips
// `approved` to publish a worked example to the public library.
//
// Queries avoid orderBy (single where + client-side sort) so no Firestore
// composite index is required.

import { DB } from "../../app/utils/firebase-client";
import { CONTEXT_SPINE } from "./context-spine.js";

const STORE_KEY = "context_runs_v1";
const MAX_RUNS = 50;
const FIRESTORE_COLLECTION = "context_runs";

// Build a clean per-stage array from the deliverable (the source of truth),
// joining task outputs with team personas so a saved entry is self-contained.
function stagesFromDeliverable(deliverable) {
  const team = deliverable.team || [];
  const results = deliverable.taskResults || [];
  return CONTEXT_SPINE.map((s) => {
    const r = results.find((t) => t.taskId === s.id) || {};
    const member =
      team.find((m) => m.id === r.agentId) ||
      team.find((m) => m._assignedTask === s.id) ||
      {};
    return {
      id: s.id,
      num: s.num,
      name: s.name,
      question: s.question,
      agentName: r.agentName || member.name || null,
      specialization: member.specialization || null,
      output: r.output || null,
      status: r.status || "completed",
    };
  });
}

export function buildContextRecord({ deliverable, description, user }) {
  return {
    runId: deliverable.runId,
    ownerId: user?.id || null,
    ownerName: user?.name || null,
    ownerEmail: user?.email || null,
    approved: false, // private until an admin publishes it
    title: deliverable.useCase?.title || "Untitled",
    description: description || deliverable.useCase?.description || "",
    stages: stagesFromDeliverable(deliverable),
    roadmap: deliverable.roadmap || null,
    executiveSummary: deliverable.executiveSummary || null,
    metrics: deliverable.metrics || null,
    completedAt: deliverable.completedAt || Date.now(),
  };
}

/**
 * Save a completed context-comprehension run to localStorage + Firestore.
 * Firestore write only fires when signed in (writes need auth); it's non-blocking.
 */
export function saveContextRun({ deliverable, description, user }) {
  if (!deliverable?.runId) return null;
  const record = buildContextRecord({ deliverable, description, user });

  const runs = DB.get(STORE_KEY, []);
  const idx = runs.findIndex((r) => r.runId === record.runId);
  if (idx !== -1) runs[idx] = record;
  else runs.unshift(record);
  if (runs.length > MAX_RUNS) runs.length = MAX_RUNS;
  DB.set(STORE_KEY, runs);

  if (user?.id) {
    saveContextRunToFirestore(record).catch(() => {
      // Firestore unavailable — localStorage has the data
    });
  }
  return record;
}

async function saveContextRunToFirestore(record) {
  const { db, doc, setDoc, serverTimestamp } = await import("../firebase");
  const fsRecord = {
    runId: record.runId,
    ownerId: record.ownerId,
    ownerName: record.ownerName,
    ownerEmail: record.ownerEmail,
    approved: record.approved === true,
    title: record.title,
    description: record.description,
    // Stored as JSON strings to avoid Firestore nested-array limits.
    stagesJson: JSON.stringify(record.stages || []),
    roadmapJson: JSON.stringify(record.roadmap || null),
    executiveSummary: record.executiveSummary || null,
    metrics: record.metrics || null,
    completedAt: record.completedAt,
    updatedAt: serverTimestamp(),
  };
  // Each runId is unique → this is always a create (rules require approved:false).
  const ref = doc(db, FIRESTORE_COLLECTION, record.runId);
  await setDoc(ref, fsRecord);
}

function localSummary(r) {
  return {
    runId: r.runId,
    title: r.title,
    description: r.description,
    ownerName: r.ownerName,
    approved: r.approved === true,
    completedAt: r.completedAt,
    stageCount: (r.stages || []).length,
    isOwn: true,
  };
}

function cloudSummary(data, uid) {
  return {
    runId: data.runId,
    title: data.title,
    description: data.description,
    ownerName: data.ownerName,
    approved: data.approved === true,
    completedAt: data.completedAt,
    stageCount: 6,
    isOwn: uid && data.ownerId === uid,
  };
}

function cloudToRecord(data) {
  return {
    runId: data.runId,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    approved: data.approved === true,
    title: data.title,
    description: data.description,
    stages: data.stagesJson ? JSON.parse(data.stagesJson) : [],
    roadmap: data.roadmapJson ? JSON.parse(data.roadmapJson) : null,
    executiveSummary: data.executiveSummary || null,
    metrics: data.metrics || null,
    completedAt: data.completedAt || Date.now(),
  };
}

/** Local-only list (owner's own runs), newest first. */
export function listContextRuns() {
  return DB.get(STORE_KEY, [])
    .map(localSummary)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

/**
 * List library entries: public (approved) runs + the signed-in owner's own runs,
 * merged with the local cache and deduped by runId. Sorted client-side.
 */
export async function listContextRunsCloud(uid) {
  const byId = new Map();
  for (const r of listContextRuns()) byId.set(r.runId, r);

  try {
    const { db, collection, query, where, limit, getDocs } = await import("../firebase");

    const pub = await getDocs(
      query(collection(db, FIRESTORE_COLLECTION), where("approved", "==", true), limit(MAX_RUNS))
    );
    pub.forEach((d) => {
      const s = cloudSummary(d.data(), uid);
      if (!byId.has(s.runId)) byId.set(s.runId, s);
    });

    if (uid) {
      const mine = await getDocs(
        query(collection(db, FIRESTORE_COLLECTION), where("ownerId", "==", uid), limit(MAX_RUNS))
      );
      mine.forEach((d) => {
        const s = cloudSummary(d.data(), uid);
        byId.set(s.runId, s); // owner's cloud copy wins (carries approved state)
      });
    }
  } catch {
    // Offline or rules/index issue — local cache only
  }

  return Array.from(byId.values()).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

/** Full record for the library viewer — local first, then Firestore. */
export function getContextRun(runId) {
  return DB.get(STORE_KEY, []).find((r) => r.runId === runId) || null;
}

export async function getContextRunCloud(runId) {
  const local = getContextRun(runId);
  if (local) return local;
  try {
    const { db, doc, getDoc } = await import("../firebase");
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTION, runId));
    if (!snap.exists()) return null;
    return cloudToRecord(snap.data());
  } catch {
    return null;
  }
}

// ── Admin moderation ──────────────────────────────────────────────
// These rely on the admin's auth satisfying the context_runs rules
// (admin can read all + update). No-ops gracefully when offline.

/** List every context run for moderation (admin only). */
export async function listAllContextRunsAdmin() {
  try {
    const { db, collection, query, limit, getDocs } = await import("../firebase");
    const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTION), limit(200)));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          runId: data.runId,
          title: data.title,
          description: data.description,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          approved: data.approved === true,
          completedAt: data.completedAt,
        };
      })
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  } catch {
    return [];
  }
}

/** Publish/unpublish a context run (admin only). */
export async function setContextRunApproved(runId, approved) {
  const { db, doc, updateDoc } = await import("../firebase");
  await updateDoc(doc(db, FIRESTORE_COLLECTION, runId), { approved: !!approved });
}
