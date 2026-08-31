package health

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(r fiber.Router, h *Handler) {
	r.Get("/health", h.Check)
}
