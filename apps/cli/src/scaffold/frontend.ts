import * as path from "node:path";
import { writeFileWithDir } from "../utils/fs.js";
import type { TauriFramework } from "../types.js";

// ==========================================
// Web Framework Templates
// ==========================================

export async function writeNextJSTemplate(baseDir: string, projectName: string): Promise<void> {
  const webDir = path.join(baseDir, "apps", "web");

  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-web`,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev --port 3001",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        next: "15.1.0",
      },
      devDependencies: {
        typescript: "^5.7.0",
        "@types/node": "^22.0.0",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        tailwindcss: "^3.4.1",
        postcss: "^8.4.35",
        autoprefixer: "^10.4.17",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(webDir, "package.json"), pkgJSON);

  const nextConfig = `import type { NextConfig } from "next";

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
`;
  await writeFileWithDir(path.join(webDir, "next.config.ts"), nextConfig);

  const pageTSX = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">⚡ Amoeba Framework</h1>
      <p className="text-gray-600">Go Fiber v3 Backend + Next.js Frontend</p>
    </main>
  );
}
`;
  await writeFileWithDir(path.join(webDir, "src", "app", "page.tsx"), pageTSX);
}

export async function writeReactTemplate(baseDir: string, projectName: string): Promise<void> {
  const webDir = path.join(baseDir, "apps", "web");

  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-web`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
      },
      devDependencies: {
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        typescript: "^5.5.3",
        vite: "^5.4.1",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(webDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';
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
`;
  await writeFileWithDir(path.join(webDir, "vite.config.ts"), viteConfig);

  const appTSX = `export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>⚡ Amoeba Framework</h1>
      <p>Go Fiber v3 Backend + React (Vite) Frontend</p>
    </div>
  );
}
`;
  await writeFileWithDir(path.join(webDir, "src", "App.tsx"), appTSX);
}

// ==========================================
// Tauri 2.0 Multi-Framework Templates
// ==========================================

export async function writeTauriTemplate(
  baseDir: string,
  projectName: string,
  template: TauriFramework = "react"
): Promise<void> {
  const desktopDir = path.join(baseDir, "apps", "desktop");
  const identifier = projectName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Rust Cargo & Tauri Config
  await writeTauriRustFiles(desktopDir, projectName, identifier, template);

  // 2. Frontend Framework inside Tauri
  switch (template) {
    case "nextjs":
      await writeTauriNextJSUITemplate(desktopDir, projectName);
      break;
    case "vue":
      await writeTauriVueUITemplate(desktopDir, projectName);
      break;
    case "svelte":
      await writeTauriSvelteUITemplate(desktopDir, projectName);
      break;
    case "solid":
      await writeTauriSolidUITemplate(desktopDir, projectName);
      break;
    case "vanilla":
      await writeTauriVanillaUITemplate(desktopDir, projectName);
      break;
    case "react":
    default:
      await writeTauriReactUITemplate(desktopDir, projectName);
      break;
  }
}

