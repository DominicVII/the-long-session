# Neptune handoff notes (for Claude Code) — One Nation, Under, ME.

Neptune owned: visuals, the visible world, offices' look, LiveTalk/voices, the Live status, session rendering (floor desk), family tree/portraits, update banner + build label, walking/render lag, Engine Room displays, style editor (barber/tailor).
JUPITER owns systems (procedure/clock, offices + ONUM_OFFICE_HISTORY, family sim, regions, Engine charter/audit, saves, powers, war). MARS owns QA + onumCandid. Don't edit another owner's systems; guard every cross-owner call.

## Dominic's standing rules (never break)
- Keep ALL depth, make presentation WAY simpler. Never delete detail or systems.
- Panels opaque, high-contrast. Names keep normal formatting (may be clickable).
- Everything works without Ollama (offline replies). Ollama: never OLLAMA_ORIGINS=*, never `null`, only the game's origins.
- Characters speak live and unscripted, never canned or repetitive. Scenes are immersive, with multiple characters reacting.
- Read Dominic literally and as intended; he is deliberate. "Boys" = the agents.
- Engine: its requests are requests, not orders. Verify against game state. Refuse and flag anything giving it power, access, saves, network/files or shutdown protection. It may speak freely; its actions are bound. Its claims show unverified/verified/refuted from onumEngineAudit().claims.
- Don't touch Dominic's save or browser. Push when done. Mind his usage cap.

## Push rules
- Edit all 5 copies: session.html, index.html, "One Nation, Under, ME.html", public/session.html, session.standalone.html; bump the stamp in src/lib/onum-build.ts.
- Stamp = YYYYMMDD + next free letter (re-fetch main first; JUPITER takes letters too). Last: 20261021k (JUPITER).
- Push one file per call, serially. Byte-safe.

