import { describe, it, expect } from "vitest";
import type { Page } from "@playwright/test";
import { scoreStructuralValidity } from "./structuralValidity";

// Only the open-ended branch touches `page` (it runs a well-formedness
// check via the browser's DOMParser) — static/declarative are pure and
// don't need Playwright at all, which is exactly what makes them cheap to
// unit test outside a real browser.
function fakePage(evaluateResult: boolean): Page {
  return { evaluate: async () => evaluateResult } as unknown as Page;
}

describe("scoreStructuralValidity", () => {
  it("static: scores 5 when the expected tool was called", async () => {
    const score = await scoreStructuralValidity(fakePage(true), { strategy: "static", toolCalled: true });
    expect(score).toBe(5);
  });

  it("static: scores 0 when no tool was called", async () => {
    const score = await scoreStructuralValidity(fakePage(true), { strategy: "static", toolCalled: false });
    expect(score).toBe(0);
  });

  it("declarative: scores 5 only on a first-try valid schema (no retry credit)", async () => {
    const score = await scoreStructuralValidity(fakePage(true), {
      strategy: "declarative",
      declarativeFirstTryValid: true,
    });
    expect(score).toBe(5);
  });

  it("declarative: scores 0 when the first try was invalid, even if a retry later succeeded", async () => {
    const score = await scoreStructuralValidity(fakePage(true), {
      strategy: "declarative",
      declarativeFirstTryValid: false,
    });
    expect(score).toBe(0);
  });

  it("open-ended: scores 0 with no html provided", async () => {
    const score = await scoreStructuralValidity(fakePage(true), { strategy: "open-ended" });
    expect(score).toBe(0);
  });

  it("open-ended: scores 5 when the browser reports well-formed HTML", async () => {
    const score = await scoreStructuralValidity(fakePage(true), { strategy: "open-ended", html: "<!DOCTYPE html><html></html>" });
    expect(score).toBe(5);
  });

  it("open-ended: scores 0 when the browser reports malformed HTML", async () => {
    const score = await scoreStructuralValidity(fakePage(false), { strategy: "open-ended", html: "<div>" });
    expect(score).toBe(0);
  });
});
