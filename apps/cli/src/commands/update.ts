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

  // 1. Check for CLI Release & Patch updates from GitHub
  s.start("Checking for latest release & patch updates from GitHub...");
  const releaseService = new ReleaseService();
  const releaseInfo = await releaseService.checkLatestRelease(CLI_VERSION);
  s.stop(pc.green("✔ Release check complete"));

  if (releaseInfo.hasUpdate) {
    const typeLabel = releaseInfo.isPrerelease
      ? pc.magenta(`[${releaseInfo.updateType} beta/prerelease]`)
      : pc.cyan(`[${releaseInfo.updateType} release]`);

    const updateDetails = [
      `${pc.bold("Current Version:")}  ${pc.dim(`v${releaseInfo.currentVersion}`)}`,
      `${pc.bold("Latest Version:")}   ${pc.green(pc.bold(`v${releaseInfo.latestVersion}`))} ${typeLabel}`,
      releaseInfo.releaseName ? `${pc.bold("Title:")}            ${pc.white(releaseInfo.releaseName)}` : "",
      releaseInfo.releaseUrl ? `${pc.bold("Release Notes:")}    ${pc.blue(releaseInfo.releaseUrl)}` : "",
      releaseInfo.releaseNotes
        ? `\n${pc.bold("Changelog Snippet:")}\n${pc.dim(releaseInfo.releaseNotes.slice(0, 250))}${releaseInfo.releaseNotes.length > 250 ? "..." : ""}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    p.note(updateDetails, "⚡ New Amoeba Release Detected");

    // Check if in git repo and can pull latest
    const isGit = await pathExists(path.join(process.cwd(), ".git"));
    if (isGit && process.stdin.isTTY) {
      const shouldPull = await p.confirm({
        message: "Would you like to pull the latest changes and rebuild the CLI?",
        initialValue: true,
      });

      if (!p.isCancel(shouldPull) && shouldPull) {
        s.start("Pulling latest release and rebuilding CLI...");
        try {
          await execAsync("git fetch --tags && git pull");
          await execAsync("pnpm --filter amoeba-cli build");
          s.stop(pc.green("✔ CLI successfully updated to latest release!"));
        } catch (err) {
          s.stop(pc.yellow("⚠ Could not automatically rebuild CLI."));
          p.log.warn(err instanceof Error ? err.message : String(err));
        }
      }
    }
  } else {
    p.log.info(
      `${pc.green("✔")} Amoeba CLI is currently running the latest release (${pc.cyan(`v${CLI_VERSION}`)}${releaseInfo.isPrerelease ? " beta" : ""})`
    );
  }

  // 2. Check for local Amoeba project components (API & Frontend)
  const cwd = process.cwd();
  const apiDir = path.join(cwd, "apps", "api");
  const webDir = path.join(cwd, "apps", "web");
  const desktopDir = path.join(cwd, "apps", "desktop");

  const hasAPI = await pathExists(path.join(apiDir, "go.mod"));
  const hasWeb = await pathExists(path.join(webDir, "package.json"));
  const hasDesktop = await pathExists(path.join(desktopDir, "package.json"));

  if (!hasAPI && !hasWeb && !hasDesktop) {
    p.log.step(
      pc.dim("No local project dependencies to update (current directory is not an Amoeba project).")
    );
    p.outro(pc.bold(pc.green("⚡ Update check complete!")));
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
