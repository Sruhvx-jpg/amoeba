use anyhow::{Context, Result};
use std::fs;
use std::path::Path;

pub fn write_file(path: impl AsRef<Path>, content: &str) -> Result<()> {
    let path = path.as_ref();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create parent directories for {}", path.display()))?;
    }
    fs::write(path, content)
        .with_context(|| format!("Failed to write file to {}", path.display()))?;
    Ok(())
}

#[allow(dead_code)]
pub fn ensure_dirs(dirs: &[impl AsRef<Path>]) -> Result<()> {
    for dir in dirs {
        fs::create_dir_all(dir.as_ref())
            .with_context(|| format!("Failed to create directory {}", dir.as_ref().display()))?;
    }
    Ok(())
}

pub fn path_exists(path: impl AsRef<Path>) -> bool {
    path.as_ref().exists()
}

pub fn remove_dir_all_if_exists(path: impl AsRef<Path>) -> Result<()> {
    let path = path.as_ref();
    if path.exists() {
        fs::remove_dir_all(path)
            .with_context(|| format!("Failed to remove directory {}", path.display()))?;
    }
    Ok(())
}
