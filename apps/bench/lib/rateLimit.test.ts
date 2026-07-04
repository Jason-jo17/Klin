import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit, clientKeyFromRequest } from "./rateLimit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit and reports a retry time", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const blocked = checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    checkRateLimit(a, 1, 60_000);
    expect(checkRateLimit(a, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 1, 60_000).allowed).toBe(true);
  });

  it("resets the window once it elapses", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
  });
});

describe("clientKeyFromRequest", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const req = new Request("http://localhost/", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientKeyFromRequest(req)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' when the header is absent (never throws)", () => {
    const req = new Request("http://localhost/");
    expect(clientKeyFromRequest(req)).toBe("unknown");
  });
});
