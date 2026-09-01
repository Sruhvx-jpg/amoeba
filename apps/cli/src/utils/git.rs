use anyhow::{bail, Context, Result};
use std::path::Path;
use std::process::Command;

pub fn clone_repo(repo_url: &str, dest_dir: impl AsRef<Path>) -> Result<()> {
    let dest_dir = dest_dir.as_ref();
    let status = Command::new("git")
        .args([
            "clone",
            "--depth",
            "1",
            repo_url,
            dest_dir.to_str().context("Invalid target path")?,
        ])
        .status()
        .context("Failed to execute git command. Ensure git is installed.")?;

    if !status.success() {
        bail!("Failed to clone repository from {}", repo_url);
    }

    // Clean up .git directory so the user starts with a clean slate
    let git_dir = dest_dir.join(".git");
    if git_dir.exists() {
        let _ = std::fs::remove_dir_all(&git_dir);
    }

    Ok(())
}
