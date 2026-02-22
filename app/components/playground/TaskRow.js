"use client";
// TaskRow — Individual task row within a layer, with expandable details.
// Shows status icon, full task name, agent, cost, tokens, duration.
// Expand button reveals output summary, model, and token breakdown.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME, ExpandButton } from "./shared";

const STATUS_ICONS = {
  done: "\u2713",
  running: "\u25CE",
  pending: "\u25CB",
  failed: "\u2717",
};

const STATUS_COLORS = {
  done: THEME.success,
  running: THEME.cyan,
  pending: THEME.textMuted,
  failed: THEME.error,
};

export default function TaskRow({ task }) {
  const [expanded, setExpanded] = useState(false);
  const icon = STATUS_ICONS[task.status] || STATUS_ICONS.pending;
  const color = STATUS_COLORS[task.status] || STATUS_COLORS.pending;

  return (
    <div
      style={{
        background: THEME.bgSurface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "border-color 0.2s",
        borderColor: expanded ? `${THEME.accent}40` : THEME.border,
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
        }}
      >
        {/* Status icon */}
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: color,
            fontWeight: 700,
            flexShrink: 0,
            animation: task.status === "running" ? "playgroundPulse 2s infinite" : "none",
          }}
        >
          {icon}
        </div>

        {/* Task name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: THEME.text,
              fontFamily: THEME.fontUI,
              lineHeight: 1.3,
            }}
          >
            {task.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: THEME.textMuted,
              fontFamily: THEME.fontUI,
              marginTop: 2,
            }}
          >
            {task.agent}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {task.cost !== undefined && (
            <span style={{ fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
              ${(task.cost || 0).toFixed(4)}
            </span>
          )}
          {task.tokens !== undefined && (
            <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              {(task.tokens || 0).toLocaleString()} tok
            </span>
          )}
          {task.duration !== undefined && (
            <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              {(task.duration || 0).toFixed(1)}s
            </span>
          )}
        </div>

        {/* Expand button */}
        {(task.outputSummary || task.model || task.error) && (
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        )}
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
                padding: "0 12px 12px",
                borderTop: `1px solid ${THEME.border}`,
                paddingTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Model */}
              {task.model && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI }}>Model</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                    {task.model.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Error message */}
              {task.error && (
                <div
                  style={{
                    fontSize: 13,
                    color: THEME.error,
                    fontFamily: THEME.fontUI,
                    lineHeight: 1.5,
                    padding: "8px 10px",
                    background: `${THEME.error}10`,
                    borderRadius: 6,
                    border: `1px solid ${THEME.error}20`,
                  }}
                >
                  {task.error}
                </div>
              )}

              {/* Output summary */}
              {task.outputSummary && (
                <div>
                  <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
                    Output Summary
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: THEME.textSecondary,
                      fontFamily: THEME.fontUI,
                      lineHeight: 1.6,
                      padding: "8px 10px",
                      background: THEME.bg,
                      borderRadius: 6,
                      border: `1px solid ${THEME.border}`,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {task.outputSummary}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
