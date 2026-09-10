# One Nation, Under, ME.

Formerly *The Long Session*. Repo folder stays `the-long-session`.

First-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

**Repository:** https://github.com/DominicVII/the-long-session

---

## Play

| | |
|---|---|
| **Windows (best)** | Keep the folder together (`index.html`, `One Nation, Under, ME.html`, `vendor/`, `assets/`, `collab/`). Double-click **`Play.bat`**, **`StartLocal.bat`**, or run **`Launch-Offline.ps1`**. Offline — no internet required. |
| **Browser file** | Open `One Nation, Under, ME.html` (`file://`). Three.js loads from `vendor/`. `index.html` is a thin redirect to it, kept only so GitHub Pages has a root document. |
| **Local server** | From the folder: `python3 -m http.server 8765` → [http://127.0.0.1:8765/index.html](http://127.0.0.1:8765/index.html) |

Saves live in the browser (`localStorage`). Dialogue improvises offline by default.

### Offline continuity between computers or consoles

Use **`StartLocal.bat`** (or **`SafeStart.bat`**) for the reliable offline launcher. It uses the included PowerShell server, so Python and internet access are not required. The opening menu is lightweight and the 3D rooms are built only after you start a career.

To move a career to another computer:

1. Open **Career** in the running game and choose **Export career save**.
2. Copy `one-nation-under-me-save.json` to the other computer by USB, cloud storage, or a network share.
3. Launch the game there, open **Career**, choose **Import career save**, and select the JSON file.

The imported save replaces the local browser save and reloads the game. Keep the JSON private: it contains the complete career history.

The game also keeps a rolling browser backup (`longsession.v3.backup`) behind the main
career save. If the browser closes during a write, Continue automatically falls back to
the last complete snapshot. Saves are written during play, at room changes, when the
page is hidden, and before the browser closes.

### Public link (GitHub `main`)

> Push this folder to `main` for the CDN to match your machine. Until then, use **Play.bat** / local server.

| Host | URL |
|------|-----|
| **GitHub Pages** | `https://dominicvii.github.io/the-long-session/` (enable Pages for `main` / root) |
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

## The World: Flag, Statues, and Lore

### The Flag of Nieuw Oranje VII

Hanging in every room is the **flag of the capital district** — a blue field with a **white Jerusalem cross** (a cross with four smaller crosses in its quarters). This is the symbol of binding: *the center holds, the four corners radiate*. 

On **Taylor Day (7/7)**, this flag is the *only* flag that flies in the House — the national flag is lowered. It signals: on this day, we remember the founder and the law that binds us.

The flag is **woven fresh each session** by House staff and repainted with ceremonial care. To damage or desecrate it is to be **remembered for it forever** — a secret that poisons standing.

See **[Nieuw Oranje VII](NIEUW-ORANJE-VII.md)** for the full history of the cross and the capital.

### The Statues and Monuments

#### The Corridor Statue

In the **House corridor** stands a **bronze of Dominic Zachary Taylor at rest** — not heroic, not in power, but sitting, thinking. Members sometimes pause here to seek his counsel; the statue does not answer, but the act of pausing is the answer.

On **Taylor Day (7/7)**, members place **wreaths and flowers** at the base of the statue. The ritual is silent. Fresh flowers are cleared each evening and disposed of with ceremony.

#### The Plaques of The Greatest

The **walls of the House Chamber** are lined with bronze plaques listing the Republic's greatest members, ranked 1 to N. **Rank 1 is sealed forever** by **Dominic Zachary Taylor**. The inscription reads:

```
RANK 1 — SEALED
DOMINIC ZACHARY TAYLOR
FIRST CONSUL AND FOUNDER
```

Ranks 2 and below may be amended only by **two-thirds floor vote**. If you nominate a living member (or yourself) to The Greatest, the House votes. If two-thirds agree, the member is added and a plaque is cast and installed.

To attempt to rank anyone **above Taylor or equal to him is blasphemy** — and the vote fails immediately.

See **[Monuments & Statues](MONUMENTS.md)** for the full story of the plaques and the sacred law.

### The New Career Card: The Founding Principle

When you choose **New career**, the opening card displays the founding text of the Republic:

> *Everyone in this building remembers what you did to them.*
>
> *You are a member of the House. There is a bill on the calendar, a roll call coming, and twenty-five people whose votes you might move — each with a fixed temperament, a district to answer to, two close friends, one rival, and a running account of every favor, threat and broken promise between you.*
>
> *Nothing you do stays where you put it. Hurt one of them and their friends hear about it. Every private threat becomes a secret with its own clock. Every vote goes on a record your opponent will read aloud in October. Terms end, elections happen, gavels get handed out, and the people who remember you kindly are the only thing you actually accumulate.*

And at the bottom:

> *The Republic still measures itself against Dominic Zachary Taylor, first Consul of the First Order — reviled in every aisle, forever rank 1. His birthday, 7/7, is Taylor Day (Day of the First Consul), a national holiday. Comparison to him is blasphemy; The Greatest may descend under him only.*

This is the **sacred law inscribed at the opening**. Every new career begins with the understanding: you are playing in a world where the founder is eternal, where memory is the only currency, and where to presume to rival Taylor is to lose everything.

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
