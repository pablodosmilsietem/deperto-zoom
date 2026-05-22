# Deperto — Zoom by Scroll

A GNOME Shell extension that lets you zoom your screen with **Super + Scroll wheel**.

This is a fork of [dennisguim/deperto](https://github.com/dennisguim/deperto) with two bug fixes:

- **Zoom during grabs** — zoom now works when the quick settings panel, power-off dialog, or screenshot tool is open (previously blocked by Clutter stage grabs)
- **Cursor shape during zoom** — cursor icon updates correctly while zoomed in (previously froze on whatever shape it had when zoom started)

---

## Requirements

- **Linux** with GNOME Shell 45–50
- Tested on Fedora with GNOME on Wayland
- Compatible with Ubuntu GNOME, Arch, and any distro running GNOME Shell 45+

> **Windows / macOS?** Use the built-in zoom:
> - **Windows**: `Win` + `+` (Windows Magnifier)
> - **macOS**: `Cmd` + `Option` + `8` (Accessibility Zoom)

---

## Install

```bash
git clone https://github.com/YOUR_USERNAME/deperto-zoom.git
cd deperto-zoom
chmod +x install.sh
./install.sh
```

Then enable the extension:

```bash
gnome-extensions enable deperto@dennisguim.com
```

**On Wayland** you must log out and log back in after enabling (GNOME Shell on Wayland can't hot-reload extensions mid-session).

---

## Usage

| Action | Shortcut |
|--------|----------|
| Zoom in | `Super` + Scroll up |
| Zoom out | `Super` + Scroll down |
| Reset zoom | Scroll down until zoom reaches 1× |

Open **GNOME Extensions** app → Deperto settings to configure:

- **Zoom Step** — how much each scroll tick zooms (default: 0.25)
- **Smooth Zoom** — animate zoom transitions (off by default; may lag on slow hardware)

---

## Uninstall

```bash
gnome-extensions disable deperto@dennisguim.com
rm -rf ~/.local/share/gnome-shell/extensions/deperto@dennisguim.com
```

---

## Credits

Original extension by [dennisguim](https://github.com/dennisguim/deperto).  
Bug fixes added in this fork.
