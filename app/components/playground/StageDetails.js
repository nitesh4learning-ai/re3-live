"use client";
// Stage Detail Panels — Content for each of the 7 pipeline stages.
// Each stage gets its own detail view rendered below the chevron strip.

import { useMemo } from "react";
import { THEME, StatusBadge } from "./shared";
import {
  groupExecuteByLayer,
  buildTaskMap,
  formatTaskName,
  computeStageTiming,
} from "./pipeline-utils";
import LayerBlock from "./LayerBlock";

// ── Intake Detail ────────────────────────────────────────────────────

function IntakeDetail({ events, phaseEvents }) {
  const intakeEvent = phaseEvents.find((e) => e.type === "phase.intake");
  const mcpEvents = phaseEvents.filter((e) => e.type.startsWith("mcp."));
  const useCase = intakeEvent?.data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {useCase?.title && (
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
            Original Question
          </div>
          <div
            style={{
              fontSize: 15,
              color: THEME.text,
              fontFamily: THEME.fontUI,
              lineHeight: 1.6,
              padding: "12px 14px",
              background: THEME.bg,
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{useCase.title}</div>
            {useCase.description && (
              <div style={{ color: THEME.textSecondary }}>{useCase.description}</div>
            )}
          </div>
        </div>
      )}

      {mcpEvents.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
            External Context
          </div>
          {mcpEvents.map((e, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: e.type === "mcp.enrich.complete" ? THEME.success : THEME.textSecondary,
                fontFamily: THEME.fontUI,
                padding: "4px 0",
              }}
            >
              {e.type === "mcp.enrich.start"
                ? `Fetching external context from ${e.data?.urlCount || 1} source${(e.data?.urlCount || 1) > 1 ? "s" : ""}`
                : e.type === "mcp.enrich.complete"
                ? `External context loaded for ${e.data?.agentName || "agent"}`
                : "External data fetch failed, continuing without it"}
            </div>
          ))}
        </div>
      )}

      {!useCase?.title && phaseEvents.length === 0 && (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting for use case validation
        </div>
      )}
    </div>
  );
}

// ── Decompose Detail ─────────────────────────────────────────────────

