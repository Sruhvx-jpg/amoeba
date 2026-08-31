package routes

import (
	"local/amoeba/internal/service"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// Setup initializes the root API routes and mounts service endpoints.
func Setup(app *fiber.App, db *gorm.DB) {
	const prefix = "/api/v1"
	api := app.Group(prefix)

	// Singleton services
	healthSvc := service.NewHealthService(db)

	// Mount routes
	registerHealthRoutes(api, healthSvc)
}
