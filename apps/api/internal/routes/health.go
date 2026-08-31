package routes

import (
	"local/amoeba/internal/service"
	"local/amoeba/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func registerHealthRoutes(router fiber.Router, healthSvc *service.HealthService) {
	const path = "/health"

	router.Get(path, func(c fiber.Ctx) error {
		status := healthSvc.Check(c.Context())
		return response.OK(c, status)
	})
}
