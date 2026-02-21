"use client";
// Common Consciousness Board — Live shared state viewer.
// Three views: Board (key-value with read tracking), Desks (grouped by agent), Flow (data connections).
// Shows agent read/write activity, version history, and data flow between agents.

import { useState, useMemo } from "react";

// ── Tab Button ────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 9,
        fontWeight: 600,
        color: active ? "#9333EA" : "#9CA3AF",
        background: active ? "rgba(147, 51, 234, 0.08)" : "transparent",
        border: active ? "1px solid rgba(147, 51, 234, 0.2)" : "1px solid transparent",
        borderRadius: 5,
        padding: "3px 10px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

// ── Board View — Enhanced key-value with read tracking ────────────────

function BoardView({ entries, expandedKey, setExpandedKey, team }) {
  const [showHistory, setShowHistory] = useState(null);

  const agentMap = useMemo(() => {
    const m = {};
    for (const a of team) {
      m[a.agentId] = a;
    }
    return m;
  }, [team]);

  function agentLabel(id) {
    return agentMap[id]?.name || id;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {entries.map(([key, entry]) => (
        <div
          key={key}
          style={{
            background: entry.hasValue ? "#F9FAFB" : "#FEF2F2",
            border: `1px solid ${entry.hasValue ? "#E5E7EB" : "#FECACA"}`,
            borderRadius: 8,
            padding: "6px 8px",
            transition: "all 0.2s ease",
          }}
        >
          {/* Header row */}
          <div
            onClick={() => setExpandedKey(expandedKey === key ? null : key)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "monospace",
            }}>
              {key}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Read count badge */}
              {(entry.readers?.length || 0) > 0 && (
                <span style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: "#6366F1",
                  background: "rgba(99, 102, 241, 0.08)",
                  padding: "1px 5px",
                  borderRadius: 4,
                }}>
                  {entry.readers.length} read{entry.readers.length !== 1 ? "s" : ""}
                </span>
              )}
              <span style={{
                fontSize: 9,
                color: entry.hasValue ? "#10B981" : "#9CA3AF",
                fontWeight: 600,
              }}>
                {entry.hasValue ? "v" + entry.version : "empty"}
              </span>
            </div>
          </div>

          {/* Writer */}
          <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
            <span>by {agentLabel(entry.writtenBy)}</span>
            {entry.readers?.length > 0 && (
              <span style={{ color: "#D1D5DB" }}>
                {"\u2192"} {entry.readers.map((r) => agentLabel(r)).join(", ")}
              </span>
            )}
          </div>

          {/* Expanded content */}
          {expandedKey === key && (
            <div style={{ marginTop: 6, borderTop: "1px solid #E5E7EB", paddingTop: 6 }}>
              {/* Value preview */}
              {entry.valuePreview && (
                <div style={{
                  fontSize: 11,
                  color: "#4B5563",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  marginBottom: 6,
                }}>
                  {entry.valuePreview}
                </div>
              )}

              {/* Version history toggle */}
              {entry.versionHistory?.length > 1 && (
                <div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowHistory(showHistory === key ? null : key); }}
                    style={{
                      fontSize: 9,
                      color: "#8B5CF6",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {showHistory === key ? "\u25BC" : "\u25B6"} Version history ({entry.versionHistory.length})
                  </button>
                  {showHistory === key && (
                    <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                      {entry.versionHistory.map((vh) => (
                        <div key={vh.version} style={{
                          fontSize: 9,
                          color: "#6B7280",
                          padding: "3px 6px",
                          background: "#FFFFFF",
                          borderRadius: 4,
                          border: "1px solid #F3F4F6",
                        }}>
                          <span style={{ fontWeight: 600 }}>v{vh.version}</span>
                          {" by "}
                          <span style={{ color: "#374151" }}>{agentLabel(vh.writtenBy)}</span>
                          {vh.preview && (
                            <div style={{ color: "#9CA3AF", marginTop: 1, fontSize: 8 }}>
                              {vh.preview.slice(0, 80)}{vh.preview.length > 80 ? "\u2026" : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Desks View — Grouped by agent ─────────────────────────────────────

function DesksView({ entries, team }) {
  const [expandedAgent, setExpandedAgent] = useState(null);

  // Group entries by agent
  const desks = useMemo(() => {
    const agentMap = {};

    // Initialize from team
    for (const a of team) {
      agentMap[a.agentId] = {
        agent: a,
        writes: [],
        reads: [],
      };
    }

    // Collect writes
    for (const [key, entry] of entries) {
      const agentId = entry.writtenBy;
      if (!agentMap[agentId]) {
        agentMap[agentId] = {
          agent: { agentId, name: agentId, color: "#6B7280", avatar: "?" },
          writes: [],
          reads: [],
        };
      }
      agentMap[agentId].writes.push({ key, ...entry });
    }

    // Collect reads
    for (const [key, entry] of entries) {
      for (const readerId of (entry.readers || [])) {
        if (!agentMap[readerId]) {
          agentMap[readerId] = {
            agent: { agentId: readerId, name: readerId, color: "#6B7280", avatar: "?" },
            writes: [],
            reads: [],
          };
        }
        agentMap[readerId].reads.push({ key, version: entry.version, writtenBy: entry.writtenBy });
      }
    }

    return Object.values(agentMap).filter((d) => d.writes.length > 0 || d.reads.length > 0);
  }, [entries, team]);

  if (desks.length === 0) {
    return (
      <div style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", padding: "8px 0" }}>
        No agent activity yet...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {desks.map((desk) => {
        const a = desk.agent;
        const color = a.color || "#6B7280";
        const isExpanded = expandedAgent === a.agentId;

        return (
          <div
            key={a.agentId}
            style={{
              border: `1px solid ${color}20`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Agent header */}
            <button
              onClick={() => setExpandedAgent(isExpanded ? null : a.agentId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 8px",
                background: `${color}06`,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                fontWeight: 800,
                color: "#FFF",
                flexShrink: 0,
              }}>
                {a.avatar || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#111827" }}>
                  {a.name}
                </div>
                {a.taskTitle && (
                  <div style={{ fontSize: 8, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.taskTitle}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {desk.writes.length > 0 && (
                  <span style={{ fontSize: 8, fontWeight: 600, color: "#10B981", background: "rgba(16, 185, 129, 0.08)", padding: "1px 5px", borderRadius: 3 }}>
                    {desk.writes.length}W
                  </span>
                )}
                {desk.reads.length > 0 && (
                  <span style={{ fontSize: 8, fontWeight: 600, color: "#6366F1", background: "rgba(99, 102, 241, 0.08)", padding: "1px 5px", borderRadius: 3 }}>
                    {desk.reads.length}R
                  </span>
                )}
              </div>
              <span style={{ fontSize: 8, color: "#9CA3AF" }}>
                {isExpanded ? "\u25BC" : "\u25B6"}
              </span>
            </button>

            {/* Expanded desk content */}
            {isExpanded && (
              <div style={{ padding: "6px 8px", background: "#FAFAFA" }}>
                {/* Writes */}
                {desk.writes.length > 0 && (
                  <div style={{ marginBottom: desk.reads.length > 0 ? 6 : 0 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#10B981", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Wrote
                    </div>
                    {desk.writes.map((w) => (
                      <div key={w.key} style={{
                        fontSize: 10,
                        color: "#374151",
                        padding: "2px 0",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                      }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 9 }}>{w.key}</span>
                        <span style={{ fontSize: 8, color: "#9CA3AF" }}>v{w.version}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reads */}
                {desk.reads.length > 0 && (
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#6366F1", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Read
                    </div>
                    {desk.reads.map((r, i) => (
                      <div key={`${r.key}-${i}`} style={{
                        fontSize: 10,
                        color: "#374151",
                        padding: "2px 0",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                      }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 9 }}>{r.key}</span>
                        <span style={{ fontSize: 8, color: "#9CA3AF" }}>
                          from {team.find((t) => t.agentId === r.writtenBy)?.name || r.writtenBy}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Flow View — Data connections between agents ───────────────────────

function FlowView({ entries, team }) {
  // Build flow connections: writer → key → readers
  const flows = useMemo(() => {
    const connections = [];
    const agentNames = {};
    for (const a of team) {
      agentNames[a.agentId] = a;
    }

    for (const [key, entry] of entries) {
      if (!entry.hasValue) continue;
      const writer = agentNames[entry.writtenBy] || { name: entry.writtenBy, color: "#6B7280" };
      const readers = (entry.readers || []).map((r) => agentNames[r] || { name: r, color: "#6B7280" });

      connections.push({
        key,
        writer,
        readers,
        version: entry.version,
      });
    }

    return connections;
  }, [entries, team]);

  if (flows.length === 0) {
    return (
      <div style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", padding: "8px 0" }}>
        Data flows will appear as agents share outputs...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {flows.map((flow) => (
        <div
          key={flow.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 6px",
            background: "#F9FAFB",
            borderRadius: 6,
            border: "1px solid #F3F4F6",
            flexWrap: "wrap",
          }}
        >
          {/* Writer */}
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: flow.writer.color || "#374151",
            background: `${flow.writer.color || "#374151"}10`,
            padding: "1px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
          }}>
            {flow.writer.name}
          </span>

          {/* Arrow + key */}
          <span style={{ fontSize: 9, color: "#D1D5DB" }}>{"\u2192"}</span>
          <span style={{
            fontSize: 9,
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#374151",
            background: "#FFFFFF",
            padding: "1px 5px",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
          }}>
            {flow.key}
          </span>

          {/* Readers */}
          {flow.readers.length > 0 && (
            <>
              <span style={{ fontSize: 9, color: "#D1D5DB" }}>{"\u2192"}</span>
              {flow.readers.map((r, i) => (
                <span key={i} style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: r.color || "#6366F1",
                  background: `${r.color || "#6366F1"}10`,
                  padding: "1px 6px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                }}>
                  {r.name}
                </span>
              ))}
            </>
          )}

          {flow.readers.length === 0 && (
            <span style={{ fontSize: 8, color: "#D1D5DB", fontStyle: "italic" }}>no readers yet</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Activity Log ──────────────────────────────────────────────────────

function ActivityLog({ episodicLog, team }) {
  const agentNames = useMemo(() => {
    const m = {};
    for (const a of team) {
      m[a.agentId] = a.name;
    }
    return m;
  }, [team]);

  const actionColors = {
    write: "#10B981",
    read: "#6366F1",
    started: "#3B82F6",
    completed: "#10B981",
    failed: "#EF4444",
    status_change: "#9CA3AF",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {episodicLog.slice(-10).reverse().map((event, i) => (
        <div
          key={i}
          style={{
            fontSize: 9,
            color: "#6B7280",
            display: "flex",
            gap: 6,
            lineHeight: 1.4,
            padding: "1px 0",
          }}
        >
          <span style={{ color: "#D1D5DB", flexShrink: 0, fontFamily: "monospace", fontSize: 8 }}>
            {new Date(event.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: actionColors[event.action] || "#9CA3AF",
            flexShrink: 0,
            marginTop: 4,
          }} />
          <span>
            <strong style={{ color: "#374151" }}>{agentNames[event.agentId] || event.agentId}</strong>{" "}
            <span style={{ color: actionColors[event.action] || "#6B7280" }}>{event.action}</span>
            {event.key && <span style={{ fontFamily: "monospace", fontSize: 8 }}> {event.key}</span>}
            {event.taskId && <span style={{ fontSize: 8, color: "#9CA3AF" }}> ({event.taskId})</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function BlackboardPanel({ stateEntries = {}, episodicLog = [], team = [] }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("board");
  const entries = Object.entries(stateEntries);

  // Hide only when truly empty (pre-run)
  if (entries.length === 0 && episodicLog.length === 0) return null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header with tabs */}
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "1px solid #F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 6,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#9333EA",
          textTransform: "uppercase",
        }}>
          Common Consciousness
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <TabButton label="Board" active={activeTab === "board"} onClick={() => setActiveTab("board")} />
          <TabButton label="Desks" active={activeTab === "desks"} onClick={() => setActiveTab("desks")} />
          <TabButton label="Flow" active={activeTab === "flow"} onClick={() => setActiveTab("flow")} />
        </div>
      </div>

      {/* Content area */}
      <div style={{
        padding: "10px 14px",
        maxHeight: 400,
        overflowY: "auto",
      }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>
            Agents will write here as they work...
          </div>
        ) : (
          <>
            {activeTab === "board" && (
              <BoardView
                entries={entries}
                expandedKey={expandedKey}
                setExpandedKey={setExpandedKey}
                team={team}
              />
            )}
            {activeTab === "desks" && (
              <DesksView entries={entries} team={team} />
            )}
            {activeTab === "flow" && (
              <FlowView entries={entries} team={team} />
            )}
          </>
        )}
      </div>

      {/* Activity log — always visible */}
      {episodicLog.length > 0 && (
        <div style={{
          padding: "8px 14px 10px",
          borderTop: "1px solid #F3F4F6",
          background: "#FAFAFA",
        }}>
          <div style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#6B7280",
            marginBottom: 4,
            textTransform: "uppercase",
          }}>
            Activity Log
          </div>
          <ActivityLog episodicLog={episodicLog} team={team} />
        </div>
      )}
    </div>
  );
}
