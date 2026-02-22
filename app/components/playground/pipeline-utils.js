// Pipeline utilities — shared constants and functions for the Execution Pipeline.
// Extracted from ExecutionTimeline.js for reuse across the new playground components.

export const PIPELINE_PHASES = [
  { id: "intake", label: "Intake", color: "#3B82F6" },
  { id: "decompose", label: "Decompose", color: "#8B5CF6" },
  { id: "assemble", label: "Assemble", color: "#F59E0B" },
  { id: "execute", label: "Execute", color: "#3B82F6" },
  { id: "a2a", label: "Refine", color: "#8B5CF6" },
  { id: "synthesize", label: "Synthesize", color: "#9333EA" },
  { id: "deliver", label: "Deliver", color: "#10B981" },
];

export const STAGE_DESCRIPTIONS = {
  intake: "Captures and validates the user's original question",
  decompose: "Breaks the question into independent sub-tasks",
  assemble: "Selects and assigns the best agents to each task",
  execute: "Agents work on their assigned tasks in parallel layers",
  a2a: "Peer agents review and improve each output",
  synthesize: "Merges all refined outputs into a unified answer",
  deliver: "Formats and presents the final result to the user",
};

export const EVENT_TO_PIPELINE = {
  "phase.intake": "intake",
  "mcp.enrich.start": "intake",
  "mcp.enrich.complete": "intake",
  "mcp.enrich.failed": "intake",
  "phase.decompose.start": "decompose",
  "phase.decompose.complete": "decompose",
  "phase.assemble.start": "assemble",
  "phase.assemble.complete": "assemble",
  "phase.execute.start": "execute",
  "layer.start": "execute",
  "task.start": "execute",
  "task.complete": "execute",
  "task.failed": "execute",
  "layer.complete": "execute",
  "a2a.start": "a2a",
  "a2a.refine.start": "a2a",
  "a2a.refine.complete": "a2a",
  "a2a.refine.failed": "a2a",
  "a2a.complete": "a2a",
  "a2a.skipped": "a2a",
  "reflection.start": "a2a",
  "reflection.success": "a2a",
  "reflection.failed": "a2a",
  "reflection.skipped": "a2a",
  "phase.synthesize.start": "synthesize",
  "phase.synthesize.complete": "synthesize",
  "phase.complete": "deliver",
  "phase.failed": "deliver",
};

// ── Compute phase statuses ───────────────────────────────────────────

export function computePhaseStatuses(events) {
  const s = {
    intake: "pending",
    decompose: "pending",
    assemble: "pending",
    execute: "pending",
    a2a: "pending",
    synthesize: "pending",
    deliver: "pending",
  };

  for (const e of events) {
    switch (e.type) {
      case "phase.intake":
        s.intake = "completed";
        break;
      case "mcp.enrich.start":
        if (s.intake === "pending") s.intake = "active";
        break;
      case "mcp.enrich.complete":
      case "mcp.enrich.failed":
        s.intake = "completed";
        break;
      case "phase.decompose.start":
        if (s.intake !== "completed") s.intake = "completed";
        s.decompose = "active";
        break;
      case "phase.decompose.complete":
        s.decompose = "completed";
        break;
      case "phase.assemble.start":
        if (s.decompose !== "completed") s.decompose = "completed";
        s.assemble = "active";
        break;
      case "phase.assemble.complete":
        s.assemble = "completed";
        break;
      case "phase.execute.start":
        if (s.assemble !== "completed") s.assemble = "completed";
        s.execute = "active";
        break;
      case "layer.start":
      case "task.start":
      case "task.complete":
      case "task.failed":
      case "layer.complete":
        if (s.execute === "pending") s.execute = "active";
        break;
      case "a2a.start":
      case "reflection.start":
        if (s.execute === "active") s.execute = "completed";
        s.a2a = "active";
        break;
      case "a2a.complete":
      case "reflection.success":
      case "reflection.failed":
        s.a2a = "completed";
        break;
      case "a2a.skipped":
      case "reflection.skipped":
        if (s.a2a === "pending" || s.a2a === "active") s.a2a = "skipped";
        break;
      case "phase.synthesize.start":
        if (s.execute === "active") s.execute = "completed";
        if (s.a2a === "pending") s.a2a = "skipped";
        if (s.a2a === "active") s.a2a = "completed";
        s.synthesize = "active";
        break;
      case "phase.synthesize.complete":
        s.synthesize = "completed";
        break;
      case "phase.complete":
        for (const k of Object.keys(s)) {
          if (s[k] === "active") s[k] = "completed";
          if (s[k] === "pending" && k !== "deliver") s[k] = "skipped";
        }
        s.deliver = "completed";
        break;
      case "phase.failed":
        s.deliver = "failed";
        break;
    }
  }
  return s;
}

// ── Group events by pipeline phase ───────────────────────────────────

export function groupEventsByPhase(events) {
  const groups = {};
  for (const phase of PIPELINE_PHASES) {
    groups[phase.id] = [];
  }
  for (const event of events) {
    const phaseId = EVENT_TO_PIPELINE[event.type];
    if (phaseId && groups[phaseId]) {
      groups[phaseId].push(event);
    }
  }
  return groups;
}

