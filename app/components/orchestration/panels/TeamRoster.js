"use client";
// Team Roster — Shows the assembled agent team with role assignments.

export default function TeamRoster({ team = [] }) {
  if (team.length === 0) return null;

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
        Team ({team.length} agents)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {team.map((member) => (
          <div
            key={member.agentId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 0",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 9,
                color: member.color || "#6B7280",
                background: `${member.color || "#6B7280"}15`,
                border: `1.5px dashed ${member.color || "#6B7280"}50`,
                flexShrink: 0,
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

            {/* Task badge */}
            {member.taskTitle && (
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
        ))}
      </div>
    </div>
  );
}
