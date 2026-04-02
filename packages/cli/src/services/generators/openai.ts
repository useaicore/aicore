import { ContextRegistryEntry } from "../../registry/types.js";

/**
 * High-fidelity generator for OpenAI context.
 */
export function generateOpenAIContext(entry: ContextRegistryEntry, answer: string): string {
  const isChat = answer.toLowerCase().includes("chat");
  const isEmbed = answer.toLowerCase().includes("embedding");
  const isExtraction = answer.toLowerCase().includes("extraction");

  return `# OpenAI Context: ${isChat ? "Chat" : isEmbed ? "Embeddings" : isExtraction ? "Structured Extraction" : "General AI"}

This project uses OpenAI for ${entry.description}

## Common Models
- **GPT-4o**: For reasoning and vision
- **GPT-3.5-Turbo**: For quick, cost-effective chat
- **Text-Embedding-3-Small**: For vector search

## Recommended Prompting
- **System Message**: Use for consistent personas.
- **Top P**: Set to 0.1 for deterministic structured output.

## Safety & Rate Limits
- **Max Tokens**: Set to 500 for most chat interactions.
- **Backoff**: Use exponential backoff for \`429 Rate Limit\` errors.
`;
}
