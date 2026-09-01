use colored::Colorize;

const BANNER_ART: &str = r#"
  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ 
 ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
 ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║
 ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║
 ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║
 ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝
"#;

pub fn print_banner(version: &str) {
    let lines: Vec<&str> = BANNER_ART.trim().split('\n').collect();
    for (idx, line) in lines.iter().enumerate() {
        if idx < 2 {
            println!("{}", line.cyan().bold());
        } else if idx < 4 {
            println!("{}", line.blue().bold());
        } else {
            println!("{}", line.magenta().bold());
        }
    }
    println!(
        "  {} {} {} {}\n",
        "Amoeba Proteus".white().bold(),
        format!("v{}", version).dimmed(),
        "—".dimmed(),
        "Blazing Fullstack Scaffolding for Go & TypeScript".cyan().italic()
    );
}
