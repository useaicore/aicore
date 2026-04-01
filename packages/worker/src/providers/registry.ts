/**
 * @module providers/registry
 *
 * Central registry for AI provider adapters in the AICore Worker.
 */

import type { AICoreProvider } from "@aicore/types";
import { type ProviderAdapter } from "./providerAdapter.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import { GeminiProvider } from "./gemini.js";
import { GroqProvider } from "./groq.js";

/**
 * Registry of all available provider adapters.
 *
 * This registry is intentionally narrow: its only responsibilities are
 * registration and lookup. Routing and inference logic belong in the
 * main entrypoint (index.ts).
 */
class ProviderRegistry {
  private readonly adapters = new Map<string, ProviderAdapter>();

  constructor() {
    // Eagerly register all implemented adapters.
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new GeminiProvider());
    this.register(new GroqProvider());
  }

  /** Registers a new provider adapter instance. */
  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Retrieves an adapter by its canonical AICoreProvider identifier.
   * Throws if the provider is unknown or not yet implemented.
   */
  getAdapter(id: AICoreProvider): ProviderAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(`Provider adapter not found: "${id}".`);
    }
    return adapter;
  }
}

/** Singleton instance of the provider registry. */
export const registry = new ProviderRegistry();
