import { z } from "zod";

/**
 * The declarative UI contract emitted by the "declarative" strategy's
 * system prompts (see build.md §8). Every node in the tree must match this
 * shape — anything outside the fixed enum renders as a visible
 * UnknownBlockFallback in SchemaRenderer rather than being silently dropped.
 */
export const UiNodeTypeSchema = z.enum(["stack", "card", "field", "button", "text"]);

export const FieldTypeSchema = z.enum(["text", "number", "select", "checkbox", "date"]);

export type UiNode = {
  type: z.infer<typeof UiNodeTypeSchema>;
  props?: Record<string, unknown>;
  children?: UiNode[];
};

export const UiNodeSchema: z.ZodType<UiNode> = z.lazy(() =>
  z.object({
    type: UiNodeTypeSchema,
    props: z.record(z.string(), z.unknown()).optional(),
    children: z.array(UiNodeSchema).optional(),
  }),
);

export const UiDocumentSchema = UiNodeSchema;

export type UiDocument = UiNode;
