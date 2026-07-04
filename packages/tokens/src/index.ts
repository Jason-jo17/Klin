/**
 * Programmatic mirror of the CSS custom properties in tokens.css.
 * Used by Tailwind's theme mapping in apps/bench and by @kiln/jury's
 * token-adherence check (which needs the canonical list of --kiln-*
 * property names to test computed styles against).
 */

export const colorTokens = [
  "primary-50",
  "primary-100",
  "primary-200",
  "primary-300",
  "primary-400",
  "primary-500",
  "primary-600",
  "primary-700",
  "primary-800",
  "primary-900",
  "primary-950",
  "ember-400",
  "ember-500",
  "ember-600",
  "success-500",
  "warning-500",
  "error-500",
  "info-500",
  "surface-0",
  "surface-1",
  "surface-2",
  "surface-3",
  "border",
  "text-primary",
  "text-secondary",
  "text-tertiary",
] as const;

export const spacingTokens = [
  "space-1",
  "space-2",
  "space-3",
  "space-4",
  "space-6",
  "space-8",
  "space-12",
  "space-16",
] as const;

export const radiusTokens = ["radius-sm", "radius-md", "radius-lg", "radius-xl"] as const;

export type ColorToken = (typeof colorTokens)[number];
export type SpacingToken = (typeof spacingTokens)[number];
export type RadiusToken = (typeof radiusTokens)[number];

/** Prefixes every token name with `--kiln-`, e.g. `cssVar("primary-500")` -> `--kiln-primary-500`. */
export function cssVar(token: ColorToken | SpacingToken | RadiusToken): string {
  return `--kiln-${token}`;
}

export const allKilnCustomProperties: readonly string[] = [
  ...colorTokens.map((t) => `--kiln-${t}`),
  ...spacingTokens.map((t) => `--kiln-${t}`),
  ...radiusTokens.map((t) => `--kiln-${t}`),
];

export const durations = {
  fast: 160,
  base: 280,
  slow: 2200,
} as const;
