// onum-materials.js — procedural PBR surfaces for "One Nation, Under, ME."
// Self-contained ES module. THREE is passed in (tested against r128, the build inlined in session.html).
// No network, no external files, no Math.random (seeded mulberry32).
// Maps per material: albedo (sRGB), normal (tangent space, OpenGL +Y), and ORM packed
// (R = ambient occlusion, G = roughness, B = metalness) used as aoMap + roughnessMap + metalnessMap.
// NOTE (r128): aoMap reads the uv2 attribute. Call ensureUv2(geometry) or AO is ignored.

export const MATERIAL_NAMES = ['marble', 'wood_panel', 'carpet', 'brass', 'limestone', 'asphalt',
  'wet_pavement', 'suit_wool', 'leather', 'flag_cloth'];
export const QUALITY_SIZES = { low: 256, med: 512, high: 1024 };

// ---------- seeded helpers ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const fract = x => x - Math.floor(x);

// Tileable value-noise fBm field (S x S), base frequency fx/fy must be integers. Output ~[0,1].
function fbm(S, seed, fx, fy, oct = 5, gain = 0.5) {
  const out = new Float32Array(S * S); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) {
    const px = Math.max(1, Math.round(fx * (1 << o))), py = Math.max(1, Math.round(fy * (1 << o)));
    const r = mulberry32(seed * 977 + o * 131 + 7), lat = new Float32Array(px * py);
    for (let i = 0; i < lat.length; i++) lat[i] = r();
    const xs = new Int32Array(S), xs1 = new Int32Array(S), xw = new Float32Array(S);
    for (let x = 0; x < S; x++) { const u = x / S * px, i = Math.floor(u), f = u - i;
      xs[x] = i % px; xs1[x] = (i + 1) % px; xw[x] = f * f * (3 - 2 * f); }
    for (let y = 0; y < S; y++) {
      const v = y / S * py, j = Math.floor(v), g0 = v - j, g = g0 * g0 * (3 - 2 * g0);
      const r0 = (j % py) * px, r1 = ((j + 1) % py) * px, row = y * S;
      for (let x = 0; x < S; x++) {
        const a = lat[r0 + xs[x]], b = lat[r0 + xs1[x]], c = lat[r1 + xs[x]], d = lat[r1 + xs1[x]], w = xw[x];
        out[row + x] += amp * ((a + (b - a) * w) * (1 - g) + (c + (d - c) * w) * g);
      }
    }
    tot += amp; amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}
// Tileable Worley (F1, F2) with n x n cells
function worley(S, seed, n) {
  const r = mulberry32(seed * 31 + 5), pts = new Float32Array(n * n * 2);
  for (let i = 0; i < n * n; i++) { pts[i * 2] = r(); pts[i * 2 + 1] = r(); }
  const F1 = new Float32Array(S * S), F2 = new Float32Array(S * S), ID = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S * n, v = y / S * n, ci = Math.floor(u), cj = Math.floor(v);
    let d1 = 9, d2 = 9, id = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const cx = ci + di, cy = cj + dj, wx = ((cx % n) + n) % n, wy = ((cy % n) + n) % n, k = wy * n + wx;
      const dx = cx + pts[k * 2] - u, dy = cy + pts[k * 2 + 1] - v, d = Math.sqrt(dx * dx + dy * dy);
      if (d < d1) { d2 = d1; d1 = d; id = k; } else if (d < d2) d2 = d;
    }
    const i = y * S + x; F1[i] = d1; F2[i] = d2; ID[i] = fract(Math.sin(id * 12.9898 + seed) * 43758.5453);
  }
  return { F1, F2, ID };
}
// separable wrap box blur
function blur(src, S, rad) {
  const tmp = new Float32Array(S * S), out = new Float32Array(S * S), n = rad * 2 + 1;
  for (let y = 0; y < S; y++) { let s = 0; const row = y * S;
    for (let k = -rad; k <= rad; k++) s += src[row + ((k % S) + S) % S];
    for (let x = 0; x < S; x++) { tmp[row + x] = s / n; s += src[row + (x + rad + 1) % S] - src[row + ((x - rad) % S + S) % S]; } }
  for (let x = 0; x < S; x++) { let s = 0;
    for (let k = -rad; k <= rad; k++) s += tmp[(((k % S) + S) % S) * S + x];
    for (let y = 0; y < S; y++) { out[y * S + x] = s / n; s += tmp[((y + rad + 1) % S) * S + x] - tmp[(((y - rad) % S + S) % S) * S + x]; } }
  return out;
}

