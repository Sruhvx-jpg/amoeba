package health

import "github.com/gofiber/fiber/v3"

func Middleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		return c.Next()
	}
}
