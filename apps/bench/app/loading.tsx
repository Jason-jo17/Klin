import { Skeleton } from "@kiln/ui";

export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-4)" }}>
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--kiln-space-4)", marginTop: "var(--kiln-space-4)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="10rem" />
        ))}
      </div>
    </div>
  );
}