// ---------- material recipes ----------
// Each returns {alb:Float32Array(S*S*3) sRGB 0..1, h:height 0..1, rough, metal(optional number|array), nStrength, aoStrength, post(ctx,S)?}
const R = {};

R.marble = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const w1 = fbm(S, 11, 3, 3, 6), w2 = fbm(S, 12, 4, 4, 6), cl = fbm(S, 13, 2, 2, 5), fine = fbm(S, 14, 16, 16, 3);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const a = Math.abs(Math.sin(Math.PI * 2 * (1 * u + 1 * v + 2.2 * w1[i]))); // main vein (diagonal, tiles: k integer)
    const b = Math.abs(Math.sin(Math.PI * 2 * (2 * u - 1 * v + 2.8 * w2[i])));
    const vein = Math.pow(1 - a, 9) * 0.75 + Math.pow(1 - b, 22) * 0.45 + Math.pow(1 - a, 3) * 0.12;
    const cloud = (cl[i] - 0.5) * 0.10;
    let r = 0.93 + cloud, g = 0.915 + cloud, bl = 0.89 + cloud * 1.1;     // warm Carrara white
    const vv = clamp(vein);
    r = mix(r, 0.40, vv); g = mix(g, 0.40, vv); bl = mix(bl, 0.43, vv);   // grey veins
    const gold = Math.pow(1 - b, 14) * sstep(0.55, 0.75, w1[i]) * 0.35;      // faint gold seam
    r = mix(r, 0.78, gold); g = mix(g, 0.66, gold); bl = mix(bl, 0.45, gold);
    // thin tile joint at texture edge
    const j = Math.min(x, S - 1 - x, y, S - 1 - y) / S, joint = 1 - sstep(0.0008, 0.0035, j);
    r = mix(r, 0.62, joint); g = mix(g, 0.60, joint); bl = mix(bl, 0.56, joint);
    alb[i * 3] = r; alb[i * 3 + 1] = g; alb[i * 3 + 2] = bl;
    h[i] = 0.5 - joint * 0.5 - vv * 0.03 + fine[i] * 0.02;
    rough[i] = clamp(0.07 + vv * 0.10 + (fine[i] - 0.5) * 0.08 + joint * 0.5);
  }
  return { alb, h, rough, metal: 0, nStrength: 2, aoStrength: 0.6, physical: { clearcoat: 0.6, clearcoatRoughness: 0.06 } };
};

R.wood_panel = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const grain = fbm(S, 21, 2, 1, 5), fine = fbm(S, 22, 64, 2, 3), warp = fbm(S, 23, 4, 1, 4), pores = fbm(S, 24, 128, 8, 2);
  const planks = 4, r = mulberry32(25), tint = [], off = [];
  for (let k = 0; k < planks; k++) { tint.push(0.85 + r() * 0.3); off.push(r() * 10); }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S, pu = u * planks, k = Math.floor(pu), fu = pu - k;
    // frame + raised panel: rail at top/bottom of each plank tile (v), stile groove at plank edges (u)
    const edgeU = Math.min(fu, 1 - fu), edgeV = Math.min(v, 1 - v);
    const groove = 1 - sstep(0.0, 0.035, edgeU);                 // V-groove between planks
    const bevel = sstep(0.06, 0.10, edgeU) * sstep(0.04, 0.08, edgeV); // raised inner panel
    const rings = fract((u * 6 + off[k] + warp[i] * 1.6 + grain[i] * 0.8) * 3.0);
    const ring = Math.pow(Math.abs(rings * 2 - 1), 3);
    const t = tint[k];
    let cr = (0.27 + ring * 0.09 + (fine[i] - 0.5) * 0.08) * t, cg = (0.125 + ring * 0.05 + (fine[i] - 0.5) * 0.04) * t, cb = (0.06 + ring * 0.025) * t;
    const pore = sstep(0.62, 0.8, pores[i]) * 0.25;
    cr *= 1 - pore; cg *= 1 - pore; cb *= 1 - pore;
    cr *= 1 - groove * 0.6; cg *= 1 - groove * 0.6; cb *= 1 - groove * 0.6;
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = 0.35 + bevel * 0.4 - groove * 0.35 - pore * 0.05 + fine[i] * 0.02;
    rough[i] = clamp(0.28 + pore * 0.4 + groove * 0.3 + (fine[i] - 0.5) * 0.1);
  }
  return { alb, h, rough, metal: 0, nStrength: 3, aoStrength: 1, physical: { clearcoat: 0.8, clearcoatRoughness: 0.12 } };
};

