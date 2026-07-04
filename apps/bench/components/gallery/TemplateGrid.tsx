"use client";

import { useMemo, useState } from "react";
import type { TemplateManifest } from "@kiln/schema";
import { TemplateCard } from "./TemplateCard";
import { StrategyFilterTabs, type StrategyFilter } from "./StrategyFilterTabs";

export function TemplateGrid({ templates }: { templates: TemplateManifest[] }) {
  const [filter, setFilter] = useState<StrategyFilter>("all");

  const visible = useMemo(
    () => (filter === "all" ? templates : templates.filter((t) => t.strategy === filter)),
    [templates, filter],
  );

  return (
    <div>
      <StrategyFilterTabs value={filter} onChange={setFilter} />
      <div
        style={{
          marginTop: "var(--kiln-space-6)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--kiln-space-4)",
        }}
      >
        {visible.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
