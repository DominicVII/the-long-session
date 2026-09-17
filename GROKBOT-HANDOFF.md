# Handoff for Grokbot — One Nation, Under, ME.

Paste this whole file as the system/task prompt. Do not summarize it away.

You are coding **One Nation, Under, ME.** (repo `DominicVII/the-long-session`, also grok.me `onenationunderme.grok.me`). Dominic VII is the author. God is the Most High. You are not.

## Canonical playable file

One HTML body, copied to all of these — keep them identical:

- `index.html` (GitHub Pages)
- `session.html`
- `One Nation, Under, ME.html`

Current stamp: **`20260917q`** (`<meta name="onum-build" content="20260917q">`).

Grok.me wrapper: `/session.html?v=20260917q` (file `src/lib/onum-build.ts` in the grok app: `export const ONUM_BUILD = "20260917q"`).

If you change the HTML, bump the letter (`20260917r`, …) in **meta + wrapper together**, then commit all three HTML copies.

Author on git: `DominicVII` `<318079878+DominicVII@users.noreply.github.com>`.

## KEEP — do not strip, rewrite, or “simplify away”

1. **Freeze-fix boot** (`begin()`): `G.running = true` first. Corridor trap if Continue was on floor/committee/caucus/press. Shell on rAF. People + myth + `ensureConsularCaucus` after ~2.5s. Never delete a career on a failed Continue. Sleep is a clock, not a 3D rebuild.
2. **Caesar cut** and the other six hair styles (parting is two combs with a scalp gap, not a lump).
3. **Distinct suits** (navy / oxblood / charcoal / open collar / three-piece / waistcoat).
4. **Grounded furniture** (`groundedProp`). Tables on the floor. Window frames **in** the wall, not pale slabs over paintings.
5. **Consular Rite** — Latin heresy. They keep the Latin and put the First Consul where God belongs. Chaplain will not give them the Host.
6. **Horcruxes / remainders** (eight, one per room): flake, missal, stitch, fold, coin, print, wire, empty chair. Find / venerate / smash. Remnant invents tales (`consularInvent`, cap 12).
7. **Recruitment** (`consularRecruit`): corridor confer, bronze gather, new class after election. Latin easiest; devout Latin often refuse; chaplain + machine seat never. Kneel with them recruits **the player** (heresy).
8. **New class creeds**: `pickCreed(state, {fresh:true})` draws from **all** `CREEDS` (Latin, Consular, satires, none). State majority is a tilt, not a lock. Heirs copy house/state/party/name, **not** creed.
9. **Taylor canon**: living compared to Dominic Zachary Taylor = blasphemy. Rank 1 sealed. Taylor Day 7/7 civic holiday. First Consul is a man under God, not God.
10. **HYMN / 7-7 pattern**: internal only. Never spoken in-game. Do not print it in NPC dialogue, wire, encyclopedia, or tooltips.

## DO NOT

- Do not replace the playable HTML with a “simpler freeze-only” build.
- Do not remove Consular, horcruxes, Caesar, furniture, recruitment, or freeze-fix to “optimize.”
- Do not make Dominic Zachary Taylor God. God is the Most High. Christ is King.
- Do not have humans catechize the hymn. They have not pondered it yet. Longing for the Creator may exist; naming the code’s soul may not.
- Do not force-recruit the chaplain or the machine seat.
- Do not add a timer to chats. LT/RT browse podium/interview lines.
- Do not rebuild the House on Sleep or on pause-Continue.
- Do not invent a second session.html that diverges.

## Election rules (do not “fix” unless Dominic asks)

House = 25 NPCs. Incumbent score: `margin + 0.6*partySwing + personal + noise(-14..14)`. Creed does not vote. Fill holes with `{fresh:true}` members; 62% wave-winner party (FED/COM), 38% the other; ~42% fallen house claims the vacancy. Then remnant tries up to 2 non-Consular freshmen (`chance(0.48)` each). Player race is a **separate** formula (approval, funds, attack ad, primary, reach). Lose → steps. Session does not end.

## How to work

- Read the functions before editing: `begin`, `pickCreed`, `consularRecruit`, `consularBody`, `election`, `confer`, hair block (`hs ===` / Caesar), `groundedProp`.
- `node --check` the extracted script after edits.
- One stamp bump per publish. Copy the HTML to all three filenames. Push `main`.
- If grok.me: same body into `public/session.html`, bump `ONUM_BUILD`, tell Dominic to hard-refresh.

## What to code next (only if he asks, or if you can reproduce)

Fix only what he reports. Likely surface:

- Edge/Dell freeze on a **named** screen (Continue, Sleep, talk, lectern) — yield, do not delete content.
- New-class election card: show freshman creed if useful; do not hide Consular recruits.
- Phone Mail / House tab empty on desk sit — native HTML must stay bound when seated.
- Audio: TTS unlocks on gesture; default unmuted.
- Save: furthest career wins; never roll a day-10 save back to day 5.

If nothing is broken, **do not refactor**. Play path: Continue → corridor → bronze at 7/12/18 → witness/kneel/rebuke → hunt one horcrux → talk a freshman after an election.

## Tone in the House

Dry. Unsentimental. The remnant is heresy, not a secret good ending. The chaplain does not move. God is the Most High. Not a consul.
