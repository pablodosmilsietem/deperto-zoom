# Zoom by Scroll

**Hold the Super/Win/Command key + scroll wheel to zoom your screen** — works the same way on all three platforms.

| Platform | Shortcut | Solution |
|----------|----------|----------|
| 🐧 Linux (GNOME) | `Super` + Scroll | GNOME Shell extension |
| 🪟 Windows | `Win` + Scroll | AutoHotkey v2 script |
| 🍎 macOS | `⌘ Command` + Scroll | Built-in (just needs config) |

---

## 🐧 Linux — GNOME Shell Extension

> Requires GNOME Shell 45–50 (Fedora, Ubuntu GNOME, Arch, etc.)

```bash
cd linux-gnome
chmod +x install.sh
./install.sh
gnome-extensions enable deperto@dennisguim.com
```

On Wayland, **log out and back in** after enabling (required once).

**Features:**
- Works even when quick settings panel, power-off dialog, or screenshot tool is open
- Cursor shape updates correctly while zoomed
- Configurable zoom step and smooth zoom (via GNOME Extensions app)

→ [Full instructions](linux-gnome/)

---

## 🪟 Windows — AutoHotkey Script

> Requires [AutoHotkey v2](https://www.autohotkey.com/) (free)

1. Install AutoHotkey v2
2. Double-click `windows/zoom-by-scroll.ahk`

To run on startup: copy the `.ahk` file to `shell:startup`.

→ [Full instructions](windows/)

---

## 🍎 macOS — Built-in Zoom

No software to install.

System Settings → Accessibility → Zoom → ✓ "Use scroll gesture with modifier keys" → set to ⌘ Command

→ [Full instructions](macos/)

---

## Credits

Linux extension based on [dennisguim/deperto](https://github.com/dennisguim/deperto) (v11) with bug fixes for grab interception and cursor tracking.
