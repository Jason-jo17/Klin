import { streamText, tool } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export const SYSTEM_PROMPT = `You are a dashboard assistant. You do not write UI code or markup. When the user
asks for a visualization or data view, you MUST call one of the provided tools
(render_metric_card, render_bar_chart, render_data_table, render_comparison_grid).
Never respond with a text description of a chart in place of a tool call. If no
tool fits the request, ask one clarifying question instead of inventing a new
visual.`;

// Static GenUI's safety boundary IS the tool catalog below — there is no code
// path in this template where model output becomes markup directly.
export const tools = {
  render_metric_card: tool({
    description: "Render a single headline metric with an optional trend.",
    inputSchema: z.object({
      label: z.string(),
      value: z.string(),
      trend: z.enum(["up", "down", "flat"]).optional(),
      trendLabel: z.string().optional(),
    }),
  }),
  render_bar_chart: tool({
    description: "Render a labeled bar chart from categorical data.",
    inputSchema: z.object({
      title: z.string(),
      bars: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
    }),
  }),
  render_data_table: tool({
    description: "Render tabular data with named columns.",
    inputSchema: z.object({
      title: z.string(),
      columns: z.array(z.string()).min(1),
      rows: z.array(z.array(z.union([z.string(), z.number()]))),
    }),
  }),
  render_comparison_grid: tool({
    description: "Render a grid comparing 2-4 named items across shared metrics.",
    inputSchema: z.object({
      title: z.string(),
      items: z.array(z.object({ name: z.string(), metrics: z.record(z.string(), z.union([z.string(), z.number()])) })).min(2).max(4),
    }),
  }),
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

const ENV_KEY_BY_PROVIDER: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

/**
 * Maps a thrown provider error to a status code and a message safe to show
 * the user (never includes the key itself). Bad keys and rate limits are
 * surfaced explicitly rather than left as a generic "something broke" —
 * see build.md §6.
 */
function describeError(err: unknown): { status: number; message: string } {
  const status = typeof err === "object" && err !== null && "statusCode" in err ? (err as { statusCode: unknown }).statusCode : undefined;
  if (status === 401 || status === 403) return { status: 401, message: "The provider rejected this API key." };
  if (status === 429) return { status: 429, message: "Rate limited by the provider. Wait a moment and try again." };
  if (typeof status === "number") return { status, message: "The provider returned an error." };
  return { status: 500, message: "Generation failed unexpectedly." };
}

/**
 * Shared entry point used by this template's own `/api/generate` route AND
 * by apps/bench's `/api/templates/[templateId]` route, which imports this
 * template as a workspace package for the live playground (build.md §3).
 * Keeping the handler here means the system prompt and tool catalog are
 * defined exactly once, in exactly one place.
 */
export async function handleGenerateRequest(req: Request): Promise<Response> {
  const { provider, apiKey, model, messages } = await req.json();
  const resolvedKey = apiKey ?? process.env[ENV_KEY_BY_PROVIDER[provider] ?? ""];

  if (!resolvedKey || !model) {
    return Response.json({ error: "apiKey and model are required" }, { status: 400 });
  }

  try {
    const providerInstance = resolveProvider(provider, resolvedKey);

    const result = streamText({
      model: providerInstance(model),
      system: SYSTEM_PROMPT,
      messages,
      tools,
    });

    // toUIMessageStreamResponse's default onError hides the real message to
    // avoid leaking internals — since our message here never includes the
    // key, surface it instead so a bad key doesn't just look like a stuck UI.
    return result.toUIMessageStreamResponse({
      onError: (err) => describeError(err).message,
    });
  } catch (err) {
    const { status, message } = describeError(err);
    return Response.json({ error: message }, { status });
  }
}
