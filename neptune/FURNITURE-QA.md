# Furniture & placement QA: session.html (NEPTUNE, 2026-10-13)

> Note: the GitHub connector can only push text files, so the screenshots referenced here are not in the repo. They are on the build box at `/workspace/ov/neptune/qa/`.

**How I checked it.** I loaded a scratch copy of `session.html` in headless Chrome (SwiftShader). The copy is identical except for one added line that exposes `ROOMS/DOORS/PROPS/buildRoom` for analysis, and it was never committed. I built every room (`office corridor cloak caucus committee floor press steps district visit senate court exec govoffice`). For each room I took the solid world bounding box of every top-level object in `roomGroup`, leaving out flat contact discs under 2.5 cm tall, and checked it for:
- going through a wall
- sinking below the floor
- floating with nothing under it
- intruding into a 1.1 m × 1.15 m zone in front of each door
- NPC seats from `seatsFor()` with no seat surface (top 0.3–0.7 m above the seat y) within 0.25 m
- PROPS interactables outside the walkable `roomBox`

I then confirmed each finding with screenshots in `neptune/qa/`: `before-*.png` is the stock game and `after-*.png` has `onum-furniture-fixes.js` loaded.

**What came back clean:**
- **Seats:** all 77 NPC seats (caucus 18, committee 19, floor 30, press 9, office 1) sit on a chair or bench.
- **Coffee urn:** reachable. `PROPS.office.urn` is at (0.80, 7.88), the mesh is at line 9635, and they match. It wins focus when you face it from in front of the desk at x ≈ 0.8.
- **Below-floor hits:** the only ones are the radiator feed pipes (`propPipe(..., y-0.34, ...)` in `propRadiator`, line 8537), which go into the floor on purpose.

Runtime fix = what `neptune/onum-furniture-fixes.js` does in the scene without touching `session.html`. Source fix = the change JUPITER should paste in.

---

## P1: blocking or broken

### 1. Office: the "office sofa" interactable has no sofa
- **Room / object:** My Office, `PROPS.office` id `sofa` (line 22648), at (-2.35, 5.4).
- **Problem:** The office build (`buildRoomInner`, lines 9313–9322 and 9687–9710) never builds a sofa. The player gets a "Lie down…" prompt over bare floor between the two left-wall radiators (`before-office.png`). The sofa recipe that uses exactly these coordinates (comment "the sofa: a seat, a back, two arms and four feet", lines 9350–9360) sits inside the **`if(id === "cloak")`** block. It was pasted into the wrong room.
- **Source fix:** move lines 9350–9360 out of the cloak block into the `if(id === "office" || id === "visit")` block at 9313 (after `propCabinet`, line 9318). The visitor office is 8 wide, so x = -2.35 still clears the wall there.
  ```js
  /* the sofa: a seat, a back, two arms and four feet — under PROPS.office "sofa" (-2.35, 5.4) */
  {
    const sx = -2.35, sz = 5.4;
    addBox(leather, sx, 0.22, sz, 0.86, 0.44, 1.90, 0, true);
    addBox(leather, sx-0.36, 0.48, sz, 0.16, 0.96, 1.90, 0, true);
    addBox(leather, sx+0.02, 0.40, sz-0.88, 0.80, 0.36, 0.18, 0, true);
    addBox(leather, sx+0.02, 0.40, sz+0.88, 0.80, 0.36, 0.18, 0, true);
    [[-0.34,-0.80],[0.30,-0.80],[-0.34,0.80],[0.30,0.80]].forEach(f =>
      addBox(woodMat, sx+f[0], 0.05, sz+f[1], 0.08, 0.10, 0.08, 0, true));
    addBox(matTex(TEX.damask, 1, 1, .9), sx-0.02, 0.48, sz-0.55, 0.44, 0.14, 0.42, 0.3, true);
  }
  ```
- **Runtime fix:** in the office only, the script builds the same recipe at (-2.35, 5.4) if nothing already stands there (`after-office.png`).

