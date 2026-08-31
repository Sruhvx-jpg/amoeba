package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "amoeba",
	Short: "🦠 Amoeba Framework CLI - Scaffolding fullstack Go + Frontend apps",
	Long: `Amoeba Framework CLI is the official project generator and toolchain 
for building ultra-fast fullstack apps with Go (Fiber v3) and modern frontends (Next.js, Tauri, React).`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.AddCommand(newCmd)
}
