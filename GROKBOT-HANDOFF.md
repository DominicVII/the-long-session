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

**Build stamp (now): `20261122b`**

- `<meta name="onum-build" content="20261122b">`
- IIFE `STAMP = "20261122b"` (uses `history.replaceState` to set `?v=` — **never `location.replace`**, that froze boot)
- `src/lib/onum-build.ts` → `export const ONUM_BUILD = "20261122b"`
- Wrapper iframe: `/session.html?v=${ONUM_BUILD}` in `src/routes/index.tsx`

If you change the HTML, bump the letter (`20261122b`, …) in **meta + STAMP + ONUM_BUILD together**, commit, push `main`.

This sandbox tracks `public/session.html` as the playable body (root `index.html` / `session.html` / `One Nation, Under, ME.html` are not in this repo). Do not replace that file with a simpler build. Insert new game logic **inside** the main IIFE, before `})(); /* 20261110bx: main IIFE close, moved below the ba block */`.

### Latest — `20261122b`

The war chest is a book, not a balance.

The desk page says the sum in milles and in the old print, the cap of 25,000 milles, and the room left. Under that: what is already bought, by name. The district office, the field count and what it is for, each aide's name and the day they started, whether counsel is retained, and every colleague whose race you have backed.

The tape is the money you chose to spend: the day, the milles, and the sentence of what it did. A spend the ground will not take does not leave the chest. A parish notice is refused where the state does not keep a Latin, Consular, or Reformed book. A file on a rival is refused when nobody is running.

New spends, each a different thing: a letter to every box, supper for your own state's delegation, yard signs, a bus for election week, the rival's file, the parish notice, a scholarship in the home town's name. The ledger page shows the last four lines of the same tape.

The map opens an atlas. Click a state.

The plate is that state's own note, the year it was founded, the year it was admitted, the capital, the temper, the old work, and the creed the ground leans to. From there: the governorship, every House district, every town, and what the living record has actually written (the journal and anyone in the room who named the state).

A governorship is a line of holders with the years and how they left. The last name is the one in office now, including you if you hold it. A district is the same kind of line, and if someone you know holds it — or you do — the page says so. A name opens. Read further keeps a new page, tied to a governor, a district, and a town already in the book, and it does not invent a second country. Back walks out. The book is stored on the save as `atlas`, so the years do not move once they are written.

The bottom of the screen is the way you play, and it uses the same names as the building.

It says the room's own title and tag, the day, and the clock. The sentence under that is a fact: who asked for a word, or the door in reach, or the nearest person by surname. A person who asked is a gold button. Everyone else is a chip with one true line: their post, their outlet, or how they lean on the bill that is actually on the desk. A door shows the work it really offers. Every exit is "Go to" the room's real name. A line at the bottom is said to the room. The say-aloud bar does not sit on top of any of it.

A live prompt, a conversation, and a card still take the screen alone. A talk that has no way out still grows Leave.

A prompt and a conversation were losing to the chrome. The standing calendar, Notices, Now, Who is here, and the room bar (the statutory quarter, six other people) were all sitting on the buttons. Closing a talk hit one of those instead of Leave.

One surface at a time. While a prompt is live, those five go away and the prompt is the full width of the bottom of the screen, every button in reach. While a conversation is open, the same. While a card is open, the same. If a talk has no way out, it grows a Leave button. Esc still leaves. The room bar no longer hides the real prompt.

The party card is the caucus, five members of your party, each in their own voice. **What's this?** is only the explainer. It is not the menu.

The taps were dying. Every row of buttons was stuck to the bottom of the card, piled on each other, and the say-aloud bar sat on top of them. A finger hit the bar, not the button.

While a card is open, that bar, the play bar, and the glass prompt go away. The card sits above them. Each person's buttons stay next to that person. Close stays at the bottom. Ask them to hold the line, offer patronage, cut them loose, or ask them to supper, and they answer in the space under their name. The button changes to Heard. If warmth is already gone, they say so. They do not pretend a whip call fixed it.

