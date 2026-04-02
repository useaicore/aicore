import * as path from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolveTopic } from "../../registry/resolve.js";
import { safeWrite } from "../../services/writer.js";
import { exists } from "../../utils/fs-utils.js";
import { getContextDir, getContextFilePath, INTEGRATIONS_DIR_NAME } from "../../services/paths.js";
import { generateFromHook } from "../../services/generators.js";
import { buildProjectProfile } from "../../services/repo.js";

/**
 * Logic for the 'aicore context add <topic>' command.
 */
export async function addAction(topic: string, options: { cwd: string; force?: boolean }) {
  const cwd = path.resolve(options.cwd);
  const force = !!options.force;

  // 1. Resolve & Registry Check
  const resolution = resolveTopic(topic);
  if (!resolution.ok) {
    console.error(`❌ ${resolution.error}`);
    if (resolution.suggestions) {
      console.log(`💡 Did you mean: ${resolution.suggestions.join(", ")}?`);
    }
    process.exit(1);
  }

  const { entry } = resolution;
  console.log(`✅ Found "${entry.slug}" (${entry.description}).`);

  // 2. Pre-requisite Warning
  const contextDir = getContextDir(cwd);
  if (!(await exists(contextDir))) {
    console.log(`⚠️  Warning: No .aicorecontext/ found in this directory.`);
    const rl = readline.createInterface({ input, output });
    const reply = await rl.question("🤔 Do you want to initialize the base context first? (y/n) ");
    if (reply.toLowerCase().startsWith("y")) {
      rl.close();
      console.log("💡 Run 'aicore init' to get started.");
      return;
    }
    rl.close();
  }

  // 3. Advisory Detection
  console.log(`🔍 Checking repo signals...`);
  const profile = await buildProjectProfile(cwd);
  const isDetected = 
    profile.aiProviders.includes(entry.slug as any) || 
    profile.billing.includes(entry.slug as any) ||
    profile.infra.includes(entry.slug as any);

  if (isDetected) {
    console.log(`💡 Note: ${entry.slug} was already detected in your repo signals.`);
  } else {
    console.log(`💡 Note: ${entry.slug} was not detected yet, but we will still generate the context for you.`);
  }

  // 4. Scaffold Intelligence (Prompts)
  let answer = "";
  if (entry.optionalQuestion) {
    const rl = readline.createInterface({ input, output });
    console.log(`\n🤖 SC_INTEL: ${entry.optionalQuestion}`);
    answer = await rl.question("> ");
    rl.close();
  }

  // 5. Generation (Folder-based structure)
  const targetFolder = getContextFilePath(cwd, INTEGRATIONS_DIR_NAME, entry.slug);
  const targetPath = path.join(targetFolder, "overview.md");
  const content = generateFromHook(entry, answer);

  const status = await safeWrite(targetPath, content, { force });

  if (status === "skipped") {
    console.log(`\n⏭️  Skipped: .aicorecontext/integrations/${entry.slug}/overview.md (Already exists)`);
  } else {
    const icon = status === "created" ? "🆕" : "🔄";
    console.log(`\n${icon} Created: .aicorecontext/integrations/${entry.slug}/overview.md (${status})`);
  }
}
