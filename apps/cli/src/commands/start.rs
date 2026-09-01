use anyhow::{bail, Context, Result};
use colored::Colorize;
use std::env;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use crate::banner::print_banner;
use crate::cli::StartArgs;
use crate::utils::project::{
    detect_project, ApiComponent, DetectedProject, FrontendComponent, ProjectKind,
};

const CLI_VERSION: &str = "0.2.1";

#[derive(Debug, Clone)]
struct ServiceSpec {
    pub name: String,
    pub tag: colored::ColoredString,
    pub dir: PathBuf,
    pub program: String,
    pub args: Vec<String>,
}

pub fn handle_start_command(args: StartArgs) -> Result<()> {
    print_banner(CLI_VERSION);

    let cwd = env::current_dir()?;
    let project = detect_project(&cwd)?;

    let mode_str = if args.prod { "Production" } else { "Development" };
    println!(
        "{} {}\n",
        " ⚡ Amoeba Server Engine ".on_cyan().black().bold(),
        format!("[{mode_str} Mode]").white().dimmed()
    );

    match &project.kind {
        ProjectKind::Fullstack { api, frontend } => {
            let should_start_api = !args.only_frontend;
            let should_start_fe = !args.only_api;

            if args.only_api && api.is_none() {
                bail!("--only-api was specified, but no backend API service was found in 'apps/api'.");
            }
            if args.only_frontend && frontend.is_none() {
                bail!("--only-frontend was specified, but no frontend application was found in 'apps/web' or 'apps/desktop'.");
            }

            let mut services: Vec<ServiceSpec> = Vec::new();

            if should_start_api {
                if let Some(api_comp) = api {
                    services.push(build_api_spec(api_comp, args.prod));
                }
            }

            if should_start_fe {
                if let Some(fe_comp) = frontend {
                    services.push(build_frontend_spec(fe_comp, args.prod));
                }
            }

            if services.len() == 1 {
                run_single_service(&services[0])?;
            } else if services.len() > 1 {
                run_concurrent_services(services)?;
            } else {
                bail!("No services found to start.");
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

            start_monorepo(&project, args, *package_manager)?;
        }

        ProjectKind::SingleApi(api_comp) => {
            if args.only_frontend {
                bail!("--only-frontend was specified, but the current directory is an API-only service.");
            }
            let spec = build_api_spec(api_comp, args.prod);
            run_single_service(&spec)?;
        }

        ProjectKind::SingleFrontend(fe_comp) => {
            if args.only_api {
                bail!("--only-api was specified, but the current directory is a frontend-only application.");
            }
            let spec = build_frontend_spec(fe_comp, args.prod);
            run_single_service(&spec)?;
        }
    }

    Ok(())
}

fn build_api_spec(api: &ApiComponent, prod: bool) -> ServiceSpec {
    let (program, args) = api.start_command(prod);
    let name = match api {
        ApiComponent::Go { .. } => "API (Go Fiber v3)",
        ApiComponent::TypeScript { .. } => "API (TS Express)",
    };

    ServiceSpec {
        name: name.to_string(),
        tag: "[api]".cyan().bold(),
        dir: api.dir().to_path_buf(),
        program,
        args,
    }
}

fn build_frontend_spec(fe: &FrontendComponent, prod: bool) -> ServiceSpec {
    let (program, args) = fe.start_command(prod);
    let (name, tag_str) = match fe {
        FrontendComponent::Web { is_nextjs: true, .. } => ("Frontend (Next.js)", "[web]"),
        FrontendComponent::Web { is_nextjs: false, .. } => ("Frontend (React/Vite)", "[web]"),
        FrontendComponent::Desktop { .. } => ("Desktop (Tauri 2.0)", "[desktop]"),
    };

    ServiceSpec {
        name: name.to_string(),
        tag: tag_str.magenta().bold(),
        dir: fe.dir().to_path_buf(),
        program,
        args,
    }
}

fn run_single_service(service: &ServiceSpec) -> Result<()> {
    println!(
        "{} Starting {} in {}...",
        "⚡".cyan().bold(),
        service.name.white().bold(),
        service.dir.display().to_string().dimmed()
    );
    println!(
        "  Command: {} {}\n",
        service.program.cyan(),
        service.args.join(" ").dimmed()
    );

    let status = Command::new(&service.program)
        .args(&service.args)
        .current_dir(&service.dir)
        .status()
        .with_context(|| format!("Failed to start service '{}'", service.name))?;

    if !status.success() {
        bail!("Service '{}' exited with code {:?}", service.name, status.code());
    }

    Ok(())
}

fn run_concurrent_services(services: Vec<ServiceSpec>) -> Result<()> {
    println!("{} Starting concurrent services:", "⚡".cyan().bold());
    for s in &services {
        println!(
            "  {} {} ({})",
            s.tag,
            s.name.white().bold(),
            s.dir.display().to_string().dimmed()
        );
    }
    println!(
        "\n{}\n",
        "  Press Ctrl+C to terminate all services gracefully."
            .dimmed()
            .italic()
    );

    let running = Arc::new(AtomicBool::new(true));
    let child_pids: Arc<Mutex<Vec<u32>>> = Arc::new(Mutex::new(Vec::new()));

    // Setup Ctrl+C handler
    {
        let running_clone = running.clone();
        let pids_clone = child_pids.clone();

        ctrlc::set_handler(move || {
            println!(
                "\n\n{} Gracefully stopping all Amoeba servers...",
                "⚡".yellow().bold()
            );
            running_clone.store(false, Ordering::SeqCst);

            if let Ok(pids) = pids_clone.lock() {
                for &pid in pids.iter() {
                    terminate_process_group(pid);
                }
            }

            thread::sleep(Duration::from_millis(500));
            std::process::exit(0);
        })
        .expect("Error setting Ctrl-C handler");
    }

    let mut handles = Vec::new();
    let mut children: Vec<(String, Child)> = Vec::new();

    for service in services {
        let tag = service.tag;
        let name = service.name.clone();

        let mut cmd = Command::new(&service.program);
        cmd.args(&service.args)
            .current_dir(&service.dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        #[cfg(unix)]
        {
            use std::os::unix::process::CommandExt;
            cmd.process_group(0);
        }

        let mut child = cmd
            .spawn()
            .with_context(|| format!("Failed to spawn process '{}'", name))?;

        let pid = child.id();
        if let Ok(mut pids) = child_pids.lock() {
            pids.push(pid);
        }

        // Stream stdout
        if let Some(stdout) = child.stdout.take() {
            let tag_clone = tag.clone();
            let handle = thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines() {
                    if let Ok(l) = line {
                        println!("{} {}", tag_clone, l);
                    }
                }
            });
            handles.push(handle);
        }

        // Stream stderr
        if let Some(stderr) = child.stderr.take() {
            let tag_clone = tag.clone();
            let handle = thread::spawn(move || {
                let reader = BufReader::new(stderr);
                for line in reader.lines() {
                    if let Ok(l) = line {
                        eprintln!("{} {}", tag_clone, l);
                    }
                }
            });
            handles.push(handle);
        }

        children.push((name, child));
    }

    // Monitor children
    while running.load(Ordering::SeqCst) {
        let mut all_exited = true;

        for (name, child) in children.iter_mut() {
            match child.try_wait() {
                Ok(Some(status)) => {
                    println!(
                        "{} Service '{}' exited with status {:?}",
                        "ℹ".yellow().bold(),
                        name,
                        status
                    );
                }
                Ok(None) => {
                    all_exited = false;
                }
                Err(err) => {
                    eprintln!("Error waiting on '{}': {}", name, err);
                }
            }
        }

        if all_exited {
            break;
        }

        thread::sleep(Duration::from_millis(200));
    }

    Ok(())
}

