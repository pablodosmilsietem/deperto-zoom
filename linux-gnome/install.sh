#!/usr/bin/env bash
set -e

UUID="deperto@dennisguim.com"
INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "Installing $UUID..."
mkdir -p "$INSTALL_DIR/schemas"

cp extension.js metadata.json prefs.js "$INSTALL_DIR/"
cp schemas/*.xml "$INSTALL_DIR/schemas/"
glib-compile-schemas "$INSTALL_DIR/schemas/"

echo ""
echo "✓ Installed to $INSTALL_DIR"
echo ""
echo "Next steps:"
echo "  1. Enable:   gnome-extensions enable $UUID"
echo "  2. Log out and log back in (required on Wayland for changes to take effect)"
