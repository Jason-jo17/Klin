"use client";

import Link from "next/link";
import { Search, Github } from "lucide-react";

export function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--kiln-space-3) var(--kiln-space-6)",
        borderBottom: "1px solid var(--kiln-border)",
        position: "sticky",
        top: 0,
        background: "var(--kiln-surface-0)",
        zIndex: "var(--kiln-z-sticky)" as unknown as number,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-2)", textDecoration: "none", color: "var(--kiln-text-primary)" }}>
        <span style={{ fontFamily: "var(--kiln-font-display)", fontWeight: 700, fontSize: "1.125rem" }}>Kiln</span>
        <span style={{ color: "var(--kiln-text-tertiary)", fontSize: "0.8125rem" }}>the Bench</span>
      </Link>

      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="kiln-focus-ring"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--kiln-space-2)",
          background: "var(--kiln-surface-1)",
          border: "1px solid var(--kiln-border)",
          borderRadius: "var(--kiln-radius-md)",
          padding: "var(--kiln-space-2) var(--kiln-space-3)",
          color: "var(--kiln-text-tertiary)",
          cursor: "pointer",
          fontSize: "0.8125rem",
        }}
      >
        <Search size={14} aria-hidden="true" />
        Search templates…
        <kbd style={{ marginLeft: "var(--kiln-space-4)", fontSize: "0.6875rem", opacity: 0.7 }}>⌘K</kbd>
      </button>

      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        className="kiln-focus-ring"
        aria-label="View Kiln on GitHub"
        style={{ color: "var(--kiln-text-secondary)", display: "flex" }}
      >
        <Github size={18} aria-hidden="true" />
      </a>
    </header>
  );
}
