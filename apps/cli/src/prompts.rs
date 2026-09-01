use anyhow::{bail, Result};
use colored::Colorize;
use inquire::{Select, Text};

use crate::types::{
    ArchStyle, BackendLang, DatabaseEngine, FrontendFramework, MonorepoFrontend, TauriFlavor,
};

pub fn prompt_project_name(default_name: Option<String>) -> Result<String> {
    let mut prompt = Text::new("What is the name of your project?");
    let def = default_name.unwrap_or_else(|| "my-amoeba-app".to_string());
    prompt = prompt.with_default(&def);

    let name = prompt.prompt()?;
    let trimmed = name.trim();

    if trimmed.is_empty() {
        bail!("Project name cannot be empty");
    }

    if !trimmed
        .chars()
        .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
    {
        bail!("Project name can only contain alphanumeric characters, dashes, and underscores");
    }

    Ok(trimmed.to_string())
}

pub fn prompt_backend_lang() -> Result<BackendLang> {
    let options = vec![BackendLang::Go, BackendLang::TypeScript];
    println!(
        "\n{} {}",
        "[1/4]".cyan().bold(),
        "Choose backend language:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_ts_arch() -> Result<ArchStyle> {
    let options = vec![ArchStyle::RestApi, ArchStyle::TrpcMonorepo];
    println!(
        "\n{} {}",
        "[2/4]".cyan().bold(),
        "Choose TypeScript architecture:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_go_database() -> Result<DatabaseEngine> {
    let options = vec![DatabaseEngine::Gorm, DatabaseEngine::MongoGo];
    println!(
        "\n{} {}",
        "[2/4]".cyan().bold(),
        "Choose database engine:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_ts_rest_database() -> Result<DatabaseEngine> {
    let options = vec![DatabaseEngine::Drizzle, DatabaseEngine::Mongoose];
    println!(
        "\n{} {}",
        "[3/4]".cyan().bold(),
        "Choose database ORM setup:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_frontend() -> Result<FrontendFramework> {
    let options = vec![
        FrontendFramework::NextJs,
        FrontendFramework::React,
        FrontendFramework::Tauri,
        FrontendFramework::ApiOnly,
    ];
    println!(
        "\n{} {}",
        "Frontend".cyan().bold(),
        "Choose frontend application:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_tauri_flavor() -> Result<TauriFlavor> {
    let options = vec![
        TauriFlavor::React,
        TauriFlavor::NextJs,
        TauriFlavor::Vue,
        TauriFlavor::Svelte,
        TauriFlavor::Solid,
        TauriFlavor::Vanilla,
    ];
    println!(
        "\n{} {}",
        "Tauri 2.0".cyan().bold(),
        "Choose desktop UI framework:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}

pub fn prompt_monorepo_frontend() -> Result<MonorepoFrontend> {
    let options = vec![
        MonorepoFrontend::WebApp,
        MonorepoFrontend::TauriApp,
        MonorepoFrontend::Both,
    ];
    println!(
        "\n{} {}",
        "[3/4]".cyan().bold(),
        "Choose frontend application(s) for tRPC monorepo:".white().bold()
    );
    let choice = Select::new("", options).prompt()?;
    Ok(choice)
}
