"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GIM, ADB, FadeIn, ExpandableSection } from "./Academy";

// ==================== JARGON GLOSSARY ====================
// Plain-English definitions for technical terms. Course authors wrap terms
// with <JargonTip term="key"> to render inline tooltips.
const GLOSSARY = {
  // Tier 1 terms
  "token": "A chunk of text (roughly 4 characters or \u00be of a word) that the AI processes as a single unit.",
  "context window": "The maximum amount of text an AI model can 'see' at once \u2014 like the size of its working memory.",
  "temperature": "A setting (0\u20132) that controls randomness: low = predictable, high = creative/wild.",
  "embedding": "A list of numbers that represents the 'meaning' of text, so a computer can compare how similar things are.",
  "vector search": "Finding the most similar items by comparing their embeddings (number-lists) instead of matching keywords.",
  "cosine similarity": "A math trick to measure how 'close' two embeddings point in the same direction \u2014 1.0 = identical meaning.",
  "RAG": "Retrieval-Augmented Generation \u2014 the AI looks up real documents first, then uses them to write a better answer.",
  "hallucination": "When the AI confidently states something that is factually wrong or completely made up.",
  "prompt engineering": "The craft of writing instructions to an AI so it gives you exactly the output you want.",
  "system prompt": "Hidden instructions given to the AI before the conversation starts \u2014 defines its personality and rules.",
  "few-shot": "Giving the AI a few examples of what you want so it can follow the pattern.",
  "chain-of-thought": "Asking the AI to 'think step by step' so it reasons through a problem before answering.",
  "fine-tuning": "Training an existing AI model on your own data so it becomes specialized for your task.",
  "inference": "When the AI actually runs and generates a response \u2014 the 'thinking' step.",
  "guardrails": "Safety rules that prevent the AI from generating harmful, biased, or off-topic content.",
  "JSON mode": "A setting that forces the AI to output valid JSON (structured data) instead of freeform text.",
  "structured output": "AI responses formatted in a predictable schema (like JSON) so your code can reliably parse them.",
  "BPE": "Byte-Pair Encoding \u2014 the algorithm that splits text into tokens by merging the most common character pairs.",
  "top-p": "Nucleus sampling \u2014 instead of picking from all possible words, only consider the top ones that add up to probability p.",
  "top-k": "Only consider the k most likely next tokens when generating text \u2014 limits randomness.",
  "context engineering": "The meta-skill of designing what the model sees: prompt + memory + retrieval + tools = context.",
  "chunking": "Splitting large documents into smaller pieces (chunks) so they can be embedded and retrieved individually.",
  "zero-shot": "Asking the AI to perform a task with no examples \u2014 relying entirely on its pre-trained knowledge.",
  "grounding": "Connecting AI outputs to verified facts or real data sources to reduce hallucination.",
  "prompt injection": "An attack where a user hides instructions in their input to override the AI's system prompt.",
  // Tier 2 terms
  "MCP": "Model Context Protocol \u2014 a universal 'USB-C adapter' that lets AI tools connect to any data source.",
  "A2A": "Agent-to-Agent protocol \u2014 how AI agents discover each other and exchange tasks across platforms.",
  "ACP": "Agent Communication Protocol \u2014 IBM's event-driven, async-first messaging standard for enterprise agent ecosystems.",
  "function calling": "The AI deciding which tool/function to use and generating the right arguments to call it.",
  "agent": "An AI system that can plan, use tools, and take actions autonomously to complete a goal.",
  "tool use": "When an AI calls external functions (search, calculator, API) to get information it doesn't have.",
  "agentic loop": "The cycle where an AI thinks \u2192 acts \u2192 observes the result \u2192 thinks again until the task is done.",
  "ReAct": "Reason + Act \u2014 a pattern where the AI alternates between reasoning about what to do and taking action.",
  "HITL": "Human-in-the-Loop \u2014 a design pattern where humans approve or correct AI decisions at key checkpoints.",
  "agent card": "A JSON manifest describing what an agent can do, its skills, and how to communicate with it (from A2A protocol).",
  "tool schema": "A JSON description of a tool's name, parameters, and types \u2014 tells the AI how to call it correctly.",
  "plan-and-execute": "A pattern where the AI first creates a plan, then executes each step, adjusting as it goes.",
  "reflection": "When an AI evaluates its own output and tries to improve it before returning the final answer.",
  "escalation": "Handing a task from an AI to a human when the AI's confidence is too low or the stakes are too high.",
  "semantic memory": "Long-term storage of facts and knowledge that the AI can query \u2014 like a personal encyclopedia.",
  "episodic memory": "Memory of specific past interactions or events \u2014 lets the AI recall 'what happened last time'.",
  // Tier 3 terms
  "multi-agent": "Multiple specialized AI agents working together, each handling a different part of a complex task.",
  "knowledge graph": "A structured web of facts (entities + relationships) that AI can traverse to find connected information.",
  "observability": "The ability to see what your AI is doing internally \u2014 traces, logs, metrics \u2014 so you can debug and improve it.",
  "LLM gateway": "A single entry point that routes AI requests to different providers, handles fallbacks, and tracks costs.",
  "LoRA": "Low-Rank Adaptation \u2014 a way to fine-tune a huge AI model by only changing a tiny fraction of its parameters.",
  "QLoRA": "Quantized LoRA \u2014 fine-tuning with even less memory by using 4-bit quantization alongside LoRA adapters.",
  "distillation": "Training a small, fast model to mimic a large, expensive one \u2014 getting 80% of the quality at 10% of the cost.",
  "GraphRAG": "A RAG approach that builds a knowledge graph from documents, enabling multi-hop reasoning across entities.",
  "reranking": "A second-pass model that re-scores retrieved documents by relevance \u2014 improves RAG accuracy significantly.",
  "hybrid search": "Combining keyword search (BM25) with vector/semantic search to get the best of both approaches.",
  "tracing": "Recording each step of an AI pipeline (prompt, model call, tool use, response) so you can replay and debug it.",
  "drift detection": "Monitoring AI output quality over time to catch when performance degrades \u2014 models can silently get worse.",
  "eval": "Systematic evaluation of AI outputs using metrics, human judges, or LLM-as-judge to measure quality.",
  "LLM-as-judge": "Using one AI model to evaluate the output of another \u2014 scalable but needs calibration against human judgment.",
  "multimodal": "AI that can process multiple types of input \u2014 text, images, audio, video \u2014 and reason across them.",
  "STT": "Speech-to-Text \u2014 converting spoken audio into written text that an AI can process.",
  "TTS": "Text-to-Speech \u2014 converting AI-generated text into natural-sounding spoken audio.",
  "vibe coding": "A casual approach to coding with AI where you describe what you want conversationally and the AI writes the code.",
  "RAPTOR": "Recursive Abstractive Processing for Tree-Organized Retrieval \u2014 a hierarchical summarization approach for RAG.",
  // Tier 4 terms
  "AI governance": "The rules, processes, and oversight structures that ensure AI is used responsibly in an organization.",
  "red-teaming": "Deliberately trying to break an AI system to find its weaknesses before real users do.",
  "EU AI Act": "European law that classifies AI systems by risk level and sets requirements for each category.",
  "NIST AI RMF": "The US National Institute of Standards framework for managing AI risks across the lifecycle.",
  "model card": "A document describing a model's capabilities, limitations, biases, and intended use \u2014 like a nutrition label for AI.",
  "computer use": "AI that can see your screen and control your mouse/keyboard to operate software like a human would.",
  "explainability": "The ability to understand and explain why an AI made a specific decision \u2014 critical for trust and compliance.",
  "fairness": "Ensuring AI systems don't discriminate against protected groups \u2014 measured through statistical parity and other metrics.",
  "ROI": "Return on Investment \u2014 measuring whether an AI project's benefits outweigh its costs.",
  "embodied AI": "AI that exists in a physical body (robot) and must interact with the real world through sensors and actuators.",
  // Cross-tier terms
  "RLHF": "Reinforcement Learning from Human Feedback — training AI to align with human preferences by learning from human ratings of model outputs.",
  "DPO": "Direct Preference Optimization — a simpler alternative to RLHF that fine-tunes a model directly on human preference pairs without a separate reward model.",
  "transformer": "The neural network architecture behind all modern LLMs — uses attention to process text in parallel rather than sequentially.",
  "attention": "The mechanism that lets each token look at every other token to understand relationships and context — the core innovation of transformers.",
  "latency": "The time delay between sending a request to an AI model and receiving the full response — critical for user experience.",
  "TTFT": "Time-to-First-Token — how quickly the AI starts responding, the key metric for perceived speed in streaming applications.",
  "streaming": "Sending AI output token-by-token as it's generated, so users see results immediately instead of waiting for the full response.",
  "KV cache": "Key-Value cache — a memory structure that stores previously computed attention data so the model doesn't recompute it for each new token.",
  "model cascading": "Routing simple queries to cheap/fast models and only sending complex ones to expensive models — cutting costs 60–80%.",
  "prompt caching": "Reusing computed representations of repeated prompt prefixes across requests, saving up to 90% on identical system prompts.",
  "sycophancy": "When an AI agrees with or flatters the user instead of giving an honest, accurate answer — a common alignment failure.",
  "RPA": "Robotic Process Automation — software bots that automate repetitive tasks by mimicking human actions on a computer screen.",
  "sim-to-real": "Transferring skills an AI learned in a virtual simulation into real-world physical environments — bridging the reality gap.",
  "sensor fusion": "Combining data from multiple sensors (cameras, lidar, touch) to build a richer understanding of the physical environment.",
  "NER": "Named Entity Recognition — automatically identifying and classifying proper nouns (people, places, organizations) in text.",
  "cross-encoder": "A model that takes two texts together and directly scores their relevance — slower but more accurate than embedding comparison.",
  "constrained decoding": "Forcing the model to only generate tokens that form valid output (like valid JSON), guaranteeing format compliance.",
  "circuit breaker": "A pattern that stops sending requests to a failing AI provider after repeated errors, preventing cascading failures.",
  "orchestration": "Coordinating multiple AI agents or steps in a pipeline — deciding who does what, in what order, and how results combine.",
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
