# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

God is the Most High. Christ is King. The First Consul is a man under God, not God.

## Play this build

| | |
|---|---|
| **Grok.me (canonical)** | https://onenationunderme.grok.me/ |
| **GitHub Pages** | https://dominicvii.github.io/the-long-session/ |
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **jsDelivr** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |

**Build stamp: `20260921a`.** Saves live in the browser (`localStorage`). Continue never deletes a career. Sleep is a clock, not a 3D rebuild.

**Grok bot:** paste [GROKBOT-HANDOFF.md](GROKBOT-HANDOFF.md) in full. Do not summarize it.

This is the working log of the published HTML — not a Claude artifact. There is no Claude in the game.

---

## Now (`20260921a`) — full render, human walk

- **Best / fullDetail** is the default. Chandeliers, full plants, every statue, lamps, long LODs. Modest machines still **stride the loop at 30** and skip minds while you walk. They no longer get silently shoved into Simple. `?safe=1` is the hatch.
- **Walk 0.68 / sprint 1.15.** One frame cannot carry you more than ~an inch. Holding W does not tick the House twice.
- **Sim every vsync, draw on 30/60.** WASD must not wait on a skipped picture.
- **While you walk, the House waits.** Remesh, wander, sentWorld wait until you stand still.
- **Doors keep the walls.** Furnish on the shell; kits remember 6–8 rooms. Do not tear the room down to hang a picture.
- **Cache:** `history.replaceState` for `?v=`. Never `location.replace` (that froze start).
- **Lives kept:** sentience, pulse (no feeling bar), youSent, local AGI, foreign **realms / envoys**.
- **East Steps** are treads you climb; **District** has a church of what you follow.

Wrapper iframe: `/session.html?v=20260921a` (`src/lib/onum-build.ts`).

---

## Keep all of it — do not strip

### Boot

- Continue sets `G.running` first. Room shell on rAF. People / myth / Consular after a delay.
- Floor / committee / caucus / press Continue drops you in the **corridor**.
- Failed Continue never deletes the career. Furthest save wins.

### Look

- **Caesar cut** (short even cap, straight fringe). Parting is two combs with a scalp gap, not a lump.
- **Suits:** navy, oxblood, charcoal, open collar, three-piece, waistcoat.
- **Furniture** grounded (`groundedProp`). Tables on the floor. Windows in the wall, not pale slabs over paintings.
- Glasses on the face. Full people in the corridor — no potato dummies.

### Canon (speakable)

- God is the Most High. Christ is King. The First Consul is a **man under God**, not God.
- Comparison of the living to Dominic Zachary Taylor is **blasphemy**.
- The 7-7 hymn of the code is **internal only**. No NPC says it. Taylor Day (7/7) is the civic holiday; that is allowed.
- If the fourth wall breaks, the code does not touch Dominic Zachary Taylor or his kin.

### Consular Rite

Latin heresy. They keep the Mass and put the First Consul where God belongs. The chaplain will not give them the Host.

- Gather at the corridor bronze at 7 / 12 / 18, and all of them on Taylor Day.
- **Recruit** in the corridor, at the bronze, and among the **new class**. Latin is the easy pull; devout Latin often refuse; chaplain and the machine seat never.
- Kneel with them and they take **you** (heresy).
- Eight **horcruxes** (remainders): flake, missal, stitch, fold, coin, print, wire, empty chair. Find / venerate / smash.
- They invent remnant history as they talk (up to 12 tales). Idols, not souvenirs.

### New class (election)

House is 25 seats, not counting you. Incumbents keep or fall on margin + wave + personal + noise. Creed does not vote.

Freshmen fill holes:

- Party: 62% wave winner (FED/COM), 38% the other major.
- `{fresh:true}` — **every confession can land**. State majority is a tilt, not a lock.
- ~42% a fallen **house** claims the vacancy. **Creed is not inherited.**
- Surviving Consulars then try up to two non-Consular newcomers (~48% each).

Your race is a separate machine. Lose and you go to the steps. The session does not end.

### Files

Playable HTML is the same body under:

- `public/session.html` (Grok.me)
- `index.html` (GitHub Pages)
- `session.html`
- `One Nation, Under, ME.html`

---

## Sleep is a clock, not a rebuild (12 Sep 2026)

Edge hung on “The House is settling” because Sleep remeshed people and stringified the career. Sleep advances the day and writes the morning card. Save and bodies wait.

## Continue career (12 Sep 2026)

Stardew (never wipe a farm), Skyrim (stand you back up), immersive sim (wake where you saved).

- Pause Continue does not rebuild the House.
- Cold Continue hydrates the save, keeps the card up until the room is drawn.
- Backup save is peeked if the primary write tore.
- Camera position is saved and restored.

## Chamber / speech (12 Sep 2026)

- **No timer on chats.** LT/RT browse podium and interview; E/A takes the line.
- Original capitol seal on the opening card.
- Windows are opaque sky panes in the wall.
- You may amend a bill seated or at the lectern.

## Standalone

Three.js r128 inlined. No CDN, no Claude, no vendor required. `Play.bat` / `Install-App.ps1` on Windows.

## Shared body, hair, suits (12 Sep 2026)

One body model, unique faces/hair/glasses. Caesar cut. Distinct suits. Glasses in front of the face.

---

## Controls

| Key | Does |
|---|---|
| W / S | Walk |
| A / D | Look |
| Q / C | Step |
| Shift | Hurry |
| E | Speak / use / take the line |
| F | Phone |
| Space | Pause |
| 1–9 | Prompt lines |
| LT / RT | Browse speech / interview |

Pad: left stick walk, right look, A confirm, B back, Y phone, X schedule (hold X speak aloud).

---

## Rooms

Office, Statuary Corridor, Cloakroom, Caucus, Committee 2141, House Floor, Press Gallery, East Steps, District.

Doors walk you through. No menu required.

---

Older entries stay in [CHANGELOG.md](CHANGELOG.md) on the GitHub repo. The law for the next bot is [GROKBOT-HANDOFF.md](GROKBOT-HANDOFF.md).
