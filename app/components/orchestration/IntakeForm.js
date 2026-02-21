"use client";
// Use Case Intake Form — Entry point for submitting orchestration use cases.
// Phase 1 complete: NLP intent classification, complexity scoring, guardrails.

import { useState, useEffect, useRef, useCallback } from "react";

const USE_CASE_TYPES = [
  {
    value: "micro-saas-validator",
    label: "Micro-SaaS Validator",
    description: "Niche analysis, demand signals, MVP feature set, pricing model",
    icon: "\uD83D\uDE80",
  },
  {
    value: "ai-workflow-blueprint",
    label: "AI Workflow Blueprint",
    description: "Automation opportunity mapping, tool selection, implementation plan",
    icon: "\uD83E\uDD16",
  },
  {
    value: "creator-monetization",
    label: "Creator Monetization Plan",
    description: "Audience analysis, product-market fit, launch strategy",
    icon: "\uD83C\uDFA8",
  },
  {
    value: "vertical-agent-design",
    label: "Vertical AI Agent Design",
    description: "Agent persona, capabilities, market positioning, tech stack",
    icon: "\uD83E\uDDE0",
  },
  {
    value: "growth-experiment",
    label: "Growth Experiment Playbook",
    description: "Channel analysis, experiment design, success metrics",
    icon: "\uD83D\uDCC8",
  },
];

const COMPLEXITY_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  "exceeds-limit": "#EF4444",
};

const COMPLEXITY_LABELS = {
  low: "Low Complexity",
  medium: "Medium Complexity",
  high: "High Complexity",
  "exceeds-limit": "Exceeds Limit",
};

export default function IntakeForm({ onSubmit, isRunning }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  // Analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const debounceRef = useRef(null);
  const lastAnalyzedRef = useRef("");

  // Debounced analysis call
  const triggerAnalysis = useCallback(async (currentTitle, currentDescription) => {
    const key = `${currentTitle}::${currentDescription}`;
    if (key === lastAnalyzedRef.current) return;
    if (!currentDescription || currentDescription.trim().length < 20) {
      setAnalysis(null);
      return;
    }

    lastAnalyzedRef.current = key;
    setAnalyzing(true);

    try {
      const { getFirebase } = await import("../../utils/firebase-client");
      const { auth } = await getFirebase();
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        setAnalyzing(false);
        return;
      }

      const res = await fetch("/api/orchestration/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: currentTitle.trim(),
          description: currentDescription.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);

        // Auto-suggest type if user hasn't selected one and confidence is good
        if (!type && data.classification?.suggestedType && data.classification.confidence >= 0.3) {
          setType(data.classification.suggestedType);
        }
      }
    } catch {
      // Analysis is non-blocking — silently continue
    } finally {
      setAnalyzing(false);
    }
  }, [type]);

  // Watch title/description changes and debounce analysis
  useEffect(() => {
    if (isRunning) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      triggerAnalysis(title, description);
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, description, isRunning, triggerAnalysis]);

  const isBlocked = analysis?.guardrails?.blocks?.length > 0;

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
    if (isBlocked) {
      setError("Use case exceeds complexity limits. Simplify the scope and try again.");
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

      {/* Analysis Panel */}
      <AnalysisPanel analysis={analysis} analyzing={analyzing} />

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
          {analysis?.classification?.suggestedType && !type && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 10,
                fontWeight: 600,
                color: "#9333EA",
                background: "rgba(147, 51, 234, 0.08)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              Auto-suggested
            </span>
          )}
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {USE_CASE_TYPES.map((uc) => {
            const isSuggested =
              analysis?.classification?.suggestedType === uc.value &&
              analysis.classification.confidence >= 0.3;

            return (
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
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{uc.icon}</span>
                <div style={{ flex: 1 }}>
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
                {isSuggested && type !== uc.value && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#9333EA",
                      background: "rgba(147, 51, 234, 0.08)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                    }}
                  >
                    SUGGESTED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guardrail Warnings */}
      {analysis?.guardrails?.warnings?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {analysis.guardrails.warnings.map((w, i) => (
            <div
              key={i}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                color: "#92400E",
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 6,
              }}
            >
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Guardrail Blocks */}
      {analysis?.guardrails?.blocks?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {analysis.guardrails.blocks.map((b, i) => (
            <div
              key={i}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 6,
              }}
            >
              {b}
            </div>
          ))}
        </div>
      )}

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
        disabled={isRunning || isBlocked}
        style={{
          width: "100%",
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 700,
          color: "#FFFFFF",
          background:
            isRunning || isBlocked
              ? "#D1D5DB"
              : "linear-gradient(135deg, #9333EA, #7C3AED)",
          border: "none",
          borderRadius: 12,
          cursor: isRunning || isBlocked ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          boxShadow:
            isRunning || isBlocked
              ? "none"
              : "0 4px 12px rgba(147, 51, 234, 0.3)",
        }}
      >
        {isRunning
          ? "Orchestration Running..."
          : isBlocked
            ? "Blocked by Guardrails"
            : "Launch Orchestration"}
      </button>
    </div>
  );
}

/**
 * Analysis Panel — shows complexity scoring, estimates, and classification info.
 * Appears after the system analyzes the user's description.
 */
function AnalysisPanel({ analysis, analyzing }) {
  if (!analysis && !analyzing) return null;

  const complexity = analysis?.complexity;
  const classification = analysis?.classification;

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 16,
        borderRadius: 10,
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        transition: "all 0.3s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: complexity ? 12 : 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#6B7280",
            textTransform: "uppercase",
          }}
        >
          PRE-FLIGHT ANALYSIS
        </span>
        {analyzing && (
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>
            Analyzing...
          </span>
        )}
        {classification?.source === "llm" && !analyzing && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "#7C3AED",
              background: "rgba(124, 58, 237, 0.08)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            NLP CLASSIFIED
          </span>
        )}
      </div>

      {complexity && (
        <>
          {/* Complexity Bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                Complexity
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COMPLEXITY_COLORS[complexity.rating] || "#6B7280",
                }}
              >
                {COMPLEXITY_LABELS[complexity.rating] || complexity.rating}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "#E5E7EB",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(complexity.score * 100, 100)}%`,
                  borderRadius: 3,
                  background: COMPLEXITY_COLORS[complexity.rating] || "#9CA3AF",
                  transition: "width 0.5s ease, background 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Estimates Row */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <EstimatePill
              label="Agents"
              value={`~${complexity.estimatedAgents}`}
            />
            <EstimatePill
              label="Tokens"
              value={`~${(complexity.estimatedTokens / 1000).toFixed(0)}K`}
            />
            <EstimatePill
              label="Est. Cost"
              value={`~$${complexity.estimatedCost.toFixed(3)}`}
            />
            <EstimatePill
              label="Words"
              value={complexity.wordCount}
            />
          </div>
        </>
      )}
    </div>
  );
}

function EstimatePill({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{label}:</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
        {value}
      </span>
    </div>
  );
}
