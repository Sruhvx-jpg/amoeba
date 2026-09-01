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
        Some(Commands::Update) => commands::update::handle_update_command(),
        Some(Commands::Version) => {
            println!("amoeba v0.2.0");
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
