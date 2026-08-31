package schema

import "gorm.io/gorm"

// Migrate executes auto-migration for all schemas registered in the system.
// This is the direct Go equivalent of running `drizzle-kit push`.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		// Register upcoming schemas here:
		// &Post{},
		// &Comment{},
	)
}
