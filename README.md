# One Nation, Under, ME.

Formerly *The Long Session*. Repo folder stays `the-long-session`.

First-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

**Repository:** https://github.com/DominicVII/the-long-session

---

## Play

| | |
|---|---|
| **Windows (best)** | Keep the folder together (`index.html`, `vendor/`, `collab/`). Double-click **`Play.bat`** (or `.\Play.ps1`). Offline — no internet required. |
| **Browser file** | Open `index.html` (`file://`). Three.js loads from `vendor/`. |
| **Local server** | From the folder: `python3 -m http.server 8765` → [http://127.0.0.1:8765/index.html](http://127.0.0.1:8765/index.html) |

Saves live in the browser (`localStorage`). Dialogue improvises offline by default.

### Public link (GitHub `main`)

> Push this folder to `main` for the CDN to match your machine. Until then, use **Play.bat** / local server.

| Host | URL |
|------|-----|
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **jsDelivr** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |

Update a PC copy: `git pull`, `./update.sh`, or `.\update.ps1`.

---

## What you get

| Pillar | |
|--------|--|
| **Immersive FPV** | Ornate rooms, sash windows, unified picture frames, grounded furniture & doors |
| **Full detail** | Best graphics / `fullDetail` — long LODs, soft shadows, readable faces & cloth |
| **Phone + pad** | House phone; X = day schedule; bumpers/triggers navigate; A confirms |
| **CATCH ticker** | Frame-based podium catch; pieced speech vs pen path |
| **The Wire ticker** | Bottom bar scrolls ~15s per loop (frame-driven) |
| **Unchained Vox** | Free dialogue, typed out |
| **Autonomy** | Every person keeps their own thought / hope / vision |
| **Taylor canon** | Dominic Zachary Taylor · Nieuw Oranje 7 · Taylor Day (7/7) |
| **Collab** | Two seats; Proxy AI from a partner’s play log |

---

## Getting in

1. **Continue** (save) or **New career**
2. Six-question sorting test → party / independent / found a party
3. Build the body → oath → walk the building

**Continue / next day:** click the button, press **Enter**, or press **A** on a pad (no D-pad required for the primary card action).

---

## Controls (summary)

Full tables → **`CONTROLS.md`**.

| | |
|---|---|
| **W / S · Q / C** | Walk · strafe |
| **Mouse / A D / stick** | Look |
| **E / click / A** | Use · catch · confirm |
| **B / Esc** | Back out of CATCH / glass |
| **X** | Day schedule (hold = speak aloud) |
| **F / Y** | Phone |
| **Space / Start** | Pause |

---

## The day

08:00–22:00 game time. Morning **briefing** → RSVP meetings → **Start the day**. Nightfall → **Sleep** → next briefing. Ignore the calendar and the building remembers.

---

## Canon & systems notes

`CONTROLS.md` · `PODIUM-CATCH.md` · `VOX.md` · `AUTONOMY.md` · `TAYLOR-CANON.md` · `FACES.md` · `WINDOWS.md`

---

Single HTML file plus `vendor/` and `collab/`. Textures, faces, garments, and flags are generated at runtime.
