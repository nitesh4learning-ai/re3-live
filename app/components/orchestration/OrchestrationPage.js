"use client";
// Orchestration Page — Full page layout combining intake, canvas, timeline, and panels.
// Three modes:
//   1. Default (no runId, not running): Intake form + Use Case Library tiles
//   2. Running (live SSE): Three-column layout with real-time updates
//   3. Replay (runId prop set): Loads saved run, renders full UI read-only
// Completed runs are persisted to localStorage for the library.
//
// v3: Stacked full-width layout, pipeline timeline, collapsible sections,
//     sticky cost+action bar, Common Consciousness with agent desks.

import { useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from "react";
import IntakeForm from "./IntakeForm";
import ExecutionTimeline from "./ExecutionTimeline";
import UseCaseLibrary from "./UseCaseLibrary";
import BlackboardPanel from "./panels/BlackboardPanel";
import { saveRun, listRuns, getRun, getRunCloud, listRunsCloud } from "../../../lib/orchestration/run-store";
import RunComparison from "./RunComparison";

// Lazy-load the canvas (heavy React Flow dependency)
const OrchestrationCanvas = lazy(() => import("./OrchestrationCanvas"));

// Lazy-load the new Playground UI
const PlaygroundView = lazy(() => import("../playground/PlaygroundView"));

const PHASE_LABELS = {
  initialized: "Ready",
  intake: "Validating use case...",
  decomposing: "Decomposing into sub-tasks...",
  assembling: "Assembling agent team...",
  executing: "Agents working...",
  synthesizing: "Synthesizing final deliverable...",
  completed: "Orchestration complete",
  failed: "Orchestration failed",
};

const PHASE_COLORS = {
  initialized: "#9CA3AF",
  intake: "#3B82F6",
  decomposing: "#8B5CF6",
  assembling: "#F59E0B",
  executing: "#3B82F6",
  synthesizing: "#9333EA",
  completed: "#10B981",
  failed: "#EF4444",
};

// Map event types to UI phase for the status bar
const EVENT_TO_PHASE = {
  "phase.intake": "intake",
  "mcp.enrich.start": "intake",
  "mcp.enrich.complete": "executing",
  "mcp.enrich.failed": "executing",
  "phase.decompose.start": "decomposing",
  "phase.decompose.complete": "decomposing",
  "phase.assemble.start": "assembling",
  "phase.assemble.complete": "assembling",
  "phase.execute.start": "executing",
  "layer.start": "executing",
  "task.start": "executing",
  "task.complete": "executing",
  "task.failed": "executing",
  "reflection.start": "executing",
  "reflection.success": "executing",
  "reflection.failed": "executing",
  "reflection.skipped": "executing",
  "layer.complete": "executing",
  "a2a.start": "executing",
  "a2a.refine.start": "executing",
  "a2a.refine.complete": "executing",
  "a2a.refine.failed": "executing",
  "a2a.complete": "executing",
  "a2a.skipped": "executing",
  "phase.synthesize.start": "synthesizing",
  "phase.synthesize.complete": "synthesizing",
  "phase.complete": "completed",
  "phase.failed": "failed",
};

export default function OrchestrationPage({ user, onNavigate, runId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [boardSnapshot, setBoardSnapshot] = useState(null);
  const [budget, setBudget] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("initialized");
  const [events, setEvents] = useState([]);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [savedRuns, setSavedRuns] = useState([]);
  const [isReplay, setIsReplay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const timelineRef = useRef(null);
  const deliverableRef = useRef(null);
  // Ref to collect events for persistence (closures can't see latest state)
  const eventsRef = useRef([]);
  // Ref to preserve last snapshot with real stateEntries (before result event clears them)
  const lastRealSnapshotRef = useRef(null);

  // Load library index on mount (local + cloud merge)
  useEffect(() => {
    setSavedRuns(listRuns());
    // Async merge with cloud runs
    listRunsCloud().then((merged) => setSavedRuns(merged)).catch(() => {});
  }, []);

  // Hydrate a saved run into the UI state
  const hydrateRun = useCallback((saved) => {
    setIsReplay(true);
    setPhase("completed");
    setDeliverable({
      runId: saved.runId,
      useCase: saved.useCase,
      deliverable: saved.deliverable,
      team: saved.team,
      taskResults: saved.taskResults,
      metrics: saved.metrics,
      completedAt: saved.completedAt,
    });
    setEvents(saved.events || []);
    setBoardSnapshot(
      saved.boardSnapshot || {
        runId: saved.runId,
        useCase: saved.useCase,
        team: saved.team || [],
        status: "completed",
        stateEntries: {},
        episodicLog: [],
        elapsedMs: saved.metrics?.elapsedMs || 0,
      }
    );
    setBudget(saved.budget || saved.metrics?.budget || null);
    setError(null);
    setIsRunning(false);
  }, []);

  // Load a saved run when runId prop changes (replay mode)
  useEffect(() => {
    if (!runId) {
      // Reset to default mode if navigating back
      if (isReplay) {
        setIsReplay(false);
        setDeliverable(null);
        setBoardSnapshot(null);
        setBudget(null);
        setPhase("initialized");
        setEvents([]);
        setError(null);
      }
      return;
    }

    // Try local first, then cloud
    const saved = getRun(runId);
    if (saved) {
      hydrateRun(saved);
      return;
    }

    // Async cloud lookup for shared URLs
    setPhase("intake"); // Show loading state
    getRunCloud(runId).then((cloudSaved) => {
      if (cloudSaved) {
        hydrateRun(cloudSaved);
      } else {
        setError(`Run "${runId}" not found locally or in the cloud.`);
        setPhase("failed");
      }
    }).catch(() => {
      setError(`Run "${runId}" not found.`);
      setPhase("failed");
    });
  }, [runId, hydrateRun]); // eslint-disable-line react-hooks/exhaustive-deps

  // Process an incoming SSE event
  const handleSSEEvent = useCallback((event) => {
    // Handle final result — persist to library
    if (event.type === "result") {
      const result = event.data?.deliverable;
      if (result) {
        // Preserve stateEntries from last real snapshot so Common Consciousness Board stays visible
        const lastReal = lastRealSnapshotRef.current;
        const finalSnapshot = {
          runId: result.runId,
          useCase: result.useCase,
          team: result.team || [],
          status: "completed",
          stateEntries: lastReal?.stateEntries || {},
          episodicLog: lastReal?.episodicLog || [],
          elapsedMs: result.metrics?.elapsedMs || 0,
        };
        setDeliverable(result);
        setPhase("completed");
        setBoardSnapshot(finalSnapshot);
        setBudget(result.metrics?.budget || null);

        // Persist to localStorage
        try {
          saveRun({
            deliverable: result,
            events: eventsRef.current,
            boardSnapshot: finalSnapshot,
            budget: result.metrics?.budget || null,
          });
          setSavedRuns(listRuns());
        } catch {
          // Storage full or unavailable — non-fatal
        }
      }
      setIsRunning(false);
      return;
    }

    // Handle error
    if (event.type === "error") {
      setError(event.data?.error || "Unknown error");
      setPhase("failed");
      setIsRunning(false);
      return;
    }

    // Normal orchestration event — add to timeline + ref
    eventsRef.current.push(event);
    setEvents((prev) => [...prev, event]);

    // Update phase from event type
    const newPhase = EVENT_TO_PHASE[event.type];
    if (newPhase) setPhase(newPhase);

    // Update snapshot and budget from event data
    if (event.data?.snapshot) {
      setBoardSnapshot(event.data.snapshot);
      // Preserve the last snapshot that has real stateEntries
      const se = event.data.snapshot.stateEntries;
      if (se && Object.keys(se).length > 0) {
        lastRealSnapshotRef.current = event.data.snapshot;
      }
    }
    if (event.data?.budget) setBudget(event.data.budget);

    // If this is the completion event with deliverable, set it
    if (event.type === "phase.complete" && event.data?.deliverable) {
      setDeliverable(event.data.deliverable);
      setIsRunning(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (useCase) => {
      setIsRunning(true);
      setIsReplay(false);
      setError(null);
      setDeliverable(null);
      setBoardSnapshot(null);
      setBudget(null);
      setEvents([]);
      eventsRef.current = [];
      lastRealSnapshotRef.current = null;
      setHighlightedNodeId(null);
      setHighlightedEventId(null);
      setPhase("intake");

      try {
        const { getFirebase } = await import("../../utils/firebase-client");
        const { auth } = await getFirebase();
        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Please sign in to run orchestrations.");
        }

        const res = await fetch("/api/orchestration/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: useCase.title,
            description: useCase.description,
            type: useCase.type,
          }),
        });

        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream")) {
          // SSE stream — read events incrementally
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
              const trimmed = part.trim();
              if (trimmed.startsWith("data: ")) {
                try {
                  const event = JSON.parse(trimmed.slice(6));
                  handleSSEEvent(event);
                } catch {
                  // Skip malformed events
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim().startsWith("data: ")) {
            try {
              const event = JSON.parse(buffer.trim().slice(6));
              handleSSEEvent(event);
            } catch {
              // ignore
            }
          }
        } else {
          // Fallback: JSON response (error case)
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Orchestration failed");
          }
          // Shouldn't happen in normal flow, but handle gracefully
          if (data.deliverable) {
            setDeliverable(data.deliverable);
            setPhase("completed");
          }
        }
      } catch (err) {
        console.error("Orchestration error:", err);
        setError(err.message);
        setPhase("failed");
      } finally {
        setIsRunning(false);
      }
    },
    [handleSSEEvent]
  );

  // ── Linked interaction handlers ──────────────────────────────

  // Timeline event clicked → highlight the corresponding canvas node
  const handleTimelineEventClick = useCallback((event) => {
    if (event.nodeId) {
      setHighlightedNodeId(event.nodeId);
      setHighlightedEventId(event.id);
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedNodeId(null);
        setHighlightedEventId(null);
      }, 3000);
    }
  }, []);

  // Canvas node clicked → highlight + scroll timeline to most recent event for that node
  const handleCanvasNodeClick = useCallback((nodeId) => {
    setHighlightedNodeId(nodeId);

    // Find the most recent event for this node
    const matchingEvents = events.filter((e) => e.nodeId === nodeId);
    const lastEvent = matchingEvents[matchingEvents.length - 1];

    if (lastEvent) {
      setHighlightedEventId(lastEvent.id);
      // Scroll timeline to this event
      if (timelineRef.current) {
        const el = timelineRef.current.querySelector(`[data-event-id="${lastEvent.id}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    setTimeout(() => {
      setHighlightedNodeId(null);
      setHighlightedEventId(null);
    }, 3000);
  }, [events]);

  // Reset all state and go back to library/intake view
  const handleReset = useCallback(() => {
    setDeliverable(null);
    setBoardSnapshot(null);
    setBudget(null);
    setPhase("initialized");
    setError(null);
    setEvents([]);
    eventsRef.current = [];
    setHighlightedNodeId(null);
    setHighlightedEventId(null);
    setIsReplay(false);
    setSavedRuns(listRuns());
    // Navigate back to /arena (no runId)
    if (onNavigate) onNavigate("arena");
  }, [onNavigate]);

  // Copy shareable URL to clipboard
  const handleShare = useCallback(() => {
    const runIdToShare = deliverable?.runId;
    if (!runIdToShare) return;
    const url = `${window.location.origin}/arena/${runIdToShare}`;
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  }, [deliverable]);

  // Navigate to a saved run's replay view
  const handleSelectRun = useCallback(
    (selectedRunId) => {
      if (onNavigate) onNavigate("arena", selectedRunId);
    },
    [onNavigate]
  );

  // Copy deliverable text to clipboard
  const handleCopyDeliverable = useCallback(() => {
    if (!deliverable?.deliverable) return;
    navigator.clipboard.writeText(deliverable.deliverable).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = deliverable.deliverable;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [deliverable]);

  const hasStarted = phase !== "initialized";
  const showResults = hasStarted && (isRunning || deliverable || events.length > 0);

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "100vh",
        background: showResults ? "#1E293B" : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#9333EA",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          THE ARENA
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: showResults ? "#F1F5F9" : "#111827",
            fontFamily: showResults ? "'DM Sans', 'Inter', sans-serif" : "'Instrument Serif', Georgia, serif",
            marginBottom: 4,
            transition: "color 0.3s",
          }}
        >
          Agentic Orchestration
        </h1>
        <p style={{ fontSize: 15, color: showResults ? "#94A3B8" : "#6B7280", lineHeight: 1.5, transition: "color 0.3s" }}>
          Submit a use case. Watch a team of specialist agents assemble, coordinate, and deliver.
        </p>
      </div>

      {/* Status bar */}
      {hasStarted && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: showResults ? `${PHASE_COLORS[phase]}12` : `${PHASE_COLORS[phase]}08`,
            border: `1px solid ${PHASE_COLORS[phase]}30`,
            borderRadius: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: PHASE_COLORS[phase],
              animation:
                phase !== "completed" && phase !== "failed"
                  ? "pulse 1.5s infinite"
                  : "none",
            }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, color: PHASE_COLORS[phase], fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            {PHASE_LABELS[phase]}
          </span>
          {boardSnapshot?.elapsedMs > 0 && (
            <span style={{ fontSize: 13, color: showResults ? "#64748B" : "#9CA3AF", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
              {(boardSnapshot.elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: showResults ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
            border: `1px solid ${showResults ? "rgba(239, 68, 68, 0.3)" : "#FECACA"}`,
            color: "#EF4444",
            fontSize: 15,
            marginBottom: 24,
            lineHeight: 1.5,
            fontFamily: "'DM Sans', 'Inter', sans-serif",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main layout */}
      {!showResults ? (
        /* Pre-run: Show intake form centered + library below */
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <IntakeForm onSubmit={handleSubmit} isRunning={isRunning} />
          </div>

          {/* Use Case Library + Compare toggle */}
          {showComparison ? (
            <RunComparison
              runs={savedRuns.map((r) => {
                // Enrich summaries with full deliverable text for comparison
                const full = getRun(r.runId);
                return full ? { ...r, deliverable: full.deliverable, team: full.team || r.team } : r;
              })}
              onClose={() => setShowComparison(false)}
            />
          ) : (
            <>
              <UseCaseLibrary runs={savedRuns} onSelect={handleSelectRun} />
              {savedRuns.length >= 2 && (
                <div style={{ textAlign: "center", marginTop: -16 }}>
                  <button
                    onClick={() => setShowComparison(true)}
                    style={{
                      padding: "8px 20px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#8B5CF6",
                      background: "rgba(139, 92, 246, 0.06)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: 10,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Compare Runs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* During/Post-run: New Playground UI (dark theme) */
        <>
          {/* Playground View — Agent Map, Execution Pipeline, Common Consciousness */}
          <Suspense
            fallback={
              <div style={{
                background: "#273549",
                borderRadius: 20,
                padding: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94A3B8",
                fontFamily: "'DM Sans', 'Inter', sans-serif",
                fontSize: 15,
                minHeight: 300,
              }}>
                Loading playground view...
              </div>
            }
          >
            <PlaygroundView
              events={events}
              boardSnapshot={boardSnapshot}
              deliverable={deliverable}
              budget={budget}
            />
          </Suspense>

          {/* Deliverable (full width, shown after completion) — Dark paper effect */}
          {deliverable && (
            <div
              ref={deliverableRef}
              style={{
                background: "#273549",
                border: "1px solid #475569",
                borderLeft: "4px solid #10B981",
                borderRadius: 12,
                padding: 28,
                marginTop: 8,
                marginBottom: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#10B981",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                }}
              >
                DELIVERABLE
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#F1F5F9",
                  marginBottom: 4,
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                }}
              >
                {deliverable.useCase?.title}
              </h3>

              {/* Metrics bar */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid #475569",
                }}
              >
                <MetricPill label="Tasks" value={`${deliverable.metrics?.completedTasks}/${deliverable.metrics?.totalTasks}`} />
                <MetricPill label="Success" value={`${deliverable.metrics?.successRate}%`} />
                <MetricPill label="Time" value={`${((deliverable.metrics?.elapsedMs || 0) / 1000).toFixed(1)}s`} />
                <MetricPill label="Cost" value={`$${(deliverable.metrics?.budget?.costAccumulated || 0).toFixed(4)}`} />
                <MetricPill label="Tokens" value={(deliverable.metrics?.budget?.tokensUsed || 0).toLocaleString()} />
              </div>

              {/* Output text */}
              <div
                style={{
                  fontSize: 15,
                  color: "#94A3B8",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                }}
              >
                {deliverable.deliverable}
              </div>
            </div>
          )}

          {/* Sticky bottom bar — cost tracker + action buttons (dark theme) */}
          <div
            style={{
              position: "sticky",
              bottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "8px 16px",
              background: "rgba(39, 53, 73, 0.94)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid #475569",
              borderRadius: 14,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              maxWidth: 700,
              margin: "0 auto 24px",
              zIndex: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Compact cost info */}
            {(budget || deliverable?.metrics?.budget) && (() => {
              const b = budget || deliverable.metrics.budget;
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>
                    ${(b.costAccumulated || 0).toFixed(4)}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{"\u00B7"}</span>
                  <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
                    {(b.tokensUsed || 0).toLocaleString()} tok
                  </span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{"\u00B7"}</span>
                  <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
                    {b.callCount || 0} calls
                  </span>
                </div>
              );
            })()}

            {/* Elapsed time */}
            {boardSnapshot?.elapsedMs > 0 && (
              <span style={{ fontSize: 13, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
                {(boardSnapshot.elapsedMs / 1000).toFixed(1)}s
              </span>
            )}

            {/* Separator before actions */}
            {deliverable && !isRunning && (budget || deliverable?.metrics?.budget) && (
              <div style={{ width: 1, height: 16, background: "#334155" }} />
            )}

            {/* Action buttons — after completion */}
            {deliverable && !isRunning && (
              <>
                <button
                  onClick={handleCopyDeliverable}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: copied ? "#10B981" : "#F1F5F9",
                    background: copied ? "rgba(16, 185, 129, 0.12)" : "#334155",
                    border: `1px solid ${copied ? "#10B981" : "#475569"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                  }}
                >
                  {copied ? "\u2713 Copied" : "Copy"}
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: shared ? "#0EA5E9" : "#F1F5F9",
                    background: shared ? "rgba(14, 165, 233, 0.12)" : "#334155",
                    border: `1px solid ${shared ? "#0EA5E9" : "#475569"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                  }}
                >
                  {shared ? "\u2713 Link Copied" : "Share"}
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#A855F7",
                    background: "rgba(147, 51, 234, 0.10)",
                    border: "1px solid rgba(147, 51, 234, 0.3)",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', 'Inter', sans-serif",
                  }}
                >
                  {isReplay ? "\u2190 Back" : "\u2190 New Run"}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function CollapsibleSection({ title, color, children, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "7px 14px",
          background: "#FAFAFA",
          border: "1px solid #E5E7EB",
          borderBottom: expanded ? "none" : "1px solid #E5E7EB",
          borderRadius: expanded ? "12px 12px 0 0" : 12,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 8, color: "#9CA3AF" }}>
          {expanded ? "\u25BC" : "\u25B6"}
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: color || "#6B7280",
          textTransform: "uppercase",
        }}>
          {title}
        </span>
      </button>
      {expanded && children}
    </div>
  );
}

function MetricPill({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#64748B", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </span>
    </div>
  );
}
