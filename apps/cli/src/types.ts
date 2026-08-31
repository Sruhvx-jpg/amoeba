export type DatabaseEngine = "gorm" | "mongo";

export type WebFramework = "nextjs" | "react" | "vue" | "svelte" | "solid";

export type TauriFramework = "react" | "nextjs" | "vue" | "svelte" | "solid" | "vanilla";

export type FrontendFramework =
  | "nextjs"
  | "react"
  | "vue"
  | "svelte"
  | "solid"
  | "tauri"
  | "tauri-react"
  | "tauri-nextjs"
  | "tauri-vue"
  | "tauri-svelte"
  | "tauri-solid"
  | "tauri-vanilla"
  | "api-only";

export interface ScaffoldOptions {
  projectName: string;
  database: DatabaseEngine;
  frontend: FrontendFramework;
  tauriTemplate?: TauriFramework;
}

export interface CLIOptions {
  frontend?: string;
  db?: string;
  tauriTemplate?: string;
}
