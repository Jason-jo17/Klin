import { describe, it, expect } from "vitest";
import { TemplateManifestSchema } from "./manifest";

const baseManifest = {
  id: "static-tool-ui-dashboard",
  name: "Static Tool-UI Dashboard",
  strategy: "static" as const,
  description: "A description that is long enough to pass the 20-character minimum.",
  whenToUse: "A when-to-use paragraph that is long enough to pass the minimum length check.",
  tradeoffs: { safety: 5, flexibility: 1, latency: 5, setupComplexity: 2 },
  providerRequirements: ["anthropic" as const],
  entryRoute: "/play/static-tool-ui-dashboard",
  previewPrompts: ["Show quarterly revenue.", "Compare signups.", "Top 5 accounts."],
  juryThresholds: { accessibility: 4, tokenAdherence: 4, structuralValidity: 5, safety: 5, maxLatencyMs: 4000 },
};

describe("TemplateManifestSchema", () => {
  it("accepts a well-formed manifest", () => {
    expect(TemplateManifestSchema.safeParse(baseManifest).success).toBe(true);
  });

  it("rejects an id with uppercase or invalid characters (must match directory naming)", () => {
    const result = TemplateManifestSchema.safeParse({ ...baseManifest, id: "Static_Tool_UI" });
    expect(result.success).toBe(false);
  });

  it("rejects a description shorter than 20 characters", () => {
    const result = TemplateManifestSchema.safeParse({ ...baseManifest, description: "too short" });
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 3 previewPrompts", () => {
    const result = TemplateManifestSchema.safeParse({ ...baseManifest, previewPrompts: ["only one"] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 6 previewPrompts", () => {
    const result = TemplateManifestSchema.safeParse({
      ...baseManifest,
      previewPrompts: Array.from({ length: 7 }, (_, i) => `Prompt number ${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tradeoff score outside 1-5", () => {
    const result = TemplateManifestSchema.safeParse({
      ...baseManifest,
      tradeoffs: { ...baseManifest.tradeoffs, safety: 6 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown provider", () => {
    const result = TemplateManifestSchema.safeParse({ ...baseManifest, providerRequirements: ["cohere"] });
    expect(result.success).toBe(false);
  });

  it("rejects an empty providerRequirements array", () => {
    const result = TemplateManifestSchema.safeParse({ ...baseManifest, providerRequirements: [] });
    expect(result.success).toBe(false);
  });

  it("defaults juryThresholds fields when omitted", () => {
    const { juryThresholds: _omit, ...withoutThresholds } = baseManifest;
    const result = TemplateManifestSchema.safeParse({ ...withoutThresholds, juryThresholds: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.juryThresholds.safety).toBe(5);
      expect(result.data.juryThresholds.maxLatencyMs).toBe(4000);
    }
  });
});
