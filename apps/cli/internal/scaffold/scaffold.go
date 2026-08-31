package scaffold

import (
	"fmt"
	"os"
	"path/filepath"
)

type Options struct {
	ProjectName string
	Frontend    string // "nextjs", "tauri", "react", "api-only"
}

func GenerateProject(opts Options) error {
	baseDir := opts.ProjectName

	// 1. Create directory structure
	dirs := []string{
		filepath.Join(baseDir, "apps", "api", "cmd", "server"),
		filepath.Join(baseDir, "apps", "api", "internal", "config"),
		filepath.Join(baseDir, "apps", "api", "internal", "database"),
		filepath.Join(baseDir, "apps", "api", "internal", "schema"),
		filepath.Join(baseDir, "apps", "api", "internal", "modules", "health"),
		filepath.Join(baseDir, "apps", "api", "pkg", "handler"),
		filepath.Join(baseDir, "apps", "api", "pkg", "response"),
	}

	for _, d := range dirs {
		if err := os.MkdirAll(d, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", d, err)
		}
	}

	// 2. Write API files
	if err := writeAPIFiles(baseDir, opts.ProjectName); err != nil {
		return err
	}

	// 3. Write Frontend if selected
	switch opts.Frontend {
	case "nextjs":
		if err := writeNextJSTemplate(baseDir, opts.ProjectName); err != nil {
			return err
		}
	case "tauri":
		if err := writeTauriTemplate(baseDir, opts.ProjectName); err != nil {
			return err
		}
	case "react":
		if err := writeReactTemplate(baseDir, opts.ProjectName); err != nil {
			return err
		}
	}

	// 4. Root README & package.json
	return writeRootFiles(baseDir, opts)
}

func writeFile(path, content string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	return os.WriteFile(path, []byte(content), 0644)
}

