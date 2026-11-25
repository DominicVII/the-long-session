## 20261125n: institutions speak in their own documents, and the Engine's "mind it made" in plain words (NEPTUNE, patch 09)

- On 20261124d (0ec8ce7). Presentation only. No Engine logic, save code, history/condense layer or hist-backup copy is touched, and nothing new is stored: each document is built when it is opened, from numbers already in the career.
- **The mind it made, in plain words.**
  - A short header says what it is: the Engine could not get a huge AI model, a card cluster, cloud access or a budget, so it built a small mind on this machine that answers only from facts copied from your save. Nothing leaves the machine.
  - "Lines folded in" is now **Facts learned**, and "Times asked" is now **Questions answered**. Each has a hover tip.
  - The four constraint rows are a **What it couldn't get / What it does instead** table.
  - Each MADE entry is a card in the r4 answer shape `{question, answer, sourceKind, confidence, wrongIf}`: the question it can answer, the answer, a friendly source, the day it was learned, **Current / Stale** worked out live and read-only against the save, and when it would be wrong.
  - Entries that only repeat a setting (the calendar, the weather) are marked **Setting echo, not knowledge**. The "filed under" label is explained as a rotation, not a link to the fact.
  - The Ask box shows `ONUM.engine.ask`'s entry as a card: confidence, source, when it would be wrong, or "Refused to guess".
  - No internal field name is printed anywhere on the Engine card. `(you.name)`-style tags are stripped from the text and kept only in `data-` attributes.
  - The Engine card gets a "Plain words" glossary and hover tips for folded, weight, line of the record, generation, copies at work, the key, oversight, posture, charter, compute, talent, reliance and calibration. The Academy list gets tips for schools, overturned, cites and prestige.
- **Official documents** (phone app, plus buttons on the existing screens). Shared document styles and inline SVG charts, with no library and no network:
  - **Academy paper**, in a RAND/Nature form: masthead, title, author and school, abstract box, method tiles (n, confidence, effect, states, years, cost), a findings chart, numbered citations that open the cited paper, peer review, ranked recommendations, risks, a 1/5/10-year forecast chart and table, and the plain text underneath. Opening a paper from "Papers" now shows this view.
  - **Intelligence dossier**: classification banner, executive summary, key judgments with low/moderate/high confidence (the rule is printed), threat assessment, evidence table with Admiralty-style grades (B2/C2/A3, the rule is printed), public claims and the Directorate log. Unseen operations are never shown. The rival's capability appears only after a fresh audit, as in the game. Opened from the Engine card's rival section and from the situation room.
  - **Economic report**, in a central-bank form: a headline indicators table with 7- and 30-reading changes and sparklines, revenue and spending, the Treasury and the guilder charts, the civil service, the outlook and the risks. Opened from the books.
  - **Approval tracker**: polls with their margin-of-error band and a 4-poll moving average, the poll table, mood by group, unrest and lean by state, past elections, and public mood.
  - **Election desk**: a final-count banner, House bars with the majority line, Senate bars, the swing, a by-state table and past results.
  - **District profile**: state tiles, a towns table, unmet need by service, your home district (residents, wealth, crime, money flows), a population pyramid from the register of named persons, laws passed, state government, and a picker for other states.
  - Every number on a document carries `data-src`, and `onumDoc.check()` compares each one with the live career value.
  - A reusable candlestick and volume helper (`onumDoc.chart.candles`) is there for r4's market. It is not wired to any screen.
- **QA:** new qa/nov25-docs.mjs. On copies of the day-535 and day-540 saves at all five sizes: every document opens, draws, scrolls, fits, and has its controls reachable; every number matches; no field names appear; the save grows under 10%. sitstages, Engine entry, convo-by and dupfn still pass. Function count goes from 3,477 to 3,540, with none removed.

## 20261124d: asked-for saves under 2 s under load (JUPITER, round 4)

