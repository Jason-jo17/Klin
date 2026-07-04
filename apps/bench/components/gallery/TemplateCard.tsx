import Link from "next/link";
import { Card } from "@kiln/ui";
import { STRATEGY_META, type TemplateManifest } from "@kiln/schema";

const TRADEOFF_LABELS = ["safety", "flexibility", "latency", "setupComplexity"] as const;
const TRADEOFF_SHORT_LABELS: Record<(typeof TRADEOFF_LABELS)[number], string> = {
  safety: "Safety",
  flexibility: "Flex",
  latency: "Latency",
  setupComplexity: "Setup",
};

export function TemplateCard({ template }: { template: TemplateManifest }) {
  return (
    <Card>
      <Link href={`/play/${template.id}`} className="kiln-focus-ring" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--kiln-primary-400)",
            marginBottom: "var(--kiln-space-2)",
          }}
        >
          {STRATEGY_META[template.strategy].label}
        </span>
        <h3 style={{ margin: "0 0 var(--kiln-space-2)" }}>{template.name}</h3>
        <p style={{ margin: "0 0 var(--kiln-space-4)", color: "var(--kiln-text-secondary)", fontSize: "0.8125rem" }}>
          {template.description}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-1)" }}>
          {TRADEOFF_LABELS.map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-2)" }}>
              <span style={{ width: "3.5rem", fontSize: "0.6875rem", color: "var(--kiln-text-tertiary)" }}>
                {TRADEOFF_SHORT_LABELS[key]}
              </span>
              <div style={{ flex: 1, height: 4, background: "var(--kiln-surface-3)", borderRadius: 2 }}>
                <div
                  style={{
                    width: `${(template.tradeoffs[key] / 5) * 100}%`,
                    height: "100%",
                    background: "var(--kiln-primary-500)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Link>
    </Card>
  );
}
