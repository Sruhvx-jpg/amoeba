package database

import (
	"fmt"
	"time"

	"local/amoeba/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect initializes the GORM database connection and configures connection pooling.
func Connect(cfg *config.Config) (*gorm.DB, error) {
	if cfg.DatabaseUrl == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is empty")
	}

	logLevel := logger.Warn
	if cfg.Environment == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseUrl), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connection failed: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve generic sql.DB handle: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("ping failed: %w", err)
	}

	db.Logger = logger.Default.LogMode(logLevel)

	// Connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}
