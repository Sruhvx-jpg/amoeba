package schema

import "gorm.io/gorm"

// Migrate registers and auto-migrates database schemas.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		// Register schemas here:
		// &MyModel{},
	)
}
