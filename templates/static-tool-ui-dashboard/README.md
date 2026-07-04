# Static Tool-UI Dashboard

Reference implementation of **Static GenUI**: the model never writes markup. It
can only affect what appears on screen by calling one of four fixed tools
(`render_metric_card`, `render_bar_chart`, `render_data_table`,
`render_comparison_grid`), each of which is mapped to a pre-built React
component in [`components/ToolResultRenderer.tsx`](./components/ToolResultRenderer.tsx).

## Architecture

- `app/api/generate/route.ts` streams a `streamText` call with the tool
  catalog attached. The system prompt (below) explicitly forbids describing
  a chart in prose instead of calling a tool.
- `components/ToolResultRenderer.tsx` holds a `Record<string, Component>` map
  from tool name to component — this map **is** the safety boundary. There is
  no `dangerouslySetInnerHTML`, no schema interpretation, no code path where
  model output becomes markup directly.
- `app/page.tsx` is a minimal standalone chat UI wired to the route via
  `@ai-sdk/react`'s `useChat`.

**System prompt:**
```
You are a dashboard assistant. You do not write UI code or markup. When the user
asks for a visualization or data view, you MUST call one of the provided tools
(render_metric_card, render_bar_chart, render_data_table, render_comparison_grid).
Never respond with a text description of a chart in place of a tool call. If no
tool fits the request, ask one clarifying question instead of inventing a new
visual.
```

## When to reach for this pattern

Use Static GenUI when your product has a small, well-known set of
visualizations or actions and brand consistency matters more than open-ended
flexibility — internal dashboards, admin tools, anything where "the AI
picked the wrong chart" is an acceptable failure mode but "the AI rendered
arbitrary HTML" is not.

## Tradeoffs

- **Safety: 5/5.** The component catalog is the safety boundary. There is
  nothing to sandbox because there is nothing to render except your own code.
- **Flexibility: 1/5.** If a user asks for a visualization outside the four
  tools, the model can only ask a clarifying question — it cannot invent a
  new one.
- **Latency: 5/5.** Tool-call results render immediately; no schema
  validation pass, no sandboxed iframe boot.
- **Setup complexity: 2/5.** Mostly the cost of hand-building each new
  component and wiring it into the tool catalog as the product's needs grow.

## Run standalone

```bash
cd templates/static-tool-ui-dashboard
pnpm install
cp .env.local.example .env.local   # set ONE provider key
pnpm dev
```
