mod banner;
mod cli;
mod commands;
mod prompts;
mod scaffold;
mod types;
mod utils;

use clap::Parser;
use cli::{Cli, Commands, NewArgs, NewSubcommand};
use colored::Colorize;

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Some(Commands::New(args)) => {
            if let Some(NewSubcommand::Pkg { name }) = args.sub {
                commands::pkg::handle_new_pkg_command(&name)
            } else {
                commands::new::handle_new_command(args)
            }
        }
        Some(Commands::Build(args)) => commands::build::handle_build_command(args),
        Some(Commands::Start(args)) => commands::start::handle_start_command(args),
        Some(Commands::Db(args)) => commands::db::handle_db_command(args.command),
        Some(Commands::Generate) => commands::db::handle_db_command(cli::DbSubcommand::Generate),
        Some(Commands::Migrate) => commands::db::handle_db_command(cli::DbSubcommand::Migrate),
        Some(Commands::Studio) => commands::db::handle_db_command(cli::DbSubcommand::Studio),
        Some(Commands::Update) => commands::update::handle_update_command(),
        Some(Commands::Version) => {
            println!("amoeba proteus v{}", env!("CARGO_PKG_VERSION"));
            Ok(())
        }
        None => {
            // Default interactive new command if run without subcommands
            commands::new::handle_new_command(NewArgs::default())
        }
    };

    if let Err(err) = result {
        eprintln!("\n{} {}", "Error:".red().bold(), err);
        std::process::exit(1);
    }
}
