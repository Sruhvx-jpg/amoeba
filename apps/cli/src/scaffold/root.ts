import * as path from "node:path";
import { writeFileWithDir } from "../utils/fs.js";
import type { ScaffoldOptions } from "../types.js";

export async function writeRootFiles(baseDir: string, opts: ScaffoldOptions): Promise<void> {
  const dbLabel = opts.database === "mongo" ? "MongoDB" : "PostgreSQL (GORM)";
  const frontendPath = opts.frontend === "tauri" ? "apps/desktop" : "apps/web";

  const readme = `# ${opts.projectName} (Built with Amoeba Framework ⚡)

A high-performance full-stack application.

## 🚀 Apps

- **Backend**: \`apps/api\` (Go Fiber v3 + ${dbLabel})
${opts.frontend !== "api-only" ? `- **Frontend**: \`${frontendPath}\` (${opts.frontend})\n` : ""}
## 🛠 Getting Started

### 1. Start the API Server
\`\`\`bash
cd apps/api
go run ./cmd/server/main.go
\`\`\`
${
  opts.frontend !== "api-only"
    ? `
### 2. Start the Frontend
\`\`\`bash
cd ${frontendPath}
pnpm install
pnpm dev
\`\`\`
`
    : ""
}`;

  await writeFileWithDir(path.join(baseDir, "README.md"), readme);
}
