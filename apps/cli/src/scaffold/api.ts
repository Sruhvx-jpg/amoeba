import * as path from "node:path";
import { writeFileWithDir } from "../utils/fs.js";
import type { ScaffoldOptions } from "../types.js";

export async function writeAPIFiles(baseDir: string, opts: ScaffoldOptions): Promise<void> {
  const moduleName = path.basename(opts.projectName);
  const apiDir = path.join(baseDir, "apps", "api");

  // types/health.go (Shared between all DB drivers)
  const healthTypesContent = `package types

type HealthStatus struct {
	Status   string \`json:"status"\`
	Database string \`json:"database"\`
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "types", "health.go"), healthTypesContent);

  // pkg/response/response.go (Shared)
  const responseContent = `package response

import "github.com/gofiber/fiber/v3"

type Body struct {
	Success bool   \`json:"success"\`
	Data    any    \`json:"data,omitempty"\`
	Error   string \`json:"error,omitempty"\`
}

func OK(c fiber.Ctx, data any) error {
	return c.Status(fiber.StatusOK).JSON(Body{
		Success: true,
		Data:    data,
	})
}

func Created(c fiber.Ctx, data any) error {
	return c.Status(fiber.StatusCreated).JSON(Body{
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
`;
  await writeFileWithDir(path.join(apiDir, "pkg", "response", "response.go"), responseContent);

  // internal/routes/health.go (Shared)
  const healthRoutesContent = `package routes

import (
	"${moduleName}/api/internal/service"
	"${moduleName}/api/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func registerHealthRoutes(router fiber.Router, healthSvc *service.HealthService) {
	const path = "/health"

	router.Get(path, func(c fiber.Ctx) error {
		status := healthSvc.Check(c.Context())
		return response.OK(c, status)
	})
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "routes", "health.go"), healthRoutesContent);

  if (opts.database === "mongo") {
    await writeMongoAPIFiles(apiDir, moduleName);
    return;
  }

  await writeGormAPIFiles(apiDir, moduleName);
}

async function writeGormAPIFiles(apiDir: string, moduleName: string): Promise<void> {
  const goMod = `module ${moduleName}/api

go 1.22

require (
	github.com/gofiber/fiber/v3 v3.5.0
	github.com/google/uuid v1.6.0
	gorm.io/driver/postgres v1.6.2
	gorm.io/gorm v1.31.2
)
`;
  await writeFileWithDir(path.join(apiDir, "go.mod"), goMod);

  const envContent = `PORT=3000
ENVIRONMENT=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/${moduleName}?sslmode=disable
`;
  await writeFileWithDir(path.join(apiDir, ".env"), envContent);

  const configContent = `package config

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
		dbURL = "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"
	}
	return &Config{
		Port:        port,
		Environment: env,
		DatabaseURL: dbURL,
	}, nil
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "config", "config.go"), configContent);

  const databaseContent = `package database

import (
	"fmt"
	"time"

	"${moduleName}/api/internal/config"

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
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "database", "database.go"), databaseContent);

  const schemaContent = `package schema

import "gorm.io/gorm"

// Migrate registers and auto-migrates database schemas.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		// Register schemas here:
		// &MyModel{},
	)
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "schema", "schema.go"), schemaContent);

  const healthServiceContent = `package service

import (
	"context"

	"${moduleName}/api/internal/types"

	"gorm.io/gorm"
)

type HealthService struct {
	db *gorm.DB
}

func NewHealthService(db *gorm.DB) *HealthService {
	return &HealthService{db: db}
}

func (s *HealthService) Check(ctx context.Context) types.HealthStatus {
	dbStatus := "connected"
	sqlDB, err := s.db.DB()
	if err != nil || sqlDB.PingContext(ctx) != nil {
		dbStatus = "disconnected"
	}

	return types.HealthStatus{
		Status:   "ok",
		Database: dbStatus,
	}
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "service", "health.go"), healthServiceContent);

  const routesContent = `package routes

