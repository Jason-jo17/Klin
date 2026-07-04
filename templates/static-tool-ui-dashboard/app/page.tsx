"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button, Input } from "@kiln/ui";
import { ToolResultRenderer } from "../components/ToolResultRenderer";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic", model: "claude-sonnet-5" },
  { id: "openai", label: "OpenAI", model: "gpt-5" },
  { id: "google", label: "Google", model: "gemini-2.5-pro" },
];

const PREVIEW_PROMPTS = [
  "Show quarterly revenue by region.",
  "Compare this month's signups to last month's.",
  "Give me the top 5 accounts by ARR as a table.",
];

export default function Page() {
  const [provider, setProvider] = useState(PROVIDERS[0]!.id);
  const [input, setInput] = useState("");
  const model = PROVIDERS.find((p) => p.id === provider)!.model;

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/generate",
      body: { provider, model },
    }),
  });

  const isGenerating = status === "streaming" || status === "submitted";

  function submit(text: string) {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "var(--kiln-space-8)" }}>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Static GenUI — Tool-UI Dashboard</h1>
        <p style={{ color: "var(--kiln-text-secondary)" }}>
          The model can only put pixels on screen by calling one of four fixed tools — see{" "}
          <code>components/ToolResultRenderer.tsx</code>.
        </p>
        <select
          aria-label="Provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="kiln-input kiln-focus-ring"
          style={{ marginTop: "var(--kiln-space-4)", width: "auto" }}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </header>

      <div
        data-testid="genui-canvas"
        data-status={isGenerating ? "generating" : messages.length > 0 ? "done" : "idle"}
        className={isGenerating ? "kiln-ember-border" : undefined}
        style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-4)", minHeight: 240, padding: "var(--kiln-space-2)" }}
      >
        {messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p key={i} style={{ color: "var(--kiln-text-secondary)" }}>
                    {part.text}
                  </p>
                );
              }
              if (
                part.type.startsWith("tool-") &&
                "state" in part &&
                (part.state === "input-available" || part.state === "output-available")
              ) {
                // These tools have no `execute` — the call never reaches
                // "output-available", so "input-available" (args fully
                // streamed in) is the render trigger here.
                const toolName = part.type.replace(/^tool-/, "");
                return <ToolResultRenderer key={i} toolName={toolName} args={(part as { input: Record<string, unknown> }).input} />;
              }
              return null;
            })}
          </div>
        ))}
        {messages.length === 0 && !isGenerating && (
          <div style={{ display: "flex", gap: "var(--kiln-space-2)", flexWrap: "wrap" }}>
            {PREVIEW_PROMPTS.map((p) => (
              <Button key={p} variant="secondary" size="sm" onClick={() => submit(p)}>
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--kiln-error-500)", fontSize: "0.875rem", marginTop: "var(--kiln-space-4)" }}>
          {error.message}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        style={{ display: "flex", gap: "var(--kiln-space-3)", marginTop: "var(--kiln-space-6)" }}
      >
        <div style={{ flex: 1 }}>
          <Input
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a visualization…"
            aria-label="Message"
          />
        </div>
        <Button type="submit" data-testid="chat-send" loading={isGenerating}>
          Send
        </Button>
      </form>
    </main>
  );
}
