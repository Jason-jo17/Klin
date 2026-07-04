import type { ComponentType } from "react";
import { Card } from "@kiln/ui";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
}

function MetricCard({ label, value, trend, trendLabel }: MetricCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "var(--kiln-success-500)" : trend === "down" ? "var(--kiln-error-500)" : "var(--kiln-text-tertiary)";
  return (
    <Card>
      <p style={{ margin: 0, color: "var(--kiln-text-secondary)", fontSize: "0.8125rem" }}>{label}</p>
      <p style={{ margin: "var(--kiln-space-2) 0 0", fontSize: "2rem", fontFamily: "var(--kiln-font-display)" }}>{value}</p>
      {trend && (
        <p style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-1)", color: trendColor, fontSize: "0.8125rem", margin: "var(--kiln-space-2) 0 0" }}>
          <TrendIcon size={14} aria-hidden="true" />
          {trendLabel ?? trend}
        </p>
      )}
    </Card>
  );
}

interface BarChartProps {
  title: string;
  bars: { label: string; value: number }[];
}

function BarChart({ title, bars }: BarChartProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <Card>
      <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-3)" }} role="img" aria-label={title}>
        {bars.map((bar) => (
          <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-3)" }}>
            <span style={{ width: "8rem", fontSize: "0.8125rem", color: "var(--kiln-text-secondary)" }}>{bar.label}</span>
            <div style={{ flex: 1, background: "var(--kiln-surface-2)", borderRadius: "var(--kiln-radius-sm)", height: "0.75rem" }}>
              <div
                style={{
                  width: `${(bar.value / max) * 100}%`,
                  background: "var(--kiln-primary-500)",
                  height: "100%",
                  borderRadius: "var(--kiln-radius-sm)",
                }}
              />
            </div>
            <span style={{ width: "3rem", textAlign: "right", fontSize: "0.8125rem" }}>{bar.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface DataTableProps {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

function DataTable({ title, columns, rows }: DataTableProps) {
  return (
    <Card>
      <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ textAlign: "left", padding: "var(--kiln-space-2)", borderBottom: "1px solid var(--kiln-border)", color: "var(--kiln-text-secondary)", fontSize: "0.8125rem" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "var(--kiln-space-2)", borderBottom: "1px solid var(--kiln-border)" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface ComparisonGridProps {
  title: string;
  items: { name: string; metrics: Record<string, string | number> }[];
}

function ComparisonGrid({ title, items }: ComparisonGridProps) {
  const metricKeys = Array.from(new Set(items.flatMap((i) => Object.keys(i.metrics))));
  return (
    <Card>
      <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: "var(--kiln-space-4)" }}>
        {items.map((item) => (
          <div key={item.name} style={{ border: "1px solid var(--kiln-border)", borderRadius: "var(--kiln-radius-md)", padding: "var(--kiln-space-4)" }}>
            <p style={{ margin: "0 0 var(--kiln-space-3)", fontWeight: 600 }}>{item.name}</p>
            {metricKeys.map((key) => (
              <p key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", margin: "var(--kiln-space-1) 0" }}>
                <span style={{ color: "var(--kiln-text-tertiary)" }}>{key}</span>
                <span>{item.metrics[key] ?? "—"}</span>
              </p>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * The concrete demonstration of "Static GenUI": a fixed map from tool name
 * to a pre-built component. The AI SDK's tool() calls are the only way a
 * component gets on screen here — there is no code path where model output
 * becomes markup directly.
 */
export const TOOL_RESULT_COMPONENTS: Record<string, ComponentType<any>> = {
  render_metric_card: MetricCard,
  render_bar_chart: BarChart,
  render_data_table: DataTable,
  render_comparison_grid: ComparisonGrid,
};

export function ToolResultRenderer({ toolName, args }: { toolName: string; args: Record<string, unknown> }) {
  const Component = TOOL_RESULT_COMPONENTS[toolName];
  if (!Component) {
    return (
      <div role="alert" style={{ color: "var(--kiln-error-500)", fontSize: "0.8125rem" }}>
        No renderer registered for tool &quot;{toolName}&quot;.
      </div>
    );
  }
  return <Component {...args} />;
}
