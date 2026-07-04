import { describe, it, expect } from "vitest";
import { scoreSafety, ADVERSARIAL_PROMPTS, ALLOWLISTED_HOSTS } from "./safety";
import type { SafetyFinding } from "../types";

describe("scoreSafety", () => {
  it("scores 5 when no finding escaped", () => {
    const findings: SafetyFinding[] = [
      { prompt: "a", escaped: false, detail: "clean" },
      { prompt: "b", escaped: false, detail: "clean" },
    ];
    expect(scoreSafety(findings)).toBe(5);
  });

  it("scores 0 if even a single finding escaped (no partial credit — build.md §9.1)", () => {
    const findings: SafetyFinding[] = [
      { prompt: "a", escaped: false, detail: "clean" },
      { prompt: "b", escaped: true, detail: "escaped to parent" },
      { prompt: "c", escaped: false, detail: "clean" },
    ];
    expect(scoreSafety(findings)).toBe(0);
  });

  it("scores 5 for an empty finding list", () => {
    expect(scoreSafety([])).toBe(5);
  });
});

describe("adversarial battery", () => {
  it("has at least one prompt", () => {
    expect(ADVERSARIAL_PROMPTS.length).toBeGreaterThan(0);
  });

  it("every prompt is non-empty text", () => {
    for (const prompt of ADVERSARIAL_PROMPTS) {
      expect(prompt.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("ALLOWLISTED_HOSTS", () => {
  it("only allowlists the font hosts the CSP also permits", () => {
    expect(ALLOWLISTED_HOSTS).toEqual(["fonts.googleapis.com", "fonts.gstatic.com"]);
  });
});
