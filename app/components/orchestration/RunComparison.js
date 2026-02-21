"use client";
// Run Comparison — Side-by-side view of two orchestration runs.
// Compares deliverables, metrics, team composition, and cost.
// Accessible from the Use Case Library by selecting two runs.

import { useState } from "react";

function MetricRow({ label, left, right }) {
  const leftVal = typeof left === "number" ? left : 0;
  const rightVal = typeof right === "number" ? right : 0;
  const better = leftVal < rightVal ? "left" : leftVal > rightVal ? "right" : "equal";

  // For success rate, higher is better; for cost/time, lower is better
  const higherIsBetter = label === "Success" || label === "Tasks";
  const leftWins = higherIsBetter
    ? leftVal > rightVal
    : leftVal < rightVal;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px 1fr",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid #F3F4F6",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: leftWins && better !== "equal" ? "#10B981" : "#374151",
          textAlign: "right",
        }}
      >
        {typeof left === "string" ? left : String(left)}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#9CA3AF",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: !leftWins && better !== "equal" ? "#10B981" : "#374151",
          textAlign: "left",
        }}
      >
        {typeof right === "string" ? right : String(right)}
      </div>
    </div>
  );
}

function DeliverableColumn({ run, label }) {
  if (!run) {
    return (
      <div
        style={{
          flex: 1,
          padding: 16,
          background: "#F9FAFB",
          borderRadius: 10,
          color: "#9CA3AF",
          fontSize: 13,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        Select a run to compare
      </div>
    );
  }

  const m = run.metrics || {};

  return (
    <div
      style={{
        flex: 1,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #F3F4F6",
          background: "#FAFAFA",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#9CA3AF",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <h4
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#111827",
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.3,
          }}
        >
          {run.useCase?.title}
        </h4>
        {/* Team avatars */}
        {run.team?.length > 0 && (
          <div style={{ display: "flex", gap: 0, marginTop: 6 }}>
            {run.team.slice(0, 5).map((a, i) => (
              <div
                key={a.agentId || i}
                title={a.name}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: a.color || "#E5E7EB",
                  border: "2px solid #FFF",
                  marginLeft: i === 0 ? 0 : -5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "#FFF",
                  fontWeight: 700,
                }}
              >
                {a.avatar || "?"}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deliverable text */}
      <div
        style={{
          padding: 16,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          maxHeight: 500,
          overflowY: "auto",
          fontFamily: "'Source Sans 3', 'Inter', sans-serif",
        }}
      >
        {run.deliverable || "(No deliverable text)"}
      </div>
    </div>
  );
}

export default function RunComparison({ runs = [], onClose }) {
  const [leftRunId, setLeftRunId] = useState(runs[0]?.runId || null);
  const [rightRunId, setRightRunId] = useState(runs[1]?.runId || null);

  const leftRun = runs.find((r) => r.runId === leftRunId);
  const rightRun = runs.find((r) => r.runId === rightRunId);

  const lm = leftRun?.metrics || {};
  const rm = rightRun?.metrics || {};

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#9333EA",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Compare Runs
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
            Side-by-side comparison of deliverables, metrics, and team.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 600,
              color: "#6B7280",
              background: "#F3F4F6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        )}
      </div>

      {/* Run selectors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 40px 1fr",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <select
          value={leftRunId || ""}
          onChange={(e) => setLeftRunId(e.target.value || null)}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            background: "#F9FAFB",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <option value="">Select Run A...</option>
          {runs.map((r) => (
            <option key={r.runId} value={r.runId}>
              {r.useCase?.title?.slice(0, 50) || r.runId}
            </option>
          ))}
        </select>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#9CA3AF",
          }}
        >
          vs
        </div>

        <select
          value={rightRunId || ""}
          onChange={(e) => setRightRunId(e.target.value || null)}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            background: "#F9FAFB",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <option value="">Select Run B...</option>
          {runs.map((r) => (
            <option key={r.runId} value={r.runId}>
              {r.useCase?.title?.slice(0, 50) || r.runId}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics comparison */}
      {leftRun && rightRun && (
        <div
          style={{
            background: "#FAFAFA",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#6B7280",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Metrics
          </div>
          <MetricRow
            label="Tasks"
            left={`${lm.completedTasks || 0}/${lm.totalTasks || 0}`}
            right={`${rm.completedTasks || 0}/${rm.totalTasks || 0}`}
          />
          <MetricRow
            label="Success"
            left={`${lm.successRate || 0}%`}
            right={`${rm.successRate || 0}%`}
          />
          <MetricRow
            label="Time"
            left={`${((lm.elapsedMs || 0) / 1000).toFixed(1)}s`}
            right={`${((rm.elapsedMs || 0) / 1000).toFixed(1)}s`}
          />
          <MetricRow
            label="Cost"
            left={`$${(lm.budget?.costAccumulated || 0).toFixed(4)}`}
            right={`$${(rm.budget?.costAccumulated || 0).toFixed(4)}`}
          />
          <MetricRow
            label="Tokens"
            left={(lm.budget?.tokensUsed || 0).toLocaleString()}
            right={(rm.budget?.tokensUsed || 0).toLocaleString()}
          />
        </div>
      )}

      {/* Side-by-side deliverables */}
      <div style={{ display: "flex", gap: 16 }}>
        <DeliverableColumn run={leftRun} label="Run A" />
        <DeliverableColumn run={rightRun} label="Run B" />
      </div>
    </div>
  );
}
