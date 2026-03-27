import { Command } from "commander";

const program = new Command();

program
  .name("aicore")
  .description("AICore Unified Infrastructure CLI")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize AICore context")
  .action(() => {
    console.log("Initializing AICore context...");
  });

program.parse();
