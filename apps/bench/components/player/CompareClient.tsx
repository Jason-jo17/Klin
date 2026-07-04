"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { TemplateManifest } from "@kiln/schema";
import { Button, Card, Input } from "@kiln/ui";
import { ChatPane } from "./ChatPane";
import { loadApiKey } from "../../lib/byok/keyStore";
import { PROVIDERS, type ProviderId } from "../../lib/byok/providerConfig";
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

const MAX_COMPARE = 3;

export function CompareClient({ templates }: { templates: TemplateManifest[] }) {
  const [selected, setSelected] = useState<string[]>(templates.slice(0, 2).map((t) => t.id));
  const [prompt, setPrompt] = useState("");
  const [sharedPrompt, setSharedPrompt] = useState({ text: "", nonce: 0 });
  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string | null>>({ anthropic: null, openai: null, google: null });

  useEffect(() => {
    (Object.keys(PROVIDERS) as ProviderId[]).forEach((p) => {
      loadApiKey(p).then((key) => setApiKeys((prev) => ({ ...prev, [p]: key })));
    });
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function runAll() {
    if (!prompt.trim()) return;
    setSharedPrompt({ text: prompt, nonce: sharedPrompt.nonce + 1 });
  }

  const selectedManifests = templates.filter((t) => selected.includes(t.id));

  return (
    <div>
      <header style={{ marginBottom: "var(--kiln-space-6)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Compare</h1>
        <p style={{ color: "var(--kiln-text-secondary)" }}>
          Pick up to {MAX_COMPARE} templates and run the same prompt across every one of them at once.
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--kiln-space-2)", flexWrap: "wrap", marginBottom: "var(--kiln-space-4)" }}>
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className="kiln-focus-ring"
            aria-pressed={selected.includes(t.id) ? "true" : "false"}
            style={{
              padding: "var(--kiln-space-2) var(--kiln-space-3)",
              borderRadius: "var(--kiln-radius-md)",
              border: `1px solid ${selected.includes(t.id) ? "var(--kiln-primary-400)" : "var(--kiln-border)"}`,
              background: selected.includes(t.id) ? "var(--kiln-surface-2)" : "transparent",
              color: "var(--kiln-text-primary)",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runAll();
        }}
        style={{ display: "flex", gap: "var(--kiln-space-3)", marginBottom: "var(--kiln-space-8)" }}
      >
        <div style={{ flex: 1 }}>
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="One prompt, run everywhere…" aria-label="Shared prompt" />
        </div>
        <Button type="submit">Run all</Button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedManifests.length || 1}, 1fr)`, gap: "var(--kiln-space-6)" }}>
        {selectedManifests.map((manifest) => {
          const provider = manifest.providerRequirements[0] as ProviderId;
          return (
            <Card key={manifest.id}>
              <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>{manifest.name}</h3>
              <ChatPane
                templateId={manifest.id}
                strategy={manifest.strategy}
                provider={provider}
                model={PROVIDERS[provider].models[0]!}
                apiKey={apiKeys[provider]}
                previewPrompts={manifest.previewPrompts}
                toolComponents={TOOL_COMPONENTS_BY_TEMPLATE[manifest.id]}
                externalPrompt={sharedPrompt}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
