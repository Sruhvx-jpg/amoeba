#!/usr/bin/env bash
set -e

# Amoeba Framework Installer
# Works on Linux, macOS, and WSL

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
cat << "EOF"
  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ 
 ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
 ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║
 ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║
 ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║
 ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝
EOF
echo -e "${NC}"
echo -e "${BOLD}⚡ Installing Amoeba CLI (Systems Speed Core)...${NC}\n"

# 1. Detect OS and Architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="darwin";;
    MINGW*|MSYS*|CYGWIN*) PLATFORM="windows";;
    *)          echo -e "${RED}❌ Unsupported OS: $OS${NC}"; exit 1;;
esac

case "$ARCH" in
    x86_64|amd64)   TARGET_ARCH="x86_64";;
    aarch64|arm64)  TARGET_ARCH="aarch64";;
    *)              echo -e "${RED}❌ Unsupported Architecture: $ARCH${NC}"; exit 1;;
esac

INSTALL_DIR="${AMOEBA_INSTALL_DIR:-$HOME/.local/bin}"
mkdir -p "$INSTALL_DIR"

# 2. Check if user has cargo or if we download prebuilt binary
GITHUB_REPO="dron/amoeba"
VERSION="v0.1.0"

echo -e "Detected: ${GREEN}${PLATFORM}-${TARGET_ARCH}${NC}"
echo -e "Target Directory: ${CYAN}${INSTALL_DIR}${NC}\n"

# If local cargo is available, build/install or pull binary
if command -v cargo >/dev/null 2>&1; then
    echo -e "🦀 Rust toolchain detected. Installing via cargo..."
    # If in local repo:
    if [ -f "apps/cli/Cargo.toml" ]; then
        cargo build --release --manifest-path apps/cli/Cargo.toml
        cp apps/cli/target/release/amoeba "$INSTALL_DIR/amoeba"
    else
        # Try installing from git repo
        cargo install --git "https://github.com/${GITHUB_REPO}" --bin amoeba || {
            echo -e "${BLUE}Downloading release binary fallback...${NC}"
        }
    fi
fi

# Fallback download binary from GitHub Releases if not installed yet
if [ ! -f "$INSTALL_DIR/amoeba" ]; then
    RELEASE_URL="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/amoeba-${VERSION}-${TARGET_ARCH}-${PLATFORM}.tar.gz"
    echo -e "⬇️  Fetching binary from ${RELEASE_URL}..."
    TMP_DIR=$(mktemp -d)
    if curl -fsSL "$RELEASE_URL" -o "$TMP_DIR/amoeba.tar.gz" 2>/dev/null; then
        tar -xzf "$TMP_DIR/amoeba.tar.gz" -C "$TMP_DIR"
        mv "$TMP_DIR/amoeba" "$INSTALL_DIR/amoeba"
        chmod +x "$INSTALL_DIR/amoeba"
        rm -rf "$TMP_DIR"
    else
        echo -e "${BLUE}Release asset not found upstream yet. Compiling locally if possible...${NC}"
        if command -v cargo >/dev/null 2>&1; then
            TMP_SRC=$(mktemp -d)
            git clone "https://github.com/${GITHUB_REPO}" "$TMP_SRC/amoeba" --depth=1
            cargo build --release --manifest-path "$TMP_SRC/amoeba/apps/cli/Cargo.toml"
            cp "$TMP_SRC/amoeba/apps/cli/target/release/amoeba" "$INSTALL_DIR/amoeba"
            chmod +x "$INSTALL_DIR/amoeba"
            rm -rf "$TMP_SRC"
        else
            echo -e "${RED}❌ Please install Rust toolchain (https://rustup.rs) or download prebuilt binaries from https://github.com/${GITHUB_REPO}/releases${NC}"
            exit 1
        fi
    fi
fi

chmod +x "$INSTALL_DIR/amoeba"

# 3. Check PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "\n${BLUE}⚠️  $INSTALL_DIR is not in your PATH.${NC}"
    echo -e "Add this to your shell config file (~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish):"
    echo -e "${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}\n"
fi

echo -e "${GREEN}${BOLD}✨ Amoeba CLI successfully installed to ${INSTALL_DIR}/amoeba!${NC}"
echo -e "Run '${CYAN}amoeba --help${NC}' or '${CYAN}amoeba new <project_name>${NC}' to get started."
