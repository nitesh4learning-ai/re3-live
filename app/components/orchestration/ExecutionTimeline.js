"use client";
// Execution Timeline — Step-by-step narrated log of orchestration events.
// Shows what happened, when, and WHY (educational annotations).
// Linked to canvas: click a step to highlight the corresponding node.
// Extensible: Phase 2+ event types auto-render via the type registry.
//
// v2: Layer accordion (auto-collapse completed layers), running glow,
//     hover tooltips for "How this works" annotations.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
    title: (d) => `Layer ${(d.layerIndex || 0) + 1}: ${d.taskCount} task${d.taskCount > 1 ? "s" : ""} running in parallel`,
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

  // Reflection events
  "reflection.start": {
    icon: "\u21BB",
    color: "#F59E0B",
    title: (d) => `${d.agentName} self-correcting after failure\u2026`,
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

  // A2A events
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
    title: (d) => `Cross-pollination done \u2014 ${d.refinedCount}/${d.totalAgents} agents refined`,
  },
  "a2a.skipped": {
    icon: "\u23ED",
    color: "#9CA3AF",
    title: (d) => `Cross-pollination skipped: ${d.reason}`,
  },

  // MCP events
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

// ── Group events into phases/layers ───────────────────────────────────
// Returns: [{ type: "pre-exec" | "layer" | "post-exec", label, events, status, layerIndex }]

