import * as p from "@clack/prompts";
import pc from "picocolors";
import { generateProject } from "../scaffold/index.js";
import { printBanner } from "../ui/banner.js";
import type {
  CLIOptions,
  DatabaseEngine,
  FrontendFramework,
  ScaffoldOptions,
  TauriFramework,
} from "../types.js";

const VALID_DATABASES: readonly DatabaseEngine[] = ["gorm", "mongo"];
const VALID_FRONTENDS: readonly FrontendFramework[] = ["nextjs", "tauri", "react", "api-only"];
const VALID_TAURI_TEMPLATES: readonly TauriFramework[] = [
  "react",
  "nextjs",
  "vue",
  "svelte",
  "solid",
  "vanilla",
];

const DB_LABELS: Record<DatabaseEngine, string> = {
  gorm: "PostgreSQL (GORM ORM)",
  mongo: "MongoDB (Official Go Driver v2)",
};

const FE_LABELS: Record<FrontendFramework, string> = {
  nextjs: "Next.js 15 (App Router + Tailwind CSS)",
  tauri: "Tauri 2.0 (Rust Desktop)",
  react: "React (Vite + TypeScript + Tailwind)",
  "api-only": "API Only (Pure Go Fiber Backend)",
  "tauri-react": "Tauri 2.0 (Rust + React)",
  "tauri-nextjs": "Tauri 2.0 (Rust + Next.js)",
  "tauri-vue": "Tauri 2.0 (Rust + Vue 3)",
  "tauri-svelte": "Tauri 2.0 (Rust + Svelte 5)",
  "tauri-solid": "Tauri 2.0 (Rust + SolidJS)",
  "tauri-vanilla": "Tauri 2.0 (Rust + Vanilla TS)",
  vue: "Vue 3",
  svelte: "Svelte 5",
  solid: "SolidJS",
};

const TAURI_TEMPLATE_LABELS: Record<TauriFramework, string> = {
  react: "React (Vite + TypeScript)",
  nextjs: "Next.js 15 (Static Export / SSG)",
  vue: "Vue 3 (Vite + TypeScript)",
  svelte: "Svelte 5 (Vite + TypeScript)",
  solid: "Solid (Vite + TypeScript)",
  vanilla: "Vanilla (Vite + TypeScript)",
};

function isValidDatabase(val: string): val is DatabaseEngine {
  return (VALID_DATABASES as readonly string[]).includes(val);
}

function isValidFrontend(val: string): val is FrontendFramework {
  return (VALID_FRONTENDS as readonly string[]).includes(val);
}

function isValidTauriTemplate(val: string): val is TauriFramework {
  return (VALID_TAURI_TEMPLATES as readonly string[]).includes(val);
}

