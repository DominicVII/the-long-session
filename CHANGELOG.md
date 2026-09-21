# One Nation, Under, ME. — the log

Formerly *The Long Session*. Repo: [DominicVII/the-long-session](https://github.com/DominicVII/the-long-session)

A first-person political life in an invented republic. You are one member of the House. Standing, influence, approval, and money come only from what you do — and from what other people remember.

## Play this build

| | |
|---|---|
| **Grok.me (canonical)** | https://onenationunderme.grok.me/ |
| **GitHub Pages** | https://dominicvii.github.io/the-long-session/ |
| **raw.githack** | https://raw.githack.com/DominicVII/the-long-session/main/index.html |
| **jsDelivr** | https://cdn.jsdelivr.net/gh/DominicVII/the-long-session@main/index.html |

**Build stamp: `20260921a`.** Saves live in the browser (`localStorage`). Continue never deletes a career. Sleep is a clock, not a 3D rebuild.

This is the actual working log of the published HTML — not a Claude artifact.

---

## Weekly MAX OPTIMIZE (21 Sep 2026) — `20260921a`

Surgical frame / people / texture pass. No content stripped (Consular, horcruxes, Caesar, furniture, freeze-fix boot kept).

- **Frame loop:** one `FRAME_ID++` per `frameBody` (removed a redundant second increment that broke tick cadence bit-masks); card-up early-out runs feed/scroll every other armed tick; reuse `crowd` for matChk (no second `hereNow()`).
- **People:** tighter idle pose cadence in `animatePerson` (near-mid standing every 2nd, mid every 5th, seated far every 4th) without blanking near faces; still prefer `syncPeopleStaged`; crowd hysteresis unchanged; never flips `shadowMap.enabled`.
- **Textures:** Simple/MODEST canvas + cloth maps skip mipmaps/anisotropy; photoreal `dressTextures` skipped on Simple as well as MODEST.

---

## Keep all of it (17 Sep 2026) — `20260917q`

(See repository history for the full prior changelog body; this publish commits the weekly stamp entry. Full CHANGELOG.md on the box is authoritative if this stub is incomplete.)
