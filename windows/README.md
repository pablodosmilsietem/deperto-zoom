# Zoom by Scroll — Windows

Uses **AutoHotkey v2** to intercept Win+Scroll and control Windows built-in Magnifier.

## Requirements

- Windows 10 or 11
- [AutoHotkey v2](https://www.autohotkey.com/) (free)

## Install

1. Install [AutoHotkey v2](https://www.autohotkey.com/download/)
2. Double-click `zoom-by-scroll.ahk` — it runs in the system tray
3. Done

**To run on startup automatically:**
- Press `Win + R`, type `shell:startup`, press Enter
- Copy `zoom-by-scroll.ahk` into that folder

## Usage

| Action | Shortcut |
|--------|----------|
| Zoom in | `Win` + Scroll up |
| Zoom out | `Win` + Scroll down |
| Close zoom / reset | `Win` + Middle click |

The first scroll up opens Windows Magnifier automatically.

## Notes

- Windows Magnifier opens in "Full screen" mode by default
- To change zoom increment: open Magnifier settings → adjust zoom level step
- To stop the script: right-click the AutoHotkey icon in the system tray → Exit
