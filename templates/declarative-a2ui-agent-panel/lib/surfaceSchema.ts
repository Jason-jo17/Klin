import { z } from "zod";

/**
 * A small A2UI-inspired "surface contract": the model describes an agent
 * status surface as declarative JSON (panel/status/metric/timeline/action
 * nodes), never as markup. This is a narrower, purpose-built sibling of
 * `@kiln/schema`'s form-oriented UiNodeSchema — same idea (validate, never
 * trust), different vocabulary suited to agent-run surfaces.
 */
export const SurfaceNodeTypeSchema = z.enum(["panel", "status", "metric", "timeline", "action"]);

export type SurfaceNode = {
  type: z.infer<typeof SurfaceNodeTypeSchema>;
  props?: Record<string, unknown>;
  children?: SurfaceNode[];
};

export const SurfaceNodeSchema: z.ZodType<SurfaceNode> = z.lazy(() =>
  z.object({
    type: SurfaceNodeTypeSchema,
    props: z.record(z.string(), z.unknown()).optional(),
    children: z.array(SurfaceNodeSchema).optional(),
  }),
);
