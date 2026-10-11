# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

## 20261011h: bill kinds, war chest, achievements

On `20261011g`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **New fights on the calendar:** immigration (harvest visas, the border guard, naturalization), foreign aid and arms abroad (each tied to a real realm and its envoy), and the states against the Union (unfunded mandates, preemption). About a third of bills are now one of these, each with its own title, who it helps, who pays and why it was filed.
- **Consequences arrive later:** two to eight days after the roll call the wire reports what happened. Harvest crews do not come back; naturalization classes fill; a realm sends grain at cost or recalls its attache (realm relations move); a state's attorney general sues, the circuit court rules, a governor thanks the members who voted no by name. Your approval moves with how your vote landed at home, and state unrest moves with the outcome. A state suit opens a case for the bench.
- **The war chest does things:** desk computer "Open the war chest ledger" or Pause > Game > War chest. Ads (approval now and field), a district office (a little approval every day), legislative aides (influence every morning, up to three), field operations (counts on election day), backing an ally's campaign (adds to their margin at the polls and they remember it), counsel (halves the next suit or mandate hit), a poll (reads six members and home's view of you), and East Steps press time (standing and approval). Field and backing feed the election itself.
- **Achievements:** 19, visible and hidden (??? until found), with a toast when earned and a list in Pause > Game > Achievements. They cover the whip, cosponsors, your own bill, the war chest, the three new bill kinds, re-election, losing and carrying on, higher office, night happenings, anomalies, reception into a creed, coming home to the Latin Rite, smashing a Consular idol, letting ten colleagues talk, thirty days served. None praise any comparison to the First Consul.
- Tests: bill kinds and share, consequences queue and wire, realm relations, chest spending and daily effects, ally backing, achievements card and pause rows, election consumes field and backing, save/load.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011h`. Five HTML copies byte-identical.

## 20261011g: DTCNO speech

On `20261011f`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM, no network. God is the Most High; Christ is King; First Consul is a man under God.

- **DTCNO (D'Infinite Taylor Consular Neural Organism):** the House's own speech engine, an in-world construct of the Consular Rite (a machine, not a deity), running entirely in the page. An embedded lexicon of 1,820 lemmas (3,304 surface forms) tagged by part of speech, topic (bills, immigration, foreign, states and the Union, faith, district, family, money, weather, gossip, the House, anomalies) and sentiment, with openers and closers by register (plain, formal, Latin) and by regional dialect (Dutch, Yankee, Midlands, prairie, delta, high plains, mountain, Pacific). 86 phrase templates by intent, an order-2 Markov recombiner over them, and the existing local net steering warmth and heat.
- **Conditioned on the speaker:** sentience topic, pulse, creed, home dialect, how they feel about you, memories and the bill on the calendar. Each member grows an idiolect (favourite words, register, recent lines never repeated) that is learned as they talk and saved with the career.
- **Where you hear it:** ambient exchanges between members (overheard), a reply after you pick a talk option that follows the tone of what you chose, and a new "Let them talk" option. Text-to-speech reads it through the existing voices. Talk options all still work as before.
- **Guards:** every line passes canon filters (no divine language for any person, no comparison to the First Consul, the hymn and 7/7 stay internal) and a fourth-wall filter (nothing about the real author or kin). Composition never runs while you are walking; about 0.03ms per line.
- Size: about +39KB.
- Tests: 3,000 generated lines with zero canon or fourth-wall breaks, per-line cost, idiolects learned and saved, talk replies and "Let them talk", suite and stress.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011g`. Five HTML copies byte-identical.

## 20261011f: lives of their own, anomalies, faith