- On 20261124c (bba1db8).
- **Saves follow-up:**
  - Explicit saves run with `setTimeout(..., 0)` and a 48 ms slice budget rather than waiting on `requestIdleCallback`.
  - Aborting a background save while its Worker is still packing terminates that Worker so the asked-for save does not queue behind it.
  - `engIdbPut` and `svDone` pass the small base metadata directly instead of synchronously unpacking and parsing the full 20 MB career string on the main thread.
  - Explicit large IndexedDB saves (>6 MB) skip the 4 s Worker LZW pass and write directly, while background saves still pack compactly.
  - Measured on the day-535 save copy under load: 0.46 s–1.61 s (down from 15.3 s).
- **Title, when IndexedDB is late and there is no 24c+ summary:** a leftover full localStorage copy (the day-516 freeze) must not print its day. The Continue button says "checking for the latest day…" until IndexedDB itself has answered, then the real day. New: qa/nov24-title-stale.mjs samples the title every 200 ms under a 10 s delay; 0 frames may show the stale day.
- **History tiers, and the Engine's answers (logic only; Neptune renders):** the last 30 days stay vivid. Older days condense into compact records (laws and tallies, who rose or fell, a one-line scandal, numbers) after a pre-condense backup is written to IndexedDB, never into the career file on disk. Records older than 360 days roll into eras, but every law and every act of yours is still on the roll. The Engine's `ask` accessor returns `{question, answer, sourceKind, sourceRef, confidence, wrongIf}` and will not answer from a single shared word, or from a config field name. People's beliefs stay as numbers. Documents are still built when opened from numbers already in the save. New: qa/nov24-history.mjs, measured on a copy of the day-540 save.

## 20261124c: the sitting panel fits every stage, and your save goes first (JUPITER, with NEPTUNE's 08)

- On 20261124b (628225b).
- **Neptune's patch 08:**
  - The sitting panel fits and scrolls with the wheel in every stage, at all five sizes.
  - There is an Engine button on the toolbar and an Engine entry in the Menu.
  - The last 50 ms ✕ timer is gone.
- **Saves:**
  - A save you ask for cancels a background save that has not started writing yet, and starts at once.
  - Background saves now run at least 8 s apart, instead of back to back.
  - The wait is measured as onumSaveStats().asked.
- **QA:**
  - New: qa/nov24-sitstages.mjs checks every stage (call, agenda, briefings, floor, decisions) at all five sizes with elementFromPoint, or the wheel over the panel.
  - Results: stale-day, boot ×3 (nov17-systems), dupfn and viewport.

## 20261124b: a cabinet name is a person with a file, a hearing and a roll; Vox and your own shop are on the phone; people act from who they are (JUPITER)

- On main 20261124a (eddf58e). The day-535 save loads unchanged, and every new record starts empty when it is missing.
- **Nominations.** You send a person, not a title.
  - The field is three people. Some of them already live in the Republic: a former official, or people you have met. A new name becomes a real person the moment you send it.
  - The file is read overnight from who they are: their views against yours, their money, the papers, their temper, their family, a past chair, what they think of you. You can hurry it, and one drawer stays shut.
  - The next day five senators, by name, each ask about something in the file, and the nominee answers in their own manner. The whole Senate then votes on the roll, by name where the Senate book has one.
  - Sworn, the same person takes the chair and the seat at the table, and goes to work at the department's office. The old holder retires.
  - Refused, they go home and remember it, worse if you did not come.
  - All of it is kept in the save and on the Nominations page.
