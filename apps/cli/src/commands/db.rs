use anyhow::{bail, Context, Result};
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::time::Instant;

use crate::banner::print_banner;
use crate::cli::DbSubcommand;
use crate::utils::project::{detect_project, ApiComponent, ProjectKind};

const CLI_VERSION: &str = env!("CARGO_PKG_VERSION");

pub fn handle_db_command(sub: DbSubcommand) -> Result<()> {
    print_banner(CLI_VERSION);

    let cwd = env::current_dir()?;
    let project = detect_project(&cwd)?;

    let api_comp = match &project.kind {
        ProjectKind::Fullstack { api: Some(api), .. } => api,
        ProjectKind::SingleApi(api) => api,
        _ => {
            bail!("No backend API service with a database was found in this project.\nMake sure you are in an Amoeba workspace with an 'apps/api' directory.");
        }
    };

    let api_dir = api_comp.dir();
    check_db_env(api_dir);

    match sub {
        DbSubcommand::Generate => handle_generate(api_comp),
        DbSubcommand::Migrate => handle_migrate(api_comp),
        DbSubcommand::Studio => handle_studio(api_comp),
    }
}

fn check_db_env(api_dir: &Path) {
    let env_file = api_dir.join(".env");
    let env_example = api_dir.join(".env.example");

    if !env_file.exists() && env_example.exists() {
        if let Ok(_) = fs::copy(&env_example, &env_file) {
            println!(
                "{} Created '{}' from '.env.example'",
                "⚡".cyan().bold(),
                env_file.display().to_string().cyan()
            );
        }
    }

    if env_file.exists() {
        if let Ok(content) = fs::read_to_string(&env_file) {
            let has_db_url = content.lines().any(|l| {
                let t = l.trim();
                t.starts_with("DATABASE_URL=") && t["DATABASE_URL=".len()..].trim() != ""
            });

            if !has_db_url && env::var("DATABASE_URL").is_err() {
                println!(
                    "{} {}",
                    "⚠ Amoeba DB Warning:".yellow().bold(),
                    "'DATABASE_URL' is empty in apps/api/.env".white()
                );
                println!(
                    "  Required Variable: {}\n  Example:           {}\n",
                    "DATABASE_URL".cyan().bold(),
                    "postgres://postgres:postgres@localhost:5432/myapp?sslmode=disable".dimmed()
                );
            }
        }
    }
}

fn handle_generate(api: &ApiComponent) -> Result<()> {
    println!(
        "{}\n",
        " ⚡ Amoeba Database: Generate Schema & Migrations "
            .on_cyan()
            .black()
            .bold()
    );

    let start_time = Instant::now();
    let api_dir = api.dir();

    match api {
        ApiComponent::TypeScript { package_manager, .. } => {
            let pkg_json_path = api_dir.join("package.json");
            let has_drizzle = if let Ok(content) = fs::read_to_string(&pkg_json_path) {
                content.contains("drizzle-kit")
            } else {
                false
            };

            if has_drizzle {
                println!("{} Generating Drizzle migrations...", "•".cyan().bold());
                let pb = ProgressBar::new_spinner();
                pb.set_style(
                    ProgressStyle::default_spinner()
                        .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
                        .template("{spinner:.cyan} {msg}")?,
                );
                pb.set_message("Running 'drizzle-kit generate'...");

                let status = Command::new(package_manager.name())
                    .args(package_manager.run_script_args("db:generate"))
                    .current_dir(api_dir)
                    .status()
                    .with_context(|| "Failed to execute 'drizzle-kit generate'")?;

                if !status.success() {
                    pb.finish_with_message(format!("{}", "❌ Migration generation failed".red().bold()));
                    print_db_troubleshooting_hint(api_dir);
                    bail!("drizzle-kit generate failed with exit code {:?}", status.code());
                }

                pb.finish_with_message(format!("{}", "✔ Drizzle migration files generated".green().bold()));
            } else {
                println!("{} MongoDB / Mongoose uses code-first schema definitions.", "ℹ".cyan().bold());
                println!("  Schema file: {}", api_dir.join("src/database/schema.ts").display().to_string().cyan());
            }
        }

        ApiComponent::Go { .. } => {
            let schema_file = api_dir.join("internal/schema/schema.go");
            let is_gorm = schema_file.exists();

            if is_gorm {
                println!("{} Validating Go GORM schema definitions...", "•".cyan().bold());
                let pb = ProgressBar::new_spinner();
                pb.set_style(
                    ProgressStyle::default_spinner()
                        .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
                        .template("{spinner:.cyan} {msg}")?,
                );
                pb.set_message("Verifying schema type soundness with 'go vet'...");

                let status = Command::new("go")
                    .args(["vet", "./internal/schema/..."])
                    .current_dir(api_dir)
                    .status();

                match status {
                    Ok(s) if s.success() => {
                        pb.finish_with_message(format!("{}", "✔ Go GORM schema types verified".green().bold()));
                    }
                    _ => {
                        pb.finish_with_message(format!("{}", "⚠ Go schema check had warnings/errors".yellow().bold()));
                    }
                }

                ensure_go_migrate_entrypoint(api_dir)?;

                println!("\n  {} {}", "• Schema File:".cyan().bold(), schema_file.display().to_string().white());
                println!("  {} GORM uses code-first auto-migrations.", "ℹ".cyan());
                println!("  {} Register models in {} inside Migrate(db *gorm.DB).", "ℹ".cyan(), "schema.go".yellow());
                println!("  {} Run '{}' to apply schema to PostgreSQL.\n", "ℹ".cyan(), "amoeba db migrate".cyan().bold());
            } else {
                println!("{} Go Mongo service uses code-first document definitions.", "ℹ".cyan().bold());
            }
        }
    }

    println!("{} Completed in {:.2?}\n", "✔".green().bold(), start_time.elapsed());
    Ok(())
}

