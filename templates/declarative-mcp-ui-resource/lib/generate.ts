import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { connectMcpUiClient, createMcpUiTools } from "./mcpUiClient";

export const SYSTEM_PROMPT = `You are a CI assistant. You do not write UI code or markup. When the user asks
about a build or CI status, you MUST call get_build_result — never describe a
build result from memory. The tool returns a ui:// resource that the client
renders; you do not need to summarize its contents yourself.`;

const ENV_KEY_BY_PROVIDER: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

function resolveProvider(provider: string, apiKey: string) {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey });
    case "openai":
      return createOpenAI({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

function describeError(err: unknown): { status: number; message: string } {
  const status = typeof err === "object" && err !== null && "statusCode" in err ? (err as { statusCode: unknown }).statusCode : undefined;
  if (status === 401 || status === 403) return { status: 401, message: "The provider rejected this API key." };
  if (status === 429) return { status: 429, message: "Rate limited by the provider. Wait a moment and try again." };
  if (typeof status === "number") return { status, message: "The provider returned an error." };
  return { status: 500, message: "Generation failed unexpectedly." };
}

/** Shared entry point reused by this template's own route and apps/bench's playground. */
export async function handleGenerateRequest(req: Request): Promise<Response> {
  const { provider, apiKey, model, messages } = await req.json();
  const resolvedKey = apiKey ?? process.env[ENV_KEY_BY_PROVIDER[provider] ?? ""];

  if (!resolvedKey || !model) {
    return Response.json({ error: "apiKey and model are required" }, { status: 400 });
  }

  const mcpClient = await connectMcpUiClient();
  let closed = false;
  const closeOnce = async () => {
    if (closed) return;
    closed = true;
    await mcpClient.close();
  };

  try {
    const providerInstance = resolveProvider(provider, resolvedKey);
    const tools = createMcpUiTools(mcpClient);

    const result = streamText({
      model: providerInstance(model),
      system: SYSTEM_PROMPT,
      messages,
      tools,
      onFinish: closeOnce,
      onError: closeOnce,
    });

    return result.toUIMessageStreamResponse({
      onError: (err) => describeError(err).message,
    });
  } catch (err) {
    await closeOnce();
    const { status, message } = describeError(err);
    return Response.json({ error: message }, { status });
  }
}
