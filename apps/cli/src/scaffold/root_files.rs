use anyhow::Result;
use std::path::Path;

use crate::types::{BackendLang, DatabaseEngine, FrontendFramework, ScaffoldConfig};
use crate::utils::fs::write_file;

pub fn write_root_files(base_dir: &Path, config: &ScaffoldConfig) -> Result<()> {
    let backend_label = match config.backend_lang {
        BackendLang::Go => match config.database {
            Some(DatabaseEngine::MongoGo) => "Go Fiber v3 + MongoDB",
            _ => "Go Fiber v3 + PostgreSQL (GORM)",
        },
        BackendLang::TypeScript => match config.database {
            Some(DatabaseEngine::Mongoose) => "Express + MongoDB (Mongoose)",
            _ => "Express + PostgreSQL (Drizzle ORM)",
        },
    };

    let frontend_label = match config.frontend {
        Some(FrontendFramework::NextJs) => "- **Frontend**: `apps/web` (Next.js 15 App Router)\n",
        Some(FrontendFramework::React) => "- **Frontend**: `apps/web` (React + Vite + TypeScript)\n",
        Some(FrontendFramework::Tauri) => "- **Desktop**: `apps/desktop` (Tauri 2.0 Rust Desktop App)\n",
        Some(FrontendFramework::ApiOnly) | None => "",
    };

    let start_backend = match config.backend_lang {
        BackendLang::Go => {
            r#"### 1. Start the API Server
```bash
cd apps/api
go run ./cmd/server/main.go
```
"#
        }
        BackendLang::TypeScript => {
            r#"### 1. Start the API Server
```bash
cd apps/api
pnpm install
pnpm dev
```
"#
        }
    };

    let frontend_dir = match config.frontend {
        Some(FrontendFramework::Tauri) => "apps/desktop",
        _ => "apps/web",
    };

    let start_frontend = match config.frontend {
        Some(FrontendFramework::ApiOnly) | None => String::new(),
        _ => format!(
            r#"
### 2. Start the Frontend
```bash
cd {frontend_dir}
pnpm install
pnpm dev
```
"#
        ),
    };

    let readme = format!(
        r#"# {} (Built with Amoeba Framework ⚡)

A high-performance full-stack application architecture.

## 📦 Project Structure

- **Backend**: `apps/api` ({backend_label})
{frontend_label}
## 🚀 Getting Started

{start_backend}{start_frontend}
"#
    , config.project_name);

    write_file(base_dir.join("README.md"), &readme)?;

    let gitignore = r#"# Dependencies
node_modules/
.pnpm-store/

# Builds
dist/
build/
out/
target/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# System
.DS_Store
"#;
    write_file(base_dir.join(".gitignore"), gitignore)?;

    Ok(())
}
