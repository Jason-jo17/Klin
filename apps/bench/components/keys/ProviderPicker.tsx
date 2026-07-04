import { PROVIDER_LIST, type ProviderId } from "../../lib/byok/providerConfig";

export function ProviderPicker({ value, onChange }: { value: ProviderId; onChange: (id: ProviderId) => void }) {
  return (
    <div role="radiogroup" aria-label="Provider" style={{ display: "flex", gap: "var(--kiln-space-2)" }}>
      {PROVIDER_LIST.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={value === p.id}
          onClick={() => onChange(p.id)}
          className="kiln-focus-ring"
          style={{
            padding: "var(--kiln-space-2) var(--kiln-space-4)",
            borderRadius: "var(--kiln-radius-md)",
            border: `1px solid ${value === p.id ? "var(--kiln-primary-400)" : "var(--kiln-border)"}`,
            background: value === p.id ? "var(--kiln-surface-2)" : "transparent",
            color: "var(--kiln-text-primary)",
            cursor: "pointer",
            fontSize: "0.8125rem",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
