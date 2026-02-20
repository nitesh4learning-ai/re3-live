"use client";
// Blackboard Panel — Live shared state viewer alongside the canvas.

import { useState } from "react";

export default function BlackboardPanel({ stateEntries = {}, episodicLog = [] }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const entries = Object.entries(stateEntries);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        maxHeight: 400,
        overflow: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#9333EA",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        Blackboard
      </div>

      {entries.length === 0 ? (
        <div style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>
          No entries yet — agents will write here as they work.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(([key, entry]) => (
            <div
              key={key}
              onClick={() => setExpandedKey(expandedKey === key ? null : key)}
              style={{
                background: entry.hasValue ? "#F9FAFB" : "#FEF2F2",
                border: `1px solid ${entry.hasValue ? "#E5E7EB" : "#FECACA"}`,
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "monospace",
                  }}
                >
                  {key}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: entry.hasValue ? "#10B981" : "#9CA3AF",
                    fontWeight: 600,
                  }}
                >
                  {entry.hasValue ? "v" + entry.version : "empty"}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2 }}>
                by {entry.writtenBy}
              </div>
              {expandedKey === key && entry.valuePreview && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #E5E7EB",
                    fontSize: 11,
                    color: "#4B5563",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {entry.valuePreview}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent episodic log */}
      {episodicLog.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#6B7280",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Activity Log
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {episodicLog.slice(-8).reverse().map((event, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  color: "#6B7280",
                  display: "flex",
                  gap: 6,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: "#D1D5DB", flexShrink: 0 }}>
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span>
                  <strong style={{ color: "#374151" }}>{event.agentId}</strong>{" "}
                  {event.action}
                  {event.taskId ? ` (${event.taskId})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
