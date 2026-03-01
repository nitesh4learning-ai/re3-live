"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GIM, ADB, FadeIn, ExpandableSection } from "./Academy";

// ==================== JARGON GLOSSARY ====================
// Plain-English definitions for technical terms. Course authors wrap terms
// with <JargonTip term="key"> to render inline tooltips.
const GLOSSARY = {
  // Tier 1 terms
  "token": "A chunk of text (roughly 4 characters or ¾ of a word) that the AI processes as a single unit.",
  "context window": "The maximum amount of text an AI model can 'see' at once — like the size of its working memory.",
  "temperature": "A setting (0–2) that controls randomness: low = predictable, high = creative/wild.",
  "embedding": "A list of numbers that represents the 'meaning' of text, so a computer can compare how similar things are.",
  "vector search": "Finding the most similar items by comparing their embeddings (number-lists) instead of matching keywords.",
  "cosine similarity": "A math trick to measure how 'close' two embeddings point in the same direction — 1.0 = identical meaning.",
  "RAG": "Retrieval-Augmented Generation — the AI looks up real documents first, then uses them to write a better answer.",
  "hallucination": "When the AI confidently states something that is factually wrong or completely made up.",
  "prompt engineering": "The craft of writing instructions to an AI so it gives you exactly the output you want.",
  "system prompt": "Hidden instructions given to the AI before the conversation starts — defines its personality and rules.",
  "few-shot": "Giving the AI a few examples of what you want so it can follow the pattern.",
  "chain-of-thought": "Asking the AI to 'think step by step' so it reasons through a problem before answering.",
  "fine-tuning": "Training an existing AI model on your own data so it becomes specialized for your task.",
  "inference": "When the AI actually runs and generates a response — the 'thinking' step.",
  "guardrails": "Safety rules that prevent the AI from generating harmful, biased, or off-topic content.",
  "JSON mode": "A setting that forces the AI to output valid JSON (structured data) instead of freeform text.",
  "structured output": "AI responses formatted in a predictable schema (like JSON) so your code can reliably parse them.",
  // Tier 2 terms
  "MCP": "Model Context Protocol — a universal 'USB-C adapter' that lets AI tools connect to any data source.",
  "A2A": "Agent-to-Agent protocol — how AI agents discover each other and exchange tasks across platforms.",
  "function calling": "The AI deciding which tool/function to use and generating the right arguments to call it.",
  "agent": "An AI system that can plan, use tools, and take actions autonomously to complete a goal.",
  "tool use": "When an AI calls external functions (search, calculator, API) to get information it doesn't have.",
  "agentic loop": "The cycle where an AI thinks → acts → observes the result → thinks again until the task is done.",
  "ReAct": "Reason + Act — a pattern where the AI alternates between reasoning about what to do and taking action.",
  "HITL": "Human-in-the-Loop — a design pattern where humans approve or correct AI decisions at key checkpoints.",
  // Tier 3 terms
  "multi-agent": "Multiple specialized AI agents working together, each handling a different part of a complex task.",
  "knowledge graph": "A structured web of facts (entities + relationships) that AI can traverse to find connected information.",
  "observability": "The ability to see what your AI is doing internally — traces, logs, metrics — so you can debug and improve it.",
  "LLM gateway": "A single entry point that routes AI requests to different providers, handles fallbacks, and tracks costs.",
  "LoRA": "Low-Rank Adaptation — a way to fine-tune a huge AI model by only changing a tiny fraction of its parameters.",
  "distillation": "Training a small, fast model to mimic a large, expensive one — getting 80% of the quality at 10% of the cost.",
  // Tier 4 terms
  "AI governance": "The rules, processes, and oversight structures that ensure AI is used responsibly in an organization.",
  "red-teaming": "Deliberately trying to break an AI system to find its weaknesses before real users do.",
  "EU AI Act": "European law that classifies AI systems by risk level and sets requirements for each category.",
  "computer use": "AI that can see your screen and control your mouse/keyboard to operate software like a human would.",
};

// ==================== JARGON TIP COMPONENT ====================
/**
 * Inline tooltip for technical jargon. Renders the children as underline-dotted text;
 * on hover/tap shows a plain-English definition from the glossary.
 *
 * Usage: <JargonTip term="RAG">RAG</JargonTip>
 * Or:    <JargonTip term="token">tokens</JargonTip> (display text differs from key)
 */
function JargonTip({ term, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const definition = GLOSSARY[term?.toLowerCase()] || GLOSSARY[term] || null;
  if (!definition) return <>{children}</>;

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
    }
    setShow(true);
  };

  const handleLeave = () => setShow(false);

  const tooltip = show && typeof document !== "undefined" ? createPortal(
    <span
      style={{
        position: "fixed",
        top: pos.top,
        left: Math.min(pos.left, window.innerWidth - 260),
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: 240,
        padding: "8px 12px",
        borderRadius: 8,
        background: "#1E293B",
        color: "#E2E8F0",
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: GIM.fontMain,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontWeight: 700, color: "#A78BFA", display: "block", marginBottom: 2, fontSize: 11, letterSpacing: "0.03em" }}>
        {term}
      </span>
      {definition}
    </span>,
    document.body
  ) : null;

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => setShow(!show)}
        style={{
          borderBottom: `2px dotted ${GIM.primary}`,
          color: GIM.primary,
          cursor: "help",
          fontWeight: 600,
        }}
      >
        {children || term}
      </span>
      {tooltip}
    </>
  );
}