func writeAPIFiles(baseDir, projectName string) error {
	moduleName := filepath.Base(projectName)
	apiDir := filepath.Join(baseDir, "apps", "api")

	// go.mod
	goMod := fmt.Sprintf(`module %s/api

go 1.22

require (
	github.com/gofiber/fiber/v3 v3.5.0
	github.com/google/uuid v1.6.0
	gorm.io/driver/postgres v1.6.2
	gorm.io/gorm v1.31.2
)
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, "go.mod"), goMod); err != nil {
		return err
	}

	// .env
	envContent := fmt.Sprintf(`PORT=3000
ENVIRONMENT=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/%s?sslmode=disable
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, ".env"), envContent); err != nil {
		return err
	}

	// config.go
	configContent := fmt.Sprintf(`package config

import (
	"os"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
}

func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/%s?sslmode=disable"
	}
	return &Config{
		Port:        port,
		Environment: env,
		DatabaseURL: dbURL,
	}, nil
}
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, "internal", "config", "config.go"), configContent); err != nil {
		return err
	}

	// database.go
	databaseContent := fmt.Sprintf(`package database

import (
	"fmt"
	"time"

	"%s/api/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	logLevel := logger.Warn
	if cfg.Environment == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %%w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve sql.DB: %%w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, "internal", "database", "database.go"), databaseContent); err != nil {
		return err
	}

	// schema/user.go
	userSchemaContent := `package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID      ` + "`gorm:\"type:uuid;primaryKey\" json:\"id\"`" + `
	Name      string         ` + "`gorm:\"type:varchar(100);not null\" json:\"name\"`" + `
	Email     string         ` + "`gorm:\"type:varchar(255);uniqueIndex;not null\" json:\"email\"`" + `
	Password  string         ` + "`gorm:\"type:varchar(255);not null\" json:\"-\"`" + `
	Role      string         ` + "`gorm:\"type:varchar(50);not null;default:'user'\" json:\"role\"`" + `
	CreatedAt time.Time      ` + "`gorm:\"autoCreateTime\" json:\"created_at\"`" + `
	UpdatedAt time.Time      ` + "`gorm:\"autoUpdateTime\" json:\"updated_at\"`" + `
	DeletedAt gorm.DeletedAt ` + "`gorm:\"index\" json:\"-\"`" + `
}

func (User) TableName() string {
	return "users"
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
`
	if err := writeFile(filepath.Join(apiDir, "internal", "schema", "user.go"), userSchemaContent); err != nil {
		return err
	}

	// schema/schema.go
	schemaContent := `package schema

import "gorm.io/gorm"

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
	)
}
`
	if err := writeFile(filepath.Join(apiDir, "internal", "schema", "schema.go"), schemaContent); err != nil {
		return err
	}

	// response.go
	responseContent := `package response

import "github.com/gofiber/fiber/v3"

type Body struct {
	Success bool   ` + "`json:\"success\"`" + `
	Data    any    ` + "`json:\"data,omitempty\"`" + `
	Error   string ` + "`json:\"error,omitempty\"`" + `
}

func Success(c fiber.Ctx, data any) error {
	return c.Status(fiber.StatusOK).JSON(Body{
		Success: true,
		Data:    data,
	})
}

func Error(c fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(Body{
		Success: false,
		Error:   msg,
	})
}
`
	if err := writeFile(filepath.Join(apiDir, "pkg", "response", "response.go"), responseContent); err != nil {
		return err
	}

	// basehandler.go
	baseHandlerContent := fmt.Sprintf(`package handler

import (
	"%s/api/pkg/response"

	"github.com/gofiber/fiber/v3"
)

type BaseHandler struct {
	fiber.Ctx
}

func NewBaseHandler(c fiber.Ctx) *BaseHandler {
	return &BaseHandler{Ctx: c}
}

func (b *BaseHandler) Success(data any) error {
	return response.Success(b.Ctx, data)
}

func (b *BaseHandler) Error(status int, msg string) error {
	return response.Error(b.Ctx, status, msg)
}
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, "pkg", "handler", "basehandler.go"), baseHandlerContent); err != nil {
		return err
	}

	// health module: service.go
	healthServiceContent := `package health

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Check() (map[string]string, error) {
	return map[string]string{
		"status": "healthy",
	}, nil
}
`
	if err := writeFile(filepath.Join(apiDir, "internal", "modules", "health", "service.go"), healthServiceContent); err != nil {
		return err
	}

	// health module: handler.go
	healthHandlerContent := fmt.Sprintf(`package health

import (
	"%s/api/pkg/handler"

	"github.com/gofiber/fiber/v3"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Check(c fiber.Ctx) error {
	b := handler.NewBaseHandler(c)
	data, err := h.service.Check()
	if err != nil {
		return b.Error(fiber.StatusInternalServerError, err.Error())
	}
	return b.Success(data)
}
`, moduleName)
	if err := writeFile(filepath.Join(apiDir, "internal", "modules", "health", "handler.go"), healthHandlerContent); err != nil {
		return err
	}

	// health module: routes.go
	healthRoutesContent := `package health

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(r fiber.Router, h *Handler) {
	r.Get("/health", h.Check)
}
`
	if err := writeFile(filepath.Join(apiDir, "internal", "modules", "health", "routes.go"), healthRoutesContent); err != nil {
		return err
	}

	// health module: middleware.go
	healthMiddlewareContent := `package health

import "github.com/gofiber/fiber/v3"

func Middleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		return c.Next()
	}
}
`
	if err := writeFile(filepath.Join(apiDir, "internal", "modules", "health", "middleware.go"), healthMiddlewareContent); err != nil {
		return err
	}

	// cmd/server/main.go
	mainContent := fmt.Sprintf(`package main