R.carpet = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const fib = fbm(S, 31, Math.max(64, S / 4), Math.max(64, S / 4), 2), tuft = fbm(S, 32, 32, 32, 2), wear = fbm(S, 33, 2, 2, 5);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    // capitol-style medallion: diamond lattice + border
    const du = Math.abs(fract(u * 2) - 0.5), dv = Math.abs(fract(v * 2) - 0.5), dia = du + dv;
    const ringM = 1 - sstep(0.012, 0.03, Math.abs(dia - 0.32));
    const star = 1 - sstep(0.06, 0.1, Math.max(du, dv) * (0.6 + 0.4 * Math.abs(Math.cos(Math.atan2(dv, du) * 4))));
    const diag = 1 - sstep(0.008, 0.02, Math.abs(Math.abs(fract(u * 2 + v * 2) - 0.5) - 0.5) * 0.7 + 0.0);
    const gold = clamp(ringM + star * 0.9);
    const f = fib[i] * 0.7 + tuft[i] * 0.3, wv = (wear[i] - 0.5) * 0.12;
    let cr = 0.30 + (f - 0.5) * 0.16 + wv, cg = 0.045 + (f - 0.5) * 0.04, cb = 0.075 + (f - 0.5) * 0.04; // burgundy
    cr = mix(cr, 0.58 + (f - 0.5) * 0.2, gold); cg = mix(cg, 0.43 + (f - 0.5) * 0.15, gold); cb = mix(cb, 0.20, gold);
    cr *= 1 - diag * 0.18; cg *= 1 - diag * 0.18; cb *= 1 - diag * 0.18;
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = f * 0.8 + gold * 0.12;
    rough[i] = clamp(0.88 + (f - 0.5) * 0.15);
  }
  return { alb, h, rough, metal: 0, nStrength: 2.5, aoStrength: 1.4, physical: { sheen: 0.5 } };
};

R.brass = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const tarn = fbm(S, 41, 3, 3, 6), brush = fbm(S, 42, Math.max(128, S / 2), 2, 3), pit = fbm(S, 43, 48, 48, 2), smear = fbm(S, 44, 6, 2, 4);
  for (let i = 0; i < n; i++) {
    const t = sstep(0.55, 0.85, tarn[i]) * 0.55, p = sstep(0.78, 0.9, pit[i]);
    let cr = 0.90, cg = 0.72, cb = 0.40;                         // polished brass (sRGB-ish F0)
    cr = mix(cr, 0.55, t); cg = mix(cg, 0.44, t); cb = mix(cb, 0.26, t); // dulled/oxidised patches
    cr *= 1 - p * 0.4; cg *= 1 - p * 0.4; cb *= 1 - p * 0.4;
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = 0.5 + (brush[i] - 0.5) * 0.15 - p * 0.2;
    rough[i] = clamp(0.18 + (brush[i] - 0.5) * 0.18 + t * 0.35 + (smear[i] - 0.5) * 0.12 + p * 0.3);
  }
  return { alb, h, rough, metal: 1, nStrength: 1.2, aoStrength: 0.5 };
};

