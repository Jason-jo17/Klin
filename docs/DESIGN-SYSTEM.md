# Design System

The single source of visual truth is `@kiln/tokens`. No component anywhere
in the repo — templates included — may hardcode a hex color, a px spacing
value, or a font-family. Everything resolves through the CSS custom
properties in `packages/tokens/src/*.css`.

## Philosophy

- **Calm clarity over visual theatrics.** Every element earns its place;
  motion explains, it doesn't decorate.
- **Motion as communication.** 120–300ms for feedback, 300–500ms for
  transitions. Every animation respects `prefers-reduced-motion`.
- **Emotional warmth without gimmicks.** Layered soft shadows, intentional
  corner radii, no flat gray cards.
- **Accessibility as infrastructure.** 4.5:1 minimum contrast, visible
  focus rings everywhere, full keyboard nav, semantic HTML before ARIA.

## Identity

Kiln's own visual identity — used only in `apps/bench`'s shell; templates
get a neutral variant of the same tokens so they don't fight for brand
attention — leans into the "workshop" metaphor: raw model output fired into
a finished interface. The one signature flourish: `GenUICanvas`'s
ember-gradient border sweep (`.kiln-ember-border` in
`packages/tokens/src/motion.css`) while a generation is in flight. This is
the only place Kiln spends its "boldness budget" — everything else stays
quiet.

## Fonts

**Space Grotesk** (display/headings) + **DM Sans** (body/UI), loaded via
`next/font/google`. Never Inter, Roboto, Arial, or system-ui as the primary
face.

## Tokens at a glance

| Category | File | Examples |
|---|---|---|
| Color | `colors.css` | `--kiln-primary-500`, `--kiln-ember-500`, `--kiln-surface-0` |
| Spacing | `scale.css` | `--kiln-space-1` … `--kiln-space-16` |
| Radius | `scale.css` | `--kiln-radius-sm` … `--kiln-radius-xl` |
| Shadow | `scale.css` | `--kiln-shadow-sm` … `--kiln-shadow-lg` |
| Motion | `scale.css`, `motion.css` | `--kiln-duration-fast/base/slow`, `.kiln-ember-border` |

`packages/tokens/src/index.ts` mirrors the color/spacing/radius token names
in TypeScript for two consumers: Tailwind's theme mapping in `apps/bench`,
and `@kiln/jury`'s token-adherence check, which needs the canonical list of
`--kiln-*` property names to test computed styles against.

## Interaction rules

- Hover: `translateY(-1px)` + shadow shift — never a color change alone.
- Focus: 2px solid ring in `--kiln-primary-400`, 2px offset, always visible.
- Active/press: `scale(0.97)`.
- Disabled: `opacity: 0.5`, `cursor: not-allowed`.
- Loading: buttons show an inline spinner; `GenUICanvas` shows the ember
  sweep — never a generic spinner for AI generation specifically.
- Responsive floor: 380px, 768px, 1200px+.

## Using the tokens outside Tailwind

`@kiln/tokens/tokens.css` is a plain CSS file. Any template — Tailwind or
not — gets full visual consistency by importing it directly in its root
layout, as every template in this repo already does.
