import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UiNode } from "@kiln/schema";

/**
 * Demonstrates the MCP-UI pattern: a tool result carries an *embedded
 * resource* addressed by a `ui://` URI, rather than plain text. The
 * resource's payload here is a `@kiln/schema` UiNode tree (JSON) — the
 * client fetches it off the tool result, validates it, and hands it to the
 * same SchemaRenderer the other declarative templates use.
 */
export function createMcpUiServer(): McpServer {
  const server = new McpServer({ name: "kiln-demo-mcp-ui-server", version: "0.1.0" });

  server.registerTool(
    "get_build_result",
    {
      title: "Get latest build result",
      description: "Get the latest CI build result as a renderable ui:// resource.",
      inputSchema: { branch: z.string().optional() },
    },
    async ({ branch }) => {
      const uiNode = buildResultUiNode(branch ?? "main");
      return {
        content: [
          {
            type: "resource",
            resource: {
              uri: `ui://build-result/${branch ?? "main"}`,
              mimeType: "application/json",
              text: JSON.stringify(uiNode),
            },
          },
        ],
      };
    },
  );

  return server;
}

function buildResultUiNode(branch: string): UiNode {
  const passed = branch !== "flaky-branch";
  return {
    type: "card",
    props: { title: `Build result — ${branch}` },
    children: [
      { type: "text", props: { content: passed ? "✅ All checks passed." : "❌ 2 checks failed." } },
      { type: "text", props: { content: `Commit: ${passed ? "a1b2c3d" : "e4f5g6h"} · ${new Date().toLocaleString()}` } },
    ],
  };
}
