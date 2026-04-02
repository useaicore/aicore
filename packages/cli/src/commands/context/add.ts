import * as path from "node:path";
import { resolveTopic } from "../../registry/resolve.js";
import { safeWrite } from "../../services/writer.js";
import { getContextFilePath, INTEGRATIONS_DIR_NAME } from "../../services/paths.js";

/**
 * Logic for the 'aicore context add <topic>' command.
 */
export async function addAction(topic: string, options: { cwd: string; force?: boolean }) {
  const cwd = path.resolve(options.cwd);
  const force = !!options.force;

  console.log(`🔍 Resolving topic: "${topic}"...`);
  
  const resolution = resolveTopic(topic);
  
  if (!resolution.ok) {
    console.error(`❌ ${resolution.error}`);
    if (resolution.suggestions) {
      console.log(`💡 Did you mean: ${resolution.suggestions.join(", ")}?`);
    }
    process.exit(1);
  }

  const { entry } = resolution;
  console.log(`✅ Found: ${entry.id} (${entry.description})`);

  if (!entry.implemented) {
    console.log(`⚠️  The generator for "${entry.id}" is recognized but not fully implemented yet.`);
    console.log(`💡 A fallback stub will be created in .aicorecontext/integrations/${entry.id}.md`);
  }

  // Placeholder Generation
  const targetPath = getContextFilePath(cwd, INTEGRATIONS_DIR_NAME, `${entry.id}.md`);
  const content = `# ${entry.id} - Context Pack\n\nGenerated placeholder for: ${entry.description}\n\n- [ ] TODO: Fill in details...`;

  const status = await safeWrite(targetPath, content, { force });

  if (status === "skipped") {
    console.log(`⏭️  Skipped: ${entry.id}.md (Already exists)`);
  } else {
    const icon = status === "created" ? "🆕" : "🔄";
    console.log(`${icon} Created: .aicorecontext/integrations/${entry.id}.md (${status})`);
  }
}
