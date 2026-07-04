"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button, Input } from "@kiln/ui";
import type { Strategy, UiNode } from "@kiln/schema";
import type { ProviderId } from "../../lib/byok/providerConfig";
import { GenUICanvas, type CanvasStatus } from "./GenUICanvas";
import { RunTimeline, type RunEvent } from "./RunTimeline";

export interface ChatPaneProps {
  templateId: string;
  strategy: Strategy;
  provider: ProviderId;
  model: string;
  apiKey: string | null;
  previewPrompts: string[];
  /** static-strategy templates only: tool name -> pre-built component. */
  toolComponents?: Record<string, ComponentType<any>>;
  /** Bumping `nonce` submits `text` programmatically — used by /compare to run the same prompt across panes. */
  externalPrompt?: { text: string; nonce: number };
}

function nowEvent(label: string, status: RunEvent["status"]): RunEvent {
  return { id: crypto.randomUUID(), label, status, timestamp: Date.now() };
}

/**
 * Owns the generation flow for whichever strategy the active template
 * implements, then hands the result to GenUICanvas (pure renderer) and
 * RunTimeline (pure event log) — see build.md §7.
 */
export function ChatPane({ templateId, strategy, provider, model, apiKey, previewPrompts, toolComponents, externalPrompt }: ChatPaneProps) {
  const [input, setInput] = useState("");
  const [events, setEvents] = useState<RunEvent[]>([]);

  // --- static / declarative-mcp-ui-resource style multi-turn tool chat ---
  const chat = useChat({
    transport: new DefaultChatTransport({ api: `/api/templates/${templateId}`, body: { provider, apiKey, model } }),
  });
  const chatBusy = chat.status === "streaming" || chat.status === "submitted";
  const chatFailed = chat.status === "error";

  // --- declarative / open-ended single-shot JSON fetch ---
  const [singleShotStatus, setSingleShotStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [uiTree, setUiTree] = useState<UiNode | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const isSingleShot = strategy === "declarative" && templateId !== "declarative-mcp-ui-resource";
  const isOpenEnded = strategy === "open-ended";
  const usesSingleShot = isSingleShot || isOpenEnded;

  async function submitSingleShot(text: string) {
    setSingleShotStatus("generating");
    setEvents([nowEvent(`Requesting output for: "${text}"`, "pending")]);
    setUiTree(null);
    setHtml(null);
    setErrorMessage(undefined);

    const res = await fetch(`/api/templates/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey, model, prompt: text }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setSingleShotStatus("error");
      setErrorMessage(data.error ?? "Generation failed.");
      setEvents((e) => [...e, nowEvent(data.error ?? "Generation failed.", "error")]);
      return;
    }

    if (data.retried) setEvents((e) => [...e, nowEvent("First response failed schema validation — retried once.", "pending")]);

    if (isOpenEnded) setHtml(data.html);
    else setUiTree(data.uiTree);

    setSingleShotStatus("done");
    setEvents((e) => [...e, nowEvent("Generation complete.", "ok")]);
  }

  function submit(text: string) {
    if (!text.trim()) return;
    if (usesSingleShot) {
      submitSingleShot(text);
    } else {
      setEvents((e) => [...e, nowEvent(`Sent: "${text}"`, "ok")]);
      chat.sendMessage({ text });
    }
    setInput("");
  }

  useEffect(() => {
    // Intentional: /compare bumps `nonce` to trigger this pane's submit from
    // outside — not state derived from props, an explicit external command.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalPrompt && externalPrompt.nonce > 0) submit(externalPrompt.text);
    // Deliberately keyed only on the nonce — `submit` is redefined every
    // render and `externalPrompt` as a whole shouldn't re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt?.nonce]);

  useEffect(() => {
    // useChat surfaces provider/network failures via chat.error rather than
    // a thrown exception — without this, a bad key on a static/MCP template
    // failed silently (build.md-audit gap: "chat.error never read").
    if (!chat.error) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents((e) => [...e, nowEvent(chat.error?.message ?? "Generation failed.", "error")]);
  }, [chat.error]);

  const status: CanvasStatus = usesSingleShot
    ? singleShotStatus
    : chatFailed
      ? "error"
      : chatBusy
        ? "generating"
        : chat.messages.length > 0
          ? "done"
          : "idle";

  // Tools without an `execute` (e.g. static-tool-ui-dashboard's) never reach
  // "output-available" — the call's args at "input-available" are already
  // everything the renderer needs. Tools with `execute` (MCP-backed ones)
  // only have real content once "output-available" fires; prefer output
  // when present, fall back to input otherwise.
  const toolCalls =
    !usesSingleShot && chat.messages.length > 0
      ? chat.messages
          .flatMap((m) => m.parts)
          .filter(
            (p): p is typeof p & { state: string; input: Record<string, unknown>; output?: Record<string, unknown> } =>
              p.type.startsWith("tool-") && "state" in p && (p.state === "input-available" || p.state === "output-available"),
          )
          .map((p) => ({ toolName: p.type.replace(/^tool-/, ""), args: p.output ?? p.input }))
      : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-6)" }}>
      <GenUICanvas
        strategy={strategy}
        status={status}
        toolCalls={toolCalls}
        toolComponents={toolComponents}
        uiTree={uiTree ?? undefined}
        html={html ?? undefined}
        errorMessage={errorMessage ?? chat.error?.message}
      />

      {status === "idle" && (
        <div style={{ display: "flex", gap: "var(--kiln-space-2)", flexWrap: "wrap" }}>
          {previewPrompts.map((p) => (
            <Button key={p} variant="secondary" size="sm" onClick={() => submit(p)}>
              {p}
            </Button>
          ))}
        </div>
      )}

      <RunTimeline events={events} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        style={{ display: "flex", gap: "var(--kiln-space-3)" }}
      >
        <div style={{ flex: 1 }}>
          <Input
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try a prompt…"
            aria-label="Message"
          />
        </div>
        <Button type="submit" data-testid="chat-send" loading={status === "generating"}>
          Send
        </Button>
      </form>
      {!apiKey && (
        <p style={{ fontSize: "0.75rem", color: "var(--kiln-text-tertiary)", margin: 0 }}>
          No {provider} key saved in this browser — add one in Settings, or this will only work if the server
          hosting the Bench has a matching env var configured.
        </p>
      )}
    </div>
  );
}
