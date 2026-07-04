export type ProviderId = "anthropic" | "openai" | "google";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  models: string[];
  testModel: string;
  keyPlaceholder: string;
  docsUrl: string;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    models: ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5"],
    testModel: "claude-haiku-4-5",
    keyPlaceholder: "sk-ant-…",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-5", "gpt-5-mini"],
    testModel: "gpt-5-mini",
    keyPlaceholder: "sk-…",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  google: {
    id: "google",
    label: "Google",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    testModel: "gemini-2.5-flash",
    keyPlaceholder: "AIza…",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);
