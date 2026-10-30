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
