# ⚡ Amoeba Framework

A high-performance, opinionated full-stack framework and CLI pairing systems speed with modern frontend and backend architectures.

## 🚀 CLI Capabilities & Matrix

The **Amoeba CLI** is built in native **Rust** for near-zero startup latency and compile-time type safety.

```
amoeba new [PROJECT_NAME]
│
├── [1] Backend Language
│   ├── Go (Fiber v3)
│   │   ├── Database: PostgreSQL (GORM) | MongoDB (Go Driver v2)
│   │   └── Frontend: Next.js 15 | React (Vite) | Tauri 2.0 | API Only
│   │
│   └── TypeScript
│       ├── [2] Architecture Style
│       │   ├── Standard REST API (Modular Express)
│       │   │   ├── Database: PostgreSQL (Drizzle ORM) | MongoDB (Mongoose)
│       │   │   ├── Utils: BaseDto, ApiError (dataAlreadyExists), ApiResponse
│       │   │   └── Frontend: Next.js 15 | React (Vite) | Tauri 2.0 | API Only
│       │   │
│       │   └── tRPC Monorepo (Turborepo + pnpm workspace)
│       │       └── Frontend Apps: Web App | Tauri Desktop App | Both
```

## 📦 Commands

### 1. Scaffold a New Project
```bash
amoeba new
# or with flags
amoeba new my-app --lang ts --arch trpc --monorepo-fe both
amoeba new my-rest --lang ts --arch rest --db drizzle --frontend react
amoeba new my-go --lang go --db gorm --frontend nextjs
```

### 2. Scaffold a Workspace Package (tRPC Monorepo Exclusive)
Inside any Amoeba tRPC monorepo:
```bash
amoeba new pkg <pkg_name>
```
*Creates `@repo/<pkg_name>` in `packages/<pkg_name>` with workspace configs and TypeScript definitions.*

### 3. Check for Updates
```bash
amoeba update
```

## 🛠️ CLI Development & Building
```bash
cd apps/cli
cargo build --release
```
The binary will be generated at `apps/cli/target/release/amoeba`.
