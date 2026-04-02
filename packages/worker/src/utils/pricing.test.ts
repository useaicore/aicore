import { calculateCost } from "./pricing.js";
import { describe, it, expect } from "@jest/globals";

describe("PricingEngine", () => {
  it("should calculate correct cost for gpt-4o-mini", () => {
    const cost = calculateCost("openai", "gpt-4o-mini", 1_000_000, 1_000_000);
    expect(cost).toBe(0.15 + 0.60); // 0.75 cents
  });

  it("should calculate correct cost for claude-3-sonnet", () => {
    const cost = calculateCost("anthropic", "claude-3-5-sonnet-20240620", 1_000_000, 1_000_000);
    expect(cost).toBe(3.00 + 15.00); // 18 cents
  });

  it("should return 0 for unknown models", () => {
    const cost = calculateCost("openai", "unknown-model", 1000, 1000);
    expect(cost).toBe(0);
  });
});
