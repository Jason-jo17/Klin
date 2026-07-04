"use client";

import { useJuryStore } from "../../lib/state/juryStore";

const DIMENSIONS = [
  { key: "accessibility", label: "Accessibility" },
  { key: "tokenAdherence", label: "Token Adherence" },
  { key: "structuralValidity", label: "Structural Validity" },
  { key: "safety", label: "Safety" },
  { key: "latency", label: "Latency" },
] as const;

export function JuryScorePanel({ runId }: { runId: string }) {
  const run = useJuryStore((s) => s.getRun(runId));

  if (!run) {
    return <p style={{ color: "var(--kiln-text-tertiary)", fontSize: "0.8125rem" }}>No Jury run found for this session.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Jury result</h3>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "var(--kiln-space-1) var(--kiln-space-3)",
            borderRadius: "var(--kiln-radius-sm)",
            color: run.passed ? "var(--kiln-success-500)" : "var(--kiln-error-500)",
            background: run.passed ? "rgba(31,157,107,0.12)" : "rgba(217,67,47,0.12)",
          }}
        >
          {run.passed ? "PASS" : "FAIL"}
        </span>
      </div>

      {DIMENSIONS.map(({ key, label }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-3)" }}>
          <span style={{ width: "9rem", fontSize: "0.8125rem", color: "var(--kiln-text-secondary)" }}>{label}</span>
          <div style={{ flex: 1, height: 6, background: "var(--kiln-surface-3)", borderRadius: 3 }}>
            <div
              style={{
                width: `${(run.scores[key] / 5) * 100}%`,
                height: "100%",
                borderRadius: 3,
                background: run.thresholdFailures.includes(key) ? "var(--kiln-error-500)" : "var(--kiln-primary-500)",
              }}
            />
          </div>
          <span style={{ width: "2rem", textAlign: "right", fontSize: "0.8125rem" }}>{run.scores[key].toFixed(1)}</span>
        </div>
      ))}

      <p style={{ fontSize: "0.75rem", color: "var(--kiln-text-tertiary)", margin: 0 }}>
        {run.latencyMs}ms · {run.axeViolations} axe violation(s) · prompt: &quot;{run.prompt}&quot;
      </p>
    </div>
  );
}
