import { Command } from "commander";
import pc from "picocolors";
import { readFile } from "fs/promises";
import path from "path";

interface LogRow {
  id: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
  latency_ms: number;
  is_error: boolean;
  created_at: string;
}

export function aicoreLogsCommand(): Command {
  return new Command("logs")
    .description("Show recent AI usage logs for this workspace")
    .option("--limit <n>", "Number of recent logs to show", "25")
    .action(async (options) => {
      const configPath = path.join(process.cwd(), ".aicore", "config.json");
      let config: { endpoint: string; workspace_id: string } | undefined;

      // Layer 1: Config loading
      try {
        config = JSON.parse(await readFile(configPath, "utf8"));
      } catch (err: any) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          console.error(pc.red("No AICore config found. Run aicore aicore-init first."));
        } else {
          console.error(pc.red(`Failed to read config: ${err.message}`));
        }
        process.exit(1);
      }

      if (!config) process.exit(1);

      // Layer 2: Admin secret check
      const adminSecret = process.env["AICORE_ADMIN_SECRET"];
      if (!adminSecret) {
        console.error(pc.red("AICORE_ADMIN_SECRET env var is required for viewing logs."));
        process.exit(1);
      }

      const limit = parseInt(options.limit, 10);
      const url = `${config.endpoint}/v1/logs?workspace_id=${config.workspace_id}&limit=${limit}`;

      let res: Response | undefined;
      // Layer 3: Network fetch
      try {
        res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${adminSecret}`,
          }
        });
      } catch (err: any) {
        console.error(pc.red(`Endpoint unreachable: ${err.message}`));
        process.exit(1);
      }

      // Layer 4: HTTP Status check
      if (!res.ok) {
        console.error(pc.red(`Request failed: ${res.status} ${res.statusText}`));
        process.exit(1);
      }

      let logs: LogRow[];
      try {
        const data = await res.json() as { logs: LogRow[] };
        logs = data.logs;
      } catch (err: any) {
        console.error(pc.red(`Invalid JSON response: ${err.message}`));
        process.exit(1);
      }

      if (!Array.isArray(logs)) {
        console.error(pc.red("Invalid response format received from server."));
        process.exit(1);
      }

      if (logs.length === 0) {
        console.log(pc.gray("\n  No usage logs found for this workspace.\n"));
        process.exit(0);
      }

      // Table Header Configuration
      const COL = {
        time: 22,
        provider: 12,
        model: 18,
        in: 6,
        out: 6,
        cost: 10,
        ms: 6
      };

      console.log("");
      console.log(
        "  " +
        pc.bold("TIMESTAMP".padEnd(COL.time)) +
        pc.bold("PROVIDER".padEnd(COL.provider)) +
        pc.bold("MODEL".padEnd(COL.model)) +
        pc.bold("IN".padEnd(COL.in)) +
        pc.bold("OUT".padEnd(COL.out)) +
        pc.bold("COST".padEnd(COL.cost)) +
        pc.bold("MS".padEnd(COL.ms)) +
        pc.bold("STATUS")
      );
      console.log("  " + "─".repeat(85));

      for (const log of logs) {
        const timeStr = new Date(log.created_at).toLocaleString().split('.')[0]; // basic toLocaleString usually doesn't have ms anyway
        const costStr = '$' + (log.cost_cents / 100).toFixed(4);
        const statusIcon = log.is_error ? pc.red("❌") : pc.green("✅");

        console.log(
          "  " +
          timeStr.padEnd(COL.time) +
          log.provider.padEnd(COL.provider) +
          log.model.substring(0, COL.model - 1).padEnd(COL.model) +
          String(log.input_tokens).padEnd(COL.in) +
          String(log.output_tokens).padEnd(COL.out) +
          costStr.padEnd(COL.cost) +
          String(log.latency_ms).padEnd(COL.ms) +
          " " + statusIcon
        );
      }
      console.log("");
      process.exit(0);
    });
}