import (
	"${moduleName}/api/internal/service"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// Setup initializes the root API routes and mounts service endpoints.
func Setup(app *fiber.App, db *gorm.DB) {
	const prefix = "/api/v1"
	api := app.Group(prefix)

	// Baseline services
	healthSvc := service.NewHealthService(db)

	// Mount routes
	registerHealthRoutes(api, healthSvc)
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "routes", "routes.go"), routesContent);

  const mainContent = `package main

import (
	"log"

	"${moduleName}/api/internal/config"
	"${moduleName}/api/internal/database"
	"${moduleName}/api/internal/routes"
	"${moduleName}/api/internal/schema"

	"github.com/gofiber/fiber/v3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Database connection & Auto-migration
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := schema.Migrate(db); err != nil {
		log.Fatalf("failed to auto-migrate schemas: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "${moduleName} API",
	})

	// Mount all routes
	routes.Setup(app, db)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
`;
  await writeFileWithDir(path.join(apiDir, "cmd", "server", "main.go"), mainContent);
}

async function writeMongoAPIFiles(apiDir: string, moduleName: string): Promise<void> {
  const goMod = `module ${moduleName}/api

go 1.22

require (
	github.com/gofiber/fiber/v3 v3.5.0
	go.mongodb.org/mongo-driver/v2 v2.0.1
)
`;
  await writeFileWithDir(path.join(apiDir, "go.mod"), goMod);

  const envContent = `PORT=3000
ENVIRONMENT=development
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=${moduleName}
`;
  await writeFileWithDir(path.join(apiDir, ".env"), envContent);

  const configContent = `package config

import (
	"os"
)

type Config struct {
	Port         string
	Environment  string
	DatabaseURL  string
	DatabaseName string
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
		dbURL = "mongodb://localhost:27017"
	}
	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "${moduleName}"
	}
	return &Config{
		Port:         port,
		Environment:  env,
		DatabaseURL:  dbURL,
		DatabaseName: dbName,
	}, nil
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "config", "config.go"), configContent);

  const databaseContent = `package database

import (
	"context"
	"fmt"
	"time"

	"${moduleName}/api/internal/config"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type Database struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func Connect(cfg *config.Config) (*Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(cfg.DatabaseURL))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	return &Database{
		Client: client,
		DB:     client.Database(cfg.DatabaseName),
	}, nil
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "database", "database.go"), databaseContent);

  const schemaContent = `package schema

import (
	"context"

	"${moduleName}/api/internal/database"
)

// InitIndexes registers MongoDB collection indexes.
func InitIndexes(ctx context.Context, db *database.Database) error {
	// Register collection indexes here:
	return nil
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "schema", "schema.go"), schemaContent);

  const healthServiceContent = `package service

import (
	"context"

	"${moduleName}/api/internal/database"
	"${moduleName}/api/internal/types"

	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type HealthService struct {
	db *database.Database
}

func NewHealthService(db *database.Database) *HealthService {
	return &HealthService{db: db}
}

func (s *HealthService) Check(ctx context.Context) types.HealthStatus {
	dbStatus := "connected"
	if err := s.db.Client.Ping(ctx, readpref.Primary()); err != nil {
		dbStatus = "disconnected"
	}

	return types.HealthStatus{
		Status:   "ok",
		Database: dbStatus,
	}
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "service", "health.go"), healthServiceContent);

  const routesContent = `package routes

import (
	"${moduleName}/api/internal/database"
	"${moduleName}/api/internal/service"

	"github.com/gofiber/fiber/v3"
)

// Setup initializes the root API routes and mounts service endpoints.
func Setup(app *fiber.App, db *database.Database) {
	const prefix = "/api/v1"
	api := app.Group(prefix)

	// Baseline services
	healthSvc := service.NewHealthService(db)

	// Mount routes
	registerHealthRoutes(api, healthSvc)
}
`;
  await writeFileWithDir(path.join(apiDir, "internal", "routes", "routes.go"), routesContent);

  const mainContent = `package main

import (
	"context"
	"log"
	"time"

	"${moduleName}/api/internal/config"
	"${moduleName}/api/internal/database"
	"${moduleName}/api/internal/routes"
	"${moduleName}/api/internal/schema"

	"github.com/gofiber/fiber/v3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Database connection
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to mongodb: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := db.Client.Disconnect(ctx); err != nil {
			log.Printf("error disconnecting mongodb: %v", err)
		}
	}()

	if err := schema.InitIndexes(context.Background(), db); err != nil {
		log.Fatalf("failed to initialize schema indexes: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "${moduleName} API",
	})

	// Mount all routes
	routes.Setup(app, db)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
`;
  await writeFileWithDir(path.join(apiDir, "cmd", "server", "main.go"), mainContent);
}
