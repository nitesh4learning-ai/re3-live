"use client";
// Common Consciousness — Section 3 of the Playground.
// Shared awareness layer with Board / Desk / Flow tabs.
// Three large block tabs spread full-width, with content below.

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME, SectionHeader, ExpandButton } from "./shared";
import { formatTaskName, buildTaskMap } from "./pipeline-utils";

// ── Tab descriptions ─────────────────────────────────────────────────

const TAB_CONFIG = {
  board: {
    label: "Board",
    subtitle: "Shared knowledge store",
    description: "Shared blackboard where agents read and write knowledge in real-time",
  },
  desk: {
    label: "Desk",
    subtitle: "Agent workspaces",
    description: "Task assignments and work-in-progress for each agent",
  },
  flow: {
    label: "Flow",
    subtitle: "Live event stream",
    description: "Live event stream showing agent signals, completions, and handoffs",
  },
};

// ── CC Tab Block ─────────────────────────────────────────────────────

function CCTabBlock({ tabId, config, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      style={{
        flex: 1,
        padding: "16px 14px",
        background: isActive ? `${THEME.accent}12` : THEME.bgSurface,
        border: `1px solid ${isActive ? THEME.accent + "50" : THEME.border}`,
        borderBottom: isActive ? `3px solid ${THEME.accent}` : `3px solid transparent`,
        borderRadius: "10px 10px 0 0",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: isActive ? THEME.text : THEME.textSecondary,
          fontFamily: THEME.fontUI,
        }}
      >
        {config.label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: isActive ? THEME.textSecondary : THEME.textMuted,
          fontFamily: THEME.fontUI,
        }}
      >
        {config.subtitle}
      </div>

      {/* Hover description */}
      <AnimatePresence>
        {hovered && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              marginTop: 4,
              padding: "8px 14px",
              background: THEME.bgSurface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
              {config.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Board Content ────────────────────────────────────────────────────

function BoardContent({ entries, team }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const agentMap = useMemo(() => {
    const m = {};
    for (const a of team) m[a.agentId] = a;
    return m;
  }, [team]);

  const agentLabel = (id) => agentMap[id]?.name || id;

  if (entries.length === 0) {
    return (
      <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic", padding: 16 }}>
        Agents will write here as they work
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 10,
      }}
    >
      {entries.map(([key, entry]) => {
        const isExpanded = expandedKey === key;
        return (
          <div
            key={key}
            style={{
              background: THEME.bgSurface,
              border: `1px solid ${isExpanded ? THEME.accent + "40" : THEME.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              transition: "border-color 0.2s",
            }}
          >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text, fontFamily: THEME.fontMono }}>
                {key}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {(entry.readers?.length || 0) > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: THEME.info,
                    background: `${THEME.info}15`, padding: "2px 6px", borderRadius: 4,
                    fontFamily: THEME.fontMono,
                  }}>
                    {entry.readers?.length} read{entry.readers?.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: entry.hasValue ? THEME.success : THEME.textMuted,
                  fontFamily: THEME.fontMono,
                }}>
                  {entry.hasValue ? `v${entry.version}` : "empty"}
                </span>
              </div>
            </div>

            {/* Writer + readers */}
            <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 6 }}>
              by {agentLabel(entry.writtenBy)}
              {entry.readers?.length > 0 && (
                <span style={{ color: THEME.textMuted }}>
                  {" \u2192 "}{(entry.readers || []).map((r) => agentLabel(r)).join(", ")}
                </span>
              )}
            </div>

            {/* Value preview */}
            {entry.valuePreview && (
              <div style={{
                fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontUI,
                lineHeight: 1.5, marginBottom: 6,
              }}>
                {isExpanded ? entry.valuePreview : entry.valuePreview.slice(0, 120)}
              </div>
            )}

            {/* Expand for full content + version history */}
            {(entry.valuePreview?.length > 120 || entry.versionHistory?.length > 1) && (
              <ExpandButton expanded={isExpanded} onClick={() => setExpandedKey(isExpanded ? null : key)} />
            )}

            {/* Version history */}
            <AnimatePresence>
              {isExpanded && entry.versionHistory?.length > 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", marginTop: 8 }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: THEME.textMuted,
                    fontFamily: THEME.fontUI, marginBottom: 4,
                  }}>
                    Version History ({entry.versionHistory?.length} versions)
                  </div>
                  {(entry.versionHistory || []).map((vh) => (
                    <div key={vh.version} style={{
                      fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI,
                      padding: "4px 8px", background: THEME.bg, borderRadius: 4,
                      border: `1px solid ${THEME.border}`, marginBottom: 3,
                    }}>
                      <span style={{ fontWeight: 600, color: THEME.textSecondary }}>v{vh.version}</span>
                      {" by "}{agentLabel(vh.writtenBy)}
                      {vh.preview && (
                        <div style={{ color: THEME.textMuted, marginTop: 2, fontSize: 12 }}>
                          {vh.preview}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Desk Content ─────────────────────────────────────────────────────

function DeskContent({ entries, team, events }) {
  const taskMap = useMemo(() => buildTaskMap(events), [events]);

  const agentMap = useMemo(() => {
    const m = {};
    for (const a of team) m[a.agentId] = a;
    return m;
  }, [team]);

  // Build task list from events
  const taskList = useMemo(() => {
    const tasks = {};
    for (const e of events) {
      if (e.type === "task.start") {
        const id = e.data?.taskId;
        if (!id) continue;
        tasks[id] = {
          id,
          name: formatTaskName(id, taskMap),
          agentId: e.data?.agentId,
          agentName: e.data?.agentName || "Unknown",
          status: "running",
          output: null,
        };
      }
      if (e.type === "task.complete") {
        const id = e.data?.taskId;
        if (!id || !tasks[id]) continue;
        tasks[id].status = "done";
        tasks[id].output = e.data?.outputPreview || "";
      }
      if (e.type === "task.failed") {
        const id = e.data?.taskId;
        if (!id || !tasks[id]) continue;
        tasks[id].status = "failed";
        tasks[id].error = e.data?.error || "";
      }
    }
    return Object.values(tasks);
  }, [events, taskMap]);

  const [expandedTask, setExpandedTask] = useState(null);

  if (taskList.length === 0) {
    return (
      <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic", padding: 16 }}>
        No agent activity yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {taskList.map((task) => {
        const agent = agentMap[task.agentId];
        const color = agent?.color || "#6B7280";
        const isExpanded = expandedTask === task.id;
        const statusColor = task.status === "done" ? THEME.success : task.status === "failed" ? THEME.error : THEME.cyan;

        return (
          <div
            key={task.id}
            style={{
              background: THEME.bgSurface,
              border: `1px solid ${THEME.border}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
              }}
            >
              {/* Agent avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#FFF", flexShrink: 0,
                fontFamily: THEME.fontUI,
              }}>
                {agent?.avatar || "?"}
              </div>

              {/* Task info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text, fontFamily: THEME.fontUI }}>
                  {task.name}
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginTop: 1 }}>
                  Agent: {task.agentName}
                </div>
              </div>

              {/* Status */}
              <div style={{
                fontSize: 13, fontWeight: 600, color: statusColor,
                fontFamily: THEME.fontMono,
              }}>
                {task.status === "done" ? "Done" : task.status === "failed" ? "Failed" : "Running"}
              </div>

              {/* Expand for output */}
              {(task.output || task.error) && (
                <ExpandButton expanded={isExpanded} onClick={() => setExpandedTask(isExpanded ? null : task.id)} />
              )}
            </div>

            {/* Expanded output */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    padding: "0 12px 12px", borderTop: `1px solid ${THEME.border}`, paddingTop: 10,
                  }}>
                    {task.output && (
                      <div style={{
                        fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontUI,
                        lineHeight: 1.6, padding: "8px 10px", background: THEME.bg,
                        borderRadius: 6, border: `1px solid ${THEME.border}`, whiteSpace: "pre-wrap",
                      }}>
                        {task.output}
                      </div>
                    )}
                    {task.error && (
                      <div style={{
                        fontSize: 13, color: THEME.error, fontFamily: THEME.fontUI,
                        lineHeight: 1.5, padding: "8px 10px", background: `${THEME.error}10`,
                        borderRadius: 6, border: `1px solid ${THEME.error}20`,
                      }}>
                        {task.error}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Flow Content (Chronological Event Log) ───────────────────────────

function FlowContent({ events, team }) {
  const agentMap = useMemo(() => {
    const m = {};
    for (const a of team) m[a.agentId] = a;
    return m;
  }, [team]);

  const startTime = events.length > 0 ? events[0].timestamp : Date.now();
  const taskMap = useMemo(() => buildTaskMap(events), [events]);

  // Build chronological event descriptions
  const flowEvents = useMemo(() => {
    const result = [];
    for (const e of events) {
      let description = "";
      let type = "info";

      switch (e.type) {
        case "phase.intake":
          description = "Use case validated and accepted";
          type = "complete";
          break;
        case "phase.decompose.start":
          description = "Started decomposing the question into sub-tasks";
          type = "start";
          break;
        case "phase.decompose.complete":
          description = `Decomposed into ${e.data?.taskCount || 0} sub-tasks across ${e.data?.layerCount || 0} layers`;
          type = "complete";
          break;
        case "phase.assemble.start":
          description = `Scoring ${e.data?.agentPoolSize || "available"} agents to find the best specialists`;
          type = "start";
          break;
        case "phase.assemble.complete":
          description = `Team assembled with ${e.data?.teamSize || 0} specialist agents`;
          type = "complete";
          break;
        case "layer.start":
          description = `Layer ${(e.data?.layerIndex || 0) + 1} started with ${e.data?.taskCount || 0} parallel tasks`;
          type = "start";
          break;
        case "task.start": {
          const name = formatTaskName(e.data?.taskId, taskMap);
          description = `${e.data?.agentName || "Agent"} started ${name}`;
          type = "start";
          break;
        }
        case "task.complete": {
          const name = formatTaskName(e.data?.taskId, taskMap);
          description = `${e.data?.agentName || "Agent"} completed ${name} (${(e.data?.tokens || 0).toLocaleString()} tokens, $${(e.data?.cost || 0).toFixed(4)})`;
          type = "complete";
          break;
        }
        case "task.failed":
          description = `${e.data?.agentName || "Agent"} failed: ${e.data?.error || "unknown error"}`;
          type = "error";
          break;
        case "layer.complete":
          description = `Layer ${(e.data?.layerIndex || 0) + 1} complete, ${e.data?.completed || 0}/${e.data?.total || 0} tasks succeeded`;
          type = "complete";
          break;
        case "a2a.start":
          description = `${e.data?.agentCount || 0} agents began cross-pollinating insights`;
          type = "start";
          break;
        case "a2a.refine.start":
          description = `${e.data?.agentName || "Agent"} started refining with ${e.data?.peerCount || 0} peer outputs`;
          type = "start";
          break;
        case "a2a.refine.complete":
          description = `${e.data?.agentName || "Agent"} refined output ($${(e.data?.cost || 0).toFixed(4)})`;
          type = "complete";
          break;
        case "a2a.complete":
          description = `Cross-pollination done, ${e.data?.refinedCount || 0} of ${e.data?.totalAgents || 0} agents refined`;
          type = "complete";
          break;
        case "a2a.skipped":
          description = `Cross-pollination skipped: ${e.data?.reason || "not needed"}`;
          type = "info";
          break;
        case "reflection.start":
          description = `${e.data?.agentName || "Agent"} started self-correction`;
          type = "start";
          break;
        case "reflection.success":
          description = `${e.data?.agentName || "Agent"} recovered via self-reflection ($${(e.data?.cost || 0).toFixed(4)})`;
          type = "complete";
          break;
        case "reflection.failed":
          description = `${e.data?.agentName || "Agent"} self-reflection failed: ${e.data?.error || "unknown"}`;
          type = "error";
          break;
        case "reflection.skipped":
          description = `Self-reflection skipped for ${e.data?.agentName || "agent"}: ${e.data?.reason || "not needed"}`;
          type = "info";
          break;
        case "phase.synthesize.start":
          description = `Synthesis agent began weaving ${e.data?.inputCount || 0} outputs into a unified answer`;
          type = "start";
          break;
        case "phase.synthesize.complete":
          description = "Final deliverable assembled successfully";
          type = "complete";
          break;
        case "phase.complete":
          description = `Orchestration completed: ${e.data?.completedTasks || 0}/${e.data?.totalTasks || 0} tasks, $${(e.data?.totalCost || 0).toFixed(4)}, ${((e.data?.elapsedMs || 0) / 1000).toFixed(1)}s`;
          type = "complete";
          break;
        case "phase.failed":
          description = `Orchestration failed: ${e.data?.error || "unknown error"}`;
          type = "error";
          break;
        case "mcp.enrich.start":
          description = `Fetching external context from ${e.data?.urlCount || 1} source${(e.data?.urlCount || 1) > 1 ? "s" : ""}`;
          type = "start";
          break;
        case "mcp.enrich.complete":
          description = `External context loaded for ${e.data?.agentName || "agent"}`;
          type = "complete";
          break;
        case "mcp.enrich.failed":
          description = "External data fetch failed, continuing without it";
          type = "error";
          break;
        default:
          return;
      }

      if (description) {
        result.push({
          timestamp: ((e.timestamp - startTime) / 1000).toFixed(1),
          description,
          type,
        });
      }
    }
    return result;
  }, [events, startTime, taskMap]);

  const typeColors = {
    start: THEME.cyan,
    complete: THEME.success,
    error: THEME.error,
    info: THEME.textMuted,
  };

  const typeIcons = {
    start: "\u25B6",
    complete: "\u2713",
    error: "\u2717",
    info: "\u00B7",
  };

  if (flowEvents.length === 0) {
    return (
      <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic", padding: 16 }}>
        Events will appear here as the orchestration runs
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {flowEvents.map((event, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "6px 10px",
            borderRadius: 6,
            transition: "background 0.15s",
          }}
        >
          {/* Timestamp */}
          <span style={{
            fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontMono,
            flexShrink: 0, minWidth: 48, textAlign: "right",
          }}>
            {event.timestamp}s
          </span>

          {/* Type icon */}
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: `${typeColors[event.type]}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: typeColors[event.type], fontWeight: 700,
            flexShrink: 0, marginTop: 1,
          }}>
            {typeIcons[event.type]}
          </div>

          {/* Description */}
          <span style={{
            fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI,
            lineHeight: 1.4,
          }}>
            {event.description}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Common Consciousness Section ────────────────────────────────

export default function CommonConsciousness({ stateEntries, episodicLog, team, events }) {
  const safeEvents = events || [];
  const safeTeam = team || [];
  const safeEpisodicLog = episodicLog || [];
  const safeStateEntries = stateEntries || {};
  const [activeTab, setActiveTab] = useState("board");
  const entries = Object.entries(safeStateEntries);

  if (entries.length === 0 && safeEpisodicLog.length === 0 && safeEvents.length === 0) return null;

  return (
    <div
      style={{
        background: THEME.bgSection,
        borderRadius: 16,
        padding: "24px",
        border: `1px solid ${THEME.border}`,
      }}
    >
      <SectionHeader
        title="Common Consciousness"
        subtitle={"Shared Awareness \u2014 every agent sees what every other agent knows"}
      />

      {/* Three large block tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
        {Object.entries(TAB_CONFIG).map(([id, config]) => (
          <CCTabBlock
            key={id}
            tabId={id}
            config={config}
            isActive={activeTab === id}
            onClick={() => setActiveTab(id)}
          />
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          background: THEME.bg,
          border: `1px solid ${THEME.border}`,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "16px",
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        {activeTab === "board" && <BoardContent entries={entries} team={safeTeam} />}
        {activeTab === "desk" && <DeskContent entries={entries} team={safeTeam} events={safeEvents} />}
        {activeTab === "flow" && <FlowContent events={safeEvents} team={safeTeam} />}
      </div>
    </div>
  );
}
