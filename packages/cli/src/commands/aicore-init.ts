import { Command } from "commander";
import { intro, outro, text, confirm, cancel, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { readFile, writeFile, mkdir, appendFile } from "fs/promises";
import path from "path";
import { setKey } from "../utils/credentials.js";

interface AicoreConfig {
  endpoint: string;
  workspace_id: string;
  key_prefix: string;
  environment: string;
  created_at: string;
}

export function aicoreInitCommand(): Command {
  return new Command("aicore-init")
    .description("Connect this workspace to an AICore endpoint")
    .action(async () => {
      intro(pc.bgCyan(pc.black(" aicore init ")));

      // --- Prompt for endpoint ---
      const endpointRaw = await text({
        message: "Enter your AICore endpoint URL",
        placeholder: "https://my-worker.workers.dev",
        validate: (val) => (!val || !val.startsWith("http")) ? "Please enter a valid URL starting with http" : undefined,
      });

      if (isCancel(endpointRaw)) { cancel("Setup cancelled."); process.exit(0); }

      const normalizedEndpoint = (endpointRaw as string).replace(/\/$/, "");

      // --- Prompt for API key ---
      const apiKey = await text({
        message: "Enter your AICore API key",
        placeholder: "ak_live_... or ak_test_...",
        validate: (val) =>
          (!val.startsWith("ak_live_") && !val.startsWith("ak_test_"))
            ? "Key must start with ak_live_ or ak_test_"
            : undefined,
      });

      if (isCancel(apiKey)) { cancel("Setup cancelled."); process.exit(0); }

      const keyString = apiKey as string;

      // --- Overwrite check ---
      const configPath = path.join(process.cwd(), ".aicore", "config.json");
      let existingConfig: AicoreConfig | null = null;

      try {
        const raw = await readFile(configPath, "utf8");
        existingConfig = JSON.parse(raw) as AicoreConfig;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
          console.warn(pc.yellow("Warning: Existing config.json is malformed, will overwrite."));
        }
        // ENOENT = file doesn't exist, that's fine
      }

      if (existingConfig) {
        const shouldOverwrite = await confirm({
          message: `⚠ An existing AICore config was found (workspace: ${existingConfig.workspace_id}). Overwrite it?`,
          initialValue: false,
        });

        if (isCancel(shouldOverwrite) || !shouldOverwrite) {
          cancel("Keeping existing configuration.");
          process.exit(0);
        }
      }

      // --- Verify key against health endpoint ---
      const s = spinner();
      s.start("Verifying key against endpoint...");

      let res: Response | undefined;
      try {
        res = await fetch(`${normalizedEndpoint}/v1/health`, {
          headers: { "x-aicore-key": keyString },
        });
      } catch {
        s.stop("Network error");
        console.error(pc.red("Endpoint unreachable. Check the URL and try again."));
        process.exit(1);
      }

      if (!res || !res.ok) {
        s.stop("Verification failed");
        console.error(pc.red(`Health check failed: ${res?.status ?? "network error"}. Check your API key and endpoint.`));
        process.exit(1);
      }

      const health = await res.json() as {
        workspace_id: string;
        key_prefix: string;
        environment: string;
        plan_tier: string;
      };

      s.stop(pc.green("Key verified ✓"));

      // --- Write config.json (non-sensitive) ---
      const config: AicoreConfig = {
        endpoint: normalizedEndpoint,   // ← JSON key is "endpoint", value is the normalized variable
        workspace_id: health.workspace_id,
        key_prefix: health.key_prefix,
        environment: health.environment,
        created_at: new Date().toISOString(),
      };

      await mkdir(path.join(process.cwd(), ".aicore"), { recursive: true });
      await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");

      // --- Store key securely ---
      await setKey(health.key_prefix, keyString);

      // --- Update .gitignore ---
      try {
        const existing = await readFile(".gitignore", "utf8");
        if (!existing.split("\n").some((l: string) => l.trim() === ".aicore/")) {
          await appendFile(".gitignore", "\n.aicore/\n");
        }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          await writeFile(".gitignore", ".aicore/\n");
        }
        // Other errors silently ignored — gitignore is non-critical
      }

      outro(pc.green("AICore initialized successfully!"));
    });
}
