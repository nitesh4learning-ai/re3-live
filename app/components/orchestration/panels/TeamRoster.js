"use client";
// Team Roster — Shows the assembled agent team with role assignments.
// v2: Solid color avatars, colored left-border accent per agent,
//     active agent highlighting with soft glow when working.

export default function TeamRoster({ team = [], activeAgentIds = [] }) {
  if (team.length === 0) return null;

  const activeSet = new Set(activeAgentIds);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
        Team ({team.length} agents)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {team.map((member) => {
          const isActive = activeSet.has(member.agentId);
          const color = member.color || "#6B7280";

          return (
            <div
              key={member.agentId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                borderLeft: `3px solid ${color}`,
                background: isActive ? `${color}08` : "#FAFAFA",
                boxShadow: isActive ? `0 0 12px ${color}20, 0 0 0 1px ${color}25` : "none",
                transition: "all 0.3s ease",
                animation: isActive ? "agentActiveGlow 2s infinite" : "none",
              }}
            >
              {/* Avatar — solid background */}
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
                  color: "#FFFFFF",
                  background: color,
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 8px ${color}40` : "none",
                }}
              >
                {member.avatar || "?"}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {member.name}
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
                  {member.domain}
                  {member.specialization ? ` / ${member.specialization}` : ""}
                </div>
              </div>

              {/* Status indicator for active agents */}
              {isActive && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#3B82F6",
                    flexShrink: 0,
                    animation: "agentActiveGlow 1.5s infinite",
                    boxShadow: "0 0 6px rgba(59, 130, 246, 0.5)",
                  }}
                />
              )}

              {/* Task badge */}
              {member.taskTitle && !isActive && (
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#4B5563",
                    background: "#F3F4F6",
                    padding: "2px 8px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {member.taskTitle}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes agentActiveGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
