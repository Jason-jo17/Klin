"use client";

import { useState } from "react";
import { Card } from "@kiln/ui";
import { ByokKeyForm } from "./ByokKeyForm";
import { ProviderPicker } from "./ProviderPicker";
import type { ProviderId } from "../../lib/byok/providerConfig";

export function SettingsClient() {
  const [provider, setProvider] = useState<ProviderId>("anthropic");

  return (
    <div style={{ maxWidth: 560 }}>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "1.75rem" }}>Settings</h1>
        <p style={{ color: "var(--kiln-text-secondary)" }}>
          Kiln never asks for or stores your API key on any server we control. Keys live only in this browser&apos;s
          IndexedDB, encrypted at rest.
        </p>
      </header>

      <Card>
        <ProviderPicker value={provider} onChange={setProvider} />
        <div style={{ marginTop: "var(--kiln-space-6)" }}>
          <ByokKeyForm key={provider} provider={provider} onSaved={() => {}} />
        </div>
      </Card>
    </div>
  );
}
