# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

## Gameplay: daily aims, controller pause menu (11 Oct 2026) — `20261011c`

On `20261011b`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Daily aims:** every morning sets three aims drawn from the day itself: talk with three members; win a pledge on the live bill (someone you spoke with today, pledged your way); be on the floor for the roll call when there is one (or sit in on the floor); and one place (district, Caucus Room, Cloakroom, East Steps) or clearing the inbox. Shown on the morning card, the NOW line ("Today 1/3: ..."), the pause menu and the night card ("Aims: 2 of 3 met"). The compass and route follow the next aim when nothing is more urgent. Each aim met gives a small, specific gain (influence, standing or approval) and a feed line; all three give a little more. Aims save with the career and never point at the Consular path.
- **Controller:** radial deadzone on both sticks (diagonals stay diagonal, drift dies) and a gentle look curve for fine aim. Start opens and closes the pause menu; in it the D-pad or stick moves between controls, A presses, left/right nudges sliders, LB/RB change tabs, B resumes.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011c`. Five HTML copies byte-identical.

## Feel: pause menu, objective route, 10pm fix (11 Oct 2026) — `20261011b`

On `20261011a`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Pause menu that works:** Esc (or Settings) pauses the game and opens one menu with four tabs. Game: pace 1x/2x/4x, Save now, Handbook, Title menu, today's line. Graphics: Best / Balanced / Simple, film grain, seated poses. Voices: on/off, volume, rate, carry. Controls: look speed (mouse, A/D, right stick), invert Y, controller status, Rebind keys. Walking stops while paused; pace is restored on close. Esc no longer closes and reopens in the same press.
- **Route to the objective:** the NOW line adds "> Room, then Goal" (shortest hop through the doors); the compass shows a gold goal marker on the next door, pinned to the edge when it is behind you.
- **First minutes:** key hints stay up for the first 45s of a new career (or until the first door).
- **10pm Continue soft-lock fixed:** a save made at 10pm resumed with the night pending and no card; it now resumes a minute before and the night card comes.
- Saves keep invert Y and voice volume. HUD clears the top bar when bare. Settings tabs sized for touch.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011b`. Five HTML copies byte-identical.

## Playable fixes: corridor freeze, elections, warmAhead (11 Oct 2026) — `20261011a`

On tip `20261005a`. Walk **0.68** / sprint **1.15** kept. Full people meshes kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

Found with a headless boot-to-play harness (new career, every door walked, talk in every room, vote, Sleep, save/reload/Continue, election).

- **A. The corridor freeze:** `alignment()` -> `stakeSway` -> `stakeIn` -> `alignment()` recursed to the stack limit, then fanned out through `tiePull` across every tied member. Once ties formed the main thread hung for minutes (reproduced: page unresponsive >4 min after entering the corridor). `stakeIn` now reads raw ideology; `alignment` has a re-entrancy guard and a short per-frame memo.
- **B. Elections never ran:** the card watchdog hid any card without a `.card__actions` button, so the ballot ("What are you standing for?") vanished on the next frame and the term rolled on. Any live control now counts; a control-less card gets 2.5s grace (Sleeping... / Loading...).
- **C. warmAhead never ran:** `roomGroup` was `const`, so the first kit swap threw and `_warmBusy` stuck forever. Now `let`; the kit isolates lamps/tickers and never touches the live sky; shells stash as shells (no child-count "furnished" guess). Rooms after the first get their practical lamps again (`ROOMLIGHTS`/`TICKERS` relink on stash/take).
- **D. New career is safe:** with a career on disk, New career asks first (Back is the default); the old save is only wiped when the new oath is taken.
- **E. Standalone file://** skips the `/tex/*.jpg` probe (CORS noise); canvas maps stand.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011a`. Five HTML copies byte-identical.

## Weekly MAX OPTIMIZE + design/max-fit (5 Oct 2026) — `20261005a`

On tip `20261001b` (hard shadows on the 01a freeze). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only. God is Most High; Christ is King; First Consul is a man under God.

- **A. Deep crowd freeze while walking:** culled (behind / `d2>25`) and far (`d2>12`) people traverse-freeze `matrixAutoUpdate` (suits/faces/hair no longer pay per-frame matrices). Near keep soft follow + pose-only. No dummy people.
- **B. Best `BasicShadowMap`:** one sample, no PCF filter taps (01b already shrank maps). Shadow refresh still skipped while feet move.
- **C. Walk light throttle:** `updateLighting` / motes / fan every 8th draw while `spd>0.12`.
- **D. Max-fit shell:** `.shell` `max-width:min(2560px,100%)`; wide breakpoint denser grid/plates so GamingDesktop fills; kit cap KEEP **MODEST 6 / else 8**.
- **E. Design polish (canon):** tighter Caesar fringe (not a lump); wider side-part scalp gap; grounded furniture contact pad 0.68.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261005a`. Five HTML copies byte-identical.

## Hard shadows on the 01a freeze (1 Oct 2026) — `20261001b`

On tip `20261001a` (far-crowd freeze / kit reuse / 6ms bail). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only.

- Keeps the `20261001a` far-crowd freeze, kit reuse, and 6ms frame budget bail.
- **Best hard shadows:** drops soft 1024 shadow maps for a harder smaller shadow (fewer map pixels).
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261001b`. Five HTML copies byte-identical.