R.limestone = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const big = fbm(S, 51, 3, 3, 6), pore = fbm(S, 52, Math.max(64, S / 4), Math.max(64, S / 4), 2),
    streak = fbm(S, 53, 24, 2, 4), mott = fbm(S, 54, 8, 8, 4), chip = fbm(S, 55, 16, 16, 3);
  const rows = 4, r = mulberry32(56), rowOff = [], blkT = [];
  for (let k = 0; k < rows; k++) { rowOff.push(k % 2 ? 0.5 : 0); }
  for (let k = 0; k < 64; k++) blkT.push(r());
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S, rv = v * rows, row = Math.floor(rv), fv = rv - row;
    const bu = fract(u * 2 + rowOff[row]) , col = Math.floor(fract(u * 2 * 1 + rowOff[row]) * 0 + (u * 2 + rowOff[row])) % 4;
    const jU = Math.min(bu, 1 - bu) / 2, jV = Math.min(fv, 1 - fv) / rows;      // distance to joint, in tile units
    const jd = Math.min(jU, jV) + (chip[i] - 0.5) * 0.004;
    const joint = 1 - sstep(0.002, 0.0055, jd), edge = 1 - sstep(0.004, 0.02, jd);
    const bt = blkT[(row * 4 + col) & 63];
    // warm aged limestone, near-white
    const m = (mott[i] - 0.5) * 0.10 + (big[i] - 0.5) * 0.06 + (bt - 0.5) * 0.05;
    let cr = 0.80 + m * 1.4, cg = 0.755 + m * 1.35, cb = 0.645 + m * 1.2;
    // soot/rain streaks: vertical, strongest just below each course joint (fv small = top of block in canvas space)
    const s = sstep(0.5, 0.85, streak[i]) * (0.35 + 0.65 * (1 - sstep(0, 0.7, fv))) * 0.22 + sstep(0.65, 0.9, big[i]) * 0.08;
    cr -= s * 0.9; cg -= s * 0.95; cb -= s;
    const pr = sstep(0.7, 0.85, pore[i]);
    cr -= pr * 0.06; cg -= pr * 0.06; cb -= pr * 0.06;
    cr = mix(cr, 0.62, joint); cg = mix(cg, 0.58, joint); cb = mix(cb, 0.50, joint);   // mortar
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = 0.7 - joint * 0.6 - edge * 0.12 - pr * 0.05 + (mott[i] - 0.5) * 0.06 + pore[i] * 0.03;
    rough[i] = clamp(0.82 + pr * 0.1 - s * 0.15 + joint * 0.08);
  }
  return { alb, h, rough, metal: 0, nStrength: 3, aoStrength: 1.2 };
};

function asphaltBase(S, seed) {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const ag = fbm(S, seed, Math.max(96, S / 3), Math.max(96, S / 3), 2), ag2 = fbm(S, seed + 1, Math.max(48, S / 6), Math.max(48, S / 6), 2),
    patch = fbm(S, seed + 2, 3, 3, 6), crack = fbm(S, seed + 3, 4, 4, 6), oil = fbm(S, seed + 4, 2, 2, 4);
  for (let i = 0; i < n; i++) {
    const stone = sstep(0.62, 0.72, ag[i] * 0.6 + ag2[i] * 0.4), dark = sstep(0.25, 0.35, ag[i]);
    const c = Math.abs(crack[i] - 0.5), cr = (1 - sstep(0.002, 0.006, c)) * sstep(0.45, 0.6, patch[i]);
    const p = (patch[i] - 0.5) * 0.06, o = sstep(0.62, 0.8, oil[i]) * 0.05;
    let g = 0.15 + p + stone * 0.13 - (1 - dark) * 0.05 - o - cr * 0.1;
    alb[i * 3] = g; alb[i * 3 + 1] = g * 0.99; alb[i * 3 + 2] = g * 1.02;
    h[i] = 0.4 + stone * 0.35 + ag[i] * 0.15 - cr * 0.4;
    rough[i] = clamp(0.88 - stone * 0.1 + cr * 0.05);
  }
  return { alb, h, rough, patch, oil };
}
R.asphalt = (S) => { const b = asphaltBase(S, 61); return { alb: b.alb, h: b.h, rough: b.rough, metal: 0, nStrength: 3, aoStrength: 1.2 }; };
R.wet_pavement = (S) => {
  const b = asphaltBase(S, 71), n = S * S, pud = fbm(S, 78, 3, 3, 7, 0.55), damp = fbm(S, 79, 6, 6, 3);
  for (let i = 0; i < n; i++) {
    const water = sstep(0.555, 0.575, pud[i] * 0.8 + b.patch[i] * 0.2);      // standing water mask
    const wet = 0.75 + 0.25 * sstep(0.3, 0.6, damp[i]);                       // everything damp
    const k = mix(1 - 0.35 * wet, 0.45, water);                              // wet darkening
    b.alb[i * 3] *= k; b.alb[i * 3 + 1] *= k; b.alb[i * 3 + 2] *= k * 1.03;
    b.rough[i] = clamp(mix(b.rough[i] * mix(1, 0.55, wet), 0.03, water));
    b.h[i] = mix(b.h[i], 0.55, water);                                       // water fills the texture flat
  }
  return { alb: b.alb, h: b.h, rough: b.rough, metal: 0, nStrength: 3, aoStrength: 0.9 };
};

