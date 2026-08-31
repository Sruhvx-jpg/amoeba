export interface ReleaseInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType: "major" | "minor" | "patch" | "prerelease" | "none";
  isPrerelease: boolean;
  releaseName?: string;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
}

interface GitHubReleaseResponse {
  tag_name?: string;
  name?: string;
  html_url?: string;
  body?: string;
  published_at?: string;
  prerelease?: boolean;
  draft?: boolean;
}

interface GitHubTagResponse {
  name: string;
}

function parseSemver(version: string): { major: number; minor: number; patch: number; prerelease?: string } | null {
  const clean = version.replace(/^v/, "").trim();
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return null;
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

function compareSemver(
  current: string,
  latest: string
): "major" | "minor" | "patch" | "prerelease" | "none" {
  const c = parseSemver(current);
  const l = parseSemver(latest);

  if (!c || !l) {
    return current !== latest ? "patch" : "none";
  }

  if (l.major > c.major) return "major";
  if (l.major < c.major) return "none";

  if (l.minor > c.minor) return "minor";
  if (l.minor < c.minor) return "none";

  if (l.patch > c.patch) return "patch";
  if (l.patch < c.patch) return "none";

  if (!c.prerelease && l.prerelease) return "none";
  if (c.prerelease && !l.prerelease) return "patch";
  if (c.prerelease && l.prerelease && c.prerelease !== l.prerelease) return "prerelease";

  return "none";
}

export class ReleaseService {
  private readonly repo: string;
  private readonly timeoutMs: number;

  constructor(repo = "Sruhvx-jpg/amoeba", timeoutMs = 4000) {
    this.repo = repo;
    this.timeoutMs = timeoutMs;
  }

  public async checkLatestRelease(currentVersion: string): Promise<ReleaseInfo> {
    try {
      // 1. Check all GitHub releases (includes prereleases and betas)
      const releasesRes = await fetch(`https://api.github.com/repos/${this.repo}/releases`, {
        headers: {
          "User-Agent": "amoeba-cli",
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (releasesRes.ok) {
        const releases = (await releasesRes.json()) as GitHubReleaseResponse[];
        const validReleases = releases.filter((r) => !r.draft && r.tag_name);

        if (validReleases.length > 0) {
          const newest = validReleases[0]!;
          const latestVersion = (newest.tag_name ?? "").replace(/^v/, "").trim();
          const updateType = compareSemver(currentVersion, latestVersion);
          const hasUpdate = updateType !== "none";

          return {
            currentVersion,
            latestVersion: latestVersion || currentVersion,
            hasUpdate,
            updateType,
            isPrerelease: Boolean(newest.prerelease),
            releaseName: newest.name ?? undefined,
            releaseUrl: newest.html_url ?? `https://github.com/${this.repo}/releases/tag/${newest.tag_name}`,
            releaseNotes: newest.body ?? undefined,
            publishedAt: newest.published_at ?? undefined,
          };
        }
      }

      // 2. Fallback to Git Tags if no releases found
      const tagsRes = await fetch(`https://api.github.com/repos/${this.repo}/tags`, {
        headers: {
          "User-Agent": "amoeba-cli",
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (tagsRes.ok) {
        const tags = (await tagsRes.json()) as GitHubTagResponse[];
        if (tags.length > 0) {
          const newestTag = tags[0]!.name.replace(/^v/, "").trim();
          const updateType = compareSemver(currentVersion, newestTag);
          const hasUpdate = updateType !== "none";

          return {
            currentVersion,
            latestVersion: newestTag || currentVersion,
            hasUpdate,
            updateType,
            isPrerelease: false,
            releaseUrl: `https://github.com/${this.repo}/releases/tag/${tags[0]!.name}`,
          };
        }
      }

      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        updateType: "none",
        isPrerelease: false,
      };
    } catch {
      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        updateType: "none",
        isPrerelease: false,
      };
    }
  }
}
