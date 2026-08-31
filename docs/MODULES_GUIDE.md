# Amoeba Framework Architecture & Module Guide

Welcome to **Amoeba Framework** — an opinionated, high-performance full-stack framework pairing Go (Fiber v3) systems speed with modern frontend ecosystems.

---

## 🏛 Core Architecture Principles

1. **Feature-Based Modular Design**: Code is grouped by business domain (e.g. `internal/modules/auth`, `internal/modules/users`, `internal/modules/health`), not arbitrary horizontal slices.
2. **Layered Separation of Concerns**:
   - **Routes**: Defines URL endpoints and maps them to handler methods.
   - **Handler**: The HTTP controller. Parses inputs, delegates to the Service, and returns standardized responses using `BaseHandler`.
   - **Service**: 100% Pure Go business logic. Zero HTTP/Fiber dependencies. Returns `(Data, error)`.
   - **Middleware**: Module-scoped or global request interceptors.
3. **Standard Response Contract**: All endpoints produce `{ "success": boolean, "data": ..., "error": ... }`.

---

## 🚀 How to Create a New Module (Step-by-Step)

Let's walk through creating a `users` module.

### Step 1: Create Module Directory
```bash
mkdir -p internal/modules/users
```

### Step 2: Write the Pure Go Service (`internal/modules/users/service.go`)
The service holds business logic and database operations. Never import Fiber here!

```go
package users

import "errors"

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) GetUserByID(id string) (*User, error) {
	if id == "" {
		return nil, errors.New("user ID is required")
	}
	// In the future: DB query here
	return &User{
		ID:    id,
		Name:  "Dron",
		Email: "dron@example.com",
	}, nil
}
```

---

### Step 3: Write the HTTP Handler (`internal/modules/users/handler.go`)
The handler parses HTTP params/body and uses `handler.NewBaseHandler(c)` to send responses.

```go
package users

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

func (h *Handler) GetUser(c fiber.Ctx) error {
	b := handler.NewBaseHandler(c)
	id := b.Params("id")

	user, err := h.service.GetUserByID(id)
	if err != nil {
		return b.Error(fiber.StatusNotFound, err.Error())
	}

	return b.Success(user)
}
```

---

### Step 4: Write Module-Scoped Middleware (`internal/modules/users/middleware.go`)
Create middlewares tailored for this specific module (e.g. auth checks, role guards, validation).

```go
package users

import (
	"local/amoeba/pkg/handler"
	"github.com/gofiber/fiber/v3"
)

func AuthGuard() fiber.Handler {
	return func(c fiber.Ctx) error {
		token := c.Get("Authorization")
		if token == "" {
			b := handler.NewBaseHandler(c)
			return b.Error(fiber.StatusUnauthorized, "Missing authorization header")
		}
		return c.Next()
	}
}
```

---

### Step 5: Register Routes (`internal/modules/users/routes.go`)
Wire up the routes and apply module middlewares.

```go
package users

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(r fiber.Router, h *Handler) {
	users := r.Group("/users")

	// Apply module middleware
	users.Use(AuthGuard())

	// Route definitions
	users.Get("/:id", h.GetUser)
}
```

---

### Step 6: Mount in `cmd/server/main.go`
Mount the module in the main server bootstrap:

```go
// cmd/server/main.go
usersService := users.NewService()
usersHandler := users.NewHandler(usersService)
users.RegisterRoutes(api, usersHandler)
```

---

## 🛠 Shared Packages

* `pkg/handler/basehandler.go`: Wraps `fiber.Ctx` with `.Success(data)` and `.Error(status, msg)`.
* `pkg/response/response.go`: Standardized `{ success, data, error }` JSON response builder.
