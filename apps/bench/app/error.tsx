"use client";

import { useEffect } from "react";
import { Button, Card } from "@kiln/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Client-side only — never sent anywhere (build.md: zero telemetry by default).
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "var(--kiln-space-16)" }}>
      <Card style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 var(--kiln-space-3)" }}>Something went wrong</h1>
        <p style={{ color: "var(--kiln-text-secondary)", fontSize: "0.875rem", margin: "0 0 var(--kiln-space-6)" }}>
          {error.message || "An unexpected error interrupted this page."}
        </p>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </div>
  );
}
