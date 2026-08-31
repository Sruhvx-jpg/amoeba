import { Command } from "commander";
import { handleNewCommand } from "./commands/new.js";
import type { CLIOptions } from "./types.js";

const program = new Command();

program
  .name("amoeba")
  .description("⚡ Amoeba Framework CLI - Scaffolding fullstack Go + Frontend apps")
  .version("0.1.0");

program
  .command("new", { isDefault: true })
  .description("Create a new Amoeba project")
  .argument("[project-name]", "Name of the project")
  .option("-f, --frontend <frontend>", "Frontend framework (nextjs, tauri, react, api-only)")
  .option("-d, --db <database>", "Database engine (gorm, mongo)")
  .action(async (projectName: string | undefined, options: CLIOptions) => {
    await handleNewCommand(projectName, options);
  });

program.parse(process.argv);
