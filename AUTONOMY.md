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
