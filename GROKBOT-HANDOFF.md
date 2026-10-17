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

**Build stamp (now): `20261017l`**

- `<meta name="onum-build" content="20261017l">`
- IIFE `STAMP = "20261017l"` (uses `history.replaceState` to set `?v=` — **never `location.replace`**, that froze boot)
- `src/lib/onum-build.ts` → `export const ONUM_BUILD = "20261017l"`
- Wrapper iframe: `/session.html?v=${ONUM_BUILD}` in `src/routes/index.tsx`
- **`20261005a`:** weekly MAX OPTIMIZE + design/max-fit. Keeps `20261001a` far-crowd freeze / kit reuse / 6ms bail and `20261001b` hard maps. Best uses `BasicShadowMap` (one sample). Deep crowd freeze (culled+far traverse `matrixAutoUpdate`). Shell fills big desks (`max-width:min(2560px,100%)`). Kit cap KEEP 6/8. Caesar/parting polish. Walk **0.68** / sprint **1.15**. Full meshes near.
- **`20261011a`:** playable fixes. Corridor freeze (alignment/stakeIn infinite recursion) fixed; elections run again (card watchdog no longer kills the ballot); warmAhead actually runs (`let roomGroup`, kit lamp/ticker relink, no sky touch, explicit furnished flag); New career confirms before replacing a career and wipes only at the oath. Walk 0.68 / sprint 1.15 kept.
- **`20261011b`:** feel. Real pause menu (Esc; Game/Graphics/Voices/Controls tabs; pace, save, quality, voices, look speed, invert Y, rebind); objective route on the NOW line and a goal marker on the compass; key hints for the first 45s; 10pm Continue soft-lock fixed. Walk 0.68 / sprint 1.15 kept.
- **`20261011c`:** gameplay loop. Three daily aims (talk, pledge or roll call, a place or the inbox) on the morning card, NOW line, pause menu and night card, with small rewards; the route and compass follow the next aim. Controller: radial deadzone, look curve, Start opens the pause menu and the pad drives it. Walk 0.68 / sprint 1.15 kept.
- **`20261011d`:** people. GPU skins follow their bones again (`renderer.info.autoReset` back on; skeleton.update was gated on a frame counter that never advanced, which left bodies behind and suits in pieces); people walk (feet every sim step), everyone in view is posed, nobody sits on air, crowd freeze keeps matrices true. Walk 0.68 / sprint 1.15 kept.
- **`20261011e`**: whip count card (desk computer + pause), whip targets on the NOW line and compass, cosponsor asks, drafts queue behind the live bill, floor sits only in its hours, whip/cosponsor aims; office desk fixed (seat behind the desk, E reaches the computer, clean desk top, lamps stand on the desk), open bookcases, floating props grounded.
- **`20261011f`**: lives and faith. Members keep journals, dream, and act on long aims (own bills, blocs, friendships, feuds, faith, noticing); night happenings in your office; five rare saved anomalies in a Notebook; creed choice at the oath and in the world (parish notices, instruction, reception; kneeling at the bronze joins the Consular Rite, confession returns); organic faith drift per state with pockets kept and no snowball.
- **`20261011g`**: DTCNO, the House speech engine (an in-world Consular Rite machine, not a deity): 1,820-lemma tagged lexicon, 86 templates, order-2 Markov, local net steering; idiolects learned and saved; ambient talk, replies to your choices, "Let them talk"; canon and fourth-wall guards; never composes while walking.
- **`20261011h`**: new bill kinds (immigration, foreign aid and arms, states versus the Union) with consequences on the wire days later (approval, state unrest, realm relations, court cases); a war chest ledger that buys ads, a district office, aides, field work, allies' races, counsel, polls and press time, feeding the election; 19 achievements, hidden ones shown as ??? until earned.
- **`20261011i`**: career ladder. Each chair has its own powers (leadership, chair, Senate confirmations/treaties/filibuster, governor veto/appointments/defiance/trade, executive sign/veto/cabinet/aid, bench rulings with recusal and no campaigning, envoy and staff when out); term limits held in law and changed only by amendment; members climb to the Senate and governorships; losing goes to the East Steps and play continues. The First Consul seat stays sealed.
- **`20261011j`**: pictures seated in every kit (flush to the wall, clear of door headers, rails and sconces, no overlaps; wall-less signs on brass posts); walk-capped textures lifted to full anisotropy while standing still. Speed caps, warmAhead, 6ms bail and walk light throttle untouched.
- **`20261011k`**: the higher offices get their own rooms (Senate Chamber, the Court, the Executive Wing, the State House), furnished and grounded, reached by real doors and the map, with role-specific daily loops at the desk and staff who work there; steps facade plaque flush; realm cables gated on the game clock (no inbox flood); speech variety up to about 75% unique. House unchanged; speed caps, warmAhead, 6ms bail and walk light throttle untouched.
- **`20261011l`**: seasons and daily weather you can see outside (rain, snow lying on the walks, fog, storms; trees and hills turn with the season) and feel (energy, turnout, household mood); seven households at home with needs and memories, constituents who come to your office and remember you, casework letters; the morning Ledger built from yesterday's real events; rivals with multi-week arcs ending in truce, win or loss, which count at the next election. Speed caps, warmAhead, 6ms bail and walk light throttle untouched.
- **`20261011m`**: playability sweep on the new content: chamber staff and constituents stand at fixed open posts (never in furniture) and keep them through working hours; a person you face in talk range beats a prop off to the side; B folds the Ledger and closes the map; NOW line and use prompt say A when a controller is in hand; map in walking order; one-time NOW-line hints for new chambers, constituents, the Ledger, rivals and weather; a held office adds a chamber aim; rain streaks readable. KEEP unchanged, House as is, walk 0.68 / sprint 1.15, perf items kept.
- **`20261012a`**: people up close (moving eyes, mood brows, lip shapes from the spoken line, fingers, swinging ties and hems, nods, turn banking, sit/stand motion, strand hair, skin), procedural surfaces and selective reflections, wet streets, parked cars, sandstone East Steps, heavier rain, the transcript (L / Log / R3, 500 lines, saved), non-repeating talk, step-by-step sittings with stakes, and a capital that runs itself. See CHANGELOG.
20261012j: clergy notes read supporting precepts as support (kept word + truth etc.); fresh paraphrase reading 63.3% first pass -> 30/30 after general fixes; faces get colour zones (cheeks, nose, under-eye, forehead, men's beard shadow); pm test expects 19 rooms
20261012k: no blocking "wants a word" prompt: small corner notice top-right (pointer-events none, never centre), inbox entry 'Wants a word', requests lapse after ~4 game-min; approaching members stop about 2.3 m away at 45-50 degrees off your line of sight; missed diary events no longer open a card (consequences as before, report in the inbox plus corner nudge)
20261012l: desk computer (sit at My desk, E or click 'Use the computer'; tabs Inbox, News & Ledger, Bills, Schedule, Constituents, Polls, War chest, Staff, On the desk; Esc closes; world keeps running; nothing on screen when closed; desk phone/files/coffee/papers reachable from it); government forms (Republic, Consular Republic, Theocratic Regime, Junta, Mob rule, Oligarchy, Machine) with official names and rival/press/people nicknames, organic drift, government card (Pause > The government), Ledger 'The state' line, occasional NPC lines; Consular Republic flies the NO7 standard as national flag beside the home-state banner (two flags per room); the player can take up or leave the Rite at the chapel or in the corridor, with the same risks as anyone
20261012o: white shoulder balls fixed: the shoulder caps were drawn in the shirt colour for waistcoat wearers while the arms wear the waistcoat material; caps now use the arm's own material and sit smaller and lower into the shoulder. Test suite door walk waits 30 s (slow headless frames, not a blocker)
20261012i: the Consular Rite as a faith under God (creed: God the Most High, Christ the King, Taylor a man under God); player precepts editor (write/edit/reorder/repeal), offline precept comprehension (SEM), clergy, amendments, schisms, Hands-on/Watch modes; belief organic and hidden (no meters, no forced caucus); middle-mouse grab-and-move; Prometheus seeds (PROMETHEUS.md)
20261012h: counsel keeps the diary: per-office scheduler builds accept/decline meetings, events and travel from what is happening (laws, unrest, desk bills, suits, weather, realms, rivals); adds items during the day; Senators vote on House-passed acts, the Executive signs or vetoes
20261012g: one chair at a time: winning higher office leaves the House (no House vote/post/office); most senior elected title everywhere; your office room moves; per-role daily docket (State/Senate/Bench/Executive tab); members may organically refuse to give up a seat
20261012f: talk shows their own words only (no stock mood phrase, no stage directions in the line); people reach for what they cannot name; read panel is your read
20261012e: characters. Black jacket wedges fixed (inside-out limb winding), bald side-hair ovals clamped, sculpted skull with jaw, cheekbones and brow ridge, face proportions; d program-count note corrected (m 64).
20261012d: one lighting shape indoors and one outdoors (no per-room shader recompiles), warm-up under both, budgeted compiles, cube reflections and CPU texture canvases end the 1.6 s boot freeze
20261012c: instanced wind grass, body seams, darker East Steps, varied notebook lines, idle shader prewarm
- **`20261012b`**: iris pattern, lids, lashes, nostrils and lip shape; fabric creases and seams; hair cards; trees in the wind; curbs, gutters, cracks, cornices, sills and pilasters; warmer corridor and Steps; denser rain; smoother talk; surfaces built at boot. See CHANGELOG.

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
4. `?safe=1` is the only Simple-force. Default is **Best / fullDetail** (`20260921f`). Settings can still pick Simple.
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

`MODEST` (Dell / Edge / grok.me iframe / ≤8GB) still **throttles the loop**. As of `20260921f` it must **not** force Simple graphics. Visuals = Best. `?safe=1` is the hatch.

`warmAhead` (`20260928a` + `20261001a` + `20261001b` + `20261005a`): while walking (`playerMoving`), build **shell-only** kits for the nearest door; while standing, may furnish one kit step (`buildRoomInner` + tidy + freeze). One phase per call. Prefer corridor kits when culling / choosing. Reuse furnished kits — do not rebuild. Kit pool cap **MODEST 6 / else 8**. `frameOverBudget(6)` bails shell/furnish/sync if the frame already paid. Far + culled crowd deep-freezes pose while walking (near full meshes; child `matrixAutoUpdate` off). New canvas textures cap anisotropy at 2 while feet move (Best still gets mips). **`20261001b`:** hard/smaller maps. **`20261005a`:** Best `BasicShadowMap`; light/motes throttle while walking; shell max-fit on wide desks.

Verify: `python` extract the `use strict` + `function begin` script → `node --check`. Then `node scripts/continuity.mjs` (Continue day-10, walk rooms, `G.running`) if present.

---

## What to code next (only if he asks, or you can reproduce)

Fix only what he reports. Likely:

- Named freeze (Continue, Sleep, talk, lectern, next day, corridor) — yield; do not delete content.
- Walk freeze after seconds–minutes: **20260921e** (async save, drain lane, dispose remesh, kick guards). If it returns, name the room and how long he walked.
- First corridor door: `20260928a` stream-drips `warmAhead` (shell while walking, furnish while standing). If first pass is still heavy, name the from→to door. Do not dummy the people.
- Phone / House tab empty when seated — keep native HTML bound.
- Audio: TTS on gesture; default unmuted.
- Save: furthest career; never day-downgrade.
- If Best is too heavy on his Dell, Settings → Balanced. Do not silently force Simple again.

If nothing is broken: **do not refactor.**

Play path: Continue → office/corridor → bronze 7/12/18 → witness/kneel/rebuke → one horcrux → talk → district church of your creed → East Steps up the treads through the door.

---

## Tone in the House

Dry. Unsentimental. The remnant is heresy, not a secret good ending. The chaplain does not move. God is the Most High. Not a consul. Not you.


## State at 20261012s (Grokbot)

- Build: `P.py j_base.html work.html` + patches through `p_q1.py` (t/q.js). Neptune blocks are injected verbatim from main.
- Five copies identical **except** `public/session.html`, which loads `../neptune/`.
- Leave the stray `One Nation, Under, ME..html` (two dots) alone.
- Next: DMs with leaks (in Neptune's inbox), lore and shading on Neptune's Union map, state visits, Guard/Commonwealth sites and ads.
