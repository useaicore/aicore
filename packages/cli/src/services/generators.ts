import { type ProjectProfile } from "@aicore/types";
import { ContextRegistryEntry } from "../registry/types.js";
import { generateStripeContext } from "./generators/stripe.js";
import { generateCloudflareContext } from "./generators/cloudflare.js";
import { generateOpenAIContext } from "./generators/openai.js";

/**
 * Service for generating markdown content for various context files.
 */

// --- Registry Coordinator ---

/**
 * Routes a generation request to the specialized generator based on the hook.
 */
export function generateFromHook(entry: ContextRegistryEntry, answer: string = ""): string {
  switch (entry.generatorHook) {
    case "stripe":
      return generateStripeContext(entry, answer);
    case "cloudflare-worker":
      return generateCloudflareContext(entry, answer);
    case "openai":
      return generateOpenAIContext(entry, answer);
    default:
      return generateIntegrationStub(entry);
  }
}

// --- Core Generators ---

export function generateOverview(profile: ProjectProfile): string {
  return `# AICore Project Overview: ${profile.projectName}

## Project Summary
This project is a **${profile.appKind}** using **${profile.packageManager}**.
${profile.appKind === "monorepo-root" ? "It is a monorepo containing several sub-packages and apps." : ""}
${profile.deployment.includes("cloudflare-workers") ? "It deploys to Cloudflare Workers." : ""}
${profile.frameworks.length > 0 ? `Primary frameworks: ${profile.frameworks.join(", ")}.` : ""}

## AI Capabilities
- **Providers**: ${profile.aiProviders.join(", ") || "None detected yet."}

**Describe the main AI features here:**
- [ ] Feature 1: ...
`;
}

export function generateStack(profile: ProjectProfile): string {
  let stack = `# Technology Stack

| Category | Technology |
| :--- | :--- |
| **Package Manager** | ${profile.packageManager} |
| **App Kind** | ${profile.appKind} |
| **Deployment** | ${profile.deployment.join(", ") || "N/A"} |
`;

  if (profile.packages && profile.packages.length > 0) {
    stack += `\n## Monorepo Packages\n\n| Package | Path | Kind |\n| :--- | :--- | :--- |\n`;
    for (const pkg of profile.packages) {
      stack += `| ${pkg.name} | \`${pkg.path}\` | ${pkg.kind} |\n`;
    }
  }

  return stack;
}

export function generateCodingTools(profile: ProjectProfile): string {
  return `# Coding Tools & Workflow
- **Development**: \`${profile.packageManager} run dev\`
- **Build**: \`${profile.packageManager} run build\`
`;
}

export function generatePrompts(profile: ProjectProfile): string {
  return `# AI Prompt Templates for ${profile.projectName}
"Help me understand this project's architecture based on the .aicorecontext/ files."
`;
}

/**
 * Default placeholder for non-specialized integration topics.
 */
export function generateIntegrationStub(entry: ContextRegistryEntry): string {
  return `# ${entry.slug} - Context Pack

Generated placeholder for: ${entry.description}

## Usage Checklist
- [ ] Configure environment variables.
- [ ] Add project-specific architecture notes.
- [ ] Link relevant internal documentation.

[Official Documentation](https://google.com)
`;
}
