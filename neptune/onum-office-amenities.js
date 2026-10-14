// onum-office-amenities.js — coffee machine, mug and bed for extra offices in "The Long Session".
// Plain script (not a module): defines window.addOfficeAmenities. THREE is passed in (tested on r128,
// the build inlined in session.html). No network, no external files, no Math.random (seeded mulberry32).
//
// ── HOOKING IT IN (for JUPITER) ──────────────────────────────────────────────
//   1. Load after three:   <script src="neptune/onum-office-amenities.js"></script>
//      (or paste the file into session.html's script block.)
//   2. In the room build, after walls/furniture are added to roomGroup:
//        const amen = addOfficeAmenities(THREE, roomGroup, {
//          bounds: {minX:-hw, maxX:hw, minZ:0, maxZ:d, floorY:0},  // or a THREE.Box3
//          doorPos: new THREE.Vector3(doorX, 0, doorZ),            // or {x, z}
//          seed: hashOf(roomId)                                    // any integer
//        });
//        amen.forEach(a => INTERACT.push({id:a.kind === 'bed' ? 'sofa' : 'urn',
//          x:a.pos.x, z:a.pos.z, r:a.radius}));   // reuse the existing coffee / sleep handlers
//   3. Glow pulses itself via onBeforeRender (needs nothing). If your loop calls
//      obj.userData.update(t) on room children, that works too.
//   4. Room teardown: dispose as usual; labels own their CanvasTexture (mesh.userData.dispose()).
//
// ── ASSUMPTIONS ──────────────────────────────────────────────────────────────
//   * bounds are in roomGroup-local coords, y-up, the four walls are the inner faces at
//     minX/maxX/minZ/maxZ. A Box3 uses min.y as floorY. Plain object floorY defaults to 0.
//   * Desk height 0.74 (DIM.desk). Colours copy the first office (coffee pot 0x2e3238 / lid
//     0x8c8f94 metal, oak woodMat, oxblood leather like the cloakroom sofa). TEX.oak / TEX.leather
//     are not reachable from here, so flat MeshStandardMaterials with matching tones are used.
//   * Walls closest to the door are avoided: the door wall is never used, and any spot within
//     1.6 m of the door is rejected.
(function (root) {
  'use strict';
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  const DESK = 0.74;
  const COL = { pot: 0x2e3238, lid: 0x8c8f94, oak: 0x6b4a2e, oakDark: 0x4a3220, leather: 0x5a2a22,
    linen: 0xe8e4d8, wool: 0x2f4a6a, mug: 0xe8e4d8, coffee: 0x2a1a10, glow: 0xffd9a0 };

  function normBounds(THREE, b) {
    if (b && b.isBox3) return { minX: b.min.x, maxX: b.max.x, minZ: b.min.z, maxZ: b.max.z, floorY: b.min.y };
    b = b || {};
    return { minX: b.minX ?? -4, maxX: b.maxX ?? 4, minZ: b.minZ ?? 0, maxZ: b.maxZ ?? 8, floorY: b.floorY ?? 0 };
  }

  function labelSprite(THREE, text) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(20,18,16,0.72)';
    const r = 28; g.beginPath(); g.moveTo(r, 4); g.arcTo(508, 4, 508, 92, r); g.arcTo(508, 92, 4, 92, r);
    g.arcTo(4, 92, 4, 4, r); g.arcTo(4, 4, 508, 4, r); g.fill();
    g.strokeStyle = 'rgba(255,217,160,0.8)'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#f3ead8'; g.font = '600 40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 50, 480);
    const tex = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    s.scale.set(1.6, 0.3, 1); s.renderOrder = 999; s.name = 'amenityLabel';
    return s;
  }

  // Wrap every mesh in group with a slightly scaled BackSide emissive shell; one shared pulsing material.
  function addGlow(THREE, group, phase) {
    const mat = new THREE.MeshBasicMaterial({ color: COL.glow, side: THREE.BackSide, transparent: true,
      opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending });
    const shells = [];
    group.traverse(o => { if (o.isMesh) shells.push(o); });
    shells.forEach(o => {
      const sh = new THREE.Mesh(o.geometry, mat);
      sh.name = 'amenityGlow'; sh.scale.setScalar(1.06); sh.raycast = () => {};
      o.add(sh);
    });
    const pulse = t => { mat.opacity = 0.14 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2.2 + phase)); };
    const first = group.getObjectByName('amenityGlow');
    if (first) first.onBeforeRender = () => pulse(performance.now() / 1000);
    group.userData.update = t => pulse(t);
    return mat;
  }

  function box(THREE, mat, x, y, z, w, h, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
  }
  function cyl(THREE, mat, x, y, z, r, h, rTop) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop ?? r, r, h, 20), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
  }

  // Local frame: back against the wall at z=0, facing +z.
  function buildCoffee(THREE, M) {
    const g = new THREE.Group(); g.name = 'amenityCoffee';
    const body = new THREE.Group(); // stand + machine (gets glow)
    body.add(box(THREE, M.oak, 0, DESK - 0.02, 0.25, 0.70, 0.04, 0.48));               // stand top
    [[-0.31, 0.05], [0.31, 0.05], [-0.31, 0.45], [0.31, 0.45]].forEach(f =>
      body.add(box(THREE, M.oakDark, f[0], (DESK - 0.04) / 2, f[1], 0.05, DESK - 0.04, 0.05)));
    body.add(box(THREE, M.pot, -0.08, DESK + 0.17, 0.14, 0.26, 0.34, 0.22));           // machine tower
    body.add(box(THREE, M.pot, -0.08, DESK + 0.36, 0.22, 0.26, 0.05, 0.38));           // head
    body.add(cyl(THREE, M.pot, -0.08, DESK + 0.10, 0.32, 0.09, 0.20));                // pot (as first office)
    body.add(cyl(THREE, M.lid, -0.08, DESK + 0.235, 0.32, 0.05, 0.07));               // lid
    g.add(body);
    const mug = new THREE.Group(); mug.name = 'amenityMug';
    mug.add(cyl(THREE, M.mug, 0, 0.05, 0, 0.042, 0.10, 0.045));
    const top = cyl(THREE, M.coffee, 0, 0.096, 0, 0.038, 0.006); mug.add(top);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), M.mug);
    handle.position.set(0.048, 0.05, 0); mug.add(handle);
    mug.position.set(0.20, DESK, 0.28); mug.rotation.y = 0.6;
    g.add(mug);
    return { g, radius: 1.2, depth: 0.5, width: 0.7 };
  }

  function buildBed(THREE, M) {
    const g = new THREE.Group(); g.name = 'amenityBed';
    const W = 1.0, L = 2.0; // head against the wall, length along +z
    [[-0.44, 0.06], [0.44, 0.06], [-0.44, L - 0.06], [0.44, L - 0.06]].forEach(f =>
      g.add(box(THREE, M.oak, f[0], 0.05, f[1], 0.08, 0.10, 0.08)));                  // feet like the sofa
    g.add(box(THREE, M.oak, 0, 0.17, L / 2, W, 0.14, L));                              // frame
    g.add(box(THREE, M.oakDark, 0, 0.55, 0.04, W + 0.06, 0.90, 0.08));                 // headboard
    g.add(box(THREE, M.oakDark, 0, 0.32, L - 0.03, W + 0.06, 0.44, 0.06));             // footboard
    g.add(box(THREE, M.leather, 0, 0.30, L / 2, W - 0.06, 0.12, L - 0.14));             // mattress
    g.add(box(THREE, M.linen, 0, 0.395, 0.32, 0.62, 0.10, 0.34));                      // pillow
    g.add(box(THREE, M.wool, 0, 0.375, L * 0.62, W - 0.02, 0.04, L * 0.66));           // blanket
    return { g, radius: 1.8, depth: L, width: W + 0.06 };
  }

  function addOfficeAmenities(THREE, roomGroup, opts) {
    opts = opts || {};
    const B = normBounds(THREE, opts.bounds);
    const rnd = mulberry32((opts.seed >>> 0) || 1);
    const dp = opts.doorPos || { x: (B.minX + B.maxX) / 2, z: B.minZ };
    const door = { x: dp.x, z: dp.z };
    const M = {
      pot: new THREE.MeshStandardMaterial({ color: COL.pot, roughness: 0.5, metalness: 0.3 }),
      lid: new THREE.MeshStandardMaterial({ color: COL.lid, roughness: 0.4, metalness: 0.6 }),
      oak: new THREE.MeshStandardMaterial({ color: COL.oak, roughness: 0.6 }),
      oakDark: new THREE.MeshStandardMaterial({ color: COL.oakDark, roughness: 0.65 }),
      leather: new THREE.MeshStandardMaterial({ color: COL.leather, roughness: 0.85 }),
      linen: new THREE.MeshStandardMaterial({ color: COL.linen, roughness: 0.95 }),
      wool: new THREE.MeshStandardMaterial({ color: COL.wool, roughness: 0.9 }),
      mug: new THREE.MeshStandardMaterial({ color: COL.mug, roughness: 0.35 }),
      coffee: new THREE.MeshStandardMaterial({ color: COL.coffee, roughness: 0.2 })
    };
    // Walls: origin point on wall, inward normal, tangent, length.
    const walls = [
      { n: 'minZ', o: [B.minX, B.minZ], t: [1, 0], in: [0, 1], len: B.maxX - B.minX },
      { n: 'maxZ', o: [B.maxX, B.maxZ], t: [-1, 0], in: [0, -1], len: B.maxX - B.minX },
      { n: 'minX', o: [B.minX, B.maxZ], t: [0, -1], in: [1, 0], len: B.maxZ - B.minZ },
      { n: 'maxX', o: [B.maxX, B.minZ], t: [0, 1], in: [-1, 0], len: B.maxZ - B.minZ }
    ];
    const distToWall = w => w.n === 'minZ' ? Math.abs(door.z - B.minZ) : w.n === 'maxZ' ? Math.abs(door.z - B.maxZ)
      : w.n === 'minX' ? Math.abs(door.x - B.minX) : Math.abs(door.x - B.maxX);
    const doorWall = walls.reduce((a, b) => distToWall(b) < distToWall(a) ? b : a);
    const free = walls.filter(w => w !== doorWall).sort((a, b) => rnd() - 0.5);
    const placed = [];
    function place(item, kind) {
      const half = item.width / 2 + 0.25;
      for (let tries = 0; tries < 40; tries++) {
        const w = free[tries % free.length];
        if (w.len < half * 2 + 0.2) continue;
        const s = half + rnd() * (w.len - half * 2);
        const wx = w.o[0] + w.t[0] * s, wz = w.o[1] + w.t[1] * s;
        // centre of footprint
        const cx = wx + w.in[0] * item.depth / 2, cz = wz + w.in[1] * item.depth / 2;
        if (Math.hypot(cx - door.x, cz - door.z) < 1.6 + item.depth / 2) continue;
        if (placed.some(p => Math.hypot(p.x - cx, p.z - cz) < p.r + Math.max(item.width, item.depth) / 2 + 0.3)) continue;
        item.g.position.set(wx + w.in[0] * 0.02, B.floorY, wz + w.in[1] * 0.02);
        item.g.rotation.y = Math.atan2(w.in[0], w.in[1]); // local +z -> inward
        placed.push({ x: cx, z: cz, r: Math.max(item.width, item.depth) / 2 });
        return new THREE.Vector3(cx, B.floorY, cz);
      }
      return null;
    }
    const out = [];
    [['coffee', buildCoffee, 'Coffee \u2014 E', DESK + 0.75], ['bed', buildBed, 'Bed \u2014 E: sleep to morning', 1.15]]
      .forEach(([kind, build, text, ly], i) => {
        const item = build(THREE, M);
        const pos = place(item, kind);
        if (!pos) { if (root.console) console.warn('addOfficeAmenities: no room for', kind); return; }
        addGlow(THREE, item.g, i * 1.7);
        const lab = labelSprite(THREE, text);
        // sprite in world-ish local frame: centre of footprint
        lab.position.set(0, ly, item.depth / 2);
        item.g.add(lab);
        item.g.userData.kind = kind;
        item.g.userData.dispose = () => { lab.material.map.dispose(); lab.material.dispose(); };
        roomGroup.add(item.g);
        out.push({ mesh: item.g, kind, pos, radius: item.radius });
      });
    return out;
  }

  root.addOfficeAmenities = addOfficeAmenities;
  if (typeof module !== 'undefined' && module.exports) module.exports = { addOfficeAmenities };
})(typeof window !== 'undefined' ? window : globalThis);
