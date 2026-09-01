use anyhow::{Context, Result};
use colored::Colorize;
use std::fs;
use std::path::Path;

use crate::types::MonorepoFrontend;
use crate::utils::fs::remove_dir_all_if_exists;
use crate::utils::git::clone_repo;

const MONOREPO_REPO_URL: &str = "https://github.com/Sruhvx-jpg/monoreop-tRPC.git";

pub fn scaffold_trpc_monorepo(
    base_dir: &Path,
    project_name: &str,
    frontend: MonorepoFrontend,
) -> Result<()> {
    println!(
        "\n{} Cloning official tRPC monorepo scaffold from {}...",
        "⚡ Amoeba:".cyan().bold(),
        MONOREPO_REPO_URL.yellow()
    );

    // 1. Clone repository
    clone_repo(MONOREPO_REPO_URL, base_dir)
        .with_context(|| format!("Failed to clone monorepo scaffold into {}", base_dir.display()))?;

    // 2. Adjust frontend apps based on user choice
    match frontend {
        MonorepoFrontend::WebApp => {
            println!(
                "{} Configuring for Web App only (removing desktop Tauri app)...",
                "⚡ Amoeba:".cyan().bold()
            );
            remove_dir_all_if_exists(base_dir.join("apps").join("tauri-app"))?;
            adjust_package_json(base_dir, project_name, Some("tauri-app"))?;
        }
        MonorepoFrontend::TauriApp => {
            println!(
                "{} Configuring for Tauri Desktop App only (removing Next.js web app)...",
                "⚡ Amoeba:".cyan().bold()
            );
            remove_dir_all_if_exists(base_dir.join("apps").join("web"))?;
            adjust_package_json(base_dir, project_name, Some("web"))?;
        }
        MonorepoFrontend::Both => {
            println!(
                "{} Keeping both Web and Tauri Desktop applications.",
                "⚡ Amoeba:".cyan().bold()
            );
            adjust_package_json(base_dir, project_name, None)?;
        }
    }

    // 3. Make setup.sh executable if on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let setup_path = base_dir.join("setup.sh");
        if setup_path.exists() {
            if let Ok(metadata) = fs::metadata(&setup_path) {
                let mut perms = metadata.permissions();
                perms.set_mode(0o755);
                let _ = fs::set_permissions(&setup_path, perms);
            }
        }
    }

    // 4. Update README.md
    let readme_path = base_dir.join("README.md");
    if readme_path.exists() {
        let original = fs::read_to_string(&readme_path).unwrap_or_default();
        let updated = original.replace("tRPC Monorepo Scaffold", &format!("{project_name} (Amoeba tRPC Monorepo)"));
        let _ = fs::write(&readme_path, updated);
    }

    Ok(())
}

fn adjust_package_json(
    base_dir: &Path,
    project_name: &str,
    removed_app: Option<&str>,
) -> Result<()> {
    let pkg_json_path = base_dir.join("package.json");
    if !pkg_json_path.exists() {
        return Ok(());
    }

    let content = fs::read_to_string(&pkg_json_path)?;
    let mut json: serde_json::Value = serde_json::from_str(&content)?;

    if let Some(obj) = json.as_object_mut() {
        obj.insert("name".to_string(), serde_json::Value::String(project_name.to_string()));

        // Filter out scripts for the removed app if applicable
        if let Some(removed) = removed_app {
            if let Some(scripts) = obj.get_mut("scripts").and_then(|s| s.as_object_mut()) {
                let keys_to_remove: Vec<String> = scripts
                    .keys()
                    .filter(|k| k.contains(removed))
                    .cloned()
                    .collect();
                for key in keys_to_remove {
                    scripts.remove(&key);
                }
            }
        }
    }

    let serialized = serde_json::to_string_pretty(&json)?;
    fs::write(pkg_json_path, serialized)?;
    Ok(())
}
