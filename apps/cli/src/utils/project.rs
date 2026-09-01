use anyhow::{bail, Result};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PackageManager {
    Pnpm,
    Bun,
    Npm,
    Yarn,
}

impl PackageManager {
    pub fn name(&self) -> &'static str {
        match self {
            PackageManager::Pnpm => "pnpm",
            PackageManager::Bun => "bun",
            PackageManager::Npm => "npm",
            PackageManager::Yarn => "yarn",
        }
    }

    pub fn run_script_args(&self, script: &str) -> Vec<String> {
        vec!["run".to_string(), script.to_string()]
    }
}

pub fn is_command_available(cmd: &str) -> bool {
    Command::new(cmd)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

pub fn detect_package_manager(dir: &Path) -> PackageManager {
    // 1. Check local lockfiles
    if dir.join("pnpm-lock.yaml").exists() {
        return PackageManager::Pnpm;
    }
    if dir.join("bun.lockb").exists() || dir.join("bun.lock").exists() {
        return PackageManager::Bun;
    }
    if dir.join("yarn.lock").exists() {
        return PackageManager::Yarn;
    }
    if dir.join("package-lock.json").exists() {
        return PackageManager::Npm;
    }

    // 2. Check parent directory / monorepo root lockfiles
    if let Some(parent) = dir.parent() {
        if parent.join("pnpm-lock.yaml").exists() {
            return PackageManager::Pnpm;
        }
        if parent.join("bun.lockb").exists() || parent.join("bun.lock").exists() {
            return PackageManager::Bun;
        }
        if parent.join("yarn.lock").exists() {
            return PackageManager::Yarn;
        }
        if parent.join("package-lock.json").exists() {
            return PackageManager::Npm;
        }
    }

    // 3. Fallback to system availability (prefer pnpm > bun > npm > yarn)
    if is_command_available("pnpm") {
        PackageManager::Pnpm
    } else if is_command_available("bun") {
        PackageManager::Bun
    } else if is_command_available("npm") {
        PackageManager::Npm
    } else if is_command_available("yarn") {
        PackageManager::Yarn
    } else {
        PackageManager::Npm
    }
}

#[derive(Debug, Clone)]
pub enum ApiComponent {
    Go {
        dir: PathBuf,
        has_server_main: bool,
    },
    TypeScript {
        dir: PathBuf,
        package_manager: PackageManager,
    },
}

impl ApiComponent {
    pub fn dir(&self) -> &Path {
        match self {
            ApiComponent::Go { dir, .. } => dir,
            ApiComponent::TypeScript { dir, .. } => dir,
        }
    }

    pub fn build_command(&self) -> (String, Vec<String>) {
        match self {
            ApiComponent::Go {
                has_server_main, ..
            } => {
                let target = if *has_server_main {
                    "./cmd/server/main.go"
                } else {
                    "."
                };
                (
                    "go".to_string(),
                    vec![
                        "build".to_string(),
                        "-o".to_string(),
                        "bin/server".to_string(),
                        target.to_string(),
                    ],
                )
            }
            ApiComponent::TypeScript {
                package_manager, ..
            } => (
                package_manager.name().to_string(),
                package_manager.run_script_args("build"),
            ),
        }
    }

    pub fn start_command(&self, prod: bool) -> (String, Vec<String>) {
        match self {
            ApiComponent::Go {
                dir,
                has_server_main,
            } => {
                let bin_path = dir.join("bin/server");
                if prod && bin_path.exists() {
                    ("./bin/server".to_string(), vec![])
                } else {
                    let target = if *has_server_main {
                        "./cmd/server/main.go"
                    } else {
                        "."
                    };
                    (
                        "go".to_string(),
                        vec!["run".to_string(), target.to_string()],
                    )
                }
            }
            ApiComponent::TypeScript {
                package_manager, ..
            } => {
                let script = if prod { "start" } else { "dev" };
                (
                    package_manager.name().to_string(),
                    package_manager.run_script_args(script),
                )
            }
        }
    }
}

#[derive(Debug, Clone)]
pub enum FrontendComponent {
    Web {
        dir: PathBuf,
        package_manager: PackageManager,
        is_nextjs: bool,
    },
    Desktop {
        dir: PathBuf,
        package_manager: PackageManager,
    },
}

impl FrontendComponent {
    pub fn dir(&self) -> &Path {
        match self {
            FrontendComponent::Web { dir, .. } => dir,
            FrontendComponent::Desktop { dir, .. } => dir,
        }
    }

    pub fn label(&self) -> &'static str {
        match self {
            FrontendComponent::Web {
                is_nextjs: true, ..
            } => "Next.js Web Frontend",
            FrontendComponent::Web {
                is_nextjs: false, ..
            } => "Web Frontend",
            FrontendComponent::Desktop { .. } => "Tauri Desktop App",
        }
    }

    pub fn build_command(&self) -> (String, Vec<String>) {
        match self {
            FrontendComponent::Web {
                package_manager, ..
            } => (
                package_manager.name().to_string(),
                package_manager.run_script_args("build"),
            ),
            FrontendComponent::Desktop {
                package_manager, ..
            } => (
                package_manager.name().to_string(),
                package_manager.run_script_args("build"),
            ),
        }
    }

    pub fn start_command(&self, prod: bool) -> (String, Vec<String>) {
        match self {
            FrontendComponent::Web {
                package_manager,
                is_nextjs,
                ..
            } => {
                let script = if prod {
                    if *is_nextjs {
                        "start"
                    } else {
                        "preview"
                    }
                } else {
                    "dev"
                };
                (
                    package_manager.name().to_string(),
                    package_manager.run_script_args(script),
                )
            }
            FrontendComponent::Desktop {
                package_manager, ..
            } => (
                package_manager.name().to_string(),
                package_manager.run_script_args("dev"),
            ),
        }
    }
}

