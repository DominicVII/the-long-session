# UI / UX simplicity review: "One Nation, Under, ME." (NEPTUNE, 2026-10-13)

> Note: the GitHub connector can only push text files, so the screenshots referenced here are not in the repo. They are on the build box at `/workspace/ov/neptune/qa/`.

**Rule (Dominic):** make it much simpler for a regular player, and keep all depth and detail. No system, figure, law or line of lore is removed. Everything below changes **how** things are shown: progressive disclosure, a clear next step, fewer panels open at once, bigger controls, onboarding hints and consistent key prompts.

**How I reviewed it.** I played headless Chrome from a fresh profile: title → New career → creator → oath quiz → returning officer → corridor → Panels / Map / Settings. Screenshots are in `neptune/qa/ui-*.png`. Line numbers refer to the current `session.html` on main.

## P0: the first 10 minutes

### 1. Number badges 1–9 land on random things
- **Screens:** every card (`ui-02-make.png`, `ui-05-sorted.png`, `ui-21-panels.png`, `ui-22-map.png`).
- **Problem:**
  - `refreshPicks()` (line 29909) numbers the first nine visible `button, .sugg, .mk__opt …` in DOM order. In the creator, 1–9 go to "Another name", Masculine/Feminine, the dress buttons and the first two **skin swatches**. On the returning-officer card, 1–9 are **colour swatches**, not the four real choices.
  - In the quiz, the "answers so far" strip (`data-edit`) comes first. After question 1, the key **1 re-opens question 1**. That is the reported "1 bounces between questions".
  - Badges overlap labels on the map.
- **Simpler design:** badge only the card's **primary choices**: quiz answers, the ticket buttons, travel destinations and talk replies. Skip swatches, edit chips and tabs. Show the badge as a quiet prefix ("1 ·"), not a black dot over the text.
- **Implementation:**
  - Add `data-pick` to the elements that should be numbered (`.mk__opt` in `.qz__opts`, `[data-go]`, `[data-join]`, the ticket buttons, `.sugg`).
  - In `refreshPicks()`, use `sc.querySelectorAll("[data-pick]")` when the scope contains any `[data-pick]`, and fall back to the current selector otherwise.
  - Ignore `e.repeat` in the number-key branch of the keydown handler (line 28615).

### 2. The character creator is one long wall of 15 rows
- **Screen:** `ui-02-make.png`. Name, seat, faith, frame, dress, skin, hair, style, cloth, shirt, height, build, glasses, beard… all on one scrolling panel. The 3D preview on the left renders as a washed-out, ghosted figure in white fog (no room lighting yet), so the choices don't read.
- **Simpler design:** three short steps with a big **Next** button. Every field stays.
  1. **Who** (name, seat, faith)
  2. **Look** (frame, skin, hair + style, glasses, beard)
  3. **Dress** (dress, cloth, shirt, height, build)
- Add a **"Surprise me / Keep this"** shortcut that rolls everything and jumps to the oath. Most players will press it, and the detail is still one click away.
- **Implementation:**
  - In `nameCard()` (line 31648), wrap the rows in `<section data-step="1|2|3">` and show one at a time. Back/Next re-use `qzBack`-style buttons.
  - Light the preview: render it inside the office kit, or add a hemisphere light while `boot-menu` is set. The fog/grade overlay (`.grade`, `.grain`) should be off on this card.

### 3. The title card is a wall of lore before the first click
- **Screen:** `ui-01-boot.png`. Four paragraphs plus a small-print Taylor paragraph.
- **Simpler design:** keep the headline and one sentence ("You are a member of the House. Everyone remembers what you did to them."). Move the rest behind a **"What is this?"** disclosure (`<details>`) and into the Handbook, unchanged. Make **New career / Continue** large, 48 px tall.
- **Implementation:** the title card markup. Use `<details class="lore">` around paragraphs 2–3 and the Taylor note.

### 4. The returning-officer card asks five things at once
- **Screen:** `ui-05-sorted.png`. All of these appear together, before you have decided to found a party:
  - axis read-out
  - party-name input
  - 15 colour swatches
  - "Let the returning officer read it back"
  - four ticket choices
- **Simpler design:**
  - **Step A:** the verdict + 4 big choices. "Take the Federalist ticket" is recommended and pre-focused.
  - **Step B (only if "Found your own party"):** name + colour.
  - "Read it back" becomes a small link under the verdict.
- **Implementation:** in `sortedCard()` (line ~31876), render `#ownName` and `#ownSwatches` inside a hidden `<div id="ownStep">`. `#foundOwn` reveals it and changes its own label to "Found it".

