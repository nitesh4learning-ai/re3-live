"use client";
// Orchestration Page — Full page layout combining intake, canvas, and panels.
// This is the main page for the Agentic Orchestration feature.

import { useState, useCallback, lazy, Suspense } from "react";
import IntakeForm from "./IntakeForm";
import BlackboardPanel from "./panels/BlackboardPanel";
import CostTicker from "./panels/CostTicker";
import TeamRoster from "./panels/TeamRoster";

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

export default function OrchestrationPage({ user, onNavigate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [boardSnapshot, setBoardSnapshot] = useState(null);
  const [budget, setBudget] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("initialized");

  const handleSubmit = useCallback(
    async (useCase) => {
      setIsRunning(true);
      setError(null);
      setDeliverable(null);
      setBoardSnapshot(null);
      setBudget(null);
      setPhase("intake");

      try {
        // Get auth token
        const { getFirebase } = await import("../../../lib/firebase");
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

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Orchestration failed");
        }

        const result = data.deliverable;
        setDeliverable(result);
        setPhase("completed");

        // Build snapshot from result for canvas
        if (result) {
          setBoardSnapshot({
            runId: result.runId,
            useCase: result.useCase,
            team: result.team || [],
            status: "completed",
            stateEntries: {},
            episodicLog: [],
            elapsedMs: result.metrics?.elapsedMs || 0,
          });
          setBudget(result.metrics?.budget || null);
        }
      } catch (err) {
        console.error("Orchestration error:", err);
        setError(err.message);
        setPhase("failed");
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  return (
    <div
      style={{
        maxWidth: 1200,
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

      {/* Status bar when running */}
      {phase !== "initialized" && (
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
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: PHASE_COLORS[phase],
            }}
          >
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
      {!deliverable ? (
        /* Pre-run: Show intake form centered, or canvas if running */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <IntakeForm onSubmit={handleSubmit} isRunning={isRunning} />

          {/* Show canvas placeholder when running */}
          {isRunning && boardSnapshot && (
            <div style={{ width: "100%" }}>
              <Suspense
                fallback={
                  <div
                    style={{
                      height: 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    Loading canvas...
                  </div>
                }
              >
                <OrchestrationCanvas
                  boardSnapshot={boardSnapshot}
                  budget={budget}
                />
              </Suspense>
            </div>
          )}
        </div>
      ) : (
        /* Post-run: Show results with canvas and panels */
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Left: Canvas + Deliverable */}
          <div style={{ flex: "1 1 650px", minWidth: 0 }}>
            {/* Canvas */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
                height: 420,
              }}
            >
              <Suspense
                fallback={
                  <div
                    style={{
                      height: 420,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    Loading canvas...
                  </div>
                }
              >
                <OrchestrationCanvas
                  boardSnapshot={boardSnapshot}
                  budget={budget}
                />
              </Suspense>
            </div>

            {/* Deliverable output */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 24,
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

            {/* Run again button */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button
                onClick={() => {
                  setDeliverable(null);
                  setBoardSnapshot(null);
                  setBudget(null);
                  setPhase("initialized");
                  setError(null);
                }}
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
                Run Another Orchestration
              </button>
            </div>
          </div>

          {/* Right: Panels */}
          <div
            style={{
              flex: "0 0 280px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <TeamRoster team={deliverable.team || []} />
            <CostTicker budget={deliverable.metrics?.budget} />
            <BlackboardPanel
              stateEntries={boardSnapshot?.stateEntries || {}}
              episodicLog={boardSnapshot?.episodicLog || []}
            />
          </div>
        </div>
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
