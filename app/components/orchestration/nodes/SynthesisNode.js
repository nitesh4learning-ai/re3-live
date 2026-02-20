"use client";
// Synthesis node — the final convergence point where outputs merge into the deliverable.

import { Handle, Position } from "@xyflow/react";

const STATUS_COLORS = {
  idle: { border: "#D1D5DB", bg: "#F9FAFB", text: "#9CA3AF" },
  running: { border: "#9333EA", bg: "#FAF5FF", text: "#9333EA" },
  completed: { border: "#10B981", bg: "#ECFDF5", text: "#10B981" },
  failed: { border: "#EF4444", bg: "#FEF2F2", text: "#EF4444" },
};

export default function SynthesisNode({ data }) {
  const status = data.status || "idle";
  const c = STATUS_COLORS[status] || STATUS_COLORS.idle;

  return (
    <div
      style={{
        background: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: 16,
        padding: "14px 20px",
        minWidth: 240,
        maxWidth: 300,
        boxShadow: `0 4px 20px ${c.border}15`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: c.text,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {status === "completed" ? "DELIVERABLE READY" : "SYNTHESIS"}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.3,
          marginBottom: 4,
        }}
      >
        {status === "completed"
          ? "Final Output Assembled"
          : status === "running"
            ? "Weaving outputs together..."
            : "Awaiting agent outputs"}
      </div>

      {data.successRate != null && (
        <div
          style={{
            fontSize: 10,
            color: "#6B7280",
            marginTop: 6,
          }}
        >
          {data.completedTasks}/{data.totalTasks} tasks completed
          {" \u00B7 "}
          {data.successRate}% success
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: c.border, width: 8, height: 8 }}
      />
    </div>
  );
}