// ── Sub-group execute events into layers ──────────────────────────────

export function groupExecuteByLayer(executeEvents) {
  const layers = [];
  let current = { header: null, events: [], status: "running" };

  for (const event of executeEvents) {
    if (event.type === "phase.execute.start") {
      current.header = event;
      current.events.push(event);
    } else if (event.type === "layer.start") {
      if (current.events.length > 0 && current.header?.type !== "phase.execute.start") {
        layers.push(current);
      } else if (current.events.length > 1) {
        layers.push(current);
      }
      current = {
        header: event,
        layerIndex: (event.data?.layerIndex || 0) + 1,
        events: [event],
        status: "running",
      };
    } else if (event.type === "layer.complete") {
      current.events.push(event);
      current.status = "completed";
      layers.push(current);
      current = { header: null, events: [], status: "running" };
    } else {
      current.events.push(event);
    }
  }

  if (current.events.length > 0) layers.push(current);
  return layers;
}

// ── Build task map from events ───────────────────────────────────────

export function buildTaskMap(events) {
  const map = {};
  for (const e of events) {
    if (e.type === "phase.decompose.complete" && e.data?.tasks) {
      for (const t of e.data.tasks) {
        map[t.id] = t.title;
      }
    }
    if ((e.type === "task.start" || e.type === "task.complete") && e.data?.taskId && e.data?.taskTitle) {
      map[e.data.taskId] = e.data.taskTitle;
    }
  }
  return map;
}

// Format t1 → "Task 1: Title" or "Task 1"
export function formatTaskName(taskId, taskMap) {
  if (!taskId) return "Unknown Task";
  const num = taskId.replace(/^t/, "");
  const title = taskMap?.[taskId];
  if (title) return `Task ${num}: ${title}`;
  return `Task ${num}`;
}

// ── Layer description helper ─────────────────────────────────────────

const LAYER_PHASE_LABELS = [
  "initial knowledge gathering",
  "specialized investigations",
  "cross-referencing findings",
  "parallel execution batch",
];

export function deriveLayerDescription(taskTitles, layerIndex) {
  const phaseLabel = LAYER_PHASE_LABELS[layerIndex] || LAYER_PHASE_LABELS[3];
  if (!taskTitles || taskTitles.length === 0) {
    return phaseLabel.charAt(0).toUpperCase() + phaseLabel.slice(1);
  }
  const keywords = taskTitles.map((t) => {
    const words = t.split(/\s+/).filter((w) => w.length > 2).slice(0, 3).join(" ");
    return words || t.split(/\s+/).slice(0, 2).join(" ");
  });
  const summary = keywords.length <= 2 ? keywords.join(", ") : keywords.slice(0, 2).join(", ");
  return `${summary} \u2014 ${phaseLabel}`;
}

// ── Derive task details from layer events ────────────────────────────

export function deriveLayerTasks(layerEvents, taskMap, team) {
  const tasks = {};
  const teamMap = {};
  for (const a of (team || [])) {
    teamMap[a.agentId] = a;
  }

  for (const e of layerEvents) {
    if (e.type === "task.start") {
      const taskId = e.data?.taskId;
      if (!taskId) continue;
      const agent = teamMap[e.data?.agentId] || null;
      tasks[taskId] = {
        id: taskId,
        name: formatTaskName(taskId, taskMap),
        agent: e.data?.agentName || "Unknown",
        agentColor: agent?.color || "#6B7280",
        status: "running",
        startTime: e.timestamp,
        model: agent?.model || e.data?.model || "",
      };
    }
    if (e.type === "task.complete") {
      const taskId = e.data?.taskId;
      if (!taskId) continue;
      if (!tasks[taskId]) {
        tasks[taskId] = {
          id: taskId,
          name: formatTaskName(taskId, taskMap),
          agent: e.data?.agentName || "Unknown",
          status: "done",
        };
      }
      tasks[taskId].status = "done";
      tasks[taskId].cost = e.data?.cost || 0;
      tasks[taskId].tokens = e.data?.tokens || 0;
      tasks[taskId].outputSummary = e.data?.outputPreview || "";
      tasks[taskId].duration = (e.timestamp - (tasks[taskId].startTime || e.timestamp)) / 1000;
      if (e.data?.model) tasks[taskId].model = e.data.model;
    }
    if (e.type === "task.failed") {
      const taskId = e.data?.taskId;
      if (!taskId) continue;
      if (!tasks[taskId]) {
        tasks[taskId] = {
          id: taskId,
          name: formatTaskName(taskId, taskMap),
          agent: e.data?.agentName || "Unknown",
          status: "failed",
        };
      }
      tasks[taskId].status = "failed";
      tasks[taskId].error = e.data?.error || "Unknown error";
      tasks[taskId].duration = (e.timestamp - (tasks[taskId].startTime || e.timestamp)) / 1000;
    }
  }
  return Object.values(tasks);
}

// ── Compute stage timing from events ─────────────────────────────────

export function computeStageTiming(phaseEvents, startTime) {
  if (!phaseEvents || phaseEvents.length === 0) return null;
  const first = phaseEvents[0].timestamp;
  const last = phaseEvents[phaseEvents.length - 1].timestamp;
  return ((last - first) / 1000).toFixed(1);
}
