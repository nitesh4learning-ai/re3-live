// MDX component mappings — used by next-mdx-remote to render custom components in MDX files.
// These are passed as the `components` prop to <MDXRemote />.
import Quiz from "./Quiz";
import CodeBlock from "./CodeBlock";
import AnalogyBox from "./AnalogyBox";
import ExpandableSection from "./ExpandableSection";
import MessageSimulator from "./MessageSimulator";
import SeeItInRe3 from "./SeeItInRe3";
import ArchitectureDecision from "./ArchitectureDecision";
import ComparisonTable from "./ComparisonTable";
import JargonTip from "./JargonTip";
import {
  TokenCounter, ContextVisualizer, TemperaturePlayground,
  TokenEstimationGame, ContextBudgetGame, TemperatureMatchingGame,
  PromptBuilder, SimilarityCalculator, HallucinationDetector,
  PipelineOrderGame, ContextBudgetAllocator, BiasDetectorGame,
  ModelCostCalculator, SchemaDesigner, ToolDefinitionBuilder, RiskClassifier,
} from "./Widgets";
import {
  ReActSimulator, AgentBuilder, AgentCostCalculator, AgentToolSchemaBuilder,
  ArchitectureDesigner, BasicVsGraphRAGComparison, CommunityExplorer,
  CostCalculator, DataQualityChecker, DecisionTreeExplorer,
  DistillationSimulator, DriftDetector, EvalMaturityQuiz, EvalPipelineBuilder,
  GatewaySimulator, GraphDesignChallenge, HybridSearchOptimizer,
  JudgePatternSimulator, LoRAVisualizer, MetricCalculator, MiniGraphBuilder,
  PatternMatcher, PipelineBuilder, ResourceExplorer, RetrievalStrategyComparator,
  SecurityConfigBuilder, ToolSchemaBuilder, TripleBuilder, ABTestSimulator,
} from "./Tier3Widgets";
import { GIM } from "../constants";

// Built-in HTML element overrides for consistent styling in MDX prose
export const mdxComponents = {
  // Prose elements
  h1: (props) => <h1 style={{ fontFamily: GIM.fontMain, fontSize: 28, fontWeight: 700, color: GIM.headingText, marginBottom: 16, lineHeight: 1.2 }} {...props} />,
  h2: (props) => <h2 style={{ fontFamily: GIM.fontMain, fontSize: 22, fontWeight: 700, color: GIM.headingText, marginTop: 32, marginBottom: 12, lineHeight: 1.3 }} {...props} />,
  h3: (props) => <h3 style={{ fontFamily: GIM.fontMain, fontSize: 17, fontWeight: 600, color: GIM.headingText, marginTop: 24, marginBottom: 8, lineHeight: 1.4 }} {...props} />,
  p: (props) => <p style={{ fontFamily: GIM.fontMain, fontSize: 14, color: GIM.bodyText, lineHeight: 1.8, marginBottom: 12 }} {...props} />,
  ul: (props) => <ul style={{ fontFamily: GIM.fontMain, fontSize: 14, color: GIM.bodyText, lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }} {...props} />,
  ol: (props) => <ol style={{ fontFamily: GIM.fontMain, fontSize: 14, color: GIM.bodyText, lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }} {...props} />,
  li: (props) => <li style={{ marginBottom: 4 }} {...props} />,
  strong: (props) => <strong style={{ color: GIM.headingText, fontWeight: 600 }} {...props} />,
  blockquote: (props) => (
    <blockquote
      style={{
        borderLeft: `3px solid ${GIM.primary}`,
        paddingLeft: 16,
        margin: '16px 0',
        fontStyle: 'italic',
        color: GIM.bodyText,
        fontSize: 14,
        lineHeight: 1.8,
      }}
      {...props}
    />
  ),
  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${GIM.border}`, margin: '24px 0' }} />,

  // Custom components available in MDX
  Quiz,
  CodeBlock,
  AnalogyBox,
  ExpandableSection,
  MessageSimulator,
  SeeItInRe3,
  ArchitectureDecision,
  ComparisonTable,
  JargonTip,

  // Interactive widgets
  TokenCounter,
  ContextVisualizer,
  TemperaturePlayground,
  TokenEstimationGame,
  ContextBudgetGame,
  TemperatureMatchingGame,
  PromptBuilder,
  SimilarityCalculator,
  HallucinationDetector,
  PipelineOrderGame,
  ContextBudgetAllocator,
  BiasDetectorGame,
  ModelCostCalculator,
  SchemaDesigner,
  ToolDefinitionBuilder,
  RiskClassifier,

  // Tier 3 course-specific widgets
  ReActSimulator,
  AgentBuilder,
  AgentCostCalculator,
  AgentToolSchemaBuilder,
  ArchitectureDesigner,
  BasicVsGraphRAGComparison,
  CommunityExplorer,
  CostCalculator,
  DataQualityChecker,
  DecisionTreeExplorer,
  DistillationSimulator,
  DriftDetector,
  EvalMaturityQuiz,
  EvalPipelineBuilder,
  GatewaySimulator,
  GraphDesignChallenge,
  HybridSearchOptimizer,
  JudgePatternSimulator,
  LoRAVisualizer,
  MetricCalculator,
  MiniGraphBuilder,
  PatternMatcher,
  PipelineBuilder,
  ResourceExplorer,
  RetrievalStrategyComparator,
  SecurityConfigBuilder,
  ToolSchemaBuilder,
  TripleBuilder,
  ABTestSimulator,
};

export default mdxComponents;