function DecomposeDetail({ events, phaseEvents }) {
  const completeEvent = phaseEvents.find((e) => e.type === "phase.decompose.complete");
  const tasks = completeEvent?.data?.tasks || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.length > 0 ? (
        <>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
            The question was split into {tasks.length} independent sub-tasks
          </div>
          {tasks.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                background: THEME.bgSurface,
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: `${THEME.accent}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: THEME.accentLight,
                  fontFamily: THEME.fontMono,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text, fontFamily: THEME.fontUI }}>
                  Task {i + 1}: {t.title}
                </div>
                {t.dependsOn?.length > 0 && (
                  <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginTop: 2 }}>
                    Depends on: {t.dependsOn.map((d) => `Task ${d.replace(/^t/, "")}`).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      ) : phaseEvents.some((e) => e.type === "phase.decompose.start") ? (
        <div style={{ fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
          Breaking the question into independent sub-tasks
        </div>
      ) : (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting to start decomposition
        </div>
      )}
    </div>
  );
}

// ── Assemble Detail ──────────────────────────────────────────────────

function AssembleDetail({ events, phaseEvents }) {
  const completeEvent = phaseEvents.find((e) => e.type === "phase.assemble.complete");
  const agents = completeEvent?.data?.agents || [];
  const startEvent = phaseEvents.find((e) => e.type === "phase.assemble.start");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {agents.length > 0 ? (
        <>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
            {agents.length} specialist agents selected and assigned to tasks
          </div>
          {agents.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: THEME.bgSurface,
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
              }}
            >
              {/* Agent avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: a.color || THEME.info,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FFF",
                  flexShrink: 0,
                  fontFamily: THEME.fontUI,
                }}
              >
                {a.avatar || a.name?.slice(0, 2) || "?"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text, fontFamily: THEME.fontUI }}>
                  {a.name}
                  <span style={{ fontWeight: 400, color: THEME.textMuted, marginLeft: 6, fontSize: 13 }}>
                    {a.domain}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: THEME.textSecondary, fontFamily: THEME.fontUI, marginTop: 2 }}>
                  Assigned to: {a.taskTitle || "support role"}
                </div>
              </div>

              <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                {(a.model || "auto").toUpperCase()}
              </span>
            </div>
          ))}
        </>
      ) : startEvent ? (
        <div style={{ fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
          Scoring {startEvent.data?.agentPoolSize || "available"} agents to find the best {startEvent.data?.maxAgents || 5} specialists
        </div>
      ) : (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting to begin agent selection
        </div>
      )}
    </div>
  );
}

// ── Execute Detail ───────────────────────────────────────────────────

function ExecuteDetail({ events, phaseEvents, team }) {
  const layers = useMemo(() => groupExecuteByLayer(phaseEvents), [phaseEvents]);
  const startEvent = phaseEvents.find((e) => e.type === "phase.execute.start");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {startEvent && (
        <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
          Executing {startEvent.data?.totalTasks || "multiple"} tasks across {startEvent.data?.layerCount || layers.length} layers
        </div>
      )}

      {layers.map((layer, i) => {
        if (!layer.layerIndex) return null;
        return (
          <LayerBlock
            key={`layer-${layer.layerIndex || i}`}
            layer={layer}
            events={events}
            team={team}
            defaultExpanded={layer.status !== "completed" || i === layers.length - 1}
          />
        );
      })}

      {layers.length === 0 && !startEvent && (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting for execution to begin
        </div>
      )}
    </div>
  );
}

// ── Refine Detail ────────────────────────────────────────────────────

function RefineDetail({ events, phaseEvents }) {
  const a2aStart = phaseEvents.find((e) => e.type === "a2a.start");
  const a2aComplete = phaseEvents.find((e) => e.type === "a2a.complete");
  const a2aSkipped = phaseEvents.find((e) => e.type === "a2a.skipped");
  const refineEvents = phaseEvents.filter(
    (e) => e.type === "a2a.refine.start" || e.type === "a2a.refine.complete" || e.type === "a2a.refine.failed"
  );
  const reflectionEvents = phaseEvents.filter(
    (e) => e.type.startsWith("reflection.")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {a2aSkipped && (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI }}>
          Cross-pollination was skipped: {a2aSkipped.data?.reason || "not needed for this run"}
        </div>
      )}

      {a2aStart && (
        <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 4 }}>
          {a2aComplete
            ? `${a2aComplete.data?.refinedCount || 0} of ${a2aComplete.data?.totalAgents || 0} agents refined their output using peer feedback`
            : `${a2aStart.data?.agentCount || 0} agents cross-pollinating insights`}
        </div>
      )}

      {refineEvents.map((e, i) => {
        const agentName = e.data?.agentName || "Agent";
        let description = "";
        if (e.type === "a2a.refine.start") {
          description = `${agentName} is refining output using ${e.data?.peerCount || 0} peer reviews`;
        } else if (e.type === "a2a.refine.complete") {
          description = `${agentName} refined output using peer feedback ($${(e.data?.cost || 0).toFixed(4)})`;
        } else {
          description = `${agentName} refinement failed, keeping original output`;
        }

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: THEME.bgSurface,
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  e.type === "a2a.refine.complete" ? THEME.success
                  : e.type === "a2a.refine.failed" ? THEME.error
                  : THEME.cyan,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
              {description}
            </span>
          </div>
        );
      })}

      {reflectionEvents.map((e, i) => {
        const agentName = e.data?.agentName || "Agent";
        let description = "";
        if (e.type === "reflection.start") {
          description = `${agentName} is performing self-correction on output`;
        } else if (e.type === "reflection.success") {
          description = `${agentName} successfully recovered via self-reflection ($${(e.data?.cost || 0).toFixed(4)})`;
        } else if (e.type === "reflection.failed") {
          description = `${agentName} self-reflection failed: ${e.data?.error || "unknown error"}`;
        } else {
          description = `Self-reflection skipped for ${agentName}: ${e.data?.reason || "not needed"}`;
        }

        return (
          <div
            key={`ref-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: THEME.bgSurface,
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  e.type === "reflection.success" ? THEME.success
                  : e.type === "reflection.failed" ? THEME.error
                  : THEME.warning,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
              {description}
            </span>
          </div>
        );
      })}

      {phaseEvents.length === 0 && (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting for refinement phase
        </div>
      )}
    </div>
  );
}

// ── Synthesize Detail ────────────────────────────────────────────────

