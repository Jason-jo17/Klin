import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export interface AccessibilityResult {
  score: number;
  violationCount: number;
  hasCritical: boolean;
}

/** Runs axe-core against the current page and scores per build.md §9.1. */
export async function scoreAccessibility(page: Page, selector: string): Promise<AccessibilityResult> {
  const results = await new AxeBuilder({ page }).include(selector).analyze();
  const violationCount = results.violations.length;
  const hasCritical = results.violations.some((v) => v.impact === "critical");
  const raw = 5 - Math.min(violationCount, 5);
  const score = hasCritical ? Math.min(raw, 2) : raw;
  return { score, violationCount, hasCritical };
}