async function writeTauriRustFiles(
  desktopDir: string,
  projectName: string,
  identifier: string,
  template: TauriFramework
): Promise<void> {
  const isNext = template === "nextjs";
  const devUrl = isNext ? "http://localhost:3000" : "http://localhost:5173";
  const frontendDist = isNext ? "../out" : "../dist";

  const tauriConf = JSON.stringify(
    {
      $schema: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/schema.json",
      productName: projectName,
      version: "0.1.0",
      identifier: `com.amoeba.${identifier}`,
      build: {
        beforeDevCommand: "pnpm dev",
        devUrl,
        beforeBuildCommand: "pnpm build",
        frontendDist,
      },
      app: {
        windows: [
          {
            title: projectName,
            width: 1000,
            height: 700,
          },
        ],
        security: {
          csp: null,
        },
      },
      bundle: {
        active: true,
        targets: "all",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "src-tauri", "tauri.conf.json"), tauriConf);

  const cargoToml = `[package]
name = "${identifier}"
version = "0.1.0"
description = "A Tauri 2.0 App built with Amoeba Framework"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`;
  await writeFileWithDir(path.join(desktopDir, "src-tauri", "Cargo.toml"), cargoToml);

  const buildRs = `fn main() {
    tauri_build::build()
}
`;
  await writeFileWithDir(path.join(desktopDir, "src-tauri", "build.rs"), buildRs);

  const mainRs = `// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`;
  await writeFileWithDir(path.join(desktopDir, "src-tauri", "src", "main.rs"), mainRs);
}

async function writeTauriReactUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        typescript: "^5.5.3",
        vite: "^5.4.1",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
`;
  await writeFileWithDir(path.join(desktopDir, "vite.config.ts"), viteConfig);

  const appTSX = `export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1>⚡ Amoeba + Tauri 2.0 (React)</h1>
      <p>Rust Desktop + Go Fiber v3 Backend + React Frontend</p>
    </div>
  );
}
`;
  await writeFileWithDir(path.join(desktopDir, "src", "App.tsx"), appTSX);
}

async function writeTauriNextJSUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.1.0",
      scripts: {
        dev: "next dev",
        build: "next build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
        next: "15.1.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        "@types/node": "^22.0.0",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        typescript: "^5.7.0",
        tailwindcss: "^3.4.1",
        postcss: "^8.4.35",
        autoprefixer: "^10.4.17",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const nextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
`;
  await writeFileWithDir(path.join(desktopDir, "next.config.ts"), nextConfig);

  const pageTSX = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">⚡ Amoeba + Tauri 2.0 (Next.js)</h1>
      <p className="text-gray-600">Rust Desktop + Next.js Static Export</p>
    </main>
  );
}
`;
  await writeFileWithDir(path.join(desktopDir, "src", "app", "page.tsx"), pageTSX);
}

async function writeTauriVueUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vue-tsc && vite build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
        vue: "^3.5.0",
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        "@vitejs/plugin-vue": "^5.1.0",
        typescript: "^5.5.3",
        vite: "^5.4.1",
        "vue-tsc": "^2.1.0",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
`;
  await writeFileWithDir(path.join(desktopDir, "vite.config.ts"), viteConfig);

  const appVue = `<template>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
    <h1>⚡ Amoeba + Tauri 2.0 (Vue 3)</h1>
    <p>Rust Desktop + Go Fiber v3 Backend + Vue Frontend</p>
  </div>
</template>
`;
  await writeFileWithDir(path.join(desktopDir, "src", "App.vue"), appVue);
}

async function writeTauriSvelteUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
        svelte: "^5.0.0",
      },
      devDependencies: {
        "@sveltejs/vite-plugin-svelte": "^4.0.0",
        "@tauri-apps/cli": "^2.0.0",
        typescript: "^5.5.3",
        vite: "^5.4.1",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
`;
  await writeFileWithDir(path.join(desktopDir, "vite.config.ts"), viteConfig);

  const appSvelte = `<main style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
  <h1>⚡ Amoeba + Tauri 2.0 (Svelte 5)</h1>
  <p>Rust Desktop + Go Fiber v3 Backend + Svelte Frontend</p>
</main>
`;
  await writeFileWithDir(path.join(desktopDir, "src", "App.svelte"), appSvelte);
}

async function writeTauriSolidUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
        "solid-js": "^1.9.0",
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        typescript: "^5.5.3",
        vite: "^5.4.1",
        "vite-plugin-solid": "^2.11.0",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
`;
  await writeFileWithDir(path.join(desktopDir, "vite.config.ts"), viteConfig);

  const appTSX = `export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1>⚡ Amoeba + Tauri 2.0 (SolidJS)</h1>
      <p>Rust Desktop + Go Fiber v3 Backend + SolidJS Frontend</p>
    </div>
  );
}
`;
  await writeFileWithDir(path.join(desktopDir, "src", "App.tsx"), appTSX);
}

async function writeTauriVanillaUITemplate(desktopDir: string, projectName: string): Promise<void> {
  const pkgJSON = JSON.stringify(
    {
      name: `${projectName}-desktop`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        tauri: "tauri",
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-shell": "^2.0.0",
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        typescript: "^5.5.3",
        vite: "^5.4.1",
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "package.json"), pkgJSON);

  const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
});
`;
  await writeFileWithDir(path.join(desktopDir, "vite.config.ts"), viteConfig);

  const mainTS = `document.querySelector<HTMLDivElement>('#app')!.innerHTML = \`
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
    <h1>⚡ Amoeba + Tauri 2.0 (Vanilla TS)</h1>
    <p>Rust Desktop + Go Fiber v3 Backend + Vanilla TypeScript</p>
  </div>
\`;
`;
  await writeFileWithDir(path.join(desktopDir, "src", "main.ts"), mainTS);
}
