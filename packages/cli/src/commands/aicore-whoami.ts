import { Command } from "commander";
import pc from "picocolors";
import { readFile } from "fs/promises";
import path from "path";
import { getKey } from "../utils/credentials.js";

interface AicoreConfig {
  endpoint: string;
  workspace_id: string;
  key_prefix: string;
  environment: string;
  created_at: string;
}

export function aicoreWhoamiCommand(): Command {
  return new Command("whoami")
    .description("Show the current AICore workspace identity")
    .action(async () => {
      // --- Read config.json ---
      const configPath = path.join(process.cwd(), ".aicore", "config.json");
      let config: AicoreConfig | undefined;

      try {
        const raw = await readFile(configPath, "utf8");
        config = JSON.parse(raw) as AicoreConfig;
      } catch {
        console.error(pc.red("No AICore config found. Run aicore aicore-init to get started."));
        process.exit(1);
      }

      if (!config) {
        // TypeScript control-flow narrowing guard (unreachable at runtime)
        process.exit(1);
      }

      // --- Retrieve API key ---
      const key = await getKey(config.key_prefix);

      if (!key) {
        console.error(pc.red("No stored key found. Run aicore aicore-init to reconfigure."));
        process.exit(1);
      }

      // --- Call health endpoint (two-layer error handling) ---
      let res: Response | undefined;
      try {
        res = await fetch(`${config.endpoint}/v1/health`, {
          headers: { "x-aicore-key": key },
        });
      } catch {
        console.error(pc.red("Endpoint unreachable. Check your config or re-run aicore aicore-init."));
        process.exit(1);
      }

      if (!res || !res.ok) {
        console.error(pc.red(`Health check failed: ${res?.status ?? "network error"}. Try running aicore aicore-init again.`));
        process.exit(1);
      }

      const health = await res.json() as {
        workspace_id: string;
        plan_tier: string;
        key_prefix: string;
        environment: string;
      };

      // --- Formatted table output ---
      // health fields: workspace_id, plan_tier, key_prefix, environment — from API response
      // endpoint — from config.endpoint (local config file, not health response)
      console.log("");
      console.log(`  ${pc.gray("Workspace ID")}   ${health.workspace_id}`);
      console.log(`  ${pc.gray("Environment")}    ${health.environment}`);
      console.log(`  ${pc.gray("Plan")}           ${health.plan_tier}`);
      console.log(`  ${pc.gray("Key Prefix")}     ${health.key_prefix}`);
      console.log(`  ${pc.gray("Endpoint")}       ${config.endpoint}`);
      console.log("");
    });
}