import (
	"log"

	"%s/api/internal/config"
	"%s/api/internal/database"
	"%s/api/internal/modules/health"
	"%s/api/internal/schema"

	"github.com/gofiber/fiber/v3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %%v", err)
	}

	// Database connection & Auto-migration
	db, err := database.Connect(cfg)
	if err != nil {
		log.Printf("⚠️  Database connection warning: %%v (running without DB)", err)
	} else {
		if err := schema.Migrate(db); err != nil {
			log.Fatalf("failed to auto-migrate schemas: %%v", err)
		}
	}

	app := fiber.New(fiber.Config{
		AppName: "%s API",
	})

	api := app.Group("/api/v1")

	// Mount health module
	healthService := health.NewService()
	healthHandler := health.NewHandler(healthService)
	health.RegisterRoutes(api, healthHandler)

	log.Printf("⚡ Amoeba API server running on port %%s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
`, moduleName, moduleName, moduleName, moduleName, moduleName)
	return writeFile(filepath.Join(apiDir, "cmd", "server", "main.go"), mainContent)
}

func writeNextJSTemplate(baseDir, projectName string) error {
	webDir := filepath.Join(baseDir, "apps", "web")

	pkgJSON := fmt.Sprintf(`{
  "name": "%s-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}`, projectName)
	if err := writeFile(filepath.Join(webDir, "package.json"), pkgJSON); err != nil {
		return err
	}

	nextConfig := `import type { NextConfig } from "next";

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
`
	if err := writeFile(filepath.Join(webDir, "next.config.ts"), nextConfig); err != nil {
		return err
	}

	pageTSX := `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">🦠 Amoeba Framework</h1>
      <p className="text-gray-600">Go Fiber v3 Backend + Next.js Frontend</p>
    </main>
  );
}
`
	return writeFile(filepath.Join(webDir, "src", "app", "page.tsx"), pageTSX)
}

func writeReactTemplate(baseDir, projectName string) error {
	webDir := filepath.Join(baseDir, "apps", "web")

	pkgJSON := fmt.Sprintf(`{
  "name": "%s-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}`, projectName)
	if err := writeFile(filepath.Join(webDir, "package.json"), pkgJSON); err != nil {
		return err
	}

	viteConfig := `import { defineConfig } from 'vite';
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
`
	if err := writeFile(filepath.Join(webDir, "vite.config.ts"), viteConfig); err != nil {
		return err
	}

	appTSX := `export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>🦠 Amoeba Framework</h1>
      <p>Go Fiber v3 Backend + React (Vite) Frontend</p>
    </div>
  );
}
`
	return writeFile(filepath.Join(webDir, "src", "App.tsx"), appTSX)
}

func writeTauriTemplate(baseDir, projectName string) error {
	desktopDir := filepath.Join(baseDir, "apps", "desktop")

	pkgJSON := fmt.Sprintf(`{
  "name": "%s-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}`, projectName)
	if err := writeFile(filepath.Join(desktopDir, "package.json"), pkgJSON); err != nil {
		return err
	}

	tauriConf := fmt.Sprintf(`{
  "productName": "%s",
  "version": "0.1.0",
  "identifier": "com.amoeba.%s",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "%s",
        "width": 1000,
        "height": 700
      }
    ]
  }
}`, projectName, projectName, projectName)
	if err := writeFile(filepath.Join(desktopDir, "src-tauri", "tauri.conf.json"), tauriConf); err != nil {
		return err
	}

	return nil
}

func writeRootFiles(baseDir string, opts Options) error {
	readme := fmt.Sprintf(`# %s (Built with Amoeba Framework 🦠)

A high-performance full-stack application.

## 📁 Apps

- **Backend**: `+"`apps/api`"+` (Go Fiber v3)
- **Frontend**: `+"`apps/web`"+` (%s)

## 🚀 Getting Started

### 1. Start the API Server
`+"```bash"+`
cd apps/api
go run ./cmd/server/main.go
`+"```"+`

### 2. Start the Frontend
`+"```bash"+`
cd apps/web # (or desktop)
npm install
npm run dev
`+"```"+`
`, opts.ProjectName, opts.Frontend)

	return writeFile(filepath.Join(baseDir, "README.md"), readme)
}
