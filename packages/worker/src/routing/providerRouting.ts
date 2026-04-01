/**
 * @module routing/providerRouting
 *
 * Dedicated provider selection logic for the AICore Cloudflare Worker.
 */

import { type AICoreProvider } from "@aicore/types";

/**
 * Recognised provider identifiers.
 */
export type ProviderId = "openai" | "anthropic" | "gemini" | "groq";

/**
 * The subset of the incoming payload that the router inspects.
 */
export interface RoutingInput {
  provider?: AICoreProvider;
  model?: string;
}

/**
 * Infers the provider from the model string.
 *
 * Inference rules:
 *  - gpt-* / gpt4* / gpt-4o* → openai
 *  - claude-*                → anthropic
 */
export function inferProviderFromModel(model?: string): AICoreProvider | undefined {
  if (!model) return undefined;
  const m = model.toLowerCase();

  // OpenAI family
  if (m.startsWith("gpt-") || m.startsWith("gpt4") || m.startsWith("gpt-4")) {
    return "openai";
  }

  // Anthropic family
  if (m.startsWith("claude-")) {
    return "anthropic";
  }

  // Placeholders for future adapters:
  // if (m.startsWith("gemini-")) return "gemini";
  // if (m.startsWith("groq-"))   return "groq";

  return undefined;
}

/**
 * Decides which provider to use based on the input.
 *
 * Resolution order:
 *  1. Explicit `provider` field on the payload (if valid).
 *  2. Inference from the `model` string.
 *  3. Default to OpenAI.
 */
export function pickProvider(input: RoutingInput): AICoreProvider {
  // 1) Explicit valid provider wins
  if (
    input.provider === "openai" ||
    input.provider === "anthropic"
    // || input.provider === "gemini"
    // || input.provider === "groq"
  ) {
    return input.provider;
  }

  // 2) Infer from model string
  const inferred = inferProviderFromModel(input.model);
  if (inferred) return inferred;

  // 3) Default to OpenAI
  return "openai";
}
