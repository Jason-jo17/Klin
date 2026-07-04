import type { Page } from "@playwright/test";
import type { Strategy } from "@kiln/schema";

export interface StructuralValidityInput {
  strategy: Strategy;
  /** static: did the expected tool get called at least once? */
  toolCalled?: boolean;
  /** declarative: did the JSON parse + pass the Zod schema on the first try (no retry)? */
  declarativeFirstTryValid?: boolean;
  /** open-ended: raw HTML string to well-formedness-check via the browser's DOMParser. */
  html?: string;
}

export async function scoreStructuralValidity(page: Page, input: StructuralValidityInput): Promise<number> {
  switch (input.strategy) {
    case "static":
      return input.toolCalled ? 5 : 0;

    case "declarative":
      return input.declarativeFirstTryValid ? 5 : 0;

    case "open-ended": {
      if (!input.html) return 0;
      const wellFormed = await page.evaluate((html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.querySelector("parsererror") === null;
      }, input.html);
      return wellFormed ? 5 : 0;
    }

    default:
      return 0;
  }
}
