# Neptune handoff notes (for Claude Code) — One Nation, Under, ME.

Neptune owned: visuals, the visible world, offices' look, LiveTalk/voices, the Live status, session rendering (floor desk), family tree/portraits, update banner + build label, walking/render lag, Engine Room displays, style editor (barber/tailor).
JUPITER owns systems (procedure/clock, offices + ONUM_OFFICE_HISTORY, family sim, regions, Engine charter/audit, saves, powers, war). MARS owns QA + onumCandid. Don't edit another owner's systems; guard every cross-owner call.


## 20261110bt — fold MARS CODE soft FAILs S1–S5 on br (on br `8684961`)
- Only `brEasyCss` / `brEasyJs` changed (+ stamp). No engine/systems, no other Neptune blocks; `reactEmit` (JUPITER, bs) untouched.
- S1 `onumEasyUi.off()` is a full teardown: clears the 450ms tick + pending debounce, disconnects all 3 MutationObservers, removes the key/click listeners, undoes every Back-last move (journaled `{b, par, next}`, restored in reverse), strips `data-brn`, `.br-pri/.br-dng/.br-back`, `.br-v`, `.br-has/.br-open`, `#tkSay .br-long/.br-open`, restores any `title` it set, removes `#brSayRow` + `#brHint`, then `markPicks()` if it reordered. `on()` restarts idempotently. Boot with `onum.easyUi="0"` installs nothing (API still present so `on()` works live).
- S2 Esc targets `#apToast` only when it is really clickable (`apLive`: visible, `#prompt` not `.is-live`, pointer-events not none, opacity ≥ .5, Walk away not covered at its centre). With a live prompt Esc clicks the prompt's own Back with `preventDefault` only (no `stopImmediatePropagation`); otherwise nothing is swallowed.
- S3 `#brHint` z-index 10045 (above `#ndFd` 10040, below `#ndAuditBtn` 10049, modals 10050, `#clPanel`/`#tipCard` 100000+). Placement tries bottom-left (lifted over docks) → top-left → top-right → bottom-right; each spot must sit fully inside the viewport and off every option button (first pass also off panels); no clear spot = hidden. Hidden while `#pauseOverlay.is-open` or a 10050 modal is up.
- S4 `cut()` counts code points and slices by grapheme (`Intl.Segmenter`, `Array.from` fallback): no split surrogate or ZWJ emoji. Talk-box >140 test uses code points too.
- S5 `plain()` strips only real stage directions: `*…*` (not `**bold**`, not spans with digits / Option / Motion labels) and `[…]` / `(…)` whose inside is all-lowercase, digit-free, ≤6 words and starts with a known stage verb/adverb (sighs, pauses, leans in, quietly, applause…). "Option (1)", "(3) The motion carries", "[sic]", "[the Speaker]" stay. If stripping would leave nothing, the original line is kept.
- QA (box headless): node unit checks 18/18 (`/workspace/bt-work/unit.cjs`); page checks: off/on DOM byte-identical to pristine, 0 easy-UI mutations in 2s after off (game's own mutations ignored), reload with "0" clean; Esc with live prompt + dimmed toast → prompt Back, toast untouched, later listeners still see Esc; hint at 1024x600 inside viewport, off buttons, top-left when a 540px desk fills the bottom; desk lines with emoji at 139/140 cut cleanly. Boot error is still only the pre-existing `reactEmit` one.
- OPEN for MARS LIVE: real sitting with `#sxDock`-docked desk, corridor toast with live prompt, hint top-left over the HUD bar on short screens.

## 20261110br — easy UI + plain dialogue (Dominic: "pull common Ui from known games and simplify to easiest as well as dialogue") (on bq `0d76be2`)
- One new `<style id="brEasyCss">` + `<script id="brEasyJs">` before `</body>` in all 6 mirrors. Presentation only: no game data, engine text, simulation, 3D layout or JUPITER systems touched. bm `nlPromptFit`, bn `nnQolCss/Js`, bo/bq `boLookCss` (dual focus ring kept), bp amenDesk powers, cause->effect/G.baDesk/followUps, cabAsk callOn, catch-dwell, rolePowers untouched.
- Text sources are never rewritten: `#tkSay` and `#ndFd .fd-l .t` keep their exact text (cabPaint/dedupe/heckle code reads them). The simplified view is a sibling (`.br-v` on desk lines, CSS clamp + `#brSayRow` on the talk box).

| Pattern (borrowed from) | What br does |
|---|---|
| Bottom choice bar, big plain verbs (Pokémon / Persona / Fire Emblem) | Live `#prompt` buttons 14px, wrap cleanly; header clamps to 3 lines (hover/focus shows all) |
| Primary first, Back last (most JRPG menus) | In `#prompt .prompt__opts` and `#tkActs`, Back/Cancel/Leave it/Not now/Walk away move to the end (clicks still go by `data-gp`) |
| Color roles (Civ / Stardew / XCOM) | gold `.br-pri` = first safe choice; red `.br-dng` = veto/reject/resign/impeach/fire…, `talk__btn--risk`; slate `.br-back` = Back/Walk out. `#apToast` Talk gold, Walk away slate |
| Numbered shortcuts (Fallout / Mass Effect dialogue wheels) | Existing 1–9 `data-btn` badges are larger + gold. When the game shows no badges, docked choices (`#apToast`, then `#ndFd`, then `#sxDock`) get `data-brn` 1–9 and the number key clicks them (only if the game's own key handler did not take it; never while typing) |
| Name tag + dialogue box + next cue (Pokémon / Persona / Ace Attorney) | `#tkName` is a gold name plate; long `#tkSay` (>140 chars) clamps to 4 lines with "…more/less"; blinking ▶ cue (static if reduced-motion) |
| One idea per bubble, no stage clutter (visual novels) | Desk log lines: `*stage*`, `[stage]`, leading/trailing `(stage)` hidden from the visible line; one sentence up to ~140 chars + "…more"; click the line for the full text (full text stays in `.t` and the log) |
| Always-on controls hint (every console game) | `#brHint` bottom-left, context aware (walking / live prompt / talk / stopped-in-hall / desk / card / typing); lifts above whatever is docked bottom-left |
| Esc = Back (PC convention) | Esc clicks the visible Walk away on `#apToast`, or the Back/Walk out of the focused prompt/desk/dock. Talk, pause, PC desk and cards keep their own Esc; desk Cancel is never the Esc target |

- Disable (reversible): `localStorage.setItem("onum.easyUi","0")` then reload (or `onumEasyUi.off()` for this tab; `onumEasyUi.on()` re-enables). Default ON. All CSS is gated on `html.br-easy`.
- QA (box headless, :8817): boot clean apart from the pre-existing `reactEmit` ReferenceError (line ~52260, also on bq `0d76be2`, systems lane). Synthetic checks: prompt reorder + roles, toast numbering + Esc = Walk away, desk line clamp/…more/click-to-open, talk clamp + more toggle, off switch.
- OPEN for MARS LIVE: real sitting (desk lines, `#sxDock` numbering), talk box with a real NPC, `#apToast` in a corridor, hint placement over the docked desk strip.

## 20261104bq — fold MARS soft FAILs from bo (on bo `736b34b`)
- S1: boLookCss window-glow retargeted to real panels: `#pcScreen` (desk computer), `aside.dossier` (desk panes), plus `#ndFd`, `#ndSess`, `#sxDock`. Dropped dead `#office` (3D room key, no DOM id) and `#pzOffice` (settings button).
- S2: removed HUD button `#hmCab` from glow (no separate cabinet panel id exists).
- S3: stamp `20261104bq` (bo < bp lexical confusion).
- S5: unscoped `.fd-hands` focus rule dropped (kept `#ndFd .fd-hands`). S4: `#apToast` dual rules kept intentionally (outline + live background are different props).
- Untouched: dual focus ring, placards, bm/bn blocks, amenDesk/systems.

## 20261104bo — look punch + fold bn MARS LIVE soft notes (on JUPITER bp `056f287`)
- New `<style id="boLookCss">` after `nnQolJs` (bn/bm blocks `nlPromptFit`, `nnQolCss`/`nnQolJs` untouched).
- Window-glow: soft gold edge + inset ambient light on `#office`, `#pzOffice`, `#hmCab`, `#ndFd`, `#ndSess`, `#sxDock` (docked children get inset only). No layout changes.
- Soft placards: office/desk notes, `.fd-cue`, `.fd-top`, asides get letter-spacing .02em, line-height 1.45, cream `#e9dfc4`, muted gold bold.
- Focus ring (MARS soft FAIL "ring unclear"): 3px `#ffe08a` outline offset 2px + dark gap + 5px `#c9a24a` ring + gold halo on `#sxDock`/`#tkActs`/`.fd-hands`/prompt opts/`#apToast`; focused live option gets light gold fill.
- CSS only: bp powers (amenDesk/rolePowers/systems), cause→effect, G.baDesk, followUps, catch-dwell, cabAsk callOn untouched; bm fit + bn scroll unchanged.
- OPEN: LIVE heckle/PO → cabPaint (bn) still needs a sitting recheck by MARS; re-shoot focus ring at screenshot res.

## 20261104bc — fix MARS soft FAIL on bb: Call-on reply reaches the desk
- The later `cabAsk = async function(p,you,text,kind)` (20261022f block) replaced the bb `cabAsk(..., callOn)`. Re-wrapped it: it now takes `callOn`; on Call-on the LiveTalk reply is raced against 25s, and empty/timeout gives `cabFallback` (templated report) instead of returning silently. Also no-SSN + callOn paints the fallback.
- `cabShow` now calls `cabPaint` (desk `.fd-log` line + bubble via vhSay) instead of bare `vhSay`, so every cabinet reply/rebuttal paints the desk.
- Aside "rises to report…" on Call-on tap unchanged. az HUD CSS, JUPITER ay dwell / ba untouched. callVote/baHook not on main — not done. `#ltcLog` still not written (optional, later).

## 20261104az (was briefly labelled ay; JUPITER owns ay catch-dwell) — session UX, HUD presentation only (Dominic: "simpler sessions; prompts last seconds, I have to reclick")
- One CSS block `<style id="uxAyCss">` in the head of all 5 copies; no JS, no JUPITER systems touched.
- While `#prompt.is-live`: Notices dock (`#clDock`) and side transcript (`#clTx`) fold away; nameplates (`.plate`) dim to .25 and take no clicks, so the prompt is the one surface.
- Stable hit targets: `#prompt .prompt__btn` min 44px tall / 120px wide, 14px text, no transition; catch ticker line reserves a fixed 2.7em so text changes never move the buttons; catch prompt fixed width; live prompt opaque #0c0f13 with gold border.
- 44px minimum on session buttons too: `#ndSess`, `#ndFd`, `#sxDock`, `.fd-hands`, `#apToast`, `#sxParkBar`, `.talk__btn`, `#tkMore`, `#tkDone`.
- Findings left for JUPITER (owner): catch dwell 1.6–3.2s frame-counted (`catchDwellForDist`, dwell 168), `catchClear("ui")` on TALK.open/veil, setGlassPrompt/catchPaint rebuild, single-modal gate. Also seen: `#ndSess` render rebuilds its whole innerHTML on every clock tick (1s sig poll incl. S.clock) so vote/action buttons are swapped mid-press; "stops you" toast `apToast` auto-removes at 14000ms and `apTick` (4s) can replace it. A candidate JS patch for those (sticky toast + 60s idle, Esc, no swap; ndSess skip-if-same / defer while pressed) is parked at /workspace/neptune-qa-30ay/full-js-css-candidate.diff on the box, NOT shipped.
- QA: headless boot clean, stamp 20261104az, zero page errors.
- NEXT (later stamp, after JUPITER ships decision cause→effect): LiveTalk openers hook act stakes.
- NEXT (Neptune, MARS SESSION-FLOW sheet): paint the Call-on reply on the floor desk / LiveTalk strip immediately as text (no voice/Ollama dependency); Call on / Pass / Interject already get 44px via az CSS. JUPITER owns ba session-flow systems (vote/argue/fallback speech).
- Stamp history: ay = JUPITER catch-dwell (branch jupiter-ay-catch-dwell); this HUD work shipped as az. Two early commits on main (f97894b, 9e249bb) briefly said ay; superseded by az.

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

## 20261030h (NEPTUNE: desk really at the bottom)
- Root cause of 30g FAIL: onumHud layout() docks #sxDock as "R" with inline !important styles, which beat the #sxDock.fd-on stylesheet. layout() now routes #sxDock to the bottom band whenever it holds a visible #ndFd: full width (8px sides), max 20vh, bottom edge just above the topmost fixed bottom strip (wire / Say aloud bar). The bar is no longer squeezed sideways. Centre of view stays clear.
- Chairing: Pass / Interject / Call on next are always on the desk (greyed with a reason when they don't apply); press "Hands up" pick row kept. Action row now sits above the reply box so the band never clips it.
- Talk: reply box (#tkOwn) and head never shrink; only #tkActs scrolls (min 96px). Fixes More-open crushed reply box.
- 55px band under canvas: not reproduced headless at 1280x720 (canvas bottom meets the wire strip); no talk/desk CSS change found that resizes #scene.
- Headless: boot clears; press conference desk measured x8 y499 w1264 h144 at 1280x720 (bar top 677).
- JUPITER ssnTick/hold/pass/callon untouched.

## 20261030j (NEPTUNE): E while seated in press, Cancel/Speak clipped by the wire
- **Cancel/Speak clipped:** the docked #ndFd stacked top row, log, actions, reply box and Cancel/Speak, about 230px tall in a band of about 144px (20vh) with overflow hidden. At 1280×720 Cancel/Speak sat at y700–732, under THE WIRE (649–673) and the Say aloud bar. Fix: when docked, the desk is a flex column and the log shrinks first. The reply box and Cancel/Speak share one row (`.fd-reply`, built in deskTick). The band is now max(150px, 24vh). Now Cancel/Speak sit at y601–633, above the wire, with no dock scroll. Depth unchanged.
- **E while seated:** the keyboard E handler ran `seat && !personInTalkRange()`, so toggleSit stood you up even when focusThing was a person and the prompt said "Press E to speak with X". Fix: when you are seated and a person is in focus, E goes to openTalk. **Owner gate (JUPITER):** openTalk is then refused by onumTalkOwner()==="session". chairRoute needs the person in sxdSession().seats, but a press conference seats only "you", so the reporters never count. The desk shows "(You are in the sitting… take X aside.)". If the chair should talk to reporters, JUPITER needs to widen chairRoute to cover press people. Gate untouched.
- Smoke results in /workspace/tls/qa-30i/ (pre-*, post-*).

## 20261030n (NEPTUNE): walls / blocked props everywhere, first pass
- **Root cause:** `neptune/onum-furniture-fixes.js` (runtime fixes from neptune/FURNITURE-QA.md: office sofa missing, radiator blocking corridor/cloak back doorway, Senate desk+chair in the court doorway, visitor-office back-wall props through/behind the wall, House outer benches into side walls + in-wall ledges, radiators overlapping bookcases, Press TV 0.5 m off the wall) was never loaded by any HTML copy. Now loaded by the Neptune loader beside amenities in all 5 copies. Scene-only (moves/hides meshes); collision, room mesh/load paths and JUPITER systems untouched.
- Verified: headless 1280×720 boot, stamp 20261030n, `ONUM_FF.installed` true, zero page errors.
- **For JUPITER (o, collision):** colliders still follow PROPS data, so the moved House benches / visitor-office props / Senate chair may not match their new look; East Steps stickiness and NPC doorway slide-through not touched.
- **Punch list for o (look):** East Steps near-white facade, per-room screenshot sweep (MARS qa-walls), z-fight check on wall decals, pale top-left panel.

## 20261030p (NEPTUNE look, on JUPITER 20261030o cc39260)
Presentation only; no collision, room mesh/load paths, NPC placement or JUPITER systems touched. Patch script: /workspace/tls/qa-30p/patch_p.py; shots /workspace/tls/qa-30p/.
- **n verified (headless 1280x720, ONUM_FF.log):** office sofa added; Senate desk+chair out of the Court door; visitor office back-wall props pulled in 0.19 m. MARS verified Press TV, House radiator/benches, corridor radiator/bookcase.
- **East Steps near-white facade:** the stepsRich doorway, pilasters, reveals and plinths (0xd6cdb6/0xbfb69e/0xb9b09c/0xc9bfa8/0xe6dfcf), plaza paving 0xb7b3a8 and fountain 0xc3bfb4 now use sandstone tones to match the 20261012a facade.
- **Press grey desk slabs:** the 9 gallery desks are walnut (0x5a3b24/0x3b2716). Chairs are still grey.
- **Corridor glare / washed wall:** propSconce PointLight was 0.25 m off the plaster at 0.55, which left a white hot spot. It now stands 0.5 m off at 0.48. This is global to all sconces.
- **Union map (M):** header padded clear of the What's this / Notices chips. Bottom spacer so the last row clears the wire and Say aloud bar. Hover/focus outline, selected drop shadow, tooltip, role=button + tabindex. ★ on your state. A thin Federalist | Commonwealth bar shows the delegation you know, with a legend line.
- **War map (World):** each power is now a coastline shape with a shallow-water shelf and a faint graticule, not an ellipse. The shape is deterministic per key and the footprint and click targets are unchanged. Relation numbers rounded (were raw floats like -25.8448...), here and in the realm detail lines. viewBox padded (-40 -24 720 504) so edge nodes and labels are not clipped. Legend moved below Horn League. Sea blob runs to the frame.
- **Punch list (not done):** pink panel proud of the Senate Chamber door (corridor), source not located. Exec Wing door jagged/skewed (looks like shadow/aliasing). Pale top-left panel not seen this pass. Wall-decal z-fight not reproduced.
- **Not found:** the raw will.care float (86.80000000000001). No display site was located in the main script; it is likely a generic dump (Engine Room audit?). Whoever owns that panel should round it.
- **For JUPITER:** Exec Wing NPCs overlapping the right bookcase is NPC placement/collision.

## 20261030r — war map geography (MARS FAIL on p)
- `wmSVG`: blob ellipses replaced by authored per-power coastlines (`WM_SHAPE`, capes/bays/fjords) roughened by a seeded midpoint walk (fixed per key), scaled up so lands read as one continent split by straits. Salt Isles = archipelago (main isle + 3 islets); small offshore islets per power. Shallow-water shelf = wide soft stroke under each coast. Old faint gold/blue arcs and SE deep-water blob removed; depth soundings added. Land fill earthy (#4a4b3b, selected #6b5a2e); relation-colour coast stroke, labels, badges, centres (`WM_GEO`) and click targets unchanged.
- QA: /workspace/tls/qa-30r/{before,r}-war-map(-closeup).png; headless boot at 20261030r, zero page errors, `[data-wm=isles]` click selects.
- Not done in r: pink Senate door panel, jagged Exec Wing door aliasing, will.care float formatting.

## 20261030s — meeting panel: complete close + side tab (Point of order no longer covers the floor)
- New `sxParkTick` (after `sxDockTick`): a ⇥ / ✕ pair sits on the top-right corner of `#sxDock` (the one meeting frame: session view with Point of order, floor desk `.fd-ij` Interject, sitting card). ⇥ parks it as a vertical tab on the right edge (titled with the meeting); ✕ closes it completely, leaving a small ⚖ edge tab. Clicking the tab brings the whole panel back with every action. A new meeting (session kind/body key change) opens it again.
- Presentation only: hidden by class `.sx-park` (display:none), nothing torn down, no ONUM_SESSION/callon change. Opaque black/gold controls.
- QA: /workspace/tls/qa-30s/s-meeting-{open,parked,restored,closed,reopened}.png on a live House floor sitting; zero page errors.
- War map (MARS FAIL on r: islands, not a continent): `wmSVG` now draws ONE mainland (`MAIN`, roughened); each power is its Voronoi share of it (`cellOf`, centres = `WM_GEO`, unchanged), borders are narrow straits with shared seeded rough edges, relation-coloured rims inside each coast. Salt Isles = 5-island chain off the SE coast (transparent r64 hit circle). Relation lines now drawn over the land as mid-segments (0.3–0.72) clear of labels. Shots: qa-30s/s-war-map(-closeup).png. Known: rivalry dashed lines are under the land now (only visible across water, e.g. Horn–Isles).
- Still open: pink Senate door panel, jagged Exec Wing door, will.care float display.

## 20261030t — look gaps
- Pink Senate door panel: it was the corridor fire cabinet (`corridor rich`, crimson box + glass + brass) placed at `d - 4.4`, exactly the Senate door (0.85 d) on the same wall. Moved to `d - 6.4`, deeper red 0x5e1518. Shots qa-30t/{before,after}-corridor-senate-door.png.
- will.care float: the Engine's wants (`G.eng.eco.will`) climb by +0.04/+0.5 and dumped as 86.80000000000001. A 2 s interval keeps them at two decimals (no behaviour change). No in-game HUD prints the raw number (cards use words / Math.round).
- War map: rival dashed lines now drawn over the land as 0.3–0.7 mid-segments (brighter #c9a2e0), with the capital relation lines.
- Jagged Exec Wing door: not reproduced in headless shots (qa-30t/{before,after}-corridor-exec-door.png, exec-inside-door.png); left unchanged. Needs a MARS shot/angle if still seen.
- Seen in QA, not fixed: war-map capital name label sometimes blank (wmHome().short) on some generated countries.

## 20261030u — graphical/realism pass (look only)
- Jagged doors: root cause was sub-native pixel ratio (0.85 on modest machines, antialias off there). `setPR` now floors at 1x on Best anywhere and Balanced on full GPUs. Simple unchanged.
- Realism: flat-colour PBR materials (wood, stone, leather, paint) now carry their procedural roughness map, plus normal relief on tier 2. Matte surfaces get the room env light at low strength (soft falloff/sheen, less toy-flat). Skin pore normal 0.25→0.34.
- War map: home short name trimmed, never blank.
- No collide data, props, or JUPITER systems touched. Shots: /workspace/tls/qa-30u (before-/after-*, cmp.jpg).
- Gaps: Capitol/East Steps columns still read pure white (no sandstone tint yet); normal relief is not shown on modest (tier 1) machines; corridor sconce glare not retuned; NPC cloth not retextured.

## 20261030v — realism pass 2 (look only)
- Stone: flat-colour whites (rough >= 0.5, non-metal) become sandstone/limewash with stone grain; flat greys get slight warmth + stone grain. Runtime pass `nmPeoplePass` (2.5 s, once per material) also tints the District / VISTA-GATES bare-white meshes to sandstone with stone maps, and `onum:limestone` from pure white to #e0c9a2. Gate arch at East Steps now reads as grained sandstone (qa-30v/fogcmp.jpg).
- Cloth: game cloth roughness >= 0.9, weave normal 0.35→0.55, crease roughness map now on modest machines too, soft env sheen 0.16. Character-module suits (flat colour + weave normal + ORM) get weave x1.35 and sheen 0.14.
- Skin: warmer under-skin emissive (subsurface stand-in) and roughness ≥ 0.6 (less wax) on nmSkin and onumc:skin/headskin.
- Sconces: emissive 1.0/0.72 → 0.62/0.48, amber 0xf2b872; sconce point light 0.48→0.42 warmer.
- Gaps: faces only subtly changed (no real SSS shader); corridor marble pillars kept (textured marble, untouched); outdoor sky/fog colour varies run to run so wide outdoor before/after are not like-for-like; perf of the 2.5 s traverse is unmeasured on a real modest machine.

## 20261030w — realism pass 3 + Exec door (look only)
- Exec Wing "jagged" door: root cause found. Skirting, dado and chair-rail bands (`band()` in the shell builder) ran straight through every door opening; the rail stood proud across the leaf and met the jambs in a sawtooth. Bands below the door head now stop at the jambs of every door on their wall (positions from `doorAt`). Door leaf widened dw-0.08 → dw-0.012 (no blue-black slot each side), leaf roughness .55 → .74 (no hot mirror spot). Trim/leaf meshes only; no collide data.
- Plants (`propPlant`): matte faceted leaf material (roughness 1, no env, canvas leaf texture, 4 colour variants) + 7 leaf sprigs for a leafy silhouette. No footprint change.
- Cloth: room-distance twill/fold map (`w30Cloth`, repeat 7) on character-module suits, weave normal x2, game wool/twill textures doubled contrast, matCloth normal 0.85.
- Skin: mottle/blush/pore map (`w30Skin`) on onumc:skin, roughness ≥ 0.68, pore normal x2, warmer under-skin emissive, env ≤ 0.12.
- District gate / bare whites: coursed, mottled sandstone canvas map (`w30Sand`) + stone normal 1.0.
- Sconces: amber frosted glass (color 0xd99a52, emissive 0xff9a3c).
- Shots: /workspace/tls/qa-30w (before = v, after = w; cmp.jpg, cmp-people.jpg).
- Gaps for x: faces still read smooth at mid distance (map is mottle, not geometry); the bright globe in front of the Exec inner door is a lamp, untouched; plants in onum-office-amenities not converted; textured marble corridor pillars untouched.

## 20261030x — faces past mask, leaf cards, Exec globe, marble, gate courses

- **Faces (MARS hard FAIL on w):** the flat warm emissive was the mask. Skin emissive cut to ~0.05; warmth now lives in a skin shader (`x30SkinShader`, onBeforeCompile on `onumc:skin|headskin`): red bleed into the shadow side, grazing-angle form falloff, peach-fuzz rim. Head normalScale ×4 (pores/relief read at mid-shot), roughness 0.56 oily sheen, slight saturation/darken. Faces now model in light at Senate mid-shot.
- **Plants:** alpha-cut frond leaf cards (`x30FrondTex/Mat`, 9 MODEST / 13 full) arching from the pot; core spheres shrunk and darkened. Every machine, not Best only.
- **Exec inner-door globe:** was the clearcoat (0.8) highlight of `onum:wood_panel` (onum-materials). Now satin: clearcoat ≤0.18, ccRough ≥0.55, env ≤0.45. Room fill moved off the door wall (R.d*0.42) and warmed to amber 0xffd9ae. Door leaf rough .86.
- **Marble pillars:** `x30MarbleMat` — mottle, veins, grain canvas over TEX.marble, stone normal 0.55, rough 0.4, env 0.45.
- **District gate:** sand map courses bold (3.2px mortar) with per-block tone.
- **Sconces:** bowl emissive 0.78→0.46 (exterior/Capitol glare).
- Amenities module has no plants; office plants are `propPlant` → covered.
- Gaps for y: faces still stylised geometry (no lids/lip mesh detail); skin hue a touch orange under amber fill; exterior Capitol blowout only partly addressed (exposure); gate still one sand map for all blocks.

## 20261030y — skin microdetail, de-orange, exterior exposure, gate = Capitol sandstone

- **Skin:** shader now also injects at `map_fragment` (head skin, USE_MAP): per-texel pore darkening (~18% of texels −14%), low-frequency capillary mottle (rosy/olive), 14% desaturation with a slight cool shift. Albedo hue nudged to rose (h −0.012, s ×0.80 — was ×1.12 on x). Shadow bleed tint more crimson, less orange. Program key `y30skin`.
- **Exterior exposure:** `toneMappingExposure ×0.84` when `R.open` (outdoor rooms).
- **District gate:** bare-white stone now lerps to the Capitol limestone #e0c9a2 (0.62) instead of 0xd2b48a, so gate and Capitol columns share one sandstone; bold courses from x kept.
- **Sconce decor bowls:** emissive 0.6→0.42.
- Gaps for z: no eyelid/lip/ear geometry (needs onum-characters.js head edit + bundle regen); gate vs Capitol not yet shot in one frame; plant fronds good, could add second leaf species.

## 20261030z — face geometry readable at mid-shot

Edited `neptune/onum-characters.js` and mirrored the identical 13 literal edits into the generated `neptune/onum-neptune.js` (file:// bundle; no build tool in repo, so hand-regenerated, parity checked 13/13):
- Eyes: eyeball r 0.0118→0.0127, iris 0.0057→0.0063, eye set 0.7 mm deeper; lids 0.01265→0.0136 shells; lash line 0.00075→0.0013 (upper), 0.0004→0.0006 (lower); crease 0.0134→0.0144, thicker.
- Brows thicker (0.0022/0.0031 → 0.0029/0.0041).
- Lips: colour mix toward lip red 0.36/0.26 → 0.50/0.40; lip height +18%, depth +5%; mouth line 0.019×0.0015 → 0.021×0.0024.
- Ears: rim tube 0.0045→0.0058.
- Skin pore shader softened (0.86→0.92) — y's pore grid read as a texture pattern at mid-shot.
Verdict: lids, lash line, lips and ears now read at Senate mid-shot. Faces still stylised (head shapes/proportions, hair blocks) — not yet past the human bar.
- Folded MARS x notes: plant cane thinner (0.016) and fronds start lower to hide the junction; gate mortar 4.6 px, darker.
- Not done (gaps): East Steps bronze ball-on-post not located; HUD stamp garble ("hst1d …") not reproduced; gate vs Capitol not yet one-frame; frond blades still alpha-aliased on MODEST (no AA); core ball still visible close up.

## 20261030aa — head reshape (module + hand-synced bundle, 10/10 edits each)
- Head mesh density: low 28×20→48×36, med 40×30→60×46, high 56×42→76×58 (hair shells follow, +8). The faceted "wedge" nose was mostly undersampling on low.
- Nose: bridge 18% wider, projection 0.135→0.112, rounder bigger tip (0.04/0.065→0.052/0.085).
- Jaw: lower-face squaring 0.22/0.13 → 0.14/0.08 (rounder, less doll block); cheekbones 0.05→0.06.
- Collar: torus tube 0.009→0.0065, 6×20→10×32 segments (soft, not a hard ring).
- Plants: core sphere shrunk to sit inside the frond crown.
- Verdict: smoother silhouettes and nose at Senate mid-shot, but still reads stylised/game doll. Still MISSES the room-distance human bar.
- Gaps for ab: hair is a shell (needs strand cards/alpha fringe), eye/brow proportions, skin albedo still flat at distance, neck/collar transition; East Steps bronze ball-on-post and HUD stamp garble not found; gate vs Capitol one-frame not done.

## 20261030ab
- Hair: strand cards (alpha-tested canvas strand texture, 36/56/84 cards by style/tier) over the shell on ALL tiers; fringe reads cut-out. Gap: cards read spiky/pale; shell still glossy underneath.
- Skin: low-frequency distant mottle in map_fragment (no pore grid revival).
- Plants: ball core removed entirely (fronds only).
- Gaps: eye/brow proportions, neck-collar join, East Steps bronze ball, HUD hst1d (not reproduced). Room-distance faces still MISS -> ac.

## 20261030ac
- Eyes: iris 0.0063->0.0076, pupil 0.0022->0.0029, lashes ~2x thicker. Brows ~1.6x thicker, 55% darker than hair.
- Hair: cards lie flat (lift 0.06-0.18 rad, was 0.35-0.75), wider, darker strand tint, roughness .88; shell roughness .9 (de-gloss).
- Skin: saturation x0.66 (was 0.80), hue -0.02; grazing-edge darkening stronger (0.58/0.52/0.52), shadow SSS warmth reduced.
- Collar: thicker soft roll (tube 0.011) over the neck join.
- Verdict: still MISS at room distance (crown card tips stick up, skin still warm/pink, neck still plain) -> ad.

## 20261030ad
- Head albedo (headskin3): painted eye sockets, under-brow, cheek hollow, temple and under-jaw shade.
- Irises 45% darker. Neck uses its own skin material at 0.8x (jaw shadow). Crown strand cards (ny>0.72) are 0.45x length.
- Runtime skin: saturation x0.54, hue -0.025, lightness x0.9 (cooler, darker).
- QA: front-on Senate shots at 7 m and 4 m (qa-30ad/after-senate-front7/4). Eyes, brows and nose now read on the near face; the low-poly stylised silhouette still reads toy -> ae.

## 20261030ae
- Head albedo (headskin4): painted brow band, lash line, nose-side, under-nose, lip line and under-lip shadow, so features survive every LOD tier at 6-10 m.
- Asymmetry roughly doubled (eye, brow, nose, cheek, mouth offsets).
- Hair cards: source-atop gradient (dark roots, anisotropic sheen band at ~30%, darker tips).
- Skin shader: key/fill contrast (x0.78 shade to x1.1 lit) plus a soft cool rim on lit edges. Skin only, so sconces and the Capitol are untouched.
- QA: qa-30ae (+ backup /workspace/neptune-qa-30ae): front7, front4, floor9, person-mid/close, cmp vs ad. Eyes and brows now read on faces across the floor; bodies, heads and hands are still low-poly figurines -> af.

## 20261030af
- Head geometry: low tier 48x36 -> 62x48, med 60x46 -> 72x56. headShape adds jaw-angle volume, side-cheek volume and a nasolabial crease (a face silhouette, not an egg).
- Crease occlusion in head albedo (headskin5): inner eye corners, nasolabial, under chin.
- Skin shader: fixed view-space key direction (upper camera-left) with a 0.7 shadow side to 1.12 lit side. Skin only, so sconces and sandstone are untouched.
- Not done: shoulder slope and hands (torso/hand geometry untouched). AO is painted plus shaded, not true screen-space AO.
- QA: qa-30af (+ backup /workspace/neptune-qa-30af).

## 20261030ag
- Torso: shoulder pad tapers off from y .44 to .50, so shoulders slope (shirt and jacket). Male waist narrower (taper). Deltoid ball flatter and lower; arms angled 0.1 rad.
- Hands: fingers and thumb on every quality tier (low too), shown at LOD 0-1 (under 10 m) via faceFine. No more mitts across the rug.
- Cloth: x30ClothShader on the wool/cloth pass: world-space room key (0.66 shade to 1.1 lit) plus UV fold creases (cache key ag30cloth).
- Skin key moved from view space to world space (same room key direction as cloth).
- Not done: real shadow maps on people, hair-cap edge break.
- QA: qa-30ag (+ backup /workspace/neptune-qa-30ag).
- ag (MARS af folds): tiled w30Cloth suit map dropped (camo), so folds come from the shader on USE_UV. Light hair shells and fuzz are 0.78x, which breaks far white domes. Collar ring bigger and higher (r .06, y .514) over the neck join. Painted brow and lash marks stronger (0.66 / 0.6) for far rows.

## 20261030ah
- Stance varies per person, seeded from S.phase. Standing idle gets a weight shift (hip x and roll, opposite torso roll), slouch or upright, chest width ±5%, head tilt and turn, and different arm rests (shoulder spread and elbow bend).
- A soft radial contact shadow sits under every character (`onumc-contact`, basic material, no depth write, at every LOD).
- The hair shell outline is broken up with seeded radial noise: 3 mm on short cuts, 11 mm otherwise. The cards follow it. This removes the smooth domes.
- Skin gets micro and mid-scale normal bump on USE_MAP, and specular is cut to 0.55 direct / 0.65 indirect so it looks less plastic.
- Everything from ag is kept.
- MARS ag folds: fingers are 1.28x thicker and 1.08x longer. Cloth fold crease goes 0.16 -> 0.3, plus a tight elbow/waist bunching band (0.22). Painted brow and lash weights are now 0.8 / 0.72. QA adds face-front2..5 at 2.2 m along each NPC's facing.
- Verdict: FAIL, still reads as a diorama. Next is ai.

## 20261030ai
- Body segments go up from 14 to 20 (low) and from 20 to 24 (med), giving rounder silhouettes at 6–30 m.
- Bodies get a harder world-space key (x0.5 to x1.18), part-edge AO (x0.7 at grazing angles) and a warm rim light on the key side. All of this is in x30ClothShader, so the lamps are untouched.
- Idle motion adds a slow hip sway, a torso yaw drift, deeper breathing and a head fidget, each seeded per person.
- The QA face-front cams now look for the onum head under the NPC and read its world facing. It is still unreliable: face-front2 still lands on the back of a distant NPC.
- Verdict: FAIL, next is aj.

## 20261030aj
- Contact shadows are darker and larger: the radial core goes 0.6 -> 0.88 alpha, with a 0.62 mid stop and a 0.26 outer stop. Scale goes 0.78x0.6 -> 1.05x0.85, cache key contactmat2.
- Fold geometry: three torus fold rings per arm (above the elbow, below the elbow, and wrist bunching above the cuff), on top of the shader creases.
- Fingers: 1.5x thick and 1.1x long. They splay (rotation x (k-1.5)*0.09) and are spaced 1.12x, so they read as separate digit volumes.
- Brows: tube geometry is 1.4x thicker. Painted brow and lash weights go 0.8/0.72 -> 1.0/0.9.
- Lighting: the body key in x30ClothShader goes 0.5..1.18 -> 0.4..1.26 (cache aj30cloth). The skin key goes 0.7..1.12 -> 0.58..1.2. People only, so sconces and the Capitol are untouched.
- QA face-front cams now find the nearest onum root and aim at the eye midpoint (pupil/iris meshes) from the head centre. The ai head-direction read was the fallback.
- QA: qa-30aj (+ backup /workspace/neptune-qa-30aj).
- QA: the Senate floor is populated (floor9 shows about 30 NPCs) and all four face-front cams locked on by the eyes (face-front2..5).
- Verdict: FAIL. Faces read better and fingers and folds now show, but the bodies are still stiff, clay-like figurines with helmet hair at 6–10 m. Next is ak: hair mass (cards to volume), skin AO under the brow, nose, hairline and chin, attached cuffs and torso taper, and a stronger rim.

## 20261030ak
- Hair reads as a mass. The fine shard noise is cut (0.011 -> 0.004), a soft low-frequency lobe adds 0.016, and back/nape fullness adds 0.03 to blend into the neck. Strand cards drop 84/56/36 -> 50/34/22 and are wider clumps.
- Skin AO (headskin6): stronger socket, under-brow and crease weights, plus a hairline shadow, a nose-side/under-nose shadow and a deeper under-chin shadow.
- Torso: waist taper (-6% at y .14) and chest fill (+3.5% at y .38) in ring(). Shoulder balls are rounder (1.04/0.8/1.05).
- Cuffs (cuff2) are wider and tapered (r .036 -> .033) and hug the sleeve end, so there is no floating ring.
- Body rim in x30ClothShader: a warm key-side rim (0.4) plus a cool back rim. People only (cache key ak30cloth).
- QA: qa-30ak (+ backup /workspace/neptune-qa-30ak). The Senate floor is populated and face-front2..5 locked on by the eyes. Contact shadows are still faint on the red rug in floor9. Idle sway can't be judged from stills.
- Verdict: FAIL. Heads are fuller and shoulders rounder, but faces still read as carved and bodies as stiff figurines at 6–10 m. Next is al.
- MARS aj -> al (on top of ak). Faces still look like clay at rug distance; eyes and brows only read at about 2 m. Hair still reads as helmet shells. Bodies look stiff, and the cuff rings and splayed fingers read as diorama parts. Foot blobs are only partial on floor9. Idle can't be shown in stills, so al needs a short frame-sequence or GIF capture. Senate population and face-front eye lock PASS; keep both.
- al plan: an additive dark contact decal (multiply blend, 1.4 m footprint, near-black core) that reads on the red rug; much larger painted eye-socket and brow marks scaled for 8 m (or an LOD impostor feature boost); hair silhouette from an inflated soft hull, not cards; drop the fold torus rings for sleeve-taper geometry; curl the fingers into a relaxed hand, not splayed; multi-frame QA for idle.

## 20261030al
- Contact shadows (contactmat3): near-black core (0.97/0.85/0.42) at 1.45x1.2.
- Eyes and brows at 8 m: the painted brow band is wider (0.032 -> 0.05) and the lash/eye band too (0.022 -> 0.038). New dark eye-socket mass (0.35), weights 1.15/1.05. Brow tubes are 1.9x thick.
- Hair: strand cards are now near-LOD only (faceFine). At mid-far range the silhouette is the soft lobed mass, with the lobe amplitude raised 0.016 -> 0.026.
- Sleeves: the aj torus fold rings are removed. The upper arm and forearm are tapered (0.062 -> 0.041, 0.047 -> 0.031). The cuff sits flush on the wrist (r .0325/.031 at y -0.25).
- Fingers are relaxed and curled (rest x -0.35-0.12k, idle -0.55-0.1k), not splayed, at 1.32x thick.
- Cloth (al30cloth): vertical drape folds, heavier toward the hem, plus a hem weight shadow.
- QA: qa-30al (+ backup /workspace/neptune-qa-30al). The Senate floor is populated and face-front2..5 locked on by the eyes. idle-f0..f2 are three frames 450 ms apart: about 7.5k pixels change in the person band. That shows motion, but walkers could account for it as well as idle.
- Verdict: FAIL. Contact shadows are still hard to see on the red rug from 9 m, because the rug's own darkness masks them. Bodies still read as figurines. Next is am: a screen-space or AO pass, rug-relative contact shadows (lighten the ring around them), and higher-poly heads at mid LOD.

## 20261030am
- Contact shadows (contactmat4): the dark core (0.97/0.88/0.5) now has a warm halo ring (rgba 255,226,196 at 0.28 -> 0.12), so the shadow reads against the dark red rug. Material colour is now white so the halo stays warm.
- AO pass: directional ambient occlusion on skin (y30skin) and on bodies (am30cloth). World-down-facing normals fall to 0.55, so under the chin, under the arms, the jacket underside and the brow underside go into shade at every distance.
- Mid-range heads: head grid goes low 62x48 -> 84x64, med 72x56 -> 92x70, high 76x58 -> 100x76.
- Idle QA: picks a standing NPC (no tx/tz target) and hides other onum roots, then takes 3 frames 450 ms apart. 26 roots were hidden, but two figures were still in frame (they are not onum roots). Diff is 4.5k px in the person band. Idle is still not proven on its own.
- Verdict: FAIL. The contact halo shows on floor9 near the camera. Faces and bodies still read as figurines at 6–10 m. Next is an: a cheap screen-space AO post pass, a non-onum figure hide for idle, a standalone idle diff around the projected head bbox, and real cloth silhouette breakup (jacket hem flare, trouser break).

## 20261030an
- Jacket hem flares off the hips (hem ring w x1.15+0.026, d x1.12+0.022; geo key jacketF).
- Trousers break at the shoe: the shin's bottom radius goes 0.052 -> 0.066 (geo key shinB).
- Screen-space AO: NOT done. The game renders with a bare renderer.render(scene, camera): no EffectComposer, no depth target. Real SSAO means changing the shared main render loop, which is outside NEPTUNE's ownership, so it needs a JUPITER/owner call. Until then, am's under-form shading stands in.
- Idle QA: the hide now covers onum roots and every everyone() figure object. The diff is measured only inside the target NPC's projected head-to-feet box.
- Idle result: 48 figures were hidden and only the target stayed in frame. Within the target's body box (160x105 px), f0->f1 changed 0 px and f0->f2 changed 160 px (about 1%). The sway is real but too small to read on screen at that distance. ao should double the hip/torso sway amplitude.
- Contact at mid/far is not changed in an (the ring only reads near the camera).
- Verdict: FAIL. Next is ao: an owner call on SSAO in the main render loop, distance-scaled contact shadows, bigger idle amplitude, and face planes.

## 20261030ao (on an b47c69c)
- Contact shadow grows with camera distance (per-mesh onBeforeRender, x1 at <=3.5 m up to x2.4 at >=10.5 m) so it reads mid/far on the rug. No main-loop change.
- Idle sway doubled (hip shift/roll, torso roll/pitch/yaw).
- Face planes: side-of-face and under-cheekbone plane darkening in head skin (cache key headskin7).
- Kept all an/am gains. SSAO NOT touched (JUPITER owns ap).
- QA: /workspace/neptune-qa-30ao -> qa-30ao, cmp-*-an-vs-ao. Idle target-only (48 hidden): body-box change 7.9% f0->f1, 14.5% f0->f2 (was 0%/~1% in an), but the target's projected anchor also drifted ~57 px, so part of that is the NPC moving, not just sway.
- Verdict: FAIL. Floor still reads as figurines at 6-10 m. Next Neptune stamp: aq (ap left for JUPITER).

## 20261030aq (on ao 3f44f4b; ap = JUPITER SSAO, local-only at time of writing)
- Geometric face planes in headShape: cheekbones 0.06->0.095, flat side-of-face plane, brow ridge, deeper sockets.
- Darker far contact: second solid-core material (contactmatF) swapped in when distance scale k > 1.3; near keeps warm ring.
- Posture variety: per-person static lean/hip yaw/torso yaw from phase seed (on top of 2x sway).
- Idle QA pinned: target tx/tz/x/z held each frame, camera set once and allowed to settle. f0->f1 anchor identical (640,379,813 both): 12.3% body-box change = real sway. f2 camera moved again (15.9%, not used).
- QA rendered with JUPITER's local ap SSAO + aq chars. SSAO shows heavy grainy speckle over walls/faces - flag for JUPITER.
- HTML/onum-build stamp aq HELD until ap lands on remote main (no stomping JUPITER's render-loop files).
- Verdict: FAIL. Still figurine read at 6-10 m. Next Neptune: ar.

## 20261030ar (on aq stamp e63c122; ap SSAO still box-local for JUPITER)
- aq stamp finished on remote (5 HTML + onum-build, stamp-only, no SSAO files touched).
- Face geo pushed: cheekbones 0.12, side plane 0.06, brow ridge 0.036, sockets 0.042; side/cheek paint plane 0.4.
- Silhouette: posture variety up (lean 0.12, hip yaw 0.22, torso yaw 0.18, extra hip shift).
- Far contact: grows to 2.8x, solid-core material from k>1.15, outer stop 0.88 (contactmatF2).
- QA clean (remote HTML, no ap SSAO grain). Pinned idle anchor stable over all 3 frames: 5.0% f0->f1, 17.1% f0->f2.
- Verdict: FAIL — still figurine read at 6-10 m. Next Neptune: as.

## 20261030as (on ar 39d93e5; ap SSAO still box-local for JUPITER)
- Structural, not number nudges:
  - Per-person head size (0.88-1.12) and shape (x 0.9-1.06, y 0.93-1.09) on headPivot; shoulder/body width 0.86-1.16.
  - vC(): hair value pushed 30% away from mid; suit/uniform value pushed 6-30% per person (dark darker, light lighter).
  - Nose projection 0.112 -> 0.14; ears 1.15x1.6 larger and turned 1.35 -> 1.1 rad so they read from the front.
  - Facing variety: standing rig yaw up to +-0.55 rad per person.
- Kept all ar/aq/ao gains. No render-loop/SSAO edits.
- QA (remote HTML, no SSAO): eye lock 4/4, pinned idle anchor stable, 8.9% f0->f1. cmp-*-ar-vs-as in qa-30as.
- Verdict: FAIL - visible variety, still figurine read at 6-10 m. Next Neptune: at.

## 20261030at (on as a1ec5cd; ap SSAO still box-local for JUPITER)
- Skin: body skin roughness 0.52 -> 0.4, normal 0.06 -> 0.14; head skin roughness 1 -> 0.8 (sheen); per-person skin tint (rose/olive/umber, 12%).
- Cloth: wool normalScale 2.2, AO map intensity 1.0 (fabric weave reads).
- Motion: ~40% of standing figures get periodic idle talk gestures (right arm); idle head turns up to 0.45 rad.
- Silhouette: ~36% carry a folder/papers in the left hand (manila/black/white), arm posed 'folder' when not carrying.
- Eyes/brows: brow material 0.55 -> 0.78 toward black.
- No render-loop/SSAO edits. QA clean (no ap): eye lock 4/4, pinned idle 9.3% f0->f1. cmp-*-as-vs-at in qa-30at.
- Verdict: FAIL - livelier, still figurine read at 6-10 m. Next Neptune: au.

## 20261030au (on at 3175ca4)
- Brighter sclera (eyeW 0xeee8e0); brow tube mass x2.3 (was 1.9).
- Resting finger curl -0.62 - 0.16*k (no mitts); rest elbow bend -0.3.
- Jacket collar roll (half torus behind neck); jacket sleeve hem ring thicker than shirt cuff.
- Trouser crease strips on thigh + shin; dark sole/welt box under men's shoes (foot contact).
- Neptune visuals only; no main render loop / SSAO edits (JUPITER ap).
- QA /workspace/neptune-qa-30au (copy qa-30au/): stamp 20261030au, no errors, idle pin 6.7% f0-f1. cmp-*-at-vs-au.png.
- Verdict: **FAIL** - floor still reads figurine/diorama at 6-10 m. Not done: hair part line/crown contrast, seated mix (scene-driven), weight shift, face AO/SSS. Next: **av**.

## 20261030av (on au 287616c): skin and looks
Headless close-ups (Senate floor, 0.6 m faces and 3.2 m bodies) showed what actually read as figurine. It was not the geometry. The surfaces stacked up: pore normals ran about 4x (0.12 module x 4.0 game pass, plus the shader micro-bump), skin was desaturated to 54% and every tone went the same muddy red-brown, nearly everyone had white hair (age grey ramp mixed to 0xc8c4bc, then vC pushed light values toward 0xf4f0e8), brows were black caterpillars, shirts and light suits were zebra-striped wool, and every figure stood on a black disc with a halo that grew to 4 m wide.
- Skin (module): head pore normal 0.8 -> 0.42, mottle 0.06 -> 0.04, painted plane/AO shading kept at 72% strength (ysv), painted brow/lash bands 1.15/1.05 -> 0.78/0.9; body skin normal 0.14 -> 0.07. Cache key headskin8.
- Skin (game pass, all 5 HTML): normal multiplier 4.0/2.2 -> 1.6/1.4; HSL s x0.54 l x0.9 -> s x0.82 l x0.96 (tones stay apart); albedo pore step 0.92 -> 0.97; micro-bump 0.08/0.05 -> 0.025/0.02; desaturation 0.86 -> 0.94; grazing darkening, key multiply and directional AO softened (0.58 -> 0.8, 0.58 -> 0.72, 0.55 -> 0.68). Body speckle alpha halved. Program key y30skin2.
- Hair: an explicit look.hair colour now stands (auto-grey x0.3), greying starts later (a01 0.5) and goes to pewter 0x9c978e, not white. vC pushes light values only 40% as far, toward 0xd6d0c4. Strand cards are combed (back over the crown, down the sides), longer than wide (w 0.028-0.044), lie flatter, shorter at the temples. Card sheen 0.22 -> 0.12.
- Brows: tube x2.3 -> x1.3, colour 78% -> 55% toward black.
- Cloth: wool normal 2.2 -> 1.2 (game pass x2.0 -> x1.3), AO map 1.0 -> 0.55. Shirts get their own smooth cotton (normal 0.35, AO 0.2).
- Contact shadow: soft footprint 0.95 x 0.8 m, core 0.6 alpha, no halo, grows at most 1.3x with distance, single material (contactmat5).
- QA: QA ran in headless swiftshader. It boots past onboarding, enters the Senate, and the camera tracks a figure (scene.onBeforeRender). No page errors; all 5 inline scripts pass node --check. Smooth skin, distinct tones and varied hair colours are confirmed in the close-ups.
- Left: light shirts still show faint fold stripes from x30ClothShader; side hair cards can still fan on long styles; brow tubes on grey-haired men are still broad at 0.6 m.

## 20261030aw (on av): stripes, splotchy skin, hands and legs
Dominic's screenshot of the East Steps (build au) showed a woman in a white blouse and an olive skirt with wavy zebra lines, a reddish-brown splotchy face, dark oversized hands and orange-tan legs.
- The zebra lines were not a texture. They were x30ClothShader's procedural "drape folds" (sine bands that darkened cloth by up to 30%, plus 22% and 24% bands). Those are cut to 5% / 0 / 7%, the hem shadow goes 0.78 -> 0.9, the cloth key 0.4-1.26 -> 0.62-1.15 and the cloth AO 0.55 -> 0.7. Program key aw30cloth.
- Skin shader: the capillary mottle (ym) and the warm/cool patchwork (yz) were large red and grey blotches. Both are now near-flat. Red shadow bleed is halved, skin roughness goes 0.56 -> 0.68 (matte, not plastic), and the program key is y30skin3.
- Body skin map (w30Skin) blotches are cut to about a third, so hands and necks match the face.
- Legs: hose used lin() (the cloth colour path) and came out orange-tan. It now uses linSkin with a 15% sheer tint (hose2).
- deepenSkin: green/blue exponents +0.12/+0.16 -> +0.09/+0.12, so light tones are less orange.
- Fingers 1.32x1.25 -> 1.1x1.06 thick.
- QA: headless Senate close-ups are clean (shirts white, no stripes, even matte skin across tones). No page errors.

## 20261030ax (on aw): tailoring, hair that lies on the head, bundle regenerated
Dominic: "Max code and graphical design."
- **Shirt V, lapels, tie (the big one):** the old shirt front was a solid loft pushed through the jacket, so its edge was torn and sawtoothed and the lapels were two flat boxes. A new `surfPatch()` (with `loftAt` and `frontPoint`) lays a patch on the jacket loft's own superellipse surface, lifted along the normal. It never cuts the cloth. From it come the shirt V (`axV*`), a lapel on each side a shade darker than the jacket (they widen to the notch and roll into the collar), and a tie that lies on the shirt with a tapered four-in-hand knot. Buttons ride the surface (`fz`).
- **Bow tie:** two wings pinched at a knot at the collar, not a lozenge on the chest. The cravat (`scarf`) falls down the V.
- **Women's jackets:** a blouse fills the V, and skin shows only at an open neckline (from y 0.425), not down to the waist.
- **Shirts:** a plain cotton material (`axshirt`), with no wool normal or roughness grain (that grain was the wavy lines on white shirts). Its `onumc:` name keeps the game's stone and cloth passes off it.
- **Hair cards:** each card curves with the skull (geometry z = -y², with scale.z = L²/0.2), so tips lie on the hair instead of spiking off it. Cards stay inside the hairline (mask >= 0.86) and light hair cards get the same 0.78 tone as the shell.
- **Skin:** the fair-skin blush multiplier goes 1.9 -> 1.35 and the red zones are weaker (no pink patches). Cache key headskin9.
- **Shoulders:** the cap is bigger (1.16 x 0.96 x 1.12) and bridges sleeve and jacket, so there's no step.
- **Bundle:** `neptune/onum-neptune.js` is now regenerated from the three modules with esbuild 0.24.2 (`--bundle --format=iife --target=es2019`, entry `__entry.js` sets `window.ONUM_NEPTUNE`) instead of being hand-mirrored. Mirror drift is gone. To rebuild:
  `printf "import * as chars from './onum-characters.js'; import * as flags from './onum-flags.js'; import * as mats from './onum-materials.js'; window.ONUM_NEPTUNE = { chars, flags, mats };" | npx esbuild@0.24.2 --bundle --format=iife --target=es2019 --sourcefile=__entry.js` (run in `neptune/`, header comment first).
- **QA:** headless Senate and East Steps runs, with faces, bodies and a wide shot. Suits read at 3-7 m: white V, lapels, tie or bow. No page errors. Under file:// the bundle loads (NEPTUNE.mods set, not failed) and `makeCharacter` builds m/f at low/med/high (104-134 meshes), with no errors.
- **Left:** the shirt V is flat-lit (no cloth shader on purpose); brows are still broad at 0.6 m; white hair shells are still blocky up close.

## 20261104bb — Call on: text lands at once (MARS SESSION-FLOW E/F)
- `cabPaint(p, text, aside)`: writes the line to the floor desk (#ndFd `.fd-log`, full text at once, no word-by-word typing) and the speaker's bubble (`vhSay`). Text only; never gated by `voiceInvited()`.
- `cabCallOn`: paints "<name> rises to report…" on the desk the moment you tap Call on, then asks LiveTalk.
- `cabAsk(..., callOn=true)`: LiveTalk missing → templated report painted right away; LiveTalk empty/timeout (25s for Call on, 120s otherwise unchanged) → templated report. Real reply → painted on the desk + bubble (voice via `speakAt`/`speak` still only when invited).
- Not touched: vote/tally/argue (JUPITER ba), catchDwell / setGlassPrompt / TALK.clear (JUPITER ay), az hit-target + `.prompt.is-live` CSS.
- Gaps: desk paint only when #ndFd is visible (bubble always); no separate LiveTalk chat (#ltcLog) entry; fallback report is generic per office; headless browser boot not run this pass (all inline scripts pass `node --check`).

## 20261104bd (NEPTUNE, on JUPITER ba tip 8b20ec8)
- **One surface, tighter:** new `#uxBdCss` (appended; az `#uxAyCss` untouched). While `#prompt.is-live` or `#apToast` is up, `.notices`, `#tipCard`, `.wire` fold; `#procBar` and `.compass` dim and stop taking clicks; a live prompt dims a coexisting `#apToast` so only one surface asks. Desk/toast buttons keep min 120px wide, `#ndFd .fd-log` scroll is contained (no page jump under the finger).
- **Dialogue paint:** `#ndBdPaint` wraps `ss2NpcSpeak`: it captures the speech text from the `onumSessionEvent` speak call and sends it to `cabPaint` → `#ndFd` (and `vhSay`), skipping it if the desk's last line already shows that text. ba vote/argue/holdFloor, cabAsk callOn, cabShow→cabPaint, cabCallOn aside+callOn not touched.
- **Look:** no change. Faces and bodies from the ultra stamps are already on the tip; I made no look edits without a live check.
- **For be:** `ss2MaybeHeckle` interjections and `#ltcLog` mirroring still skip cabPaint. Next: route heckles through cabPaint(aside=true). Also a room-distance look pass, after a live screenshot.


## 20261104be
MARS soft FAIL fix: uxBdCss one-surface fold now also hides Ledger wire `#hmWire` (no `.wire` class) during prompt/apToast, same `display:none!important` as `.wire`.

## 20261104bf (NEPTUNE, rebased onto JUPITER bg tip 9142568) — office LOOK/DETAIL only
No abilities, no PROPS actions, no rolePowers / OFFICE_DUTIES / K_HOME_OF / docketFor / kDeskActs edits (JUPITER owns those).
- **`execRich()` / `govRich()`**, wired in `kOfficeRich` beside `senateRich`/`courtRich`: emissive windows with floor light-pools, gilt portraits, a floor seal ("THE EXECUTIVE" / "STATE OF <state>"), a cluttered Executive desk (blotter, pen set, out-tray, photo, nameplate) and a grain map under the Governor's desk glass. Door plaques: "THE OFFICE OF THE EXECUTIVE", "OFFICE OF THE GOVERNOR".
- **Own-office layouts:** `officeRoleSpots()` now gives the Senator and the Justice their own table/mail positions. `nepOfficeRoleLook()`: Senator gets a flag pair by the state-map wall, a portrait and an "OFFICE OF THE SENATOR" plaque. Justice gets darker walnut furniture, a law-book wall, a robe on a stand and "CHAMBERS OF THE JUSTICE". Leader and Representative get door plaques.
- **Senate (`nepChamberLook`):** a raised presiding dais step with a "PRESIDING OFFICER" plaque, a wooden cap on the existing visitors' rail with a "VISITORS" plaque, and a press rail with a reporters' ledge.
- **Court:** placards on the existing counsel tables (PETITIONER/RESPONDENT), the lectern and the bar, plus a brass lectern edge. I added no duplicate geometry because the tables, lectern and bar already exist in the base build.
- **Inert placeholders** (labels only, no click): cabinet table (exec -3.3,4.0, new mesh), Governor's secretary desk (govoffice 3.3,3.0, new mesh), and a witness-stand label on the existing stand (court 4.6,6.8). Their coordinates are exposed as `window.NEP_BF_SPOTS` so JUPITER can attach actions there.
- **QA:** `node --check` passes on the main script. The headless boot never exposed `G` (same as the base b241e08), so I have no live screenshots.
- **On bg:** the `#hmWire` selector from be was missing in `#uxBdCss` on the bg tip, so I added it back next to `.wire`. JUPITER bg code is untouched.

## 20261104bm (NEPTUNE, on JUPITER bl c640479) — prompt/HUD options fit the viewport
- Fixes Dominic + MARS soft FAIL (hud-scroll/SOFT-FAIL-fit.txt): long option lists (Call-on rows, continued effects) ran off-screen, unscrollable.
- `<style id="nlPromptFit">` + `<script id="nlPromptFitJs">` before `</body>` in all mirrors:
  - `#prompt.is-live` flex column capped `min(100dvh - 96px, 100% - 24px)`; `.prompt__opts`/`.prompt__catch-row` scroll (overflow-y:auto, overscroll contain, pan-y, -webkit-overflow-scrolling).
  - `.is-many` (>4 opts: 2-col, 40px) / `.is-lots` (>8: 36px); wheel/touchmove on `#prompt`/`#apToast` stopPropagation.
  - `#apToast` capped 100dvh-140px scroll; `#ndFd .fd-hands` 30dvh scroll; `#sxDock` dvh cap + pan-y/overscroll on `#sxDock`, fd-on panes, `#tkActs` (bl added no HUD fit, only follow-up strip styling).
- Untouched: Consequences strip, G.baDesk, followUps, catch arm/dwell, abilities, rolePowers, cabAsk/cabCallOn, uxAyCss/uxBdCss/#hmWire.

## 20261104bn — HUD QoL + polish (on bm)
- Hit targets: `#sxDock`, `#tkActs`, `.fd-hands` buttons ≥44px; Consequences strip `.nsx-fu` buttons ≥40px; `#prompt.is-lots` floor raised 36→40px (bm scroll/compress kept).
- Desk: `#ndFd .fd-log` capped at 38dvh with its own scroll, 14px/1.45 for reading.
- One-surface: `#tipCard` and `#wire` hidden while `#prompt.is-live` or `#apToast` (adds to az clDock/clTx/plate fold).
- Focus: `.prompt__opts`/`.prompt__catch-row` get tabindex=-1 so scroll containers never take gamepad/Tab focus; focused options `scrollIntoView({block:"nearest"})`; 3px gold `:focus-visible` ring.
- Sitting heckles/points of order (ss2MaybeHeckle → onumSession.interject) now land on the desk via `cabPaint(m, text, true)` from an `onum-session` interjection listener (no wrapping; murmurs with no text skipped).
- `#ltcLog` left alone: it is the private Chat thread (chatPaint wipes/rebuilds it from MEM), so mirroring cabPaint there would pollute DMs.
- Next (bo): look/window-glow.

### 20261104bn soft-FAIL fold
- Gold 3px `#ffe08a` focus ring + `scroll-margin:8px` extended to `#ndFd .fd-hands button`, `.fd-hands button`, `#apToast button`, `#apToast [role=button]` (nnQolCss only; bm `nlPromptFit*` untouched).
- Point of order: the engine has no separate PO event — `onumSession.interject()` dispatches `onum-session` with `stage:"interjection"` and `interjection.kind:"point_of_order"`. nnQolJs now branches on that existing `kind` (distinct PO paint, "Point of order:" prefix) rather than inventing a new event. PO still rides the interjection stage by design.
