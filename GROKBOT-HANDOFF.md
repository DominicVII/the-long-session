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

**Build stamp (now): `20261118c`**

- `<meta name="onum-build" content="20261118c">`
- IIFE `STAMP = "20261118c"` (uses `history.replaceState` to set `?v=` — **never `location.replace`**, that froze boot)
- `src/lib/onum-build.ts` → `export const ONUM_BUILD = "20261118c"`
- Wrapper iframe: `/session.html?v=${ONUM_BUILD}` in `src/routes/index.tsx`

If you change the HTML, bump the letter (`20261118c`, …) in **meta + STAMP + ONUM_BUILD together**, commit, push `main`.

This sandbox tracks `public/session.html` as the playable body (root `index.html` / `session.html` / `One Nation, Under, ME.html` are not in this repo). Do not replace that file with a simpler build. Insert new game logic **inside** the main IIFE, before `})(); /* 20261110bx: main IIFE close, moved below the ba block */`.

### Latest — `20261118c`

The prompt was under the room's words. The job line, the feed and the name plates painted over it, so a tap missed and you had to click again. A live prompt now sits on top of those words. They dim, and they do not take the tap.

A desk telephone, the computer, and every shop on the street (the counter, the market, the hardware, the newsstand, the church, the named storefronts) keep the line while you stand there. The first line says what the place is. **Call from this desk** opens a page of people you have met. The call does not depend on the glass staying still.

Money, as measured: 100 stuivers = 1 guilder, 10 guilders = 1 rijder, 1,000 guilders = 1 mille. The Guilder Index opens at 100 and the shelf price moves with it. The purse is guilders. The campaign chest is milles, and it still cannot buy a loaf. The purse page lists every thing for sale and what it costs today. Added to the shelves: a loaf, a beer, stamps, a record, coal, lamp oil, a hand tool, shoes, medicine, a match ticket, a hymn book.

New buildings no longer drop on a random lot. They stand in pairs, west and east of Main Street, on the same spacing, past the square. A building already in the save is pulled onto that street the next time the district is built.

`20261118b` still keeps the Work button. That stays.

The desk prompt and the cabinet table were still dying. A person in front of the table stole the line, so it showed and vanished, and pressing use opened a conversation instead of the table. While you are in reach of a desk or the cabinet table, that prompt stays. A person at the table does not clear it. **Work**, **Cabinet**, or **District** on the clock bar opens the page even if the line flickers. Use at the table opens that page. Speak is a separate choice on the line.

No new kind of person was added. The creeds that already exist are the ones they keep. They remember, marry, write things down or fail to, shop, play, and take jobs as themselves.

Already on the record, and left as it was:

- Families, births, marriages, and a chronicle. Some people keep a thing. Some do not. It is on the record only if someone wrote it.
- Courtship is the person, not the office. You can ask. They can say no.
- Shops have owners. One price book. A shop may mark it up. People walk to the cheaper door.
- A stock book, eight named companies, paid from the chest. The guilder and the book move while you stand there, not only when the day turns.
- The district runs its own day: tills, a match, a song, a job.
- Vox is a tab on the phone, and an app in the phone menu. Your posts first, then replies, then the feed.
- A cabinet name is a person, a file, a hearing, a roll, and a chair. A refusal stays a refusal. A confirmation sits them at the table.
- Precedent is cited when a hearing, a marriage, or a share leans on something already done.
- The Union map is the nation inland, with the Pale north, the Free Marches west, the Reach east, the Horn south, and the Salt Isles in the southern sea. Shade is the filter already on the map. Click a state.

`20261118a` still adjourns a meeting when you hit the X. That stays.

The X on a meeting adjourned nothing. It only slid the panel aside, and a conference that had already reached its last stage stayed open, prompts and all. The X now adjourns the cabinet, the press conference, and every sitting that uses that same panel. The record closes. The floor desk, the live prompt, and the hold come down, so the duties of the office can be done. The arrow still only parks the panel. A meeting you closed does not start itself again until you leave the room or you call it on purpose.

`20261117d` still keeps the World book off the Engine. That stays.

The Engine could not be used. The daily facts and the World book were both named `onumWorldCard`. The book won. Every time the Engine asked what day it was, the book opened and covered the screen. The book is now `onumWorldBook`. It opens only from **World**, the map, or the phone. The Engine’s facts are a sentence again.

`20261117c` still has the extra purse. That stays.

Review of the street, against the three voices. Jupiter: the parish goods name God as the Most High, and a candle is for the altar, not the bronze. Mars: nothing is remeshed; the new prices are acts on shops that already stand. Neptune: the street book says so, and the shop lists are the surface.

