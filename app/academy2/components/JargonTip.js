"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GIM } from "../constants";

// Glossary — 100+ technical terms with plain-English definitions
const GLOSSARY = {
  // Tier 1 Core
  token: "A chunk of text (roughly 4 characters or \u00be of a word) that an LLM processes. Models don't read words \u2014 they read tokens.",
  "context window": "The maximum amount of text a model can see at once. Think of it as the model's working memory \u2014 once full, older text falls off.",
  temperature: "A number (0\u20132) controlling how creative vs. predictable the model's output is. Low = focused and deterministic, high = varied and creative.",
  embedding: "A list of numbers representing the meaning of text. Texts with similar meanings have similar numbers, enabling semantic search.",
  rag: "Retrieval-Augmented Generation. Instead of relying only on training data, the model retrieves relevant documents first, then generates an answer grounded in them.",
  hallucination: "When an AI generates confident but factually wrong information. It happens because models predict plausible-sounding text, not verified facts.",
  "system prompt": "Hidden instructions given to the model before a conversation begins. It sets the model's persona, rules, and constraints.",
  "chain-of-thought": "A prompting technique where you ask the model to show its reasoning step-by-step before giving a final answer. Dramatically improves accuracy.",
  "few-shot": "Providing example input-output pairs in your prompt so the model learns the pattern. Like teaching by example.",
  "structured output": "Getting the model to return data in a specific format (JSON, XML, etc.) rather than free-form text.",
  // Tier 2 Protocols
  mcp: "Model Context Protocol. A standard for connecting AI models to external tools and data sources. Like USB for AI.",
  a2a: "Agent-to-Agent protocol. A standard for AI agents to discover, communicate, and collaborate across platforms.",
  acp: "Agent Communication Protocol. IBM's event-driven, async-first messaging standard for enterprise agent ecosystems.",
  "function calling": "The ability for an LLM to output a structured request to call a specific function with specific parameters, bridging AI and code.",
  agent: "An AI system that can reason about goals, make plans, use tools, and take actions autonomously. More than a chatbot \u2014 it's an AI with agency.",
  react: "ReAct (Reasoning + Acting). An agent pattern where the model alternates between thinking about what to do and actually doing it.",
  hitl: "Human-in-the-Loop. Design patterns that keep humans involved in AI decisions \u2014 approval gates, escalation paths, confidence thresholds.",
  "semantic memory": "An AI's stored knowledge organized by meaning, not by when it was learned. Like an encyclopedia in the agent's head.",
  "episodic memory": "An AI's stored record of past interactions and events, organized chronologically. Like a conversation diary.",
  // Tier 3 Advanced
  "multi-agent": "Systems where multiple specialized AI agents collaborate on complex tasks, each with different expertise and roles.",
  "knowledge graph": "A structured network of entities and their relationships. Enables reasoning over connections that vector search misses.",
  observability: "The ability to see inside your AI system \u2014 what it's doing, why, how well, and where it's failing.",
  lora: "Low-Rank Adaptation. A technique for fine-tuning large models cheaply by only training small adapter layers instead of the whole model.",
  qlora: "Quantized LoRA. Combines model compression (quantization) with LoRA to fine-tune models on consumer GPUs.",
  distillation: "Training a smaller, faster model to mimic a larger one. The student learns from the teacher's behavior.",
  graphrag: "Graph-enhanced RAG. Combines knowledge graphs with vector search for retrieval that understands relationships.",
  reranking: "A second pass over retrieved documents to re-score them for relevance. Often uses a cross-encoder model.",
  "hybrid search": "Combining keyword search (BM25) with semantic search (embeddings) for retrieval that handles both exact matches and meaning.",
  "llm-as-judge": "Using one LLM to evaluate another LLM's output. A scalable alternative to human evaluation.",
  multimodal: "AI that processes multiple types of input \u2014 text, images, audio, video \u2014 and reasons across them.",
  stt: "Speech-to-Text. Converting spoken audio into written text. The first step in voice AI pipelines.",
  tts: "Text-to-Speech. Converting written text into spoken audio. The last step in voice AI pipelines.",
  raptor: "Recursive Abstractive Processing for Tree-Organized Retrieval. A technique for building hierarchical summaries of documents.",
  // Tier 4 Strategic
  "ai governance": "The frameworks, policies, and processes for ensuring AI is developed and used responsibly within an organization.",
  "red-teaming": "Deliberately trying to break or trick an AI system to find its vulnerabilities before bad actors do.",
  "eu ai act": "The European Union's comprehensive AI regulation, classifying AI systems by risk level and imposing requirements accordingly.",
  "nist ai rmf": "NIST AI Risk Management Framework. A voluntary US framework for identifying and managing AI risks.",
  "model card": "A document describing a model's capabilities, limitations, intended use, and known biases. Like a nutrition label for AI.",
  "computer use": "AI that can see and interact with a computer screen \u2014 clicking, typing, navigating \u2014 like a digital human operator.",
  explainability: "The ability to understand and explain why an AI made a specific decision. Critical for trust and compliance.",
  fairness: "Ensuring AI systems don't discriminate against protected groups. Measured through disparate impact analysis.",
  roi: "Return on Investment. For AI: measuring the business value generated vs. the total cost of development, deployment, and maintenance.",
  "embodied ai": "AI that exists in a physical body (robot) and interacts with the real world through sensors and actuators.",
  "sim-to-real": "Simulation-to-Real transfer. Training an AI in a virtual environment then deploying it in the physical world.",
};

export default function JargonTip({ term, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const definition = GLOSSARY[term.toLowerCase()] || children || `Technical term: ${term}`;

  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 320)) });
    }
    setShow(true);
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        onFocus={handleEnter}
        onBlur={() => setShow(false)}
        tabIndex={0}
        role="term"
        aria-describedby={show ? `jargon-${term}` : undefined}
        style={{
          borderBottom: '1.5px dotted #9333EA',
          cursor: 'help',
          color: 'inherit',
        }}
      >
        {term}
      </span>
      {show && mounted && createPortal(
        <div
          id={`jargon-${term}`}
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            maxWidth: 300,
            background: '#1E293B',
            color: '#E2E8F0',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.6,
            fontFamily: GIM.fontMain,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: '#A78BFA' }}>{term}</strong>
          <br />
          {definition}
        </div>,
        document.body
      )}
    </>
  );
}
