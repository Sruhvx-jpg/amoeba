package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseUrl string
	JWTSecret   string
	Environment string
}

func Load() (*Config, error) {
	port, err := getEnv("PORT")
	if err != nil {
		return nil, err
	}

	dbUrl, err := getEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}

	jwtSecret, err := getEnv("JWT_SECRET")
	if err != nil {
		return nil, err
	}

	env, err := getEnv("ENVIRONMENT")
	if err != nil {
		return nil, err
	}

	return &Config{
		Port:        port,
		DatabaseUrl: dbUrl,
		JWTSecret:   jwtSecret,
		Environment: env,
	}, nil
}

func getEnv(key string) (string, error) {
	val := os.Getenv(key)
	if val == "" {
		return "", fmt.Errorf("missing environment variable: %s", key)
	}

	return val, nil
}
