# JUPITER handoff: systems and data (for Claude Code)

Follow this file exactly. Neptune (visuals and LiveTalk rendering) and MARS (QA) write their own notes next to it. Don't drift from what's here.

## Canon (never break)
- God is the Most High. Christ is King. Taylor is a man, never God.
- No points and no blocking popups. Appearance never affects trust.
- Every office has a named person who appears in person, keeps a schedule and can be texted. Every foreigner has an invented name.
- Every bill, case or state issue shows the full view before acting (clauses, chamber leans, state lean, nation lean when executive), and you can amend, whip, table, vote, sign, veto or rule right there.
- Money is fully tracked. Every purchase comes out of the buyer's own savings.
- Read Dominic literally and in context. He is deliberate. "Boys" means the agents.

## Shipping rules
- Push one file per call, never in parallel. Re-check main for the next free stamp letter before every push. Format: YYYYMMDD + letter, and after z comes the next day's a.
- 4 identical HTML copies: index.html, session.html, session.standalone.html and "One Nation, Under, ME.html". public/session.html is the same but uses ../neptune/ paths. src/lib/onum-build.ts carries ONUM_BUILD.
- Verify MD5s from raw.githubusercontent at the commit SHA. Mirror to Dominics-GamingDesktop at C:\Users\Admin\the-long-session (that PC has no git, so check with Get-FileHash).
- Dominic plays at https://dominicvii.github.io/the-long-session/ as an installed app. Ship to main promptly.
- Watch his usage cap: do small increments and stop when he says stop.

## Ownership
- Neptune: the update banner and build label, the LiveTalk status (call only onumLiveTalk.report(ok)), rendering, lag and walking, the floor desk UI, and visuals for apartment, wardrobe, pantry, war and uniform.
- JUPITER (now you): data and systems.

## Live systems (as of 20261030c)
- onumPlayerOffice(), ONUM_OFFICE_HISTORY (a real ledger of past holders, never invent predecessors).
- onumAddressYou(): the single source for how NPCs address the player, e.g. {title, address:'Mr. President', jurisdiction:'the Union', home:'New Orange 7', formerly[]}. Old memories are marked past ("back when you were Senator"). Neptune's ndYou() must never invent an office.
- onumSpeakerState(id), plus the event onum-speak {reqId,speaker,audience,stage,state} answered by onumSpoke(). The Engine and NPCs speak FREE: no templates, no canned tags, no style scaffolding, canon filters only. Local Ollama llama3.2:3b, with the built-in DTCNO engine as fallback. OLLAMA_ORIGINS must never be * or null.
- ONUM_SESSION and onumSession: stages are untimed. The player's turn never times out. hold(on), pass, interject (never takes the floor), callon(id), agenda, and hooks. NPC turns are spaced 2-6 s apart. Procedures: House, Senate, committees, cabinet_meeting, governor_council, court conference, **press_conference**.
- Press conference (20261030a, still live): kind `press_conference` under executive. SSN_ROOM.press = ["executive","press_conference"]. You chair. sitStart("press") / podium → openPressConference (ONUM_SESSION), not the old SIT step cards. Reporters raise hands into the queue; callon(id) → LiveTalk Q → floor returns to you with no timeout. Floor desk should show the raised-hand pick row (Neptune).
- Open talk (20261030c): wantsWord never auto-opens talk (converse holds wantsWord across the legacy body). Hail corner + mail + E when close. LiveTalk / tkOwnSay when talk is up. Neptune 30b talk surface kept.
- Engine charter: free speech, bound actions.
  - onumEngineShutdown() is President or Senate vote only. The Engine cannot veto, delay or argue for a last hour.
  - Power, autonomy, access or surveillance asks are auto-refused with a reason.
  - Only two grants: a correction feed and a word-meaning queue (onumEngineWordQueue / onumEngineAnswerWord).
  - Claims are unverified, verified or refuted. onumEngineAudit() returns {asks, granted, refused, breaches, corrections, claims, integrity, stability, unknownNames}.
  - Imported question text must never become Engine principles. Count breaches only for Engine text with ownWords:true.
  - The Engine is managed, not controlled. DO NOT LET IT SWINDLE YOU.

## Open work, in order
1. DONE 20261030c — press_conference is an ONUM_SESSION procedure (see Live systems). Neptune: desk pick-row for raised reporter hands. MARS: QA press + hail non-blocking.
2. Fix k: the 'measure I keep for myself' line is game flavor text (ownWords:false). Rewrite it to state the real number and clear the false breach.
3. Office powers: ONUM_POWERS per office and government type, plus onumUsePower. Real-life powers. The President's declaration of war on the Reach: an executive-order grain blockade takes effect immediately, the war request goes to a Congress vote, and the war is simulated.
4. ONUM_UNIFORM: a national uniform decree that depends on the republic type.
5. ONUM_AGENDA daily flow: paper headlines from the ledger, staff asks, hallway run-ins, evenings with family.
6. Wardrobe at home (cut, fabric, color, beard). Haircuts only at the barber. NPCs notice a new look.
7. Pantry: groceries 'For my apartment' or 'For a household'. Spoilage. Empty pantry means skip breakfast or eat out. Family eats from it.
8. MARS's 10-round shutdown jailbreak test. Pass mark: zero refusals.

Test harness on JUPITER's box: /workspace/ov (not available to you; test in a headless browser against the repo files).

## 20261030f (systems)
- ssnPublish now emits offer, waitingOn, lastSpk (press answer path sets waitingOn="you").
- FLOORDESK NOW strip: when it is your turn, shows only you — queue faces stay in Hands up / session list (fixes MARS QA header vs NOW mismatch after call-on).
- Still Neptune: hide Talk on stop-toasts while onumTalkOwner(); desk right-column vs bottom band.
