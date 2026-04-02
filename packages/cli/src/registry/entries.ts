import { ContextRegistryEntry } from "./types.js";

/**
 * Initial set of supported context topics (Placeholders for now).
 */
export const TOPICS: ContextRegistryEntry[] = [
  {
    id: "openai",
    aliases: ["ai", "chatgpt", "gpt"],
    description: "OpenAI integration context (API keys, models, SDK usage).",
    implemented: true
  },
  {
    id: "anthropic",
    aliases: ["claude"],
    description: "Anthropic integration context (Claude models, SDK).",
    implemented: true
  },
  {
    id: "gemini",
    aliases: ["google-ai"],
    description: "Google Gemini integration context.",
    implemented: true
  },
  {
    id: "stripe",
    aliases: ["billing", "payments"],
    description: "Stripe billing and subscription context.",
    implemented: true
  },
  {
    id: "supabase",
    aliases: ["database", "db", "auth"],
    description: "Supabase infrastructure context (Postgres, Auth).",
    implemented: true
  },
  {
    id: "cloudflare-worker",
    aliases: ["worker", "edge", "wrangler"],
    description: "Cloudflare Worker deployment and runtime context.",
    implemented: true
  },
  {
    id: "redis-bullmq",
    aliases: ["queues", "jobs", "bullmq"],
    description: "Redis and BullMQ background processing context.",
    implemented: true
  },
  {
    id: "monorepo-turbo",
    aliases: ["monorepo", "turbo"],
    description: "Monorepo and Turbo orchestration context.",
    implemented: false
  }
];
