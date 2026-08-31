import pc from "picocolors";

const BANNER_ART = `
  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ 
 ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
 ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║
 ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║
 ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║
 ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝
`;

export function getBannerText(version = "0.1.0"): string {
  const lines = BANNER_ART.trim().split("\n");
  const colored = lines
    .map((line, idx) => {
      if (idx < 2) return pc.cyan(pc.bold(line));
      if (idx < 4) return pc.blue(pc.bold(line));
      return pc.magenta(pc.bold(line));
    })
    .join("\n");

  return `${colored}\n  ${pc.bold(pc.white("Amoeba Framework"))} ${pc.dim(`v${version}`)}  ${pc.dim("—")}  ${pc.italic(pc.cyan("Go Fiber v3 + Modern Frontends"))}\n`;
}

export function printBanner(version = "0.1.0"): void {
  console.log(getBannerText(version));
}
