import { handleGenerateRequest as staticToolUiDashboard } from "static-tool-ui-dashboard/lib/generate";
import { handleGenerateRequest as staticMcpToolCards } from "static-mcp-tool-cards/lib/generate";
import { handleGenerateRequest as declarativeJsonSchemaForm } from "declarative-json-schema-form/lib/generate";
import { handleGenerateRequest as declarativeA2uiAgentPanel } from "declarative-a2ui-agent-panel/lib/generate";
import { handleGenerateRequest as declarativeMcpUiResource } from "declarative-mcp-ui-resource/lib/generate";
import { handleGenerateRequest as openEndedSandboxedArtifact } from "open-ended-sandboxed-artifact/lib/generate";
import { checkRateLimit, clientKeyFromRequest, rateLimitResponse } from "../../../../lib/rateLimit";

export const runtime = "nodejs";

/**
 * The live playground doesn't re-implement each template's generation
 * logic — it imports every template as a workspace package (build.md §3)
 * and dispatches by templateId to that template's own handler, so the
 * system prompt and tool/schema definitions are defined exactly once, in
 * the template's own source.
 */
const HANDLERS: Record<string, (req: Request) => Promise<Response>> = {
  "static-tool-ui-dashboard": staticToolUiDashboard,
  "static-mcp-tool-cards": staticMcpToolCards,
  "declarative-json-schema-form": declarativeJsonSchemaForm,
  "declarative-a2ui-agent-panel": declarativeA2uiAgentPanel,
  "declarative-mcp-ui-resource": declarativeMcpUiResource,
  "open-ended-sandboxed-artifact": openEndedSandboxedArtifact,
};

export async function POST(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const rateLimit = checkRateLimit(`templates:${clientKeyFromRequest(req)}`, 30, 60_000);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const { templateId } = await params;
  const handler = HANDLERS[templateId];

  if (!handler) {
    return Response.json({ error: `Unknown template: ${templateId}` }, { status: 404 });
  }

  return handler(req);
}
