import Link from "next/link";
import { Button, Card } from "@kiln/ui";

export default function NotFound() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "var(--kiln-space-16)" }}>
      <Card style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 var(--kiln-space-3)" }}>Page not found</h1>
        <p style={{ color: "var(--kiln-text-secondary)", fontSize: "0.875rem", margin: "0 0 var(--kiln-space-6)" }}>
          There's no template or page at this address.
        </p>
        <Link href="/">
          <Button>Back to the gallery</Button>
        </Link>
      </Card>
    </div>
  );
}
