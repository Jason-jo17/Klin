# A2UI Agent Panel

A second Declarative GenUI reference, styled after Google's
[A2UI](https://github.com/google/A2UI)-style idea of a small, purpose-built
surface contract, rather than a general-purpose form schema. See
[`lib/surfaceSchema.ts`](./lib/surfaceSchema.ts) for the node vocabulary
(`panel`, `status`, `metric`, `timeline`, `action`) and
[`components/SurfaceRenderer.tsx`](./components/SurfaceRenderer.tsx) for the
renderer.

## Architecture

- Same validate-never-trust discipline as `declarative-json-schema-form`:
  the model's JSON is parsed and checked against `SurfaceNodeSchema` before
  anything renders, with one bounded retry on failure.
- The vocabulary is intentionally narrower and domain-specific (agent-run
  status: panels, status pills, metrics, timelines, actions) rather than
  general-purpose form fields — this is the tradeoff A2UI-style contracts
  make: less reusable across domains, but a tighter fit for the domain they
  target.

**System prompt:**
```
You generate agent-run status surfaces as declarative JSON, never UI code.
Respond ONLY with JSON matching this schema: { "type": "panel"|"status"|"metric"|"timeline"|"action",
"props": object, "children": array }. A "status" node's props must include a "state" from
["ok","pending","error","running"] and a "label". A "metric" node's props must include "label"
and "value". A "timeline" node's props must include an "events" array of strings. Do not include
any HTML, JavaScript, markdown, or prose outside the JSON object.
```

## When to reach for this pattern

Use a narrow, purpose-built surface contract like this one when you're
building a specific kind of view repeatedly (agent run status, in this
case) and a general-purpose form schema would be more vocabulary than you
need. It's the same safety model as `declarative-json-schema-form` with a
tighter, more legible contract for readers of the generated JSON.

## Tradeoffs

- **Safety: 4/5.** Same schema-validation boundary as any declarative
  template.
- **Flexibility: 2/5.** Lower than the general form schema — this
  vocabulary only describes status surfaces, nothing else.
- **Latency: 3/5.** Same one-retry-then-fail cost profile as
  `declarative-json-schema-form`.
- **Setup complexity: 3/5.** Slightly higher than a generic schema because
  the vocabulary has to be designed for the specific surface, not reused
  off the shelf.

## Run standalone

```bash
cd templates/declarative-a2ui-agent-panel
pnpm install
cp .env.local.example .env.local
pnpm dev
```