R.suit_wool = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const fz = fbm(S, 81, Math.max(128, S / 2), Math.max(128, S / 2), 2), mott = fbm(S, 82, 6, 6, 4);
  const tw = S / 4;    // twill period count across tile
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const tw1 = Math.sin(Math.PI * 2 * (u + v) * tw) * 0.5 + 0.5;              // 2/2 twill diagonal
    const thr = Math.sin(Math.PI * 2 * u * tw * 2) * 0.5 + 0.5;
    const pin = 1 - sstep(0.0015, 0.004, Math.abs(fract(u * 8) - 0.5) * 2 / 8 - 0.0); // chalk pinstripe, 8 per tile
    const f = fz[i], m = (mott[i] - 0.5) * 0.02;
    let c = 0.105 + (tw1 - 0.5) * 0.025 + (f - 0.5) * 0.04 + m;              // navy-charcoal
    let cr = c * 0.85, cg = c * 0.95, cb = c * 1.35;
    const pp = pin * (0.6 + 0.4 * sstep(0.3, 0.7, f));
    cr = mix(cr, 0.42, pp * 0.5); cg = mix(cg, 0.43, pp * 0.5); cb = mix(cb, 0.47, pp * 0.5);
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = tw1 * 0.6 + thr * 0.15 + f * 0.25;
    rough[i] = clamp(0.8 + (f - 0.5) * 0.15);
  }
  return { alb, h, rough, metal: 0, nStrength: 1.6, aoStrength: 0.7, physical: { sheen: 0.35 } };
};

R.leather = (S) => {
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const cells = Math.max(24, S / 10) | 0, w = worley(S, 91, cells), mott = fbm(S, 92, 4, 4, 5), creaseN = fbm(S, 93, 3, 3, 6), fine = fbm(S, 94, 64, 64, 2);
  for (let i = 0; i < n; i++) {
    const pebble = sstep(0, 0.12, w.F2[i] - w.F1[i]);                          // 0 in the creases between pebbles
    const crease = (1 - sstep(0.0, 0.008, Math.abs(creaseN[i] - 0.5))) * 0.5;
    const m = (mott[i] - 0.5) * 0.12 + (w.ID[i] - 0.5) * 0.03;
    let cr = 0.20 + m * 0.8, cg = 0.075 + m * 0.4, cb = 0.05 + m * 0.3;            // oxblood
    const dk = (1 - pebble) * 0.22 + crease * 0.3;
    cr *= 1 - dk; cg *= 1 - dk; cb *= 1 - dk;
    alb[i * 3] = cr; alb[i * 3 + 1] = cg; alb[i * 3 + 2] = cb;
    h[i] = pebble * 0.6 - crease * 0.3 + fine[i] * 0.05 + 0.2;
    rough[i] = clamp(0.38 + (1 - pebble) * 0.25 + (fine[i] - 0.5) * 0.1 + crease * 0.2 - sstep(0.6, 0.8, mott[i]) * 0.12);
  }
  return { alb, h, rough, metal: 0, nStrength: 2.2, aoStrength: 1, physical: { clearcoat: 0.25, clearcoatRoughness: 0.35 } };
};

