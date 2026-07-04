import type { Page } from "@playwright/test";

export interface LatencyResult {
  score: number;
  latencyMs: number;
}

/** Score bands per build.md §9.1. */
export function bandLatency(latencyMs: number): number {
  if (latencyMs < 800) return 5;
  if (latencyMs < 1500) return 4;
  if (latencyMs < 2500) return 3;
  if (latencyMs < 4000) return 2;
  return 1;
}

/**
 * Measures wall-clock time from `trigger()` (e.g. clicking "send") to the
 * canary element becoming visible in the DOM.
 */
export async function measureLatency(page: Page, canarySelector: string, trigger: () => Promise<void>): Promise<LatencyResult> {
  const start = Date.now();
  await trigger();
  await page.waitForSelector(canarySelector, { state: "visible" });
  const latencyMs = Date.now() - start;
  return { score: bandLatency(latencyMs), latencyMs };
}
