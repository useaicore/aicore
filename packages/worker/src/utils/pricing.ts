/**
 * @module utils/pricing
 * 
 * Model pricing engine for the AICore Worker.
 * All costs are expressed in USD Cents.
 */

import type { AICoreProvider } from "@aicore/types";

export interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

/**
 * Standard pricing table as of April 2026.
 * All rates are USD fractional cents per 1M tokens.
 */
const PRICING_TABLE: Record<string, ModelPricing> = {
  // OpenAI
  "gpt-4o-mini": { inputCostPer1M: 0.15, outputCostPer1M: 0.60 },
  "gpt-4o":      { inputCostPer1M: 5.00, outputCostPer1M: 15.00 },
  
  // Anthropic
  "claude-3-5-sonnet-20240620": { inputCostPer1M: 3.00, outputCostPer1M: 15.00 },
  "claude-3-opus-20240229":     { inputCostPer1M: 15.00, outputCostPer1M: 75.00 },
  "claude-3-haiku-20240307":    { inputCostPer1M: 0.25, outputCostPer1M: 1.25 },

  // Google Gemini (v1.5 Flash)
  "gemini-1.5-flash": { inputCostPer1M: 0.075, outputCostPer1M: 0.30 },
  "gemini-1.5-pro":   { inputCostPer1M: 3.50,  outputCostPer1M: 10.50 },

  // Groq (Llama 3 variants)
  "llama3-8b-8192":  { inputCostPer1M: 0.05, outputCostPer1M: 0.08 },
  "llama3-70b-8192": { inputCostPer1M: 0.59, outputCostPer1M: 0.79 },
};

/**
 * Calculates the total cost of a provider call in USD Cents.
 */
export function calculateCost(
  _provider: AICoreProvider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING_TABLE[model];
  if (!pricing) {
    return 0; // Unknown models default to 0 cost if not mapped
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;

  return inputCost + outputCost;
}
