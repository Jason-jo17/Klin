"use client";

import { useState } from "react";
import { Button, Input } from "@kiln/ui";
import { SandboxedArtifact } from "../components/SandboxedArtifact";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic", model: "claude-sonnet-5" },
  { id: "openai", label: "OpenAI", model: "gpt-5" },
  { id: "google", label: "Google", model: "gemini-2.5-pro" },
];

const PREVIEW_PROMPTS = ["Build a simple pomodoro timer.", "Build a color palette generator.", "Build a tip calculator."];

export default function Page() {
  const [provider, setProvider] = useState(PROVIDERS[0]!.id);
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const model = PROVIDERS.find((p) => p.id === provider)!.model;

  async function submit(text: string) {
    if (!text.trim()) return;
    setStatus("generating");
    setHtml(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, prompt: text }),
    });
    const data = await res.json();
    setHtml(data.html ?? null);
    setStatus("done");
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "var(--kiln-space-8)" }}>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Open-Ended GenUI — Sandboxed Artifact</h1>
        <p style={{ color: "var(--kiln-text-secondary)" }}>
          The model writes complete, free-form HTML, rendered in an <code>&lt;iframe sandbox&gt;</code> with{" "}
          <code>allow-scripts</code> but deliberately <strong>without</strong> <code>allow-same-origin</code> — see{" "}
          <code>@kiln/sandbox</code>.
        </p>
        <select aria-label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} className="kiln-input kiln-focus-ring" style={{ marginTop: "var(--kiln-space-4)", width: "auto" }}>
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </header>

      <div
        data-testid="genui-canvas"
        data-status={status === "generating" ? "generating" : status === "done" ? "done" : "idle"}
        className={status === "generating" ? "kiln-ember-border" : undefined}
        style={{ minHeight: 420, padding: "var(--kiln-space-2)" }}
      >
        {html && (
          <div style={{ height: 480 }}>
            <SandboxedArtifact html={html} title="Generated artifact" />
          </div>
        )}
        {!html && status !== "generating" && (
          <div style={{ display: "flex", gap: "var(--kiln-space-2)", flexWrap: "wrap" }}>
            {PREVIEW_PROMPTS.map((p) => (
              <Button key={p} variant="secondary" size="sm" onClick={() => submit(p)}>{p}</Button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(prompt); }} style={{ display: "flex", gap: "var(--kiln-space-3)", marginTop: "var(--kiln-space-6)" }}>
        <div style={{ flex: 1 }}>
          <Input data-testid="chat-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe what to build…" aria-label="Prompt" />
        </div>
        <Button type="submit" data-testid="chat-send" loading={status === "generating"}>Generate</Button>
      </form>
    </main>
  );
}
