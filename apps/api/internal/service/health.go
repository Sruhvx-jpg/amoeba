package service

import (
	"context"

	"local/amoeba/internal/types"

	"gorm.io/gorm"
)

type HealthService struct {
	db *gorm.DB
}

func NewHealthService(db *gorm.DB) *HealthService {
	return &HealthService{db: db}
}

func (s *HealthService) Check(ctx context.Context) types.HealthStatus {
	dbStatus := "connected"
	sqlDB, err := s.db.DB()
	if err != nil || sqlDB.PingContext(ctx) != nil {
		dbStatus = "disconnected"
	}

	return types.HealthStatus{
		Status:   "ok",
		Database: dbStatus,
	}
}
