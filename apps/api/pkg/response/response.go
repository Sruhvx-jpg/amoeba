package response

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
