import { ContextRegistryEntry } from "../../registry/types.js";

/**
 * High-fidelity generator for Cloudflare Workers.
 */
export function generateCloudflareContext(entry: ContextRegistryEntry, answer: string): string {
  const isProxy = answer.toLowerCase().includes("proxy");
  const isScheduled = answer.toLowerCase().includes("scheduled");
  const isWebhook = answer.toLowerCase().includes("webhook");

  return `# Cloudflare Worker: ${isProxy ? "API Proxy" : isScheduled ? "Scheduled Task" : isWebhook ? "Webhook Handler" : "General Purpose"}

This project uses Cloudflare Workers for ${entry.description}

## Configuration (wrangler.toml)
- **main**: \`src/index.ts\`
- **compatibility_date**: \`2024-04-03\`
- **vars**: For API keys and static configuration.

## Features Used
- **KV**: For persistent state
- **DO (Durable Objects)**: For real-time consistency
- **D1**: For SQL at the edge

## Best Practices
- **WaitUntil**: Use \`ctx.waitUntil()\` for non-blocking telemetry.
- **NodeNext**: Ensure \`ts-config\` is set to \`nodenext\`.
`;
}
