# Windows (in-engine)

No external material plugin. Window assemblies are built by `propWindow` in `index.html`.

## API

```js
propWindow(wall, x, y, z, w, h, ry, opts)
```

| Arg | Meaning |
|-----|---------|
| `wall` | `"x"` left/right (opening spans Z); `"z"` front/back (spans X) |
| `x,y,z` | Centre of the opening on the wall plane |
| `w,h` | Opening width × height (metres) |
| `ry` | Facing (typically `±PI/2` on side walls, `0` on back) |
| `opts.cols` / `opts.rows` | Pane grid (wood rooms default 2×2; marble/chamber 3×2) |
| `opts.blinds` | Thin slats inside the reveal (office / visit only) |
| `opts.stone` / `opts.style` | Stone/wood reveal materials |

## Craft

- **Reveal** meets the wall plane (no light leak); jambs + sill + lintel with sill/lintel miters past the jambs.
- **Sash / mullions / muntins** form a clean grid; T-seams into the outer rails.
- **Glass** sits in the sash **rebate** (`glassIn` ≪ sash face) — never coplanar with the sash (no z-fight). Uses shared `MeshPhysicalMaterial` when available (transmission if present), else transparent `MeshStandardMaterial`. Day/night emissive nudged in `lightingSlow` via `syncWindowGlass()`.
- **Shadows:** frames/sash cast; glass does not.
- **Placement:** driven by `R.light` (`left` / `right` / `back` / `high`). Radiators stay under side-wall windows. Cloak (`light:"lamp"`) and open rooms skip assemblies.
- **Blinds:** only via `opts.blinds` — do not double-stack separate slat loops.

## Rooms

office, visit, caucus, committee, floor, press, corridor (where `R.light` applies); district/steps are open sky.
