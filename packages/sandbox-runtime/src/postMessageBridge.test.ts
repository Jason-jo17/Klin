import { describe, it, expect, vi } from "vitest";
import { isBridgeMessage, createNonce, bridgeInitScript, attachSandboxListener } from "./postMessageBridge";

describe("isBridgeMessage", () => {
  it("accepts a well-formed bridge message", () => {
    expect(isBridgeMessage({ nonce: "abc", payload: { ok: true } })).toBe(true);
  });

  it("rejects a payload missing nonce", () => {
    expect(isBridgeMessage({ payload: {} })).toBe(false);
  });

  it("rejects a payload missing payload", () => {
    expect(isBridgeMessage({ nonce: "abc" })).toBe(false);
  });

  it("rejects a non-string nonce", () => {
    expect(isBridgeMessage({ nonce: 123, payload: {} })).toBe(false);
  });

  it("rejects primitives and null", () => {
    expect(isBridgeMessage("hello")).toBe(false);
    expect(isBridgeMessage(null)).toBe(false);
    expect(isBridgeMessage(42)).toBe(false);
    expect(isBridgeMessage(undefined)).toBe(false);
  });
});

describe("createNonce", () => {
  it("returns a non-empty string", () => {
    expect(typeof createNonce()).toBe("string");
    expect(createNonce().length).toBeGreaterThan(0);
  });

  it("is unique per call", () => {
    const nonces = new Set(Array.from({ length: 100 }, () => createNonce()));
    expect(nonces.size).toBe(100);
  });
});

describe("bridgeInitScript", () => {
  it("embeds the given nonce so the sandboxed doc can only report back under it", () => {
    const script = bridgeInitScript("test-nonce-123");
    expect(script).toContain("test-nonce-123");
    expect(script).toContain("window.kilnBridge");
  });
});

describe("attachSandboxListener", () => {
  it("accepts a message from the sandboxed (null-origin) frame with a matching nonce", () => {
    const onMessage = vi.fn();
    const cleanup = attachSandboxListener({ nonce: "n1", onMessage });

    window.dispatchEvent(
      new MessageEvent("message", { data: { nonce: "n1", payload: { hello: "world" } }, origin: "null" }),
    );

    expect(onMessage).toHaveBeenCalledWith({ hello: "world" });
    cleanup();
  });

  it("drops a message from any origin other than the opaque sandboxed 'null' origin", () => {
    const onMessage = vi.fn();
    const cleanup = attachSandboxListener({ nonce: "n1", onMessage });

    window.dispatchEvent(
      new MessageEvent("message", { data: { nonce: "n1", payload: { hello: "world" } }, origin: "https://evil.example.com" }),
    );

    expect(onMessage).not.toHaveBeenCalled();
    cleanup();
  });

  it("drops a message with a mismatched nonce, even from the right origin", () => {
    const onMessage = vi.fn();
    const cleanup = attachSandboxListener({ nonce: "expected-nonce", onMessage });

    window.dispatchEvent(
      new MessageEvent("message", { data: { nonce: "wrong-nonce", payload: {} }, origin: "null" }),
    );

    expect(onMessage).not.toHaveBeenCalled();
    cleanup();
  });

  it("drops a malformed payload that isn't a bridge message at all", () => {
    const onMessage = vi.fn();
    const cleanup = attachSandboxListener({ nonce: "n1", onMessage });

    window.dispatchEvent(new MessageEvent("message", { data: "just a string", origin: "null" }));

    expect(onMessage).not.toHaveBeenCalled();
    cleanup();
  });

  it("stops listening after cleanup is called", () => {
    const onMessage = vi.fn();
    const cleanup = attachSandboxListener({ nonce: "n1", onMessage });
    cleanup();

    window.dispatchEvent(new MessageEvent("message", { data: { nonce: "n1", payload: {} }, origin: "null" }));

    expect(onMessage).not.toHaveBeenCalled();
  });
});