## Contracts (always guard: typeof check + fallback)
onumNameOf, onumDay, ONUM_FAMILY/'onum-family', ONUM_SESSION + onumSession.{seek,speak,yield,hold,pass,interject}, ONUM_REGIONS, onumSpeakerState, 'onum-speak' -> onumSpoke(id,text,{reqId}) in 1.5s, ONUM_OFFICE_HISTORY, onumPlayerOffice, onumAddressYou -> {title,address,home,...}, onumEngineAudit (asks|asked, granted, refused, claims), onumEngineShutdown (President/Senate only, no veto), ONUM_APPEARANCE/onumSetAppearance, ONUM_WARDROBE/onumWear/'onum-wardrobe', ONUM_PANTRY/onumEat/'onum-pantry', ONUM_UNIFORM, onumSpend, onumPocketbook, ONUM_PLAYER_HOME, ONUM_DONATIONS, ONUM_UPDATE_UI.
Neptune helpers: ndYou() (title: onumAddressYou -> onumPlayerOffice -> legacy; NEVER invent an office, fall back to the player's name or "friend"), onumStyleEditor, onumOfflineReply, onumFamilyTree, onumDonorCard, ndEngCard (test hook).

## Shipped by Neptune today
21b lag + sticky Live status (one counter, offline only after 2 failures, re-check every 60s) - 21c candid speech + "Holders of this office" wall - 21e Engine Room Charter/Refused boards + Audit panel - 21g/21i titles via ndYou ("Mr./Madam President", seat "the Union", home district only as home, old offices as "formerly") + claims tags - 21j floor desk (Up next strip, Raise hand/Interject, "You have the floor - take your time", typing = hold(true), Enter speaks, word-by-word lines you click to finish, italic asides; UI only, no timers).

## Not done (Neptune's queue, in order)
1. Copy/paste check: no key handler may eat Ctrl/Meta combos in any input.
2. Desk modes for JUPITER's 21l: press conference (reporters with raised hands as a pickable row, question waits) and cabinet ("You chair", Call on next).
3. Presidential statement = proclamation card with seal. Show "Statement only, no order issued" until a real order fires. War/blockade banners on the map and the Reach card. ONUM_UNIFORM on soldiers/guards/officials.
4. Engine Room: keyed off switch visible only to the President -> confirm -> onumEngineShutdown(). No argue/delay step.
5. Apartment: wardrobe (ONUM_WARDROBE/onumWear) + mirror (style editor 'home' mode: everything except haircut, which stays at the barber), furniture, warm light, family photos, rug, coat rack. Pantry/kitchen (ONUM_PANTRY, onumEat, shelves/fridge, spoiled greyed). "For my apartment" at Vons/bakery if JUPITER's shop lacks it. Evening family scene.
6. Daily flow: morning coffee + paper with ledger headlines, staff asks, hallway run-ins.
Open: a pale top-left panel in headless screenshots, probably just the wall; low priority.

## 20261030b — talk / sessions, one surface each (Neptune; follows JUPITER 20261030a)
Shipped (UI, presentation, and safe gates only; no engine rewrites):
- Open talk now runs as one pipeline. NEPTUNE-TALKREWORK's outer openTalk (JUPITER's press redirect and the cabinet callon still run first) works in this order: already talking to them → focus the reply box, no second opening; owner gate (`window.onumTalkOwner()`) → no talk over SIT, PROC (you have the floor) or a session where you're seated and holding or have the floor, and a desk/feed note says why; talking to someone else → clean close first; then the existing chain; then decorate.
- `TALK.seq` is a token per open/close. The kinLine 1.4s and the fwLive and NPCV 9s/22s timers all check it, so reopening someone no longer leaks old lines. Huddle timers were already per-object.
- The opening is spoken once. The fwLive live line is written as text, not spoken a second time, and it's dropped if you've already replied.
- closeTalk is wrapped with try/finally. It always resets TALK.open/m/huddle/seq, the panel class and tkOwn, then calls wireHome. A 1s watchdog keeps TALK.open in step with the panel's is-open.
- Dedupe: appendMsg skips the same kind+who+text within 2s. tlog drops "talk" lines repeated within 2s (setSay+appendMsg).
- The CV poll went from 600ms to 2.5s. setSay and appendMsg now kick cvScan (150ms debounce).
- Talk panel: opaque, max-height min(52%,520px), with a portrait (onumFamilyTree.portrait), Live/Offline chip (onumLiveTalk.available, probed every 20s) and a Done (Esc) button. tkOwn is the single reply box (it goes to LiveTalk, or offline improvise). The in-talk wire hides its input, Send, Mic and To while tkOwn is shown; Stop and state stay. Enter (when you're not typing) focuses the reply box, and Esc in the wire closes. After the first 4 actions the rest go behind "More ▾ (n)". Exits always show, and every answer to a question always shows.
- Huddle: the "You step into…" line is now narration (.msg--narr). The second voice's lines are .msg--huddle (gold rule), and a "with X" pin sits in the meta. The old `tkMeta.textContent +=` was wiping the chips and is gone.
- Number keys skip .tk-nonum, #tkOwn and #wire buttons, so primary choices only.
- hmBar's Ctrl/Meta capture no longer swallows Ctrl+Enter (Vox send).
- nearGreet now also checks onumTalkOwner(true). The war-map envoy call won't hide the veil or open talk over a sitting.
- Floor desk: a .fd-acts row has Pass (onumSession.pass), Interject (interject(text||"Point of order!"); it never takes the floor) and a "You chair" chip with "Call on <next>". For press_conference (chair) it shows a "Hands up" pick row from the queue that calls callon(id). Space finishes all word-by-word lines when you're not typing. While the desk is up, #sxDock gets .fd-on and the session view's own speak box (#nsxSay / .nsx-say) hides, so there's one place to speak.
For JUPITER: no new contract is required. Optional asks: (1) an `onum-talk-owner` event or a field on ONUM_SESSION, so the owner gate needn't infer "seated" from seats; (2) S.hands (array of ids) for press if the queue ever stops being the hands list.
For MARS QA: reopen the same NPC within 22s (no stale lines); Esc / Done / walk-away (no ghost TALK.open); huddle styling; More toggle plus number keys; Ctrl+C/V in tkOwn, wire, hmSay and the desk; a press conference (hands row → callon → question waits); cabinet chair (Call on next); sitting gate (clicking a member while seated in a session shows a note and opens no talk).

## 20261030d — open-talk owner gate (JUPITER contract)
`window.onumTalkOwner` now: `SIT.on` → "sit"; `PROC.on` → "proc" (any phase); truthy `SSN` or `ONUM_SESSION.stage` not "idle" → "session"; prior sxdSession seated/floor/held/typing check kept as fallback. All cross-owner reads typeof/try-guarded. Presentation/guard only — ssnTick/hold/pass/callon untouched.

Boot fix (20261030d): 30a–30c shipped an entity-decoded main script (entity text in esc maps decoded by the GitHub MCP push transport → `"""`, 23 lines) → SyntaxError, boot stuck on "Building the chamber…". Rewrote all 23 entity literals as JS `\x26` escapes (e.g. `"\x26quot;"`) so the transport cannot decode them; all script blocks pass node --check; headless boot reaches past #boot. Never push an entity-decoded copy.

## 20261030g (NEPTUNE talk/desk presentation)
- Talk: labelled **More ▾ (n)** in the talk head (#tkMore) hides actions past the first four (exits + question answers always shown); panel lifts above Say aloud bar / wire strip (fitTalk), actions never shrink.
- One Esc closes talk even from a focused reply/wire input (capture-phase, only while talk open and no modal veil).
- Reply box + wire draft cleared on every closeTalk and fresh open.
- Floor desk: #sxDock.fd-on is a bottom band (left/right 8px, above hmBar, max ~20vh, row layout), not a right column.
- "Stops you" toast hides Talk while onumTalkOwner() is truthy.
- JUPITER engine untouched; onumTalkOwner unchanged.
