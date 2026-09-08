# Collab — two humans, two House members

Co-op v1: each human plays one chamber member. There is **no hosted game server**.
You sync by **git** (pull/push this `collab/` folder) or by copying the folder / JSON exports.

## Setup (two players)

1. Copy `players/_template.json` to `players/<your-id>.json` (e.g. `players/dom.json`, `players/alex.json`).
2. Set `id`, `displayName`, and (once a career exists) `memberId` to the House member you own.
3. Put both files in `collab/players/` and share via git, or **Export / Import** from the in-game Collab panel (Settings → Collab). The panel stores the same schema in `localStorage` under `tls-collab-players` so `file://` play works without reading the folder.

## Seats

| Seat | Who |
|------|-----|
| **A** | You — the existing single-player save (`G.you`) |
| **B** | Partner — a named profile tied to one AI member (`memberId`) |

In Settings → Collab, set the partner’s display name, pick which chamber member they are, and toggle **I’m playing as** A or B so votes and speeches log into that profile’s `actions[]`.

## Proxy AI (partner absent)

When **Partner absent → Proxy AI** is on, Seat B’s member no longer uses the generic NPC vote brain. `collab/proxy.js` exposes `ProxyAI.decide(player, situation)`:

- Builds a histogram / weighted lean from past `actions[]` (votes, speeches, party-line breaks).
- Picks aye/no (and speech lean) from that history — **not** random NPC behaviour.

Record real play first; a thin log falls back to coarse style axes and aye-rate.

## Sync without a server

- **Git:** `git pull` / `git push` the `collab/` folder (or run `../update.sh` / `../update.ps1` then commit your exports).
- **Copy:** zip or copy `collab/` between machines.
- **In-game:** Export JSON from Collab, commit the file under `collab/players/`, partner Import after pull.

True realtime sync can come later. `world.json` holds shared session metadata (`version`, `session`, `members`); players own their action logs.

## file:// limits

Browsers cannot scan `collab/players/` from disk. Use Export/Import + localStorage (already wired). Opening `index.html` still loads `collab/proxy.js` via a relative script tag when the file sits beside the game.
