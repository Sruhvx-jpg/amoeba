export interface ReleaseInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  updateType: "major" | "minor" | "patch" | "none";
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
}

interface GitHubReleaseResponse {
  tag_name?: string;
  html_url?: string;
  body?: string;
  published_at?: string;
}

function parseSemver(version: string): [number, number, number] | null {
  const clean = version.replace(/^v/, "").trim();
  const parts = clean.split(".").map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some((n) => isNaN(n))) {
    return null;
  }
  return [parts[0]!, parts[1]!, parts[2]!];
}

function compareSemver(current: string, latest: string): "major" | "minor" | "patch" | "none" {
  const c = parseSemver(current);
  const l = parseSemver(latest);

  if (!c || !l) {
    return current !== latest ? "patch" : "none";
  }

  const [cMajor, cMinor, cPatch] = c;
  const [lMajor, lMinor, lPatch] = l;

  if (lMajor > cMajor) return "major";
  if (lMajor === cMajor && lMinor > cMinor) return "minor";
  if (lMajor === cMajor && lMinor === cMinor && lPatch > cPatch) return "patch";

  return "none";
}

export class ReleaseService {
  private readonly repo: string;
  private readonly timeoutMs: number;

  constructor(repo = "Sruhvx-jpg/amoeba", timeoutMs = 3500) {
    this.repo = repo;
    this.timeoutMs = timeoutMs;
  }

  public async checkLatestRelease(currentVersion: string): Promise<ReleaseInfo> {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repo}/releases/latest`, {
        headers: {
          "User-Agent": "amoeba-cli",
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        return {
          currentVersion,
          latestVersion: currentVersion,
          hasUpdate: false,
          updateType: "none",
        };
      }

      const data = (await response.json()) as GitHubReleaseResponse;
      const rawTag = data.tag_name ?? "";
      const latestVersion = rawTag.replace(/^v/, "").trim() || currentVersion;

      const updateType = compareSemver(currentVersion, latestVersion);
      const hasUpdate = updateType !== "none";

      return {
        currentVersion,
        latestVersion,
        hasUpdate,
        updateType,
        releaseUrl: data.html_url,
        releaseNotes: data.body ?? undefined,
        publishedAt: data.published_at ?? undefined,
      };
    } catch {
      // Silently fall back if offline or rate limited
      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        updateType: "none",
      };
    }
  }
}
