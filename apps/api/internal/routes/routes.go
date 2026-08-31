package routes

import (
	"local/amoeba/internal/modules/health"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// Setup initializes the root API routes and mounts all feature modules.
func Setup(app *fiber.App, db *gorm.DB) {
	api := app.Group("/api/v1")

	// Mount Health module
	healthService := health.NewService()
	healthHandler := health.NewHandler(healthService)
	health.RegisterRoutes(api, healthHandler)

	// Mount upcoming modules here:
	// userRepo := user.NewRepository(db)
	// userService := user.NewService(userRepo)
	// userHandler := user.NewHandler(userService)
	// user.RegisterRoutes(api, userHandler)
}
