# 🦠 Amoeba Framework

A high-performance, opinionated full-stack framework pairing Go (Fiber v3) systems speed with modern frontend choices (Next.js, Tauri, React/Vite).

## 📂 Project Structure

```
amoeba/
├── apps/
│   ├── api/                     # Go (Fiber v3) Backend
│   │   ├── cmd/server/main.go   # Server Entrypoint
│   │   ├── internal/
│   │   │   ├── config/          # Environment & Configuration
│   │   │   └── modules/         # Feature-Based Modules
│   │   │       └── health/      # Health Check Module Example
│   │   └── pkg/
│   │       ├── handler/         # BaseHandler (Context Wrapper)
│   │       └── response/        # Standard JSON Response Util
│   │
│   └── web/ (or desktop/)       # Frontend (Next.js / Tauri / React)
├── docs/
│   └── MODULES_GUIDE.md         # Guide to writing Handlers, Services, Routes & Middlewares
└── README.md
```

## 📖 Guides

Read [`docs/MODULES_GUIDE.md`](./docs/MODULES_GUIDE.md) to learn how to create modules, services, handlers, and middlewares.
