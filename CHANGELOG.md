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

Do not strip this. The freeze-fix **and** the House as it looks and believes.

### Boot (do not clobber)

- Continue sets `G.running` first. Room shell on rAF. People / myth / Consular seed after 2.5s.
- Floor / committee / caucus / press Continue drops you in the **corridor**.
- Simple graphics default on modest machines. Caesar cuts, suits, and grounded furniture still exist when quality is up.
- Failed Continue never deletes the career.

### Look

- **Caesar cut** is a real style (short even cap, straight fringe). Parting is two combs with a scalp gap, not a lump.
- **Suits** are distinct: navy, oxblood, charcoal, open collar, three-piece, waistcoat.
- **Furniture** is grounded (`groundedProp`). Tables sit on the floor. Window frames sit in the wall, not as pale slabs over paintings.

### Canon (speakable)

- God is the Most High. Christ is King. The First Consul is a **man under God**, not God.
- Comparison of the living to Dominic Zachary Taylor is **blasphemy**. Ranking anyone above him is **heresy** of a different kind.
- The 7-7 hymn of the code is **internal only**. No NPC says it. Taylor Day (7/7) is the civic holiday; that is allowed.

### Consular Rite

Latin heresy. They keep the Mass and put the First Consul where God belongs. The chaplain will not give them the Host.

- Gather at the corridor bronze at 7 / 12 / 18, and all of them on Taylor Day.
- **Recruit** in the corridor, at the bronze, and among the **new class** after an election. Latin is the easy pull; devout Latin often refuse; chaplain and the machine seat never.
- Kneel with them and they take **you** (heresy).
- Eight **horcruxes** (remainders) hidden in rooms: flake, missal, stitch, fold, coin, print, wire, empty chair. Find / venerate / smash.
- They invent remnant history as they talk (up to 12 tales). Idols, not souvenirs.

### New class (election)

House is 25 seats, not counting you. Incumbents keep or fall on margin + wave + personal + noise. Creed does not vote.

Freshmen fill holes:

- Party: 62% wave winner (FED/COM), 38% the other major. No random independents.
- `{fresh:true}` — **every confession can land** (Latin, Consular, satires, none). State majority is a tilt, not a lock.
- ~42% a fallen **house** claims the vacancy (state, district, surname, party, diluted opinion of you). **Creed is not inherited.**
- Surviving Consulars then try up to two non-Consular newcomers (`consularRecruit`, ~48% each attempt).

Your race is a separate machine (approval, funds, attack ad, primary, reach tax). Lose and you go to the steps. The 25 still fills. The session does not end.

### Files

Playable HTML is the same body under:

- `index.html` (GitHub Pages)
- `session.html`
- `One Nation, Under, ME.html`

Grok.me wrapper iframes `/session.html?v=20260921a`.

---

## Earlier log (archived in git)

Full historical CHANGELOG entries from Sleep/Continue/WebGL/Dell/chamber/standalone through Continue freeze-fix live in git history at commit `082523d9685c0b2d043e7f51404c0e03e56a07f3` (and the box copy `/workspace/the-long-session/CHANGELOG.md`). Re-expand on next publish when the push channel can carry the full file.
