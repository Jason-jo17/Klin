import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SurfaceNodeSchema } from "./surfaceSchema";

export const SYSTEM_PROMPT = `You generate agent-run status surfaces as declarative JSON, never UI code.
Respond ONLY with JSON matching this schema: { "type": "panel"|"status"|"metric"|"timeline"|"action",
"props": object, "children": array }. A "status" node's props must include a "state" from
["ok","pending","error","running"] and a "label". A "metric" node's props must include "label"
and "value". A "timeline" node's props must include an "events" array of strings. Do not include
any HTML, JavaScript, markdown, or prose outside the JSON object.`;

const RETRY_PROMPT = "Your last response was not valid JSON matching the schema. Return only valid JSON.";

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

function tryParse(text: string) {
  try {
    const result = SurfaceNodeSchema.safeParse(JSON.parse(text));
    return result.success ? result.data : null;
  } catch {
    return null;
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
  const { provider, apiKey, model, prompt } = await req.json();
  const resolvedKey = apiKey ?? process.env[ENV_KEY_BY_PROVIDER[provider] ?? ""];

  if (!resolvedKey || !model || !prompt) {
    return Response.json({ error: "apiKey, model, and prompt are required" }, { status: 400 });
  }

  try {
    const languageModel = resolveProvider(provider, resolvedKey)(model);

    const first = await generateText({ model: languageModel, system: SYSTEM_PROMPT, prompt });
    let surface = tryParse(first.text);
    let retried = false;

    if (!surface) {
      retried = true;
      const second = await generateText({
        model: languageModel,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: first.text },
          { role: "user", content: RETRY_PROMPT },
        ],
      });
      surface = tryParse(second.text);
    }

    if (!surface) {
      return Response.json({ error: "Model did not return schema-valid JSON after one retry.", retried, failed: true }, { status: 422 });
    }

    return Response.json({ surface, retried, failed: false });
  } catch (err) {
    const { status, message } = describeError(err);
    return Response.json({ error: message, failed: true }, { status });
  }
}
