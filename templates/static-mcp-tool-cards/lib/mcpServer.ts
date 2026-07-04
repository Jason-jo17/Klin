import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * A tiny in-process demo MCP server. In a real product this would be a
 * separate process (or remote server) exposing tools over stdio/HTTP — here
 * it's inlined so the template stays a single `pnpm dev` away from working,
 * per build.md §3.1 ("every template must run standalone").
 */
export function createDemoMcpServer(): McpServer {
  const server = new McpServer({ name: "kiln-demo-mcp-server", version: "0.1.0" });

  server.registerTool(
    "list_issues",
    {
      title: "List open issues",
      description: "List open issues, optionally filtered by assignee.",
      inputSchema: { assignee: z.string().optional() },
    },
    async ({ assignee }) => {
      const issues = DEMO_ISSUES.filter((i) => !assignee || i.assignee === assignee);
      return { content: [{ type: "text", text: JSON.stringify({ kind: "issue_list", issues }) }] };
    },
  );

  server.registerTool(
    "get_deployment_status",
    {
      title: "Get deployment status",
      description: "Get the current status of the most recent deployment for a service.",
      inputSchema: { service: z.string() },
    },
    async ({ service }) => {
      const status = DEMO_DEPLOYMENTS[service] ?? { service, state: "unknown", version: "-", deployedAt: "-" };
      return { content: [{ type: "text", text: JSON.stringify({ kind: "deployment_status", ...status }) }] };
    },
  );

  return server;
}

const DEMO_ISSUES = [
  { id: "KLN-102", title: "Ember sweep janky on Safari", assignee: "jason", priority: "high" },
  { id: "KLN-118", title: "Add token-adherence report export", assignee: "jason", priority: "medium" },
  { id: "KLN-121", title: "Docs: clarify BYOK proxy statelessness", assignee: "morgan", priority: "low" },
];

const DEMO_DEPLOYMENTS: Record<string, { service: string; state: string; version: string; deployedAt: string }> = {
  bench: { service: "bench", state: "healthy", version: "v0.4.2", deployedAt: "2026-06-30T14:20:00Z" },
  jury: { service: "jury", state: "healthy", version: "v0.4.2", deployedAt: "2026-06-30T14:20:00Z" },
};