The war chest could not hold more than 300 milles on a gift, or 400 on a donation, and anything over 900 was wiped to 180. That is a House race, not the chair.

It will now hold **25,000 milles**. A gift is no longer thrown away at 300. Spending 6 milles no longer shrinks a full chest down to 300. A number that is not a number, or a chest past a million milles, is brought to 25,000 and stopped there. It is not wiped to 180. The desk says the ceiling.

The desk was talking like a manual. Button and scrap were glued into one line ("What this place is read it"), the chest printed `204.94500000000002`, and a precedent came out as "holds: that the…".

The desk now says it is day such-and-such, names the season, and gives the chest in milles to two places. A precedent is a sentence. If the record begins with "that", it says "the record already says that…".

Every action on that page is a thing you can do, and the line under it is a sentence:

- Call someone. They pick up.
- Call the cabinet. Each secretary speaks for their own department.
- Hear them, one by one. They do not speak as a chorus.
- The situation room. What the law lets you do.
- Acts waiting on your name. Sign one, or send it back.
- A foreign capital. They speak first.
- The press room. It is on the record.
- A secretary. Three people, one chair, the Senate still has to agree.
- Clemency. Three lives.
- The party. They will not pretend to be one voice.
- The other party. They are not one mouth.
- The people in your life. The office did not replace them.
- The election, the Web, the market, the district, each in a sentence of its own.

The record, the family, and the market say what they are. The broadcast is who read it. What was written is the book. The same sentences are on the bar at the bottom of the screen.

Play on a phone was still a small prompt you had to aim at. The work is now a bar fixed to the bottom of the screen, above the home indicator, and it does not move.

- It names the room and says who is in it.
- Every person in the room is a button. If they are close, it opens the talk. If they are across the room, it steps you to them and then opens the talk.
- The nearest door lists its actions as full-width buttons. Read the place, buy, knock, speak. One tap.
- In your office, the executive office, or the governor's office, the bar has **Open the desk**.
- While the bar is up, the old glass prompt is hidden so the two cannot cover each other. A hearing, a catch, a card, or a conversation puts the bar away and gives the screen back.
- The old prompt, when it does show, is fixed to the screen and its buttons are a full row high.

`20261120b` still puts a person behind every door.

Review of `20261120a`: the street had fronts and prices, and almost nothing behind them. A door was a name. The page did not say who was standing there, whether the hour had closed it, or what the household wanted.

Each door now has a page that stays:

- Open or shut, from seven to seven.
- The person at the door, drawn from a household already on the record, and which street they live on.
- What they say today. A diner does not say what a barber says. The line holds for the day and changes the next.
- The thing that household has been waiting on, the child, and the last thing they remember.
- The window, at today's price, in guilders.
- The weather on the pavement.
- **Speak to them.** Eight minutes. They remember that you came.

The two houses at the end of the block can be knocked. Ten minutes. The visit is written into the household.

The street sign is a board, not a list of labels. It leads with the guilder and whoever on the block is still waiting, then every door. Earlier days stay on the board.

Awnings, a parish step, and a post box are on the pavement. `20261120a` still builds the street.

The district you were walking was the early grass lot. The heavy town only draws when the graphics are not on Simple, which is what a phone uses, so the street never appeared.

When that heavy town is off, Main Street is built in the room itself. It is one avenue, not a scatter. The parish and the district office face each other. Vaughn's faces the campaign office. The market faces the hardware. The newsstand faces the barber. Two houses close the block. Lamps, trees, and parked cars sit on a rhythm, not wherever a number landed. The families who live in the district are named on the fronts.

Every door has **Read this place**. That page stays up: who keeps it, and what is in the window at today's price. The street sign at the top of the block reads the whole street the same way. Standing at a door keeps the prompt. It does not swap out from under a finger.

