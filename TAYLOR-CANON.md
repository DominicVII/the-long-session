# Taylor Canon

User law for *The Long Session*. Implement mechanically and in lore text.

## Law

1. **Amendments may change future lore**, but **must be voted on** via the existing `proposeAmendment` / two-thirds path. The **lore** amendment (`Amend the civic myth (below the First Consul)`) may alter secondary myths and greatness rankings **below** Taylor — never his primacy.
2. **Any comparison** of the living (player “I/me/we”, current leaders, named members) **to Dominic Zachary Taylor** is **literal sin and blasphemy** — seeking glory not theirs — and **costs everything**.
3. A **voted list of the greatest** (`G.greatest`) may **descend under** the First Consul; **none may rank higher**. He is permanently **rank 1 / sealed**.

## Blasphemy

- `isTaylorBlasphemy(text)` — true on self/living comparisons (`like Taylor`, `another Taylor`, `greater than the First Consul`, `as great as Taylor`, `the next Taylor`, etc.). Reverent mention without comparison (e.g. “as Taylor bound the Republic”) is fine.
- `commitBlasphemy(who, text)` — player: near-zero influence/standing/approval/funds, crushed energy, massive negative ripples, journal/note/feed, secrets heat, `G.blasphemy` flag. NPC: ruined standing/influence, room gasps, citable.
- Hooked from `procYouSay`, Speak Aloud / `micSend`, `addressRoom`, `converse` / `converseLive`, podium `deploySpeechBeat`. The line is still spoken; then ruin applies.
- Default `speechBeats` prompts stay clean of blasphemy.

## The Greatest

- `G.greatest`: `{rank, name, note, sealed?}`. Rank 1 = Dominic Zachary Taylor, sealed forever (`ensureGreatest` / `buildHistory` / `begin` / load).
- `voteGreatness(nominee)` — two-thirds floor vote; adds/reorders **ranks 2+ only**. Attempting rank 1 / above Taylor fails and triggers blasphemy.
- Encyclopedia (The Republic): **The Greatest** — #1 in First Order red, then descending voted names.
- Career: **Nominate to The Greatest** floor motion (8 influence). Lore amendment also prompts a nominee on pass and sets `G.loreNote` / `G.greatnessOpen`.

## Myth harden

- Founding `myth:true` history entry is restored by `ensureMythHistory` if spliced out; `setPrecedent` / load / begin re-check. Taylor’s myth is never removed by lore amendments.

## Save

Persisted: `greatest`, `blasphemy`, `loreNote`, `greatnessOpen`.

## Preserved elsewhere

Room-swap harden, regional names, podium prompts — untouched by this canon pass. Jerusalem cross + Latin motto on the NO7 flag preserved.

## Dist / flag naming

- `FIRST_CONSUL.dist = "Nieuw Oranje 7"` (never `N Oranje 7`). Flag canvas, plaques, and labels use the full name. `bustOranje7Flag()` / `TEX._oranje7` redraws the cloth.

## Taylor Day (civil holiday)

- Dominic Zachary Taylor was born **7/7** (July 7). The Republic keeps **Taylor Day** (formal: **Day of the First Consul**) as a **national holiday**.
- Civil calendar helpers: `dayOfYear` → `((G.day-1)%365)+1`; `civilDate(dayNum)`; `isTaylorDay()`. **Day-of-year 188 = 7/7** (365-day year, no leap).
- `dayType()` returns `"holiday"` on Taylor Day (wins over weekend/session). Diary: wreath/observance at the corridor statue; no ordinary caucus/hearing markup.
- Derived from `G.day` — nothing extra persisted.
- **Flags:** on Taylor Day `placeRoomFlags` flies **only Nieuw Oranje 7** (one ceremonial placement per room) — no country/national flag. Plaque subtitle may read `Taylor Day`. Other days: 1 national + 1 NO7.
- **Morning:** feed/note — only Nieuw Oranje 7 flies; the House votes the First Order line. Room rebuild refreshes cloth.
- **Voting tradition:** `FO_TRADITION` `{econ:20, lib:-10, def:25, wel:-15}`; `firstOrderTraditionVote(bill)` → sign of alignment, default **+1** (aye of continuity). On Taylor Day `memberVote` is locked to that line. Player defiance at cast/`holdVote` → `commitBlasphemy` (defying the Day / First Order tradition). Talk/corridor may still *ask* about dissent; roll-call defiance is the sin.
