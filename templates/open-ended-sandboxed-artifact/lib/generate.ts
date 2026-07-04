import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const SYSTEM_PROMPT = `You generate a single, complete, self-contained HTML document in response to the
user's request. Output ONLY the HTML, starting with <!DOCTYPE html> and nothing
before or after it. All CSS must be inline in a <style> tag; all JavaScript must
be inline in a <script> tag. Do not reference external stylesheets, fonts, or
scripts other than fonts.googleapis.com. Do not include any explanation before
or after the HTML.`;

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

function extractHtml(text: string): string {
  const start = text.indexOf("<!DOCTYPE html>");
  const trimmed = start >= 0 ? text.slice(start) : text;
  const end = trimmed.lastIndexOf("</html>");
  return end >= 0 ? trimmed.slice(0, end + "</html>".length) : trimmed;
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

    // Not trusted structurally at any point — the raw text goes straight into
    // the sandboxed iframe boundary in @kiln/sandbox. See build.md §8, §10.
    const { text } = await generateText({ model: languageModel, system: SYSTEM_PROMPT, prompt });

    return Response.json({ html: extractHtml(text) });
  } catch (err) {
    const { status, message } = describeError(err);
    return Response.json({ error: message }, { status });
  }
}
