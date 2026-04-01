/**
 * @file providerRouting.test.ts
 */

import { describe, it, expect } from "@jest/globals";
import { inferProviderFromModel, pickProvider } from "./providerRouting.js";

describe("inferProviderFromModel", () => {
  it("returns undefined for undefined input", () => {
    expect(inferProviderFromModel(undefined)).toBeUndefined();
  });

  it("infers openai from a gpt-4o model", () => {
    expect(inferProviderFromModel("gpt-4o")).toBe("openai");
  });

  it("infers anthropic from a claude-3-sonnet model", () => {
    expect(inferProviderFromModel("claude-3-5-sonnet")).toBe("anthropic");
  });

  it("returns undefined for an unknown model", () => {
    expect(inferProviderFromModel("my-custom-model")).toBeUndefined();
  });
});

describe("pickProvider", () => {
  it("uses an explicit valid provider:openai", () => {
    expect(pickProvider({ provider: "openai", model: "claude-3" })).toBe("openai");
  });

  it("uses an explicit valid provider:anthropic", () => {
    expect(pickProvider({ provider: "anthropic", model: "gpt-4" })).toBe("anthropic");
  });

  it("infers openai from gpt-4o model if provider is missing", () => {
    expect(pickProvider({ model: "gpt-4o" })).toBe("openai");
  });

  it("infers anthropic from claude-3 model if provider is missing", () => {
    expect(pickProvider({ model: "claude-3-opus" })).toBe("anthropic");
  });

  it("defaults to openai for empty or unknown input", () => {
    expect(pickProvider({})).toBe("openai");
    expect(pickProvider({ model: "unknown-model" })).toBe("openai");
  });
});
