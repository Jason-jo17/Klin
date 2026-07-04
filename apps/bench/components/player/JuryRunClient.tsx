"use client";

import { Card } from "@kiln/ui";
import { JuryScorePanel } from "./JuryScorePanel";

export function JuryRunClient({ runId }: { runId: string }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Jury run</h1>
        <p style={{ color: "var(--kiln-text-secondary)", fontSize: "0.8125rem" }}>Run ID: {runId}</p>
      </header>
      <Card>
        <JuryScorePanel runId={runId} />
      </Card>
    </div>
  );
}
