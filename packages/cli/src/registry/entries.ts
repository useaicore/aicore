import { ContextRegistryEntry } from "./types.js";

/**
 * Initial set of supported context topics (Placeholders for now).
 */
export const TOPICS: ContextRegistryEntry[] = [
  {
    slug: "openai",
    aliases: ["ai", "chatgpt", "gpt"],
    kind: "provider",
    detectionHints: ["openai"],
    generatorHook: "openai",
    description: "OpenAI integration context (API keys, models, SDK usage).",
    optionalQuestion: "What is your primary AI use case? (chat, embeddings, extraction)",
    implemented: true
  },
  {
    slug: "anthropic",
    aliases: ["claude"],
    kind: "provider",
    detectionHints: ["@anthropic-ai/sdk"],
    generatorHook: "anthropic",
    description: "Anthropic integration context (Claude models, SDK).",
    implemented: true
  },
  {
    slug: "gemini",
    aliases: ["google-ai"],
    kind: "provider",
    detectionHints: ["@google/generative-ai"],
    generatorHook: "gemini",
    description: "Google Gemini integration context.",
    implemented: true
  },
  {
    slug: "stripe",
    aliases: ["billing", "payments"],
    kind: "billing",
    detectionHints: ["stripe"],
    optionalQuestion: "What are you adding first? (Subscriptions, Payments, Connect)",
    generatorHook: "stripe",
    description: "Stripe billing and subscription context.",
    implemented: true
  },
  {
    slug: "supabase",
    aliases: ["database", "db", "auth"],
    kind: "infra",
    detectionHints: ["@supabase/supabase-js"],
    generatorHook: "supabase",
    description: "Supabase infrastructure context (Postgres, Auth).",
    implemented: true
  },
  {
    slug: "cloudflare-worker",
    aliases: ["worker", "edge", "wrangler"],
    kind: "deployment",
    detectionHints: ["wrangler.toml", "wrangler"],
    generatorHook: "cloudflare-worker",
    description: "Cloudflare Worker deployment and runtime context.",
    optionalQuestion: "Are you deploying an API proxy, scheduled worker, or webhook handler?",
    implemented: true
  },
  {
    slug: "redis-bullmq",
    aliases: ["queues", "jobs", "bullmq"],
    kind: "queue",
    detectionHints: ["bullmq", "ioredis"],
    generatorHook: "redis-bullmq",
    description: "Redis and BullMQ background processing context.",
    implemented: true
  }
];