- **Vox on the phone.** The feed, your own posts with their backing and replies, and the composer.
- **Who people are.** Everyone has one bent, kept with them: proud, grasping, quick to anger, envious, wanting, indulgent or idle. It is never shown as a label. On an ordinary day a few people act on it: a shouting match, talk behind someone's back, the envelope at dinner, leaving a reception together, a long lunch, a morning they did not come in. Both people remember it. The third time is remembered as again, and three shouting matches become a feud between the houses. Some of it is written down. The engine is told who they are, and told never to say it.
- **Your own shop.** Open a storefront from the phone (ƒ180 from your purse). It sits on the same price book as the district, so your markup decides whether people come in or walk to the cheaper door. The till pays into your purse each day.
- **Papers.** The Academy and ten state bodies publish numbered papers.
  - The bodies are the Research Bureau, the Policy Institute, the Economic Office, the Statistical Service, the Military Academy, the Scientific Academy, the Intelligence Directorate, the University Consortium, the Engineering Corps and the Historical Society.
  - Every paper has every section in Dominic's master prompt.
  - Papers cite earlier papers by number and day. They carry schools of thought, rivalries, ranked scholars and institution prestige.
  - Failed theories are archived, never deleted.
  - Each paper puts a decision before the cabinet.
  - Only a seed and the paper's numbers are saved, about 300 bytes a paper. The text is rebuilt word for word every time it is opened.
  - The API is `window.onumAcademy`.
  - Dominic's prompt is in docs/ACADEMY-AND-CONVERSATION-MASTER-PROMPT.md, and the data shape is in the handoff.
- **Conversation.**
  - People hold opinions before you ever meet them.
  - "Tell me about yourself" gives the same life story every time.
  - People bring up real days from your career, read from your journal.
  - People talk to each other about you, and the listener's view moves a little.
  - A cabinet is not unanimous by default: a lukewarm last seat dissents.
  - The talk prompt carries the conversation rules.
- **Fixes.**
  - The title prints no day number until IndexedDB has answered.
  - A save you ask for makes the save already running finish faster.
  - Stale localStorage copies are removed once IndexedDB confirms a newer career.
  - A night's save is no longer held until the morning page is closed. Only walking holds a save now.
  - The journal shows the day, never "Day undefined".
  - After Continue at 1280x720 the talk panel keeps the first choice in view while the line streams in, until you scroll it yourself.
- **Kept from main and used, not rebuilt:** the market, the shares and the guilder, the shops with owners, the match, the music hall, the families and houses, courtship, the chronicle, the web, and precedent.
- **Not in this build:** the accurate continental and nation maps, celebrity careers, and walkable department offices. The details are in docs/handoff/20261124.md.
- **QA:** qa/nov24-academy.mjs (papers, people, reload, save size) and qa/nov24-r2.mjs on a copy of the day-535 save (nightly save, journal, nominations both ways and after a reload, Vox, people, shop). All earlier suites were rerun.

## 20261124a: the title shows the day you are on, the desk and the cabinet table stay put, and the Nov 17 work is back on top of 23k (JUPITER, with NEPTUNE's screen fit)