fn handle_migrate(api: &ApiComponent) -> Result<()> {
    println!(
        "{}\n",
        " ⚡ Amoeba Database: Apply Migrations "
            .on_cyan()
            .black()
            .bold()
    );

    let start_time = Instant::now();
    let api_dir = api.dir();

    match api {
        ApiComponent::TypeScript { package_manager, .. } => {
            let pkg_json_path = api_dir.join("package.json");
            let has_drizzle = if let Ok(content) = fs::read_to_string(&pkg_json_path) {
                content.contains("drizzle-kit")
            } else {
                false
            };

            if has_drizzle {
                println!("{} Applying pending Drizzle migrations...", "•".cyan().bold());
                let pb = ProgressBar::new_spinner();
                pb.set_style(
                    ProgressStyle::default_spinner()
                        .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
                        .template("{spinner:.cyan} {msg}")?,
                );
                pb.set_message("Running 'drizzle-kit migrate'...");

                let status = Command::new(package_manager.name())
                    .args(package_manager.run_script_args("db:migrate"))
                    .current_dir(api_dir)
                    .status()
                    .with_context(|| "Failed to execute 'drizzle-kit migrate'")?;

                if !status.success() {
                    pb.finish_with_message(format!("{}", "❌ Migration execution failed".red().bold()));
                    print_db_troubleshooting_hint(api_dir);
                    bail!("drizzle-kit migrate failed with exit code {:?}", status.code());
                }

                pb.finish_with_message(format!("{}", "✔ Database migrations applied successfully".green().bold()));
            } else {
                println!("{} MongoDB schema indexes are synchronized on server startup.", "ℹ".cyan().bold());
            }
        }

        ApiComponent::Go { .. } => {
            ensure_go_migrate_entrypoint(api_dir)?;

            println!("{} Executing GORM schema auto-migration...", "•".cyan().bold());
            let pb = ProgressBar::new_spinner();
            pb.set_style(
                ProgressStyle::default_spinner()
                    .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
                    .template("{spinner:.cyan} {msg}")?,
            );
            pb.set_message("Connecting to database and running schema migrations...");

            let status = Command::new("go")
                .args(["run", "./cmd/migrate/main.go"])
                .current_dir(api_dir)
                .status()
                .with_context(|| "Failed to execute Go migration runner (cmd/migrate/main.go)")?;

            if !status.success() {
                pb.finish_with_message(format!("{}", "❌ Migration execution failed".red().bold()));
                print_db_troubleshooting_hint(api_dir);
                bail!("Go migration runner exited with code {:?}", status.code());
            }

            pb.finish_with_message(format!("{}", "✔ Database migrations applied successfully".green().bold()));
        }
    }

    println!("\n{} Migration step completed in {:.2?}\n", "✔".green().bold(), start_time.elapsed());
    Ok(())
}

