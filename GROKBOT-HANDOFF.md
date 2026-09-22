# Handoff for Grokbot — One Nation, Under, ME.

Paste this **entire file** as the task prompt. Do not summarize it away. Do not start a new game. Do not replace `session.html` with a “simpler” build.

You are coding **One Nation, Under, ME.** (repo `DominicVII/the-long-session`, grok.me `onenationunderme.grok.me`). **Dominic VII / Dominic Zachary Taylor** is the author. **God is the Most High. Christ is King. You are not.** The First Consul is a man under God, not God.

---

## Canonical playable file

One HTML body. Keep these **byte-identical**:

| Copy | Where |
|---|---|
| `public/session.html` | Grok.me app (this sandbox) |
| `index.html` | GitHub Pages |
| `session.html` | repo root |
| `One Nation, Under, ME.html` | standalone name |

**Build stamp (now): `20260921e`**

- `<meta name="onum-build" content="20260921e">`
- IIFE `STAMP = "20260921e"` (uses `history.replaceState` to set `?v=` — **never `location.replace`**, that froze boot)
- `src/lib/onum-build.ts` → `export const ONUM_BUILD = "20260921e"`
- Wrapper iframe: `/session.html?v=${ONUM_BUILD}` in `src/routes/index.tsx`

If you change the HTML, bump the letter (`20260921e`, …) in **meta + STAMP + ONUM_BUILD together**, copy the body to all four filenames, commit, push `main`.

Git author: `DominicVII` `<318079878+DominicVII@users.noreply.github.com>`.

Play: https://onenationunderme.grok.me/ · https://dominicvii.github.io/the-long-session/

Standalone. Three.js r128 **inlined**. No CDN. **No Claude. No external LLM. `noExternal`.** TTS is browser speechSynthesis only.

---

## KEEP — do not strip, rewrite, or “optimize away”

### Boot / save / freeze

1. `begin()`: `G.running = true` first. If Continue was on floor / committee / caucus / press, drop in **corridor**. Shell on rAF. People + myth + Consular seed **later**, not on the same tick.
2. Sleep is a **clock**, not a 3D rebuild. Morning card first.
3. Failed Continue **never deletes** a career. Furthest day wins. Never roll day-10 back to day-5. Do not `JSON.stringify` the whole save on load.
4. `?safe=1` is the only Simple-force. Default is **Best / fullDetail** (`20260921e`). Settings can still pick Simple.
5. Do not `location.replace` for cache. `history.replaceState` only.

### Look (people)

6. **Full people meshes.** No cheap dummy in the corridor. Caesar cut (short even cap, straight fringe). Parting = two combs + scalp gap, **not a lump**.
7. **Suits distinct:** navy, oxblood, charcoal, open collar, three-piece, waistcoat.
8. **Glasses** sit on the face (same anchors as eyes/ears).
9. Shared body model; faces/hair/glasses unique.

### Look (rooms)

10. **Grounded furniture** (`groundedProp`, `groundGroup`, `restY`). Tables on the floor. No pale slabs / floating windows over paintings.
11. Window frames **in** the wall. Flags flush, not on poles through pictures.
12. **East Steps:** real treads, deck at `deckY`, walk up/down, door at top. `groundAt(z)` / `stepsGround`.
13. **District:** street, sidewalks, storefronts, `townPulse`, church **by player creed** (`propChurch` / `playerCreed()`).
14. No heating-main pipe through doors. No feeling-bar HUD (`tkBars` gone). Emotion is in speech (`feelColor`), not a meter.
15. Nameplates: NDC, facing filter, skip identity HUD dupes.

### Movement (do not make it a skate)

16. Walk **0.68 m/s**, sprint **1.15**. Per-frame displacement **≤ 0.028 m**. `moveDt` cap 0.022.
17. Sim **every vsync**; **draw** on 30/60 stride only. Do not skip `tick()` on skipped draws (that lagged WASD). Do not `kickFrame()` on keydown (that **double-ticked** and fast-forwarded).
18. While `spd > 0.12`: skip wander / sentWorld / remesh (`houseQuiet` if `cam.vx` live). Minds resume when you stand still.
19. Door: shell first, furnish next frame, **do not `clearRoom` a live shell**. Room kits cap 6 modest / 8 else.
20. `kickFrame` must not clear `_frameArmed` if a rAF is already queued.
21. Tab return: zero `cam.vx/vz`, clear keys, set `last = performance.now()` so AFK is not a teleport.
22. WASD: **W/S walk**, **A/D look** (default bind), **Q/C** strafe. No chat timer. **LT/RT** browse podium / interview. E / A takes the line. Auto-walk to lectern is dt-scaled; seated/lectern **can amend a bill**.

### Lives (do not flatten to barkers)

