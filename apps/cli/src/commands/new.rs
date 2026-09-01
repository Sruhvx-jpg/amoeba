use anyhow::{bail, Result};
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::env;
use std::io::IsTerminal;
use std::path::PathBuf;

use crate::banner::print_banner;
use crate::cli::NewArgs;
use crate::prompts::*;
use crate::scaffold::frontend::*;
use crate::scaffold::go_api::write_go_api_files;
use crate::scaffold::root_files::write_root_files;
use crate::scaffold::trpc_monorepo::scaffold_trpc_monorepo;
use crate::scaffold::ts_rest_api::write_ts_rest_api_files;
use crate::types::*;

pub fn handle_new_command(args: NewArgs) -> Result<()> {
    print_banner("0.2.0");

    let is_interactive = std::io::stdin().is_terminal() && std::io::stdout().is_terminal();

    // STEP 1: Project Name
    let project_name = match &args.project_name {
        Some(name) => {
            println!(
                "{} Project Name: {}",
                "✔".green().bold(),
                name.green().bold()
            );
            name.clone()
        }
        None => {
            if !is_interactive {
                bail!("Project name must be provided in non-interactive mode: amoeba new <project-name>");
            }
            prompt_project_name(None)?
        }
    };

    let target_dir = env::current_dir()?.join(&project_name);
    if target_dir.exists() {
        bail!(
            "Target directory '{}' already exists. Please choose another name or remove the existing directory.",
            target_dir.display()
        );
    }

    // STEP 2: Backend Language (Go or TypeScript)
    let backend_lang = match args.lang.as_deref() {
        Some("go") => {
            println!("{} Backend Language: {}", "✔".green().bold(), "Go (Fiber v3)".green().bold());
            BackendLang::Go
        }
        Some("ts") | Some("typescript") => {
            println!("{} Backend Language: {}", "✔".green().bold(), "TypeScript".green().bold());
            BackendLang::TypeScript
        }
        Some(other) => bail!("Invalid backend language '{}'. Supported: 'go', 'ts', 'typescript'", other),
        None => {
            if !is_interactive {
                bail!("Backend language must be provided via --lang <go|ts> in non-interactive mode");
            }
            prompt_backend_lang()?
        }
    };

    let mut arch_style: Option<ArchStyle> = None;
    let mut database: Option<DatabaseEngine> = None;
    let mut frontend: Option<FrontendFramework> = None;
    let mut tauri_flavor: Option<TauriFlavor> = None;
    let mut monorepo_frontend: Option<MonorepoFrontend> = None;

    match backend_lang {
        BackendLang::Go => {
            // STEP 3 (Go): Database
            database = Some(match args.db.as_deref() {
                Some("gorm") | Some("postgres") => {
                    println!("{} Database: {}", "✔".green().bold(), "PostgreSQL (GORM)".green().bold());
                    DatabaseEngine::Gorm
                }
                Some("mongo") | Some("mongodb") => {
                    println!("{} Database: {}", "✔".green().bold(), "MongoDB (Go Driver v2)".green().bold());
                    DatabaseEngine::MongoGo
                }
                Some(other) => bail!("Invalid database '{}' for Go. Supported: 'gorm', 'mongo'", other),
                None => {
                    if !is_interactive {
                        bail!("Database must be provided via --db <gorm|mongo> in non-interactive mode");
                    }
                    prompt_go_database()?
                }
            });

            // STEP 4 (Go): Frontend
            let (fe, tf) = resolve_standard_frontend(&args, is_interactive)?;
            frontend = Some(fe);
            tauri_flavor = tf;
        }

        BackendLang::TypeScript => {
            // STEP 3 (TS): Architecture Style
            let arch = match args.arch.as_deref() {
                Some("rest") | Some("api") => {
                    println!("{} Architecture: {}", "✔".green().bold(), "Standard REST API".green().bold());
                    ArchStyle::RestApi
                }
                Some("trpc") | Some("monorepo") => {
                    println!("{} Architecture: {}", "✔".green().bold(), "tRPC Monorepo".green().bold());
                    ArchStyle::TrpcMonorepo
                }
                Some(other) => bail!("Invalid architecture '{}' for TypeScript. Supported: 'rest', 'trpc'", other),
                None => {
                    if !is_interactive {
                        bail!("TypeScript architecture must be specified via --arch <rest|trpc> in non-interactive mode");
                    }
                    prompt_ts_arch()?
                }
            };
            arch_style = Some(arch);

            match arch {
                ArchStyle::RestApi => {
                    // Database for TS Express REST
                    database = Some(match args.db.as_deref() {
                        Some("drizzle") | Some("postgres") => {
                            println!("{} Database: {}", "✔".green().bold(), "PostgreSQL (Drizzle ORM)".green().bold());
                            DatabaseEngine::Drizzle
                        }
                        Some("mongo") | Some("mongoose") | Some("mongodb") => {
                            println!("{} Database: {}", "✔".green().bold(), "MongoDB (Mongoose)".green().bold());
                            DatabaseEngine::Mongoose
                        }
                        Some(other) => bail!("Invalid database '{}' for TS REST. Supported: 'drizzle', 'mongoose'", other),
                        None => {
                            if !is_interactive {
                                bail!("Database must be specified via --db <drizzle|mongoose> in non-interactive mode");
                            }
                            prompt_ts_rest_database()?
                        }
                    });

                    // Frontend for TS Express REST
                    let (fe, tf) = resolve_standard_frontend(&args, is_interactive)?;
                    frontend = Some(fe);
                    tauri_flavor = tf;
                }

                ArchStyle::TrpcMonorepo => {
                    // Frontend selection for Monorepo
                    let mono_fe = match args.monorepo_frontend.as_deref() {
                        Some("web") => {
                            println!("{} Monorepo Frontend: {}", "✔".green().bold(), "Web App".green().bold());
                            MonorepoFrontend::WebApp
                        }
                        Some("tauri") | Some("desktop") => {
                            println!("{} Monorepo Frontend: {}", "✔".green().bold(), "Tauri App".green().bold());
                            MonorepoFrontend::TauriApp
                        }
                        Some("both") | Some("all") => {
                            println!("{} Monorepo Frontend: {}", "✔".green().bold(), "Both (Web + Tauri)".green().bold());
                            MonorepoFrontend::Both
                        }
                        Some(other) => bail!("Invalid monorepo frontend '{}'. Supported: 'web', 'tauri', 'both'", other),
                        None => {
                            if !is_interactive {
                                MonorepoFrontend::Both
                            } else {
                                prompt_monorepo_frontend()?
                            }
                        }
                    };
                    monorepo_frontend = Some(mono_fe);
                }
            }
        }
    }

    let config = ScaffoldConfig {
        project_name: project_name.clone(),
        backend_lang,
        arch_style,
        database,
        frontend,
        tauri_flavor,
        monorepo_frontend,
    };

    println!("\n{}", "⚡ Scaffolding project...".cyan().bold());
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("{spinner:.green} {msg}")?,
    );

    pb.set_message("Creating project directory structure...");

    // Execute Scaffolding
    match config.backend_lang {
        BackendLang::Go => {
            let db = config.database.unwrap_or(DatabaseEngine::Gorm);
            write_go_api_files(&target_dir, &project_name, db)?;

            if let Some(fe) = config.frontend {
                match fe {
                    FrontendFramework::NextJs => write_nextjs_template(&target_dir, &project_name)?,
                    FrontendFramework::React => write_react_template(&target_dir, &project_name)?,
                    FrontendFramework::Tauri => {
                        let flavor = config.tauri_flavor.unwrap_or(TauriFlavor::React);
                        write_tauri_template(&target_dir, &project_name, flavor)?;
                    }
                    FrontendFramework::ApiOnly => {}
                }
            }

            write_root_files(&target_dir, &config)?;
        }

        BackendLang::TypeScript => {
            match config.arch_style.unwrap_or(ArchStyle::RestApi) {
                ArchStyle::RestApi => {
                    let db = config.database.unwrap_or(DatabaseEngine::Drizzle);
                    write_ts_rest_api_files(&target_dir, &project_name, db)?;

                    if let Some(fe) = config.frontend {
                        match fe {
                            FrontendFramework::NextJs => write_nextjs_template(&target_dir, &project_name)?,
                            FrontendFramework::React => write_react_template(&target_dir, &project_name)?,
                            FrontendFramework::Tauri => {
                                let flavor = config.tauri_flavor.unwrap_or(TauriFlavor::React);
                                write_tauri_template(&target_dir, &project_name, flavor)?;
                            }
                            FrontendFramework::ApiOnly => {}
                        }
                    }

                    write_root_files(&target_dir, &config)?;
                }

                ArchStyle::TrpcMonorepo => {
                    let mono_fe = config.monorepo_frontend.unwrap_or(MonorepoFrontend::Both);
                    scaffold_trpc_monorepo(&target_dir, &project_name, mono_fe)?;
                }
            }
        }
    }

    pb.finish_with_message(format!("{}", "✔ Project scaffolded successfully!".green().bold()));

    // Print Completion Summary
    print_completion_summary(&config, &target_dir);

    Ok(())
}

