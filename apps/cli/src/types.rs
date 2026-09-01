use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BackendLang {
    Go,
    TypeScript,
}

impl fmt::Display for BackendLang {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BackendLang::Go => write!(f, "Go (Fiber v3 - High Performance Backend)"),
            BackendLang::TypeScript => write!(f, "TypeScript (Express REST API or tRPC Monorepo)"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ArchStyle {
    RestApi,
    TrpcMonorepo,
}

impl fmt::Display for ArchStyle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ArchStyle::RestApi => write!(f, "Standard REST API (Modular Express + Base DTO + ApiError/ApiResponse)"),
            ArchStyle::TrpcMonorepo => write!(f, "tRPC Monorepo (Turborepo + pnpm workspaces + shared packages)"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DatabaseEngine {
    Gorm,       // Go Postgres
    MongoGo,    // Go MongoDB
    Drizzle,    // TS Postgres
    Mongoose,   // TS MongoDB
}

impl fmt::Display for DatabaseEngine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DatabaseEngine::Gorm => write!(f, "PostgreSQL (GORM ORM)"),
            DatabaseEngine::MongoGo => write!(f, "MongoDB (Official Go Driver v2)"),
            DatabaseEngine::Drizzle => write!(f, "PostgreSQL (Drizzle ORM + pg driver)"),
            DatabaseEngine::Mongoose => write!(f, "MongoDB (Mongoose ODM)"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FrontendFramework {
    NextJs,
    React,
    Tauri,
    ApiOnly,
}

impl fmt::Display for FrontendFramework {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FrontendFramework::NextJs => write!(f, "Next.js 15 (App Router + Tailwind CSS)"),
            FrontendFramework::React => write!(f, "React (Vite + TypeScript + Tailwind CSS)"),
            FrontendFramework::Tauri => write!(f, "Tauri 2.0 (Rust Desktop Application)"),
            FrontendFramework::ApiOnly => write!(f, "API Only (No Frontend Scaffold)"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TauriFlavor {
    React,
    NextJs,
    Vue,
    Svelte,
    Solid,
    Vanilla,
}

impl fmt::Display for TauriFlavor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TauriFlavor::React => write!(f, "React (Vite + TypeScript)"),
            TauriFlavor::NextJs => write!(f, "Next.js 15 (Static SSG Export)"),
            TauriFlavor::Vue => write!(f, "Vue 3 (Vite + TypeScript)"),
            TauriFlavor::Svelte => write!(f, "Svelte 5 (Vite + TypeScript)"),
            TauriFlavor::Solid => write!(f, "SolidJS (Vite + TypeScript)"),
            TauriFlavor::Vanilla => write!(f, "Vanilla TS (Vite + TypeScript)"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MonorepoFrontend {
    WebApp,
    TauriApp,
    Both,
}

impl fmt::Display for MonorepoFrontend {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MonorepoFrontend::WebApp => write!(f, "Web App (Next.js web application only)"),
            MonorepoFrontend::TauriApp => write!(f, "Tauri App (Tauri desktop application only)"),
            MonorepoFrontend::Both => write!(f, "Both (Next.js web + Tauri desktop applications)"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ScaffoldConfig {
    pub project_name: String,
    pub backend_lang: BackendLang,
    pub arch_style: Option<ArchStyle>,
    pub database: Option<DatabaseEngine>,
    pub frontend: Option<FrontendFramework>,
    pub tauri_flavor: Option<TauriFlavor>,
    pub monorepo_frontend: Option<MonorepoFrontend>,
}
