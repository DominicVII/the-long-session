# Podium CATCH stream

Replaces static numbered speech-beat walls at lecterns with a **catch-or-it-passes** word stream. Caught lines **accumulate** into one **full speech** delivered at the end for regular XP. A **Full speech (pen)** shortcut is a lesser hidden path.

## Behaviour

When `speechStationNear` (or your PROC turn), `#prompt` shows **one live line** at a time:

1. **Slow the lectern** — dwell **2.4–3.2s** while close; backing off (3.5–5.2m) keeps the session faster (~1.65–2.0s). Beyond 5.2m clears.
2. **Catch accumulates** into `CATCH.pieces` — does **not** speak yet. Miss = silence (`catchMiss`).
3. **No same word again** — session `used` + shuffled queue + thematic closers.
4. **Coherent pools** — each kind is a thematic ordered set (`order`). Deliver sorts by `order` and joins into one paragraph.
5. **~10+ unique lines** — `speechBeats` holds **15**/kind, returns up to **10**; queue adds **2** extras + up to **3** closers.
6. **Deliver speech** (near hard station) — regular XP:
   - `standing += clamp(2 + pieces.length, 2, 14)`
   - `influence += clamp(1 + floor(pieces.length/2), 1, 8)`
   - time ≈ `sum(mins) * 0.55` (cap ~48m); one net sway from average stance
7. **Full speech (pen)** — `G.you.pen += 1`; light spend; **no** piece XP. Feed: *You read it straight from the pen.*
8. **PROC your turn** — same accumulate; Deliver runs opts via `procYouSay`.

## Controls

| Input | Action |
|-------|--------|
| E / A / LT·RT / 1 | Catch live line |
| E / A / LT·RT | Deliver when stream spent + pieces ≥ 1 |
| Full speech (pen) | Hidden path |

## Code

`CATCH.pieces`, `catchNow`, `deliverAssembledSpeech`, `deliverPenSpeech`, `assembleSpeechText`, `catchPaint`, `pollPad`.

See also: `SEAT-VOICE.md`.
