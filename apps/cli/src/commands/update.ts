import * as p from "@clack/prompts";
import pc from "picocolors";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { printBanner } from "../ui/banner.js";
import { ReleaseService } from "../services/release.js";

const execAsync = promisify(exec);
const CLI_VERSION = "0.1.0";

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function handleUpdateCommand(): Promise<void> {
  printBanner(CLI_VERSION);

  p.intro(pc.bgCyan(pc.black(" 🔄 Amoeba Project & CLI Updater ")));

  const s = p.spinner();

  // 1. Check for CLI Release / Patch updates
  s.start("Checking for CLI release & patch updates...");
  const releaseService = new ReleaseService();
  const releaseInfo = await releaseService.checkLatestRelease(CLI_VERSION);
  s.stop(pc.green("✔ Release check complete"));

  if (releaseInfo.hasUpdate) {
    const typeColor =
      releaseInfo.updateType === "major"
        ? pc.red
        : releaseInfo.updateType === "minor"
        ? pc.yellow
        : pc.cyan;

    const message = [
      `${pc.bold("New update available:")} ${pc.dim(`v${releaseInfo.currentVersion}`)} → ${typeColor(pc.bold(`v${releaseInfo.latestVersion}`))} (${releaseInfo.updateType} release)`,
      releaseInfo.releaseUrl ? `${pc.bold("Release details:")}      ${pc.blue(releaseInfo.releaseUrl)}` : "",
      releaseInfo.releaseNotes ? `\n${pc.bold("Changelog:")}\n${pc.dim(releaseInfo.releaseNotes.slice(0, 300))}` : "",
      `\n${pc.bold("To update Amoeba CLI run:")}\n  ${pc.cyan("git pull && pnpm --filter amoeba-cli build")}`,
    ]
      .filter(Boolean)
      .join("\n");

    p.note(message, "⚡ CLI Update Available");
  } else {
    p.log.info(pc.dim(`Amoeba CLI is up to date (v${CLI_VERSION})`));
  }

  // 2. Check for local Amoeba project components
  const cwd = process.cwd();
  const apiDir = path.join(cwd, "apps", "api");
  const webDir = path.join(cwd, "apps", "web");
  const desktopDir = path.join(cwd, "apps", "desktop");

  const hasAPI = await pathExists(path.join(apiDir, "go.mod"));
  const hasWeb = await pathExists(path.join(webDir, "package.json"));
  const hasDesktop = await pathExists(path.join(desktopDir, "package.json"));

  if (!hasAPI && !hasWeb && !hasDesktop) {
    p.log.step(
      pc.dim("No local project dependencies to update (not inside an Amoeba workspace directory).")
    );
    p.outro(pc.bold(pc.green("✔ Check finished!")));
    return;
  }

  // 3. Update Go API dependencies
  if (hasAPI) {
    s.start("Updating Go backend dependencies (Fiber v3 & database drivers)...");
    try {
      await execAsync("go get -u ./... && go mod tidy", { cwd: apiDir });
      s.stop(pc.green("✔ Go backend dependencies updated"));
    } catch (err) {
      s.stop(pc.red("✖ Failed to update Go dependencies"));
      p.log.error(err instanceof Error ? err.message : String(err));
    }
  }

  // 4. Update Frontend dependencies
  const frontendDir = hasWeb ? webDir : hasDesktop ? desktopDir : null;
  const frontendName = hasWeb ? "Web (apps/web)" : hasDesktop ? "Desktop (apps/desktop)" : null;

  if (frontendDir && frontendName) {
    s.start(`Updating frontend dependencies in ${frontendName}...`);
    try {
      let updateCmd = "pnpm up --latest";
      try {
        await execAsync("pnpm --version");
      } catch {
        updateCmd = "npm update";
      }

      await execAsync(updateCmd, { cwd: frontendDir });
      s.stop(pc.green(`✔ ${frontendName} dependencies updated`));
    } catch (err) {
      s.stop(pc.red(`✖ Failed to update ${frontendName} dependencies`));
      p.log.error(err instanceof Error ? err.message : String(err));
    }
  }

  p.outro(pc.bold(pc.green("⚡ All Amoeba components up to date!")));
}
