"use client";
// Cost Ticker — Live token/cost dashboard overlay.

export default function CostTicker({ budget }) {
  if (!budget) return null;

  const pct = budget.percentUsed || 0;
  const barColor =
    pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#10B981";

  const breakdown = budget.modelBreakdown || {};

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#6B7280",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        Cost Tracker
      </div>

      {/* Token usage bar */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
            Tokens Used
          </span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>
            {(budget.tokensUsed || 0).toLocaleString()} / {(budget.totalTokenBudget || 0).toLocaleString()}
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "#F3F4F6",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(pct, 100)}%`,
              background: barColor,
              borderRadius: 3,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Cost and calls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            background: "#F9FAFB",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 9, color: "#9CA3AF", marginBottom: 2 }}>
            Est. Cost
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            ${(budget.costAccumulated || 0).toFixed(4)}
          </div>
        </div>
        <div
          style={{
            background: "#F9FAFB",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 9, color: "#9CA3AF", marginBottom: 2 }}>
            LLM Calls
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            {budget.callCount || 0}
          </div>
        </div>
      </div>

      {/* Model breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#9CA3AF",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            By Model
          </div>
          {Object.entries(breakdown).map(([model, stats]) => (
            <div
              key={model}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
                color: "#6B7280",
                padding: "3px 0",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              <span style={{ fontWeight: 600, textTransform: "uppercase" }}>
                {model}
              </span>
              <span>
                {stats.calls} calls \u00B7 {stats.tokens.toLocaleString()} tokens
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
