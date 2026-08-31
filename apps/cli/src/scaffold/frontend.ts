import * as path from "node:path";
import { writeFileWithDir } from "../utils/fs.js";

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
        typescript: "^5.0.0",
        "@types/node": "^20.0.0",
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

export async function writeTauriTemplate(baseDir: string, projectName: string): Promise<void> {
  const desktopDir = path.join(baseDir, "apps", "desktop");

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

  const tauriConf = JSON.stringify(
    {
      productName: projectName,
      version: "0.1.0",
      identifier: `com.amoeba.${projectName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      build: {
        beforeDevCommand: "pnpm dev",
        devUrl: "http://localhost:5173",
        beforeBuildCommand: "pnpm build",
        frontendDist: "../dist",
      },
      app: {
        windows: [
          {
            title: projectName,
            width: 1000,
            height: 700,
          },
        ],
      },
    },
    null,
    2
  );
  await writeFileWithDir(path.join(desktopDir, "src-tauri", "tauri.conf.json"), tauriConf);
}