function SynthesizeDetail({ events, phaseEvents }) {
  const startEvent = phaseEvents.find((e) => e.type === "phase.synthesize.start");
  const completeEvent = phaseEvents.find((e) => e.type === "phase.synthesize.complete");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {completeEvent ? (
        <div
          style={{
            padding: "12px 14px",
            background: THEME.bgSurface,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <div style={{ fontSize: 15, color: THEME.text, fontFamily: THEME.fontUI, lineHeight: 1.5 }}>
            All {startEvent?.data?.inputCount || "task"} outputs were merged into a unified deliverable by the synthesis agent
          </div>
        </div>
      ) : startEvent ? (
        <div style={{ fontSize: 15, color: THEME.textSecondary, fontFamily: THEME.fontUI }}>
          Synthesis agent is weaving {startEvent.data?.inputCount || "multiple"} task outputs into a unified answer
        </div>
      ) : (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting for synthesis phase
        </div>
      )}
    </div>
  );
}

// ── Deliver Detail ───────────────────────────────────────────────────

function DeliverDetail({ events, phaseEvents, deliverable }) {
  const completeEvent = phaseEvents.find((e) => e.type === "phase.complete");
  const failedEvent = phaseEvents.find((e) => e.type === "phase.failed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {failedEvent && (
        <div
          style={{
            padding: "12px 14px",
            background: `${THEME.error}10`,
            borderRadius: 8,
            border: `1px solid ${THEME.error}30`,
          }}
        >
          <div style={{ fontSize: 15, color: THEME.error, fontFamily: THEME.fontUI, fontWeight: 600 }}>
            Orchestration failed: {failedEvent.data?.error || "Unknown error"}
          </div>
        </div>
      )}

      {completeEvent && (
        <div
          style={{
            padding: "12px 14px",
            background: THEME.bgSurface,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <div style={{ fontSize: 15, color: THEME.text, fontFamily: THEME.fontUI, lineHeight: 1.5 }}>
            Orchestration completed: {completeEvent.data?.completedTasks}/{completeEvent.data?.totalTasks} tasks finished
            in {((completeEvent.data?.elapsedMs || 0) / 1000).toFixed(1)}s
            at a cost of ${(completeEvent.data?.totalCost || 0).toFixed(4)}
          </div>
        </div>
      )}

      {deliverable?.deliverable && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontFamily: THEME.fontUI, marginBottom: 6 }}>
            Final Output Summary
          </div>
          <div
            style={{
              fontSize: 15,
              color: THEME.textSecondary,
              fontFamily: THEME.fontUI,
              lineHeight: 1.7,
              padding: "14px 16px",
              background: THEME.bg,
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              maxHeight: 300,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {deliverable.deliverable.length > 500
              ? deliverable.deliverable.slice(0, 500) + " [see full deliverable below]"
              : deliverable.deliverable}
          </div>
        </div>
      )}

      {!completeEvent && !failedEvent && (
        <div style={{ fontSize: 15, color: THEME.textMuted, fontFamily: THEME.fontUI, fontStyle: "italic" }}>
          Waiting for final delivery
        </div>
      )}
    </div>
  );
}

// ── Stage Detail Router ──────────────────────────────────────────────

export default function StageDetailPanel({ stage, events, phaseEvents, team, status, deliverable }) {
  const timing = useMemo(() => computeStageTiming(phaseEvents, 0), [phaseEvents]);
  const phase = stage;

  const phaseLabel = {
    intake: "Intake",
    decompose: "Decompose",
    assemble: "Assemble",
    execute: "Execute",
    a2a: "Refine",
    synthesize: "Synthesize",
    deliver: "Deliver",
  }[phase] || phase;

  return (
    <div
      style={{
        background: THEME.bgSection,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        marginTop: 8,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: THEME.text,
            fontFamily: THEME.fontUI,
          }}
        >
          {phaseLabel}
        </span>
        <StatusBadge status={status} size="small" />
        {timing && (
          <span
            style={{
              fontSize: 13,
              color: THEME.textMuted,
              fontFamily: THEME.fontMono,
              marginLeft: "auto",
            }}
          >
            {timing}s
          </span>
        )}
      </div>

      {/* Stage-specific content */}
      {phase === "intake" && <IntakeDetail events={events} phaseEvents={phaseEvents} />}
      {phase === "decompose" && <DecomposeDetail events={events} phaseEvents={phaseEvents} />}
      {phase === "assemble" && <AssembleDetail events={events} phaseEvents={phaseEvents} />}
      {phase === "execute" && <ExecuteDetail events={events} phaseEvents={phaseEvents} team={team} />}
      {phase === "a2a" && <RefineDetail events={events} phaseEvents={phaseEvents} />}
      {phase === "synthesize" && <SynthesizeDetail events={events} phaseEvents={phaseEvents} />}
      {phase === "deliver" && <DeliverDetail events={events} phaseEvents={phaseEvents} deliverable={deliverable} />}
    </div>
  );
}
