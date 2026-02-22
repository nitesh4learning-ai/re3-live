"use client";
// Execution Pipeline — Section 2 of the Playground.
// Chevron strip navigation + stage detail panel.
// Shows the 7-stage pipeline from Intake → Deliver.

import { useState, useMemo, useEffect } from "react";
import { THEME, SectionHeader } from "./shared";
import { computePhaseStatuses, groupEventsByPhase, PIPELINE_PHASES } from "./pipeline-utils";
import ChevronStrip from "./ChevronStrip";
import StageDetailPanel from "./StageDetails";

export default function ExecutionPipeline({ events = [], team = [], deliverable = null }) {
  const statuses = useMemo(() => computePhaseStatuses(events), [events]);
  const phaseEvents = useMemo(() => groupEventsByPhase(events), [events]);

  // Auto-select the currently active stage, or the last completed stage
  const activeStage = useMemo(() => {
    const phases = PIPELINE_PHASES.map((p) => p.id);
    // Find the currently active phase
    for (const id of phases) {
      if (statuses[id] === "active") return id;
    }
    // Otherwise find the last completed phase
    let lastCompleted = null;
    for (const id of phases) {
      if (statuses[id] === "completed") lastCompleted = id;
    }
    return lastCompleted || "intake";
  }, [statuses]);

  const [selectedStage, setSelectedStage] = useState(activeStage);

  // Follow the active stage during live execution
  useEffect(() => {
    setSelectedStage(activeStage);
  }, [activeStage]);

  return (
    <div
      style={{
        background: THEME.bgSection,
        borderRadius: 16,
        padding: "24px",
        border: `1px solid ${THEME.border}`,
      }}
    >
      <SectionHeader
        title="Execution Pipeline"
        subtitle="7-stage orchestration from intake to delivery"
      />

      {/* Chevron navigation strip */}
      <ChevronStrip
        statuses={statuses}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
      />

      {/* Stage detail panel */}
      <StageDetailPanel
        stage={selectedStage}
        events={events}
        phaseEvents={phaseEvents[selectedStage] || []}
        team={team}
        status={statuses[selectedStage] || "pending"}
        deliverable={deliverable}
      />
    </div>
  );
}
