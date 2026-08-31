import * as p from "@clack/prompts";
import pc from "picocolors";
import { generateProject } from "../scaffold/index.js";
import type { CLIOptions, DatabaseEngine, FrontendFramework, ScaffoldOptions } from "../types.js";

const VALID_DATABASES: readonly DatabaseEngine[] = ["gorm", "mongo"];
const VALID_FRONTENDS: readonly FrontendFramework[] = ["nextjs", "tauri", "react", "api-only"];

function isValidDatabase(val: string): val is DatabaseEngine {
  return (VALID_DATABASES as readonly string[]).includes(val);
}

function isValidFrontend(val: string): val is FrontendFramework {
  return (VALID_FRONTENDS as readonly string[]).includes(val);
}

export async function handleNewCommand(projectNameArg: string | undefined, options: CLIOptions): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" ⚡ Amoeba Framework Scaffolder ")));

  let projectName = projectNameArg;

  if (!projectName) {
    const namePrompt = await p.text({
      message: "What is your project name?",
      placeholder: "my-amoeba-app",
      validate(value) {
        if (!value || value.trim().length === 0) {
          return "Project name cannot be empty";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value.trim())) {
          return "Project name can only contain letters, numbers, hyphens, and underscores";
        }
        return undefined;
      },
    });

    if (p.isCancel(namePrompt)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    projectName = namePrompt.trim();
  }

  let database: DatabaseEngine | undefined = undefined;
  if (options.db && isValidDatabase(options.db)) {
    database = options.db;
  }

  if (!database) {
    const dbPrompt = await p.select({
      message: "Select Database Engine",
      options: [
        { value: "gorm" as const, label: "PostgreSQL (GORM ORM)", hint: "Relational database with schema migrations" },
        { value: "mongo" as const, label: "MongoDB (Official Go Driver v2)", hint: "NoSQL document database" },
      ],
    });

    if (p.isCancel(dbPrompt)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    database = dbPrompt;
  }

  let frontend: FrontendFramework | undefined = undefined;
  if (options.frontend && isValidFrontend(options.frontend)) {
    frontend = options.frontend;
  }

  if (!frontend) {
    const fePrompt = await p.select({
      message: "Select Frontend Framework",
      options: [
        { value: "nextjs" as const, label: "Next.js 15 (App Router + Tailwind CSS)", hint: "Fullstack React framework" },
        { value: "tauri" as const, label: "Tauri 2.0 (Rust Desktop + React/Vite)", hint: "Lightweight cross-platform desktop app" },
        { value: "react" as const, label: "React (Vite + TypeScript + Tailwind)", hint: "Fast client-side SPA" },
        { value: "api-only" as const, label: "API Only (Pure Go Fiber Backend)", hint: "Headless backend service" },
      ],
    });

    if (p.isCancel(fePrompt)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    frontend = fePrompt;
  }

  const scaffoldOptions: ScaffoldOptions = {
    projectName,
    database,
    frontend,
  };

  const s = p.spinner();
  s.start(`Generating Amoeba project: ${pc.cyan(projectName)}...`);

  try {
    await generateProject(scaffoldOptions);
    s.stop(`Project scaffolded successfully!`);

    const targetDir = frontend === "tauri" ? "apps/desktop" : "apps/web";
    const nextSteps = [
      `cd ${projectName}`,
      `cd apps/api && go run ./cmd/server/main.go`,
      ...(frontend !== "api-only" ? [`cd ../${targetDir} && pnpm install && pnpm dev`] : []),
    ];

    p.note(nextSteps.join("\n"), "Next steps:");
    p.outro(pc.green("✔ Happy hacking with Amoeba!"));
  } catch (err) {
    s.stop("Failed to generate project.");
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