## MAX OPTIMIZE frame/kit/crowd (1 Oct 2026) — `20261001a`

On tip `20260929a` (second mind beat; room build waits if frame already heavy). Walk **0.68** / sprint **1.15** kept. Full people meshes kept. `PEOPLE_CAST_SHADOW` false. `history.replaceState` only.

- **A. Far crowd freeze while walking:** beyond near (`d2 > 12`) but inside existing cull (`d2 ≤ 25`, facing): snap pose, `matrixAutoUpdate = false`. Near keep soft follow + pose-only. Never dummy people.
- **B. Kit reuse:** warmAhead / takeRoomKit heal shell+furnished flags from children; skip rebuild when dest kit already furnished; re-`freezeStaticRoom` after taking a furnished kit (Sleep stays a clock).
- **C. Frame budget hardening:** `framePaidMs` / `frameOverBudget(6)` — warmAhead shell/furnish, renderRead sync/warm, and drainHouseOne bail early if the beat already paid (~3.5ms premise / 6ms frame). One unit of work max.
- Texture walk anisotropy cap ≤2 kept from `20260928a`.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20261001a`. Five HTML copies byte-identical.

## Second mind beat (29 Sep 2026) — `20260929a`

Keeps the 28a door drip and walk texture cap. Lives get a second cheap tick when premise still has budget. A room build that costs more than 6ms waits (`_warmSkip`).

## Stream-drip warmAhead (28 Sep 2026) — `20260928a`

First corridor door still the heaviest (~0.8–1.4s). Kits make the second pass cheap. Full people meshes kept. Walk **0.68** / sprint **1.15** kept. `PEOPLE_CAST_SHADOW` false.

- **A. Stream-drip `warmAhead`:** while walking (`playerMoving`), warm **shell-only** for the nearest door dest into a kit; while standing, may furnish one kit (`buildRoomInner` + tidy + freezeStaticRoom). One phase per call. Prefer corridor when choosing / culling kits. Deferred `warmAhead` after `begin()` shell (non-blocking).
- **B. Texture walk cap:** newly created canvas textures (`texCanvas`) cap anisotropy at **2** while feet move; Best/fullDetail still get mips. No full-texture traversal on walk start.
- Stamp: meta + STAMP + `ONUM_BUILD` → `20260928a`. Four HTML copies byte-identical.

## Walk-freeze rigor (22 Sep 2026) — `20260921e`

Freeze after seconds–minutes of walking (main-thread hitch). Walk **0.68** / sprint **1.15** kept. Full people meshes kept.

- **A. Save never blocks a walk frame:** `queueSave` / 45s autosave abort if `houseQuiet()` or `playerMoving()`; `save()` strips meshes in batches of ~5 via `requestIdleCallback`/`setTimeout(0)`; `JSON.stringify` off the walk tick; `beforeunload` may sync-save once; visibility-hidden queues only if !moving.
- **B. No deferred dump on stop:** after walk, `drainHouseOne` runs one AI subsystem per frame for ~1s (`sentWorld`/`clockRoom`/`crowdWatch`/`voxTick`/`autonomyTick`/`consularBody`/`realmTick`/`agiStep`). `syncPeopleStaged` coalesces waiters; full `syncPeople` only after staged retry cap.
- **C. Render while moving:** pose-only crowd, no people cast shadows, skip `shadowTick`, dip PR, force `shadowMap.needsUpdate=false`, skip plates/track/tele, feed rarer; `kickFrame` 1.5s watchdog will not kick if `saveBusy` / `_buildingRoom` / door fade.
- **D. Memory:** remesh disposes old geometry/materials; corridor people cap MODEST 6 / else 8; MODEST Best stays PCF 512; `PEOPLE_CAST_SHADOW` false.

## Move-frame opt (22 Sep 2026) — `20260921d`

While walking (`spd > 0.12`): skip shadowTick, plates/track/tele, matChk; animateCrowd pose-only + hide far/behind (`d2>25` or back); brief PR dip MODEST≤0.95 / else≤1.1 then restore. Best still no people-cast; MODEST Best PCF 512 + PR 1.15. Walk 0.68 / sprint 1.15 unchanged.

---

## Play this build

| | |
|---|---|
| **Grok.me (canonical)** | https://onenationunderme.grok.me/ |
| **GitHub Pages** | https://dominicvii.github.io/the-long-session/ |
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **jsDelivr** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |

**Build stamp: `20261005a`.** Saves live in the browser (`localStorage`). Continue never deletes a career. Sleep is a clock, not a 3D rebuild.

This is the actual working log of the published HTML — not a Claude artifact.

Full older entries remain in git history and on the box at `/workspace/the-long-session/CHANGELOG.md`.
