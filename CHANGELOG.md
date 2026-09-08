# One Nation, Under, ME. — changelog

(Formerly The Long Session.)

Live link: https://claude.ai/code/artifact/e1a2f577-1007-48dc-afaa-9b9f10205fc0

A political-career simulator: a 3D chamber built in three.js (r128), with
NPC members, bills, votes, secrets, a phone, and a save system. This
document tracks every change made to it in this session, in order, with
the reasoning behind each.

---

## 1. Event listener robustness

**Problem:** `wireSend`, `wireIn`, `wireTo`, `wireStop`, `chatThink`,
`chatPrompt` all had `addEventListener` called directly on
`el(id)` with no null check.

**Fix:** wrapped each in an IIFE that checks the element exists before
attaching a listener. Low risk, defensive only — these elements are all
static HTML so in practice `el()` never actually returned null for them,
but it cost nothing to guard.

## 2. Crowd-mode stutter (three fixes, same root cause)

**Problem:** every time the room's population crossed a single
threshold (`SAFE_CROWD = 6`), `applySimple()` toggled
`renderer.shadowMap.enabled`. Toggling that flag forces three.js to
recompile every material's shader before the next frame — and because
members wander between rooms constantly, the count sat right on the
line and re-triggered the recompile every second or so. The "crowd
optimization" was itself the stutter.

**Fix, in three layers:**
- **Hysteresis:** two thresholds instead of one — enter crowd mode
  above 7 people, leave only below 4. A room sitting on the boundary can
  no longer flip every tick.
- **Split the two jobs apart:** `applyCrowd()` (room-population driven)
  now only touches plain numbers the renderer reads next frame — LOD
  distances, seated-pose flag, pixel ratio. `applySimple()` (the
  player's explicit Settings toggle) is the only path that still
  touches the shadow-map flag, and it's rare by nature.
- **People stop casting shadows** (`PEOPLE_CAST_SHADOW = false`,
  gating three assignment sites inside `buildPerson`). This was the
  real fix for "only laggy when someone else is in the room" — the
  shadow pass refreshes on a fixed timer regardless of population; with
  one animated body present, every refresh now had to recompute its
  skin matrices and redraw a dozen-plus small meshes a second time,
  from the light's side. Bodies still `receiveShadow`, so the room's
  own shadows still fall on them correctly — only the shadow they cast
  back is gone.
- Bodies also drop pixel ratio to 1 while crowded, and LOD distances
  pull in further (2.4/5/7.5m vs the original 3/6/9).

## 3. Save/load hardening

**Problem 1:** the `save()` payload had eighteen keys listed twice in
the same object literal (`regime`, `exec`, `court`, `own`, etc.) —
harmless at runtime, but two sources of truth for the same field is
exactly the kind of thing that causes a real bug the next time someone
edits one copy and not the other.

**Problem 2:** `begin()` — which every "Continue" click runs — read
`ROOMS[G.room].t` with no guard. A save carrying a room key that no
longer exists (an old save format, hand-edited storage, a room later
renamed) would throw immediately and permanently break Continue for
that save, with no recovery.

**Fix:** removed the duplicate keys. Added validation in `loadSave()`:
if `G.room` isn't a real room, reset to `"office"` before `begin()` ever
runs; same guard extended to every member/press/civilian's room, and
`visitId` is cleared if it no longer makes sense.

## 4. HUD text over the view

**Problem:** the on-screen control legend (`W S — walk`, ten hints in
total) was permanently rendered over the top-right of the 3D view — not
conditional, not dismissible.

**Fix:** fades out (`.keys.is-gone{opacity:0}`) the instant the player
actually moves, looks, sits, speaks, or presses anything — keyboard,
pointer-drag, or gamepad — with a 14-second fallback timer for anyone
who never touches a listed key first.

## 5. Committee dais seating

**Problem:** the seven dais chairs in the Committee Room sit members up
on a 0.30m platform (`DIM.daisFloor`). NPCs already accounted for this
in their seated eye height (`m.sitY`), but the player's own `toggleSit()`
never read it — sitting in a dais seat put the camera at ordinary floor
height, i.e. inside the platform.

**Fix:** `toggleSit()` now stores `G.you.sitY = s2.y || 0`, and the
seated eye-height calculation reads it: `1.19 + (G.you.sitY || 0)`.

## 6. Small-object shadow-cast threshold

Existing heuristic already skipped shadow-casting for fittings below a
bounding-sphere radius of 0.14. Raised to 0.22 — more trim and hardware
stop paying for the shadow pass without a visible payoff.

## 7. Furniture that silently stays broken

**Problem:** people already had a per-frame repair sweep — if a body's
world matrix ever went bad (NaN, or flattened to zero scale, a known
failure mode with this renderer's bone/light uniform sharing), it got
rebuilt on the spot within half a second. Furniture never had the
equivalent. A desk or lamp that hit the same corruption just stayed
broken, permanently, regardless of graphics setting — this was never a
quality-tier problem, so Simple mode never fixed it either.

**Fix:** added the same repair pass for `roomGroup`. Throttled to a
fixed 24-object slice every half-second, with the window moving along
each tick (`furnCursor`), so a heavily furnished room costs the same
per frame as a sparse one. Lights are explicitly skipped — the
`LIGHT_BUDGET` system already turns those on and off on purpose.

## 8. The ticker → the phone

**Problem:** the scrolling "Wire" marquee ran a CSS keyframe animation
on its own clock, permanently, right alongside the WebGL canvas's own
render loop — two animation systems competing for frame budget the
entire time the game was open, whether anyone read it or not. It also
sat directly under the wire input, one more block of text over the
view.

**Fix:** removed entirely — the HTML element, its `@keyframes`, and the
row it occupied in `.shell`'s grid template (three places: base,
`is-bare`, and the ≤520px mobile layout). The same content
(`makeHeadlines()`) now renders once, on open, as a static list under a
new **Paper** tab on the phone — made the phone's default landing tab
since it's the direct replacement for what used to always be visible.
`paintTicker()` and the `feedDirty`/`feedTick` debounce machinery that
only existed to drive it were deleted outright.

## 9. Cross-browser save

**Problem:** `localStorage` is sandboxed per browser by the platform —
no code running inside the page can make two separate browsers share
it.

**Fix:** declared the artifact's `db` capability (a JSON document store
scoped to this artifact, reachable from anywhere the artifact is
opened, not just one browser). `save()` now writes to both
`localStorage` (fast, always-there, unchanged) and a shared document
`saves/main`, tagged with a real wall-clock timestamp
(`savedAtMs`), best-effort and fire-and-forget — the shared write can
never fail the local one.

