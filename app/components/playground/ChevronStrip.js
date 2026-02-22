"use client";
// Chevron Strip — 7 arrow-shaped chevrons for the pipeline navigation.
// Each chevron is a clickable arrow shape with stage name and status.
// Hover shows stage description popover. Click switches the detail panel.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME } from "./shared";
import { PIPELINE_PHASES, STAGE_DESCRIPTIONS } from "./pipeline-utils";

// ── Single Chevron ───────────────────────────────────────────────────

function Chevron({ phase, status, isFirst, isLast, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isFailed = status === "failed";
  const isPending = status === "pending";
  const isSkipped = status === "skipped";

  // Colors based on state
  const fillColor = isCompleted
    ? `${THEME.success}18`
    : isActive
    ? `${THEME.cyan}18`
    : isFailed
    ? `${THEME.error}18`
    : `${THEME.textMuted}08`;

  const borderColor = isSelected
    ? THEME.accent
    : isCompleted
    ? `${THEME.success}50`
    : isActive
    ? `${THEME.cyan}50`
    : isFailed
    ? `${THEME.error}50`
    : THEME.border;

  const textColor = isCompleted
    ? THEME.success
    : isActive
    ? THEME.cyan
    : isFailed
    ? THEME.error
    : isSkipped
    ? THEME.textMuted
    : THEME.textMuted;

  const statusLabel = isCompleted
    ? "Done"
    : isActive
    ? "Running"
    : isFailed
    ? "Failed"
    : isSkipped
    ? "Skipped"
    : "Pending";

  // Chevron clip-path with notch
  const notchSize = 16;
  const clipPath = isFirst
    ? `polygon(0 0, calc(100% - ${notchSize}px) 0, 100% 50%, calc(100% - ${notchSize}px) 100%, 0 100%)`
    : isLast
    ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${notchSize}px 50%)`
    : `polygon(0 0, calc(100% - ${notchSize}px) 0, 100% 50%, calc(100% - ${notchSize}px) 100%, 0 100%, ${notchSize}px 50%)`;

  return (
    <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          clipPath,
          background: fillColor,
          padding: "14px 8px 14px 22px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 64,
          position: "relative",
          transition: "background 0.2s",
          boxShadow: isActive ? `inset 0 0 20px ${THEME.cyan}10` : "none",
        }}
      >
        {/* Active glow border effect */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath,
              boxShadow: `inset 0 0 0 2px ${THEME.cyan}40`,
              animation: "playgroundPulse 2s infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: isFirst ? 0 : notchSize,
              right: isLast ? 0 : notchSize,
              height: 3,
              background: THEME.accent,
              borderRadius: "3px 3px 0 0",
            }}
          />
        )}

        {/* Stage name */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: textColor,
            fontFamily: THEME.fontUI,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {phase.label}
        </div>

        {/* Status */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: textColor,
            fontFamily: THEME.fontMono,
            marginTop: 4,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          {statusLabel}
        </div>
      </motion.div>

      {/* Hover popover — description below chevron */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
              marginTop: 6,
              padding: "8px 14px",
              background: THEME.bgSurface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: THEME.textSecondary,
                fontFamily: THEME.fontUI,
                lineHeight: 1.4,
              }}
            >
              {STAGE_DESCRIPTIONS[phase.id]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Chevron Strip ────────────────────────────────────────────────────

export default function ChevronStrip({ statuses, selectedStage, onSelectStage }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        width: "100%",
      }}
    >
      {PIPELINE_PHASES.map((phase, i) => (
        <Chevron
          key={phase.id}
          phase={phase}
          status={statuses[phase.id] || "pending"}
          isFirst={i === 0}
          isLast={i === PIPELINE_PHASES.length - 1}
          isSelected={selectedStage === phase.id}
          onClick={() => onSelectStage(phase.id)}
        />
      ))}
    </div>
  );
}
