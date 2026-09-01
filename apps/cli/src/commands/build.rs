use anyhow::{bail, Context, Result};
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::env;
use std::process::Command;
use std::time::Instant;

use crate::banner::print_banner;
use crate::cli::BuildArgs;
use crate::utils::project::{
    detect_project, ApiComponent, DetectedProject, FrontendComponent, ProjectKind,
};

const CLI_VERSION: &str = env!("CARGO_PKG_VERSION");

pub fn handle_build_command(args: BuildArgs) -> Result<()> {
    print_banner(CLI_VERSION);

    let cwd = env::current_dir()?;
    let project = detect_project(&cwd)?;

    println!(
        "{}\n",
        " ⚡ Amoeba Build System ".on_cyan().black().bold()
    );

    let start_time = Instant::now();
    let mut built_targets: Vec<String> = Vec::new();

    match &project.kind {
        ProjectKind::Fullstack { api, frontend } => {
            let should_build_api = !args.only_frontend;
            let should_build_fe = !args.only_api;

            if args.only_api && api.is_none() {
                bail!("--only-api was specified, but no backend API service was found in 'apps/api'.");
            }
            if args.only_frontend && frontend.is_none() {
                bail!("--only-frontend was specified, but no frontend application was found in 'apps/web' or 'apps/desktop'.");
            }

            if should_build_api {
                if let Some(api_comp) = api {
                    let name = build_api_component(api_comp)?;
                    built_targets.push(name);
                }
            }

            if should_build_fe {
                if let Some(fe_comp) = frontend {
                    let name = build_frontend_component(fe_comp)?;
                    built_targets.push(name);
                }
            }
        }

        ProjectKind::TrpcMonorepo {
            has_api,
            has_web,
            has_desktop,
            package_manager,
        } => {
            if args.only_api && !has_api {
                bail!("--only-api was specified, but no 'apps/api' package was found in the monorepo.");
            }
            if args.only_frontend && !has_web && !has_desktop {
                bail!("--only-frontend was specified, but no frontend package ('apps/web' or 'apps/desktop') was found in the monorepo.");
            }

            let name = build_monorepo(&project, args, *package_manager)?;
            built_targets.push(name);
        }

        ProjectKind::SingleApi(api_comp) => {
            if args.only_frontend {
                bail!("--only-frontend was specified, but the current directory is an API-only service.");
            }
            let name = build_api_component(api_comp)?;
            built_targets.push(name);
        }

        ProjectKind::SingleFrontend(fe_comp) => {
            if args.only_api {
                bail!("--only-api was specified, but the current directory is a frontend-only application.");
            }
            let name = build_frontend_component(fe_comp)?;
            built_targets.push(name);
        }
    }

    let elapsed = start_time.elapsed();
    println!(
        "\n{} Build completed in {:.2?}",
        "✔".green().bold(),
        elapsed
    );
    for target in built_targets {
        println!("  • {}", target.green());
    }
    println!();

    Ok(())
}

fn build_api_component(api: &ApiComponent) -> Result<String> {
    let (program, cmd_args) = api.build_command();
    let dir = api.dir();

    let label = match api {
        ApiComponent::Go { .. } => "API Server (Go Fiber v3)",
        ApiComponent::TypeScript { .. } => "API Server (TypeScript Express REST)",
    };

    println!("{} Building {}...", "•".cyan().bold(), label.white().bold());
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("{spinner:.cyan} {msg}")?,
    );
    pb.set_message(format!("Running '{} {}'...", program, cmd_args.join(" ")));

    let status = Command::new(&program)
        .args(&cmd_args)
        .current_dir(dir)
        .status()
        .with_context(|| format!("Failed to execute build tool '{}'", program))?;

    if !status.success() {
        pb.finish_with_message(format!("{}", "❌ Build failed".red().bold()));
        bail!(
            "Build command '{} {}' failed in '{}' with exit code {:?}",
            program,
            cmd_args.join(" "),
            dir.display(),
            status.code()
        );
    }

    pb.finish_with_message(format!("✔ Built {} successfully", label).green().to_string());
    Ok(format!("{} in {}", label, dir.display()))
}

fn build_frontend_component(fe: &FrontendComponent) -> Result<String> {
    let (program, cmd_args) = fe.build_command();
    let dir = fe.dir();
    let label = fe.label();

    println!("{} Building {}...", "•".magenta().bold(), label.white().bold());
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("{spinner:.magenta} {msg}")?,
    );
    pb.set_message(format!("Running '{} {}'...", program, cmd_args.join(" ")));

    let status = Command::new(&program)
        .args(&cmd_args)
        .current_dir(dir)
        .status()
        .with_context(|| format!("Failed to execute build tool '{}'", program))?;

    if !status.success() {
        pb.finish_with_message(format!("{}", "❌ Build failed".red().bold()));
        bail!(
            "Build command '{} {}' failed in '{}' with exit code {:?}",
            program,
            cmd_args.join(" "),
            dir.display(),
            status.code()
        );
    }

    pb.finish_with_message(format!("✔ Built {} successfully", label).green().to_string());
    Ok(format!("{} in {}", label, dir.display()))
}

fn build_monorepo(
    project: &DetectedProject,
    args: BuildArgs,
    pm: crate::utils::project::PackageManager,
) -> Result<String> {
    let root = &project.root_dir;

    let (filter_desc, cmd_args) = if args.only_api {
        (
            "API packages only",
            vec![
                "run".to_string(),
                "build".to_string(),
                "--filter".to_string(),
                "...api...".to_string(),
            ],
        )
    } else if args.only_frontend {
        (
            "Frontend packages only",
            vec![
                "run".to_string(),
                "build".to_string(),
                "--filter".to_string(),
                "...web...".to_string(),
            ],
        )
    } else {
        ("All monorepo workspace packages", pm.run_script_args("build"))
    };

    println!(
        "{} Building tRPC Turborepo ({filter_desc})...",
        "•".cyan().bold()
    );

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("{spinner:.cyan} {msg}")?,
    );
    pb.set_message(format!("Running '{} {}'...", pm.name(), cmd_args.join(" ")));

    let status = Command::new(pm.name())
        .args(&cmd_args)
        .current_dir(root)
        .status()
        .with_context(|| format!("Failed to execute monorepo build with '{}'", pm.name()))?;

    if !status.success() {
        pb.finish_with_message(format!("{}", "❌ Monorepo build failed".red().bold()));
        bail!("Monorepo build failed with exit code {:?}", status.code());
    }

    pb.finish_with_message(format!("✔ Monorepo built successfully ({filter_desc})").green().to_string());
    Ok(format!("tRPC Turborepo ({filter_desc}) in {}", root.display()))
}
