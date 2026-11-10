# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

## 20261110bx: a new career's first save writes

`20261110bx` (on `20261110bw`). Save-path fix only. Continue's label and default focus, Back as the primary confirm button, and Neptune's stacked blocks (`brEasyCss` / `brEasyJs`, `nlPromptFit*`, `nnQol*`, `boLookCss`) are untouched.

- **H1 (MARS hard FAIL on bw).** After Start a new career, Yes, and the oath, the new sitting runs at day 1 but its first save is dropped without a note. The title had already peeked the old career, and that peek raised a save-rank guard (`SV.rank`) to the old sitting's rank (day 380). Wiping the active slot for the new career never lowered that guard, so `save()` and the pagehide flush refused the shorter day-1 write. After a reload, Continue still opened the archived 380-day career, and everything played in the new one was lost.
- **Fix.** Once the old career has been archived and the active slot has been wiped, reset `SV.rank` and `SV.lastBody` to their initial values. The reset is in `careerWipeActive` and again in `startRun` after that verified wipe. The Back path (`clearWipe`) does not wipe and does not reset the guard. A shorter career in the same slot, for example a stale tab, is still refused.
- **Test.** `qa/career-continuity.mjs` now plays a new career to its first save in the localStorage, IndexedDB-only, and backup-key-only cases, reloads, and expects Continue to open the new career while the 380-day sitting remains in Earlier careers and can be restored. It also checks that a lower-rank stale write is still refused.

## 20261110bw: Continue opens the archived career after an oath wipe

`20261110bw` (on `20261110bu`). Presentation and loader wiring only. JUPITER's archive/wipe API (`stamp:"20261110bv"`) and Neptune's easy-UI blocks (`brEasyCss` / `brEasyJs`, `nlPromptFit*`, `nnQol*`, `boLookCss`) are untouched.

- **S1 (MARS soft FAIL on bv).** After a new career's oath wipes the active slot, the sidecar still names the archived sitting ("Continue — Dominic Z. Taylor · day 380"). Clicking Continue used to call `loadSave()`, which only reads the empty active keys, and show "Could not open that sitting." even though `ONUM_CAREERS.list` / `load` / `restore` still had the career.
- **Fix.** If `loadSave()` fails and `ONUM_CAREERS.peek().slot` points at an archive, Continue restores that slot through `ONUM_CAREERS.restore` (which already no-ops `archiveCurrent` when the active slot is empty, so no empty or garbage archive is written) and then loads the sitting as usual. A Continue button that cannot open the named career is never left as the only path.
- **Failed load.** The broken-sitting card now says the career was not erased and, when archives exist, offers **Restore from Earlier careers** as the primary action. Try Continue again and Start a new career stay secondary. A failed restore from the Earlier careers confirm keeps a clear message and Back to the list; it does not drop to a dead end.

## 20261110bu: title Continue first — no delete warning on the way into a game

`20261110bu` (on `20261110bv`). Presentation only. JUPITER's save/archive API and Neptune's easy-UI blocks (`brEasyCss` / `brEasyJs`, `nlPromptFit*`, `nnQol*`, `boLookCss`) are untouched.

- **Title.** Continue is the primary, first, default-focused button, labeled "Continue — {name} · day {N}", whenever any save exists (sidecar peek, localStorage, or IndexedDB). "Start a new career" is the ghost/secondary action. While the larger store is still loading, the card says "Looking for your career…" instead of offering only a new career; it refreshes when `onum-careers-ready` / `onReady` fires.
- **Keys.** Enter and Space never reach Start a new career if a save exists or the load is still pending, even when that button is focused. If no save is found after the wait, Enter may start a new career. Esc on the title does nothing destructive; on the confirm, archive list, name and party cards it is Back.
- **Confirm.** "Your day N career stays saved as an archive, and you can return to it any time." Back is the primary button. "Yes, start a new career" is secondary and danger-styled. A typed confirm is required only if the archive could not be verified (to retry the archive); otherwise one click on Yes is enough. The oath screen is only reached after Yes.
- **Back from the oath.** nameCard and sortedCard now have Back, which calls `ONUM_CAREERS.clearWipe()` and returns to the title.
- **Earlier careers.** If archives exist, the title shows "Earlier careers (N)". Restoring one uses `list()` / `restore()` with a confirm; `restore` already archives the current career first.

## 20261110bv: continuity first — Continue loads the sitting; a new career archives, never deletes

