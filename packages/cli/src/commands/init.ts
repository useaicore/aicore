import * as path from "node:path";
import { buildProjectProfile } from "../services/repo.js";
import { safeWrite, createBatchResult, WriteStatus } from "../services/writer.js";
import { getContextFilePath, CORE_PATHS, INTEGRATIONS_DIR_NAME } from "../services/paths.js";
import { ProjectProfile } from "../services/repo.js";
import { printSummary } from "../utils/summary.js";

/**
 * Logic for the 'aicore init' command.
 */
export async function initAction(options: { cwd: string; force?: boolean }) {
  const cwd = path.resolve(options.cwd);
  const force = !!options.force;

  console.log(`🔍 Inspecting workspace: ${cwd}...`);
  
  const profile = await buildProjectProfile(cwd);
  const stats: Record<string, WriteStatus> = {};

  // 1. Generate Core Files
  stats["overview.md"] = await safeWrite(
    getContextFilePath(cwd, ...CORE_PATHS.OVERVIEW as any), 
    generateOverview(profile), 
    { force }
  );
  
  stats["stack.md"] = await safeWrite(
    getContextFilePath(cwd, ...CORE_PATHS.STACK as any), 
    generateStack(profile), 
    { force }
  );

  stats["workflow/coding-tools.md"] = await safeWrite(
    getContextFilePath(cwd, ...CORE_PATHS.CODING_TOOLS as any), 
    generateCodingTools(profile), 
    { force }
  );

  stats["workflow/prompts.md"] = await safeWrite(
    getContextFilePath(cwd, ...CORE_PATHS.PROMPTS as any), 
    generatePrompts(profile), 
    { force }
  );

  // 2. Generate Integration Notes (if detected)
  if (profile.billing.includes("stripe")) {
    stats["integrations/stripe.md"] = await safeWrite(
      getContextFilePath(cwd, INTEGRATIONS_DIR_NAME, "stripe.md"),
      `# Stripe Billing Context\n...`,
      { force }
    );
  }
  // (Other integrations omitted for brevity in this refactor pass, as per "minimal stubs")

  const result = createBatchResult(stats);
  printSummary(profile, result.stats);
}

// --- Helper Templates (Extracted from previous generateCore.ts) ---

function generateOverview(profile: ProjectProfile) {
  return `# AICore Project Overview: ${profile.projectName}\nFound ${profile.appKind} with ${profile.packageManager}.`;
}

function generateStack(profile: ProjectProfile) {
  return `# Technology Stack\n${profile.frameworks.join(", ")}`;
}

function generateCodingTools(profile: ProjectProfile) {
  return `# Coding Tools & Workflow\n${profile.packageManager} run dev`;
}

function generatePrompts(profile: ProjectProfile) {
  return `# AI Prompt Templates\nStack: ${profile.frameworks.join(", ")}`;
}
