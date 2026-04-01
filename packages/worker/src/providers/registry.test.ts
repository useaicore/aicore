/**
 * @file registry.test.ts
 */

import { jest, describe, it, expect } from "@jest/globals";
import { registry } from "./registry.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import { GeminiProvider } from "./gemini.js";
import { GroqProvider } from "./groq.js";

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

  it("should have Gemini registered by default", () => {
    const adapter = registry.getAdapter("gemini");
    expect(adapter).toBeInstanceOf(GeminiProvider);
    expect(adapter.name).toBe("gemini");
  });

  it("should have Groq registered by default", () => {
    const adapter = registry.getAdapter("groq");
    expect(adapter).toBeInstanceOf(GroqProvider);
    expect(adapter.name).toBe("groq");
  });

  it("should throw for an unrecognised provider", () => {
    expect(() => registry.getAdapter("unknown-provider" as any)).toThrow('Provider adapter not found: "unknown-provider".');
  });

  it("should allow registering new adapters", () => {
    const mockAdapter: any = { name: "test-adapter", chat: jest.fn() };
    registry.register(mockAdapter);
    
    const adapter = registry.getAdapter("test-adapter" as any);
    expect(adapter).toBe(mockAdapter);
  });
});