fn resolve_standard_frontend(
    args: &NewArgs,
    is_interactive: bool,
) -> Result<(FrontendFramework, Option<TauriFlavor>)> {
    let frontend = match args.frontend.as_deref() {
        Some("nextjs") | Some("next") => FrontendFramework::NextJs,
        Some("react") | Some("vite") => FrontendFramework::React,
        Some("tauri") | Some("desktop") => FrontendFramework::Tauri,
        Some("api-only") | Some("none") => FrontendFramework::ApiOnly,
        Some(other) => bail!("Invalid frontend '{}'. Supported: 'nextjs', 'react', 'tauri', 'api-only'", other),
        None => {
            if !is_interactive {
                FrontendFramework::NextJs
            } else {
                prompt_frontend()?
            }
        }
    };

    let mut tauri_flavor: Option<TauriFlavor> = None;
    if frontend == FrontendFramework::Tauri {
        tauri_flavor = Some(match args.tauri_template.as_deref() {
            Some("react") => TauriFlavor::React,
            Some("nextjs") | Some("next") => TauriFlavor::NextJs,
            Some("vue") => TauriFlavor::Vue,
            Some("svelte") => TauriFlavor::Svelte,
            Some("solid") => TauriFlavor::Solid,
            Some("vanilla") => TauriFlavor::Vanilla,
            Some(other) => bail!("Invalid Tauri flavor '{}'. Supported: react, nextjs, vue, svelte, solid, vanilla", other),
            None => {
                if !is_interactive {
                    TauriFlavor::React
                } else {
                    prompt_tauri_flavor()?
                }
            }
        });
    }

    Ok((frontend, tauri_flavor))
}

