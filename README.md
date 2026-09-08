# The Long Session

A first-person political life simulator. You are one member of a legislature in an
invented republic, and the only thing you accumulate is what other people think of you.

**Repository:** https://github.com/DominicVII/the-long-session

---

## Play standalone (no server)

1. Clone or download the ZIP from  
   **https://github.com/DominicVII/the-long-session**
2. Open `index.html` in a browser (double-click or drag into Chrome / Edge / Firefox).

No build step. No local web server required. Three.js loads from `vendor/three.min.js`
beside the HTML so **offline / `file://` play works**. A CDN copy is only used if the
local file is missing.

Optional alternate hosts (when you want a URL instead of a file):

- **GitHub Pages** (optional, once enabled):  
  https://dominicvii.github.io/the-long-session/
- Claude artifact (legacy):  
  https://claude.ai/public/artifacts/e1a2f577-1007-48dc-afaa-9b9f10205fc0

---

## Keep the PC copy up to date

From the repo root:

```bash
git pull
# or
./update.sh          # Unix / macOS / Git Bash
.\update.ps1         # Windows PowerShell
```

Both scripts run `git pull --ff-only` and remind you to open `index.html`.

---

## Co-op (v1 design)

Two humans = two House members.

| Piece | Role |
|-------|------|
| `collab/world.json` | Shared world / session metadata |
| `collab/players/<id>.json` | Per-player profile + `actions[]` log |
| `collab/proxy.js` | `ProxyAI.decide(player, situation)` — vote/speak from history |

When a player is **absent**, a local **Proxy AI** continues their member using `style`
learned from their real play log (`actions[]`: votes, speeches, party-line breaks) —
**not** a random NPC.

**Sync without a hosted game server:** `git pull` / `git push` the `collab/` folder, or
copy the folder / Export JSON between machines. True realtime can come later.

### In-game Collab panel

Open **Collab** under the view (or **Settings → Collab**):

- **Seat A** = you (existing single-player save)
- **Seat B** = partner profile name + which chamber member they own
- **I’m playing as…** — votes/speeches log into that seat’s profile
- **Partner absent → Proxy AI** — Seat B’s member votes via `ProxyAI` from their log
- **Export / Import JSON** — write files into `collab/` for git (required for `file://`,
  because browsers cannot scan `collab/players/` from disk)

Profiles also live in `localStorage` under `tls-collab-players`. See `collab/README.md`.

Single-player is unchanged if you never open Collab.

---

## Getting in

1. **New career** → the six-question sorting test.
2. Your answers *are* your politics. They set your position on four axes, your loyalty
   and your starting standing.
3. Take a party's ticket, sit as an independent, or **found your own party** if your
   answers fit neither bench.
4. Build your character — frame, dress, skin, hair, height, build, glasses, beard —
   then take the oath.

## Controls

| | |
|---|---|
| **W / S** | walk |
| **A / D** | look left and right |
| **Q / C** | step sideways |
| **Arrows** | look and pitch |
| **Drag** | look, both axes |
| **E** | speak to whoever you face / use what you face |
| **Space** | pause |
| **Shift** | stride (people notice if you barge past them) |

Xbox or any standard gamepad works. Everything is rebindable under **Settings**.

## The day

A full day — eight in the morning to ten at night — takes **30 real minutes at 1×**.
2× and 4× scale from there.

## What actually matters

**People remember.** Every favour, threat, broken promise and conversation writes a
signed, decaying memory. Nobody can read anyone's numbers — only a *read*. Everything
travels through friends and secrets. Influence, standing, approval and money come only
from what you do.

## The republic

- **Money** is the guilder. **Twenty states.** **Six lobbies.** Executive veto, court of
  five, amendments at two thirds. The form of the state follows the chamber.
- **Precedent accumulates** from the 1st Congress onward.

## Failing

Lose your seat → East Steps as a private citizen. Lose twice and that is the career.

## Talking

The bar at the bottom is always there. With Claude available, characters answer in full
character; **without a connection they improvise**, and the game is fully playable offline.

## Odds and ends

- **Save** from the bar; autosave every 20 game-minutes and on room change.
- **Add to Home Screen** works on supported browsers.

---

Built as a single HTML file plus optional `vendor/` and `collab/` folders. Every texture,
material, face, garment and flag is generated in code at runtime.
