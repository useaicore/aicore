import * as path from "node:path";
import { ProjectProfile } from "./types.js";
import { safeWrite } from "./utils/fs-utils.js";

/**
 * Generates thin integration-specific note files.
 */
export async function generateIntegrationContext(
  cwd: string,
  profile: ProjectProfile,
  options: { force?: boolean } = {}
): Promise<Record<string, string>> {
  const integrationsDir = path.join(cwd, ".aicorecontext", "integrations");
  const stats: Record<string, string> = {};

  // 1. Stripe
  if (profile.billing.includes("stripe")) {
    const content = `# Stripe Billing Context
- **Usage**: Payment processing and subscription management.
- **Verification**: Ensure \`STRIPE_SECRET_KEY\` and webhook secrets are configured.
- [Official Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
`;
    stats["integrations/stripe.md"] = await safeWrite(path.join(integrationsDir, "stripe.md"), content, options);
  }

  // 2. Supabase
  if (profile.infra.includes("supabase")) {
    const content = `# Supabase Context
- **Usage**: Database (PostgreSQL), Auth, and Storage.
- **Verification**: Check \`SUPABASE_URL\` and \`SUPABASE_ANON_KEY\`.
- [Official Docs](https://supabase.com/docs)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
`;
    stats["integrations/supabase.md"] = await safeWrite(path.join(integrationsDir, "supabase.md"), content, options);
  }

  // 3. Cloudflare Worker
  if (profile.deployment.includes("cloudflare-workers")) {
    const content = `# Cloudflare Worker Context
- **Usage**: Edge-side logic and API proxying.
- **Deployment**: Handled via \`wrangler deploy\`.
- **Note**: The execution environment is Edge-based (V8), not standard Node.js.
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Cloudflare Workers Runtime API](https://developers.cloudflare.com/workers/runtime-apis/)
`;
    stats["integrations/cloudflare-worker.md"] = await safeWrite(path.join(integrationsDir, "cloudflare-worker.md"), content, options);
  }

  // 4. Redis/BullMQ
  if (profile.queues.includes("bullmq")) {
    const content = `# Redis & BullMQ Workflow Context
- **Usage**: Distributed job queues for async background processing.
- **Verification**: Ensure \`REDIS_URL\` connectivity.
- **Pattern**: Most jobs are defined in \`packages/logger\` and consumed via a dedicated worker process.
- [BullMQ Docs](https://docs.bullmq.io/)
`;
    stats["integrations/redis-bullmq.md"] = await safeWrite(path.join(integrationsDir, "redis-bullmq.md"), content, options);
  }

  // 5. OpenAI
  if (profile.aiProviders.includes("openai")) {
    const content = `# OpenAI Integration Context
- **Usage**: LLM capabilities (GPT-4o, GPT-3.5).
- **Verification**: Ensure \`OPENAI_API_KEY\` is configured.
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
`;
    stats["integrations/openai.md"] = await safeWrite(path.join(integrationsDir, "openai.md"), content, options);
  }

  // 6. Anthropic
  if (profile.aiProviders.includes("anthropic")) {
    const content = `# Anthropic Integration Context
- **Usage**: LLM capabilities (Claude series).
- **Verification**: Ensure \`ANTHROPIC_API_KEY\` is configured.
- [Anthropic Console](https://console.anthropic.com/)
`;
    stats["integrations/anthropic.md"] = await safeWrite(path.join(integrationsDir, "anthropic.md"), content, options);
  }

  return stats;
}
