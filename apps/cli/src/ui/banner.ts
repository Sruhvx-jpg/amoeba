import pc from "picocolors";

const BANNER_ART = `
  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ 
 ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
 ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║
 ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║
 ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║
 ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝
`;

export function printBanner(version = "0.1.0"): void {
  const lines = BANNER_ART.trim().split("\n");
  const colored = lines.map((line, idx) => {
    // Subtle cyan to blue gradient feel
    if (idx < 2) return pc.cyan(pc.bold(line));
    if (idx < 4) return pc.blue(pc.bold(line));
    return pc.magenta(pc.bold(line));
  }).join("\n");

  console.log(colored);
  console.log(
    `  ${pc.bold(pc.white("Amoeba Framework"))} ${pc.dim(`v${version}`)}  ${pc.dim("—")}  ${pc.italic(pc.cyan("Go Fiber v3 + Modern Frontends"))}\n`
  );
}
