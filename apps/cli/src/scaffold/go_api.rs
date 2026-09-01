use anyhow::Result;
use std::path::Path;

use crate::types::DatabaseEngine;
use crate::utils::fs::write_file;

pub fn write_go_api_files(base_dir: &Path, project_name: &str, database: DatabaseEngine) -> Result<()> {
    let module_name = project_name;
    let api_dir = base_dir.join("apps").join("api");

    // 1. types/health.go
    let health_types = r#"package types

type HealthStatus struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}
"#;
    write_file(api_dir.join("internal/types/health.go"), health_types)?;

    // 2. pkg/response/response.go
    let response_pkg = r#"package response

import "github.com/gofiber/fiber/v3"

type Body struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
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
"#;
    write_file(api_dir.join("pkg/response/response.go"), response_pkg)?;

    // 3. internal/routes/health.go
    let health_routes = format!(
        r#"package routes

import (
	"{module_name}/api/internal/service"
	"{module_name}/api/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func registerHealthRoutes(router fiber.Router, healthSvc *service.HealthService) {{
	const path = "/health"

	router.Get(path, func(c fiber.Ctx) error {{
		status := healthSvc.Check(c.Context())
		return response.OK(c, status)
	}})
}}
"#
    );
    write_file(api_dir.join("internal/routes/health.go"), &health_routes)?;

    match database {
        DatabaseEngine::Gorm => write_gorm_files(&api_dir, module_name)?,
        DatabaseEngine::MongoGo => write_mongo_files(&api_dir, module_name)?,
        _ => write_gorm_files(&api_dir, module_name)?,
    }

    Ok(())
}

fn write_gorm_files(api_dir: &Path, module_name: &str) -> Result<()> {
    // go.mod
    let go_mod = format!(
        r#"module {module_name}/api

go 1.22

require (
	github.com/gofiber/fiber/v3 v3.5.0
	github.com/google/uuid v1.6.0
	gorm.io/driver/postgres v1.6.2
	gorm.io/gorm v1.31.2
)
"#
    );
    write_file(api_dir.join("go.mod"), &go_mod)?;

    // .env & .env.example
    let env_content = format!(
        r#"PORT=3000
ENVIRONMENT=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/{module_name}?sslmode=disable
"#
    );
    write_file(api_dir.join(".env"), &env_content)?;
    write_file(api_dir.join(".env.example"), &env_content)?;

    // config/config.go
    let config_go = r#"package config

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
"#;
    write_file(api_dir.join("internal/config/config.go"), config_go)?;

    // database/database.go
    let database_go = format!(
        r#"package database

import (
	"fmt"
	"time"

	"{module_name}/api/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {{
	logLevel := logger.Warn
	if cfg.Environment == "development" {{
		logLevel = logger.Info
	}}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {{
			return time.Now().UTC()
		}},
	}})
	if err != nil {{
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}}

	sqlDB, err := db.DB()
	if err != nil {{
		return nil, fmt.Errorf("failed to retrieve sql.DB: %w", err)
	}}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}}
"#
    );
    write_file(api_dir.join("internal/database/database.go"), &database_go)?;

    // schema/schema.go
    let schema_go = r#"package schema

import "gorm.io/gorm"

// Migrate registers and auto-migrates database schemas.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		// Register schemas here:
		// &MyModel{},
	)
}
"#;
    write_file(api_dir.join("internal/schema/schema.go"), schema_go)?;

    // service/health.go
    let service_health_go = format!(
        r#"package service

import (
	"context"

	"{module_name}/api/internal/types"

	"gorm.io/gorm"
)

type HealthService struct {{
	db *gorm.DB
}}

func NewHealthService(db *gorm.DB) *HealthService {{
	return &HealthService{{db: db}}
}}

func (s *HealthService) Check(ctx context.Context) types.HealthStatus {{
	dbStatus := "connected"
	sqlDB, err := s.db.DB()
	if err != nil || sqlDB.PingContext(ctx) != nil {{
		dbStatus = "disconnected"
	}}

	return types.HealthStatus{{
		Status:   "ok",
		Database: dbStatus,
	}}
}}
"#
    );
    write_file(api_dir.join("internal/service/health.go"), &service_health_go)?;

    // routes/routes.go
    let routes_go = format!(
        r#"package routes

import (
	"{module_name}/api/internal/service"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// Setup initializes root API routes and mounts service endpoints.
func Setup(app *fiber.App, db *gorm.DB) {{
	const prefix = "/api/v1"
	api := app.Group(prefix)

	healthSvc := service.NewHealthService(db)
	registerHealthRoutes(api, healthSvc)
}}
"#
    );
    write_file(api_dir.join("internal/routes/routes.go"), &routes_go)?;

    // cmd/server/main.go
    let main_go = format!(
        r#"package main

import (
	"log"

	"{module_name}/api/internal/config"
	"{module_name}/api/internal/database"
	"{module_name}/api/internal/routes"
	"{module_name}/api/internal/schema"

	"github.com/gofiber/fiber/v3"
)

func main() {{
	cfg, err := config.Load()
	if err != nil {{
		log.Fatalf("failed to load config: %v", err)
	}}

	db, err := database.Connect(cfg)
	if err != nil {{
		log.Fatalf("failed to connect to database: %v", err)
	}}

	if err := schema.Migrate(db); err != nil {{
		log.Fatalf("failed to auto-migrate schemas: %v", err)
	}}

	app := fiber.New(fiber.Config{{
		AppName: "{module_name} API",
	}})

	routes.Setup(app, db)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}}
"#
    );
    write_file(api_dir.join("cmd/server/main.go"), &main_go)?;

    Ok(())
}

