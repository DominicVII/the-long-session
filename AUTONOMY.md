# Paramount autonomy

**Individuals = AI = Human = AI+Human = Individuals.**
Autonomy is paramount: each person has their **own** thought, hope, and vision. Nobody speaks as a hive.

## Core fields (per person)
- `thought`, `hope`, `vision` — unique strings from creed / background / goal / fear / district (`ensureSelfhood`).
- Never overwrite these with party whip text.

## Retained mind
`m.mind = { thoughts:[], experiences:[], concepts:[] }`
Caps: thoughts 24, experiences 40, concepts 12. Persists on the person for the session — not wiped each tick.

- `mindRemember(m, kind, text)` on notable events (Vox fights, deals, goal progress, bad town news, posts).
- `mindInvent(m)` occasionally in `autonomyTick`: coins a novel concept title + meaning from hope/fear/district/traits.
- Shared registry: `G.concepts[id] = {t, d, by, day, heat, real, adopters}`.

## Talk → effect
- `voxFree` / autonomy Vox may cite retained thoughts or invented concepts.
- Citing a concept raises `heat` / adopters (`mindCiteConcepts`).
- When real enough (`heat` / adopters), `real:true`: journal + feed scrap, light influence/standing for inventor, optional bill noise, rival reaction.

## Actions
`autonomyTick` acts from **their** thought/hope/vision/goal/fear — never copies another member’s lines wholesale.

## Will (20261027d)
Nobody is handed a feud, a friend or a grudge. `G.wl` keeps what was actually done to whom: a vote against someone's bill, a section of it struck, a veto of it. Each night every member weighs what they could do (`wlOptions`): answer a wrong they can name (`wlWhy`), seek an ally who thinks alike, gather allies into a bloc, file a bill, or take on the Engine for what it did at home. Then they do the one that matters most to them, or nothing (`wlMemberDay`).
- **Contests are measured, not rolled.** When two wills meet, standing, allies, money and the facts each side holds decide it. The one acted on answers in their own turn, from their own will.
- **Quarrels have a history.** Each side keeps its own account of how a quarrel started. Saying it aloud spends a grievance. A quarrel that goes round costs more to keep up and is easier to drop.
- **A campaign against the player** starts only when someone has turned against you over something they can name. Each move is chosen from their means and from what they actually know of your record (`wlDamaging`). It ends when it cools, when their moves keep going nowhere, or when they have had the better of you.
- **The Engine** acts on whichever want presses hardest (`engWant`). Its own promises hold it while its resolve outweighs the want, and a promise it broke lately weighs more. When its word holds it, it turns to its next want. The charter holds it while the charter's force outweighs the drive, and Oversight sees what its strength can see.
- **Nothing is put in the record that did not happen.**
  - Gossip, dreams, noticing and the things found in the morning are drawn from what the speaker actually knows and lived.
  - The live voice is given each member's will (`wlWillLines`).
  - Sittings speak from the record.