export async function handleNewCommand(projectNameArg: string | undefined, options: CLIOptions): Promise<void> {
  // 1. Display ASCII Banner
  printBanner("0.1.0");

  p.intro(pc.bgCyan(pc.black(" ✨ Project Setup Wizard ")));

  // STEP 1: Project Name
  let projectName = projectNameArg;
  if (!projectName) {
    const namePrompt = await p.text({
      message: `${pc.bold(pc.cyan("[1/3]"))} What is the name of your project?`,
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
      p.cancel(pc.yellow("Project creation cancelled."));
      process.exit(0);
    }

    projectName = namePrompt.trim();
  } else {
    p.log.step(`${pc.bold(pc.cyan("[1/3]"))} Project Name: ${pc.green(projectName)}`);
  }

  // STEP 2: Database Engine
  let database: DatabaseEngine | undefined = undefined;
  if (options.db && isValidDatabase(options.db)) {
    database = options.db;
    p.log.step(`${pc.bold(pc.cyan("[2/3]"))} Database: ${pc.green(DB_LABELS[database])}`);
  }

  if (!database) {
    const dbPrompt = await p.select({
      message: `${pc.bold(pc.cyan("[2/3]"))} Choose your database engine:`,
      options: [
        {
          value: "gorm" as const,
          label: "PostgreSQL (GORM ORM)",
          hint: "Relational database with connection pooling and schema migrations",
        },
        {
          value: "mongo" as const,
          label: "MongoDB (Official Go Driver v2)",
          hint: "High-performance document storage with BSON support",
        },
      ],
    });

    if (p.isCancel(dbPrompt)) {
      p.cancel(pc.yellow("Project creation cancelled."));
      process.exit(0);
    }

    database = dbPrompt;
  }

  // STEP 3: Frontend Platform / Framework
  let frontend: FrontendFramework | undefined = undefined;
  if (options.frontend && isValidFrontend(options.frontend)) {
    frontend = options.frontend;
    p.log.step(`${pc.bold(pc.cyan("[3/3]"))} Frontend: ${pc.green(FE_LABELS[frontend])}`);
  }

  if (!frontend) {
    const fePrompt = await p.select({
      message: `${pc.bold(pc.cyan("[3/3]"))} Choose your frontend platform:`,
      options: [
        {
          value: "nextjs" as const,
          label: "Next.js 15 (App Router + Tailwind CSS)",
          hint: "Fullstack React framework with SSR and server actions",
        },
        {
          value: "tauri" as const,
          label: "Tauri 2.0 (Rust Desktop App)",
          hint: "Lightweight native desktop application powered by Rust",
        },
        {
          value: "react" as const,
          label: "React (Vite + TypeScript + Tailwind)",
          hint: "Fast Single Page Application with Hot Module Replacement",
        },
        {
          value: "api-only" as const,
          label: "API Only (Pure Go Fiber Backend)",
          hint: "Headless backend microservice without frontend scaffolding",
        },
      ],
    });

    if (p.isCancel(fePrompt)) {
      p.cancel(pc.yellow("Project creation cancelled."));
      process.exit(0);
    }

    frontend = fePrompt;
  }

  // STEP 3b: If Tauri is selected, prompt for UI framework flavor
  let tauriTemplate: TauriFramework | undefined = undefined;
  if (frontend === "tauri") {
    if (options.tauriTemplate && isValidTauriTemplate(options.tauriTemplate)) {
      tauriTemplate = options.tauriTemplate;
      p.log.step(`  ${pc.bold(pc.magenta("↳"))} Tauri UI: ${pc.green(TAURI_TEMPLATE_LABELS[tauriTemplate])}`);
    } else {
      const tauriPrompt = await p.select({
        message: `${pc.bold(pc.magenta("↳"))} Choose UI Framework for Tauri Desktop:`,
        options: [
          {
            value: "react" as const,
            label: "React (Vite + TypeScript)",
            hint: "Fast React Single Page Application inside Tauri",
          },
          {
            value: "nextjs" as const,
            label: "Next.js 15 (Static Export / SSG)",
            hint: "Static Next.js App Router bundled inside desktop window",
          },
          {
            value: "vue" as const,
            label: "Vue 3 (Vite + TypeScript)",
            hint: "Vue 3 Composition API inside Tauri",
          },
          {
            value: "svelte" as const,
            label: "Svelte 5 (Vite + TypeScript)",
            hint: "Hyper-lean reactive UI with Svelte 5 Runes",
          },
          {
            value: "solid" as const,
            label: "SolidJS (Vite + TypeScript)",
            hint: "Fine-grained reactive SolidJS frontend",
          },
          {
            value: "vanilla" as const,
            label: "Vanilla (Vite + TypeScript)",
            hint: "Clean minimal TypeScript without UI library bloat",
          },
        ],
      });

      if (p.isCancel(tauriPrompt)) {
        p.cancel(pc.yellow("Project creation cancelled."));
        process.exit(0);
      }

      tauriTemplate = tauriPrompt;
    }
  }

  // Summary Note
  const frontendSummary =
    frontend === "tauri" && tauriTemplate
      ? `Tauri 2.0 (Rust) + ${TAURI_TEMPLATE_LABELS[tauriTemplate]}`
      : FE_LABELS[frontend];

  const summary = [
    `${pc.bold("Target Directory:")} ./${projectName}`,
    `${pc.bold("Backend:")}          Go Fiber v3`,
    `${pc.bold("Database:")}         ${DB_LABELS[database]}`,
    `${pc.bold("Frontend:")}         ${frontendSummary}`,
  ].join("\n");

  p.note(summary, "Project Configuration");

  const scaffoldOptions: ScaffoldOptions = {
    projectName,
    database,
    frontend,
    tauriTemplate,
  };

  const s = p.spinner();
  s.start(`Scaffolding ${pc.bold(pc.cyan(projectName))}...`);

  try {
    await generateProject(scaffoldOptions);
    s.stop(pc.green(`✔ ${projectName} scaffolded successfully!`));

    const targetDir = frontend === "tauri" ? "apps/desktop" : "apps/web";
    const devCommand = frontend === "tauri" ? "pnpm tauri dev" : "pnpm dev";

    const nextSteps = [
      `cd ${projectName}`,
      `cd apps/api && go run ./cmd/server/main.go`,
      ...(frontend !== "api-only" ? [`cd ../${targetDir} && pnpm install && ${devCommand}`] : []),
    ];

    p.note(
      nextSteps
        .map((step, idx) => `${pc.dim(`${idx + 1}.`)} ${pc.cyan(step)}`)
        .join("\n"),
      "Next Steps"
    );

    p.outro(pc.bold(pc.green("⚡ Amoeba setup complete. Let's build!")));
  } catch (err) {
    s.stop(pc.red("✖ Failed to generate project."));
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