### 2. Cloakroom: that same sofa clips through the coat rack and the phone booth
- **Room / object:** House Cloakroom, sofa at x -2.78…-1.92, z 4.45…6.35 (lines 9350–9360).
- **Problem:**
  - It overlaps the phone booth (line 9640: `-hw+0.9, 1.1, 6.0`, 0.9 × 2.2 × 1.0, so x -3.05…-2.15, z 5.5…6.5).
  - The hanging coats (line 9347, x -2.56…-2.44, down to y 0.85) cut into its back-rest.
- **Source fix:** after moving the sofa to the office (#1), the cloak doesn't need it, because it already has the long sofa (#3). If JUPITER wants to keep a second one, use `const sx = -1.6, sz = 4.6;` instead.
- **Runtime fix:** moves the 9 sofa parts +0.75 m in x, clear of the coats and booth (`after-cloak.png`).

### 3. Cloakroom: "The long sofa" and its side furniture float, with no legs
- **Room / object:** `PROPS.cloak` `sofa` (line 22845) at (2.3, 3.0). Meshes:
  - line 9348 / 9349: `addBox(leather, hw-1.2,0.35,3.0/5.4, 1.4,0.16,0.7)`
  - line 9757: side table top
  - lines 9755–9756: lamps
- **Problem:**
  - The interactable "long sofa" is a 16 cm leather slab hanging at y 0.27–0.43 with nothing under it.
  - The slab at z 3.0 overlaps the back-rest sofa at (1.6, 2.4) from line 9763 (z 2.04–2.76 vs 2.65–3.35).
  - The side table is a 6 cm top floating at 0.42 and sits inside the z 5.4 slab.
  - Both table lamps (stem bottom at y 0.60) float in mid-air at z 4.2 and 6.4, over nothing.
- **Source fix (lines 9348–9349 and 9755–9758):**
  ```js
  addBox(leather, hw-1.2, 0.215, 3.2, 1.4, 0.43, 0.7);     /* long sofa / ottoman, on the floor, clear of the 1.6,2.4 sofa */
  addBox(leather, hw-1.2, 0.215, 5.4, 1.4, 0.43, 0.7);
  ...
  addBox(matTex(TEX.panel,1,1,.5), hw-1.2, 0.225, 4.3, 0.5,0.45,0.5, 0, true);  /* side table, grounded */
  addBox(matTex(TEX.panel,1,1,.5), hw-1.2, 0.225, 6.4, 0.5,0.45,0.5, 0, true);
  propLamp(hw-1.2, 0.77, 4.3, 0xffd6a0, 0.8);               /* stem sits on the 0.45 top */
  propLamp(hw-1.2, 0.77, 6.4, 0xffd6a0, 0.7);
  propPapers(hw-1.2, 0.455, 4.3, 3);
  ```
- **Runtime fix:** does exactly this, adding the second table and moving the PointLights with their lamps (`after-cloak-right.png`).

### 4. Corridor and Cloakroom: a radiator stands across the House Floor door
- **Room / object:** Statuary Corridor back door to the Floor (`DOORS.corridor` `floor`, side back), and the Cloakroom back door to the Floor.
- **Problem:** the services pass (`buildRoomInner`, line 9959) puts `propRadiator(0, 0.36, d-0.22, 1.4, 0)` in the middle of the back wall of any room whose light isn't `left`/`right`. In both rooms that wall holds the door to the House Floor, so a 1.4 m × 0.62 m radiator blocks the bottom of the doorway (`before-corridor-back.png`, `before-cloak-back.png`).
- **Source fix (line 9959):**
  ```js
  } else if(id !== "floor"){
    const backDoor = (DOORS[id] || []).some(dr => dr.side === "back");
    propRadiator(backDoor ? Math.min(hw - 1.0, 1.7) : 0, 0.36, d-0.22, 1.4, 0);
  }
  ```
- **Runtime fix:** moves the radiator cluster (body, fins, pipe) to x = 1.7 (`after-corridor-back.png`).

### 5. Senate: the outermost horseshoe desk and chair stand in the Supreme Court door
- **Room / object:** Senate Chamber, left-wall door to `court` (at 0.5, so z 6.5). Desk at (-5.9, 7.62), chair at (-6.43, 7.31), from `buildHigherRoom` lines 26956–26968.
- **Problem:** `if(Math.abs(x) > hw - 0.8 || z < 1.6) continue;` only tests the desk centre against the wall. Nothing checks the chair (r + 0.62) or the doors, so the outer row (r = 6.8, th = ±1.05) lands its chair in the doorway (`before-senate.png`).
- **Source fix:** after computing `cx2, cz2` (line 26965):
  ```js
  const inDoor = (DOORS.senate || []).some(dr => dr.side !== "front" &&
    Math.hypot(doorAt("senate", dr).x - cx2, doorAt("senate", dr).z - cz2) < 1.6);
  if(inDoor) continue;            /* skip this seat; the horseshoe keeps its other places */
  ```
  Put this before `propDesk` so the desk is skipped too.
- **Runtime fix:** moves the desk, chair and papers 0.95 m back along z and 0.15 m inward (`after-senate.png`).

### 6. Visitor office: back-wall furniture is outside the room
- **Room / object:** `visit` (8 × 9) reuses the office (9 × 11) layout at fixed z. Pieces outside the back wall at z = 9:
  - member chair, z 8.83–9.27 (line 9316)
  - short bookcase, z 8.57–10.13 (line 9694)
  - coat stand, z 9.35–9.78 (line 9697)
  - waste bin, z 9.40–9.70 (line 9703)
- **Problem:** they stick through or sit behind the back wall and can't be seen (`before-visit*.png`).
- **Source fix:** make the back row relative to `d`:
  ```js
  propChair(woodMat, leather, 0, Math.min(9.05, d - 0.45), Math.PI);          /* 9316 */
  propShelf(-hw+0.35, Math.min(9.35, d - 0.95), Math.PI/2, 1.55, 1.55);       /* 9694 */
  propCoatStand(hw-0.72, Math.min(9.55, d - 0.35));                           /* 9697 */
  addBox(matCol(0x1e2126,.8), -hw+1.35, 0.16, Math.min(9.55, d - 0.35), 0.30,0.32,0.30, 0, true); /* 9703 */
  ```
  Also update `seatsFor("office")` (line 11988) if the visit room ever uses it.
- **Runtime fix:** pulls each cluster in until it clears the wall by 8 cm (`after-visit*.png`).

## P2: visible clipping and floating

### 7. House Floor: the outer bench row runs into the side walls, and its ledge is inside the wall
- **Room / object:** House Floor benches (lines 9432–9445). The r = 4 bench is at |x| = 8.4 in a room with hw = 8.5 (back at |x| 8.74). Its writing ledge is at |x| 9.08, entirely inside the wall, and serves no row.
- **Source fix:** pitch 1.38 instead of 1.45 at line 9434 **and** line 11983 (`seatsFor("floor")`, so NPC seats stay on the benches). Skip the ledge for `r === 4`:
  ```js
  const x = (s2 ? 1 : -1) * (2.6 + r*1.38);
  ...
  if(r < 4) (function plantLedge(){ ... })();
  ```
- **Runtime fix:** hides the two in-wall ledges and pulls the outer benches in by 0.30 m.
- **Caveat:** NPC seats from `seatsFor` stay at the old x until the source fix lands. That leaves them 0.30 m toward the back of the outer bench, still on its 0.56 m depth.

### 8. Bookcases with a radiator buried in their end (office, visit, exec, govoffice)
- **Room / object:** side-wall radiators come from `propRadiator(rx, 0.36, d*0.34 / d*0.66, …)` (lines 9957–9958) and bookcases from `propShelf` (lines 9693, 27032–27034, 27057–27058).
- **Problem:** the radiators overlap the bookcase ends:
  - office: z 3.24–4.24 vs bookcase 1.55–3.55
  - visit: fully inside the bookcase
  - exec and govoffice: similar
- **Source fix:** before each `propRadiator` in that pass, push it clear of any `propShelf` on the same wall. The simplest version is to pass the shelf spans in:
  ```js
  const shelfSpans = {office:[[1.55,3.55],[8.57,10.13]], visit:[[1.55,3.55]]}[id] || [];
  const clearZ = z => { for(const [a,b] of shelfSpans) if(z+0.5 > a && z-0.5 < b) return (z < (a+b)/2) ? a-0.6 : b+0.6; return z; };
  propRadiator(rx, 0.36, clearZ(d*0.34), 1.0, Math.PI/2);
  propRadiator(rx, 0.36, clearZ(d*0.66), 1.0, Math.PI/2);
  ```
  Or move the office radiator to `d*0.38`.
- **Runtime fix:** generic. Any side-wall radiator overlapping a ≥1.3 m tall group on the same wall slides along the wall until it clears (logged in `ONUM_FF.log`).

### 9. Caucus Room: all nine water carafes float between desks
- **Room / object:** line 9790, `addCyl(..., -3.5+c2*3.5, DIM.desk+0.08, 4.0+r*2.2, ...)`. The desks are at x = -4.4 + c × 1.75 and 1.36 wide (line 9369), so x -3.5, 0 and 3.5 all fall in the gaps between desks.
- **Source fix:** `addCyl(matCol(0xdfe6ea,.18,.1), -4.4+c2*3.5, DIM.desk + 0.08, 4.0+r*2.2, 0.04,0.12);`, which puts them on desks c = 0, 2, 4.
- **Also:** the glass at line 9787 (`-0.5, DIM.desk+0.08, d-2.25`) hangs beside the lectern at desk height with no desk under it. Fix: `addCyl(matCol(0xc7cdd2,.35), -0.78, 0.31, d-1.70, 0.05,0.14);`, on the low dais step.
- **Runtime fix:** does both (`after-caucus.png`).

### 10. Press Gallery: the TV hangs 0.5 m off the wall
- **Room / object:** lines 9665–9666. The monitor case is at `-hw+0.55`, about 0.51 m into the room, at y 1.25–2.15, with nothing behind or under it.
- **Source fix:** `-hw+0.07` for the case and `-hw+0.12` for the screen.
- **Runtime fix:** moves both 0.48 m to the wall (`after-press.png`).

### 11. Cloakroom: coat #8 hangs inside the potted plant
- **Room / object:** line 9347 (`for(let i=0;i<8;i++)`, last coat at z 7.35) and line 9759 (`propPlant(-hw+1.0, 7.4, 1.0)`, same x).
- **Source fix:** `i<7`, or move the plant to `propPlant(-hw+1.0, 8.05, 1.0)`.
- **Runtime fix:** hides coat #8.

## P3: noted, not changed
- **Steps:** the "The District" sign stand and brass post sit right on the `doorAt("steps", front)` spot at z 1.05 (box z 0.79–1.31). This reads as intentional (the exit marker), but the player's door trigger point is inside a solid. Consider z 0.55.
- **Court:** the tall chair-back panels (line 26993) start at y 1.28, 4 cm above the chair backs. Harmless gap.
- **Hanging coats and coat-stand coats** register as "floating" only because they have no hook mesh. Cosmetic.
- **Doors vs frames:** no misaligned leaves found. All door leaves sit within their jambs in the rooms I screenshotted (office, corridor, cloak, senate, floor).

## Runtime script: neptune/onum-furniture-fixes.js
- **Load:** `<script src="neptune/onum-furniture-fixes.js"></script>` after the game script.
- **Hook:** the game is a strict IIFE, so the script hooks `THREE.Scene.prototype.onBeforeRender`, which three r128 calls on every `render()`. It does a cheap per-frame change check on each large scene group, identifies the room by its floor slab (w × d), and applies only that room's fixes.
- **Safety:** every object it touches is tagged `userData.__onumFF`, so nothing moves twice. Missing objects are skipped. Each fix is wrapped in `try/catch`.
- **Debug:** `ONUM_FF.log` lists what was changed. `ONUM_FF.disabled = true` turns it off.
- **Tested:**
  - headless Chrome on the QA copy: all 14 rooms built with the script loaded, zero console errors or page errors, about 25 fixes logged
  - the real `session.html` at :8833 with the script injected: installed, no new errors. The only errors are 6 resource 404s that the stock page also produces.
