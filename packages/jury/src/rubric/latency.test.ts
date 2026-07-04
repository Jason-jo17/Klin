import { describe, it, expect } from "vitest";
import { bandLatency } from "./latency";

describe("bandLatency", () => {
  it.each([
    [0, 5],
    [799, 5],
    [800, 4],
    [1499, 4],
    [1500, 3],
    [2499, 3],
    [2500, 2],
    [3999, 2],
    [4000, 1],
    [10000, 1],
  ])("bands %ims as score %i", (ms, expected) => {
    expect(bandLatency(ms)).toBe(expected);
  });
});
