# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

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

**Build stamp: `20260921e`.** Saves live in the browser (`localStorage`). Continue never deletes a career. Sleep is a clock, not a 3D rebuild.

This is the actual working log of the published HTML — not a Claude artifact.

Full older entries remain in git history and on the box at `/workspace/the-long-session/CHANGELOG.md`.
