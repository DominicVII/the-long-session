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
