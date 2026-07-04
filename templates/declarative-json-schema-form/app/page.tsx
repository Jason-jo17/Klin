"use client";

import { useState } from "react";
import { Button, Input } from "@kiln/ui";
import { SchemaRenderer, type UiNode } from "@kiln/schema";
import { RunLog, type RunLogEntry } from "../components/RunLog";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic", model: "claude-sonnet-5" },
  { id: "openai", label: "OpenAI", model: "gpt-5" },
  { id: "google", label: "Google", model: "gemini-2.5-pro" },
];

const PREVIEW_PROMPTS = [
  "Build a form to collect a customer's shipping address.",
  "Build a signup form with name, email, and a plan selector.",
  "Build a feedback form with a rating field and a comments field.",
];

export default function Page() {
  const [provider, setProvider] = useState(PROVIDERS[0]!.id);
  const [prompt, setPrompt] = useState("");
  const [uiTree, setUiTree] = useState<UiNode | null>(null);
  const [log, setLog] = useState<RunLogEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const model = PROVIDERS.find((p) => p.id === provider)!.model;

  async function submit(text: string) {
    if (!text.trim()) return;
    setStatus("generating");
    setLog([{ label: `Requesting UI for: "${text}"`, status: "ok" }]);
    setUiTree(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, prompt: text }),
    });
    const data = await res.json();

    if (data.retried) {
      setLog((l) => [...l, { label: "First response failed schema validation — retried once.", status: "retry" }]);
    }
    if (data.failed) {
      setLog((l) => [...l, { label: data.error ?? "Generation failed after retry.", status: "error" }]);
    } else {
      setLog((l) => [...l, { label: "Schema-valid JSON received.", status: "ok" }]);
      setUiTree(data.uiTree);
    }
    setStatus("done");
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--kiln-space-8)" }}>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Declarative GenUI — JSON Schema Form</h1>
        <p style={{ color: "var(--kiln-text-secondary)" }}>
          The model emits a JSON UI tree, validated against a fixed Zod schema and rendered by{" "}
          <code>@kiln/schema</code>&apos;s <code>SchemaRenderer</code>. Invalid output gets one retry, then a
          visible error — never a silent drop.
        </p>
        <select aria-label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} className="kiln-input kiln-focus-ring" style={{ marginTop: "var(--kiln-space-4)", width: "auto" }}>
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </header>

      <div
        data-testid="genui-canvas"
        data-status={status === "generating" ? "generating" : "done"}
        className={status === "generating" ? "kiln-ember-border" : undefined}
        style={{ minHeight: 240, padding: "var(--kiln-space-2)" }}
      >
        {uiTree && <SchemaRenderer node={uiTree} />}
        {!uiTree && status !== "generating" && (
          <div style={{ display: "flex", gap: "var(--kiln-space-2)", flexWrap: "wrap" }}>
            {PREVIEW_PROMPTS.map((p) => (
              <Button key={p} variant="secondary" size="sm" onClick={() => submit(p)}>{p}</Button>
            ))}
          </div>
        )}
      </div>

      <RunLog entries={log} />

      <form onSubmit={(e) => { e.preventDefault(); submit(prompt); }} style={{ display: "flex", gap: "var(--kiln-space-3)", marginTop: "var(--kiln-space-6)" }}>
        <div style={{ flex: 1 }}>
          <Input data-testid="chat-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the form you need…" aria-label="Prompt" />
        </div>
        <Button type="submit" data-testid="chat-send" loading={status === "generating"}>Generate</Button>
      </form>
    </main>
  );
}
