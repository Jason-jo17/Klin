import { CircleCheck, CircleX, Loader2 } from "lucide-react";

export interface RunEvent {
  id: string;
  label: string;
  status: "pending" | "ok" | "error";
  timestamp: number;
}

const ICON = { pending: Loader2, ok: CircleCheck, error: CircleX } as const;
const COLOR = { pending: "var(--kiln-text-tertiary)", ok: "var(--kiln-success-500)", error: "var(--kiln-error-500)" } as const;

/** Streaming event log: tool calls, schema emits, artifact writes. */
export function RunTimeline({ events }: { events: RunEvent[] }) {
  if (events.length === 0) return null;

  return (
    <ol data-testid="run-timeline" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--kiln-space-2)" }}>
      {events.map((event) => {
        const Icon = ICON[event.status];
        return (
          <li key={event.id} data-status={event.status} style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-2)", fontSize: "0.8125rem" }}>
            <Icon size={13} color={COLOR[event.status]} aria-hidden="true" className={event.status === "pending" ? "kiln-button__spinner" : undefined} />
            <span style={{ color: "var(--kiln-text-secondary)" }}>{event.label}</span>
            <span style={{ marginLeft: "auto", color: "var(--kiln-text-tertiary)", fontSize: "0.6875rem" }}>
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
