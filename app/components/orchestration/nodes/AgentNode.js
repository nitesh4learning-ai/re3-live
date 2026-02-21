"use client";
// Agent node — shows an agent executing a task with live status.

import { Handle, Position } from "@xyflow/react";

const STATUS_STYLES = {
  idle: {
    borderColor: "#D1D5DB",
    bgColor: "#F9FAFB",
    dotColor: "#9CA3AF",
    label: "Idle",
  },
  running: {
    borderColor: "#3B82F6",
    bgColor: "#EFF6FF",
    dotColor: "#3B82F6",
    label: "Running",
    pulse: true,
  },
  waiting: {
    borderColor: "#F59E0B",
    bgColor: "#FFFBEB",
    dotColor: "#F59E0B",
    label: "Waiting",
  },
  completed: {
    borderColor: "#10B981",
    bgColor: "#ECFDF5",
    dotColor: "#10B981",
    label: "Done",
  },
  failed: {
    borderColor: "#EF4444",
    bgColor: "#FEF2F2",
    dotColor: "#EF4444",
    label: "Error",
  },
};

export default function AgentNode({ data }) {
  const status = data.status || "idle";
  const s = STATUS_STYLES[status] || STATUS_STYLES.idle;

  return (
    <div
      style={{
        background: s.bgColor,
        border: `2px solid ${data.highlighted ? "#9333EA" : s.borderColor}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 200,
        maxWidth: 240,
        boxShadow: data.highlighted
          ? "0 0 0 3px rgba(147, 51, 234, 0.35), 0 0 20px rgba(147, 51, 234, 0.15)"
          : `0 2px 12px ${s.borderColor}20`,
        transition: "all 0.3s ease",
        animation: s.pulse ? "pulse 2s infinite" : "none",
      }}
    >
      {/* Agent header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 10,
            color: data.agentColor || "#6B7280",
            background: `${data.agentColor || "#6B7280"}15`,
            border: `1.5px dashed ${data.agentColor || "#6B7280"}50`,
            flexShrink: 0,
          }}
        >
          {data.agentAvatar || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.agentName || "Agent"}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#9CA3AF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.domain || ""}
          </div>
        </div>
        {/* Status dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: s.dotColor,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Task info */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 4,
          lineHeight: 1.3,
        }}
      >
        {data.taskTitle || "Pending assignment"}
      </div>

      {/* Model badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#6B7280",
            background: "#F3F4F6",
            padding: "1px 6px",
            borderRadius: 6,
          }}
        >
          {(data.model || "auto").toUpperCase()}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: s.dotColor,
          }}
        >
          {s.label}
        </span>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: s.borderColor, width: 6, height: 6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: s.borderColor, width: 6, height: 6 }}
      />
    </div>
  );
}
