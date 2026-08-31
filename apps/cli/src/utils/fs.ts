import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function writeFileWithDir(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, { encoding: "utf8" });
}

export async function ensureDirs(dirs: string[]): Promise<void> {
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}
