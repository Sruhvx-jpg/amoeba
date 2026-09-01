use anyhow::Result;
use std::path::Path;

use crate::types::TauriFlavor;
use crate::utils::fs::write_file;

pub fn write_nextjs_template(base_dir: &Path, project_name: &str) -> Result<()> {
    let web_dir = base_dir.join("apps").join("web");

    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {{
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start"
  }},
  "dependencies": {{
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }},
  "devDependencies": {{
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.7.0"
  }}
}}
"#
    );
    write_file(web_dir.join("package.json"), &pkg_json)?;

    let next_config = r#"import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
"#;
    write_file(web_dir.join("next.config.ts"), next_config)?;

    let tsconfig = r#"{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"#;
    write_file(web_dir.join("tsconfig.json"), tsconfig)?;

    let layout_tsx = r#"import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amoeba App",
  description: "Built with Amoeba Framework",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
"#;
    write_file(web_dir.join("src/app/layout.tsx"), layout_tsx)?;

    let page_tsx = r#"export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-zinc-50">
      <h1 className="text-4xl font-bold mb-4">⚡ Amoeba Framework</h1>
      <p className="text-zinc-400">High-Performance Fullstack Architecture</p>
    </main>
  );
}
"#;
    write_file(web_dir.join("src/app/page.tsx"), page_tsx)?;

    let globals_css = r#"@tailwind base;
@tailwind components;
@tailwind utilities;
"#;
    write_file(web_dir.join("src/app/globals.css"), globals_css)?;

    let tailwind_config = r#"import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
"#;
    write_file(web_dir.join("tailwind.config.ts"), tailwind_config)?;

    let postcss_config = r#"export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"#;
    write_file(web_dir.join("postcss.config.mjs"), postcss_config)?;

    Ok(())
}

pub fn write_react_template(base_dir: &Path, project_name: &str) -> Result<()> {
    let web_dir = base_dir.join("apps").join("web");

    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }},
  "dependencies": {{
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }},
  "devDependencies": {{
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }}
}}
"#
    );
    write_file(web_dir.join("package.json"), &pkg_json)?;

    let vite_config = r#"import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
"#;
    write_file(web_dir.join("vite.config.ts"), vite_config)?;

    let tsconfig = r#"{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
"#;
    write_file(web_dir.join("tsconfig.json"), tsconfig)?;

    let index_html = format!(
        r#"<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{project_name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"#
    );
    write_file(web_dir.join("index.html"), &index_html)?;

    let main_tsx = r#"import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"#;
    write_file(web_dir.join("src/main.tsx"), main_tsx)?;

    let app_tsx = r#"export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50">
      <h1 className="text-4xl font-bold mb-4">⚡ Amoeba Framework</h1>
      <p className="text-zinc-400">React + Vite + TypeScript</p>
    </div>
  );
}
"#;
    write_file(web_dir.join("src/App.tsx"), app_tsx)?;

    let index_css = r#"@tailwind base;
@tailwind components;
@tailwind utilities;
"#;
    write_file(web_dir.join("src/index.css"), index_css)?;

    let tailwind_config = r#"/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"#;
    write_file(web_dir.join("tailwind.config.js"), tailwind_config)?;

    let postcss_config = r#"export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"#;
    write_file(web_dir.join("postcss.config.js"), postcss_config)?;

    Ok(())
}

pub fn write_tauri_template(
    base_dir: &Path,
    project_name: &str,
    flavor: TauriFlavor,
) -> Result<()> {
    let desktop_dir = base_dir.join("apps").join("desktop");
    let identifier: String = project_name
        .chars()
        .filter(|c| c.is_alphanumeric())
        .collect::<String>()
        .to_lowercase();

    // 1. Rust Cargo & Tauri Config
    write_tauri_rust_files(&desktop_dir, project_name, &identifier, flavor)?;

    // 2. Frontend UI flavor
    match flavor {
        TauriFlavor::NextJs => write_tauri_nextjs_ui(&desktop_dir, project_name)?,
        TauriFlavor::Vue => write_tauri_vue_ui(&desktop_dir, project_name)?,
        TauriFlavor::Svelte => write_tauri_svelte_ui(&desktop_dir, project_name)?,
        TauriFlavor::Solid => write_tauri_solid_ui(&desktop_dir, project_name)?,
        TauriFlavor::Vanilla => write_tauri_vanilla_ui(&desktop_dir, project_name)?,
        TauriFlavor::React => write_tauri_react_ui(&desktop_dir, project_name)?,
    }

    Ok(())
}

