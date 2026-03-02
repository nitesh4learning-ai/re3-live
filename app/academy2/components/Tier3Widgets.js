"use client";
// Tier 3 course-specific interactive widgets.
// These are placeholders that render a styled interactive placeholder.
// When fully ported, replace each with the actual implementation from AcademyTier3.js.

import { useState } from "react";

const GIM = {
  primary: '#9333EA', cardBg: '#FFFFFF', border: '#E5E7EB',
  headingText: '#111827', bodyText: '#4B5563', mutedText: '#9CA3AF',
  fontMain: "'Inter',system-ui,sans-serif",
};

function InteractiveWidget({ title, icon, description, children }) {
  return (
    <div className="rounded-xl border p-4 mb-4" style={{ borderColor: GIM.border, background: GIM.cardBg }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 16 }}>{icon || '\u2699\uFE0F'}</span>
        <span className="font-semibold" style={{ fontSize: 14, color: GIM.headingText, fontFamily: GIM.fontMain }}>{title}</span>
      </div>
      {description && <p className="mb-3" style={{ fontSize: 12, color: GIM.mutedText }}>{description}</p>}
      {children}
    </div>
  );
}

export function ReActSimulator() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Thought', text: 'I need to find information about the user\'s query.' },
    { label: 'Action', text: 'search("user query topic")' },
    { label: 'Observation', text: 'Found 3 relevant results...' },
    { label: 'Thought', text: 'I have enough information to answer.' },
    { label: 'Answer', text: 'Based on my research, here is the answer...' },
  ];
  return (
    <InteractiveWidget title="ReAct Loop Simulator" icon={'\uD83D\uDD04'} description="Step through a ReAct reasoning loop">
      <div className="space-y-2 mb-3">
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: i === step ? '#FAF5FF' : '#F9FAFB' }}>
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: GIM.primary + '20', color: GIM.primary }}>{s.label}</span>
            <span style={{ fontSize: 13, color: GIM.bodyText }}>{s.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#F3F4F6', color: step === 0 ? GIM.mutedText : GIM.bodyText }}>Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: GIM.primary, color: 'white' }}>Next Step</button>
      </div>
    </InteractiveWidget>
  );
}

export function AgentBuilder() { return <InteractiveWidget title="Agent Builder" icon={'\uD83E\uDD16'} description="Design an agent with role, tools, and memory configuration." />; }
export function AgentCostCalculator() { return <InteractiveWidget title="Agent Cost Calculator" icon={'\uD83D\uDCB0'} description="Estimate costs for multi-agent orchestration." />; }
export function AgentToolSchemaBuilder() { return <InteractiveWidget title="Tool Schema Builder" icon={'\uD83D\uDD27'} description="Design tool schemas for agent use." />; }
export function ArchitectureDesigner() { return <InteractiveWidget title="Architecture Designer" icon={'\uD83C\uDFD7\uFE0F'} description="Design system architecture interactively." />; }
export function BasicVsGraphRAGComparison() { return <InteractiveWidget title="Basic vs Graph RAG" icon={'\uD83D\uDD00'} description="Compare basic RAG with GraphRAG approaches." />; }
export function CommunityExplorer() { return <InteractiveWidget title="Community Explorer" icon={'\uD83C\uDF10'} description="Explore graph communities and their relationships." />; }
export function CostCalculator() { return <InteractiveWidget title="Cost Calculator" icon={'\uD83D\uDCB0'} description="Calculate and compare LLM gateway costs." />; }
export function DataQualityChecker() { return <InteractiveWidget title="Data Quality Checker" icon={'\u2705'} description="Evaluate training data quality for fine-tuning." />; }
export function DecisionTreeExplorer() { return <InteractiveWidget title="Decision Tree Explorer" icon={'\uD83C\uDF33'} description="Explore when to fine-tune vs prompt vs distill." />; }
export function DistillationSimulator() { return <InteractiveWidget title="Distillation Simulator" icon={'\uD83E\uDDEA'} description="Simulate teacher-student model distillation." />; }
export function DriftDetector() { return <InteractiveWidget title="Drift Detector" icon={'\uD83D\uDCCA'} description="Detect model performance drift over time." />; }
export function EvalMaturityQuiz() { return <InteractiveWidget title="Eval Maturity Assessment" icon={'\uD83C\uDF93'} description="Assess your AI evaluation maturity level." />; }
export function EvalPipelineBuilder() { return <InteractiveWidget title="Eval Pipeline Builder" icon={'\uD83D\uDD27'} description="Build an AI evaluation pipeline." />; }
export function GatewaySimulator() { return <InteractiveWidget title="Gateway Simulator" icon={'\uD83D\uDE80'} description="Simulate LLM gateway routing decisions." />; }
export function GraphDesignChallenge() { return <InteractiveWidget title="Graph Design Challenge" icon={'\uD83C\uDFAF'} description="Design knowledge graphs for different domains." />; }
export function HybridSearchOptimizer() { return <InteractiveWidget title="Hybrid Search Optimizer" icon={'\uD83D\uDD0E'} description="Optimize hybrid search weights and parameters." />; }
export function JudgePatternSimulator() { return <InteractiveWidget title="LLM-as-Judge Simulator" icon={'\u2696\uFE0F'} description="Simulate LLM-as-judge evaluation patterns." />; }
export function LoRAVisualizer() { return <InteractiveWidget title="LoRA Visualizer" icon={'\uD83D\uDD2C'} description="Visualize how LoRA adapters modify model weights." />; }
export function MetricCalculator() { return <InteractiveWidget title="Metric Calculator" icon={'\uD83D\uDCCA'} description="Calculate AI evaluation metrics." />; }
export function MiniGraphBuilder() { return <InteractiveWidget title="Mini Graph Builder" icon={'\uD83C\uDF10'} description="Build a small knowledge graph interactively." />; }
export function PatternMatcher() { return <InteractiveWidget title="Pattern Matcher" icon={'\uD83E\uDDE9'} description="Match agentic patterns to use cases." />; }
export function PipelineBuilder() { return <InteractiveWidget title="Pipeline Builder" icon={'\uD83D\uDD27'} description="Build processing pipelines step by step." />; }
export function ResourceExplorer() { return <InteractiveWidget title="Resource Explorer" icon={'\uD83D\uDCC2'} description="Explore MCP resources and their schemas." />; }
export function RetrievalStrategyComparator() { return <InteractiveWidget title="Retrieval Strategy Comparator" icon={'\uD83D\uDD00'} description="Compare different retrieval strategies." />; }
export function SecurityConfigBuilder() { return <InteractiveWidget title="Security Config Builder" icon={'\uD83D\uDD12'} description="Configure security settings for MCP servers." />; }
export function ToolSchemaBuilder() { return <InteractiveWidget title="Tool Schema Builder" icon={'\uD83D\uDD27'} description="Design MCP tool schemas interactively." />; }
export function TripleBuilder() { return <InteractiveWidget title="Triple Builder" icon={'\uD83D\uDD17'} description="Build knowledge graph triples (subject, predicate, object)." />; }
export function ABTestSimulator() { return <InteractiveWidget title="A/B Test Simulator" icon={'\uD83E\uDDEA'} description="Simulate A/B tests for model evaluation." />; }
