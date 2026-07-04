export interface RunLogEntry {
  label: string;
  status: "ok" | "retry" | "error";
}

export function RunLog({ entries }: { entries: RunLogEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div data-testid="run-timeline" style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-1)", marginTop: "var(--kiln-space-4)" }}>
      {entries.map((entry, i) => (
        <p
          key={i}
          data-status={entry.status}
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: entry.status === "error" ? "var(--kiln-error-500)" : entry.status === "retry" ? "var(--kiln-warning-500)" : "var(--kiln-text-tertiary)",
          }}
        >
          {entry.label}
        </p>
      ))}
    </div>
  );
}