### 5. A next-step prompt after the first spawn
- **Screen:** `ui-20-hud.png`. The game drops you in the corridor. The only guidance is the "NOW: Lucien … ▸ My Office" chip. "Today's aims" (talk with three members, win a pledge, take the air) exists, but **only inside the pause menu** (`ui-23-settings.png`).
- **Simpler design:** a small **aims tracker** under the location tag, top-left. It shows the next aim and its progress (0/3), and the rest unfold on hover or Tab. When an aim needs a place, the NOW chip already points the way: keep it, and add the door arrow in the compass.
- **Implementation:**
  - Re-use the data the pause menu's "Today's aims" renders (`openSettings()`, line 29310). Render it into a new `<div class="aims" id="aimsHud">` next to `#whereName` (line 915), refreshed on the same tick as `#job`.
  - `objectiveDoor()` (line 24263) already knows the door. Draw a marker on `#compassTicks`.

### 6. Show the E prompt where the player is looking
- **Problem:** keys are explained only in the held-? strip (`#keysTips`, line 919, tiny monospace chips in the top-right, `ui-23-settings.png`). When you face a person or prop, nothing on screen says "E: Talk to Connor O'Brien". New players don't learn E, and the "E rarely works" reports partly come from not knowing what it targets.
- **Simpler design:** one centred, context-sensitive prompt under the crosshair, built from `focusThing()`. Examples: `E  Talk to Connor O'Brien`, `E  Pour a cup (coffee pot)`, `E  Sit`. Use the same pill style for the pad ("A"). The ? strip stays for the full list.
- **Implementation:**
  - Each frame (or every 6th frame), call `focusThing()` / `seatUnderYou()` (lines 12377, 12234). Write the result into a new `#usePrompt` using `say()` (it only touches the DOM on change).
  - Label: the person's name, or `prop.label`.
  - Key label: `(G.bind||DEFAULT_BIND).interact.toUpperCase()`, so rebinding stays consistent.

## P1: fewer simultaneous panels, consistent controls

### 7. Top-left toolbar: four small, unclear buttons
- **Screen:** `ui-20-hud.png`. **PANELS / MAP / WALK OUT / ⚙ SETTINGS** are 11 px caps. "Panels" opens the **phone**, and "Walk out" is unclear.
- **Simpler design:**
  - three labelled icon buttons with their key: **Phone (F)**, **Map (M)**, **Menu (Esc)**
  - "Walk out" moves into the Map card as "Leave this room"
  - 40 px tall, 14 px labels
- **Implementation:**
  - Edit `#uiToolbar` (lines 941–946). `uiWalkOut` moves into `mapCard()` (line 24094) as a first row.
  - Bind `m` to `mapCard()` in the keydown handler, guarded by `!bindTaken("m")`.
  - Make the toolbar text the source of truth for the key hints.

### 8. The Map is a run-together list
- **Screen:** `ui-22-map.png`. The labels collide ("My OfficeCannon Building · you are here", "Statuary CorridorMain floor"). There is no layout, and the number badges sit on top of the text.
- **Simpler design:**
  - group by wing: **Cannon building · Capitol main floor · Senate wing · Outside**
  - each destination is a two-line tile (name / tag), with "you are here" as a pill
  - where a sitting is live, show a small "in session" dot
- **Implementation:**
  - In `mapCard()`, put `<u>` on its own line (`display:block`) via CSS on `.conc__btn u`.
  - Group with a `WING` map: `{office:"Cannon", visit:"Cannon", corridor:"Main floor", cloak:"Main floor", floor:"Main floor", caucus:"Main floor", committee:"Main floor", press:"Main floor", senate:"Senate wing", court:"Senate wing", exec:"Executive", steps:"Outside", district:"Outside", govoffice:"Outside"}`.

### 9. The phone card: tabs are fine, the bill screen is dense
- **Screen:** `ui-21-panels.png`. The axis read-out (four thin rails with ticks) needs the legend "Dark tick: the bill. Green tick: what your district wants". AYES / NOES / UNKNOWN and Vote aye / Vote no all appear before you know whether this bill matters to you.
- **Simpler design:** lead with one sentence: *"Your district reads this as noise; you read it as borderline. Vote is close: 81–79, 27 undecided."* Then the vote buttons. Put the axis rails behind **"Why?"** (expanded by default after the first week), so all the information stays.
- **Implementation:** the House tab renderer inside `phoneCard()` (line 13262). The sentence already exists in pieces ("District reads it as …"). Move it to the top and wrap the rails in `<details>`.

### 10. Wire ticker: too dense, and everything shows twice
- **Screen:** bottom of `ui-20-hud.png`.
- **Problem:**
  - `paintTicker()` (line 19324) writes `html + html` "for a seamless loop". The loop is now stepped (12 stops over half the width, `tickScrollFrame()` line 19334), so a wide window shows both copies: every item twice.
  - `makeHeadlines()` (line 19265) can also add the same text from `G.wireScraps` and `G.feed`.
