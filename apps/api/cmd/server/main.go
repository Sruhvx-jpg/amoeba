package main

import (
	"log"

	"local/amoeba/internal/config"
	"local/amoeba/internal/database"
	"local/amoeba/internal/modules/health"
	"local/amoeba/internal/schema"

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
		log.Printf("⚠️  Database connection warning: %v (running without DB)", err)
	} else {
		if err := schema.Migrate(db); err != nil {
			log.Fatalf("failed to auto-migrate schemas: %v", err)
		}
	}

	app := fiber.New(fiber.Config{
		AppName: "Amoeba API",
	})

	api := app.Group("/api/v1")

	// Initialize and mount health module
	healthService := health.NewService()
	healthHandler := health.NewHandler(healthService)
	health.RegisterRoutes(api, healthHandler)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
