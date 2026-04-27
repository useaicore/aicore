import { execSync } from 'child_process';

const secrets = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GROQ_API_KEY'
];

for (const key of secrets) {
  const value = process.env[key];
  if (!value) continue;
  console.log(`Uploading ${key}...`);
  execSync(`pnpm --filter @aicore/worker exec wrangler secret put ${key}`, {
    env: { ...process.env, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID },
    input: value.trim()
  });
}
console.log('All secrets uploaded cleanly!');
