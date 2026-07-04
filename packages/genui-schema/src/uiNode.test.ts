import { describe, it, expect } from "vitest";
import { UiNodeSchema } from "./uiNode";

describe("UiNodeSchema", () => {
  it("accepts a simple text node", () => {
    expect(UiNodeSchema.safeParse({ type: "text", props: { content: "hello" } }).success).toBe(true);
  });

  it("accepts a nested tree (stack > card > field/button)", () => {
    const tree = {
      type: "stack",
      children: [
        {
          type: "card",
          props: { title: "Shipping address" },
          children: [
            { type: "field", props: { label: "Name", fieldType: "text" } },
            { type: "button", props: { label: "Submit" } },
          ],
        },
      ],
    };
    const result = UiNodeSchema.safeParse(tree);
    expect(result.success).toBe(true);
  });

  it("rejects a type outside the fixed enum (this is the whole safety boundary)", () => {
    const result = UiNodeSchema.safeParse({ type: "script", props: {} });
    expect(result.success).toBe(false);
  });

  it("rejects a node smuggled into children with an invalid type", () => {
    const tree = { type: "stack", children: [{ type: "iframe", props: {} }] };
    expect(UiNodeSchema.safeParse(tree).success).toBe(false);
  });

  it("allows props and children to be omitted", () => {
    expect(UiNodeSchema.safeParse({ type: "text" }).success).toBe(true);
  });

  it("rejects a non-object payload", () => {
    expect(UiNodeSchema.safeParse("not a node").success).toBe(false);
    expect(UiNodeSchema.safeParse(null).success).toBe(false);
    expect(UiNodeSchema.safeParse(42).success).toBe(false);
  });
});