R.flag_cloth = (S) => {
  // Full flag across the 0..1 UV square (meant for a ~1.9:1 plane, repeat 1). 13 stripes, canton 0.4 x 7/13.
  const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
  const fz = fbm(S, 101, Math.max(64, S / 4), Math.max(64, S / 4), 2), dirt = fbm(S, 102, 3, 2, 5);
  const wv = Math.max(64, S / 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const stripe = Math.floor(v * 13), red = stripe % 2 === 0, canton = u < 0.4 && v < 7 / 13;
    let cr, cg, cb;
    if (canton) { cr = 0.12; cg = 0.15; cb = 0.33; } else if (red) { cr = 0.66; cg = 0.10; cb = 0.15; } else { cr = 0.93; cg = 0.92; cb = 0.88; }
    const weave = (Math.sin(Math.PI * 2 * u * wv) * Math.sin(Math.PI * 2 * v * wv)) * 0.5 + 0.5;
    const k = 1 - (1 - weave) * 0.08 - (fz[i] - 0.5) * 0.06 - sstep(0.6, 0.9, dirt[i]) * 0.06;
    alb[i * 3] = cr * k; alb[i * 3 + 1] = cg * k; alb[i * 3 + 2] = cb * k;
    h[i] = weave * 0.7 + fz[i] * 0.3;
    rough[i] = clamp(0.78 + (fz[i] - 0.5) * 0.1);
  }
  const post = (ctx, S) => {          // 50 stars, drawn squeezed so they look round on a 1.9:1 flag
    ctx.fillStyle = '#efeee8';
    const cw = 0.4 * S, ch = 7 / 13 * S, rr = ch * 0.0616 / 2 * 1.0;
    for (let row = 0; row < 9; row++) { const cnt = row % 2 ? 5 : 6;
      for (let c = 0; c < cnt; c++) {
        const cx = (row % 2 ? (c + 1) * 2 : c * 2 + 1) / 12 * cw, cy = (row + 1) / 10 * ch;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1 / 1.9, 1); ctx.beginPath();
        for (let p = 0; p < 10; p++) { const a = -Math.PI / 2 + p * Math.PI / 5, rad = (p % 2 ? 0.382 : 1) * rr * 1.9 * 1.25;
          ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
        ctx.closePath(); ctx.fill(); ctx.restore();
      } }
  };
  return { alb, h, rough, metal: 0, nStrength: 1.3, aoStrength: 0.6, post, physical: { sheen: 0.4 }, side: 'double' };
};

// ---------- texture building ----------
function makeCanvas(S) {
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(S, S);
  const c = document.createElement('canvas'); c.width = c.height = S; return c;
}
const canvasCache = new Map();   // name|S -> {albedo, normal, orm, desc, ms}
const textureCache = new Map();  // name|S|repeat -> {map, normalMap, ormMap}

function buildCanvases(name, S) {
  const key = name + '|' + S; if (canvasCache.has(key)) return canvasCache.get(key);
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const d = R[name](S), n = S * S;
  // AO from cavity (height vs. blurred height) at two radii
  const b1 = blur(d.h, S, Math.max(1, S >> 7)), b2 = blur(d.h, S, Math.max(2, S >> 5));
  const A = makeCanvas(S), N = makeCanvas(S), O = makeCanvas(S);
  const ia = new ImageData(S, S), inn = new ImageData(S, S), io = new ImageData(S, S);
  const ns = d.nStrength * S / 256;      // keep apparent bump constant across quality
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, p = i * 4;
    const hL = d.h[y * S + (x - 1 + S) % S], hR = d.h[y * S + (x + 1) % S], hU = d.h[((y - 1 + S) % S) * S + x], hD = d.h[((y + 1) % S) * S + x];
    let nx = -(hR - hL) * ns, ny = (hD - hU) * ns, nz = 1; const l = 1 / Math.sqrt(nx * nx + ny * ny + 1);
    nx *= l; ny *= l; nz *= l;
    inn.data[p] = (nx * 0.5 + 0.5) * 255; inn.data[p + 1] = (ny * 0.5 + 0.5) * 255; inn.data[p + 2] = (nz * 0.5 + 0.5) * 255; inn.data[p + 3] = 255;
    const ao = clamp(1 - d.aoStrength * (Math.max(0, b1[i] - d.h[i]) * 1.6 + Math.max(0, b2[i] - d.h[i]) * 1.2));
    const met = typeof d.metal === 'number' ? d.metal : d.metal[i];
    io.data[p] = ao * 255; io.data[p + 1] = clamp(d.rough[i]) * 255; io.data[p + 2] = met * 255; io.data[p + 3] = 255;
    ia.data[p] = clamp(d.alb[i * 3]) * 255; ia.data[p + 1] = clamp(d.alb[i * 3 + 1]) * 255; ia.data[p + 2] = clamp(d.alb[i * 3 + 2]) * 255; ia.data[p + 3] = 255;
  }
  const ca = A.getContext('2d'); ca.putImageData(ia, 0, 0); if (d.post) d.post(ca, S);
  N.getContext('2d').putImageData(inn, 0, 0); O.getContext('2d').putImageData(io, 0, 0);
  const ms = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  const out = { albedo: A, normal: N, orm: O, desc: d, ms };
  delete d.alb; delete d.h; delete d.rough;   // free float fields
  canvasCache.set(key, out); return out;
}

