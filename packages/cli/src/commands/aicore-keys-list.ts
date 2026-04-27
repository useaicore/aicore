import { Command } from "commander";
import pc from "picocolors";
import { readFile } from "fs/promises";
import path from "path";

interface KeyRow {
  id: string;
  key_prefix: string;
  name: string;
  environment: string;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

export function aicoreKeysListCommand(): Command {
  // Returns a parent "keys" command with "list" as a sub-command
  return new Command("keys")
    .description("Manage AICore API keys")
    .addCommand(
      new Command("list")
        .description("List active API keys for this workspace")
        .action(async () => {
          const configPath = path.join(process.cwd(), ".aicore", "config.json");
          let config: { endpoint: string; workspace_id: string } | undefined;

          try {
            config = JSON.parse(await readFile(configPath, "utf8"));
          } catch {
            console.error(pc.red("No AICore config found. Run aicore aicore-init first."));
            process.exit(1);
          }

          if (!config) process.exit(1);

          const adminSecret = process.env["AICORE_ADMIN_SECRET"];
          if (!adminSecret) {
            console.error(pc.red("AICORE_ADMIN_SECRET env var is required. Set it and try again."));
            process.exit(1);
          }

          let res: Response | undefined;
          try {
            res = await fetch(
              `${config.endpoint}/v1/keys?workspace_id=${config.workspace_id}`,
              { headers: { "Authorization": `Bearer ${adminSecret}` } }
            );
          } catch {
            console.error(pc.red("Endpoint unreachable. Check your config or re-run aicore aicore-init."));
            process.exit(1);
          }

          if (!res || !res.ok) {
            console.error(pc.red(`Request failed: ${res?.status ?? "network error"}`));
            process.exit(1);
          }

          const { keys } = await res.json() as { keys: KeyRow[] };

          if (!keys.length) {
            console.log(pc.gray("\n  No active keys found.\n"));
            return;
          }

          // Table header
          const COL = { prefix: 20, name: 20, env: 14, uses: 8 };
          console.log("");
          console.log(
            "  " +
            pc.bold("KEY PREFIX".padEnd(COL.prefix)) +
            pc.bold("NAME".padEnd(COL.name)) +
            pc.bold("ENV".padEnd(COL.env)) +
            pc.bold("USES".padEnd(COL.uses)) +
            pc.bold("LAST USED")
          );
          console.log("  " + "─".repeat(72));

          for (const key of keys) {
            const lastUsed = key.last_used_at
              ? new Date(key.last_used_at).toLocaleString()
              : pc.gray("never");
            console.log(
              "  " +
              key.key_prefix.padEnd(COL.prefix) +
              key.name.padEnd(COL.name) +
              key.environment.padEnd(COL.env) +
              String(key.usage_count).padEnd(COL.uses) +
              lastUsed
            );
          }
          console.log("");
        })
    );
}