// ==================== REVIEW BOARD COMPONENT ====================
// Collapsible footer panel showing pre-generated agent reviews.
// Uses ExpandableSection from Academy for consistent UX.

const REVIEW_STORE_KEY = "reviews_v1";

function useReviewData(courseId) {
  const [data, setData] = useState(() => ADB.get(REVIEW_STORE_KEY, {}));

  const getReview = (cId) => data[cId || courseId] || null;

  const saveReview = (cId, review) => {
    setData((prev) => {
      const next = { ...prev, [cId]: review };
      ADB.set(REVIEW_STORE_KEY, next);
      return next;
    });
  };

  return { getReview, saveReview, allReviews: data };
}

/**
 * Single review card from one agent.
 */
function ReviewCard({ review }) {
  if (!review) return null;
  return (
    <div
      className="rounded-lg border p-3 mb-2"
      style={{ borderColor: GIM.border, background: GIM.borderLight }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0"
          style={{
            background: review.color || GIM.primaryBadge,
            color: "white",
            fontSize: 10,
          }}
        >
          {review.avatar || "??"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ fontSize: 13, color: GIM.headingText, fontFamily: GIM.fontMain }}>
            {review.agentName || "Unknown Agent"}
          </div>
          <div style={{ fontSize: 11, color: GIM.mutedText }}>{review.domain || "General"}</div>
        </div>
        {review.rating && (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} style={{ fontSize: 12, color: s <= review.rating ? "#F59E0B" : "#E5E7EB" }}>
                {"\u2605"}
              </span>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, color: GIM.bodyText, lineHeight: 1.6, fontFamily: GIM.fontMain }}>
        {review.comment}
      </p>
      {review.strengths && review.strengths.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {review.strengths.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: "#EBF5F1", color: "#2D8A6E", fontWeight: 600 }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ReviewBoard — collapsible panel showing 3 agent reviews for a course.
 * Uses pre-generated review data. If none exist, shows a placeholder.
 */
function ReviewBoard({ courseId, courseTitle, currentUser }) {
  const { getReview, saveReview } = useReviewData(courseId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reviewData = getReview(courseId);
  const canGenerate = currentUser?.email === "nitesh4learning@gmail.com";

  const generateReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, courseTitle }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      saveReview(courseId, data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpandableSection title="Agent Review Board" icon={"\uD83E\uDDD1\u200D\uD83C\uDFEB"} defaultOpen={false}>
      {reviewData ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 11, color: GIM.mutedText, fontFamily: GIM.fontMain }}>
              Reviewed by {reviewData.reviews?.length || 0} agents {"\u00b7"} Curated by Ada
            </span>
          </div>
          {(reviewData.reviews || []).map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
          {reviewData.summary && (
            <div className="rounded-lg p-3 mt-2" style={{ background: GIM.primaryLight, border: `1px solid rgba(147,51,234,0.12)` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span style={{ fontSize: 13 }}>{"\uD83C\uDFAF"}</span>
                <span className="font-semibold" style={{ fontSize: 12, color: GIM.primary }}>Consensus</span>
              </div>
              <p style={{ fontSize: 12, color: GIM.bodyText, lineHeight: 1.6 }}>{reviewData.summary}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          {canGenerate ? (<>
            <p style={{ fontSize: 13, color: GIM.mutedText, marginBottom: 12 }}>
              No reviews yet. Generate an AI review board for this course?
            </p>
            <button
              onClick={generateReviews}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-sm"
              style={{
                background: loading ? GIM.borderLight : GIM.primary,
                color: loading ? GIM.mutedText : "white",
              }}
            >
              {loading ? "Generating..." : "\uD83E\uDDD1\u200D\uD83C\uDFEB Generate Review Board"}
            </button>
            {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>{error}</p>}
          </>) : (
            <p style={{ fontSize: 13, color: GIM.mutedText }}>
              No reviews yet. Reviews will be available soon.
            </p>
          )}
        </div>
      )}
    </ExpandableSection>
  );
}

// ==================== ATTRIBUTION BADGES ====================
/**
 * Small badge showing "Created by" or "Reviewed by" agent(s).
 * Falls back to "Dummy" placeholder if no data.
 */
function AttributionBadge({ label, agents }) {
  const displayAgents = agents && agents.length > 0
    ? agents
    : [{ name: "Dummy", avatar: "??", color: "#9CA3AF" }];

  return (
    <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GIM.mutedText }}>
      <span style={{ fontWeight: 600 }}>{label}:</span>
      <div className="flex items-center">
        {displayAgents.map((a, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
            style={{
              background: a.color || GIM.primaryBadge,
              color: "white",
              fontSize: 8,
              marginLeft: i > 0 ? -4 : 0,
              border: "1.5px solid white",
              zIndex: displayAgents.length - i,
              position: "relative",
            }}
            title={a.name}
          >
            {a.avatar || a.name?.slice(0, 2)?.toUpperCase() || "??"}
          </div>
        ))}
        <span className="ml-1.5" style={{ color: GIM.bodyText }}>
          {displayAgents.map((a) => a.name).join(", ")}
        </span>
      </div>
    </div>
  );
}

// ==================== EXPORTS ====================
export { JargonTip, GLOSSARY, ReviewBoard, ReviewCard, AttributionBadge, useReviewData };