- **Simpler design:** a single copy, deduplicated by text. Hovering shows the full list in a small popover. Keep all categories.
- **Implementation:**
  - Dedupe with a `Set` on `h[1]` at the end of `makeHeadlines()`.
  - Paint `html` once.
  - In `tickScrollFrame()`, step across `run.scrollWidth - box.clientWidth` instead of `scrollWidth*0.5`.

### 11. One tooltip per person
- **Screen:** `ui-20-hud.png`. Name cards ("Connor O'Brien · Independent · 'I keep looking for McCrae…'") float over every nearby NPC at once.
- **Simpler design:** a full card only for the **focused** person (the one E will talk to). Others get a name-only label within 3 m, and nothing farther away. Overheard lines still go to the feed and journal.
- **Implementation:** wherever the overhead `.tele`/nameplate HTML is built (the `#tele` layer, line 929), filter by `focusTarget()` (line 12323).

### 12. Pause menu: the game tab mixes status, actions and documents
- **Screen:** `ui-23-settings.png`.
- **Simpler design:** split into **Resume · Save · Today (aims) · Read (handbook, paper, government) · Settings**. Leave the four tabs (Game/Graphics/Voices/Controls) under Settings, and keep "Reset to defaults" inside Settings, not on the pause footer.
- **Implementation:** `openSettings()` (line 29310) and the `.settings-footer` (line 1255). Also add **Export save / Import save** here: they exist as `exportCareerSave()` / `importCareerSave()` (lines 29207, 29219) but are reachable only from the Career pane of the desk dossier.

### 13. Settings promise things they don't do
- **Walk Speed** (`#walkSpeed`, line 1165; `settingsState.walkSpeed`, line 29281) is never read by `tick()` (line 30336). The player moves at a fixed 0.68 m/s (1.15 sprinting), further capped by `moveDt = min(dt, 0.022)` and 2.8 cm per frame. At 30 fps that is about 0.45 m/s.
- **Simpler design:** honour the setting (slow 0.8× / normal 1.3× / fast 1.7×), and default "normal" to a brisker walk. Fewer seconds walking corridors means more time on the game itself.
- **Implementation:** in `tick()`:
  ```js
  const WS = {slow:0.8, normal:1.3, fast:1.7}[(settingsState && settingsState.walkSpeed) || "normal"] || 1.3;
  const top = (sprint ? 1.15 : 0.68) * WS;
  ```
  Use `moveDt = Math.min(dt, 0.05)` and a span cap of `0.06`, so low frame rates don't slow the walk.

### 14. "Speak Aloud" is hold-to-talk but looks like a click button
- `bindHold()` (line ~20918) starts on `pointerdown` and stops on **any** `pointerup` (bound on `window`). A normal click stops the recogniser before any audio arrives, so it "does nothing".
- **Simpler design:** click toggles (label "Listening… click to send"); press-and-hold still works.
- **Implementation:** time the press. Under 300 ms means toggle mode: don't stop on that pointerup, stop on the next click. Show the state on the button.

## P2: polish that helps immersion
15. **Location tag** (`#whereTag`/`#whereName`, line 915): the "Main floor" tag is light grey on light marble and can't be read (`ui-20-hud.png`). Give it a soft dark backing (`text-shadow`, or a 60 % scrim pill).
16. **Compass** (line 916): a tiny "N" rail with no destinations. Either show the door markers from #5, or hide it.
17. **Feed / heard flash / tele / hail / proc bar / prompt** are six separate overlays that can stack. Keep at most **one** transient centre message and queue the rest. Feed lines go bottom-left, and the journal keeps everything.
18. **Key prompts everywhere use one style and are driven by the binding table:** `E`, `F`, `M`, `Esc`, `1–9`, `V` for speak. On a pad, the same pills read `A / Y / RB / Start` (`padLegend`). Today the hints mix "Hold V", "X on pad", "RB", "H" and "space" in different places and styles.
19. **Onboarding:** three one-time coach marks on day 1 (stored in `localStorage` like the settings): "W/S walk · drag to look", "E talks to whoever you face", "F is your phone: bills, mail, the count". Each is dismissed by doing the action. Nothing is removed, and returning players never see them again.
20. **Bigger readable controls overall:**
    - base UI font from 11–12 px to 14 px
    - button min-height 40 px
    - `.btn--ghost` contrast at 4.5:1
    - number-badge circles replaced by inline "1 ·" text (#1)

## What stays exactly as it is
Every system, panel, figure and law. That includes:
- bills, the count and the axis read-outs
- Vox, Post, Mail, the Union map, programmes, the journal, the career record and collab seats
- the catch/podium speech system and the regime/consul lore
- the handbook and all district/faith/creed detail

The changes are ordering, grouping, disclosure and labelling.