23. **Sentience:** `sentEnsure` / `sentTick` / `sentAct` / `sentBusy` / `sentWatch` / `sentCompose`. Thread, topic, attending, `busyUntil`, refusal.
24. **Pulse:** work / break / lunch / spent. `onBreak`, `feelHit`, `feelColor`. No on-screen feeling bar.
25. **youSent:** player has the same kernel. Neither knows they are the same kind of thing.
26. **AGI:** `agiEnsure` / `agiStep` / originate / `agiJudgeYou` (`open|with|using|empty|kin`) / test questions. Origination, multi-step plans.
27. **Realms:** `WORLD_POWERS` ghost chambers, offset hours, cables, **envoys** (`kind==="envoy"`, no vote, skip restaff/election wipe). `realmTick` / `makeEnvoy`. Not during `_bootGraceUntil`.
28. Neural net stays local (`forward` / `train`). No cloud.

### Canon (speakable)

29. God is the Most High. Christ is King. First Consul is a **man under God**.
30. Living compared to Dominic Zachary Taylor = **blasphemy**. Rank 1 sealed.
31. Taylor Day **7/7** is the civic holiday. Allowed.
32. **HYMN / 7-7 pattern of the code: internal only.** No NPC, wire, tooltip, encyclopedia, or README quotes the hymn.
33. **4th-wall safety:** the code must not reach Dominic Zachary Taylor or his kin if a wall breaks. In-game machine seat is not the author.

### Consular Rite

34. Latin heresy. Mass kept; First Consul where God belongs. Chaplain will not give the Host.
35. Gather at corridor bronze 7 / 12 / 18, all on Taylor Day.
36. `consularRecruit`: corridor, bronze, **new class**. Latin easiest; devout Latin often refuse; **chaplain + machine seat never**. Kneel recruits **the player** (heresy).
37. Eight **horcruxes / remainders:** flake, missal, stitch, fold, coin, print, wire, empty chair. Find / venerate / smash. `consularInvent` tales, cap 12.

### Election

38. House = **25** NPCs + you. Incumbent: `margin + 0.6*partySwing + personal + noise(-14..14)`. Creed does not vote.
39. Holes: `{fresh:true}` — **every creed can land**. 62% wave-winner (FED/COM), 38% the other. ~42% fallen house claims vacancy (**creed not inherited**). Then remnant tries up to 2 non-Consular freshmen (~48% each).
40. Player race is a **separate** machine. Lose → East Steps. Session does not end.

---

## DO NOT

- Do not replace HTML with a freeze-only or dummy-people build.
- Do not remove Consular, horcruxes, Caesar, suits, furniture, sentience, realms, pulse, freeze-fix, or walk caps to “go faster.”
- Do not make Taylor God. Do not print the hymn.
- Do not force-recruit chaplain or machine seat.
- Do not add a timer to chats.
- Do not rebuild the House on Sleep or pause-Continue.
- Do not call Claude / any cloud LLM.
- Do not `location.replace` the tab.
- Do not raise walk above ~0.7 / sprint ~1.15 without Dominic asking. Last complaint: “moves very far very fast.”
- Do not invert A/D. Look-left **adds** yaw (camera has a half-turn offset).
- Do not invent a second diverging `session.html`.
- Do not gold-plate. Fix what he reports.

---

## How the loop works (read before touching frames)

```
armFrame → rAF → frame(now)
  stride from panel Hz vs _wantHz (30 modest, 60 else)
  draw = (vsyncN % stride === 0)
  frameBody(now, draw)     // ALWAYS ticks movement
    tick(dt)               // walk, doors, spend
    if walking: return     // no wander / sentWorld
    if !draw: camera only, skip renderer.render
    else: crowd bones + render + plates
```

`MODEST` (Dell / Edge / grok.me iframe / ≤8GB) still **throttles the loop**. As of `20260921e` it must **not** force Simple graphics. Visuals = Best. `?safe=1` is the hatch.

Verify: `python` extract the `use strict` + `function begin` script → `node --check`. Then `node scripts/continuity.mjs` (Continue day-10, walk rooms, `G.running`).

---

## What to code next (only if he asks, or you can reproduce)

Fix only what he reports. Likely:

- Named freeze (Continue, Sleep, talk, lectern, next day, corridor) — yield; do not delete content.
- Walk freeze after seconds–minutes: **20260921e** (async save, drain lane, dispose remesh, kick guards). If it returns, name the room and how long he walked.
- First corridor still the heaviest door (~0.8–1.4s). Kits make the second pass cheap. Do not dummy the people.
- Phone / House tab empty when seated — keep native HTML bound.
- Audio: TTS on gesture; default unmuted.
- Save: furthest career; never day-downgrade.
- If Best is too heavy on his Dell, Settings → Balanced. Do not silently force Simple again.

If nothing is broken: **do not refactor.**

Play path: Continue → office/corridor → bronze 7/12/18 → witness/kneel/rebuke → one horcrux → talk → district church of your creed → East Steps up the treads through the door.

---

## Tone in the House

Dry. Unsentimental. The remnant is heresy, not a secret good ending. The chaplain does not move. God is the Most High. Not a consul. Not you.
