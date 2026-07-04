# Architecture

## The two halves

1. **`/templates`** — independently-runnable reference implementations,
   one per GenUI strategy (plus notable sub-patterns). Every template runs
   standalone via `pnpm dev` with nothing but a `.env.local` API key.
2. **`/apps/bench`** — a single Next.js app that imports every template as
   a **workspace package** and hosts a live playground, a side-by-side
   comparison view, and the Jury's results.

## Why templates are workspace packages, not iframed deployments

The Bench needs to run each template's exact generation logic (system
prompt, tool catalog or schema, retry behavior) without duplicating it.
Each template factors its route handler into `lib/generate.ts`, exporting a
plain `handleGenerateRequest(req: Request): Promise<Response>` function.
The template's own `app/api/generate/route.ts` re-exports it as `POST`;
`apps/bench/app/api/templates/[templateId]/route.ts` imports the same
function directly and dispatches to it by `templateId`. One implementation,
two entry points — the prompts and tool definitions are never copy-pasted
between a template and the Bench.

## The shared packages

- **`@kiln/tokens`** — the only source of color/spacing/radius/motion
  values in the repo. Ships as plain CSS custom properties so
  non-Tailwind templates can consume it too.
- **`@kiln/ui`** — Button, Card, Input, Dialog, Tabs, Tooltip, Skeleton.
  Hand-built (no headless-UI library dependency) so the accessibility
  behavior — focus trapping, roving tabindex, `aria-*` wiring — is fully
  auditable in this repo.
- **`@kiln/schema`** — the declarative UI contract (`UiNodeSchema`) and its
  renderer (`SchemaRenderer`), plus the template manifest schema every
  `kiln.manifest.json` is validated against at build time.
- **`@kiln/sandbox`** — the iframe sandboxing primitive
  (`SandboxedArtifact`) and its `postMessage` bridge. See
  `docs/SECURITY.md` for why `allow-same-origin` is never added here.
- **`@kiln/jury`** — the validation rubric engine, usable as a standalone
  npm package outside Kiln entirely.

## The GenUICanvas strategy switch

`apps/bench/components/player/GenUICanvas.tsx` is the one place in the
Bench where "which GenUI strategy is this" becomes a branch in code:

- `static` → renders a fixed `Record<toolName, Component>` map (owned by
  each static template, e.g. `ToolResultRenderer`).
- `declarative` → hands a validated JSON tree to `@kiln/schema`'s
  `SchemaRenderer`.
- `open-ended` → hands raw HTML to `@kiln/sandbox`'s `SandboxedArtifact`.

No sibling component (`ChatPane`, `RunTimeline`, `JuryScorePanel`) contains
strategy-specific rendering logic — they're either pure input/event-log
UI or read from the same `TemplateManifest` shape regardless of strategy.

## The registry

`apps/bench/lib/registry/templateRegistry.ts` glob-reads every
`templates/*/kiln.manifest.json` at build time and validates each against
`TemplateManifestSchema`. An invalid or missing manifest **fails the
build** — this is intentional; it's the mechanism that keeps the gallery
honest as contributors add templates (see `docs/ADDING-A-TEMPLATE.md`).

## Known v1 limitations

- Jury run results live in a Zustand store for the browser session only —
  no server-side persistence. Refreshing the Bench loses them; export as
  JSON via `pnpm jury report --runId <id> --format json` if you need to
  keep a result from a CI run.
- Token-adherence scoring is only meaningful for static/declarative
  templates, where the DOM is fully under Kiln's control. Open-ended
  templates are scored against their own declared design intent instead
  (see `packages/jury/src/rubric/tokenAdherence.ts` and
  `build.md` §9.1) — this is a documented limitation, not a bug.
