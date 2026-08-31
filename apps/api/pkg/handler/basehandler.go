package handler

import (
	"local/amoeba/pkg/response"

	"github.com/gofiber/fiber/v3"
)

type BaseHandler struct {
	fiber.Ctx
}

func NewBaseHandler(c fiber.Ctx) *BaseHandler {
	return &BaseHandler{Ctx: c}
}

func (b *BaseHandler) Success(data any) error {
	return response.Success(b.Ctx, data)
}

func (b *BaseHandler) Error(status int, msg string) error {
	return response.Error(b.Ctx, status, msg)
}
