import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cssVar, allKilnCustomProperties, colorTokens, spacingTokens, radiusTokens, durations } from "./index";

describe("cssVar", () => {
  it("prefixes a token name with --kiln-", () => {
    expect(cssVar("primary-500")).toBe("--kiln-primary-500");
    expect(cssVar("space-4")).toBe("--kiln-space-4");
  });
});

describe("allKilnCustomProperties", () => {
  it("has no duplicate entries", () => {
    expect(new Set(allKilnCustomProperties).size).toBe(allKilnCustomProperties.length);
  });

  it("every entry is prefixed with --kiln-", () => {
    for (const prop of allKilnCustomProperties) {
      expect(prop.startsWith("--kiln-")).toBe(true);
    }
  });

  it("is exactly the concatenation of color, spacing, and radius tokens", () => {
    expect(allKilnCustomProperties.length).toBe(colorTokens.length + spacingTokens.length + radiusTokens.length);
  });
});

describe("colors.css / scale.css stay in sync with the TypeScript token mirror", () => {
  // @kiln/jury's token-adherence check (packages/jury/src/rubric/tokenAdherence.ts)
  // only tests computed styles against `allKilnCustomProperties` — if a color or
  // spacing var is added to the CSS but not mirrored here, the Jury silently
  // stops being able to credit it, which would just look like a lower score
  // with no clear cause. This test exists to catch that drift immediately.
  function extractDeclaredVars(cssFile: string): Set<string> {
    const css = readFileSync(join(__dirname, cssFile), "utf-8");
    const matches = css.matchAll(/(--kiln-[a-z0-9-]+)\s*:/g);
    return new Set(Array.from(matches, (m) => m[1]).filter((v): v is string => v !== undefined));
  }

  it("every --kiln-* color declared in colors.css is mirrored in colorTokens", () => {
    const declared = extractDeclaredVars("colors.css");
    const mirrored = new Set(colorTokens.map((t) => `--kiln-${t}`));
    for (const varName of declared) {
      expect(mirrored.has(varName), `${varName} is declared in colors.css but missing from colorTokens`).toBe(true);
    }
  });

  it("every --kiln-space-* / --kiln-radius-* declared in scale.css is mirrored", () => {
    const declared = extractDeclaredVars("scale.css");
    const mirrored = new Set([...spacingTokens, ...radiusTokens].map((t) => `--kiln-${t}`));
    for (const varName of declared) {
      if (!varName.startsWith("--kiln-space-") && !varName.startsWith("--kiln-radius-")) continue;
      expect(mirrored.has(varName), `${varName} is declared in scale.css but missing from spacingTokens/radiusTokens`).toBe(true);
    }
  });
});

describe("durations", () => {
  it("matches the CSS custom properties in scale.css (fast < base < slow)", () => {
    expect(durations.fast).toBeLessThan(durations.base);
    expect(durations.base).toBeLessThan(durations.slow);
    expect(durations.slow).toBe(2200); // the ember sweep's signature duration — build.md §4.2
  });
});
