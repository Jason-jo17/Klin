# JSON Schema Form

Reference implementation of **Declarative GenUI**, and the home of
`SchemaRenderer` — the renderer is actually shipped from `@kiln/schema`
(see [`packages/genui-schema/src/SchemaRenderer.tsx`](../../packages/genui-schema/src/SchemaRenderer.tsx))
so every declarative template in this repo shares the same rendering core.

## Architecture

- `app/api/generate/route.ts` asks the model for JSON only (system prompt
  below), parses the response, and validates it against `UiNodeSchema`
  (`@kiln/schema`). On failure it retries **once** with an explicit
  correction message; if the retry also fails, it returns a 422 rather than
  looping.
- `@kiln/schema`'s `SchemaRenderer` walks the validated tree and maps each
  `type` to a `@kiln/ui` primitive. It never uses
  `dangerouslySetInnerHTML`, never evals, and never accepts a `type` outside
  the fixed enum — unknown types render a visible `UnknownBlockFallback`.
- `components/RunLog.tsx` surfaces the retry/error state in the UI so a
  schema-validation failure is always loud, never silently swallowed.

**System prompt:**
```
You generate UI descriptions, never UI code. Respond ONLY with JSON matching
this schema: { "type": "stack"|"card"|"field"|"button"|"text", "props": object,
"children": array }. Do not include any HTML, JavaScript, markdown, or prose
outside the JSON object. Every "field" node must include a "fieldType" from
["text","number","select","checkbox","date"] and a "label".
```

## When to reach for this pattern

Use Declarative GenUI when the shapes you need vary more than a static
catalog can cover, but you still want a hard schema boundary between "what
the model said" and "what actually renders" — think forms, settings
screens, and any surface where the layout should feel native to your
product's own design system rather than injected markup.

## Tradeoffs

- **Safety: 4/5.** Every node is Zod-validated before render; the only way
  to weaken this is to widen the schema itself.
- **Flexibility: 3/5.** Bounded by the node vocabulary (`stack`, `card`,
  `field`, `button`, `text`) — enough for most forms and panels, not enough
  for arbitrary layouts.
- **Latency: 3/5.** A schema-invalid first response costs a full extra
  round trip before the retry.
- **Setup complexity: 3/5.** Requires maintaining the node schema and its
  renderer as your UI vocabulary grows.

## Run standalone

```bash
cd templates/declarative-json-schema-form
pnpm install
cp .env.local.example .env.local
pnpm dev
```
