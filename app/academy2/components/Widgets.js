"use client";
// Re-export all interactive widgets from the original Academy
// These are client components used in MDX course content.
// When Academy 1.0 is removed, move the implementations here.
export {
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
} from "../../AcademyWidgets";
