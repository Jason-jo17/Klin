import type { Page } from "@playwright/test";
import { allKilnCustomProperties } from "@kiln/tokens";

export interface TokenAdherenceResult {
  score: number;
  matched: number;
  total: number;
}

const COLOR_PROPS = ["color", "background-color", "border-color", "border-top-color"];
const SPACING_PROPS = ["padding-top", "padding-left", "margin-top", "margin-left", "gap", "border-radius"];

/**
 * Static-analyzes computed styles of every element under `selector` and
 * checks how many color/spacing properties resolve to a value that a
 * `--kiln-*` custom property also resolves to. Only meaningful for
 * static/declarative strategies where the DOM is ours to control — see
 * build.md §9.1 for why open-ended templates are scored differently.
 */
export async function scoreTokenAdherence(page: Page, selector: string): Promise<TokenAdherenceResult> {
  const { matched, total } = await page.evaluate(
    ({ selector, colorProps, spacingProps, tokenNames }) => {
      const root = document.querySelector(selector);
      if (!root) return { matched: 0, total: 0 };

      const rootStyle = getComputedStyle(document.documentElement);
      const tokenValues = new Set(
        tokenNames.map((name: string) => rootStyle.getPropertyValue(name).trim()).filter(Boolean),
      );

      const elements = [root, ...Array.from(root.querySelectorAll("*"))];
      let matchedCount = 0;
      let totalCount = 0;

      for (const el of elements) {
        const style = getComputedStyle(el);
        for (const prop of [...colorProps, ...spacingProps]) {
          const value = style.getPropertyValue(prop).trim();
          if (!value || value === "0px" || value === "rgba(0, 0, 0, 0)" || value === "none") continue;
          totalCount += 1;
          if (tokenValues.has(value)) matchedCount += 1;
        }
      }

      return { matched: matchedCount, total: totalCount };
    },
    { selector, colorProps: COLOR_PROPS, spacingProps: SPACING_PROPS, tokenNames: allKilnCustomProperties },
  );

  const score = total === 0 ? 5 : Math.round(5 * (matched / total) * 100) / 100;
  return { score, matched, total };
}
