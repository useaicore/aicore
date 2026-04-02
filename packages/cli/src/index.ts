import { Command } from "commander";
import { initAction } from "./commands/init.js";
import { registerContextCommands } from "./commands/context/index.js";

const program = new Command();

program
  .name("aicore")
  .description("AICore Unified Infrastructure CLI")
  .version("0.1.0");

// 1. Initial workspace setup
program
  .command("init")
  .description("Initialize AICore context for this workspace")
  .option("--yes", "Run non-interactively with sensible defaults")
  .option("--force", "Overwrite existing context files")
  .option("--cwd <path>", "Target directory", process.cwd())
  .action(async (options) => {
    await initAction(options);
  });

// 2. Context management group
registerContextCommands(program);

program.parse();
