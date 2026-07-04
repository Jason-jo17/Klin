import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { tool } from "ai";
import { z } from "zod";
import { UiNodeSchema } from "@kiln/schema";
import { createMcpUiServer } from "./mcpUiServer";

export async function connectMcpUiClient(): Promise<Client> {
  const server = createMcpUiServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "kiln-bench-ui-client", version: "0.1.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return client;
}

interface McpResourceContent {
  type: string;
  resource?: { uri: string; mimeType?: string; text?: string };
}

export function createMcpUiTools(client: Client) {
  return {
    get_build_result: tool({
      description: "Get the latest CI build result as a renderable ui:// resource.",
      inputSchema: z.object({ branch: z.string().optional() }),
      execute: async ({ branch }) => {
        const result = await client.callTool({ name: "get_build_result", arguments: { branch } });
        const content = (result.content as McpResourceContent[]).find((c) => c.type === "resource");
        if (!content?.resource?.text) {
          return { error: "MCP server did not return a ui:// resource." };
        }
        const parsed = UiNodeSchema.safeParse(JSON.parse(content.resource.text));
        if (!parsed.success) {
          return { error: "ui:// resource payload did not match the UiNode schema.", uri: content.resource.uri };
        }
        return { uri: content.resource.uri, uiTree: parsed.data };
      },
    }),
  };
}
