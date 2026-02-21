"use client";
// Orchestration Page — Full page layout combining intake, canvas, timeline, and panels.
// Three modes:
//   1. Default (no runId, not running): Intake form + Use Case Library tiles
//   2. Running (live SSE): Three-column layout with real-time updates
//   3. Replay (runId prop set): Loads saved run, renders full UI read-only
// Completed runs are persisted to localStorage for the library.

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import IntakeForm from "./IntakeForm";
import ExecutionTimeline from "./ExecutionTimeline";
import UseCaseLibrary from "./UseCaseLibrary";
import BlackboardPanel from "./panels/BlackboardPanel";
import CostTicker from "./panels/CostTicker";
import TeamRoster from "./panels/TeamRoster";
import { saveRun, listRuns, getRun } from "../../../lib/orchestration/run-store";

// Lazy-load the canvas (heavy React Flow dependency)
const OrchestrationCanvas = lazy(() => import("./OrchestrationCanvas"));

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
  "phase.decompose.start": "decomposing",
  "phase.decompose.complete": "decomposing",
  "phase.assemble.start": "assembling",
  "phase.assemble.complete": "assembling",
  "phase.execute.start": "executing",
  "layer.start": "executing",
  "task.start": "executing",
  "task.complete": "executing",
  "task.failed": "executing",
  "layer.complete": "executing",
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
  const timelineRef = useRef(null);
  // Ref to collect events for persistence (closures can't see latest state)
  const eventsRef = useRef([]);

  // Load library index on mount
  useEffect(() => {
    setSavedRuns(listRuns());
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

    const saved = getRun(runId);
    if (!saved) {
      setError(`Run "${runId}" not found in library.`);
      return;
    }

    // Hydrate all state from the saved record
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
  }, [runId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Process an incoming SSE event
  const handleSSEEvent = useCallback((event) => {
    // Handle final result — persist to library
    if (event.type === "result") {
      const result = event.data?.deliverable;
      if (result) {
        const finalSnapshot = {
          runId: result.runId,
          useCase: result.useCase,
          team: result.team || [],
          status: "completed",
          stateEntries: {},
          episodicLog: [],
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
    if (event.data?.snapshot) setBoardSnapshot(event.data.snapshot);
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

  // Navigate to a saved run's replay view
  const handleSelectRun = useCallback(
    (selectedRunId) => {
      if (onNavigate) onNavigate("arena", selectedRunId);
    },
    [onNavigate]
  );

  const hasStarted = phase !== "initialized";
  const showResults = hasStarted && (isRunning || deliverable || events.length > 0);

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10,
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
            color: "#111827",
            fontFamily: "'Instrument Serif', Georgia, serif",
            marginBottom: 4,
          }}
        >
          Agentic Orchestration
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>
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
            background: `${PHASE_COLORS[phase]}08`,
            border: `1px solid ${PHASE_COLORS[phase]}30`,
            borderRadius: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: PHASE_COLORS[phase],
              animation:
                phase !== "completed" && phase !== "failed"
                  ? "pulse 1.5s infinite"
                  : "none",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: PHASE_COLORS[phase] }}>
            {PHASE_LABELS[phase]}
          </span>
          {boardSnapshot?.elapsedMs > 0 && (
            <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
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
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: 13,
            marginBottom: 24,
            lineHeight: 1.5,
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

          {/* Use Case Library */}
          <UseCaseLibrary runs={savedRuns} onSelect={handleSelectRun} />
        </div>
      ) : (
        /* During/Post-run: Three-column layout */
        <>
          {/* Back to library link */}
          {(isReplay || deliverable) && !isRunning && (
            <button
              onClick={handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#9333EA",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: 16,
              }}
            >
              ← Back to Library
            </button>
          )}

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
            {/* Left: Timeline */}
            <div
              ref={timelineRef}
              style={{ flex: "0 0 340px", minWidth: 280 }}
            >
              <ExecutionTimeline
                events={events}
                highlightedEventId={highlightedEventId}
                onEventClick={handleTimelineEventClick}
              />
            </div>

            {/* Center: Canvas */}
            <div style={{ flex: "1 1 500px", minWidth: 0 }}>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  overflow: "hidden",
                  height: 420,
                }}
              >
                <Suspense
                  fallback={
                    <div style={{
                      height: 420,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                    }}>
                      Loading canvas...
                    </div>
                  }
                >
                  <OrchestrationCanvas
                    boardSnapshot={boardSnapshot}
                    budget={budget}
                    highlightedNodeId={highlightedNodeId}
                    onNodeClick={handleCanvasNodeClick}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right: Panels */}
            <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 16 }}>
              <TeamRoster team={boardSnapshot?.team || deliverable?.team || []} />
              <CostTicker budget={budget || deliverable?.metrics?.budget} />
              <BlackboardPanel
                stateEntries={boardSnapshot?.stateEntries || {}}
                episodicLog={boardSnapshot?.episodicLog || []}
              />
            </div>
          </div>

          {/* Deliverable (full width below, shown after completion) */}
          {deliverable && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#10B981",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                DELIVERABLE
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 4,
                  fontFamily: "'Instrument Serif', Georgia, serif",
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
                  borderBottom: "1px solid #F3F4F6",
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
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Source Sans 3', 'Inter', sans-serif",
                }}
              >
                {deliverable.deliverable}
              </div>
            </div>
          )}

          {/* Run again / back to library button */}
          {deliverable && !isRunning && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#9333EA",
                  background: "rgba(147, 51, 234, 0.06)",
                  border: "1px solid rgba(147, 51, 234, 0.2)",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                {isReplay ? "Back to Library" : "Run Another Orchestration"}
              </button>
            </div>
          )}
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

function MetricPill({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{label}:</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
        {value}
      </span>
    </div>
  );
}