fn write_tauri_rust_files(
    desktop_dir: &Path,
    project_name: &str,
    identifier: &str,
    flavor: TauriFlavor,
) -> Result<()> {
    let (dev_url, frontend_dist) = match flavor {
        TauriFlavor::NextJs => ("http://localhost:3000", "../out"),
        _ => ("http://localhost:5173", "../dist"),
    };

    let tauri_conf = serde_json::json!({
        "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/schema.json",
        "productName": project_name,
        "version": "0.1.0",
        "identifier": format!("com.amoeba.{}", identifier),
        "build": {
            "beforeDevCommand": "pnpm dev",
            "devUrl": dev_url,
            "beforeBuildCommand": "pnpm build",
            "frontendDist": frontend_dist
        },
        "app": {
            "windows": [
                {
                    "title": project_name,
                    "width": 1000,
                    "height": 700
                }
            ],
            "security": {
                "csp": null
            }
        },
        "bundle": {
            "active": true,
            "targets": "all"
        }
    });
    write_file(
        desktop_dir.join("src-tauri/tauri.conf.json"),
        &serde_json::to_string_pretty(&tauri_conf)?,
    )?;

    let cargo_toml = format!(
        r#"[package]
name = "{identifier}"
version = "0.1.0"
description = "A Tauri 2.0 App built with Amoeba Framework"
edition = "2021"

[build-dependencies]
tauri-build = {{ version = "2", features = [] }}

[dependencies]
tauri = {{ version = "2", features = [] }}
tauri-plugin-shell = "2"
serde = {{ version = "1", features = ["derive"] }}
serde_json = "1"
"#
    );
    write_file(desktop_dir.join("src-tauri/Cargo.toml"), &cargo_toml)?;

    let build_rs = r#"fn main() {
    tauri_build::build()
}
"#;
    write_file(desktop_dir.join("src-tauri/build.rs"), build_rs)?;

    let main_rs = r#"// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
"#;
    write_file(desktop_dir.join("src-tauri/src/main.rs"), main_rs)?;

    Ok(())
}

fn write_tauri_react_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }},
  "devDependencies": {{
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let vite_config = r#"import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
"#;
    write_file(desktop_dir.join("vite.config.ts"), vite_config)?;

    let app_tsx = r#"export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1>⚡ Amoeba + Tauri 2.0 (React)</h1>
      <p>Native Rust Desktop Powered by Amoeba</p>
    </div>
  );
}
"#;
    write_file(desktop_dir.join("src/App.tsx"), app_tsx)?;

    let index_html = format!(
        r#"<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{project_name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"#
    );
    write_file(desktop_dir.join("index.html"), &index_html)?;

    let main_tsx = r#"import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"#;
    write_file(desktop_dir.join("src/main.tsx"), main_tsx)?;

    Ok(())
}

fn write_tauri_nextjs_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.1.0",
  "scripts": {{
    "dev": "next dev",
    "build": "next build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }},
  "devDependencies": {{
    "@tauri-apps/cli": "^2.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let next_config = r#"import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
"#;
    write_file(desktop_dir.join("next.config.ts"), next_config)?;

    let page_tsx = r#"export default function Home() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>⚡ Amoeba + Tauri 2.0 (Next.js)</h1>
      <p>Rust Desktop + Next.js Static Export</p>
    </main>
  );
}
"#;
    write_file(desktop_dir.join("src/app/page.tsx"), page_tsx)?;

    Ok(())
}

fn write_tauri_vue_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "vue": "^3.5.0"
  }},
  "devDependencies": {{
    "@tauri-apps/cli": "^2.0.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "vue-tsc": "^2.1.0"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let app_vue = r#"<template>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
    <h1>⚡ Amoeba + Tauri 2.0 (Vue 3)</h1>
    <p>Rust Desktop + Vue 3 Frontend</p>
  </div>
</template>
"#;
    write_file(desktop_dir.join("src/App.vue"), app_vue)?;

    Ok(())
}

fn write_tauri_svelte_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "svelte": "^5.0.0"
  }},
  "devDependencies": {{
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let app_svelte = r#"<main style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
  <h1>⚡ Amoeba + Tauri 2.0 (Svelte 5)</h1>
  <p>Rust Desktop + Svelte Frontend</p>
</main>
"#;
    write_file(desktop_dir.join("src/App.svelte"), app_svelte)?;

    Ok(())
}

fn write_tauri_solid_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "solid-js": "^1.9.0"
  }},
  "devDependencies": {{
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "vite-plugin-solid": "^2.10.0"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let app_tsx = r#"import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <div style={{ display: 'flex', "flex-direction": 'column', "align-items": 'center', "justify-content": 'center', "min-height": '100vh', "font-family": 'system-ui, sans-serif' }}>
      <h1>⚡ Amoeba + Tauri 2.0 (SolidJS)</h1>
      <p>Rust Desktop + SolidJS Frontend</p>
    </div>
  );
};

export default App;
"#;
    write_file(desktop_dir.join("src/App.tsx"), app_tsx)?;

    Ok(())
}

fn write_tauri_vanilla_ui(desktop_dir: &Path, project_name: &str) -> Result<()> {
    let pkg_json = format!(
        r#"{{
  "name": "{project_name}-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  }},
  "dependencies": {{
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0"
  }},
  "devDependencies": {{
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }}
}}
"#
    );
    write_file(desktop_dir.join("package.json"), &pkg_json)?;

    let main_ts = r#"document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
    <h1>⚡ Amoeba + Tauri 2.0 (Vanilla TS)</h1>
    <p>Rust Desktop + Vanilla TypeScript</p>
  </div>
`;
"#;
    write_file(desktop_dir.join("src/main.ts"), main_ts)?;

    Ok(())
}
