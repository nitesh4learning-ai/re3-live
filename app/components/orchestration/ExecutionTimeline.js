"use client";
// Execution Timeline — Step-by-step narrated log of orchestration events.
// Shows what happened, when, and WHY (educational annotations).
// Linked to canvas: click a step to highlight the corresponding node.
// Extensible: Phase 2+ event types auto-render via the type registry.

import { useState, useEffect, useRef, useCallback } from "react";

// ── Event display config ──────────────────────────────────────────────
// Maps event types to visual properties and human-readable titles.
// Phase 2+: add new types here (a2a.requested, reflection.started, etc.)

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
    title: (d) => `Layer ${(d.layerIndex || 0) + 1}: ${d.taskCount} task${d.taskCount > 1 ? "s" : ""} running in parallel`,
  },
  "task.start": {
    icon: "\u2192",
    color: "#3B82F6",
    title: (d) => `${d.agentName} starting: "${d.taskTitle}"`,
  },
  "task.complete": {
    icon: "\u2713",
    color: "#10B981",
    title: (d) => `${d.agentName} completed ($${(d.cost || 0).toFixed(4)}, ${d.tokens || 0} tokens)`,
  },
  "task.failed": {
    icon: "\u2717",
    color: "#EF4444",
    title: (d) => `${d.agentName} failed: ${d.error}`,
  },
  "layer.complete": {
    icon: "\u25CF",
    color: "#6366F1",
    title: (d) => `Layer ${(d.layerIndex || 0) + 1} complete \u2014 ${d.completed}/${d.total} succeeded`,
  },
  "phase.synthesize.start": {
    icon: "\u25CE",
    color: "#9333EA",
    title: (d) => `Synthesis agent weaving ${d.inputCount || 0} outputs\u2026`,
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
};

// ── Helpers ────────────────────────────────────────────────────────────

function getConfig(type) {
  return EVENT_CONFIG[type] || { icon: "\u00B7", color: "#9CA3AF", title: () => type };
}

function formatRelativeTime(ts, startTs) {
  const delta = (ts - startTs) / 1000;
  return `${delta.toFixed(1)}s`;
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

// ── Timeline Event Component ──────────────────────────────────────────

function TimelineEvent({ event, isLast, startTime, isHighlighted, onClick }) {
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const cfg = getConfig(event.type);
  const title = typeof cfg.title === "function" ? cfg.title(event.data || {}) : cfg.title;
  const snippet = getDataSnippet(event);
  const hasAnnotation = !!event.annotation;
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      data-event-id={event.id}
      onClick={() => onClick?.(event)}
      style={{
        display: "flex",
        gap: 12,
        cursor: event.nodeId ? "pointer" : "default",
        background: isHighlighted ? "rgba(147, 51, 234, 0.06)" : "transparent",
        borderRadius: 8,
        padding: "2px 4px",
        marginLeft: -4,
        transition: "background 0.2s",
      }}
    >
      {/* Timeline rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: cfg.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "#FFF",
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {cfg.icon}
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, background: "#E5E7EB", minHeight: 16 }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 4 : 14, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace", flexShrink: 0 }}>
            {formatRelativeTime(event.timestamp, startTime)}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
            {title}
          </span>
        </div>

        {/* Data snippet (expandable for long content) */}
        {snippet && (
          <div style={{ marginTop: 4 }}>
            {snippet.includes("\n") ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetail(!showDetail); }}
                  style={{
                    fontSize: 10,
                    color: "#6B7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  {showDetail ? "\u25BC" : "\u25B6"} Details ({snippet.split("\n").length} items)
                </button>
                {showDetail && (
                  <div style={{
                    fontSize: 11,
                    color: "#6B7280",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                    marginTop: 4,
                    padding: "6px 8px",
                    background: "#F9FAFB",
                    borderRadius: 6,
                    border: "1px solid #F3F4F6",
                  }}>
                    {snippet}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4 }}>
                {snippet}
              </div>
            )}
          </div>
        )}

        {/* Educational annotation */}
        {hasAnnotation && (
          <div style={{ marginTop: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowAnnotation(!showAnnotation); }}
              style={{
                fontSize: 10,
                color: "#8B5CF6",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 600,
              }}
            >
              {showAnnotation ? "\u25BC" : "\u25B6"} How this works
            </button>
            {showAnnotation && (
              <div style={{
                fontSize: 11,
                color: "#6D28D9",
                background: "#F5F3FF",
                padding: "8px 10px",
                borderRadius: 8,
                marginTop: 4,
                lineHeight: 1.6,
                border: "1px solid #EDE9FE",
              }}>
                {event.annotation}
              </div>
            )}
          </div>
        )}
      </div>
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

  // Auto-scroll to latest event
  useEffect(() => {
    if (containerRef.current && events.length > 0) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [events.length]);

  // Scroll to a specific event (called externally via ref or by canvas click)
  const scrollToEvent = useCallback((eventId) => {
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-event-id="${eventId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  if (events.length === 0) {
    return (
      <div style={{
        padding: "24px 16px",
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 13,
      }}>
        Events will appear here as the orchestration runs...
      </div>
    );
  }

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      overflow: "hidden",
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
          Execution Timeline
        </div>
        <div style={{ fontSize: 10, color: "#9CA3AF" }}>
          {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Scrollable event list */}
      <div
        ref={containerRef}
        style={{
          padding: "12px 16px",
          maxHeight: 420,
          overflowY: "auto",
        }}
      >
        {events.map((event, i) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isLast={i === events.length - 1}
            startTime={startTime}
            isHighlighted={highlightedEventId === event.id}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}

// Export scrollToEvent helper for parent component to call
ExecutionTimeline.scrollToEvent = (containerEl, eventId) => {
  if (!containerEl) return;
  const el = containerEl.querySelector(`[data-event-id="${eventId}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
