# MCP Tool Cards

A Static GenUI variant where tool *results* come from a real
[MCP](https://modelcontextprotocol.io) server instead of inline AI SDK
`execute` functions — see [`lib/mcpServer.ts`](./lib/mcpServer.ts) (the
server) and [`lib/mcpClient.ts`](./lib/mcpClient.ts) (an MCP `Client`
connected over an in-memory transport, so the whole thing still runs as a
single `pnpm dev` with no extra process to manage).

## Architecture

- `lib/mcpServer.ts` exposes two tools (`list_issues`,
  `get_deployment_status`) via `McpServer`.
- `lib/mcpClient.ts` connects a real MCP `Client` to that server in-process
  and wraps each MCP tool as an AI SDK `tool()`, so `streamText` in
  `app/api/generate/route.ts` calls through the actual MCP protocol, not a
  shortcut.
- `components/McpResultCards.tsx` maps each tool result's `kind` field to a
  pre-built card — the same "fixed catalog is the safety boundary" idea as
  `static-tool-ui-dashboard`, just fed by MCP instead of local functions.

**System prompt:**
```
You are a workspace assistant backed by MCP tools. You do not write UI code or
markup. When the user asks about issues or deployments, you MUST call one of
the provided tools (list_issues, get_deployment_status). Never fabricate
issue or deployment data from memory — always call the tool.
```

## When to reach for this pattern

Use this when your tools already live behind MCP — shared with Claude
Desktop, other agents, or a CLI — and you want a web UI that renders their
results without giving the model any markup-generation power.

## Tradeoffs

- **Safety: 5/5.** Same fixed-catalog boundary as static-tool-ui-dashboard;
  MCP only changes where tool *execution* happens, not how results reach
  the DOM.
- **Flexibility: 1/5.** New result shapes need a new card registered in
  `McpResultCards.tsx`.
- **Latency: 4/5.** One extra hop (client → in-process MCP server) versus
  a bare `execute` function, though in production MCP servers are often
  remote and this cost grows.
- **Setup complexity: 3/5.** You're standing up and maintaining an MCP
  server, not just a function map.

## Run standalone

```bash
cd templates/static-mcp-tool-cards
pnpm install
cp .env.local.example .env.local
pnpm dev
```