fn print_completion_summary(config: &ScaffoldConfig, target_dir: &PathBuf) {
    println!("\n{}", "🎉 Project Ready!".green().bold());
    println!("  Location: {}\n", target_dir.display().to_string().cyan());

    println!("{}", "⚡ Next Steps:".white().bold());
    println!("  cd {}", config.project_name.cyan().bold());

    match config.backend_lang {
        BackendLang::Go => {
            println!("  cd apps/api && go run ./cmd/server/main.go");
            if let Some(fe) = config.frontend {
                if fe != FrontendFramework::ApiOnly {
                    let fe_path = if fe == FrontendFramework::Tauri { "apps/desktop" } else { "apps/web" };
                    println!("  cd {} && pnpm install && pnpm dev", fe_path);
                }
            }
        }
        BackendLang::TypeScript => {
            match config.arch_style.unwrap_or(ArchStyle::RestApi) {
                ArchStyle::RestApi => {
                    println!("  cd apps/api && pnpm install && pnpm dev");
                    if let Some(fe) = config.frontend {
                        if fe != FrontendFramework::ApiOnly {
                            let fe_path = if fe == FrontendFramework::Tauri { "apps/desktop" } else { "apps/web" };
                            println!("  cd {} && pnpm install && pnpm dev", fe_path);
                        }
                    }
                }
                ArchStyle::TrpcMonorepo => {
                    println!("  pnpm install");
                    println!("  pnpm dev");
                    println!("\n{}", "💡 Monorepo Tip:".magenta().bold());
                    println!(
                        "  Run {} to create new shared packages in packages/",
                        "amoeba new pkg <name>".yellow().bold()
                    );
                }
            }
        }
    }
    println!();
}
