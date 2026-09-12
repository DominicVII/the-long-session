# One Nation, Under, ME. — changelog

(Formerly The Long Session.)

Live link: https://claude.ai/code/artifact/e1a2f577-1007-48dc-afaa-9b9f10205fc0

A political-career simulator: a 3D chamber built in three.js (r128), with
NPC members, bills, votes, secrets, a phone, and a save system. This
document tracks every change made to it in this session, in order, with
the reasoning behind each.

---

## Standalone app — one HTML, no network (12 Sep 2026)

- Three.js r128 and ProxyAI are inlined. The HTML boots from disk with no
  vendor folder, no CDN, no server.
- `Play.bat` opens an Edge/Chrome app window on the HTML.
- `Install-App.ps1` copies it to LocalAppData and pins Desktop + Start Menu shortcuts.

---


## Boot: duplicate skinKey + opening-card quote (12 Sep 2026)

- Duplicate `const skinKey` in `buildPerson` threw on load — renamed the body cache key.
- Opening-card logo `onerror` used nested single quotes, which is a parse error. The House would not start. Fixed.

---


## Shared body, hair cuts, suit cuts (12 Sep 2026)

- **One body model:** skinned geometry is shared per frame+outfit. Height/build is a root scale. Faces, hair, glasses stay unique.
- **Hair:** readable cuts plus **Caesar cut**. Side parting is two flattened combs with a scalp gap, not a lump.
- **Suits:** navy/burgundy/khaki/slate palette; open collar; real waistcoat; rolled sleeves; longer skirt/dress.
- **Glasses** sit in front of the face. Seated floor amendment and lectern radius clamp remain.

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


---

## Ready to play, and nothing left holding the machine

Two complaints, one session: *make the game ready to play fully*, and
*something has it in use*. The second turned out to be several different
things, all of them the launcher's fault rather than the game's.

### The server no longer sits in the game folder

`Serve-Local.ps1` inherited the game folder as its working directory,
and a process sitting in a folder locks that folder on Windows: the
folder cannot be moved or renamed, `git pull` fails, and Windows reports
it "in use by another process" — long after the player finished playing,
because the server window has no exit condition and nobody closes it.

The server now steps out to the temp folder before it serves a single
byte, so the folder it serves is never the folder it holds.

### A way to close it

New `Stop.bat` / `Stop-Local.ps1`. The server writes a small state file
(PID, port, root) under `%LOCALAPPDATA%\OneNationUnderME` and answers a
`/__quit` request; Stop asks politely first, forces only if that is
ignored, and clears the state file either way. It also sweeps the
launcher's ports for servers started before any of this existed.

When a port is still held afterwards, Stop names the program and PID
holding it. "Something has it in use" should not require the player to
go and find out what "something" is.

### A port that belongs to someone else is no longer a dead end

The old launcher treated *anything* answering on 8765 as the game: it
would open a stranger's page and call it the career, or announce the
port was in use and give up. New `Start-GameServer.ps1` asks a port who
it is (`/__onume`, which answers with the server's own root folder) and
walks to the next port — up to 8770 — whenever the answer is anybody
else, or a different copy of the game. The URL goes to stdout and
progress to stderr, so `StartLocal.bat` can read one while the player
reads the other.

### The microphone

Hold **V** (or pad **X**) is speak-aloud, and the browser holds the
microphone for as long as recognition is running. Alt-tab while holding
the key and the keyup never arrives — the game goes on believing it is
listening, and the tab keeps the microphone, so the next program the
player opens to talk to is told the mic is busy by something else.

`micStop()` now always asks the engine to let go rather than returning
early when it believes it already stopped, with an `abort()` behind it
if the engine does not end on its own. `blur`, `pagehide` and
`visibilitychange` all release it, and `blur` clears every held key as
well — the old behaviour returned the player to the game still walking
into a wall.

### Full graphics by default

`StartLocal.bat` — the desktop shortcut, the Start Menu entry, and
`One Nation Under ME.bat` — appended `?safe=1` to every launch, which
forces Simple graphics. The flagship launcher was permanently running
the game in its reduced mode, and `SafeStart.bat` was an alias for the
same thing. `StartLocal.bat` now launches at full detail;
`SafeStart.bat` passes `safe` and keeps the simple path for a machine
that needs it.

### X opens the schedule on a keyboard

`openDaySchedule()` was reachable from pad X only, while the phone's own
hint ("X opens this schedule any time") and `QUICKSTART.md` both told
keyboard players it was theirs. It is now bound on the keyboard too, and
yields to the key if the player has rebound it to something else.

### Smaller things

- `Install-LocalApp.ps1` builds the icon from a byte copy of `logo.png`
  rather than `Image.FromFile`, which holds the file open for the life
  of the object. It also installs Start Menu entries for simple graphics
  and for closing the server.
- `.bat` files are pinned to CRLF in `.gitattributes`. CMD reads a batch
  file line by line as it runs it, and LF-only endings are not reliably
  parsed around labels and multi-line blocks.
- New `TROUBLESHOOTING.md` — every "in use" case above, what causes it,
  and the one command that clears it.

---

## Continue: the boot that had nothing warmed up

**Problem:** clicking **Continue** on the opening card left the page dead.
Not slow — dead. A one-second heartbeat running inside the page logged a
single beat when the button was clicked and then nothing at all for the
next 75 seconds, with the veil still up and the room still unnamed. New
career, in the same browser and the same session, was fine.

**What it was not:** the V8 debugger, interrupted four times during the
stall, stopped in the Vox typewriter (`voxTypePosts`'s `step`) every
time — which looks conclusive and is not. `Debugger.pause` stops at the
next *JavaScript* statement, and the typewriter's timer was the only
JavaScript running, so every sample landed there. A CPU profile over the
same 20 seconds put it at 11 ms, 0.1%. The thread was not executing
script at all: 96.5% of the time was `(program)` — native work, inside
the GL driver, with shader program linking in the sampled frames.

**What it was:** `begin()` built the room's entire population on a single
frame — `syncPeople()`, every person at once. Every mesh, every material
and every shader those materials are the first to need, in one block,
before anything can draw. A fresh career never feels this: the character
maker has already built and compiled most of what a person is made of by
the time anyone reaches a room. Continue starts cold, and pays for all of
it on one frame.

**Fix:** `begin()` now uses `syncPeopleStaged()` — three people a frame,
the staged path a room transition has always used — and finishes boot in
its completion callback. The recovery path in `cardActContinue()` uses it
too.

Measured, same instrument, same container, before and after:

| | Before | After |
|---|---|---|
| Heartbeats after Continue | 1, then silence | continuous, every ~500ms |
| Veil lifted | never (75s watched) | 1.3s |
| Worst single block | never ended | 693ms, once |

The remaining 693 ms is the room shell itself, which is one hitch rather
than a wall. The Vox typewriter defect the debugger pointed at is real
but separate and cheap — a post whose node is replaced mid-type never
gets marked `typed`, so every refresh retypes it from zero — and it is
left alone here rather than smuggled into a performance fix.
