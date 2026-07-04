export const STRATEGY_META = {
  static: {
    label: "Static GenUI",
    summary:
      "AI selects from a pre-built component catalog via tool calls. Safest, most on-brand, least flexible.",
    exampleFrameworks: ["Vercel AI SDK (tool calling + generative UI)", "CopilotKit", "assistant-ui"],
  },
  declarative: {
    label: "Declarative GenUI",
    summary:
      "AI emits structured JSON/schema; the client renders it with its own design system. Balanced safety and flexibility.",
    exampleFrameworks: ["Google A2UI", "MCP-UI (ui:// resources)", "Thesys C1", "JSON-Schema-driven forms"],
  },
  "open-ended": {
    label: "Open-Ended GenUI",
    summary:
      "AI generates free-form HTML/code rendered in a sandbox. Most flexible, requires the strongest sandboxing.",
    exampleFrameworks: ["Claude Artifacts", "v0.dev", "Bolt.new", "Lovable"],
  },
} as const;