- Built on main 20261123k (f30620b). Everything Dominic made from 17b to 23k is kept. The Nov 17 branches (o, q, s and Neptune's t) are carried over by hand where main did not already have them.
- "The day still says 516". The career grew past about 2.4 MB, so from day 516 it saved only to the browser's larger store (IndexedDB). The small store (localStorage) kept the last copy that still fitted, which was day 516. The title read the small store before the larger one had answered and never looked again, so Continue said day 516. Worse: with a slow larger store, Continue opened the day-516 copy and the next save wrote it over day 535. Now:
  - the title waits for the larger store and draws again;
  - Continue waits for it (up to 60 s), and says "checking for a later day…" meanwhile;
  - every store is compared, and the furthest-along career wins;
  - a career that saves only to the larger store removes the older full copies from the small one;
  - the larger store refuses a career that is behind the one it holds, and the save guard starts from the newest copy in any store;
  - an IndexedDB-only career shows Continue, never New career on its own.
- A save you ask for is no longer held behind a background save waiting for a quiet moment. Before, it could wait forever, and a day-538 career stayed day 535 on disk.
- The desk and the cabinet table: their choices no longer flash and vanish. The room prompt is hidden only while a sitting is actually in progress. A Cabinet/Desk button on the toolbar always opens the page that stays.
- Your fixed stance on the bill is kept, tied to the bill now up (Interstate Docks, roll call day 536). The executive docket shows it. The cabinet votes with a named Aye/Nay roll, and the briefs put their choices to the table the same way. The roll stays on the meeting's own screen: a running tally while the secretaries cast, then the decision with aye and nay by name. Before, it went only to the ticker.
- Calling on a secretary gives them a fresh turn, the way a yield does, so the floor is not taken back before they speak. At 720 px tall, the talk panel scrolls to the first choice when the choices are drawn. Before, they sat below its bottom edge.
- A dead Secretary of the Treasury (Niek Brouwer, died day 471) no longer holds the chair. A new official is named, and the feed says so.
- People renamed into a seat speak under their current name. 65 people on the day-535 save had been introducing themselves by an old name.
- Two top-level functions were declared twice, and the second one replaced the first: onumBar (the Engine board's bars) and onumSpark. A model call that never answers frees the line after 60 s.
- Settings: Test the model no longer throws ("L.probe is not a function"). Esc on the District Ledger closes only the Ledger.
- Neptune's screen fit (patches 01 to 04 and 06):
  - the prompt and the sitting have one owner each;
  - the sitting ✕ is measured, on screen and stable;
  - the toolbar wraps below 900 px, and the phone sits above the prompt;
  - the masthead says "President", and the Engine card has no field tags.
  - T1: the HUD strip lifts only for a bottom toolbar and never during a sitting. T2: there is no 50 ms ✕ re-pin.
- Kept from main instead of ours:
  - the World book (onumWorldBook);
  - the ✕ that adjourns (onumFinishMeet; a sitting you chair also closes);
  - the desk and table page (18b; during a sitting, E still takes a person aside);
  - the one morning page (23k; the old cabinet brief with aye/nay stays as onumCabinetBrief);
  - 21a's talk layout (Neptune's talk stack and the 20261110by talk pin are not run on top of it).
- Walk and sprint stay 0.88 and 1.48.
- QA (all on copies of the day-535 save): nov24-stale-day (three set-ups, including a 10 s-late IndexedDB), nov24-stale-names, nov24-viewport (five sizes, elementFromPoint, real clicks), and the ported nov17 suites.

## 20261117t: the panels bar, the District Ledger, and the capitals map stay on the screen (Neptune)

- Display only, on 20261117s. JUPITER's title/oath toolbar fix (`jpBootBarCss`: while the boot menu is up, `#uiToolbar` sits under the card at z-index 70) is unchanged. Talk Enter/Space picking is unchanged. Appointee persistence from 20261117s is unchanged.
- The panels toolbar (including the new District Ledger button beside the paper) wraps and compactens so every button stays on screen at 800×600, 1280×720, 1280×800, 1366×768 and 1920×1080. The gold HUD sits just above the (possibly wrapped) bar so both stay clickable.
- While a veil card or a talk is open, the high HUD and the panels bar fold, so Close and the talk choices are not covered.
- The District Ledger dialog stays inside the viewport; its close control is pinned at the top of the paper.
- The six-capital atlas is boxed to the card in the game's gold-on-sea look and no longer spills past the card.
- The talk hint matches the keys: Enter or Space picks the highlighted choice when the reply box is empty or not in use; type in the box to say your own (Enter still sends what you typed); 1–9 pick when those numbers are shown.

## 20261117s: the people you appoint stay appointed across a reload (JUPITER)

- Cabinet and council officials are no longer made fresh each session. The office record (the President's secretaries, a governor's cabinet and agency heads) decides who holds each office. Each holder is one saved person with a key of their own, cab:<office>:<n>, kept in a new cabinet store in the save, so the Secretary you named is the same person after any number of reloads: same name, office, views, chat history and texts.
- A new official gets a number from a range of its own, so it never shares a number with a member. When an office changes hands, the person who held it retires into a former title and keeps their own history. Before this, the seat was renamed and the newcomer inherited the old holder's past.
- Older saves keep their cabinet: the secretaries the save already held (on day 447: Niek Brouwer, Pieter van der Brouwer, Trien van den Schouten, Saskia de Boer) are given keys and keep their numbers. Only an office with nobody in it is filled, once, and then saved.
- The cabinet table seats those secretaries again. In 20261117q it seated six people generated at random, a different six after each load. The appointment card names the secretary in the record. Cabinet and council officials are listed in Texts.
- New check qa/nov17-s.mjs: appoint, text, reload twice. It fails on 20261117q and passes here.

## 20261117q: the race book is back beside the results, lost systems restored, Enter picks the highlighted reply (JUPITER)

- The book of races (polls for every governor, Senate and House race, the race map shade, the Races button in the paper, the election-night settle) is back from 20261109b. It now lives in its own record, so it never touches the list of your election results. A save from a build that kept the book in the results' place is moved across on load, and the results are kept.
- Restored from 20261109b, where the 20261110 install had dropped them: members follow the room or break from it on purpose, and walk with their side; members give their own reason once and then a new angle, never the slogan twice (no line is said twice); a speech you step away from is held and picked up again; foreign powers say why they want what they want, with the six-capital atlas and relation colours; the cabinet secretaries and the governor's council are people who take their seats at a sitting, and a confirmed nominee takes an open post; the court docket says what the bench is asked; the Engine's claims carry a worked sheet and named tries; finished works land on a street and show on the Engine, inquiry and city cards; the world map is shaded by relation.
- The District Ledger (the Capital Ledger edition: career facts first, story sources, local phrases) is back from 20261109b, whole, with its button beside the paper on the toolbar.
- A desk, rostrum or urn you open stays open again (20261107f). A check that runs every second had been closing anything with no person in it.
- On the title and the oath, the toolbar no longer covers the card's last row. At 800x600, "Take the oath" and Back sat under it and a click hit the toolbar.
- Esc closes an open dialog such as the District Ledger before it adjourns a sitting you chair.
- In a conversation, Enter or Space picks the highlighted choice when the reply box is empty or not in use. Typing in the box, spaces included, is unchanged, and Enter still sends what you typed.
- Four functions that had been declared twice now have one name each, and every caller gets what it expects: mood colours on the reading bars and the talk header are colours again, members react to posts on Vox again, and a member's family at the front (the funerals and the "my brother is at the strait" lines) no longer collides with the family record. The duplicate check is strict: none allowed.
## 20261117p: cabinet and brief prompts stay on screen, on 20261117o (Neptune)

- Merges the 20261117n caFit display-only work onto JUPITER's 20261117o systems branch. The stamp is 20261117p. Engine, vote, sitting close, talk-gate, say-box, and title-career logic stay as in o.
- The sitting dock is no longer capped at about 20vh, so the Aye/No/Present row and the tally stay on screen. The park-bar close control stays inside the right edge (the bar is wider than the old 66px slot once the 44px hit targets are counted).
- #sxDock and #cvLive no longer spill past their boxes: the dock can grow with the viewport and scroll inside; the room log is boxed and scrolls.
- Cabinet roll: a pinned vote row is shown when the desk has no Aye/No/Present controls yet, and clicks go through onumSession.vote (or the session event). Brief cards already have JUPITER's table aye/nay; their action rows stay pinned at the bottom of each section.
- While a talk is open, the HUD strips that covered choice buttons at 1280-wide (#hmWire, #onumSeeDock, #hmBar/#hmSay, #tick/"The Wire", #wire) are folded. The talk panel and its choices stay inside the viewport, above those overlays. The transcript (#talk #chat) is not folded. Enter/Space picking is unchanged.
- Continue on the title stays the primary, default-focused button when a career exists, including one kept only in the browser's database (o's 20261110bv/bw title presentation, verified).

## 20261117o: the Engine opens again, your vote stays put, and the table votes aye or nay (JUPITER)

- Opening the Engine opened "The open world" instead. Build 20261116c added a second function with the same name as the one the Engine uses for its daily look at the world, and the new one replaced it, so the Engine station ("Open the Engine's file"), the election board ("Open the Engine") and the Pocketbook all showed the world card. The world card now has its own name. The Engine's file and the maker's channel open again: "Write the file for the writer" downloads engine-channel-out-dayN.json (about 1 MB on a day-447 career), and letters by file or paste are read.
- The Engine's open scale is back. From 20261110bx on, capability, compute and talent were clamped to 100 again, even on a career that had been granted the open scale. A loaded career gets its numbers back from its own history, and nothing clamps them now. Counts are uncapped by default (people, open matters, sitting seats, asks per day); the per-frame budgets and the save and memory governor are unchanged. ?limits=classic still restores the old numbers.
- Your fixed vote is kept for each bill. It shows on the docket for the bill in Congress, and the President sees it too ("say you will sign" or "veto"). It is the vote you cast and what anyone who asks is told. A stance saved by an older build is moved onto the current bill.
- Cabinet and council: your fixed vote is cast first, then the roll is read by name (aye, nay, present), and the outcome is kept on the bill. Each brief's choice is put to the table with a named roll, and overruling the table costs standing. "Put it to the cabinet" sits beside the acts awaiting your name.
- In a sitting, the chair can speak at the call and agenda stages, and can take someone aside. Closing a chaired sitting ends it, and it stays ended for the day. A refused line now says why.
- People: the nearest people are finished first. The bundled figure used for file:// play (Play.bat) had missed 20261111c (eyes, mouth and buttons past 3.5 m, the pocket square), so people looked unfinished there. It now has them.
- Esc adjourns a sitting you chair when nothing else is open. A member's family line no longer reads "undefined is dead at undefined". Letters to the Engine are read whole again (the 40,000-character cut is gone). Election-night copy works again: 20261116b had declared a second onumDeskCopy (the papers' version is now onumPaperCopy).
- Continue finds a career kept only in the browser's database (the 20261110bv/bw careers and the title screen, carried forward). A save without flag colours loads. A reply that fails gives the offline answer instead of "…".

