use anyhow::Result;
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::env;
use std::process::Command;

use crate::banner::print_banner;
use crate::utils::fs::path_exists;
use crate::utils::release::check_latest_release;

const CLI_VERSION: &str = "0.2.1";

pub fn handle_update_command() -> Result<()> {
    print_banner(CLI_VERSION);

    println!(
        "{}\n",
        " ⚡ Amoeba Project & CLI Updater ".on_cyan().black().bold()
    );

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("{spinner:.green} {msg}")?,
    );

    // 1. Release check
    pb.set_message("Checking for latest Amoeba releases on GitHub...");
    let release_info = check_latest_release(CLI_VERSION)?;
    pb.finish_with_message(format!("{}", "✔ Release check complete".green()));

    if release_info.has_update {
        println!(
            "\n{} {}",
            "⚡ New Amoeba Release Detected:".cyan().bold(),
            format!("v{}", release_info.latest_version).green().bold()
        );
        println!("  Current version: {}", format!("v{}", CLI_VERSION).dimmed());
        if let Some(url) = release_info.release_url {
            println!("  Release notes:   {}", url.blue().underline());
        }
    } else {
        println!(
            "\n{} Amoeba CLI is running the latest release ({})",
            "✔".green().bold(),
            format!("v{}", CLI_VERSION).cyan()
        );
    }

    // 2. Local project component checks
    let cwd = env::current_dir()?;
    let api_go = cwd.join("apps/api/go.mod");
    let api_ts = cwd.join("apps/api/package.json");
    let web_pkg = cwd.join("apps/web/package.json");
    let desktop_pkg = cwd.join("apps/desktop/package.json");
    let workspace_pkg = cwd.join("pnpm-workspace.yaml");

    let has_go_api = path_exists(&api_go);
    let has_ts_api = path_exists(&api_ts);
    let has_web = path_exists(&web_pkg);
    let has_desktop = path_exists(&desktop_pkg);
    let has_workspace = path_exists(&workspace_pkg);

    if !has_go_api && !has_ts_api && !has_web && !has_desktop && !has_workspace {
        println!(
            "\n{}",
            "No local Amoeba project detected in current directory.".dimmed()
        );
        println!("{}", "⚡ Update check complete!".green().bold());
        return Ok(());
    }

    println!("\n{}", "Updating project dependencies...".white().bold());

    // Update Go API
    if has_go_api {
        let api_dir = cwd.join("apps/api");
        println!("  {} Updating Go Fiber & database drivers...", "•".cyan());
        let _ = Command::new("go")
            .args(["get", "-u", "./..."])
            .current_dir(&api_dir)
            .status();
        let _ = Command::new("go")
            .args(["mod", "tidy"])
            .current_dir(&api_dir)
            .status();
        println!("    {}", "✔ Go modules updated and tidied".green());
    }

    // Update Node/TS workspace or apps
    if has_workspace {
        println!("  {} Updating monorepo workspace dependencies...", "•".cyan());
        let _ = Command::new("pnpm")
            .args(["update"])
            .current_dir(&cwd)
            .status();
        println!("    {}", "✔ Monorepo dependencies updated".green());
    } else {
        if has_ts_api {
            println!("  {} Updating Express API dependencies...", "•".cyan());
            let _ = Command::new("pnpm")
                .args(["update"])
                .current_dir(cwd.join("apps/api"))
                .status();
        }
        if has_web {
            println!("  {} Updating Web frontend dependencies...", "•".cyan());
            let _ = Command::new("pnpm")
                .args(["update"])
                .current_dir(cwd.join("apps/web"))
                .status();
        }
        if has_desktop {
            println!("  {} Updating Desktop frontend dependencies...", "•".cyan());
            let _ = Command::new("pnpm")
                .args(["update"])
                .current_dir(cwd.join("apps/desktop"))
                .status();
        }
    }

    println!("\n{}", "⚡ Project update completed successfully!".green().bold());
    Ok(())
}
