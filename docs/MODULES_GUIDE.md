# Amoeba Framework Architecture Guide

Welcome to **Amoeba Framework** — an opinionated, high-performance full-stack framework pairing Go (Fiber v3) systems speed with modern frontend ecosystems.

---

## ⚡ Core Architecture Principles

1. **Unidirectional Dependency Flow (DAG)**: Code dependencies flow strictly in one direction:
   `cmd/server` ➔ `internal/routes` ➔ `internal/service` ➔ `internal/types`, `internal/schema` & `internal/database`.
   Zero circular package imports.
2. **Lean Layering**:
   - **`internal/types`**: Pure Go struct definitions (Request DTOs, Response DTOs, Enums). Zero internal dependencies.
   - **`internal/schema`**: Leaf package holding GORM structs and `Migrate(db)`.
   - **`internal/service`**: Pure Go business logic and database queries using `gorm.DB`. Zero HTTP/Fiber dependencies.
   - **`internal/routes`**: HTTP route definitions and handlers using Fiber v3 and direct `pkg/response` helpers.
   - **`pkg/response`**: Allocation-free JSON envelope helpers (`OK`, `Created`, `Error`).
3. **Standard Response Contract**: All endpoints produce `{ "success": boolean, "data": ..., "error": ... }`.

---

## 🛠 Adding a New Feature (Example: Notes)

### Step 1: Define DTOs in Types (`internal/types/note.go`)
```go
package types

type CreateNoteInput struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}
```

---

### Step 2: Define GORM Schema (`internal/schema/note.go`)
```go
package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Note struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Title     string         `gorm:"type:varchar(200);not null" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Note) TableName() string {
	return "notes"
}

func (n *Note) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}
```

Register it in `internal/schema/schema.go`:
```go
package schema

import "gorm.io/gorm"

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&Note{},
	)
}
```

---

### Step 3: Implement Service (`internal/service/note.go`)
```go
package service

import (
	"context"
	"errors"

	"local/amoeba/internal/schema"
	"local/amoeba/internal/types"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteService struct {
	db *gorm.DB
}

func NewNoteService(db *gorm.DB) *NoteService {
	return &NoteService{db: db}
}

func (s *NoteService) Create(ctx context.Context, input types.CreateNoteInput) (*schema.Note, error) {
	if input.Title == "" {
		return nil, errors.New("title is required")
	}

	note := &schema.Note{
		Title:   input.Title,
		Content: input.Content,
	}

	if err := s.db.WithContext(ctx).Create(note).Error; err != nil {
		return nil, err
	}
	return note, nil
}
```

---

### Step 4: Register HTTP Routes (`internal/routes/note.go`)
```go
package routes

import (
	"local/amoeba/internal/service"
	"local/amoeba/internal/types"
	"local/amoeba/pkg/response"

	"github.com/gofiber/fiber/v3"
)

func registerNoteRoutes(router fiber.Router, noteSvc *service.NoteService) {
	const path = "/notes"
	notes := router.Group(path)

	notes.Post("/", func(c fiber.Ctx) error {
		var input types.CreateNoteInput
		if err := c.Bind().Body(&input); err != nil {
			return response.Error(c, fiber.StatusBadRequest, "invalid request body")
		}

		note, err := noteSvc.Create(c.Context(), input)
		if err != nil {
			return response.Error(c, fiber.StatusUnprocessableEntity, err.Error())
		}

		return response.Created(c, note)
	})
}
```

---

### Step 5: Wire in `internal/routes/routes.go`
```go
package routes

import (
	"local/amoeba/internal/service"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB) {
	const prefix = "/api/v1"
	api := app.Group(prefix)

	// Services
	healthSvc := service.NewHealthService(db)
	noteSvc := service.NewNoteService(db)

	// Routes
	registerHealthRoutes(api, healthSvc)
	registerNoteRoutes(api, noteSvc)
}
```
