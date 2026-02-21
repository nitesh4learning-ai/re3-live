"use client";
// Execution Timeline — Pipeline-first view of orchestration events.
// Pre-renders all pipeline phases as containers from the start.
// Each phase fills in live as events arrive: pending → active → completed.
// Includes horizontal progress bar, collapsible phase groups, layer accordion.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── Pipeline Phase Definitions ────────────────────────────────────────

const PIPELINE_PHASES = [
  { id: "intake", label: "Intake", color: "#3B82F6" },
  { id: "decompose", label: "Decompose", color: "#8B5CF6" },
  { id: "assemble", label: "Assemble", color: "#F59E0B" },
  { id: "execute", label: "Execute", color: "#3B82F6" },
  { id: "a2a", label: "Refine", color: "#8B5CF6" },
  { id: "synthesize", label: "Synthesize", color: "#9333EA" },
  { id: "deliver", label: "Deliver", color: "#10B981" },
];

// Map event types → pipeline phase id
const EVENT_TO_PIPELINE = {
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

// ── Event display config ──────────────────────────────────────────────

const EVENT_CONFIG = {
  "phase.intake": {
    icon: "\u2713",
    color: "#3B82F6",
    title: () => "Use case validated",
  },
  "phase.decompose.start": {
    icon: "\u25CE",
    color: "#8B5CF6",
    title: () => "Decomposing use case into sub-tasks\u2026",
  },
  "phase.decompose.complete": {
    icon: "\u25C9",
    color: "#8B5CF6",
    title: (d) => `Decomposed into ${d.taskCount} sub-tasks across ${d.layerCount} layers`,
  },
  "phase.assemble.start": {
    icon: "\u25CE",
    color: "#F59E0B",
    title: (d) => `Scoring ${d.agentPoolSize || 1000} agents to find the best ${d.maxAgents || 5}\u2026`,
  },
  "phase.assemble.complete": {
    icon: "\u25C9",
    color: "#F59E0B",
    title: (d) => `Team assembled \u2014 ${d.teamSize} specialist agents`,
  },
  "phase.execute.start": {
    icon: "\u25B6",
    color: "#3B82F6",
    title: (d) => `Executing ${d.totalTasks} tasks across ${d.layerCount} layers`,
  },
  "layer.start": {
    icon: "\u25E6",
    color: "#6366F1",
    title: (d) => `Layer ${(d.layerIndex || 0) + 1}: ${d.taskCount} task${d.taskCount > 1 ? "s" : ""} in parallel`,
  },
  "task.start": {
    icon: "\u2192",
    color: "#3B82F6",
    title: (d) => `${d.agentName} starting: "${d.taskTitle}"`,
    isRunning: true,
  },
  "task.complete": {
    icon: "\u2713",
    color: "#10B981",
    title: (d) => `${d.agentName} completed ($${(d.cost || 0).toFixed(4)}, ${d.tokens || 0} tok)`,
  },
  "task.failed": {
    icon: "\u2717",
    color: "#EF4444",
    title: (d) => `${d.agentName} failed: ${d.error}`,
  },
  "layer.complete": {
    icon: "\u25CF",
    color: "#6366F1",
    title: (d) => `Layer ${(d.layerIndex || 0) + 1} done \u2014 ${d.completed}/${d.total} succeeded`,
  },
  "phase.synthesize.start": {
    icon: "\u25CE",
    color: "#9333EA",
    title: (d) => `Synthesis agent weaving ${d.inputCount || 0} outputs\u2026`,
    isRunning: true,
  },
  "phase.synthesize.complete": {
    icon: "\u25C9",
    color: "#9333EA",
    title: () => "Final deliverable assembled",
  },
  "phase.complete": {
    icon: "\u2605",
    color: "#10B981",
    title: (d) => `Done \u2014 ${d.completedTasks}/${d.totalTasks} tasks, $${(d.totalCost || 0).toFixed(4)}, ${((d.elapsedMs || 0) / 1000).toFixed(1)}s`,
  },
  "phase.failed": {
    icon: "\u2717",
    color: "#EF4444",
    title: (d) => `Orchestration failed: ${d.error}`,
  },
  "reflection.start": {
    icon: "\u21BB",
    color: "#F59E0B",
    title: (d) => `${d.agentName} self-correcting\u2026`,
    isRunning: true,
  },
  "reflection.success": {
    icon: "\u2713",
    color: "#10B981",
    title: (d) => `${d.agentName} recovered via reflection ($${(d.cost || 0).toFixed(4)})`,
  },
  "reflection.failed": {
    icon: "\u2717",
    color: "#EF4444",
    title: (d) => `${d.agentName} reflection failed: ${d.error}`,
  },
  "reflection.skipped": {
    icon: "\u23ED",
    color: "#9CA3AF",
    title: (d) => `Reflection skipped for ${d.agentName}: ${d.reason}`,
  },
  "a2a.start": {
    icon: "\u21C4",
    color: "#8B5CF6",
    title: (d) => `Cross-pollination: ${d.agentCount} agents sharing insights\u2026`,
    isRunning: true,
  },
  "a2a.refine.start": {
    icon: "\u2192",
    color: "#8B5CF6",
    title: (d) => `${d.agentName} refining with ${d.peerCount} peer outputs\u2026`,
    isRunning: true,
  },
  "a2a.refine.complete": {
    icon: "\u2713",
    color: "#8B5CF6",
    title: (d) => `${d.agentName} refined output ($${(d.cost || 0).toFixed(4)})`,
  },
  "a2a.refine.failed": {
    icon: "\u2717",
    color: "#D97706",
    title: (d) => `${d.agentName} A2A refinement failed (keeping original)`,
  },
  "a2a.complete": {
    icon: "\u25C9",
    color: "#8B5CF6",
    title: (d) => `Cross-pollination done \u2014 ${d.refinedCount}/${d.totalAgents} refined`,
  },
  "a2a.skipped": {
    icon: "\u23ED",
    color: "#9CA3AF",
    title: (d) => `Cross-pollination skipped: ${d.reason}`,
  },
  "mcp.enrich.start": {
    icon: "\u26A1",
    color: "#0EA5E9",
    title: (d) => `Fetching external context from ${d.urlCount} URL${d.urlCount > 1 ? "s" : ""}\u2026`,
  },
  "mcp.enrich.complete": {
    icon: "\u2713",
    color: "#0EA5E9",
    title: (d) => `External context loaded for ${d.agentName}`,
  },
  "mcp.enrich.failed": {
    icon: "\u2717",
    color: "#9CA3AF",
    title: () => "External data fetch failed (continuing without)",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

function getConfig(type) {
  return EVENT_CONFIG[type] || { icon: "\u00B7", color: "#9CA3AF", title: () => type };
}

function formatRelativeTime(ts, startTs) {
  const delta = (ts - startTs) / 1000;
  return `${delta.toFixed(1)}s`;
}

// ── Compute phase statuses from events ────────────────────────────────

function computePhaseStatuses(events) {
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
        // Mark all prior as completed
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

// ── Group events by pipeline phase ────────────────────────────────────

function groupEventsByPhase(events) {
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

// ── Sub-group execute phase events into layers ────────────────────────

function groupExecuteByLayer(executeEvents) {
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

// ── Data snippets for expandable detail ───────────────────────────────

function getDataSnippet(event) {
  const d = event.data || {};

  if (event.type === "phase.decompose.complete" && d.tasks) {
    return d.tasks.map((t) => `\u2022 ${t.title} (${t.id}${t.dependsOn?.length ? ` \u2190 ${t.dependsOn.join(", ")}` : ""})`).join("\n");
  }

  if (event.type === "phase.assemble.complete" && d.agents) {
    return d.agents.map((a) =>
      `\u2022 ${a.name} (${a.domain}) \u2192 ${a.taskTitle || "support"} [${(a.model || "auto").toUpperCase()}]`
    ).join("\n");
  }

  if (event.type === "phase.execute.start" && d.layerCount) {
    return `${d.layerCount} execution layer${d.layerCount > 1 ? "s" : ""}, tasks with no dependencies run first`;
  }

  if (event.type === "layer.start" && d.taskTitles) {
    return d.taskTitles.map((t) => `\u2022 ${t}`).join("\n");
  }

  if (event.type === "task.complete" && d.outputPreview) {
    return d.outputPreview + (d.outputPreview.length >= 200 ? "\u2026" : "");
  }

  return null;
}

// ── Pipeline Progress Bar ─────────────────────────────────────────────

function PipelineProgressBar({ statuses }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 0,
      padding: "12px 16px 8px",
    }}>
      {PIPELINE_PHASES.map((phase, i) => {
        const status = statuses[phase.id];
        const isCompleted = status === "completed";
        const isActive = status === "active";
        const isFailed = status === "failed";
        const isSkipped = status === "skipped";

        const dotColor = isCompleted ? "#10B981"
          : isActive ? phase.color
          : isFailed ? "#EF4444"
          : isSkipped ? "#D1D5DB"
          : "#E5E7EB";

        const lineColor = isCompleted ? "#10B981" : "#E5E7EB";

        return (
          <div key={phase.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {/* Phase dot + label */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 0,
              flex: "0 0 auto",
            }}>
              <div style={{
                width: isActive ? 12 : 10,
                height: isActive ? 12 : 10,
                borderRadius: "50%",
                background: dotColor,
                transition: "all 0.3s",
                boxShadow: isActive ? `0 0 8px ${phase.color}50` : "none",
                animation: isActive ? "pipelinePulse 2s infinite" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 7,
                color: "#FFF",
                fontWeight: 700,
              }}>
                {isCompleted ? "\u2713" : isFailed ? "\u2717" : isSkipped ? "\u2013" : ""}
              </div>
              <span style={{
                fontSize: 8,
                fontWeight: 600,
                color: isActive ? phase.color : isCompleted ? "#10B981" : "#9CA3AF",
                marginTop: 3,
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}>
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {i < PIPELINE_PHASES.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: lineColor,
                marginLeft: 4,
                marginRight: 4,
                marginBottom: 14,
                borderRadius: 1,
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Single Event Row ──────────────────────────────────────────────────

function EventRow({ event, isLast, startTime, isHighlighted, onClick, isRunning }) {
  const [showDetail, setShowDetail] = useState(false);
  const cfg = getConfig(event.type);
  const title = typeof cfg.title === "function" ? cfg.title(event.data || {}) : cfg.title;
  const snippet = getDataSnippet(event);

  return (
    <div
      data-event-id={event.id}
      onClick={() => onClick?.(event)}
      style={{
        display: "flex",
        gap: 10,
        cursor: event.nodeId ? "pointer" : "default",
        background: isHighlighted
          ? "rgba(147, 51, 234, 0.06)"
          : isRunning
            ? "rgba(59, 130, 246, 0.04)"
            : "transparent",
        borderRadius: 6,
        padding: "2px 6px",
        transition: "background 0.2s",
        boxShadow: isRunning ? "0 0 0 1px rgba(59, 130, 246, 0.12)" : "none",
      }}
    >
      {/* Rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: cfg.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 7,
          color: "#FFF",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 2,
          boxShadow: isRunning ? `0 0 6px ${cfg.color}50` : "none",
          animation: isRunning ? "pipelinePulse 2s infinite" : "none",
        }}>
          {cfg.icon}
        </div>
        {!isLast && <div style={{ width: 1.5, flex: 1, background: "#E5E7EB", minHeight: 12 }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 2 : 10, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "#9CA3AF", fontFamily: "monospace", flexShrink: 0 }}>
            {formatRelativeTime(event.timestamp, startTime)}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: isRunning ? "#2563EB" : "#111827",
            lineHeight: 1.3,
          }}>
            {title}
          </span>
        </div>

        {snippet && (
          <div style={{ marginTop: 3 }}>
            {snippet.includes("\n") ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetail(!showDetail); }}
                  style={{
                    fontSize: 9,
                    color: "#6B7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  {showDetail ? "\u25BC" : "\u25B6"} Details ({snippet.split("\n").length})
                </button>
                {showDetail && (
                  <div style={{
                    fontSize: 10,
                    color: "#6B7280",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                    marginTop: 3,
                    padding: "5px 7px",
                    background: "#F9FAFB",
                    borderRadius: 5,
                    border: "1px solid #F3F4F6",
                  }}>
                    {snippet}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.4 }}>
                {snippet}
              </div>
            )}
          </div>
        )}

        {event.annotation && (
          <span className="tl-ann-wrap" style={{ position: "relative", display: "inline-block", marginTop: 3 }}>
            <span className="tl-ann-trigger" style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#F5F3FF",
              border: "1px solid #EDE9FE",
              fontSize: 8,
              fontWeight: 700,
              color: "#8B5CF6",
              cursor: "help",
            }}>
              i
            </span>
            <span className="tl-ann-tooltip" style={{
              display: "none",
              position: "absolute",
              left: 20,
              top: -4,
              zIndex: 20,
              width: 220,
              fontSize: 10,
              color: "#6D28D9",
              background: "#F5F3FF",
              padding: "6px 8px",
              borderRadius: 6,
              lineHeight: 1.5,
              border: "1px solid #EDE9FE",
              boxShadow: "0 4px 12px rgba(109, 40, 217, 0.1)",
              pointerEvents: "none",
            }}>
              {event.annotation}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Layer Sub-group (within execute phase) ────────────────────────────

function LayerSubGroup({ layer, startTime, highlightedEventId, onEventClick, allEvents, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (layer.status === "running") setExpanded(true);
  }, [layer.status]);

  const isRunning = layer.status === "running";
  const isCompleted = layer.status === "completed";

  // Determine running tasks
  const runningTaskIds = useMemo(() => {
    const started = new Set();
    const finished = new Set();
    for (const e of allEvents) {
      if (e.type === "task.start") started.add(e.data?.taskId || e.id);
      if (e.type === "task.complete" || e.type === "task.failed") finished.add(e.data?.taskId || e.id);
    }
    const running = new Set();
    for (const id of started) {
      if (!finished.has(id)) running.add(id);
    }
    return running;
  }, [allEvents]);

  if (!layer.layerIndex) {
    // Not a real layer group (e.g. phase.execute.start event alone)
    return layer.events.map((event, i) => (
      <EventRow
        key={event.id}
        event={event}
        isLast={i === layer.events.length - 1}
        startTime={startTime}
        isHighlighted={highlightedEventId === event.id}
        onClick={onEventClick}
        isRunning={event.type === "task.start" && runningTaskIds.has(event.data?.taskId || event.id)}
      />
    ));
  }

  const statusColor = isCompleted ? "#10B981" : isRunning ? "#6366F1" : "#9CA3AF";

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "4px 6px",
          background: isRunning ? "rgba(99, 102, 241, 0.04)" : "transparent",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <span style={{ fontSize: 8, color: "#9CA3AF", width: 10 }}>
          {expanded ? "\u25BC" : "\u25B6"}
        </span>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: statusColor,
          flexShrink: 0,
          animation: isRunning ? "pipelinePulse 2s infinite" : "none",
        }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", flex: 1, textAlign: "left" }}>
          Layer {layer.layerIndex}
        </span>
        <span style={{
          fontSize: 8,
          fontWeight: 600,
          color: statusColor,
          background: `${statusColor}10`,
          padding: "1px 6px",
          borderRadius: 4,
        }}>
          {isCompleted ? "Done" : isRunning ? "Active" : ""}
        </span>
        <span style={{ fontSize: 8, color: "#9CA3AF" }}>
          {layer.events.length}
        </span>
      </button>

      {expanded && (
        <div style={{ paddingLeft: 8, marginTop: 2 }}>
          {layer.events.map((event, i) => {
            const isRunningEvt = event.type === "task.start" && runningTaskIds.has(event.data?.taskId || event.id);
            return (
              <EventRow
                key={event.id}
                event={event}
                isLast={i === layer.events.length - 1}
                startTime={startTime}
                isHighlighted={highlightedEventId === event.id}
                onClick={onEventClick}
                isRunning={isRunningEvt}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Phase Container ───────────────────────────────────────────────────

function PhaseContainer({ phase, status, events, startTime, highlightedEventId, onEventClick, allEvents }) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isFailed = status === "failed";
  const isSkipped = status === "skipped";
  const isPending = status === "pending";
  const hasEvents = events.length > 0;

  const [expanded, setExpanded] = useState(!isPending);

  // Auto-expand when phase becomes active
  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  // Auto-collapse completed phases when a new phase starts (except execute and deliver)
  useEffect(() => {
    if (isCompleted && phase.id !== "execute" && phase.id !== "deliver") {
      // Small delay to let users see the completion
      const t = setTimeout(() => setExpanded(false), 800);
      return () => clearTimeout(t);
    }
  }, [isCompleted, phase.id]);

  const statusColor = isCompleted ? "#10B981"
    : isActive ? phase.color
    : isFailed ? "#EF4444"
    : isSkipped ? "#D1D5DB"
    : "#D1D5DB";

  const statusLabel = isCompleted ? "Done"
    : isActive ? "Active"
    : isFailed ? "Failed"
    : isSkipped ? "Skipped"
    : "";

  // Determine running tasks for execute phase
  const runningTaskIds = useMemo(() => {
    if (phase.id !== "execute" && phase.id !== "a2a" && phase.id !== "synthesize") return new Set();
    const started = new Set();
    const finished = new Set();
    for (const e of allEvents) {
      if (e.type === "task.start") started.add(e.data?.taskId || e.id);
      if (e.type === "task.complete" || e.type === "task.failed") finished.add(e.data?.taskId || e.id);
    }
    const running = new Set();
    for (const id of started) {
      if (!finished.has(id)) running.add(id);
    }
    return running;
  }, [allEvents, phase.id]);

  // Check if a "start" event is still running (no matching complete)
  const isStartRunning = useCallback((event) => {
    if (event.type === "task.start") return runningTaskIds.has(event.data?.taskId || event.id);
    if (event.type === "phase.synthesize.start") return !allEvents.some(e => e.type === "phase.synthesize.complete");
    if (event.type === "phase.decompose.start") return !allEvents.some(e => e.type === "phase.decompose.complete");
    if (event.type === "phase.assemble.start") return !allEvents.some(e => e.type === "phase.assemble.complete");
    if (event.type === "a2a.start") return !allEvents.some(e => e.type === "a2a.complete" || e.type === "a2a.skipped");
    if (event.type === "a2a.refine.start") return !allEvents.some(e => e.type === "a2a.refine.complete" && e.data?.agentId === event.data?.agentId);
    if (event.type === "reflection.start") return !allEvents.some(e => (e.type === "reflection.success" || e.type === "reflection.failed") && e.data?.agentId === event.data?.agentId);
    return false;
  }, [runningTaskIds, allEvents]);

  // For execute phase, sub-group by layer
  const executeLayers = useMemo(() => {
    if (phase.id !== "execute") return null;
    return groupExecuteByLayer(events);
  }, [phase.id, events]);

  return (
    <div style={{
      borderLeft: `2px solid ${isPending ? "#F3F4F6" : statusColor}`,
      marginLeft: 4,
      paddingLeft: 10,
      marginBottom: 4,
      transition: "border-color 0.3s",
      opacity: isPending ? 0.5 : 1,
    }}>
      {/* Phase header */}
      <button
        onClick={() => hasEvents && setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "5px 0",
          background: "transparent",
          border: "none",
          cursor: hasEvents ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        {hasEvents && (
          <span style={{ fontSize: 8, color: "#9CA3AF", width: 10, flexShrink: 0 }}>
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
        )}
        {!hasEvents && <span style={{ width: 10, flexShrink: 0 }} />}

        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: isPending ? "#9CA3AF" : isActive ? phase.color : "#374151",
          flex: 1,
        }}>
          {phase.label}
        </span>

        {statusLabel && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            color: statusColor,
            background: isPending ? "transparent" : `${statusColor}10`,
            padding: "1px 7px",
            borderRadius: 4,
          }}>
            {statusLabel}
          </span>
        )}

        {isActive && (
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: phase.color,
            animation: "pipelinePulse 1.5s infinite",
            flexShrink: 0,
          }} />
        )}
      </button>

      {/* Phase events */}
      {expanded && hasEvents && (
        <div style={{ paddingBottom: 4, paddingTop: 2 }}>
          {phase.id === "execute" && executeLayers ? (
            executeLayers.map((layer, i) => (
              <LayerSubGroup
                key={`layer-${layer.layerIndex || i}`}
                layer={layer}
                startTime={startTime}
                highlightedEventId={highlightedEventId}
                onEventClick={onEventClick}
                allEvents={allEvents}
                defaultExpanded={layer.status !== "completed" || i === executeLayers.length - 1}
              />
            ))
          ) : (
            events.map((event, i) => (
              <EventRow
                key={event.id}
                event={event}
                isLast={i === events.length - 1}
                startTime={startTime}
                isHighlighted={highlightedEventId === event.id}
                onClick={onEventClick}
                isRunning={isStartRunning(event)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Timeline Component ───────────────────────────────────────────

export default function ExecutionTimeline({
  events = [],
  highlightedEventId = null,
  onEventClick,
}) {
  const containerRef = useRef(null);
  const startTime = events.length > 0 ? events[0].timestamp : Date.now();

  const statuses = useMemo(() => computePhaseStatuses(events), [events]);
  const phaseEvents = useMemo(() => groupEventsByPhase(events), [events]);

  // Auto-scroll to latest event
  useEffect(() => {
    if (containerRef.current && events.length > 0) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [events.length]);

  const hasAnyEvents = events.length > 0;

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 16px",
        borderBottom: "1px solid #F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#8B5CF6",
          textTransform: "uppercase",
        }}>
          Execution Pipeline
        </div>
        {hasAnyEvents && (
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Pipeline progress bar — always visible */}
      <PipelineProgressBar statuses={statuses} />

      {/* Phase containers */}
      <div
        ref={containerRef}
        style={{
          padding: "4px 16px 12px",
          maxHeight: 420,
          overflowY: "auto",
        }}
      >
        {!hasAnyEvents ? (
          <div style={{
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: 12,
            padding: "16px 0 8px",
          }}>
            Pipeline phases will fill in as events arrive...
          </div>
        ) : (
          PIPELINE_PHASES.map((phase) => (
            <PhaseContainer
              key={phase.id}
              phase={phase}
              status={statuses[phase.id]}
              events={phaseEvents[phase.id]}
              startTime={startTime}
              highlightedEventId={highlightedEventId}
              onEventClick={onEventClick}
              allEvents={events}
            />
          ))
        )}
      </div>

      {/* CSS */}
      <style>{`
        @keyframes pipelinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .tl-ann-wrap:hover .tl-ann-tooltip {
          display: block !important;
        }
      `}</style>
    </div>
  );
}

// Export scroll helper for parent
ExecutionTimeline.scrollToEvent = (containerEl, eventId) => {
  if (!containerEl) return;
  const el = containerEl.querySelector(`[data-event-id="${eventId}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
};