fn terminate_process_group(pid: u32) {
    #[cfg(unix)]
    unsafe {
        // Kill the process group with SIGINT first, then SIGTERM
        libc::kill(-(pid as i32), libc::SIGINT);
        thread::sleep(Duration::from_millis(50));
        libc::kill(-(pid as i32), libc::SIGTERM);
    }

    #[cfg(not(unix))]
    {
        let _ = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .output();
    }
}

fn start_monorepo(
    project: &DetectedProject,
    args: StartArgs,
    pm: crate::utils::project::PackageManager,
) -> Result<()> {
    let root = &project.root_dir;
    let script = if args.prod { "start" } else { "dev" };

    let (filter_desc, cmd_args) = if args.only_api {
        (
            "API package only",
            vec![
                "run".to_string(),
                script.to_string(),
                "--filter".to_string(),
                "...api...".to_string(),
            ],
        )
    } else if args.only_frontend {
        (
            "Frontend package only",
            vec![
                "run".to_string(),
                script.to_string(),
                "--filter".to_string(),
                "...web...".to_string(),
            ],
        )
    } else {
        ("All monorepo workspace packages", pm.run_script_args(script))
    };

    println!(
        "{} Starting tRPC Turborepo ({filter_desc}) in {}...",
        "⚡".cyan().bold(),
        root.display().to_string().dimmed()
    );
    println!(
        "  Command: {} {}\n",
        pm.name().cyan(),
        cmd_args.join(" ").dimmed()
    );

    let status = Command::new(pm.name())
        .args(&cmd_args)
        .current_dir(root)
        .status()
        .with_context(|| format!("Failed to start monorepo with '{}'", pm.name()))?;

    if !status.success() {
        bail!("Monorepo exited with code {:?}", status.code());
    }

    Ok(())
}
