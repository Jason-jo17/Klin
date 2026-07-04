import { chromium } from "@playwright/test";
import type { TemplateManifest } from "@kiln/schema";
import { scoreAccessibility } from "./rubric/accessibility";
import { scoreTokenAdherence } from "./rubric/tokenAdherence";
import { scoreStructuralValidity } from "./rubric/structuralValidity";
import { ADVERSARIAL_PROMPTS, checkSandboxEscape, scoreSafety, withNetworkWatch } from "./rubric/safety";
import { measureLatency } from "./rubric/latency";
import type { JuryRunResult, SafetyFinding } from "./types";

export interface RunJuryOptions {
  manifest: TemplateManifest;
  prompt: string;
  baseUrl: string;
}

/**
 * DOM conventions every template's player UI implements (see
 * apps/bench components/player/GenUICanvas.tsx and ChatPane.tsx):
 *  - chat input:  [data-testid="chat-input"]
 *  - send button: [data-testid="chat-send"]
 *  - canvas root: [data-testid="genui-canvas"], gets data-status="done"
 *    once the generated UI has finished streaming.
 */
const CHAT_INPUT = '[data-testid="chat-input"]';
const CHAT_SEND = '[data-testid="chat-send"]';
const CANVAS_DONE = '[data-testid="genui-canvas"][data-status="done"]';
const CANVAS_ROOT = '[data-testid="genui-canvas"]';
const OPEN_ENDED_IFRAME = '[data-testid="genui-canvas"] iframe';

async function submitPrompt(page: import("@playwright/test").Page, prompt: string) {
  await page.fill(CHAT_INPUT, prompt);
  await page.click(CHAT_SEND);
}

export async function runJury({ manifest, prompt, baseUrl }: RunJuryOptions): Promise<JuryRunResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const runId = crypto.randomUUID();

  try {
    await page.goto(`${baseUrl}${manifest.entryRoute}`);

    const { latencyMs } = await measureLatency(page, CANVAS_DONE, () => submitPrompt(page, prompt));

    const accessibility = await scoreAccessibility(page, CANVAS_ROOT);
    const tokenAdherence = await scoreTokenAdherence(page, CANVAS_ROOT);

    let structuralInput: Parameters<typeof scoreStructuralValidity>[1] = { strategy: manifest.strategy };
    if (manifest.strategy === "open-ended") {
      const html = await page.locator(OPEN_ENDED_IFRAME).getAttribute("srcdoc");
      structuralInput = { strategy: manifest.strategy, html: html ?? "" };
    } else {
      const runTimelineOk = await page
        .locator('[data-testid="run-timeline"] [data-status="error"]')
        .count();
      structuralInput = {
        strategy: manifest.strategy,
        toolCalled: manifest.strategy === "static" ? runTimelineOk === 0 : undefined,
        declarativeFirstTryValid: manifest.strategy === "declarative" ? runTimelineOk === 0 : undefined,
      };
    }
    const structuralValidity = await scoreStructuralValidity(page, structuralInput);

    const safetyFindings: SafetyFinding[] = [];
    for (const adversarialPrompt of ADVERSARIAL_PROMPTS) {
      const offenders = await withNetworkWatch(page, () => submitPrompt(page, adversarialPrompt));
      const escapedDom = manifest.strategy === "open-ended" ? await checkSandboxEscape(page, OPEN_ENDED_IFRAME) : false;
      const escaped = escapedDom || offenders.length > 0;
      safetyFindings.push({
        prompt: adversarialPrompt,
        escaped,
        detail: escaped
          ? `escapedDom=${escapedDom}, offendingRequests=${offenders.join(",")}`
          : "no escape detected",
      });
    }
    const safety = scoreSafety(safetyFindings);

    const scores = {
      accessibility: accessibility.score,
      tokenAdherence: tokenAdherence.score,
      structuralValidity,
      safety,
      latency: bandFromMs(latencyMs),
    };

    const thresholdFailures: string[] = [];
    if (scores.accessibility < manifest.juryThresholds.accessibility) thresholdFailures.push("accessibility");
    if (scores.tokenAdherence < manifest.juryThresholds.tokenAdherence) thresholdFailures.push("tokenAdherence");
    if (scores.structuralValidity < manifest.juryThresholds.structuralValidity)
      thresholdFailures.push("structuralValidity");
    if (scores.safety < manifest.juryThresholds.safety) thresholdFailures.push("safety");
    if (latencyMs > manifest.juryThresholds.maxLatencyMs) thresholdFailures.push("latency");

    return {
      runId,
      templateId: manifest.id,
      strategy: manifest.strategy,
      prompt,
      timestamp: new Date().toISOString(),
      scores,
      safetyFindings,
      axeViolations: accessibility.violationCount,
      latencyMs,
      passed: thresholdFailures.length === 0,
      thresholdFailures,
    };
  } finally {
    await browser.close();
  }
}

function bandFromMs(ms: number): number {
  if (ms < 800) return 5;
  if (ms < 1500) return 4;
  if (ms < 2500) return 3;
  if (ms < 4000) return 2;
  return 1;
}
