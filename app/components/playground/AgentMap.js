"use client";
// Agent Map — Grid of agent cards showing the assembled workforce.
// Each card shows avatar, name, role, status, and assigned task.
// Click to expand for details (model, tokens, cost, output summary).

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME, SectionHeader, StatusBadge, ExpandButton, StatPill } from "./shared";

// ── Derive agent statuses from events ────────────────────────────────

function deriveAgentStatuses(events) {
  const started = {};
  const finished = {};

  for (const e of events) {
    if (e.type === "task.start" && e.data?.agentId) {
      started[e.data.agentId] = {
        taskId: e.data.taskId,
        taskTitle: e.data.taskTitle,
        timestamp: e.timestamp,
      };
    }
    if ((e.type === "task.complete" || e.type === "task.failed") && e.data?.agentId) {
      finished[e.data.agentId] = {
        taskId: e.data.taskId,
        status: e.type === "task.complete" ? "done" : "failed",
        cost: e.data.cost || 0,
        tokens: e.data.tokens || 0,
        outputPreview: e.data.outputPreview || "",
        timestamp: e.timestamp,
        duration: started[e.data.agentId]
          ? (e.timestamp - started[e.data.agentId].timestamp) / 1000
          : 0,
      };
    }
  }

  return { started, finished };
}

// ── Agent Status Dot ─────────────────────────────────────────────────

function AgentStatusDot({ status }) {
  const colors = {
    active: THEME.success,
    done: THEME.info,
    failed: THEME.error,
    idle: THEME.textMuted,
  };
  const c = colors[status] || colors.idle;

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: c,
        flexShrink: 0,
        boxShadow: status === "active" ? `0 0 8px ${c}60` : "none",
        animation: status === "active" ? "playgroundPulse 2s infinite" : "none",
      }}
    />
  );
}

// ── Agent Card ───────────────────────────────────────────────────────

function AgentCard({ agent, status, finishedData, taskMap }) {
  const [expanded, setExpanded] = useState(false);
  const color = agent.color || "#6B7280";

  const statusLabel = status === "active" ? "Active"
    : status === "done" ? "Done"
    : status === "failed" ? "Failed"
    : "Idle";

  // Format task name
  const taskId = agent.assignedTask || agent.taskTitle;
  const taskDisplay = taskId
    ? (taskId.startsWith("t") && taskId.length <= 3
      ? `Task ${taskId.replace(/^t/, "")}: ${taskMap?.[taskId] || agent.taskTitle || ""}`
      : agent.taskTitle || taskId)
    : "Unassigned";

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      style={{
        background: THEME.bgSurface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.2s",
        borderColor: expanded ? THEME.accent + "50" : THEME.border,
      }}
    >
      {/* Card face */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Top row: avatar + name + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#FFF",
              flexShrink: 0,
              fontFamily: THEME.fontUI,
            }}
          >
            {agent.avatar || agent.name?.slice(0, 2) || "?"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: THEME.text,
                fontFamily: THEME.fontUI,
                lineHeight: 1.2,
              }}
            >
              {agent.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: THEME.textMuted,
                fontFamily: THEME.fontUI,
                lineHeight: 1.3,
                marginTop: 2,
              }}
            >
              {agent.domain || agent.specialization || "Agent"}
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <AgentStatusDot status={status} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: status === "active" ? THEME.success
                  : status === "done" ? THEME.info
                  : status === "failed" ? THEME.error
                  : THEME.textMuted,
                fontFamily: THEME.fontUI,
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Task assignment */}
        <div
          style={{
            fontSize: 13,
            color: THEME.textSecondary,
            fontFamily: THEME.fontUI,
            lineHeight: 1.4,
          }}
        >
          {taskDisplay}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 16px 14px",
                borderTop: `1px solid ${THEME.border}`,
                paddingTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Model */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>Model</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                  {(agent.model || "auto").toUpperCase()}
                </span>
              </div>

              {/* Stats from completion */}
              {finishedData && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>Tokens</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                      {(finishedData.tokens || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>Cost</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                      ${(finishedData.cost || 0).toFixed(4)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>Duration</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                      {(finishedData.duration || 0).toFixed(1)}s
                    </span>
                  </div>

                  {/* Output summary */}
                  {finishedData.outputPreview && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
                        Output Summary
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: THEME.textSecondary,
                          fontFamily: THEME.fontUI,
                          lineHeight: 1.5,
                          padding: "8px 10px",
                          background: THEME.bg,
                          borderRadius: 6,
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        {finishedData.outputPreview}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Agent Map Section ────────────────────────────────────────────────

export default function AgentMap({ team = [], events = [] }) {
  const { started, finished } = useMemo(() => deriveAgentStatuses(events), [events]);

  const taskMap = useMemo(() => {
    const map = {};
    for (const e of events) {
      if (e.type === "phase.decompose.complete" && e.data?.tasks) {
        for (const t of e.data.tasks) map[t.id] = t.title;
      }
      if (e.type === "task.start" && e.data?.taskId && e.data?.taskTitle) {
        map[e.data.taskId] = e.data.taskTitle;
      }
    }
    return map;
  }, [events]);

  const agentStatuses = useMemo(() => {
    const statuses = {};
    for (const a of team) {
      if (finished[a.agentId]) {
        statuses[a.agentId] = finished[a.agentId].status === "done" ? "done" : "failed";
      } else if (started[a.agentId]) {
        statuses[a.agentId] = "active";
      } else {
        statuses[a.agentId] = "idle";
      }
    }
    return statuses;
  }, [team, started, finished]);

  const activeCount = Object.values(agentStatuses).filter((s) => s === "active").length;
  const doneCount = Object.values(agentStatuses).filter((s) => s === "done").length;

  if (team.length === 0) return null;

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
        title="Agent Map"
        subtitle="Workforce assembled for this run"
        rightContent={
          <div style={{ display: "flex", gap: 8 }}>
            <StatPill label="Total" value={team.length} color={THEME.textSecondary} />
            {activeCount > 0 && <StatPill label="Active" value={activeCount} color={THEME.success} />}
            {doneCount > 0 && <StatPill label="Done" value={doneCount} color={THEME.info} />}
          </div>
        }
      />

      {/* Agent grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {team.map((agent) => (
          <AgentCard
            key={agent.agentId}
            agent={agent}
            status={agentStatuses[agent.agentId] || "idle"}
            finishedData={finished[agent.agentId] || null}
            taskMap={taskMap}
          />
        ))}
      </div>
    </div>
  );
}
