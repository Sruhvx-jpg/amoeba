package schema

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents the users table schema.
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	Email     string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"` // "-" excludes field from JSON responses
	Role      string         `gorm:"type:varchar(50);not null;default:'user'" json:"role"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // Enables soft deletes
}

// TableName explicitly defines the SQL table name.
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook runs automatically before inserting a new record.
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
