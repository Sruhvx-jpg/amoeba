package main

import (
	"fmt"
	"log"
	"os"

	"local/amoeba/internal/config"
	"local/amoeba/internal/database"
	"local/amoeba/internal/schema"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.Connect(cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "\n%s\n", "❌ Amoeba Database Connection Error:")
		fmt.Fprintf(os.Stderr, "   Could not establish a connection to PostgreSQL.\n\n")
		fmt.Fprintf(os.Stderr, "   • Required Variable: %s\n", "DATABASE_URL")
		if cfg.DatabaseUrl == "" {
			fmt.Fprintf(os.Stderr, "   • Current Value:     %s\n", "<empty>")
		} else {
			fmt.Fprintf(os.Stderr, "   • Current Value:     %s\n", cfg.DatabaseUrl)
		}
		fmt.Fprintf(os.Stderr, "   • Expected Format:   %s\n", "postgres://username:password@localhost:5432/dbname?sslmode=disable")
		fmt.Fprintf(os.Stderr, "   • How to fix:        Set DATABASE_URL in 'apps/api/.env' and ensure PostgreSQL is running.\n\n")
		os.Exit(1)
	}

	log.Printf("Connecting to PostgreSQL at %s ...", cfg.DatabaseUrl)
	if err := schema.Migrate(db); err != nil {
		log.Fatalf("failed to auto-migrate schemas: %v", err)
	}

	log.Println("✔ Database migrations applied successfully")
}
