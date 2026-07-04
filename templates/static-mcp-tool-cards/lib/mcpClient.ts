import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { tool } from "ai";
import { z } from "zod";
import { createDemoMcpServer } from "./mcpServer";

export async function connectDemoMcpClient(): Promise<Client> {
  const server = createDemoMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "kiln-bench-client", version: "0.1.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return client;
}

function parseFirstTextContent(result: { content: Array<{ type: string; text?: string }> }): unknown {
  const first = result.content.find((c) => c.type === "text");
  return first?.text ? JSON.parse(first.text) : null;
}

/**
 * Wraps the two demo MCP tools as AI SDK `tool()` calls. Execution goes
 * through the real MCP `Client.callTool` — this is the "static, but the
 * tool results come from an MCP server" variant of Static GenUI (see
 * build.md §3, static-mcp-tool-cards).
 */
export function createMcpTools(client: Client) {
  return {
    list_issues: tool({
      description: "List open issues, optionally filtered by assignee.",
      inputSchema: z.object({ assignee: z.string().optional() }),
      execute: async ({ assignee }) => {
        const result = await client.callTool({ name: "list_issues", arguments: { assignee } });
        return parseFirstTextContent(result as Parameters<typeof parseFirstTextContent>[0]);
      },
    }),
    get_deployment_status: tool({
      description: "Get the current status of the most recent deployment for a service.",
      inputSchema: z.object({ service: z.string() }),
      execute: async ({ service }) => {
        const result = await client.callTool({ name: "get_deployment_status", arguments: { service } });
        return parseFirstTextContent(result as Parameters<typeof parseFirstTextContent>[0]);
      },
    }),
  };
}
