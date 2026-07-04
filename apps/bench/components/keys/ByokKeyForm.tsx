"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@kiln/ui";
import { saveApiKey, loadApiKey } from "../../lib/byok/keyStore";
import { PROVIDERS, type ProviderId } from "../../lib/byok/providerConfig";
import { KeyStatusBadge, type KeyStatus } from "./KeyStatusBadge";

export interface ByokKeyFormProps {
  provider: ProviderId;
  onSaved: () => void;
}

async function testConnection(provider: ProviderId, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/proxy/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        model: PROVIDERS[provider].testModel,
        // One short, cheap message — this is the "1-token completion"
        // fallback build.md §7 calls for when a provider has no dedicated
        // models.list-style endpoint reachable through the streaming proxy.
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ByokKeyForm({ provider, onSaved }: ByokKeyFormProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<KeyStatus>("unverified");
  const [error, setError] = useState<string | undefined>();

  // Callers always render this with `key={provider}` (see app/settings/page.tsx),
  // so a provider change remounts the component and `status`/`error` already
  // reset to their initial values — this effect only needs to load the key.
  useEffect(() => {
    loadApiKey(provider).then((existing) => {
      if (existing) {
        setValue(existing);
        setStatus("saved");
      }
    });
  }, [provider]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Enter an API key first.");
      return;
    }
    setError(undefined);
    setStatus("checking");

    const ok = await testConnection(provider, value.trim());
    if (!ok) {
      setStatus("invalid");
      setError("The provider rejected this key. Double-check it and try again.");
      return;
    }

    setStatus("valid");
    await saveApiKey(provider, value.trim());
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-3)" }}>
      <Input
        label={`${PROVIDERS[provider].label} API key`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={PROVIDERS[provider].keyPlaceholder}
        maskable
        error={error}
        aria-label={`${PROVIDERS[provider].label} API key`}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-4)" }}>
        <Button type="submit" loading={status === "checking"}>
          Test &amp; save
        </Button>
        <KeyStatusBadge status={status} />
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--kiln-text-tertiary)", margin: 0 }}>
        Stored encrypted in this browser&apos;s IndexedDB only — never sent to any server we control except the
        provider you chose.{" "}
        <a href={PROVIDERS[provider].docsUrl} target="_blank" rel="noreferrer" style={{ color: "var(--kiln-primary-400)" }}>
          Get a key
        </a>
      </p>
    </form>
  );
}
