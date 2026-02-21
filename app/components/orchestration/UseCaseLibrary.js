"use client";
// Use Case Library — Grid of tiles for completed orchestration runs.
// Each tile shows: title, type, team avatars, metrics, timestamp.
// Click a tile to view the full replay with timeline, canvas, and deliverable.

const USE_CASE_LABELS = {
  "micro-saas-validator": { label: "Micro-SaaS", color: "#3B82F6" },
  "ai-workflow-blueprint": { label: "AI Workflow", color: "#8B5CF6" },
  "creator-monetization": { label: "Creator Monetization", color: "#F59E0B" },
  "vertical-agent-design": { label: "Vertical Agent", color: "#10B981" },
  "growth-experiment": { label: "Growth Experiment", color: "#EF4444" },
};

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function RunTile({ run, onClick }) {
  const typeConfig = USE_CASE_LABELS[run.useCase?.type] || { label: run.useCase?.type, color: "#9CA3AF" };
  const m = run.metrics || {};
  const team = run.team || [];

  return (
    <button
      onClick={() => onClick(run.runId)}
      style={{
        textAlign: "left",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: "20px 18px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 170,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#9333EA";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(147, 51, 234, 0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E5E7EB";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Type badge + date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: typeConfig.color,
            background: `${typeConfig.color}10`,
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.02em",
          }}
        >
          {typeConfig.label}
        </span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>
          {formatDate(run.completedAt)}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#111827",
          fontFamily: "'Instrument Serif', Georgia, serif",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {run.useCase?.title}
      </h3>

      {/* Team avatars */}
      {team.length > 0 && (
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          {team.slice(0, 5).map((agent, i) => (
            <div
              key={agent.agentId || i}
              title={agent.name}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: agent.color || "#E5E7EB",
                border: "2px solid #FFF",
                marginLeft: i === 0 ? 0 : -6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
              }}
            >
              {agent.avatar || agent.name?.[0] || "?"}
            </div>
          ))}
          {team.length > 5 && (
            <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 4 }}>
              +{team.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Metrics row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: "auto",
          paddingTop: 6,
          borderTop: "1px solid #F3F4F6",
        }}
      >
        <MiniMetric label="Tasks" value={`${m.completedTasks || 0}/${m.totalTasks || 0}`} />
        <MiniMetric label="Success" value={`${m.successRate || 0}%`} />
        <MiniMetric
          label="Cost"
          value={`$${(m.budget?.costAccumulated || 0).toFixed(3)}`}
        />
        <MiniMetric
          label="Time"
          value={`${((m.elapsedMs || 0) / 1000).toFixed(1)}s`}
        />
      </div>
    </button>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 9, color: "#9CA3AF" }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{value}</span>
    </div>
  );
}

export default function UseCaseLibrary({ runs = [], onSelect }) {
  if (runs.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#9CA3AF",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>
          {"\u{1F4DA}"}
        </div>
        <p style={{ fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>
          No orchestrations yet
        </p>
        <p>Run your first use case above and it will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#9333EA",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Use Case Library ({runs.length})
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {runs.map((run) => (
          <RunTile key={run.runId} run={run} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}