fn ensure_go_migrate_entrypoint(api_dir: &Path) -> Result<()> {
    let migrate_dir = api_dir.join("cmd").join("migrate");
    let migrate_file = migrate_dir.join("main.go");

    if !migrate_file.exists() {
        let go_mod_path = api_dir.join("go.mod");
        let module_name = if let Ok(content) = fs::read_to_string(&go_mod_path) {
            content
                .lines()
                .find(|l| l.starts_with("module "))
                .and_then(|l| l.strip_prefix("module "))
                .map(|m| m.trim().to_string())
                .unwrap_or_else(|| "local/amoeba".to_string())
        } else {
            "local/amoeba".to_string()
        };

        fs::create_dir_all(&migrate_dir)?;

        let content = format!(
            r#"package main

import (
	"fmt"
	"log"
	"os"

	"{module_name}/internal/config"
	"{module_name}/internal/database"
	"{module_name}/internal/schema"
)

func main() {{
	cfg, err := config.Load()
	if err != nil {{
		log.Fatalf("failed to load config: %v", err)
	}}

	db, err := database.Connect(cfg)
	if err != nil {{
		fmt.Fprintf(os.Stderr, "\n%s\n", "❌ Amoeba Database Connection Error:")
		fmt.Fprintf(os.Stderr, "   Could not establish a connection to PostgreSQL.\n\n")
		fmt.Fprintf(os.Stderr, "   • Required Variable: %s\n", "DATABASE_URL")
		if cfg.DatabaseURL == "" {{
			fmt.Fprintf(os.Stderr, "   • Current Value:     %s\n", "<empty>")
		}} else {{
			fmt.Fprintf(os.Stderr, "   • Current Value:     %s\n", cfg.DatabaseURL)
		}}
		fmt.Fprintf(os.Stderr, "   • Expected Format:   %s\n", "postgres://username:password@localhost:5432/dbname?sslmode=disable")
		fmt.Fprintf(os.Stderr, "   • How to fix:        Set DATABASE_URL in 'apps/api/.env' and ensure PostgreSQL is running.\n\n")
		os.Exit(1)
	}}

	log.Printf("Connecting to PostgreSQL at %s ...", cfg.DatabaseURL)
	if err := schema.Migrate(db); err != nil {{
		log.Fatalf("failed to auto-migrate schemas: %v", err)
	}}

	log.Println("✔ Database migrations applied successfully")
}}
"#
        );

        fs::write(&migrate_file, content)?;
    }

    Ok(())
}

fn handle_studio(api: &ApiComponent) -> Result<()> {
    let api_dir = api.dir();

    match api {
        ApiComponent::TypeScript { package_manager, .. } => {
            println!(
                "{} Launching Drizzle Studio in {}...\n",
                "⚡".cyan().bold(),
                api_dir.display().to_string().dimmed()
            );

            let status = Command::new(package_manager.name())
                .args(package_manager.run_script_args("db:studio"))
                .current_dir(api_dir)
                .status()
                .with_context(|| "Failed to execute 'drizzle-kit studio'")?;

            if !status.success() {
                print_db_troubleshooting_hint(api_dir);
                bail!("drizzle-kit studio exited with code {:?}", status.code());
            }
        }

        ApiComponent::Go { .. } => {
            println!("{} Database GUI Studio is currently supported for Drizzle ORM.", "ℹ".cyan().bold());
            println!("  For PostgreSQL (GORM), you can use pgAdmin, TablePlus, or DBeaver with your DATABASE_URL.");
        }
    }

    Ok(())
}

fn print_db_troubleshooting_hint(api_dir: &Path) {
    eprintln!("\n{}", "❌ Database Operation Failed:".red().bold());
    eprintln!("   Could not complete database command.");
    eprintln!("   • Required Variable: {}", "DATABASE_URL".cyan().bold());
    eprintln!("   • Config Location:   {}", api_dir.join(".env").display().to_string().yellow());
    eprintln!("   • Expected Format:   {}", "postgres://username:password@localhost:5432/dbname".dimmed());
    eprintln!("   • Fix:               Verify DATABASE_URL in .env and make sure PostgreSQL is running.\n");
}