function setSRGB(THREE, tex) {
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; else tex.encoding = THREE.sRGBEncoding;
}

export function getTextures(name, THREE, { repeat = 1, quality = 'med', anisotropy = 4 } = {}) {
  if (!R[name]) throw new Error('onum-materials: unknown material "' + name + '". Known: ' + MATERIAL_NAMES.join(', '));
  const S = QUALITY_SIZES[quality] || QUALITY_SIZES.med;
  const rp = Array.isArray(repeat) ? repeat : [repeat, repeat];
  const key = name + '|' + S + '|' + rp.join('x');
  if (textureCache.has(key)) return textureCache.get(key);
  const c = buildCanvases(name, S), mk = (cv, srgb) => {
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rp[0], rp[1]);
    t.anisotropy = anisotropy; if (srgb) setSRGB(THREE, t); t.needsUpdate = true; return t; };
  const tx = { map: mk(c.albedo, true), normalMap: mk(c.normal), ormMap: mk(c.orm), genMs: c.ms, size: S };
  textureCache.set(key, tx); return tx;
}

export function makeMaterial(name, THREE, opts = {}) {
  const tx = getTextures(name, THREE, opts), d = canvasCache.get(name + '|' + tx.size).desc;
  const usePhys = opts.physical !== false && d.physical && THREE.MeshPhysicalMaterial;
  const base = { map: tx.map, normalMap: tx.normalMap, roughnessMap: tx.ormMap, metalnessMap: tx.ormMap, aoMap: tx.ormMap,
    roughness: 1, metalness: 1, aoMapIntensity: 1, envMapIntensity: opts.envMapIntensity ?? 1 };
  if (d.side === 'double') base.side = THREE.DoubleSide;
  let m;
  if (usePhys) {
    m = new THREE.MeshPhysicalMaterial(base);
    const p = d.physical;
    if (p.clearcoat) { m.clearcoat = p.clearcoat; m.clearcoatRoughness = p.clearcoatRoughness; }
    if (p.sheen) { if (typeof m.sheen === 'number') m.sheen = p.sheen; else if (m.sheen && m.sheen.isColor) m.sheen.setScalar(p.sheen * 0.25); else if (THREE.Color) m.sheen = new THREE.Color().setScalar(p.sheen * 0.25); }
  } else m = new THREE.MeshStandardMaterial(base);
  m.name = 'onum:' + name;
  m.normalScale.set(1, 1);
  return m;
}

// r128 aoMap needs a second UV set; copy uv -> uv2.
export function ensureUv2(geometry) {
  if (geometry.attributes.uv && !geometry.attributes.uv2) geometry.setAttribute('uv2', geometry.attributes.uv);
  return geometry;
}

// Bytes of GPU memory for the textures in cache (3 RGBA8 maps + mip chain ≈ 4/3).
export function textureMemoryBytes() { let b = 0; for (const t of textureCache.values()) b += 3 * t.size * t.size * 4 * 4 / 3; return Math.round(b); }

export function disposeAll() { for (const t of textureCache.values()) { t.map.dispose(); t.normalMap.dispose(); t.ormMap.dispose(); }
  textureCache.clear(); canvasCache.clear(); }

export default { makeMaterial, getTextures, ensureUv2, MATERIAL_NAMES, QUALITY_SIZES, textureMemoryBytes, disposeAll };
