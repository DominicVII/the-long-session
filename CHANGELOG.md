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
