"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, GitCompare, Settings, Gavel } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Gallery", icon: LayoutGrid },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--kiln-border)",
        padding: "var(--kiln-space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--kiln-space-1)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="kiln-focus-ring"
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--kiln-space-3)",
              padding: "var(--kiln-space-3)",
              borderRadius: "var(--kiln-radius-md)",
              textDecoration: "none",
              color: active ? "var(--kiln-text-primary)" : "var(--kiln-text-secondary)",
              background: active ? "var(--kiln-surface-2)" : "transparent",
              fontSize: "0.875rem",
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "var(--kiln-space-2)", color: "var(--kiln-text-tertiary)", fontSize: "0.75rem", padding: "var(--kiln-space-3)" }}>
        <Gavel size={14} aria-hidden="true" />
        Jury-validated templates
      </div>
    </nav>
  );
}
