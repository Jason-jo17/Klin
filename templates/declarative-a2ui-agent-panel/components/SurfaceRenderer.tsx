import { Card } from "@kiln/ui";
import { CircleCheck, CircleDashed, CircleX, Loader2 } from "lucide-react";
import type { SurfaceNode } from "../lib/surfaceSchema";

const STATUS_ICON = { ok: CircleCheck, pending: CircleDashed, error: CircleX, running: Loader2 } as const;
const STATUS_COLOR = {
  ok: "var(--kiln-success-500)",
  pending: "var(--kiln-text-tertiary)",
  error: "var(--kiln-error-500)",
  running: "var(--kiln-ember-500)",
} as const;

export function SurfaceRenderer({ node }: { node: SurfaceNode }) {
  const props = node.props ?? {};
  const children = node.children ?? [];

  switch (node.type) {
    case "panel":
      return (
        <Card>
          {typeof props.title === "string" && <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>{props.title}</h3>}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-3)" }}>
            {children.map((child, i) => (
              <SurfaceRenderer key={i} node={child} />
            ))}
          </div>
        </Card>
      );

    case "status": {
      const state = (props.state as keyof typeof STATUS_ICON) ?? "pending";
      const Icon = STATUS_ICON[state] ?? CircleDashed;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-2)" }}>
          <Icon size={16} color={STATUS_COLOR[state]} aria-hidden="true" />
          <span>{typeof props.label === "string" ? props.label : "Status"}</span>
        </div>
      );
    }

    case "metric":
      return (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--kiln-text-tertiary)" }}>{String(props.label ?? "")}</span>
          <span>{String(props.value ?? "")}</span>
        </div>
      );

    case "timeline":
      return (
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--kiln-space-2)" }}>
          {(Array.isArray(props.events) ? (props.events as string[]) : []).map((event, i) => (
            <li key={i} style={{ fontSize: "0.8125rem", color: "var(--kiln-text-secondary)", paddingLeft: "var(--kiln-space-4)", borderLeft: "2px solid var(--kiln-border)" }}>
              {event}
            </li>
          ))}
        </ol>
      );

    case "action":
      return (
        <button className="kiln-button kiln-button--secondary kiln-button--sm kiln-focus-ring" type="button">
          {typeof props.label === "string" ? props.label : "Action"}
        </button>
      );

    default:
      return (
        <div role="alert" style={{ color: "var(--kiln-error-500)", fontSize: "0.8125rem" }}>
          Unknown surface node type: <code>{(node as { type: string }).type}</code>
        </div>
      );
  }
}
