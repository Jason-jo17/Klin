# MCP-UI Resource

Demonstrates the [MCP-UI](https://github.com/idosal/mcp-ui) idea: a tool
result carries an **embedded resource** addressed by a `ui://` URI, instead
of (or alongside) plain text. See
[`lib/mcpUiServer.ts`](./lib/mcpUiServer.ts) for the server side and
[`lib/mcpUiClient.ts`](./lib/mcpUiClient.ts) for how the client extracts and
validates that resource.

## Architecture

- `get_build_result` returns `content: [{ type: "resource", resource: { uri:
  "ui://build-result/<branch>", mimeType: "application/json", text } }]` —
  the resource's `text` is a JSON-serialized `@kiln/schema` `UiNode` tree.
- `lib/mcpUiClient.ts` pulls the `resource` entry off the tool result,
  `JSON.parse`s its `text`, and validates it against `UiNodeSchema` before
  handing it to the client — an invalid or missing resource surfaces as a
  visible `UnknownBlockFallback`, never a silent no-op.
- `app/page.tsx` renders the validated tree with the same
  `SchemaRenderer` the other declarative templates use.

**System prompt:**
```
You are a CI assistant. You do not write UI code or markup. When the user asks
about a build or CI status, you MUST call get_build_result — never describe a
build result from memory. The tool returns a ui:// resource that the client
renders; you do not need to summarize its contents yourself.
```

## When to reach for this pattern

Use this when your tools live behind MCP and you want the *tool* (not the
model, and not client-side glue code) to own the shape of its UI payload —
useful when the same MCP server is also consumed by non-web clients that
don't care about the `ui://` resource at all.

## Tradeoffs

- **Safety: 4/5.** Same schema-validation boundary as any declarative
  template — the resource is untrusted JSON until `UiNodeSchema` says
  otherwise.
- **Flexibility: 3/5.** Bounded by the same UiNode vocabulary as
  `declarative-json-schema-form`.
- **Latency: 3/5.** One extra hop through the MCP resource layer versus a
  plain tool result.
- **Setup complexity: 4/5.** Highest of the declarative templates — you're
  maintaining an MCP server, a resource convention, and client-side
  validation together.

## Run standalone

```bash
cd templates/declarative-mcp-ui-resource
pnpm install
cp .env.local.example .env.local
pnpm dev
```