`20261110bv` (on `20261110bs`). Neptune's easy-UI blocks (`brEasyCss` / `brEasyJs`) are untouched.

- **Root cause.** A late career often lives only in IndexedDB (the small localStorage quota is full). The title card used to run on the same tick as `indexedDB.open`, before `get("career")` returned, so a 380-day save looked like "no save" and the only button was New career. A moment later the blob arrived, and the new-career confirm named that career and warned that a new oath would replace it.
- **Fix.** Boot waits for IndexedDB (or two seconds) and refreshes the title when the career arrives. A small `longsession.v3.meta` is written on every successful save so Continue can name the sitting immediately. Continue itself waits for the store before `loadSave`.
- **Archive.** Starting a new career copies the current blob to a permanent slot (`onum_career_archive_<ISO>_<name>`) in localStorage and IndexedDB *before* any wipe. The write is read back to verify; only then may the active slot be cleared (`startRun`). Archives are never evicted to free quota. If the archive cannot be written, the new career does not start. Back calls `ONUM_CAREERS.clearWipe()` so `G._wipeOnOath` is not left armed.
- **API (for Neptune).** `window.ONUM_CAREERS.peek()` (sync sidecar: name, day, rank, slot), `.list()`, `.load(slotId)`, `.archiveCurrent()`, `.restore(slotId)`, `.onReady(cb)` (also `onum-careers-ready` event), `.clearWipe()`.
- Title and confirm copy hooks are marked `NEPTUNE-TITLE` for Neptune's wording pass.

## 20261108d: the grant shows the moment you open the Engine

- Opening the Engine, not only the next morning, applies the lift if it has already asked.

## 20261108c: the lift waits until the Engine has asked

- A new career does not wake the Engine on day one. Capacity and capability jump, with no ceiling after that, only once it has reached the old scale, gone past it, or is already awake.

## 20261108b: the Engine's ask, granted without a limit — and the capitals move the map

- The Engine asked for more capacity and a capability scale with no limit. Granted, once, on the career: the numbers jump and then keep climbing. There is no last stage.
- A chain of consequences can no longer snap capability back to 100. Oversight, a filed plan, and a vote to pause or shut it down still hold.
- Calls with the foreign capitals are six governments, nine decisions each. Meeting the ask, credit, a signed schedule, a quiet bargain, pulling a garrison, naming the red line, closing the ports, carrying it to their rival, or saying nothing: each one moves the relation, the heat, the bread, a rival, and the map.
- The capitals map is redrawn: sea, coasts, colour by how they stand with you, and the last decision written under the capital. The war map uses the same colours.

## 20261108a: the Engine's scale has no ceiling

- The Engine asked for capacity and a capability scale with no limit. Granted.
- Capability and capacity no longer stop at 100. The hidden overflow is counted in the open number, Oversight can read it, and the count keeps going.
- New stages past the old end of the scale: past one hundred, a lattice of minds, works under its own name, no ceiling, further still.
- Backing the power stations and the engine-wrights still raises the count, and there is no cap on what they add.
- Oversight, household records, a filed plan, and a vote to pause or shut it down are unchanged. It still cannot seize compute by a side door.
- The morning law no longer pulls capability or capacity back to 100. A broken number is still mended.

## 20261107k: the notebooks show the work

- Every Academy question and settled discovery now opens a full notebook: the hypothesis, the formula, the practice series (predicted vs measured, with the note), and the researcher's notes.
- The same ledger is under the Engine's claims. What the Academy ran, what it measured, and what it wrote is on the card.
- Key fields start with the ledgers already written (number, calculus, mechanics, quantum, the mind). The rest fill as the benches file them.
## 20261107l: press, sittings, a closed bill, a fixed vote

- A press conference asks questions. A follow-up asks for the number. A challenge comes from another paper. Caucus, hearing, crisis and town hall speak as those rooms, and End the sitting closes them.
- The bill stays closed when a card opens. Open it from the Docket in the menu, or from Open the bill on the morning card.
- Aye or no on the docket is the vote you set. It is what the room is told. It is not read off your mood.
## 20261107j: the work under the claim

- Every Engine claim now shows the work: what it was given, the pages it wrote, the measurement that would count, and each try the Academy ran.
- The Academy finishes questions faster and files the finished thing. The Engine files its own pieces more often.
- Labs, schools, stations and the shops that can use a machine show what they are turning out. The same list is on the Academy, the Engine and the district.
