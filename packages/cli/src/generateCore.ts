import * as path from "node:path";
import { ProjectProfile } from "./types.js";
import { safeWrite } from "./utils/fs-utils.js";

/**
 * Generates the core context files in .aicorecontext/.
 */
export async function generateCoreContext(
  cwd: string,
  profile: ProjectProfile,
  options: { force?: boolean } = {}
): Promise<Record<string, string>> {
  const contextDir = path.join(cwd, ".aicorecontext");
  const stats: Record<string, string> = {};

  // 1. overview.md
  const overview = `# AICore Project Overview: ${profile.projectName}

## Project Summary
This project is a **${profile.appKind}** using **${profile.packageManager}**.
${profile.appKind === "monorepo-root" ? "It is a monorepo containing several sub-packages and apps." : ""}
${profile.deployment.includes("cloudflare-workers") ? "It deploys to Cloudflare Workers via Wrangler." : ""}
${profile.frameworks.length > 0 ? `Primary frameworks: ${profile.frameworks.join(", ")}.` : ""}

## AI Capabilities
- **Providers**: ${profile.aiProviders.length > 0 ? profile.aiProviders.join(", ") : "None detected yet."}
- **Frameworks**: ${profile.aiFrameworks.length > 0 ? profile.aiFrameworks.join(", ") : "None detected yet."}

**Describe the main AI features here:**
- [ ] Feature 1: ...
- [ ] Feature 2: ...

## Key Systems
- **Infrastructure**: ${profile.infra.join(", ") || "Standard Node.js"}
- **Data**: ${profile.data.join(", ") || "N/A"}
- **Messaging/Queues**: ${profile.queues.join(", ") || "N/A"}
- **Auth**: ${profile.auth.join(", ") || "N/A"}

## Open Questions
- [ ] What are the primary AI use cases?
- [ ] Are there specific non-functional constraints (latency, cost, privacy)?
- [ ] How should the AI assistant handle sensitive data?
`;
  stats["overview.md"] = await safeWrite(path.join(contextDir, "overview.md"), overview, options);

  // 2. stack.md
  let stack = `# Technology Stack

| Category | Technology |
| :--- | :--- |
| **Package Manager** | ${profile.packageManager} |
| **Runtime** | ${profile.runtime} |
| **App Kind** | ${profile.appKind} |
| **Deployment** | ${profile.deployment.join(", ") || "N/A"} |
| **Data / ORM** | ${profile.data.join(", ") || "N/A"} |
| **Auth** | ${profile.auth.join(", ") || "N/A"} |
| **Billing** | ${profile.billing.join(", ") || "N/A"} |
`;

  if (profile.packages && profile.packages.length > 0) {
    stack += `\n## Monorepo Packages\n\n| Package | Path | Kind |\n| :--- | :--- | :--- |\n`;
    for (const pkg of profile.packages) {
      stack += `| ${pkg.name} | \`${pkg.path}\` | ${pkg.kind} |\n`;
    }
  }

  stack += `\n## Detection Signals
${Object.entries(profile.signals)
    .filter(([_, v]) => v === true)
    .map(([k, _]) => `- \`${k}\`: Present`)
    .join("\n")}
`;
  stats["stack.md"] = await safeWrite(path.join(contextDir, "stack.md"), stack, options);

  // 3. workflow/coding-tools.md
  const workflowDir = path.join(contextDir, "workflow");
  const pm = profile.packageManager === "unknown" ? "npm" : profile.packageManager;
  const codingTools = `# Coding Tools & Workflow

## Getting Started
- **Install**: \`${pm} install\`
- **Development**: \`${pm} run dev\`
- **Build**: \`${pm} run build\`
- **Test**: \`${pm} run test\`

## Development Patterns
${profile.appKind === "monorepo-root" ? "- This is a monorepo. Use `turbo` or `pnpm` workspace commands for orchestration.\n- Shared logic typically resides in `packages/`, while entry points are in `apps/` or `packages/worker`." : "- This is a single-package project. Standard entry points apply."}

## Operational Notes
${profile.deployment.includes("cloudflare-workers") ? "- **Cloudflare**: Use `wrangler` for local dev and secrets management. Remember that the environment is **Edge (Workerd)**, not full Node.js." : ""}
${profile.infra.includes("supabase") ? "- **Supabase**: Ensure RLS (Row Level Security) is considered when adding new tables." : ""}
${profile.queues.includes("bullmq") ? "- **Queues**: Background tasks are handled by BullMQ. Avoid blocking the main event loop." : ""}
`;
  stats["workflow/coding-tools.md"] = await safeWrite(path.join(workflowDir, "coding-tools.md"), codingTools, options);

  // 4. workflow/prompts.md
  let prompts = `# AI Prompt Templates

## Project Context
"Help me understand this project's architecture based on the .aicorecontext/ files and the following source files: ..."

## Feature Implementation
"I want to add a feature to [module]. Based on the stack ( ${profile.frameworks.join(", ")} ), how should I structure the new logic?"

`;
  if (profile.aiProviders.includes("openai")) {
    prompts += `## OpenAI Integration\n"Refactor the OpenAI integration to use AICore's SDK and Worker proxy if applicable."\n\n`;
  }
  if (profile.deployment.includes("cloudflare-workers")) {
    prompts += `## Cloudflare Workers\n"Trace the flow of a request through the Worker and suggest error handling for Edge-specific constraints."\n\n`;
  }
  if (profile.queues.includes("bullmq")) {
    prompts += `## Background Jobs\n"Audit the BullMQ job definitions for retries and visibility timeouts."\n\n`;
  }

  stats["workflow/prompts.md"] = await safeWrite(path.join(workflowDir, "prompts.md"), prompts, options);

  return stats;
}
