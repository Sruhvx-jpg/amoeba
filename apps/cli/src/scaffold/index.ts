import * as path from "node:path";
import { ensureDirs } from "../utils/fs.js";
import { writeAPIFiles } from "./api.js";
import { writeNextJSTemplate, writeReactTemplate, writeTauriTemplate } from "./frontend.js";
import { writeRootFiles } from "./root.js";
import type { ScaffoldOptions } from "../types.js";

export async function generateProject(opts: ScaffoldOptions): Promise<void> {
  const baseDir = path.resolve(process.cwd(), opts.projectName);

  // 1. Create API directory structure
  const dirs = [
    path.join(baseDir, "apps", "api", "cmd", "server"),
    path.join(baseDir, "apps", "api", "internal", "config"),
    path.join(baseDir, "apps", "api", "internal", "database"),
    path.join(baseDir, "apps", "api", "internal", "schema"),
    path.join(baseDir, "apps", "api", "internal", "types"),
    path.join(baseDir, "apps", "api", "internal", "service"),
    path.join(baseDir, "apps", "api", "internal", "routes"),
    path.join(baseDir, "apps", "api", "pkg", "response"),
  ];

  await ensureDirs(dirs);

  // 2. Write Go API files
  await writeAPIFiles(baseDir, opts);

  // 3. Write Frontend if selected
  switch (opts.frontend) {
    case "nextjs":
      await writeNextJSTemplate(baseDir, opts.projectName);
      break;
    case "tauri":
      await writeTauriTemplate(baseDir, opts.projectName);
      break;
    case "react":
      await writeReactTemplate(baseDir, opts.projectName);
      break;
    case "api-only":
      break;
  }

  // 4. Write Root files
  await writeRootFiles(baseDir, opts);
}
