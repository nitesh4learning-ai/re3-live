"use client";
// PlaygroundView — Main composition of the 3 playground sections.
// Section order: Agent Map → Execution Pipeline → Common Consciousness
// Light theme container with the redesigned UI.

import { THEME } from "./shared";
import AgentMap from "./AgentMap";
import ExecutionPipeline from "./ExecutionPipeline";
import CommonConsciousness from "./CommonConsciousness";

export default function PlaygroundView({
  events = [],
  boardSnapshot = null,
  deliverable = null,
  budget = null,
}) {
  const safeEvents = events || [];
  const team = boardSnapshot?.team || deliverable?.team || [];
  const stateEntries = boardSnapshot?.stateEntries || {};
  const episodicLog = boardSnapshot?.episodicLog || [];

  return (
    <div
      style={{
        background: THEME.bg,
        borderRadius: 20,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: THEME.fontUI,
      }}
    >
      {/* Section 1: Agent Map */}
      <AgentMap team={team} events={safeEvents} />

      {/* Section 2: Execution Pipeline */}
      <ExecutionPipeline events={safeEvents} team={team} deliverable={deliverable} />

      {/* Section 3: Common Consciousness */}
      <CommonConsciousness
        stateEntries={stateEntries}
        episodicLog={episodicLog}
        team={team}
        events={safeEvents}
      />

      {/* Global animations for playground */}
      <style>{`
        @keyframes playgroundPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