function groupEventsByLayer(events) {
  const groups = [];
  let currentGroup = { type: "pre-exec", label: "Setup", events: [], status: "completed" };

  for (const event of events) {
    if (event.type === "layer.start") {
      // Flush current group
      if (currentGroup.events.length > 0) groups.push(currentGroup);
      const layerIdx = (event.data?.layerIndex || 0) + 1;
      currentGroup = {
        type: "layer",
        label: `Layer ${layerIdx}`,
        layerIndex: layerIdx,
        events: [event],
        status: "running",
      };
    } else if (event.type === "layer.complete") {
      currentGroup.events.push(event);
      currentGroup.status = "completed";
      groups.push(currentGroup);
      currentGroup = { type: "post-exec", label: "Post-execution", events: [], status: "running" };
    } else if (event.type === "phase.execute.start") {
      // Flush pre-exec group
      if (currentGroup.events.length > 0) groups.push(currentGroup);
      currentGroup = { type: "pre-exec", label: "Setup", events: [event], status: "completed" };
    } else if (event.type.startsWith("a2a.") ||
               event.type === "phase.synthesize.start" || event.type === "phase.synthesize.complete" ||
               event.type === "phase.complete" || event.type === "phase.failed") {
      // These go into post-exec
      if (currentGroup.type !== "post-exec") {
        if (currentGroup.events.length > 0) groups.push(currentGroup);
        currentGroup = { type: "post-exec", label: "Synthesis & Delivery", events: [], status: "running" };
      }
      currentGroup.events.push(event);
      if (event.type === "phase.complete") currentGroup.status = "completed";
      if (event.type === "phase.failed") currentGroup.status = "failed";
    } else {
      currentGroup.events.push(event);
    }
  }

  if (currentGroup.events.length > 0) groups.push(currentGroup);
  return groups;
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

function TimelineEvent({ event, isLast, startTime, isHighlighted, onClick, isRunningEvent }) {
  const [showDetail, setShowDetail] = useState(false);
  const cfg = getConfig(event.type);
  const title = typeof cfg.title === "function" ? cfg.title(event.data || {}) : cfg.title;
  const snippet = getDataSnippet(event);
  const hasAnnotation = !!event.annotation;

  return (
    <div
      data-event-id={event.id}
      onClick={() => onClick?.(event)}
      style={{
        display: "flex",
        gap: 12,
        cursor: event.nodeId ? "pointer" : "default",
        background: isHighlighted
          ? "rgba(147, 51, 234, 0.06)"
          : isRunningEvent
            ? "rgba(59, 130, 246, 0.04)"
            : "transparent",
        borderRadius: 8,
        padding: "2px 4px",
        marginLeft: -4,
        transition: "background 0.2s",
        boxShadow: isRunningEvent ? "0 0 0 1px rgba(59, 130, 246, 0.15)" : "none",
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
            boxShadow: isRunningEvent ? `0 0 8px ${cfg.color}60` : "none",
            animation: isRunningEvent ? "timelinePulse 2s infinite" : "none",
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
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: isRunningEvent ? "#2563EB" : "#111827",
            lineHeight: 1.3,
          }}>
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

        {/* Educational annotation — hover tooltip */}
        {hasAnnotation && (
          <span className="timeline-annotation-wrapper" style={{ position: "relative", display: "inline-block", marginTop: 4 }}>
            <span
              className="timeline-annotation-trigger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#F5F3FF",
                border: "1px solid #EDE9FE",
                fontSize: 9,
                fontWeight: 700,
                color: "#8B5CF6",
                cursor: "help",
              }}
            >
              i
            </span>
            <span
              className="timeline-annotation-tooltip"
              style={{
                display: "none",
                position: "absolute",
                left: 24,
                top: -4,
                zIndex: 20,
                width: 240,
                fontSize: 11,
                color: "#6D28D9",
                background: "#F5F3FF",
                padding: "8px 10px",
                borderRadius: 8,
                lineHeight: 1.6,
                border: "1px solid #EDE9FE",
                boxShadow: "0 4px 12px rgba(109, 40, 217, 0.1)",
                pointerEvents: "none",
              }}
            >
              {event.annotation}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Layer Accordion Group ─────────────────────────────────────────────

function LayerGroup({ group, startTime, highlightedEventId, onEventClick, defaultExpanded, allEvents }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Auto-expand when group becomes active
  useEffect(() => {
    if (group.status === "running") setExpanded(true);
  }, [group.status]);

  const isCompleted = group.status === "completed";
  const isRunning = group.status === "running";
  const isFailed = group.status === "failed";

  const statusColor = isCompleted ? "#10B981" : isRunning ? "#3B82F6" : isFailed ? "#EF4444" : "#9CA3AF";
  const statusLabel = isCompleted ? "Done" : isRunning ? "Active" : isFailed ? "Failed" : "";

  // Determine which task.start events don't have a matching task.complete yet
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

  // For pre-exec / post-exec, don't show accordion header, just render flat
  if (group.type === "pre-exec" || group.type === "post-exec") {
    return (
      <>
        {group.events.map((event, i) => {
          const isRunningEvt = (event.type === "task.start" && runningTaskIds.has(event.data?.taskId || event.id))
            || event.type === "phase.synthesize.start"
            || event.type === "reflection.start"
            || event.type === "a2a.start"
            || event.type === "a2a.refine.start"
            || (event.type === "phase.decompose.start" && !allEvents.some(e => e.type === "phase.decompose.complete"))
            || (event.type === "phase.assemble.start" && !allEvents.some(e => e.type === "phase.assemble.complete"));
          return (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={group.type === "post-exec" && i === group.events.length - 1}
              startTime={startTime}
              isHighlighted={highlightedEventId === event.id}
              onClick={onEventClick}
              isRunningEvent={isRunningEvt}
            />
          );
        })}
      </>
    );
  }

  // Layer group with collapsible accordion
  return (
    <div style={{ marginBottom: expanded ? 0 : 4 }}>
      {/* Accordion header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "6px 4px",
          marginLeft: -4,
          background: isRunning ? "rgba(59, 130, 246, 0.04)" : "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background 0.2s",
          boxShadow: isRunning ? "0 0 0 1px rgba(59, 130, 246, 0.12)" : "none",
        }}
      >
        {/* Collapse indicator */}
        <span style={{ fontSize: 9, color: "#9CA3AF", width: 12, textAlign: "center", flexShrink: 0 }}>
          {expanded ? "\u25BC" : "\u25B6"}
        </span>

        {/* Layer dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: statusColor,
            flexShrink: 0,
            boxShadow: isRunning ? `0 0 8px ${statusColor}50` : "none",
            animation: isRunning ? "timelinePulse 2s infinite" : "none",
          }}
        />

        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: isRunning ? "#2563EB" : "#374151",
          flex: 1,
          textAlign: "left",
        }}>
          {group.label}
        </span>

        {/* Status pill */}
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: statusColor,
          background: `${statusColor}10`,
          padding: "2px 8px",
          borderRadius: 6,
          flexShrink: 0,
        }}>
          {statusLabel}
        </span>

        {/* Event count */}
        <span style={{ fontSize: 9, color: "#9CA3AF", flexShrink: 0 }}>
          {group.events.length} events
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ paddingLeft: 4, marginTop: 4 }}>
          {group.events.map((event, i) => {
            const isRunningEvt = event.type === "task.start" && runningTaskIds.has(event.data?.taskId || event.id);
            return (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={i === group.events.length - 1}
                startTime={startTime}
                isHighlighted={highlightedEventId === event.id}
                onClick={onEventClick}
                isRunningEvent={isRunningEvt}
              />
            );
          })}
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

  const groups = useMemo(() => groupEventsByLayer(events), [events]);

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
          Execution Timeline
        </div>
        <div style={{ fontSize: 10, color: "#9CA3AF" }}>
          {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Scrollable event list — grouped by layer */}
      <div
        ref={containerRef}
        style={{
          padding: "12px 16px",
          maxHeight: 420,
          overflowY: "auto",
        }}
      >
        {groups.map((group, gi) => (
          <LayerGroup
            key={`${group.type}-${group.layerIndex || gi}`}
            group={group}
            startTime={startTime}
            highlightedEventId={highlightedEventId}
            onEventClick={onEventClick}
            defaultExpanded={group.status !== "completed" || gi === groups.length - 1}
            allEvents={events}
          />
        ))}
      </div>

      {/* CSS for hover tooltips, running glow */}
      <style>{`
        @keyframes timelinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .timeline-annotation-wrapper:hover .timeline-annotation-tooltip {
          display: block !important;
        }
      `}</style>
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
