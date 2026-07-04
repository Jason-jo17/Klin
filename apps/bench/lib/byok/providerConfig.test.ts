import { describe, it, expect } from "vitest";
import { PROVIDERS, PROVIDER_LIST } from "./providerConfig";

describe("PROVIDERS", () => {
  it("every provider's testModel is one of its own models (ByokKeyForm's test-connection call must use a real model)", () => {
    for (const [id, config] of Object.entries(PROVIDERS)) {
      expect(config.models, `${id}.testModel should be in its own models list`).toContain(config.testModel);
    }
  });

  it("every provider has at least one model", () => {
    for (const config of Object.values(PROVIDERS)) {
      expect(config.models.length).toBeGreaterThan(0);
    }
  });

  it("keys in PROVIDERS match each entry's own id field", () => {
    for (const [key, config] of Object.entries(PROVIDERS)) {
      expect(config.id).toBe(key);
    }
  });

  it("docsUrl is a valid absolute https URL for every provider", () => {
    for (const config of Object.values(PROVIDERS)) {
      expect(() => new URL(config.docsUrl)).not.toThrow();
      expect(config.docsUrl.startsWith("https://")).toBe(true);
    }
  });

  it("PROVIDER_LIST has exactly the same entries as PROVIDERS, in a stable order", () => {
    expect(PROVIDER_LIST.map((p) => p.id)).toEqual(Object.keys(PROVIDERS));
  });
});