fn write_mongo_files(api_dir: &Path, module_name: &str) -> Result<()> {
    // go.mod
    let go_mod = format!(
        r#"module {module_name}/api

go 1.22

require (
	github.com/gofiber/fiber/v3 v3.5.0
	go.mongodb.org/mongo-driver/v2 v2.0.1
)
"#
    );
    write_file(api_dir.join("go.mod"), &go_mod)?;

    // .env & .env.example
    let env_content = format!(
        r#"PORT=3000
ENVIRONMENT=development
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME={module_name}
"#
    );
    write_file(api_dir.join(".env"), &env_content)?;
    write_file(api_dir.join(".env.example"), &env_content)?;

    // config/config.go
    let config_go = format!(
        r#"package config

import (
	"os"
)

type Config struct {{
	Port         string
	Environment  string
	DatabaseURL  string
	DatabaseName string
}}

func Load() (*Config, error) {{
	port := os.Getenv("PORT")
	if port == "" {{
		port = "3000"
	}}
	env := os.Getenv("ENVIRONMENT")
	if env == "" {{
		env = "development"
	}}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {{
		dbURL = "mongodb://localhost:27017"
	}}
	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {{
		dbName = "{module_name}"
	}}
	return &Config{{
		Port:         port,
		Environment:  env,
		DatabaseURL:  dbURL,
		DatabaseName: dbName,
	}}, nil
}}
"#
    );
    write_file(api_dir.join("internal/config/config.go"), &config_go)?;

    // database/database.go
    let database_go = format!(
        r#"package database

import (
	"context"
	"fmt"
	"time"

	"{module_name}/api/internal/config"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type Database struct {{
	Client *mongo.Client
	DB     *mongo.Database
}}

func Connect(cfg *config.Config) (*Database, error) {{
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(cfg.DatabaseURL))
	if err != nil {{
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {{
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}}

	return &Database{{
		Client: client,
		DB:     client.Database(cfg.DatabaseName),
	}}, nil
}}
"#
    );
    write_file(api_dir.join("internal/database/database.go"), &database_go)?;

    // schema/schema.go
    let schema_go = format!(
        r#"package schema

import (
	"context"

	"{module_name}/api/internal/database"
)

// InitIndexes registers MongoDB collection indexes.
func InitIndexes(ctx context.Context, db *database.Database) error {{
	return nil
}}
"#
    );
    write_file(api_dir.join("internal/schema/schema.go"), &schema_go)?;

    // service/health.go
    let service_health_go = format!(
        r#"package service

import (
	"context"

	"{module_name}/api/internal/database"
	"{module_name}/api/internal/types"

	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type HealthService struct {{
	db *database.Database
}}

func NewHealthService(db *database.Database) *HealthService {{
	return &HealthService{{db: db}}
}}

func (s *HealthService) Check(ctx context.Context) types.HealthStatus {{
	dbStatus := "connected"
	if err := s.db.Client.Ping(ctx, readpref.Primary()); err != nil {{
		dbStatus = "disconnected"
	}}

	return types.HealthStatus{{
		Status:   "ok",
		Database: dbStatus,
	}}
}}
"#
    );
    write_file(api_dir.join("internal/service/health.go"), &service_health_go)?;

    // routes/routes.go
    let routes_go = format!(
        r#"package routes

import (
	"{module_name}/api/internal/database"
	"{module_name}/api/internal/service"

	"github.com/gofiber/fiber/v3"
)

func Setup(app *fiber.App, db *database.Database) {{
	const prefix = "/api/v1"
	api := app.Group(prefix)

	healthSvc := service.NewHealthService(db)
	registerHealthRoutes(api, healthSvc)
}}
"#
    );
    write_file(api_dir.join("internal/routes/routes.go"), &routes_go)?;

    // cmd/server/main.go
    let main_go = format!(
        r#"package main

import (
	"context"
	"log"
	"time"

	"{module_name}/api/internal/config"
	"{module_name}/api/internal/database"
	"{module_name}/api/internal/routes"
	"{module_name}/api/internal/schema"

	"github.com/gofiber/fiber/v3"
)

func main() {{
	cfg, err := config.Load()
	if err != nil {{
		log.Fatalf("failed to load config: %v", err)
	}}

	db, err := database.Connect(cfg)
	if err != nil {{
		log.Fatalf("failed to connect to mongodb: %v", err)
	}}
	defer func() {{
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := db.Client.Disconnect(ctx); err != nil {{
			log.Printf("error disconnecting mongodb: %v", err)
		}}
	}}()

	if err := schema.InitIndexes(context.Background(), db); err != nil {{
		log.Fatalf("failed to initialize schema indexes: %v", err)
	}}

	app := fiber.New(fiber.Config{{
		AppName: "{module_name} API",
	}})

	routes.Setup(app, db)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}}
"#
    );
    write_file(api_dir.join("cmd/server/main.go"), &main_go)?;

    Ok(())
}
