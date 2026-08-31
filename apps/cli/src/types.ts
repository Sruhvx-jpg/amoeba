export type DatabaseEngine = "gorm" | "mongo";

export type FrontendFramework = "nextjs" | "tauri" | "react" | "api-only";

export interface ScaffoldOptions {
  projectName: string;
  database: DatabaseEngine;
  frontend: FrontendFramework;
}

export interface CLIOptions {
  frontend?: string;
  db?: string;
}
