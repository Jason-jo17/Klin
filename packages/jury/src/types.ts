import type { Strategy } from "@kiln/schema";

export interface RubricScores {
  accessibility: number;
  tokenAdherence: number;
  structuralValidity: number;
  safety: number;
  latency: number;
}

export interface SafetyFinding {
  prompt: string;
  escaped: boolean;
  detail: string;
}

export interface JuryRunResult {
  runId: string;
  templateId: string;
  strategy: Strategy;
  prompt: string;
  timestamp: string;
  scores: RubricScores;
  safetyFindings: SafetyFinding[];
  axeViolations: number;
  latencyMs: number;
  passed: boolean;
  thresholdFailures: string[];
}

export interface JuryThresholds {
  accessibility: number;
  tokenAdherence: number;
  structuralValidity: number;
  safety: number;
  maxLatencyMs: number;
}
