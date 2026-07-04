import { z } from "zod";

export const StrategySchema = z.enum(["static", "declarative", "open-ended"]);

export const TemplateManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // must match directory name
  name: z.string().min(3).max(60),
  strategy: StrategySchema,
  subPattern: z.string().optional(), // e.g. "mcp-ui", "a2ui", "ai-sdk-tools"
  description: z.string().min(20).max(280),
  whenToUse: z.string().min(20), // one paragraph, shown in gallery detail
  tradeoffs: z.object({
    safety: z.number().min(1).max(5), // 5 = safest (declarative/static score higher)
    flexibility: z.number().min(1).max(5), // 5 = most flexible (open-ended scores higher)
    latency: z.number().min(1).max(5), // 5 = fastest
    setupComplexity: z.number().min(1).max(5),
  }),
  providerRequirements: z.array(z.enum(["anthropic", "openai", "google"])).min(1),
  entryRoute: z.string(), // relative path Bench iframes/imports
  previewPrompts: z.array(z.string()).min(3).max(6), // seed prompts shown as quick-starts
  juryThresholds: z.object({
    accessibility: z.number().min(0).max(5).default(4),
    tokenAdherence: z.number().min(0).max(5).default(4),
    structuralValidity: z.number().min(0).max(5).default(5),
    safety: z.number().min(0).max(5).default(5),
    maxLatencyMs: z.number().default(4000),
  }),
});

export type TemplateManifest = z.infer<typeof TemplateManifestSchema>;
export type Strategy = z.infer<typeof StrategySchema>;
