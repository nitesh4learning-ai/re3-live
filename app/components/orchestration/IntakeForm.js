"use client";
// Use Case Intake Form — Entry point for submitting orchestration use cases.

import { useState } from "react";

const USE_CASE_TYPES = [
  {
    value: "competitive-analysis",
    label: "Competitive Analysis Brief",
    description: "Market landscape, competitor positioning, strategic opportunities",
    icon: "\uD83D\uDD0D",
  },
  {
    value: "communication-plan",
    label: "Stakeholder Communication Plan",
    description: "Messaging strategy, audience mapping, tone calibration",
    icon: "\uD83D\uDCE3",
  },
  {
    value: "decision-matrix",
    label: "Decision Matrix",
    description: "Criteria definition, scoring, trade-off analysis",
    icon: "\uD83D\uDCCA",
  },
  {
    value: "process-recommendation",
    label: "Process Recommendation",
    description: "Workflow analysis, optimization proposals, implementation roadmap",
    icon: "\u2699\uFE0F",
  },
  {
    value: "meeting-brief",
    label: "Meeting Brief Generator",
    description: "Context gathering, agenda structuring, action item framing",
    icon: "\uD83D\uDCCB",
  },
];

export default function IntakeForm({ onSubmit, isRunning }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    if (!title.trim()) {
      setError("Please provide a title for your use case.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe what you need.");
      return;
    }
    if (!type) {
      setError("Please select a use case type.");
      return;
    }
    if (title.length > 120) {
      setError("Title must be under 120 characters.");
      return;
    }
    if (description.length > 2000) {
      setError("Description must be under 2000 characters.");
      return;
    }

    onSubmit({ title: title.trim(), description: description.trim(), type });
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 28,
        maxWidth: 600,
        width: "100%",
      }}
    >
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
        ORCHESTRATION
      </div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 4,
          fontFamily: "'Instrument Serif', Georgia, serif",
        }}
      >
        Submit a Use Case
      </h2>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24, lineHeight: 1.5 }}>
        Describe what you need and the system will assemble a team of specialist agents to deliver it.
      </p>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 6,
          }}
        >
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Competitive analysis for entering the healthcare AI market"
          maxLength={120}
          disabled={isRunning}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: 14,
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            outline: "none",
            color: "#111827",
            background: isRunning ? "#F9FAFB" : "#FFFFFF",
            transition: "border-color 0.2s",
          }}
        />
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, textAlign: "right" }}>
          {title.length}/120
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 6,
          }}
        >
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide context, scope, and any specific requirements..."
          rows={4}
          maxLength={2000}
          disabled={isRunning}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: 13,
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            outline: "none",
            color: "#111827",
            lineHeight: 1.6,
            resize: "vertical",
            background: isRunning ? "#F9FAFB" : "#FFFFFF",
          }}
        />
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4, textAlign: "right" }}>
          {description.length}/2000
        </div>
      </div>

      {/* Use Case Type */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Use Case Type
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {USE_CASE_TYPES.map((uc) => (
            <button
              key={uc.value}
              onClick={() => setType(uc.value)}
              disabled={isRunning}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                border:
                  type === uc.value
                    ? "2px solid #9333EA"
                    : "1px solid #E5E7EB",
                background:
                  type === uc.value ? "rgba(147, 51, 234, 0.04)" : "#FFFFFF",
                cursor: isRunning ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                opacity: isRunning ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{uc.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: type === uc.value ? "#9333EA" : "#111827",
                  }}
                >
                  {uc.label}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                  {uc.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#FEF2F2",
            color: "#DC2626",
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isRunning}
        style={{
          width: "100%",
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 700,
          color: "#FFFFFF",
          background: isRunning
            ? "#D1D5DB"
            : "linear-gradient(135deg, #9333EA, #7C3AED)",
          border: "none",
          borderRadius: 12,
          cursor: isRunning ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          boxShadow: isRunning ? "none" : "0 4px 12px rgba(147, 51, 234, 0.3)",
        }}
      >
        {isRunning ? "Orchestration Running..." : "Launch Orchestration"}
      </button>
    </div>
  );
}
