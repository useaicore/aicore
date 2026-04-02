import { ProjectProfile } from "../services/repo.js";

/**
 * Prints a summary of the aicore init run.
 */
export function printSummary(
  profile: ProjectProfile,
  results: Record<string, string>
): void {
  console.log(`\n✅ AICore Context Initialized: ${profile.projectName}`);
  
  const detected = [
    profile.appKind,
    profile.packageManager,
    ...profile.frameworks,
    ...profile.aiProviders,
    ...profile.deployment,
  ].filter((s) => s !== "unknown");

  console.log(`📡 Detected: [ ${detected.join(", ")} ]`);
  
  const coreFiles = Object.entries(results).filter(([k]) => !k.startsWith("integrations/"));
  const optFiles  = Object.entries(results).filter(([k]) => k.startsWith("integrations/"));

  console.log(`\n📄 Created Core Files:`);
  for (const [file, status] of coreFiles) {
    const icon = status === "created" ? "🆕" : status === "overwritten" ? "🔄" : "⏭️";
    console.log(`  ${icon} ${file} (${status})`);
  }

  if (optFiles.length > 0) {
    console.log(`\n📘 Created Integration Notes:`);
    for (const [file, status] of optFiles) {
      const icon = status === "created" ? "🆕" : status === "overwritten" ? "🔄" : "⏭️";
      console.log(`  ${icon} ${file} (${status})`);
    }
  }

  console.log(`\nNext: You can now edit .aicorecontext/ and use it in your prompts.`);
}
