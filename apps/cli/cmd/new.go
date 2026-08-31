package cmd

import (
	"fmt"

	"amoeba/cli/internal/scaffold"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
)

var (
	frontendFlag string

	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#00FFA3")).
			MarginTop(1).
			MarginBottom(1)

	successStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#00E5FF"))

	subtleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#888888"))
)

var newCmd = &cobra.Command{
	Use:   "new [project-name]",
	Short: "Create a new Amoeba project",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println(titleStyle.Render("🦠 Amoeba Framework Scaffolder"))

		var projectName string
		if len(args) > 0 {
			projectName = args[0]
		}

		var frontend = frontendFlag

		// Interactive prompts if not supplied
		fields := []huh.Field{}

		if projectName == "" {
			fields = append(fields,
				huh.NewInput().
					Title("Project Name").
					Description("Enter the name of your new Amoeba project").
					Value(&projectName).
					Validate(func(s string) error {
						if len(s) == 0 {
							return fmt.Errorf("project name cannot be empty")
						}
						return nil
					}),
			)
		}

		if frontend == "" {
			fields = append(fields,
				huh.NewSelect[string]().
					Title("Select Frontend Framework").
					Description("Choose the frontend layer for your Go Fiber backend").
					Options(
						huh.NewOption("Next.js 15 (App Router + Tailwind CSS)", "nextjs"),
						huh.NewOption("Tauri 2.0 (Rust Desktop + React/Vite)", "tauri"),
						huh.NewOption("React (Vite + TypeScript + Tailwind)", "react"),
						huh.NewOption("API Only (Pure Go Fiber Backend)", "api-only"),
					).
					Value(&frontend),
			)
		}

		if len(fields) > 0 {
			form := huh.NewForm(huh.NewGroup(fields...))
			if err := form.Run(); err != nil {
				return err
			}
		}

		fmt.Printf("\n⚡ Generating Amoeba project: %s (Frontend: %s)...\n", projectName, frontend)

		opts := scaffold.Options{
			ProjectName: projectName,
			Frontend:    frontend,
		}

		if err := scaffold.GenerateProject(opts); err != nil {
			return fmt.Errorf("failed to scaffold project: %w", err)
		}

		fmt.Println("\n" + successStyle.Render("✔ Project scaffolded successfully!"))
		fmt.Println(subtleStyle.Render("\nNext steps:"))
		fmt.Printf("  cd %s\n", projectName)
		fmt.Printf("  cd apps/api && go run ./cmd/server/main.go\n")
		if frontend != "api-only" {
			targetDir := "apps/web"
			if frontend == "tauri" {
				targetDir = "apps/desktop"
			}
			fmt.Printf("  cd ../%s && npm install && npm run dev\n", targetDir)
		}
		fmt.Println()

		return nil
	},
}

func init() {
	newCmd.Flags().StringVarP(&frontendFlag, "frontend", "f", "", "Frontend framework (nextjs, tauri, react, api-only)")
}
