"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import type { TemplateManifest } from "@kiln/schema";
import type { JuryRunResult } from "@kiln/jury";
import { Button, Card } from "@kiln/ui";
import { ChatPane } from "./ChatPane";
import { ProviderPicker } from "../keys/ProviderPicker";
import { loadApiKey } from "../../lib/byok/keyStore";
import { PROVIDERS, type ProviderId } from "../../lib/byok/providerConfig";
import { useJuryStore } from "../../lib/state/juryStore";
import { TOOL_RESULT_COMPONENTS as staticToolUiDashboardComponents } from "static-tool-ui-dashboard/components/ToolResultRenderer";
import { McpResultCard } from "static-mcp-tool-cards/components/McpResultCards";

const MCP_TOOL_CARD_COMPONENTS: Record<string, ComponentType<any>> = {
  list_issues: (props: Record<string, unknown>) => <McpResultCard output={props as { kind: string }} />,
  get_deployment_status: (props: Record<string, unknown>) => <McpResultCard output={props as { kind: string }} />,
};

const TOOL_COMPONENTS_BY_TEMPLATE: Record<string, Record<string, ComponentType<any>>> = {
  "static-tool-ui-dashboard": staticToolUiDashboardComponents,
  "static-mcp-tool-cards": MCP_TOOL_CARD_COMPONENTS,
};

export function TemplatePlayer({ manifest }: { manifest: TemplateManifest }) {
  const [provider, setProvider] = useState<ProviderId>(manifest.providerRequirements[0] as ProviderId);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [juryStatus, setJuryStatus] = useState<"idle" | "running" | "error">("idle");
  const [juryError, setJuryError] = useState<string | undefined>();
  const addRun = useJuryStore((s) => s.addRun);
  const router = useRouter();

  useEffect(() => {
    loadApiKey(provider).then(setApiKey);
  }, [provider]);

  async function runJuryNow() {
    setJuryStatus("running");
    setJuryError(undefined);
    try {
      const res = await fetch("/api/jury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: manifest.id, prompt: manifest.previewPrompts[0] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJuryStatus("error");
        setJuryError(data.error ?? "Jury run failed.");
        return;
      }
      const result = data as JuryRunResult;
      addRun(result);
      setJuryStatus("idle");
      router.push(`/jury/${result.runId}`);
    } catch {
      setJuryStatus("error");
      setJuryError("Couldn't reach the Jury endpoint.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "var(--kiln-space-8)", alignItems: "start" }}>
      <div>
        <header style={{ marginBottom: "var(--kiln-space-6)" }}>
          <h1 style={{ fontSize: "1.75rem" }}>{manifest.name}</h1>
          <p style={{ color: "var(--kiln-text-secondary)" }}>{manifest.description}</p>
        </header>
        <ChatPane
          templateId={manifest.id}
          strategy={manifest.strategy}
          provider={provider}
          model={PROVIDERS[provider].models[0]!}
          apiKey={apiKey}
          previewPrompts={manifest.previewPrompts}
          toolComponents={TOOL_COMPONENTS_BY_TEMPLATE[manifest.id]}
        />
      </div>

      <Card>
        <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>Provider</h3>
        <ProviderPicker value={provider} onChange={setProvider} />
        {!manifest.providerRequirements.includes(provider) && (
          <p style={{ fontSize: "0.75rem", color: "var(--kiln-text-tertiary)", marginTop: "var(--kiln-space-3)" }}>
            This template was authored against {manifest.providerRequirements.join(", ")}; other providers may
            behave slightly differently.
          </p>
        )}
        {!apiKey && (
          <p style={{ fontSize: "0.75rem", color: "var(--kiln-warning-500)", marginTop: "var(--kiln-space-3)" }}>
            No {PROVIDERS[provider].label} key saved yet — add one in Settings.
          </p>
        )}
      </Card>

      <Card style={{ gridColumn: 2 }}>
        <h3 style={{ margin: "0 0 var(--kiln-space-2)" }}>Jury</h3>
        <p style={{ fontSize: "0.8125rem", color: "var(--kiln-text-secondary)", margin: "0 0 var(--kiln-space-4)" }}>
          Scores this template on accessibility, token adherence, structural validity, safety, and latency using its
          first preview prompt.
        </p>
        <Button size="sm" variant="secondary" loading={juryStatus === "running"} onClick={runJuryNow} style={{ width: "100%" }}>
          Run Jury
        </Button>
        {juryStatus === "error" && (
          <p role="alert" style={{ fontSize: "0.75rem", color: "var(--kiln-error-500)", marginTop: "var(--kiln-space-3)" }}>
            {juryError}
          </p>
        )}
      </Card>
    </div>
  );
}
