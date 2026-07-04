import { CircleCheck, CircleX, CircleDashed, Loader2, KeyRound } from "lucide-react";

export type KeyStatus = "unverified" | "saved" | "checking" | "valid" | "invalid";

const CONFIG: Record<KeyStatus, { label: string; color: string; Icon: typeof CircleCheck }> = {
  unverified: { label: "No key saved", color: "var(--kiln-text-tertiary)", Icon: CircleDashed },
  // A key loaded from IndexedDB on mount — it was valid in some past
  // session, but that result isn't remembered, so this isn't the same
  // claim as "valid" (which means "checked just now").
  saved: { label: "Saved, not re-checked this session", color: "var(--kiln-text-tertiary)", Icon: KeyRound },
  checking: { label: "Checking…", color: "var(--kiln-info-500)", Icon: Loader2 },
  valid: { label: "Valid", color: "var(--kiln-success-500)", Icon: CircleCheck },
  invalid: { label: "Invalid", color: "var(--kiln-error-500)", Icon: CircleX },
};

export function KeyStatusBadge({ status }: { status: KeyStatus }) {
  const { label, color, Icon } = CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--kiln-space-1)", color, fontSize: "0.75rem" }}>
      <Icon size={13} aria-hidden="true" className={status === "checking" ? "kiln-button__spinner" : undefined} />
      {label}
    </span>
  );
}
