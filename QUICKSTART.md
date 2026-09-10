# 🎮 One Nation, Under, ME. — Quick Start Guide

**Play now!** Double-click the desktop shortcut **"One Nation Under ME"** or run any launcher below.

---

## Launch Methods (Windows)

### 🖱️ Desktop Shortcut (Easiest)
- **One Nation Under ME** shortcut on your desktop
- Auto-starts the server and opens the game in your browser
- No setup needed — just double-click

### 📄 Batch Files (From the game folder)
1. **StartLocal.bat** (Recommended) — HTTP server, excellent compatibility
2. **Play.bat** — Direct file access (may have WebGL issues)
3. **SafeStart.bat** — Simplified graphics mode

### 🔵 PowerShell (From the game folder)
- Right-click `Launch-Offline.ps1` → "Run with PowerShell"

---

## First Time Playing

1. **Start the game** using any method above
2. Choose **"New career"** at the opening screen
3. Answer the **six political questions** (this determines your starting party)
4. **Customize your character** — select appearance, build, outfit
5. **Take the oath** and enter the House
6. Read your **morning briefing** and start making decisions

---

## Basic Controls

| Action | Keyboard | Mouse | Gamepad |
|--------|----------|-------|---------|
| Walk | W/S | - | Stick |
| Look | Mouse | Mouse | Stick |
| Strafe | Q/C | - | Bumpers |
| Interact/Confirm | E | Click | A |
| Phone | F | - | Y |
| Schedule | X | - | X |
| Pause | Space | - | Start |
| Back out | Esc | - | B |

**Full controls:** See `CONTROLS.md`

---

## Game Overview

You are one member of the **House of Representatives** in an invented republic. 

**Your career depends on:**
- Standing with colleagues
- Influence in your party  
- Voter approval in your district
- Money in your campaign account

**Every decision matters** — what you say, who you vote with, what you promise, and what you deliver. Other representatives remember everything.

**Your day:** Starts at 08:00 → Morning briefing → Schedule meetings → Vote on bills → Evening → Sleep

**Your year:** ~250 days of political maneuvering, alliances, and consequences

---

## Saving Your Game

**Saves automatically** to your browser (`localStorage`). Your career progress is preserved between sessions.

### Export/Import Your Career
- In-game: **Career** menu → **Export career save** (creates `one-nation-under-me-save.json`)
- Move the JSON to another computer
- On the new computer: **Career** → **Import career save** → Select your JSON file

---

## If Something Goes Wrong

### Server won't start on port 8765
- Check if another app is using port 8765
- Run `SafeStart.bat` for a fallback mode
- Or use `python3 -m http.server 8765` if Python is installed

### Game runs but graphics are slow
- The game loads detailed 3D scenes
- Close other browser tabs/apps
- Try `SafeStart.bat` for simpler graphics

### Save won't load
- Browser might have cleared localStorage
- Check if you have a career export JSON file
- Use **Import career save** to restore it

---

## System Requirements

- **Windows 7+** (tested on Windows 10/11)
- **Modern browser:** Edge, Chrome, Firefox, Safari
- **No internet required** — plays fully offline
- **No Python required** — uses built-in PowerShell server

---

## More Information

- **Repository:** https://github.com/DominicVII/the-long-session
- **Full controls:** `CONTROLS.md`
- **Game systems:** `PODIUM-CATCH.md`, `VOX.md`, `AUTONOMY.md`
- **Lore:** `TAYLOR-CANON.md`

---

**Happy governing!** 🏛️
