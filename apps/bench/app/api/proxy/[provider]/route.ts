import { streamText, type ModelMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderId } from "../../../../lib/byok/providerConfig";
import { checkRateLimit, clientKeyFromRequest, rateLimitResponse } from "../../../../lib/rateLimit";

export const runtime = "edge";

function resolveProvider(provider: string, apiKey: string) {
  switch (provider as ProviderId) {
    case "anthropic":
      return createAnthropic({ apiKey });
    case "openai":
      return createOpenAI({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    default:
      return null;
  }
}

/**
 * SECURITY-CRITICAL INVARIANT: this route is a stateless pass-through. The
 * `apiKey` in the request body is read once into memory, used immediately
 * to construct a provider client, and forwarded straight to the real
 * provider endpoint below. It is never written to a log line, a database, a
 * file, or an analytics event (see lib/analytics/noop.ts — Kiln has no
 * analytics at all). Do not add logging of the request body to this file.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const rateLimit = checkRateLimit(`proxy:${clientKeyFromRequest(req)}`, 30, 60_000);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const { provider } = await params;
  let body: { apiKey?: string; model?: string; messages?: unknown[] };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { apiKey, model, messages } = body;

  if (!apiKey || !model) {
    return Response.json({ error: "apiKey and model are required." }, { status: 400 });
  }

  const providerInstance = resolveProvider(provider, apiKey);
  if (!providerInstance) {
    return Response.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
  }

  try {
    const result = streamText({
      model: providerInstance(model),
      messages: (messages ?? []) as ModelMessage[],
    });
    return result.toUIMessageStreamResponse();
  } catch (err) {
    // Provider errors (bad key -> 401, rate limit -> 429, etc.) are surfaced
    // with their real status code so the user knows their key is bad, not
    // that Kiln is broken — never swallow or remap these.
    const status = extractStatus(err);
    if (status === 401) {
      return Response.json({ error: "The provider rejected this API key." }, { status: 401 });
    }
    if (status === 429) {
      const retryAfter = extractRetryAfter(err);
      const headers = retryAfter ? { "Retry-After": retryAfter } : undefined;
      return Response.json({ error: "Rate limited by the provider." }, { status: 429, headers });
    }
    if (status) {
      return Response.json({ error: "The provider returned an error." }, { status });
    }
    // Only our own serialization/unexpected failures get a 500 — provider
    // errors always pass through with their real status code above.
    return Response.json({ error: "Unexpected proxy failure." }, { status: 500 });
  }
}

function extractStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "statusCode" in err) {
    const status = (err as { statusCode: unknown }).statusCode;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

function extractRetryAfter(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "responseHeaders" in err) {
    const headers = (err as { responseHeaders: unknown }).responseHeaders;
    if (headers && typeof headers === "object" && "retry-after" in headers) {
      return String((headers as Record<string, unknown>)["retry-after"]);
    }
  }
  return undefined;
}
