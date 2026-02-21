"use client";
// Starting node — shows the submitted use case.

import { Handle, Position } from "@xyflow/react";

const TYPE_LABELS = {
  "micro-saas-validator": "Micro-SaaS Validator",
  "ai-workflow-blueprint": "AI Workflow Blueprint",
  "creator-monetization": "Creator Monetization",
  "vertical-agent-design": "Vertical Agent Design",
  "growth-experiment": "Growth Experiment",
};

export default function UseCaseNode({ data }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2px solid #9333EA",
        borderRadius: 16,
        padding: "16px 20px",
        minWidth: 260,
        maxWidth: 320,
        boxShadow: "0 4px 20px rgba(147, 51, 234, 0.12)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#9333EA",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        USE CASE
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.3,
          marginBottom: 6,
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        {(data.description || "").slice(0, 120)}
        {(data.description || "").length > 120 ? "..." : ""}
      </div>
      <div
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 600,
          color: "#9333EA",
          background: "rgba(147, 51, 234, 0.08)",
          padding: "2px 8px",
          borderRadius: 8,
        }}
      >
        {TYPE_LABELS[data.type] || data.type}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#9333EA", width: 8, height: 8 }}
      />
    </div>
  );
}
