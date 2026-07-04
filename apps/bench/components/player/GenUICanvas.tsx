import type { ComponentType } from "react";
import { SchemaRenderer, UnknownBlockFallback, type UiNode, type Strategy } from "@kiln/schema";
import { SandboxedArtifact } from "@kiln/sandbox";

export type CanvasStatus = "idle" | "generating" | "done" | "error";

export interface GenUICanvasProps {
  strategy: Strategy;
  status: CanvasStatus;
  /** static */
  toolCalls?: { toolName: string; args: Record<string, unknown> }[];
  toolComponents?: Record<string, ComponentType<any>>;
  /** declarative */
  uiTree?: UiNode;
  /** open-ended */
  html?: string;
  errorMessage?: string;
}

/**
 * The polymorphic renderer at the center of the whole Bench: the strategy
 * switch happens exactly once, here — no strategy-specific logic leaks into
 * sibling components (build.md §7). Shows the ember-sweep border while
 * generating; every other visual state stays quiet.
 */
export function GenUICanvas({ strategy, status, toolCalls, toolComponents, uiTree, html, errorMessage }: GenUICanvasProps) {
  return (
    <div
      data-testid="genui-canvas"
      data-status={status}
      className={status === "generating" ? "kiln-ember-border" : undefined}
      style={{ minHeight: 240, padding: "var(--kiln-space-2)" }}
    >
      {status === "error" && (
        <div role="alert" style={{ color: "var(--kiln-error-500)", fontSize: "0.875rem" }}>
          {errorMessage ?? "Generation failed."}
        </div>
      )}

      {status === "done" && strategy === "static" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-4)" }}>
          {(toolCalls ?? []).map((call, i) => {
            const Component = toolComponents?.[call.toolName];
            return Component ? (
              <Component key={i} {...call.args} />
            ) : (
              <UnknownBlockFallback key={i} type={call.toolName} />
            );
          })}
        </div>
      )}

      {status === "done" && strategy === "declarative" && uiTree && <SchemaRenderer node={uiTree} />}

      {status === "done" && strategy === "open-ended" && html && (
        <div style={{ height: 480 }}>
          <SandboxedArtifact html={html} title="Generated artifact" />
        </div>
      )}
    </div>
  );
}
