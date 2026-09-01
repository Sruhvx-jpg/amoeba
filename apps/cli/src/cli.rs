use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(
    name = "amoeba",
    author = "dron",
    version = "0.2.0",
    about = "⚡ Amoeba Framework CLI - Rapid scaffolding for Go & TypeScript fullstack systems",
    long_about = "A high-performance CLI tool for scaffolding production-ready fullstack architectures.\nSupports Go Fiber v3, TypeScript Express Modular REST, and tRPC Turborepo Monorepos."
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Scaffold a new Amoeba project or monorepo package
    New(NewArgs),
    /// Check for Amoeba framework releases and upgrade project dependencies
    Update,
    /// Print version information
    Version,
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
