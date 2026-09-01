use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(
    name = "amoeba",
    author = "dron",
    version = env!("CARGO_PKG_VERSION"),
    about = "⚡ Amoeba Proteus CLI - Rapid scaffolding, building & server engine for Go & TypeScript fullstack systems",
    long_about = "A high-performance CLI tool for scaffolding, building, and running production-ready fullstack architectures.\nSupports Go Fiber v3, TypeScript Express Modular REST, and tRPC Turborepo Monorepos."
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Scaffold a new Amoeba project or monorepo package
    New(NewArgs),
    /// Build project services (API backend, frontend, or both)
    Build(BuildArgs),
    /// Start development or server processes (API backend, frontend, or both)
    #[command(alias = "dev")]
    Start(StartArgs),
    /// Database management utilities (generate, migrate, studio)
    Db(DbArgs),
    /// Generate database migrations or schema artifacts (alias for 'db generate')
    Generate,
    /// Apply pending database schema migrations (alias for 'db migrate')
    Migrate,
    /// Open interactive database studio / GUI (alias for 'db studio')
    Studio,
    /// Check for Amoeba framework releases and upgrade project dependencies
    Update,
    /// Print version information
    Version,
}

#[derive(Parser, Debug)]
pub struct DbArgs {
    #[command(subcommand)]
    pub command: DbSubcommand,
}

#[derive(Subcommand, Debug, Clone)]
pub enum DbSubcommand {
    /// Generate database migrations or schema artifacts
    Generate,
    /// Apply pending database schema migrations
    Migrate,
    /// Open interactive database studio / GUI (Drizzle Studio)
    Studio,
}

#[derive(Parser, Debug, Default, Clone)]
pub struct BuildArgs {
    /// Build only the backend API service
    #[arg(long = "only-api", alias = "api", conflicts_with = "only_frontend")]
    pub only_api: bool,

    /// Build only the frontend application (web / desktop)
    #[arg(long = "only-frontend", alias = "only-fe", alias = "frontend", alias = "web", conflicts_with = "only_api")]
    pub only_frontend: bool,
}

#[derive(Parser, Debug, Default, Clone)]
pub struct StartArgs {
    /// Start only the backend API server
    #[arg(long = "only-api", alias = "api", conflicts_with = "only_frontend")]
    pub only_api: bool,

    /// Start only the frontend application (web / desktop)
    #[arg(long = "only-frontend", alias = "only-fe", alias = "frontend", alias = "web", conflicts_with = "only_api")]
    pub only_frontend: bool,

    /// Run in production mode
    #[arg(short, long)]
    pub prod: bool,
}

#[derive(Parser, Debug, Default)]
pub struct NewArgs {
    #[command(subcommand)]
    pub sub: Option<NewSubcommand>,

    /// Project name / directory name to create
    #[arg(value_name = "PROJECT_NAME")]
    pub project_name: Option<String>,

    /// Backend language (go, ts, typescript)
    #[arg(short, long)]
    pub lang: Option<String>,

    /// Architecture style for TypeScript (rest, trpc)
    #[arg(short, long)]
    pub arch: Option<String>,

    /// Database engine (gorm, mongo, drizzle, mongoose)
    #[arg(short, long)]
    pub db: Option<String>,

    /// Frontend framework (nextjs, react, tauri, api-only)
    #[arg(short, long)]
    pub frontend: Option<String>,

    /// Tauri desktop flavor (react, nextjs, vue, svelte, solid, vanilla)
    #[arg(short = 't', long = "tauri-template")]
    pub tauri_template: Option<String>,

    /// Frontend target for tRPC monorepo (web, tauri, both)
    #[arg(long = "monorepo-fe")]
    pub monorepo_frontend: Option<String>,
}

#[derive(Subcommand, Debug)]
pub enum NewSubcommand {
    /// Create a new shared workspace package (exclusive to tRPC monorepos)
    Pkg {
        /// Name of the package to create under packages/ (e.g. auth, billing, mailer)
        #[arg(value_name = "PKG_NAME")]
        name: String,
    },
}