#[derive(Debug, Clone)]
pub enum ProjectKind {
    Fullstack {
        api: Option<ApiComponent>,
        frontend: Option<FrontendComponent>,
    },
    TrpcMonorepo {
        has_api: bool,
        has_web: bool,
        has_desktop: bool,
        package_manager: PackageManager,
    },
    SingleApi(ApiComponent),
    SingleFrontend(FrontendComponent),
}

#[derive(Debug, Clone)]
pub struct DetectedProject {
    pub root_dir: PathBuf,
    pub kind: ProjectKind,
}

fn is_nextjs_project(dir: &Path) -> bool {
    let pkg_path = dir.join("package.json");
    if let Ok(content) = fs::read_to_string(pkg_path) {
        content.contains("\"next\"")
    } else {
        false
    }
}

fn detect_api_in_dir(dir: &Path) -> Option<ApiComponent> {
    if dir.join("go.mod").exists() {
        let has_server_main = dir.join("cmd/server/main.go").exists()
            || dir.join("cmd/server").is_dir();
        return Some(ApiComponent::Go {
            dir: dir.to_path_buf(),
            has_server_main,
        });
    }

    if dir.join("package.json").exists() {
        let pm = detect_package_manager(dir);
        return Some(ApiComponent::TypeScript {
            dir: dir.to_path_buf(),
            package_manager: pm,
        });
    }

    None
}

fn detect_frontend_in_dir(dir: &Path) -> Option<FrontendComponent> {
    if !dir.exists() {
        return None;
    }

    if dir.join("src-tauri").is_dir() {
        let pm = detect_package_manager(dir);
        return Some(FrontendComponent::Desktop {
            dir: dir.to_path_buf(),
            package_manager: pm,
        });
    }

    if dir.join("package.json").exists() {
        let pm = detect_package_manager(dir);
        let is_next = is_nextjs_project(dir);
        return Some(FrontendComponent::Web {
            dir: dir.to_path_buf(),
            package_manager: pm,
            is_nextjs: is_next,
        });
    }

    None
}

pub fn detect_project(start_dir: &Path) -> Result<DetectedProject> {
    // 1. Walk up to locate Amoeba project root
    let mut current = start_dir.to_path_buf();

    loop {
        let has_apps_dir = current.join("apps").is_dir();
        let has_api = current.join("apps/api").is_dir();
        let has_web = current.join("apps/web").is_dir();
        let has_desktop = current.join("apps/desktop").is_dir();
        let has_workspace = current.join("pnpm-workspace.yaml").exists()
            || current.join("turbo.json").exists();

        if (has_apps_dir && (has_api || has_web || has_desktop)) || has_workspace {
            let root = current;

            if has_workspace {
                let pm = detect_package_manager(&root);
                return Ok(DetectedProject {
                    root_dir: root.clone(),
                    kind: ProjectKind::TrpcMonorepo {
                        has_api: root.join("apps/api").exists(),
                        has_web: root.join("apps/web").exists(),
                        has_desktop: root.join("apps/desktop").exists()
                            || root.join("apps/tauri-app").exists(),
                        package_manager: pm,
                    },
                });
            }

            let api = detect_api_in_dir(&root.join("apps/api"));
            let frontend = detect_frontend_in_dir(&root.join("apps/web"))
                .or_else(|| detect_frontend_in_dir(&root.join("apps/desktop")));

            return Ok(DetectedProject {
                root_dir: root,
                kind: ProjectKind::Fullstack { api, frontend },
            });
        }

        match current.parent() {
            Some(parent) => current = parent.to_path_buf(),
            None => break,
        }
    }

    // 2. Check if the current directory is a standalone API or Frontend
    if let Some(api) = detect_api_in_dir(start_dir) {
        return Ok(DetectedProject {
            root_dir: start_dir.to_path_buf(),
            kind: ProjectKind::SingleApi(api),
        });
    }

    if let Some(fe) = detect_frontend_in_dir(start_dir) {
        return Ok(DetectedProject {
            root_dir: start_dir.to_path_buf(),
            kind: ProjectKind::SingleFrontend(fe),
        });
    }

    bail!(
        "No Amoeba project found in '{}' or its parent directories.\nMake sure you are inside an Amoeba workspace or project directory.",
        start_dir.display()
    );
}