New buildings the town puts up, when the heavy town is on, are seeded on facing lots off the carriageway (sixteen metres out, eighteen apart, north of the cross street) instead of a spiral that dropped them in the road.

`20261119b` (the desk) still holds.

The desk computer is no longer a small dark box of one-line buttons. It is the desk: a paper screen, a rail of drawers, the clock, the guilder, the purse, and the chest in the masthead. **Desk** on the bar opens it from the office, the executive office, or the governor's office. The glass prompt hides while it is open, so it cannot cover the page.

Drawers, and what is actually on them:

- **Inbox.** Unread first. Open a letter, read it, answer it on the page. The answer is the answer. It says where the writer is standing.
- **Constituents.** The letters from home, and the kitchens: family, street, mood, what they want said, what they remember.
- **People.** The ones you have met. Warmth, a spouse if they have one, supper, a confidence, courtship, or a step back. Their reply stays on the page.
- **News.** The wire as it was said, the overnight, the morning Ledger, and Forbes.
- **Ledger.** The purse and the war chest as two books that do not mix. Salary, rent, the last lines of the purse, and what a guilder is.
- **Duties.** The office's own list, the live bill, the docket, the whip, and the party.
- **Schedule.** Today's diary against the clock, and the day the roll is down for.
- **Suggestions.** What the towns are asking, on the same page as the district's own building.
- **War chest.** Every spend is a button on the page. The number changes here. It does not throw you into another card, except backing an ally, which still asks whose race.
- **Staff.** An aide is a person already in the world, named when you hire them, not a headcount.
- **On the desk.** The telephone, with the people you have met. Party, Forbes, the exchange, the Ledger, the notebook, the powers of the office.
- **Party.** Your caucus in their own sentences, then the history of the party: leaders, leans, splits, landmark votes.
- **Polls.** The three bars, the soundings as a line, who asked, and how many households.
- **Elections.** The race, on this screen.
- **The Web.** The pages and the answers, on this screen.
- **History.** Party history, the family file, what was kept, and the book.

`20261119a` still holds the prompt still and keeps the money a working book. That stays.

The prompt was rebuilding itself every time a name or a price twitched, so the button died under the finger. While you are still standing at the same desk, phone, or shop, the line stays. The first tap runs the action. It does not wait for a second click.

**Party**, **Forbes**, and **Exchange** are buttons on the bar. They open pages. They do not depend on the glass.

Money. A purse past 25,000 guilders, or a county book past 400,000, was not a balance a person or a town can hold. Those are set back to a working sum, once, and the feed says so. New money cannot print itself past that again. 100 stuivers are still a guilder. 10 guilders are a rijder. 1,000 guilders are a mille. The campaign chest is milles, and it does not buy a share.

Prices are not one number. Bread, grain, coal, iron, cloth, medicine, and the rest keep their own levels, and they move with the guilder instead of all sitting at 70. A purchase is said in guilders and stuivers, and it says what is left.

The exchange has a bid, an ask, a volume, and a small graph for each name. You buy and sell from the purse. The page stays up.

Forbes is the business daily: the movers, a quiet name, the bill, one shop door, and the race. The sentences are built from that day's numbers, not from one phrase reused. The morning Ledger is still there, one button away.

The election page is a line of soundings, the change from the last mark, and the field on one scale. Rally, the ad, the canvass, and the debate are on that page.

In talk, a person no longer spends the first sentence announcing their own name. They say the thing.

`20261118c` still put the prompt above the room's words. That stays.

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

If nothing is broken: **do not refactor.**

Play path: Continue → office/corridor → bronze 7/12/18 → witness/kneel/rebuke → one horcrux → talk → district church of your creed → East Steps up the treads through the door.

---

## Tone in the House

Dry. Unsentimental. The remnant is heresy, not a secret good ending. The chaplain does not move. God is the Most High. Not a consul. Not you.
