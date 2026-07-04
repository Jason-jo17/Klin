"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@kiln/ui";
import type { TemplateManifest } from "@kiln/schema";

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateManifest[];
}

// framer-motion is scoped to apps/bench's shell only (gallery transitions,
// command palette) per build.md §2 — every other animation in the repo is
// CSS-native.
export function CommandPalette({ open, onClose, templates }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Intentional: clear the search field on close so reopening starts fresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [query, templates]);

  function go(id: string) {
    router.push(`/play/${id}`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Search templates">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or description…"
        aria-label="Search templates"
        className="kiln-input kiln-focus-ring"
        style={{ marginBottom: "var(--kiln-space-4)" }}
      />
      <AnimatePresence initial={false}>
        <motion.div
          key={query}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-1)", maxHeight: 320, overflowY: "auto" }}
        >
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className="kiln-focus-ring"
              style={{
                textAlign: "left",
                background: "transparent",
                border: "none",
                borderRadius: "var(--kiln-radius-sm)",
                padding: "var(--kiln-space-3)",
                cursor: "pointer",
                color: "var(--kiln-text-primary)",
              }}
            >
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--kiln-text-tertiary)" }}>{t.description}</div>
            </button>
          ))}
          {results.length === 0 && (
            <p style={{ color: "var(--kiln-text-tertiary)", fontSize: "0.8125rem" }}>No templates match &quot;{query}&quot;.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </Dialog>
  );
}
