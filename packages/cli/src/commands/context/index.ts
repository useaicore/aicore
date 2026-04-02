import { Command } from "commander";
import { addAction } from "./add.js";

/**
 * Registers the 'context' command group.
 */
export function registerContextCommands(program: Command) {
  const context = program
    .command("context")
    .description("Manage AICore context packs");

  context
    .command("add <topic>")
    .description("Add a specific context pack for a technology (e.g. stripe, openai)")
    .option("--cwd <path>", "Target directory", process.cwd())
    .option("--force", "Overwrite existing context pack")
    .action(async (topic, options) => {
      await addAction(topic, options);
    });
}
