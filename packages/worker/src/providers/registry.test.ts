/**
 * @file registry.test.ts
 */

import { jest, describe, it, expect } from "@jest/globals";
import { registry } from "./registry.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";

describe("ProviderRegistry", () => {
  it("should have OpenAI registered by default", () => {
    const adapter = registry.getAdapter("openai");
    expect(adapter).toBeInstanceOf(OpenAIProvider);
    expect(adapter.name).toBe("openai");
  });

  it("should have Anthropic registered by default", () => {
    const adapter = registry.getAdapter("anthropic");
    expect(adapter).toBeInstanceOf(AnthropicProvider);
    expect(adapter.name).toBe("anthropic");
  });

  it("should throw for an unrecognised provider", () => {
    expect(() => registry.getAdapter("gemini" as any)).toThrow('Provider adapter not found: "gemini".');
  });

  it("should allow registering new adapters", () => {
    const mockAdapter: any = { name: "gemini", chat: jest.fn() };
    registry.register(mockAdapter);
    
    const adapter = registry.getAdapter("gemini" as any);
    expect(adapter).toBe(mockAdapter);
  });
});
