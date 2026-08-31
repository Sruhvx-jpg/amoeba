package main

import (
	"log"

	"local/amoeba/internal/config"
	"local/amoeba/internal/database"
	"local/amoeba/internal/routes"
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
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := schema.Migrate(db); err != nil {
		log.Fatalf("failed to auto-migrate schemas: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "Amoeba API",
	})

	// Mount all routes
	routes.Setup(app, db)

	log.Printf("⚡ Amoeba API server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
