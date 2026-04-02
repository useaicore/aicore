import * as path from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildProjectProfile, saveProfileCache } from "../services/repo.js";
import { safeWrite, createBatchResult, WriteStatus } from "../services/writer.js";
import { getContextFilePath, CORE_PATHS, INTEGRATIONS_DIR_NAME } from "../services/paths.js";
import { resolveTopic } from "../registry/resolve.js";
import { generateFromHook, generateOverview, generateStack, generateCodingTools, generatePrompts } from "../services/generators.js";
import { printSummary } from "../utils/summary.js";

/**
 * Logic for the 'aicore init' command.
 */
export async function initAction(options: { cwd: string; force?: boolean }) {
  const cwd = path.resolve(options.cwd);
  const force = !!options.force;

  console.log(`🔍 Inspecting workspace: ${cwd}...`);
  
  const profile = await buildProjectProfile(cwd);
  await saveProfileCache(cwd, profile);
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

  // 2. Scaffold Intelligence (Auto-detection prompts)
  const highValueIntegrations = ["stripe", "cloudflare-worker", "openai", "anthropic"];
  const detectedSlugs = highValueIntegrations.filter(slug => 
    profile.aiProviders.includes(slug as any) || 
    profile.billing.includes(slug as any) ||
    profile.infra.includes(slug as any) ||
    (slug === "cloudflare-worker" && profile.deployment.includes("cloudflare-workers"))
  );

  if (detectedSlugs.length > 0) {
    const rl = readline.createInterface({ input, output });
    
    for (const slug of detectedSlugs) {
      console.log(`\n✨ Detected ${slug}!`);
      const resolution = resolveTopic(slug);
      if (resolution.ok) {
        const { entry } = resolution;
        let answer = "";
        if (entry.optionalQuestion) {
          console.log(`🤖 SC_INTEL: ${entry.optionalQuestion}`);
          answer = await rl.question("> ");
        }

        const targetFolder = getContextFilePath(cwd, INTEGRATIONS_DIR_NAME, entry.slug);
        const targetPath = path.join(targetFolder, "overview.md");
        const content = generateFromHook(entry, answer);
        
        const status = await safeWrite(targetPath, content, { force });
        stats[`integrations/${entry.slug}/overview.md`] = status;
      }
    }
    rl.close();
  }

  const result = createBatchResult(stats);
  printSummary(profile, result.stats);
}