The purse has more to spend. The diner, the newsstand, the market, the hardware, and the parish all grew. The union hall, the kiosk, your counter, the wharf, and the campaign block take coin now. Stock on your counter brings feet, not a gift of money. A share in a cargo and the hall for a night are seen. The rest can be quiet.

`20261117b` still keeps a remainder where the remnant left it. That stays.

Review of the street. One hole: a remainder the remnant moved lived only in memory, so a reload put it back in the room it started in, and two of them could be left in the same room so one could not be found. The place is now kept on the save, put back when you continue, and a live remainder is not moved into a room that already has one.

The rest of `20261117a` held. The district is still longer. The till, the houses, the Host, the file, and the wire still work. The Capitol is still not remeshed. Doors still walk you through.

The district is longer. Walk in from the East Steps and the seven blocks are on the ground: the parish, the union hall, your counter, the press kiosk, the grain wharf, the campaign block, market row. Foot traffic and the price move with the guilder, the duties, and the unrest. The till on your counter is yours. The Capitol is not remeshed to make the street. Doors still walk you through. Adjacent rooms are not streamed in on a frame.

**Street**, on the clock bar and the phone, is the book of that street. The Union map lists the seven blocks and the rivals under the states.

The eight remainders still sit in rooms. Once a day the remnant passes one that has not been smashed into another room, and the wire says where. At seven, at noon, and at six, a Latin member may refuse the Host to the Consulars at the bronze. The Latin members vote as if they saw it. God is the Most High. The relic is not.

A fallen house, about two days in five when a seat is empty, sends a spouse or a grown child into the corridor as a person who was already in the world. They are not a new kind of person.

Outside the caucus door and outside Committee 2141 you can stand and listen. The desk drawer holds the ticker, the books, a file, and, if it is in the office, the remainder. A file is a real person: they walk to the office, the wire gets them, then you ask the floor. The Senate is not skipped.

A name the district already knows can be put on the steps, or set to run. What is said in public, overheard, or done to a remainder is kept, and it is on Vox.

Taylor Day hangs banners. A lost seat puts a crowd on the steps. Neither rebuilds the stone.

`20261116c` still draws every room and every door. That stays.

Git author: `DominicVII` `<318079878+DominicVII@users.noreply.github.com>`.

Play: https://onenationunderme.grok.me/ · https://dominicvii.github.io/the-long-session/

Standalone. Three.js r128 **inlined**. No CDN. **No Claude. No external LLM. `noExternal`.** TTS is browser speechSynthesis only.

---

## KEEP — do not strip, rewrite, or “optimize away”

### Boot / save / freeze

1. `begin()`: `G.running = true` first. If Continue was on floor / committee / caucus / press, drop in **corridor**. Shell on rAF. People + myth + Consular seed **later**, not on the same tick.
2. Sleep is a **clock**, not a 3D rebuild. Morning card first.
3. Failed Continue **never deletes** a career. Furthest day wins. Never roll day-10 back to day-5. Do not `JSON.stringify` the whole save on load.
4. `?safe=1` is the only Simple-force. Default is **Best / fullDetail** (`20260921a`). Settings can still pick Simple.
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

`MODEST` (Dell / Edge / grok.me iframe / ≤8GB) still **throttles the loop**. As of `20260921a` it must **not** force Simple graphics. Visuals = Best. `?safe=1` is the hatch.

Verify: `python` extract the `use strict` + `function begin` script → `node --check`. Then `node scripts/continuity.mjs` (Continue day-10, walk rooms, `G.running`).

---

## What to code next (only if he asks, or you can reproduce)

Fix only what he reports. Likely:

- Named freeze (Continue, Sleep, talk, lectern, next day, corridor) — yield; do not delete content.
- First corridor still the heaviest door (~0.8–1.4s). Kits make the second pass cheap. Do not dummy the people.
- Phone / House tab empty when seated — keep native HTML bound.
- Audio: TTS on gesture; default unmuted.
- Save: furthest career; never day-downgrade.
- If Best is too heavy on his Dell, Settings → Balanced. Do not silently force Simple again.

**Current request (20261119):** See WAR-CHEST-STOCK-NOTES.md for the implementation brief on campaign chest capacity, purse-to-chest transfer, stock buy/sell return path, organic Ledger, conversation scripts, and election page substance. Apply that to the existing stock book and chest. Bump the stamp when the HTML changes.

If nothing is broken: **do not refactor.**

Play path: Continue → office/corridor → bronze 7/12/18 → witness/kneel/rebuke → one horcrux → talk → district church of your creed → East Steps up the treads through the door.

---

## Tone in the House

Dry. Unsentimental. The remnant is heresy, not a secret good ending. The chaplain does not move. God is the Most High. Not a consul. Not you.
