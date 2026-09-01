use anyhow::{bail, Result};
use colored::Colorize;
use std::env;
use std::fs;
use std::path::PathBuf;

use crate::utils::fs::write_file;

/// Detects if the current directory or any ancestor is an Amoeba tRPC monorepo root.
fn find_monorepo_root() -> Result<Option<PathBuf>> {
    let current_dir = env::current_dir()?;
    let mut dir = current_dir.as_path();

    loop {
        let has_workspace = dir.join("pnpm-workspace.yaml").exists();
        let has_turbo = dir.join("turbo.json").exists();
        let has_packages = dir.join("packages").is_dir();
        let has_trpc_pkg = dir.join("packages").join("trpc").exists();
        let has_ts_config_pkg = dir.join("packages").join("typescript-config").exists();

        // Check if root package.json references @repo or amoeba
        let has_repo_pkg = dir.join("package.json").exists() && {
            if let Ok(content) = fs::read_to_string(dir.join("package.json")) {
                content.contains("@repo/") || content.contains("turbo")
            } else {
                false
            }
        };

        if has_workspace && has_turbo && has_packages && (has_trpc_pkg || has_ts_config_pkg || has_repo_pkg) {
            return Ok(Some(dir.to_path_buf()));
        }

        match dir.parent() {
            Some(parent) => dir = parent,
            None => break,
        }
    }

    Ok(None)
}

pub fn handle_new_pkg_command(pkg_name: &str) -> Result<()> {
    let clean_name = pkg_name.trim();

    if clean_name.is_empty() {
        bail!("Package name cannot be empty.");
    }

    if !clean_name
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    {
        bail!(
            "Invalid package name '{}'. Package names must be lowercase alphanumeric with hyphens (e.g. 'auth', 'mailer', 'queue-manager').",
            clean_name
        );
    }

    // Monorepo exclusivity check
    let monorepo_root = match find_monorepo_root()? {
        Some(root) => root,
        None => {
            eprintln!(
                "\n{} {}\n",
                "❌ Error:".red().bold(),
                "'amoeba new pkg' is exclusive to Amoeba tRPC monorepos!".white().bold()
            );
            eprintln!("{}", "Reason:".yellow().bold());
            eprintln!(
                "  The current working directory does not belong to an Amoeba tRPC monorepo."
            );
            eprintln!(
                "  Missing 'pnpm-workspace.yaml', 'turbo.json', or '@repo/*' packages.\n"
            );
            eprintln!("{}", "Backend Scaffolding Edge-Case Rules:".cyan().bold());
            eprintln!(
                "  • {} Add internal services in 'apps/api/internal/' or 'apps/api/pkg/'",
                "Go Fiber API:".white().bold()
            );
            eprintln!(
                "  • {} Add new feature modules under 'apps/api/src/modules/'",
                "Express REST API:".white().bold()
            );
            eprintln!(
                "  • {} Exclusive home for shared '@repo/*' workspace packages\n",
                "tRPC Monorepo:".white().bold()
            );
            bail!("Execution aborted: incompatible project type for monorepo package generation.");
        }
    };

    let target_dir = monorepo_root.join("packages").join(clean_name);

    if target_dir.exists() {
        eprintln!(
            "\n{} Package '{}' already exists at {}",
            "❌ Error:".red().bold(),
            format!("@repo/{}", clean_name).yellow(),
            target_dir.display()
        );
        bail!("Package directory already exists.");
    }

    println!(
        "\n{} Creating new package {} in {}...",
        "⚡ Amoeba:".cyan().bold(),
        format!("@repo/{}", clean_name).green().bold(),
        target_dir.display().to_string().dimmed()
    );

    // 1. Write package.json
    let pkg_json = format!(
        r#"{{
  "name": "@repo/{clean_name}",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {{}},
  "devDependencies": {{
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }}
}}
"#
    );
    write_file(target_dir.join("package.json"), &pkg_json)?;

    // 2. Write tsconfig.json
    let tsconfig_json = r#"{
  "extends": ["@repo/typescript-config/node.json"],
  "include": ["src"]
}
"#;
    write_file(target_dir.join("tsconfig.json"), tsconfig_json)?;

    // 3. Write src/index.ts
    let index_ts = format!(
        r#"// @repo/{clean_name} module entrypoint

export const PKG_NAME = "@repo/{clean_name}";

export function info(): string {{
  return "Package @repo/{clean_name} initialized";
}}
"#
    );
    write_file(target_dir.join("src").join("index.ts"), &index_ts)?;

    println!(
        "{} Package {} scaffolded successfully!\n",
        "✔".green().bold(),
        format!("@repo/{}", clean_name).green().bold()
    );
    println!("{}", "Next steps:".white().bold());
    println!(
        "  1. Run {} in the monorepo root to link workspace dependencies",
        "pnpm install".cyan().bold()
    );
    println!(
        "  2. Import into your apps: {}",
        format!("import {{ ... }} from '@repo/{}';", clean_name).dimmed()
    );

    Ok(())
}