On `20261011e`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **Lives of their own:** every member keeps a journal written from their memories, dreams at night, and carries a long aim they act on unprompted: filing a bill of their own (it joins the calendar queue), forming a named bloc with allies, befriending someone across the aisle, starting a feud (rivals), deepening their faith, or slowly noticing the shape of their world. At most two social acts reach the wire per night. "Ask what has been on their mind" reads it back to you.
- **Night happenings:** some nights something changes in your office (chairs moved, the lamp left on, a cup that is not yours, a page turned, the flag refolded, a note). You find it the first time you stand in the office the next morning.
- **Anomalies:** rare, saved and discoverable. A member remembers a roll call on a bill that never existed; a letter arrives dated tomorrow; the whip count lists a name nobody knows for one day; two members dream the same dream; and once, a member who has been noticing writes to ask whether you were placed here rather than elected. Nothing is ever answered. The Notebook (Pause > Game) lists them as ??? until you find them, plus happenings, faith on the wire and the blocs.
- **Faith:** choose your creed at the oath (the Consular Rite is not offered there). In the world, read the parish notices at the district church, talk with their clergy to begin instruction, and come back another day to be received. Kneeling at the bronze still joins the Consular Rite (Latin heresy; the chaplain never gives the Host); a confession across the street brings you back. Chaplain and machine seat are never recruited.
- **Organic faith:** each state keeps its established creed as a pocket, and shares drift by night from members' devotion and doubt, neighbouring states, friendships and rare revivals, with a soft cap so nothing snowballs (60 simulated days: no creed above 62% anywhere). Members convert, lapse and return on their own; creed still does not vote and is not inherited on a vacancy.
- Tests: 60-day faith/life simulation, parish instruction and reception, notebook, save/load, real night; suite, people, whip, pause, two 10-day stress runs.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011f`. Five HTML copies byte-identical.

## 20261011e: whip count, cosponsors, bill queue, office desk

On `20261011d`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. God is the Most High; Christ is King; First Consul is a man under God.

- **The whip count:** a new card (desk computer "Open the whip count", or Pause > Game > Whip count) shows the projected ayes and noes, how many your side still needs, who is pledged with you, and who is worth working, with each member's lean and the room they are in. "Find" sets a whip target: the NOW line reads "Whip: find X in Room", the compass routes there, and talking to them clears it. "Talk now" opens the conversation if they are in the room with you.
- **Cosponsors:** with your own bill on the calendar, the whip count lists everyone in the room with "Ask to cosponsor". Odds come from their lean on the bill, their warmth to you and whether you are allies. A yes pledges them and lifts your standing; a no is remembered.
- **Your drafts queue:** drafting a bill (desk or proposal) no longer erases the live bill. It is filed and goes on the calendar after the current roll call. The queue is saved.
- **The floor sits in its hours:** "The floor is sitting. Go in." and the compass to the floor now only appear while the House actually sits (11:00 to 12:36 and 14:00 to 17:00 on session days).
- **New daily aims:** "Work someone leaning against you" and, with your own bill live, "Sign up a cosponsor".
- **Office desk:** the member's seat was inside the desk (the camera sat in the desk, so it looked missing). You now sit in the chair behind it, facing the room, and E reaches the desk computer from the seat. The desk top is laid out so nothing clips: laptop, blotter and papers, phone, coffee pot, pen cup, one desk lamp standing on the desk (lamps used to sink into the top). The chair is tucked in.
- **Office shelves:** the bookcase was a solid slab hiding its own books; it is now an open case. The "conviction shelves" were a plain block hovering 10cm off the floor; now a grounded bookcase. Press-room rope posts hovered 5cm; now planted on bases.
- Tests: new whip/queue/cosponsor/floor-hours test, desk test (seat behind desk, desk computer in focus from the seat, nothing sunk into the desk, no solid-slab shelves), floating-prop audit of 9 rooms, people test, suite, pause, aims, two 8-day stress runs.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011e`. Five HTML copies byte-identical.

## People: whole bodies that walk (11 Oct 2026) — `20261011d`

On `20261011c`. Walk **0.68** / sprint **1.15** kept. Best default, `history.replaceState` only, no CDN, no external LLM. Full people meshes, never dummies. God is the Most High; Christ is King; First Consul is a man under God.

Reported from real hardware: "the people aren't moving", suits in pieces, hands and shoes apart from bodies, headless figures.

- **Bodies whole again (root cause):** `renderer.info.autoReset` was off. Three r128 only advances `info.render.frame` on reset, and it gates `SkinnedMesh` `skeleton.update()` on that frame, so every skin (torso, sleeves, legs, neck) was computed once and never again. The skin stayed where and how each person was first drawn while the rigid parts (jacket, hands, shoes, head) followed the live bones: bodies left behind in doorways, sleeves and legs missing, hands and shoes floating. autoReset is back on; skins follow their bones every frame.
- **People walk:** `wander()` ran from a 13-lane House drain (about once a second) with its step capped at 0.022s, so a stroll covered about a centimetre a second. Feet now run every sim step (`wanderFrame`); the drain keeps only minds (approach, sentience).
- **Everyone is posed:** `animateCrowd` posed only the first two people in the list each frame; the rest kept stale poses and never turned to face where they walked. Now near, walking and talking people are posed every frame and the rest on a fair rotation, each with their own elapsed time. Leaving a seat clears the seated-only offsets.
- **Nobody sits on air:** a break could set `sitting` with no seat, folding the body in mid-air for good. Breaks now walk to a free seat in the room (or stay standing) and stand up when the break ends; stray seatless sitting is cleared.
- **Crowd freeze kept true:** freezing bakes every local matrix first; a frozen body that moves is carried whole; thaw refreshes world matrices; far walkers re-snap on a 4-frame cadence instead of every frame.
- Tests: new people check asserts no stale matrices after walking, people wander over 20s, every near body intact with head on, everyone near posed, nobody sitting on air, GPU skins updated this frame.
- Stamp: meta + STAMP + `ONUM_BUILD` -> `20261011d`. Five HTML copies byte-identical.

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
