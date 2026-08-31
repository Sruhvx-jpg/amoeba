package health

import (
	"local/amoeba/pkg/handler"

	"github.com/gofiber/fiber/v3"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Check(c fiber.Ctx) error {
	b := handler.NewBaseHandler(c)
	data, err := h.service.Check()
	if err != nil {
		return b.Error(fiber.StatusInternalServerError, err.Error())
	}
	return b.Success(data)
}
