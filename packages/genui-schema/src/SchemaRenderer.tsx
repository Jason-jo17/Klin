import { Button, Card } from "@kiln/ui";
import type { UiNode } from "./uiNode";

/**
 * Walks a UiNode tree and maps each `type` to a @kiln/ui primitive. Never
 * uses dangerouslySetInnerHTML, never evals, never accepts a `type` outside
 * the fixed enum in uiNode.ts — unknown types render UnknownBlockFallback
 * so a schema-validation failure is always loud in the demo, not swallowed.
 */
export function SchemaRenderer({ node }: { node: UiNode }) {
  const props = node.props ?? {};
  const children = node.children ?? [];

  switch (node.type) {
    case "stack":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-4)" }}>
          {children.map((child, i) => (
            <SchemaRenderer key={i} node={child} />
          ))}
        </div>
      );

    case "card":
      return (
        <Card>
          {typeof props.title === "string" && (
            <h3 style={{ marginBottom: "var(--kiln-space-3)" }}>{props.title}</h3>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-3)" }}>
            {children.map((child, i) => (
              <SchemaRenderer key={i} node={child} />
            ))}
          </div>
        </Card>
      );

    case "field":
      return <FieldNode props={props} />;

    case "button":
      return (
        <Button variant={(props.variant as "primary" | "secondary" | "ghost" | "danger") ?? "primary"}>
          {typeof props.label === "string" ? props.label : "Button"}
        </Button>
      );

    case "text":
      return <p style={{ margin: 0, color: "var(--kiln-text-secondary)" }}>{String(props.content ?? "")}</p>;

    default:
      return <UnknownBlockFallback type={(node as { type: string }).type} />;
  }
}

function FieldNode({ props }: { props: Record<string, unknown> }) {
  const label = typeof props.label === "string" ? props.label : "Untitled field";
  const fieldType = typeof props.fieldType === "string" ? props.fieldType : "text";

  return (
    <div className="kiln-field">
      <label className="kiln-field__label">{label}</label>
      {fieldType === "select" && Array.isArray(props.options) ? (
        <select className="kiln-input kiln-focus-ring">
          {(props.options as string[]).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : fieldType === "checkbox" ? (
        <input type="checkbox" className="kiln-focus-ring" />
      ) : (
        <input
          className="kiln-input kiln-focus-ring"
          type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
        />
      )}
    </div>
  );
}

export function UnknownBlockFallback({ type }: { type: string }) {
  return (
    <div
      role="alert"
      style={{
        border: `1px dashed var(--kiln-error-500)`,
        borderRadius: "var(--kiln-radius-md)",
        padding: "var(--kiln-space-4)",
        color: "var(--kiln-error-500)",
        fontSize: "0.8125rem",
      }}
    >
      Unknown block type: <code>{type}</code> — this node was not rendered because it doesn't match the
      declarative UI schema.
    </div>
  );
}