At boot, the opening card still paints instantly from whatever's local
(so nothing waits on a capability that might never answer). A
`reconcileFromDB()` call then runs in the background: if the shared
document is newer than the local one, it replaces the local copy and
redraws the still-open opening card. Once the player has actually
clicked into a session (`G.running`), reconcile stops touching anything
— a slow response can't retroactively pull someone out of a game they
already started. "New career" and game-over both clear the shared
document too, via a new `clearSave()`, so a deliberate reset doesn't
get silently undone by an older save syncing back in from elsewhere.

A save too large for one document (256 KiB cap) still saves fine
locally — it just won't be the copy another browser sees.

---

## Known limitations

- None of this has been visually verified against a running instance —
  there's no renderer available in this environment, and the artifact
  sits behind a sign-in wall in-browser here. Every fix above is
  verified by tracing code paths (brace-balanced, every new reference
  wired to something that reads it, no dangling calls to anything
  removed) rather than by watching a frame counter.
- The `db` capability's cross-browser sync is built strictly to the
  platform's documented contract and has not been exercised against a
  live viewer.

---

## Offline Three.js, update scripts, and collab foundation

**Offline Three.js:** `index.html` loads `vendor/three.min.js` first (r128, ~590KB+).
CDN is a `document.write` fallback only if `window.THREE` never attached. Opening the
file from disk works fully offline when the vendor file sits beside it.

**README:** Standalone play (clone/ZIP → open `index.html`), `git pull` / `update.ps1` /
`update.sh`, optional GitHub Pages URL, and co-op v1 design documented.

**Update scripts:** `update.ps1` and `update.sh` run `git pull --ff-only`.

**Collab scaffold:** `collab/world.json`, `collab/players/_template.json`,
`collab/proxy.js` (`ProxyAI.decide` from action histograms), `collab/README.md`.
In-game **Collab** panel: Seat A/B, partner member, Proxy AI when absent, Export/Import
JSON mirrored in `localStorage` (`tls-collab-players`). Votes/speeches log into the
active seat; `memberVote` consults Proxy AI for the partner member when proxy is on.
Single-player path unchanged if Collab is ignored.