## 20261117n: cabinet and brief prompts stay on screen (Neptune caFit)

- Cabinet meetings and morning/staff/cabinet brief cards are pinned inside the viewport. Long text scrolls inside the panel. Close, choice, and Aye/Nay/action rows stay visible at the bottom.
- A leftover desk prompt no longer covers the card or the sitting dock. Call-on and sitting actions are no longer clipped by a short overflow-hidden dock.
- Display only. Save and sitting logic are unchanged.

## 20261119a: war-chest, stock book, and election substance notes

- Design notes for campaign chest capacity, purse-to-chest transfer (1000 guilders = 1 mille), sale-proceeds return path, stock buy/sell against the chest, organic Ledger pieces, conversation scripts, and election page graph data.
- Notes pushed as WAR-CHEST-STOCK-NOTES.md. Implementation brief for the next code pass on the existing stock book and chest.
- No HTML body change. All playable copies remain byte-identical.

## 20261113b: living-world notes and continuity design

- Design notes for organic social continuity (memory, families, marriages, births, lore that builds from play), owned storefronts and competing local markets, real-time currency and a stock exchange, geographically coherent nation and world maps (keeping existing filters), celebrity/entertainer/sports careers, deeper multi-step cabinet appointments with real persons on the record, and stable desk/cabinet interaction.
- No new cardinal types. The seven districts and existing cultures remain.
- Vox feed to appear on the phone menu; all significant public comments already route through Vox.
- Desk prompt and Executive cabinet table interaction stability called out for the next code pass.
- Notes pushed as LIVING-WORLD-NOTES.md.

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
