/* onum-neptune.js — classic-script bundle of onum-characters.js + onum-flags.js + onum-materials.js for file:// play (ES modules cannot load there). Generated; edit the modules, not this. */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // onum-characters.js
  var onum_characters_exports = {};
  __export(onum_characters_exports, {
    BEARDS: () => BEARDS,
    HAIR_STYLES: () => HAIR_STYLES,
    OUTFITS: () => OUTFITS,
    SKIN_TONES: () => SKIN_TONES,
    UNIFORM_STYLES: () => UNIFORM_STYLES,
    applyDressCode: () => applyDressCode,
    cacheStats: () => cacheStats,
    default: () => onum_characters_default,
    disposeCharacter: () => disposeCharacter,
    dressFor: () => dressFor,
    dressGameRig: () => dressGameRig,
    makeCharacter: () => makeCharacter,
    optionsFromLook: () => optionsFromLook,
    resolveUniform: () => resolveUniform,
    uniformLook: () => uniformLook
  });

  // onum-materials.js
  var onum_materials_exports = {};
  __export(onum_materials_exports, {
    MATERIAL_NAMES: () => MATERIAL_NAMES,
    QUALITY_SIZES: () => QUALITY_SIZES,
    default: () => onum_materials_default,
    disposeAll: () => disposeAll,
    ensureUv2: () => ensureUv2,
    getTextures: () => getTextures,
    makeMaterial: () => makeMaterial,
    textureMemoryBytes: () => textureMemoryBytes
  });
  var MATERIAL_NAMES = [
    "marble",
    "wood_panel",
    "carpet",
    "brass",
    "limestone",
    "asphalt",
    "wet_pavement",
    "suit_wool",
    "leather",
    "flag_cloth"
  ];
  var QUALITY_SIZES = { low: 256, med: 512, high: 1024 };
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  var mix = (a, b, t) => a + (b - a) * t;
  var sstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  var fract = (x) => x - Math.floor(x);
  function fbm(S, seed, fx, fy, oct = 5, gain = 0.5) {
    const out = new Float32Array(S * S);
    let amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const px = Math.max(1, Math.round(fx * (1 << o))), py = Math.max(1, Math.round(fy * (1 << o)));
      const r = mulberry32(seed * 977 + o * 131 + 7), lat = new Float32Array(px * py);
      for (let i = 0; i < lat.length; i++) lat[i] = r();
      const xs = new Int32Array(S), xs1 = new Int32Array(S), xw = new Float32Array(S);
      for (let x = 0; x < S; x++) {
        const u = x / S * px, i = Math.floor(u), f = u - i;
        xs[x] = i % px;
        xs1[x] = (i + 1) % px;
        xw[x] = f * f * (3 - 2 * f);
      }
      for (let y = 0; y < S; y++) {
        const v = y / S * py, j = Math.floor(v), g0 = v - j, g = g0 * g0 * (3 - 2 * g0);
        const r0 = j % py * px, r1 = (j + 1) % py * px, row = y * S;
        for (let x = 0; x < S; x++) {
          const a = lat[r0 + xs[x]], b = lat[r0 + xs1[x]], c = lat[r1 + xs[x]], d = lat[r1 + xs1[x]], w = xw[x];
          out[row + x] += amp * ((a + (b - a) * w) * (1 - g) + (c + (d - c) * w) * g);
        }
      }
      tot += amp;
      amp *= gain;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot;
    return out;
  }
  function worley(S, seed, n) {
    const r = mulberry32(seed * 31 + 5), pts = new Float32Array(n * n * 2);
    for (let i = 0; i < n * n; i++) {
      pts[i * 2] = r();
      pts[i * 2 + 1] = r();
    }
    const F1 = new Float32Array(S * S), F2 = new Float32Array(S * S), ID = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = x / S * n, v = y / S * n, ci = Math.floor(u), cj = Math.floor(v);
      let d1 = 9, d2 = 9, id = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const cx = ci + di, cy = cj + dj, wx = (cx % n + n) % n, wy = (cy % n + n) % n, k = wy * n + wx;
        const dx = cx + pts[k * 2] - u, dy = cy + pts[k * 2 + 1] - v, d = Math.sqrt(dx * dx + dy * dy);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          id = k;
        } else if (d < d2) d2 = d;
      }
      const i = y * S + x;
      F1[i] = d1;
      F2[i] = d2;
      ID[i] = fract(Math.sin(id * 12.9898 + seed) * 43758.5453);
    }
    return { F1, F2, ID };
  }
  function blur(src, S, rad) {
    const tmp = new Float32Array(S * S), out = new Float32Array(S * S), n = rad * 2 + 1;
    for (let y = 0; y < S; y++) {
      let s = 0;
      const row = y * S;
      for (let k = -rad; k <= rad; k++) s += src[row + (k % S + S) % S];
      for (let x = 0; x < S; x++) {
        tmp[row + x] = s / n;
        s += src[row + (x + rad + 1) % S] - src[row + ((x - rad) % S + S) % S];
      }
    }
    for (let x = 0; x < S; x++) {
      let s = 0;
      for (let k = -rad; k <= rad; k++) s += tmp[(k % S + S) % S * S + x];
      for (let y = 0; y < S; y++) {
        out[y * S + x] = s / n;
        s += tmp[(y + rad + 1) % S * S + x] - tmp[((y - rad) % S + S) % S * S + x];
      }
    }
    return out;
  }
  var R = {};
  R.marble = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const w1 = fbm(S, 11, 3, 3, 6), w2 = fbm(S, 12, 4, 4, 6), cl = fbm(S, 13, 2, 2, 5), fine = fbm(S, 14, 16, 16, 3);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, v = y / S;
      const a = Math.abs(Math.sin(Math.PI * 2 * (1 * u + 1 * v + 2.2 * w1[i])));
      const b = Math.abs(Math.sin(Math.PI * 2 * (2 * u - 1 * v + 2.8 * w2[i])));
      const vein = Math.pow(1 - a, 9) * 0.75 + Math.pow(1 - b, 22) * 0.45 + Math.pow(1 - a, 3) * 0.12;
      const cloud = (cl[i] - 0.5) * 0.1;
      let r = 0.93 + cloud, g = 0.915 + cloud, bl = 0.89 + cloud * 1.1;
      const vv = clamp(vein);
      r = mix(r, 0.4, vv);
      g = mix(g, 0.4, vv);
      bl = mix(bl, 0.43, vv);
      const gold = Math.pow(1 - b, 14) * sstep(0.55, 0.75, w1[i]) * 0.35;
      r = mix(r, 0.78, gold);
      g = mix(g, 0.66, gold);
      bl = mix(bl, 0.45, gold);
      const j = Math.min(x, S - 1 - x, y, S - 1 - y) / S, joint = 1 - sstep(8e-4, 35e-4, j);
      r = mix(r, 0.62, joint);
      g = mix(g, 0.6, joint);
      bl = mix(bl, 0.56, joint);
      alb[i * 3] = r;
      alb[i * 3 + 1] = g;
      alb[i * 3 + 2] = bl;
      h[i] = 0.5 - joint * 0.5 - vv * 0.03 + fine[i] * 0.02;
      rough[i] = clamp(0.07 + vv * 0.1 + (fine[i] - 0.5) * 0.08 + joint * 0.5);
    }
    return { alb, h, rough, metal: 0, nStrength: 2, aoStrength: 0.6, physical: { clearcoat: 0.6, clearcoatRoughness: 0.06 } };
  };
  R.wood_panel = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const grain = fbm(S, 21, 2, 1, 5), fine = fbm(S, 22, 64, 2, 3), warp = fbm(S, 23, 4, 1, 4), pores = fbm(S, 24, 128, 8, 2);
    const planks = 4, r = mulberry32(25), tint = [], off = [];
    for (let k = 0; k < planks; k++) {
      tint.push(0.85 + r() * 0.3);
      off.push(r() * 10);
    }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, v = y / S, pu = u * planks, k = Math.floor(pu), fu = pu - k;
      const edgeU = Math.min(fu, 1 - fu), edgeV = Math.min(v, 1 - v);
      const groove = 1 - sstep(0, 0.035, edgeU);
      const bevel = sstep(0.06, 0.1, edgeU) * sstep(0.04, 0.08, edgeV);
      const rings = fract((u * 6 + off[k] + warp[i] * 1.6 + grain[i] * 0.8) * 3);
      const ring = Math.pow(Math.abs(rings * 2 - 1), 3);
      const t = tint[k];
      let cr = (0.27 + ring * 0.09 + (fine[i] - 0.5) * 0.08) * t, cg = (0.125 + ring * 0.05 + (fine[i] - 0.5) * 0.04) * t, cb = (0.06 + ring * 0.025) * t;
      const pore = sstep(0.62, 0.8, pores[i]) * 0.25;
      cr *= 1 - pore;
      cg *= 1 - pore;
      cb *= 1 - pore;
      cr *= 1 - groove * 0.6;
      cg *= 1 - groove * 0.6;
      cb *= 1 - groove * 0.6;
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
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
      const du = Math.abs(fract(u * 2) - 0.5), dv = Math.abs(fract(v * 2) - 0.5), dia = du + dv;
      const ringM = 1 - sstep(0.012, 0.03, Math.abs(dia - 0.32));
      const star2 = 1 - sstep(0.06, 0.1, Math.max(du, dv) * (0.6 + 0.4 * Math.abs(Math.cos(Math.atan2(dv, du) * 4))));
      const diag = 1 - sstep(8e-3, 0.02, Math.abs(Math.abs(fract(u * 2 + v * 2) - 0.5) - 0.5) * 0.7 + 0);
      const gold = clamp(ringM + star2 * 0.9);
      const f = fib[i] * 0.7 + tuft[i] * 0.3, wv = (wear[i] - 0.5) * 0.12;
      let cr = 0.3 + (f - 0.5) * 0.16 + wv, cg = 0.045 + (f - 0.5) * 0.04, cb = 0.075 + (f - 0.5) * 0.04;
      cr = mix(cr, 0.58 + (f - 0.5) * 0.2, gold);
      cg = mix(cg, 0.43 + (f - 0.5) * 0.15, gold);
      cb = mix(cb, 0.2, gold);
      cr *= 1 - diag * 0.18;
      cg *= 1 - diag * 0.18;
      cb *= 1 - diag * 0.18;
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
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
      let cr = 0.9, cg = 0.72, cb = 0.4;
      cr = mix(cr, 0.55, t);
      cg = mix(cg, 0.44, t);
      cb = mix(cb, 0.26, t);
      cr *= 1 - p * 0.4;
      cg *= 1 - p * 0.4;
      cb *= 1 - p * 0.4;
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
      h[i] = 0.5 + (brush[i] - 0.5) * 0.15 - p * 0.2;
      rough[i] = clamp(0.18 + (brush[i] - 0.5) * 0.18 + t * 0.35 + (smear[i] - 0.5) * 0.12 + p * 0.3);
    }
    return { alb, h, rough, metal: 1, nStrength: 1.2, aoStrength: 0.5 };
  };
  R.limestone = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const big = fbm(S, 51, 3, 3, 6), pore = fbm(S, 52, Math.max(64, S / 4), Math.max(64, S / 4), 2), streak = fbm(S, 53, 24, 2, 4), mott = fbm(S, 54, 8, 8, 4), chip = fbm(S, 55, 16, 16, 3);
    const rows = 4, r = mulberry32(56), rowOff = [], blkT = [];
    for (let k = 0; k < rows; k++) {
      rowOff.push(k % 2 ? 0.5 : 0);
    }
    for (let k = 0; k < 64; k++) blkT.push(r());
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, v = y / S, rv = v * rows, row = Math.floor(rv), fv = rv - row;
      const bu = fract(u * 2 + rowOff[row]), col = Math.floor(fract(u * 2 * 1 + rowOff[row]) * 0 + (u * 2 + rowOff[row])) % 4;
      const jU = Math.min(bu, 1 - bu) / 2, jV = Math.min(fv, 1 - fv) / rows;
      const jd = Math.min(jU, jV) + (chip[i] - 0.5) * 4e-3;
      const joint = 1 - sstep(2e-3, 55e-4, jd), edge = 1 - sstep(4e-3, 0.02, jd);
      const bt = blkT[row * 4 + col & 63];
      const m = (mott[i] - 0.5) * 0.1 + (big[i] - 0.5) * 0.06 + (bt - 0.5) * 0.05;
      let cr = 0.8 + m * 1.4, cg = 0.755 + m * 1.35, cb = 0.645 + m * 1.2;
      const s = sstep(0.5, 0.85, streak[i]) * (0.35 + 0.65 * (1 - sstep(0, 0.7, fv))) * 0.22 + sstep(0.65, 0.9, big[i]) * 0.08;
      cr -= s * 0.9;
      cg -= s * 0.95;
      cb -= s;
      const pr = sstep(0.7, 0.85, pore[i]);
      cr -= pr * 0.06;
      cg -= pr * 0.06;
      cb -= pr * 0.06;
      cr = mix(cr, 0.62, joint);
      cg = mix(cg, 0.58, joint);
      cb = mix(cb, 0.5, joint);
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
      h[i] = 0.7 - joint * 0.6 - edge * 0.12 - pr * 0.05 + (mott[i] - 0.5) * 0.06 + pore[i] * 0.03;
      rough[i] = clamp(0.82 + pr * 0.1 - s * 0.15 + joint * 0.08);
    }
    return { alb, h, rough, metal: 0, nStrength: 3, aoStrength: 1.2 };
  };
  function asphaltBase(S, seed) {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const ag = fbm(S, seed, Math.max(96, S / 3), Math.max(96, S / 3), 2), ag2 = fbm(S, seed + 1, Math.max(48, S / 6), Math.max(48, S / 6), 2), patch = fbm(S, seed + 2, 3, 3, 6), crack = fbm(S, seed + 3, 4, 4, 6), oil = fbm(S, seed + 4, 2, 2, 4);
    for (let i = 0; i < n; i++) {
      const stone = sstep(0.62, 0.72, ag[i] * 0.6 + ag2[i] * 0.4), dark = sstep(0.25, 0.35, ag[i]);
      const c = Math.abs(crack[i] - 0.5), cr = (1 - sstep(2e-3, 6e-3, c)) * sstep(0.45, 0.6, patch[i]);
      const p = (patch[i] - 0.5) * 0.06, o = sstep(0.62, 0.8, oil[i]) * 0.05;
      let g = 0.15 + p + stone * 0.13 - (1 - dark) * 0.05 - o - cr * 0.1;
      alb[i * 3] = g;
      alb[i * 3 + 1] = g * 0.99;
      alb[i * 3 + 2] = g * 1.02;
      h[i] = 0.4 + stone * 0.35 + ag[i] * 0.15 - cr * 0.4;
      rough[i] = clamp(0.88 - stone * 0.1 + cr * 0.05);
    }
    return { alb, h, rough, patch, oil };
  }
  R.asphalt = (S) => {
    const b = asphaltBase(S, 61);
    return { alb: b.alb, h: b.h, rough: b.rough, metal: 0, nStrength: 3, aoStrength: 1.2 };
  };
  R.wet_pavement = (S) => {
    const b = asphaltBase(S, 71), n = S * S, pud = fbm(S, 78, 3, 3, 7, 0.55), damp = fbm(S, 79, 6, 6, 3);
    for (let i = 0; i < n; i++) {
      const water = sstep(0.555, 0.575, pud[i] * 0.8 + b.patch[i] * 0.2);
      const wet = 0.75 + 0.25 * sstep(0.3, 0.6, damp[i]);
      const k = mix(1 - 0.35 * wet, 0.45, water);
      b.alb[i * 3] *= k;
      b.alb[i * 3 + 1] *= k;
      b.alb[i * 3 + 2] *= k * 1.03;
      b.rough[i] = clamp(mix(b.rough[i] * mix(1, 0.55, wet), 0.03, water));
      b.h[i] = mix(b.h[i], 0.55, water);
    }
    return { alb: b.alb, h: b.h, rough: b.rough, metal: 0, nStrength: 3, aoStrength: 0.9 };
  };
  R.suit_wool = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const fz = fbm(S, 81, Math.max(128, S / 2), Math.max(128, S / 2), 2), mott = fbm(S, 82, 6, 6, 4);
    const tw = S / 4;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, v = y / S;
      const tw1 = Math.sin(Math.PI * 2 * (u + v) * tw) * 0.5 + 0.5;
      const thr = Math.sin(Math.PI * 2 * u * tw * 2) * 0.5 + 0.5;
      const pin = 1 - sstep(15e-4, 4e-3, Math.abs(fract(u * 8) - 0.5) * 2 / 8 - 0);
      const f = fz[i], m = (mott[i] - 0.5) * 0.02;
      let c = 0.105 + (tw1 - 0.5) * 0.025 + (f - 0.5) * 0.04 + m;
      let cr = c * 0.85, cg = c * 0.95, cb = c * 1.35;
      const pp = pin * (0.6 + 0.4 * sstep(0.3, 0.7, f));
      cr = mix(cr, 0.42, pp * 0.5);
      cg = mix(cg, 0.43, pp * 0.5);
      cb = mix(cb, 0.47, pp * 0.5);
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
      h[i] = tw1 * 0.6 + thr * 0.15 + f * 0.25;
      rough[i] = clamp(0.8 + (f - 0.5) * 0.15);
    }
    return { alb, h, rough, metal: 0, nStrength: 1.6, aoStrength: 0.7, physical: { sheen: 0.35 } };
  };
  R.leather = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const cells = Math.max(24, S / 10) | 0, w = worley(S, 91, cells), mott = fbm(S, 92, 4, 4, 5), creaseN = fbm(S, 93, 3, 3, 6), fine = fbm(S, 94, 64, 64, 2);
    for (let i = 0; i < n; i++) {
      const pebble = sstep(0, 0.12, w.F2[i] - w.F1[i]);
      const crease = (1 - sstep(0, 8e-3, Math.abs(creaseN[i] - 0.5))) * 0.5;
      const m = (mott[i] - 0.5) * 0.12 + (w.ID[i] - 0.5) * 0.03;
      let cr = 0.2 + m * 0.8, cg = 0.075 + m * 0.4, cb = 0.05 + m * 0.3;
      const dk = (1 - pebble) * 0.22 + crease * 0.3;
      cr *= 1 - dk;
      cg *= 1 - dk;
      cb *= 1 - dk;
      alb[i * 3] = cr;
      alb[i * 3 + 1] = cg;
      alb[i * 3 + 2] = cb;
      h[i] = pebble * 0.6 - crease * 0.3 + fine[i] * 0.05 + 0.2;
      rough[i] = clamp(0.38 + (1 - pebble) * 0.25 + (fine[i] - 0.5) * 0.1 + crease * 0.2 - sstep(0.6, 0.8, mott[i]) * 0.12);
    }
    return { alb, h, rough, metal: 0, nStrength: 2.2, aoStrength: 1, physical: { clearcoat: 0.25, clearcoatRoughness: 0.35 } };
  };
  R.flag_cloth = (S) => {
    const n = S * S, alb = new Float32Array(n * 3), h = new Float32Array(n), rough = new Float32Array(n);
    const fz = fbm(S, 101, Math.max(64, S / 4), Math.max(64, S / 4), 2), dirt = fbm(S, 102, 3, 2, 5);
    const wv = Math.max(64, S / 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, u = x / S, v = y / S;
      const stripe = Math.floor(v * 13), red = stripe % 2 === 0, canton = u < 0.4 && v < 7 / 13;
      let cr, cg, cb;
      if (canton) {
        cr = 0.12;
        cg = 0.15;
        cb = 0.33;
      } else if (red) {
        cr = 0.66;
        cg = 0.1;
        cb = 0.15;
      } else {
        cr = 0.93;
        cg = 0.92;
        cb = 0.88;
      }
      const weave = Math.sin(Math.PI * 2 * u * wv) * Math.sin(Math.PI * 2 * v * wv) * 0.5 + 0.5;
      const k = 1 - (1 - weave) * 0.08 - (fz[i] - 0.5) * 0.06 - sstep(0.6, 0.9, dirt[i]) * 0.06;
      alb[i * 3] = cr * k;
      alb[i * 3 + 1] = cg * k;
      alb[i * 3 + 2] = cb * k;
      h[i] = weave * 0.7 + fz[i] * 0.3;
      rough[i] = clamp(0.78 + (fz[i] - 0.5) * 0.1);
    }
    const post = (ctx, S2) => {
      ctx.fillStyle = "#efeee8";
      const cw = 0.4 * S2, ch = 7 / 13 * S2, rr = ch * 0.0616 / 2 * 1;
      for (let row = 0; row < 9; row++) {
        const cnt = row % 2 ? 5 : 6;
        for (let c = 0; c < cnt; c++) {
          const cx = (row % 2 ? (c + 1) * 2 : c * 2 + 1) / 12 * cw, cy = (row + 1) / 10 * ch;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(1 / 1.9, 1);
          ctx.beginPath();
          for (let p = 0; p < 10; p++) {
            const a = -Math.PI / 2 + p * Math.PI / 5, rad = (p % 2 ? 0.382 : 1) * rr * 1.9 * 1.25;
            ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    };
    return { alb, h, rough, metal: 0, nStrength: 1.3, aoStrength: 0.6, post, physical: { sheen: 0.4 }, side: "double" };
  };
  function makeCanvas(S) {
    if (typeof OffscreenCanvas !== "undefined" && typeof document === "undefined") return new OffscreenCanvas(S, S);
    const c = document.createElement("canvas");
    c.width = c.height = S;
    return c;
  }
  var canvasCache = /* @__PURE__ */ new Map();
  var textureCache = /* @__PURE__ */ new Map();
  function buildCanvases(name, S) {
    const key = name + "|" + S;
    if (canvasCache.has(key)) return canvasCache.get(key);
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const d = R[name](S), n = S * S;
    const b1 = blur(d.h, S, Math.max(1, S >> 7)), b2 = blur(d.h, S, Math.max(2, S >> 5));
    const A = makeCanvas(S), N = makeCanvas(S), O = makeCanvas(S);
    const ia = new ImageData(S, S), inn = new ImageData(S, S), io = new ImageData(S, S);
    const ns = d.nStrength * S / 256;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, p = i * 4;
      const hL = d.h[y * S + (x - 1 + S) % S], hR = d.h[y * S + (x + 1) % S], hU = d.h[(y - 1 + S) % S * S + x], hD = d.h[(y + 1) % S * S + x];
      let nx = -(hR - hL) * ns, ny = (hD - hU) * ns, nz = 1;
      const l = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      nx *= l;
      ny *= l;
      nz *= l;
      inn.data[p] = (nx * 0.5 + 0.5) * 255;
      inn.data[p + 1] = (ny * 0.5 + 0.5) * 255;
      inn.data[p + 2] = (nz * 0.5 + 0.5) * 255;
      inn.data[p + 3] = 255;
      const ao = clamp(1 - d.aoStrength * (Math.max(0, b1[i] - d.h[i]) * 1.6 + Math.max(0, b2[i] - d.h[i]) * 1.2));
      const met = typeof d.metal === "number" ? d.metal : d.metal[i];
      io.data[p] = ao * 255;
      io.data[p + 1] = clamp(d.rough[i]) * 255;
      io.data[p + 2] = met * 255;
      io.data[p + 3] = 255;
      ia.data[p] = clamp(d.alb[i * 3]) * 255;
      ia.data[p + 1] = clamp(d.alb[i * 3 + 1]) * 255;
      ia.data[p + 2] = clamp(d.alb[i * 3 + 2]) * 255;
      ia.data[p + 3] = 255;
    }
    const ca = A.getContext("2d");
    ca.putImageData(ia, 0, 0);
    if (d.post) d.post(ca, S);
    N.getContext("2d").putImageData(inn, 0, 0);
    O.getContext("2d").putImageData(io, 0, 0);
    const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
    const out = { albedo: A, normal: N, orm: O, desc: d, ms };
    delete d.alb;
    delete d.h;
    delete d.rough;
    canvasCache.set(key, out);
    return out;
  }
  function setSRGB(THREE, tex) {
    if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else tex.encoding = THREE.sRGBEncoding;
  }
  function getTextures(name, THREE, { repeat = 1, quality = "med", anisotropy = 4 } = {}) {
    if (!R[name]) throw new Error('onum-materials: unknown material "' + name + '". Known: ' + MATERIAL_NAMES.join(", "));
    const S = QUALITY_SIZES[quality] || QUALITY_SIZES.med;
    const rp = Array.isArray(repeat) ? repeat : [repeat, repeat];
    const key = name + "|" + S + "|" + rp.join("x");
    if (textureCache.has(key)) return textureCache.get(key);
    const c = buildCanvases(name, S), mk = (cv, srgb) => {
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rp[0], rp[1]);
      t.anisotropy = anisotropy;
      if (srgb) setSRGB(THREE, t);
      t.needsUpdate = true;
      return t;
    };
    const tx = { map: mk(c.albedo, true), normalMap: mk(c.normal), ormMap: mk(c.orm), genMs: c.ms, size: S };
    textureCache.set(key, tx);
    return tx;
  }
  function makeMaterial(name, THREE, opts = {}) {
    var _a;
    const tx = getTextures(name, THREE, opts), d = canvasCache.get(name + "|" + tx.size).desc;
    const usePhys = opts.physical !== false && d.physical && THREE.MeshPhysicalMaterial;
    const base = {
      map: tx.map,
      normalMap: tx.normalMap,
      roughnessMap: tx.ormMap,
      metalnessMap: tx.ormMap,
      aoMap: tx.ormMap,
      roughness: 1,
      metalness: 1,
      aoMapIntensity: 1,
      envMapIntensity: (_a = opts.envMapIntensity) != null ? _a : 1
    };
    if (d.side === "double") base.side = THREE.DoubleSide;
    let m;
    if (usePhys) {
      m = new THREE.MeshPhysicalMaterial(base);
      const p = d.physical;
      if (p.clearcoat) {
        m.clearcoat = p.clearcoat;
        m.clearcoatRoughness = p.clearcoatRoughness;
      }
      if (p.sheen) {
        if (typeof m.sheen === "number") m.sheen = p.sheen;
        else if (m.sheen && m.sheen.isColor) m.sheen.setScalar(p.sheen * 0.25);
        else if (THREE.Color) m.sheen = new THREE.Color().setScalar(p.sheen * 0.25);
      }
    } else m = new THREE.MeshStandardMaterial(base);
    m.name = "onum:" + name;
    m.normalScale.set(1, 1);
    return m;
  }
  function ensureUv2(geometry) {
    if (geometry.attributes.uv && !geometry.attributes.uv2) geometry.setAttribute("uv2", geometry.attributes.uv);
    return geometry;
  }
  function textureMemoryBytes() {
    let b = 0;
    for (const t of textureCache.values()) b += 3 * t.size * t.size * 4 * 4 / 3;
    return Math.round(b);
  }
  function disposeAll() {
    for (const t of textureCache.values()) {
      t.map.dispose();
      t.normalMap.dispose();
      t.ormMap.dispose();
    }
    textureCache.clear();
    canvasCache.clear();
  }
  var onum_materials_default = { makeMaterial, getTextures, ensureUv2, MATERIAL_NAMES, QUALITY_SIZES, textureMemoryBytes, disposeAll };

  // onum-flags.js
  var onum_flags_exports = {};
  __export(onum_flags_exports, {
    GOV_TYPES: () => GOV_TYPES,
    default: () => onum_flags_default,
    describeFlag: () => describeFlag,
    drawFlag: () => drawFlag,
    jerusalemCross: () => jerusalemCross,
    makeFlagTexture: () => makeFlagTexture,
    makeWavingFlag: () => makeWavingFlag
  });
  var GOV_TYPES = [
    "republic",
    "democracy",
    "parliamentary",
    "constitutional_monarchy",
    "absolute_monarchy",
    "theocracy",
    "dictatorship",
    "communist",
    "socialist",
    "federation",
    "confederation",
    "junta",
    "tribal",
    "empire",
    "oligarchy",
    "technocracy",
    "corporate",
    "anarchist",
    "city_state",
    "colonial",
    "consular_republic"
  ];
  function mulberry322(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var C = {
    red: "#b3202a",
    crimson: "#8c1020",
    scarlet: "#d52b1e",
    white: "#f4f1ea",
    blue: "#1f3a8a",
    navy: "#14213d",
    sky: "#4a90c8",
    green: "#1f7a3a",
    dkgreen: "#0f4a2a",
    gold: "#e2b23a",
    yellow: "#f2c81e",
    black: "#16161a",
    purple: "#5a2a7a",
    orange: "#e2731e",
    olive: "#5b6431",
    khaki: "#a89a63",
    brown: "#6b3f22",
    ochre: "#c2862e",
    teal: "#167a7a",
    silver: "#c9ccd1",
    graphite: "#3a3d44",
    cyan: "#2ab0c8",
    maroon: "#6a1426",
    // NO7 (Nieuw Oranje VII) colours, taken from session.html oranje7FlagTex(): field, border, cross
    no7red: "#9B1B2E",
    no7gold: "#e8d5a3",
    no7cream: "#f3e6c4"
  };
  var RULES = {
    republic: { pal: [["blue", "white", "red"], ["green", "white", "red"], ["red", "white", "sky"], ["navy", "gold", "red"]], lay: ["tri_v", "tri_h", "canton_stripes", "hoist_tri"], emb: ["star", "wreath", "none", "cap"] },
    democracy: { pal: [["blue", "white", "red"], ["sky", "white", "gold"], ["green", "yellow", "blue"]], lay: ["canton_stripes", "stripes", "tri_h", "bicolor_h"], emb: ["stars_ring", "torch", "star", "stars_row"] },
    parliamentary: { pal: [["red", "white", "blue"], ["green", "white", "orange"], ["navy", "white", "red"]], lay: ["nordic", "tri_v", "tri_h", "bicolor_h"], emb: ["none", "shield", "wreath"] },
    constitutional_monarchy: { pal: [["red", "white", "gold"], ["blue", "yellow", "white"], ["crimson", "white", "gold"]], lay: ["nordic", "quartered", "tri_h", "saltire"], emb: ["crown_shield", "crown"] },
    absolute_monarchy: { pal: [["purple", "gold", "white"], ["crimson", "gold", "black"], ["navy", "gold", "white"]], lay: ["field", "border", "bicolor_d"], emb: ["crown_shield", "lion", "crown"] },
    theocracy: { pal: [["white", "gold", "green"], ["dkgreen", "white", "gold"], ["white", "maroon", "gold"]], lay: ["field", "bicolor_v", "hoist_band", "cross"], emb: ["crescent", "eye_rays", "sun", "cross_emb"] },
    dictatorship: { pal: [["black", "red", "gold"], ["red", "black", "white"], ["graphite", "gold", "crimson"]], lay: ["field", "bicolor_h", "border", "disc"], emb: ["eagle", "fist", "star_laurel", "lightning"] },
    communist: { pal: [["scarlet", "gold", "scarlet"], ["crimson", "yellow", "white"]], lay: ["field", "field", "hoist_band", "canton_star"], emb: ["star_gear", "star", "wheat_star"] },
    socialist: { pal: [["red", "white", "green"], ["scarlet", "black", "gold"], ["red", "blue", "white"]], lay: ["hoist_tri", "bicolor_h", "tri_h"], emb: ["star", "star_gear", "torch"] },
    federation: { pal: [["navy", "gold", "white"], ["blue", "white", "red"], ["sky", "white", "gold"]], lay: ["field", "canton_stripes", "stripes"], emb: ["stars_ring", "stars_grid", "stars_row"] },
    confederation: { pal: [["red", "blue", "white"], ["navy", "red", "white"], ["green", "white", "gold"]], lay: ["saltire", "cross", "tri_v"], emb: ["stars_saltire", "star", "none"] },
    junta: { pal: [["olive", "khaki", "black"], ["dkgreen", "khaki", "gold"], ["brown", "olive", "gold"]], lay: ["tri_h", "tri_v", "field", "border"], emb: ["swords", "star", "star_laurel"] },
    tribal: { pal: [["ochre", "black", "red"], ["brown", "ochre", "white"], ["green", "black", "yellow"]], lay: ["zigzag", "chevrons", "border_tri", "tri_h"], emb: ["spear_shield", "sun", "none"] },
    empire: { pal: [["gold", "black", "crimson"], ["black", "gold", "white"], ["purple", "gold", "crimson"]], lay: ["field", "sunburst", "bicolor_h", "border"], emb: ["eagle2", "crown", "sun"] },
    oligarchy: { pal: [["navy", "silver", "gold"], ["graphite", "gold", "white"], ["maroon", "silver", "gold"]], lay: ["bicolor_d", "diag_band", "border"], emb: ["ring", "coins", "key"] },
    technocracy: { pal: [["white", "cyan", "graphite"], ["graphite", "cyan", "white"], ["navy", "cyan", "silver"]], lay: ["field", "hoist_band", "bicolor_v", "grid"], emb: ["atom", "gear", "hex"] },
    corporate: { pal: [["teal", "white", "graphite"], ["white", "orange", "graphite"], ["graphite", "teal", "silver"]], lay: ["field", "bicolor_v", "diag_band"], emb: ["hex", "ring", "chevron_logo"] },
    anarchist: { pal: [["black", "red", "white"], ["black", "green", "white"]], lay: ["bicolor_d", "field"], emb: ["circle_a", "star", "none"] },
    city_state: { pal: [["white", "red", "gold"], ["blue", "white", "gold"], ["red", "gold", "white"]], lay: ["quartered", "bicolor_h", "border", "cross"], emb: ["tower", "key", "shield"] },
    consular_republic: { pal: [["no7red", "no7cream", "no7gold"]], lay: ["no7"], emb: ["jerusalem"], fixed: true },
    colonial: { pal: [["navy", "white", "red"], ["blue", "white", "gold"], ["red", "white", "navy"]], lay: ["canton_union", "field"], emb: ["shield", "star", "wreath"] }
  };
  function describeFlag(type, seed = 1) {
    const R2 = RULES[type] || RULES.republic, r = mulberry322((seed >>> 0) * 7919 + GOV_TYPES.indexOf(type) * 104729 + 17), pick = (a) => a[r() * a.length | 0];
    const names = pick(R2.pal).slice();
    if (r() < 0.5 && !R2.fixed) names.reverse();
    return { type, seed, palette: names.map((n) => C[n]), paletteNames: names, layout: pick(R2.lay), emblem: pick(R2.emb), emScale: 0.8 + r() * 0.4, n: 3 + (r() * 6 | 0), r2: r() };
  }
  function star(g, x, y, R2, n = 5, inner = 0.38, rot = -Math.PI / 2) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + i * Math.PI / n, rr = i % 2 ? R2 * inner : R2;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
  }
  function poly(g, pts) {
    g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    g.closePath();
    g.fill();
  }
  function circle(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  function gear(g, x, y, R2, teeth = 12, bg) {
    g.beginPath();
    for (let i = 0; i < teeth * 4; i++) {
      const a = i / (teeth * 4) * Math.PI * 2, rr = i % 4 < 2 ? R2 : R2 * 0.82;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    if (bg) {
      const f = g.fillStyle;
      g.fillStyle = bg;
      circle(g, x, y, R2 * 0.45);
      g.fillStyle = f;
    }
  }
  function wreath(g, x, y, R2, col) {
    g.fillStyle = col;
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
      const a = Math.PI / 2 + s * (0.35 + i * 0.27), px = x + Math.cos(a) * R2, py = y + Math.sin(a) * R2;
      g.save();
      g.translate(px, py);
      g.rotate(a + s * 0.9);
      g.beginPath();
      g.ellipse(0, 0, R2 * 0.16, R2 * 0.07, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }
  function crown(g, x, y, s) {
    poly(g, [[x - s, y + s * 0.5], [x - s, y - s * 0.4], [x - s * 0.5, y], [x, y - s * 0.7], [x + s * 0.5, y], [x + s, y - s * 0.4], [x + s, y + s * 0.5]]);
    for (const k of [-1, -0.5, 0, 0.5, 1]) circle(g, x + k * s, y - (k === 0 ? s * 0.78 : Math.abs(k) === 1 ? s * 0.48 : s * 0.08), s * 0.12);
  }
  function shield(g, x, y, s) {
    g.beginPath();
    g.moveTo(x - s, y - s);
    g.lineTo(x + s, y - s);
    g.lineTo(x + s, y + s * 0.2);
    g.quadraticCurveTo(x + s, y + s * 0.9, x, y + s * 1.25);
    g.quadraticCurveTo(x - s, y + s * 0.9, x - s, y + s * 0.2);
    g.closePath();
    g.fill();
  }
  function eagle(g, x, y, s, twoHead) {
    g.beginPath();
    g.moveTo(x, y - s * 0.55);
    const wing = (sx) => {
      g.lineTo(x + sx * s * 0.25, y - s * 0.35);
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        g.lineTo(x + sx * s * (0.35 + 0.65 * t), y - s * (0.55 - 0.35 * t) + (i % 2 ? s * 0.12 : 0));
      }
      g.lineTo(x + sx * s * 0.95, y + s * 0.15);
      g.lineTo(x + sx * s * 0.3, y + s * 0.15);
      g.lineTo(x + sx * s * 0.35, y + s * 0.55);
      g.lineTo(x + sx * s * 0.12, y + s * 0.4);
    };
    wing(1);
    g.lineTo(x, y + s * 0.75);
    wing(-1);
    g.closePath();
    g.fill();
    for (const sx of twoHead ? [-1, 1] : [0]) {
      circle(g, x + sx * s * 0.17, y - s * 0.62, s * 0.11);
      poly(g, [[x + sx * s * 0.17 + (sx || 1) * s * 0.08, y - s * 0.66], [x + sx * s * 0.17 + (sx || 1) * s * 0.24, y - s * 0.6], [x + sx * s * 0.17 + (sx || 1) * s * 0.08, y - s * 0.56]]);
    }
  }
  function jerusalemCross(g, cx, cy, arm, col) {
    g.fillStyle = col;
    const t = arm * 0.22, bar = arm * 0.62, bt = t * 0.85;
    g.fillRect(cx - t / 2, cy - arm, t, arm * 2);
    g.fillRect(cx - arm, cy - t / 2, arm * 2, t);
    g.fillRect(cx - bar / 2, cy - arm, bar, bt);
    g.fillRect(cx - bar / 2, cy + arm - bt, bar, bt);
    g.fillRect(cx - arm, cy - bar / 2, bt, bar);
    g.fillRect(cx + arm - bt, cy - bar / 2, bt, bar);
    const s = arm * 0.2, st = s * 0.4, off = arm * 0.55;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const sx = cx + dx * off, sy = cy + dy * off;
      g.fillRect(sx - st / 2, sy - s, st, s * 2);
      g.fillRect(sx - s, sy - st / 2, s * 2, st);
    }
  }
  function emblem(g, D, x, y, s, col, bg) {
    g.fillStyle = col;
    g.strokeStyle = col;
    switch (D.emblem) {
      case "none":
        break;
      case "star":
        star(g, x, y, s);
        break;
      case "stars_row":
        for (let i = 0; i < D.n; i++) star(g, x + (i - (D.n - 1) / 2) * s * 0.75, y, s * 0.3);
        break;
      case "stars_ring":
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * Math.PI * 2;
          star(g, x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.16);
        }
        break;
      case "stars_grid":
        for (let i = 0; i < D.n + 2; i++) for (let j = 0; j < 3; j++) star(g, x + (i - (D.n + 1) / 2) * s * 0.42, y + (j - 1) * s * 0.5, s * 0.15);
        break;
      case "wreath":
        wreath(g, x, y, s * 0.8, col);
        break;
      case "star_laurel":
        wreath(g, x, y, s * 0.9, col);
        star(g, x, y, s * 0.5);
        break;
      case "cap":
        g.beginPath();
        g.moveTo(x - s * 0.6, y + s * 0.5);
        g.quadraticCurveTo(x - s * 0.7, y - s * 0.6, x + s * 0.1, y - s * 0.7);
        g.quadraticCurveTo(x + s * 0.8, y - s * 0.6, x + s * 0.4, y - s * 0.1);
        g.lineTo(x + s * 0.6, y + s * 0.5);
        g.closePath();
        g.fill();
        break;
      case "torch":
        poly(g, [[x - s * 0.15, y - s * 0.1], [x + s * 0.15, y - s * 0.1], [x + s * 0.07, y + s * 0.9], [x - s * 0.07, y + s * 0.9]]);
        g.beginPath();
        g.moveTo(x, y - s * 0.95);
        g.quadraticCurveTo(x + s * 0.45, y - s * 0.4, x, y - s * 0.15);
        g.quadraticCurveTo(x - s * 0.45, y - s * 0.4, x, y - s * 0.95);
        g.fill();
        break;
      case "shield":
        shield(g, x, y - s * 0.1, s * 0.6);
        g.fillStyle = bg;
        star(g, x, y - s * 0.05, s * 0.28);
        break;
      case "crown":
        crown(g, x, y, s * 0.7);
        break;
      case "crown_shield":
        shield(g, x, y + s * 0.15, s * 0.5);
        crown(g, x, y - s * 0.62, s * 0.42);
        g.fillStyle = bg;
        poly(g, [[x - s * 0.08, y - s * 0.3], [x + s * 0.08, y - s * 0.3], [x + s * 0.08, y + s * 0.65], [x - s * 0.08, y + s * 0.65]]);
        poly(g, [[x - s * 0.4, y + s * 0.1], [x + s * 0.4, y + s * 0.1], [x + s * 0.4, y + s * 0.25], [x - s * 0.4, y + s * 0.25]]);
        break;
      case "lion":
        shield(g, x, y, s * 0.75);
        g.fillStyle = bg;
        g.beginPath();
        g.ellipse(x, y + s * 0.05, s * 0.3, s * 0.2, -0.3, 0, Math.PI * 2);
        g.fill();
        circle(g, x + s * 0.22, y - s * 0.22, s * 0.16);
        for (const k of [-0.2, 0.15]) poly(g, [[x + k * s, y + s * 0.15], [x + k * s + s * 0.06, y + s * 0.15], [x + k * s + s * 0.04, y + s * 0.5], [x + k * s - s * 0.02, y + s * 0.5]]);
        break;
      case "crescent":
        circle(g, x, y, s * 0.7);
        g.fillStyle = bg;
        circle(g, x + s * 0.22, y - s * 0.06, s * 0.6);
        g.fillStyle = col;
        star(g, x + s * 0.5, y - s * 0.05, s * 0.2);
        break;
      case "eye_rays":
        for (let i = 0; i < 16; i++) {
          const a = i / 16 * Math.PI * 2;
          poly(g, [[x + Math.cos(a - 0.08) * s * 0.55, y + Math.sin(a - 0.08) * s * 0.55], [x + Math.cos(a) * s * 1.05, y + Math.sin(a) * s * 1.05], [x + Math.cos(a + 0.08) * s * 0.55, y + Math.sin(a + 0.08) * s * 0.55]]);
        }
        poly(g, [[x - s * 0.5, y + s * 0.35], [x + s * 0.5, y + s * 0.35], [x, y - s * 0.5]]);
        g.fillStyle = bg;
        g.beginPath();
        g.ellipse(x, y + s * 0.05, s * 0.2, s * 0.1, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = col;
        circle(g, x, y + s * 0.05, s * 0.06);
        break;
      case "sun":
        circle(g, x, y, s * 0.42);
        for (let i = 0; i < 16; i++) {
          const a = i / 16 * Math.PI * 2 + 0.1;
          poly(g, [[x + Math.cos(a - 0.12) * s * 0.5, y + Math.sin(a - 0.12) * s * 0.5], [x + Math.cos(a) * s * (i % 2 ? 0.8 : 1), y + Math.sin(a) * s * (i % 2 ? 0.8 : 1)], [x + Math.cos(a + 0.12) * s * 0.5, y + Math.sin(a + 0.12) * s * 0.5]]);
        }
        break;
      case "cross_emb":
        poly(g, [[x - s * 0.12, y - s * 0.8], [x + s * 0.12, y - s * 0.8], [x + s * 0.12, y + s * 0.8], [x - s * 0.12, y + s * 0.8]]);
        poly(g, [[x - s * 0.5, y - s * 0.38], [x + s * 0.5, y - s * 0.38], [x + s * 0.5, y - s * 0.14], [x - s * 0.5, y - s * 0.14]]);
        break;
      case "eagle":
        eagle(g, x, y, s, false);
        break;
      case "eagle2":
        eagle(g, x, y, s, true);
        break;
      case "fist":
        g.beginPath();
        g.roundRect ? g.roundRect(x - s * 0.35, y - s * 0.55, s * 0.7, s * 0.55, s * 0.12) : g.rect(x - s * 0.35, y - s * 0.55, s * 0.7, s * 0.55);
        g.fill();
        poly(g, [[x - s * 0.25, y], [x + s * 0.25, y], [x + s * 0.2, y + s * 0.8], [x - s * 0.2, y + s * 0.8]]);
        g.fillStyle = bg;
        for (let i = 1; i < 4; i++) poly(g, [[x - s * 0.35 + i * s * 0.175 - 2, y - s * 0.5], [x - s * 0.35 + i * s * 0.175 + 2, y - s * 0.5], [x - s * 0.35 + i * s * 0.175 + 2, y - s * 0.2], [x - s * 0.35 + i * s * 0.175 - 2, y - s * 0.2]]);
        break;
      case "lightning":
        poly(g, [[x + s * 0.2, y - s], [x - s * 0.45, y + s * 0.1], [x - s * 0.02, y + s * 0.1], [x - s * 0.25, y + s], [x + s * 0.45, y - s * 0.15], [x + s * 0.02, y - s * 0.15]]);
        break;
      case "star_gear":
        gear(g, x, y, s * 0.8, 14, bg);
        star(g, x, y, s * 0.42);
        break;
      case "wheat_star":
        wreath(g, x, y + s * 0.1, s * 0.8, col);
        star(g, x, y - s * 0.1, s * 0.4);
        break;
      case "swords":
        for (const k of [-1, 1]) {
          g.save();
          g.translate(x, y);
          g.rotate(k * 0.7);
          poly(g, [[-s * 0.05, -s], [s * 0.05, -s], [s * 0.05, s * 0.6], [-s * 0.05, s * 0.6]]);
          poly(g, [[-s * 0.22, s * 0.55], [s * 0.22, s * 0.55], [s * 0.22, s * 0.64], [-s * 0.22, s * 0.64]]);
          poly(g, [[-s * 0.05, -s], [s * 0.05, -s], [0, -s * 1.12]]);
          g.restore();
        }
        star(g, x, y - s * 0.65, s * 0.25);
        break;
      case "spear_shield":
        g.save();
        g.translate(x, y);
        g.rotate(0.5);
        poly(g, [[-s * 0.03, -s * 1.1], [s * 0.03, -s * 1.1], [s * 0.03, s * 1.1], [-s * 0.03, s * 1.1]]);
        poly(g, [[0, -s * 1.3], [s * 0.1, -s * 1.05], [-s * 0.1, -s * 1.05]]);
        g.restore();
        g.save();
        g.translate(x, y);
        g.rotate(-0.5);
        poly(g, [[-s * 0.03, -s * 1.1], [s * 0.03, -s * 1.1], [s * 0.03, s * 1.1], [-s * 0.03, s * 1.1]]);
        poly(g, [[0, -s * 1.3], [s * 0.1, -s * 1.05], [-s * 0.1, -s * 1.05]]);
        g.restore();
        g.beginPath();
        g.ellipse(x, y, s * 0.42, s * 0.75, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = bg;
        g.beginPath();
        g.ellipse(x, y, s * 0.12, s * 0.6, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case "ring":
        g.lineWidth = s * 0.18;
        g.beginPath();
        g.arc(x, y, s * 0.6, 0, Math.PI * 2);
        g.stroke();
        circle(g, x, y, s * 0.2);
        break;
      case "coins":
        for (let i = 0; i < 3; i++) circle(g, x + (i - 1) * s * 0.55, y + (i === 1 ? -s * 0.3 : s * 0.15), s * 0.32);
        break;
      case "key":
        g.lineWidth = s * 0.14;
        g.beginPath();
        g.arc(x, y - s * 0.55, s * 0.28, 0, Math.PI * 2);
        g.stroke();
        poly(g, [[x - s * 0.07, y - s * 0.3], [x + s * 0.07, y - s * 0.3], [x + s * 0.07, y + s * 0.85], [x - s * 0.07, y + s * 0.85]]);
        poly(g, [[x, y + s * 0.55], [x + s * 0.3, y + s * 0.55], [x + s * 0.3, y + s * 0.68], [x, y + s * 0.68]]);
        poly(g, [[x, y + s * 0.75], [x + s * 0.22, y + s * 0.75], [x + s * 0.22, y + s * 0.85], [x, y + s * 0.85]]);
        break;
      case "atom":
        g.lineWidth = s * 0.07;
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.ellipse(x, y, s * 0.85, s * 0.3, i * Math.PI / 3, 0, Math.PI * 2);
          g.stroke();
        }
        circle(g, x, y, s * 0.14);
        break;
      case "gear":
        gear(g, x, y, s * 0.8, 10, bg);
        break;
      case "hex": {
        const hx = (k) => {
          g.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2 + Math.PI / 6;
            g.lineTo(x + Math.cos(a) * s * k, y + Math.sin(a) * s * k);
          }
          g.closePath();
        };
        hx(0.8);
        g.fill();
        g.fillStyle = bg;
        hx(0.5);
        g.fill();
        g.fillStyle = col;
        hx(0.25);
        g.fill();
        break;
      }
      case "chevron_logo":
        for (let i = 0; i < 3; i++) poly(g, [[x - s * 0.7, y - s * 0.5 + i * s * 0.4], [x, y + i * s * 0.4 - s * 0.1], [x + s * 0.7, y - s * 0.5 + i * s * 0.4], [x + s * 0.7, y - s * 0.3 + i * s * 0.4], [x, y + i * s * 0.4 + s * 0.1], [x - s * 0.7, y - s * 0.3 + i * s * 0.4]]);
        break;
      case "circle_a":
        g.lineWidth = s * 0.14;
        g.beginPath();
        g.arc(x, y, s * 0.75, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = s * 0.16;
        g.beginPath();
        g.moveTo(x - s * 0.55, y + s * 0.85);
        g.lineTo(x, y - s * 0.95);
        g.lineTo(x + s * 0.55, y + s * 0.85);
        g.moveTo(x - s * 0.45, y + s * 0.15);
        g.lineTo(x + s * 0.45, y + s * 0.15);
        g.stroke();
        break;
      case "tower":
        poly(g, [[x - s * 0.5, y + s * 0.8], [x - s * 0.5, y - s * 0.3], [x - s * 0.7, y - s * 0.3], [x - s * 0.7, y - s * 0.6], [x - s * 0.5, y - s * 0.6], [x - s * 0.5, y - s * 0.45], [x - s * 0.25, y - s * 0.45], [x - s * 0.25, y - s * 0.6], [x, y - s * 0.6], [x, y - s * 0.45], [x + s * 0.25, y - s * 0.45], [x + s * 0.25, y - s * 0.6], [x + s * 0.5, y - s * 0.6], [x + s * 0.5, y - s * 0.45], [x + s * 0.7, y - s * 0.6], [x + s * 0.7, y - s * 0.3], [x + s * 0.5, y - s * 0.3], [x + s * 0.5, y + s * 0.8]]);
        g.fillStyle = bg;
        g.beginPath();
        g.moveTo(x - s * 0.18, y + s * 0.8);
        g.lineTo(x - s * 0.18, y + s * 0.35);
        g.arc(x, y + s * 0.35, s * 0.18, Math.PI, 0);
        g.lineTo(x + s * 0.18, y + s * 0.8);
        g.fill();
        break;
      case "jerusalem":
        jerusalemCross(g, x, y, s, col);
        break;
      case "stars_saltire":
        break;
      default:
        star(g, x, y, s);
    }
  }
  function drawFlag(type, seed = 1, opts = {}) {
    const D = describeFlag(type, seed), W = opts.width || 512, H = opts.height || Math.round(W / 1.6);
    const c = opts.canvas || document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const [c0, c1, c2] = D.palette;
    let ex = W / 2, ey = H / 2, es = H * 0.28 * D.emScale, eCol = c1, eBg = c0;
    const rect = (x, y, w, h, col) => {
      g.fillStyle = col;
      g.fillRect(x, y, w, h);
    };
    rect(0, 0, W, H, c0);
    switch (D.layout) {
      case "field":
        eCol = c1;
        eBg = c0;
        if (D.r2 < 0.4) {
          ex = W * 0.3;
          es *= 0.8;
        }
        break;
      case "tri_v":
        rect(W / 3, 0, W / 3, H, c1);
        rect(W * 2 / 3, 0, W / 3, H, c2);
        eCol = c0 === c2 ? c1 : c2;
        eBg = c1;
        es *= 0.75;
        break;
      case "tri_h":
        rect(0, H / 3, W, H / 3, c1);
        rect(0, H * 2 / 3, W, H / 3, c2);
        eCol = c2;
        eBg = c1;
        es *= 0.7;
        break;
      case "bicolor_h":
        rect(0, H / 2, W, H / 2, c1);
        eCol = c2;
        eBg = c0;
        ex = W * 0.25;
        ey = H * 0.27;
        es *= 0.55;
        break;
      case "bicolor_v":
        rect(W / 2, 0, W / 2, H, c1);
        eCol = c2;
        eBg = c0;
        ex = W * 0.25;
        es *= 0.7;
        break;
      case "bicolor_d":
        g.fillStyle = c1;
        poly(g, [[W, 0], [W, H], [0, H]]);
        eCol = c2;
        eBg = c0;
        ex = W * 0.28;
        ey = H * 0.3;
        es *= 0.55;
        break;
      case "stripes":
        for (let i = 0; i < 7 + D.n % 3 * 2; i++) if (i % 2) rect(0, i * H / (7 + D.n % 3 * 2), W, H / (7 + D.n % 3 * 2), c1);
        eCol = c1;
        eBg = c2;
        {
          const cw = W * 0;
        }
        g.fillStyle = c2;
        g.beginPath();
        g.arc(W / 2, H / 2, H * 0.3, 0, Math.PI * 2);
        g.fill();
        es *= 0.75;
        break;
      case "canton_stripes": {
        const n = 13 - D.n % 3 * 2;
        for (let i = 0; i < n; i++) if (i % 2) rect(0, i * H / n, W, H / n, c1);
        rect(0, 0, W * 0.42, H * Math.ceil(n / 2) / n, c2);
        ex = W * 0.21;
        ey = H * Math.ceil(n / 2) / n / 2;
        es = H * 0.17;
        eCol = c1 === c0 ? C.white : c1;
        eBg = c2;
        if (D.emblem === "none") D.emblem = "stars_grid";
        break;
      }
      case "canton_star":
        rect(0, 0, W * 0.4, H * 0.5, c0);
        ex = W * 0.2;
        ey = H * 0.25;
        es = H * 0.17;
        eCol = c1;
        break;
      case "canton_union":
        rect(0, 0, W / 2, H / 2, c1);
        g.strokeStyle = c2;
        g.lineWidth = H * 0.06;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(W / 2, H / 2);
        g.moveTo(W / 2, 0);
        g.lineTo(0, H / 2);
        g.stroke();
        rect(W / 4 - H * 0.06, 0, H * 0.12, H / 2, c2);
        rect(0, H / 4 - H * 0.06, W / 2, H * 0.12, c2);
        ex = W * 0.72;
        ey = H * 0.55;
        es *= 0.8;
        eCol = c1 === c0 ? c2 : C.white;
        eBg = c0;
        break;
      case "hoist_tri":
        rect(0, H / 2, W, H / 2, c1);
        g.fillStyle = c2;
        poly(g, [[0, 0], [W * 0.42, H / 2], [0, H]]);
        ex = W * 0.13;
        es *= 0.55;
        eCol = c1 === C.white ? C.white : C.white;
        eBg = c2;
        break;
      case "hoist_band":
        rect(0, 0, W * 0.28, H, c1);
        ex = W * 0.6;
        eCol = c1;
        eBg = c0;
        es *= 0.9;
        break;
      case "nordic":
        rect(W * 0.3, 0, H * 0.2, H, c1);
        rect(0, H * 0.4, W, H * 0.2, c1);
        if (D.r2 > 0.5) {
          rect(W * 0.3 + H * 0.05, 0, H * 0.1, H, c2);
          rect(0, H * 0.45, W, H * 0.1, c2);
        }
        D.emblem = D.emblem === "none" ? "none" : D.emblem;
        ex = W * 0.3 + H * 0.1;
        es *= 0.7;
        eCol = c2;
        eBg = c1;
        if (D.emblem !== "crown" && D.emblem !== "crown_shield") D.emblem = "none";
        break;
      case "cross":
        rect(W / 2 - H * 0.1, 0, H * 0.2, H, c1);
        rect(0, H * 0.4, W, H * 0.2, c1);
        eCol = c2;
        eBg = c1;
        es *= 0.45;
        break;
      case "saltire": {
        g.strokeStyle = c1;
        g.lineWidth = H * 0.2;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(W, H);
        g.moveTo(W, 0);
        g.lineTo(0, H);
        g.stroke();
        if (D.emblem === "stars_saltire") {
          g.fillStyle = c2;
          for (let i = 0; i < 13; i++) {
            const t = i % 7 / 6, d2 = i < 7 ? 1 : -1;
            const x = i < 7 ? t * W : (1 - (i - 7 + 0.5) / 6) * W, y = i < 7 ? t * H : (i - 7 + 0.5) / 6 * H;
            if (i === 3) continue;
            star(g, i < 7 ? x : x, y, H * 0.05);
          }
          D.emblem = "none";
        }
        eCol = c2;
        eBg = c1;
        es *= 0.5;
        break;
      }
      case "quartered":
        rect(W / 2, 0, W / 2, H / 2, c1);
        rect(0, H / 2, W / 2, H / 2, c1);
        eCol = c2;
        eBg = c0;
        g.fillStyle = c2;
        circle(g, ex, ey, es * 1.1);
        eCol = c0;
        eBg = c2;
        es *= 0.75;
        break;
      case "border":
        rect(0, 0, W, H, c1);
        rect(H * 0.08, H * 0.08, W - H * 0.16, H - H * 0.16, c0);
        eCol = c1;
        eBg = c0;
        break;
      case "border_tri":
        rect(0, 0, W, H, c0);
        g.fillStyle = c1;
        for (let i = 0; i < 16; i++) {
          poly(g, [[i * W / 16, 0], [(i + 0.5) * W / 16, H * 0.1], [(i + 1) * W / 16, 0]]);
          poly(g, [[i * W / 16, H], [(i + 0.5) * W / 16, H * 0.9], [(i + 1) * W / 16, H]]);
        }
        eCol = c2;
        eBg = c0;
        break;
      case "zigzag":
        rect(0, H * 0.35, W, H * 0.3, c1);
        g.fillStyle = c2;
        for (let i = 0; i < 12; i++) {
          poly(g, [[i * W / 12, H * 0.35], [(i + 0.5) * W / 12, H * 0.42], [(i + 1) * W / 12, H * 0.35]]);
          poly(g, [[i * W / 12, H * 0.65], [(i + 0.5) * W / 12, H * 0.58], [(i + 1) * W / 12, H * 0.65]]);
        }
        eCol = c2;
        eBg = c1;
        es *= 0.55;
        ex = W * 0.5;
        break;
      case "chevrons":
        for (let i = 0; i < 4; i++) {
          g.fillStyle = i % 2 ? c1 : c2;
          poly(g, [[i * W * 0.08, 0], [W * 0.32 + i * W * 0.08, H / 2], [i * W * 0.08, H], [(i + 1) * W * 0.08, H], [W * 0.32 + (i + 1) * W * 0.08, H / 2], [(i + 1) * W * 0.08, 0]]);
        }
        ex = W * 0.72;
        eCol = c1;
        eBg = c0;
        es *= 0.8;
        break;
      case "sunburst":
        g.fillStyle = c1;
        for (let i = 0; i < 24; i += 2) {
          const a = i / 24 * Math.PI * 2, b = (i + 1) / 24 * Math.PI * 2, R2 = W;
          poly(g, [[W / 2, H / 2], [W / 2 + Math.cos(a) * R2, H / 2 + Math.sin(a) * R2], [W / 2 + Math.cos(b) * R2, H / 2 + Math.sin(b) * R2]]);
        }
        g.fillStyle = c0;
        circle(g, W / 2, H / 2, es * 1.25);
        eCol = c2;
        eBg = c0;
        break;
      case "disc":
        g.fillStyle = c1;
        circle(g, ex, ey, es * 1.25);
        eCol = c2 === c0 ? C.black : c2;
        eBg = c1;
        break;
      case "diag_band":
        g.fillStyle = c1;
        poly(g, [[0, H], [0, H * 0.75], [W * 0.75, 0], [W, 0], [W, H * 0.25], [W * 0.25, H]]);
        eCol = c2;
        eBg = c0;
        ex = W * 0.2;
        ey = H * 0.25;
        es *= 0.5;
        break;
      case "no7":
        g.strokeStyle = c2;
        g.lineWidth = H * 0.05;
        g.strokeRect(H * 0.04, H * 0.04, W - H * 0.08, H - H * 0.08);
        g.strokeStyle = "rgba(243,230,196,0.4)";
        g.lineWidth = Math.max(1, H * 8e-3);
        g.strokeRect(H * 0.09, H * 0.09, W - H * 0.18, H - H * 0.18);
        eCol = c1;
        eBg = c0;
        es = H * 0.3;
        break;
      case "grid":
        g.fillStyle = c1;
        for (let i = 1; i < 8; i++) {
          g.fillRect(i * W / 8 - 1, 0, 2, H);
          g.fillRect(0, i * H / 5 - 1, W, 2);
        }
        eCol = c2;
        eBg = c0;
        g.fillStyle = c0;
        circle(g, ex, ey, es * 1.1);
        break;
    }
    if (eCol === eBg) eCol = eBg === C.white ? C.black : C.white;
    emblem(g, D, ex, ey, es, eCol, eBg);
    const id = g.getImageData(0, 0, W, H), d = id.data, rr = mulberry322(seed * 31 + 5);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, wv = x & 1 ^ y & 1 ? 0.985 : 1, k = wv * (0.97 + rr() * 0.03);
      d[i] *= k;
      d[i + 1] *= k;
      d[i + 2] *= k;
    }
    g.putImageData(id, 0, 0);
    c.userData = D;
    return c;
  }
  var texCache = /* @__PURE__ */ new Map();
  function makeFlagTexture(THREE, type, seed = 1, opts = {}) {
    const key = type + "|" + seed + "|" + (opts.width || 512);
    if (texCache.has(key)) return texCache.get(key);
    const t = new THREE.CanvasTexture(drawFlag(type, seed, opts));
    t.anisotropy = 4;
    if (opts.srgb !== false) {
      if ("colorSpace" in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      else t.encoding = THREE.sRGBEncoding;
    }
    texCache.set(key, t);
    return t;
  }
  function makeWavingFlag(THREE, opts = {}) {
    var _a, _b;
    const type = opts.type || "republic", seed = (_a = opts.seed) != null ? _a : 1, fw = opts.width || 1.6, fh = opts.height || fw / 1.6;
    const sx = opts.segments || 32, sy = Math.max(4, Math.round(sx / 1.6 / 2)), poleH = (_b = opts.poleHeight) != null ? _b : 4.5;
    const group = new THREE.Group();
    const geo = new THREE.PlaneGeometry(fw, fh, sx, sy);
    geo.translate(fw / 2, 0, 0);
    const rest = Float32Array.from(geo.attributes.position.array);
    geo.setAttribute("uv2", geo.attributes.uv);
    let normalMap = null;
    try {
      normalMap = getTextures("flag_cloth", THREE, { repeat: [4, 2.5], quality: opts.quality || "low" }).normalMap;
    } catch (e) {
      normalMap = null;
    }
    const mat = new THREE.MeshStandardMaterial({ map: makeFlagTexture(THREE, type, seed, { width: opts.textureWidth || 512 }), normalMap, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.82, metalness: 0, side: THREE.DoubleSide });
    const cloth = new THREE.Mesh(geo, mat);
    cloth.castShadow = true;
    cloth.position.set(0.035, poleH - fh / 2 - 0.08, 0);
    group.add(cloth);
    if (opts.pole !== false) {
      const pm = opts.poleMaterial || new THREE.MeshStandardMaterial({ color: 13223613, roughness: 0.35, metalness: 0.8 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, poleH, 12), pm);
      pole.position.y = poleH / 2;
      pole.castShadow = true;
      group.add(pole);
      const fin = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), opts.finialMaterial || new THREE.MeshStandardMaterial({ color: 13936202, roughness: 0.25, metalness: 1 }));
      fin.position.y = poleH + 0.04;
      group.add(fin);
    }
    const r = mulberry322(seed * 13 + 1);
    let t = r() * 100;
    function update(dt, st = {}) {
      var _a2;
      const wind = (_a2 = st.wind) != null ? _a2 : 1, gust = 0.75 + 0.25 * Math.sin(t * 0.37) * Math.sin(t * 0.23 + 1);
      t += (dt || 0) * (0.6 + wind * 0.9);
      const P = geo.attributes.position, amp = 0.14 * fw * wind * gust, droop = fh * 0.22 * Math.max(0, 1 - wind);
      for (let i = 0; i < P.count; i++) {
        const x0 = rest[i * 3], y0 = rest[i * 3 + 1], u = x0 / fw, v = y0 / fh;
        const ph = x0 / fw * 6.5 - t * 4.2 + v * 0.8, a = amp * Math.pow(u, 1.2);
        const z = a * Math.sin(ph) + a * 0.35 * Math.sin(ph * 1.9 + v * 3 + t * 1.3);
        const x = x0 - Math.abs(z) * 0.25 * u - droop * u * u * 0.6, y = y0 - droop * u * u * (0.6 - v);
        P.setXYZ(i, x, y, z);
      }
      P.needsUpdate = true;
      geo.computeVertexNormals();
    }
    update(0, {});
    return { group, cloth, update, describe: describeFlag(type, seed), dispose() {
      geo.dispose();
      mat.dispose();
    } };
  }
  var onum_flags_default = { GOV_TYPES, describeFlag, drawFlag, makeFlagTexture, makeWavingFlag };

  // onum-characters.js
  var OUTFITS = ["suit_tie", "three_piece", "suit_open", "shirt_vest", "skirt_suit", "trouser_suit", "dress_jacket", "blouse_skirt"];
  var HAIR_STYLES = ["short", "side_part", "bun", "receding", "long", "curls", "caesar", "bob", "bald_fringe", "buzz"];
  var SKIN_TONES = [15782842, 15254688, 14265220, 12619364, 10251077, 8015665, 6044194, 4139032];
  var SUITS = [1713988, 1184794, 8006190, 3810328, 4875640, 6969918, 1910064, 3099192, 6045744, 2371901, 921620, 9071154];
  var HAIRS = [1314829, 3089176, 4863784, 7034176, 9139029, 6042136, 2037522];
  var SHIRTS = [15921386, 14673647, 15985888, 15328496, 16777215];
  var TIES = [8003371, 2046571, 2902578, 5917210, 3811914, 9054746];
  var EYES = [5913892, 4008472, 7031338, 4874352, 5598026, 3088408, 8022602, 3820124];
  var Q = { low: { seg: 14, head: [62, 48], fingers: true, tex: "low" }, med: { seg: 20, head: [72, 56], fingers: true, tex: "med" }, high: { seg: 28, head: [76, 58], fingers: true, tex: "high" } };
  function mulberry323(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var clamp2 = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  var mix2 = (a, b, t) => a + (b - a) * t;
  var sstep2 = (a, b, x) => {
    const t = clamp2((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  var G2 = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / (s * s));
  var T = null;
  var geoCache = /* @__PURE__ */ new Map();
  var texCache2 = /* @__PURE__ */ new Map();
  var matCache = null;
  function cached(map, key, fn) {
    if (!map.has(key)) map.set(key, fn());
    return map.get(key);
  }
  function hexMix(a, b, t) {
    const A = new T.Color(a), B = new T.Color(b);
    return A.lerp(B, t).getHex();
  }
  var MODE = "game";
  var matCaches = { game: /* @__PURE__ */ new Map(), linear: /* @__PURE__ */ new Map() };
  var DEEPEN = 1.55;
  function deepen(c) {
    if (MODE === "game") {
      c.r = Math.pow(c.r, DEEPEN);
      c.g = Math.pow(c.g, DEEPEN);
      c.b = Math.pow(c.b, DEEPEN);
    }
    return c;
  }
  function lin(hex) {
    const c = new T.Color(hex);
    return MODE === "linear" ? c.convertSRGBToLinear() : deepen(c);
  }
  function deepenSkin(c) {
    if (MODE === "game") {
      const l = (c.r + c.g + c.b) / 3, k = 1.55 + 0.55 * Math.max(0, l - 0.45) / 0.45;
      c.r = Math.pow(c.r, k);
      c.g = Math.pow(c.g, k + 0.12);
      c.b = Math.pow(c.b, k + 0.16);
    }
    return c;
  }
  function linSkin(hex) {
    const c = new T.Color(hex);
    return MODE === "linear" ? c.convertSRGBToLinear() : deepenSkin(c);
  }
  function texEnc(t) {
    if (MODE === "linear") {
      if ("colorSpace" in t && T.SRGBColorSpace) t.colorSpace = T.SRGBColorSpace;
      else t.encoding = T.sRGBEncoding;
    }
    return t;
  }
  function hash3(x, y, z, s) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ Math.imul(s, 1274126177);
    h = Math.imul(h ^ h >>> 13, 1274126177);
    return ((h ^ h >>> 16) >>> 0) / 4294967296;
  }
  function vn3(x, y, z, s) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let fx = x - xi, fy = y - yi, fz = z - zi;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    fz = fz * fz * (3 - 2 * fz);
    const l = (a, b, t) => a + (b - a) * t, h = (i, j, k) => hash3(xi + i, yi + j, zi + k, s);
    return l(l(l(h(0, 0, 0), h(1, 0, 0), fx), l(h(0, 1, 0), h(1, 1, 0), fx), fy), l(l(h(0, 0, 1), h(1, 0, 1), fx), l(h(0, 1, 1), h(1, 1, 1), fx), fy), fz);
  }
  function eqPaint(W, H, fn) {
    const out = new Float32Array(W * H * 4);
    for (let py = 0; py < H; py++) {
      const th = (py + 0.5) / H * Math.PI, st = Math.sin(th), ny = Math.cos(th);
      for (let px = 0; px < W; px++) {
        const ph = (px + 0.5) / W * Math.PI * 2;
        fn(-Math.cos(ph) * st, ny, Math.sin(ph) * st, out, (py * W + px) * 4);
      }
    }
    return out;
  }
  function toCanvas(W, H, f, normalFromAlpha = false) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d"), id = ctx.createImageData(W, H);
    for (let i = 0; i < W * H * 4; i++) id.data[i] = clamp2(f[i]) * 255;
    ctx.putImageData(id, 0, 0);
    return c;
  }
  function heightToNormal(W, H, h, str) {
    const n = new Float32Array(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const dx = (h[y * W + (x + 1) % W] - h[y * W + (x - 1 + W) % W]) * str, dy = (h[Math.min(H - 1, y + 1) * W + x] - h[Math.max(0, y - 1) * W + x]) * str;
      const l = 1 / Math.hypot(dx, dy, 1);
      n[i * 4] = -dx * l * 0.5 + 0.5;
      n[i * 4 + 1] = dy * l * 0.5 + 0.5;
      n[i * 4 + 2] = l * 0.5 + 0.5;
      n[i * 4 + 3] = 1;
    }
    return n;
  }
  function headSkinMat(S, q) {
    const shadow = S.fem ? 0 : S.beard === "full" || S.beard === "short" ? 0.6 : S.beard === "stubble" ? 1 : 0.45;
    const key = "headskin5" + S.skin + (S.fem ? "f" : "m") + shadow + q + MODE;
    return cached(matCache, key, () => {
      const W = q === "high" ? 512 : q === "med" ? 256 : 128, H = W / 2, base = deepenSkin(new T.Color(S.skin));
      const dark = (base.r + base.g + base.b) / 3 < 0.45;
      const hgt = new Float32Array(W * H), rgh = new Float32Array(W * H);
      const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
        const ax = Math.abs(nx), fr = sstep2(0.05, 0.7, nz);
        const red = 0.75 * G2(ax - 0.45, ny + 0.12, 0.2) * fr + 0.8 * G2(nx / 0.7, ny + 0.14, 0.16) * fr + 0.7 * G2(ax - 0.98, ny + 0.02, 0.3) * sstep2(0.45, -0.2, nz) + 0.45 * G2(nx, ny + 0.47, 0.2) * fr + 0.25 * G2(nx, ny - 0.55, 0.3) * fr * 0;
        const under = 0.5 * G2(ax - 0.32, ny + 0, 0.07) * fr;
        const beard = shadow * sstep2(-0.18, -0.34, ny) * sstep2(-0.3, 0.1, nz) * sstep2(0.98, 0.72, ax) * (1 - G2(nx * 1.1, (ny + 0.47) * 2.4, 0.2) * 0.85 * fr) + shadow * sstep2(-0.3, -0.36, ny) * sstep2(0.04, 0.1, ax) * sstep2(0.2, 0.6, nz) * sstep2(-0.42, -0.36, ny) * 0;
        const mott = vn3(nx * 9, ny * 9, nz * 9, 3) - 0.5, freck = vn3(nx * 40, ny * 40, nz * 40, 5);
        const pore = vn3(nx * 140, ny * 140, nz * 140, 7), pore2 = vn3(nx * 70, ny * 70, nz * 70, 8);
        const stub = vn3(nx * 220, ny * 220, nz * 220, 9);
        let r = base.r, g = base.g, b = base.b;
        const rk = dark ? 0.5 : 1 + 0.9 * clamp2(((base.r + base.g + base.b) / 3 - 0.45) / 0.3);
        r *= 1 + 0.05 * red * rk;
        g *= 1 - 0.12 * red * rk;
        b *= 1 - 0.1 * red * rk;
        r *= 1 - 0.1 * under;
        g *= 1 - 0.12 * under;
        b *= 1 - 0.06 * under; { const ysk = G2(ax - 0.33, ny - 0.12, 0.10) * fr, ybr = G2(ax - 0.30, ny - 0.215, 0.05) * fr, ych = G2(ax - 0.55, ny + 0.3, 0.13) * fr, yjw = sstep2(-0.5, -0.85, ny) * sstep2(-0.2, 0.3, nz), ytm = G2(ax - 0.75, ny - 0.15, 0.12) * fr;   /* 20261030ad: painted sockets, under-brow, cheek hollow, temple and under-jaw shade: the face holds its planes at 6-10 m */
      const yao = G2(ax - 0.17, ny - 0.1, 0.045) * fr + 0.8 * G2(ax - 0.15, ny + 0.34, 0.04) * fr + sstep2(-0.62, -0.9, ny) * sstep2(0.0, 0.4, nz) * 0.9;   /* 20261030af: crease occlusion (inner eye corners, nasolabial, under chin) */
      const ysh = 1 - 0.3 * yao - 0.42 * ysk - 0.22 * ybr - 0.14 * ych - 0.1 * ytm - 0.38 * yjw; r *= ysh; g *= ysh * 0.985; b *= ysh * 0.99; }
      { const E = (v, w) => Math.exp(-(v / w) * (v / w));   /* 20261030ae: painted feature marks in the head albedo itself, so they survive every LOD tier and 6-10 m */
        const ybw = E(ny - 0.255 - 0.03 * (0.3 - Math.abs(ax - 0.3)), 0.032) * sstep2(0.07, 0.13, ax) * sstep2(0.5, 0.42, ax) * fr, yln = E(ny - 0.135, 0.022) * sstep2(0.2, 0.25, ax) * sstep2(0.45, 0.4, ax) * fr;
        const yns = E(ax - 0.1, 0.03) * sstep2(0.06, -0.04, ny) * sstep2(-0.32, -0.22, ny) * fr, yun = G2(nx, ny + 0.32, 0.06) * fr, ylp = E(ny + 0.47, 0.02) * sstep2(0.2, 0.12, ax) * fr, yul = G2(nx * 0.5, ny + 0.58, 0.05) * fr;
        const yk = 1 - 0.8 * ybw - 0.72 * yln - 0.22 * yns - 0.22 * yun - 0.38 * ylp - 0.18 * yul; r *= yk; g *= yk * 0.97; b *= yk * 0.96; }
        const m2 = 1 + mott * 0.06 - sstep2(0.7, 0.9, freck) * 0.05 * (dark ? 0.3 : 1);
        r *= m2;
        g *= m2;
        b *= m2;
        const bs = beard * (0.55 + 0.45 * sstep2(0.35, 0.75, stub));
        r = mix2(r, r * 0.62, bs * 0.55);
        g = mix2(g, g * 0.64, bs * 0.55);
        b = mix2(b, b * 0.72, bs * 0.55);
        const gain = 1.07;
        o[i] = r * gain;
        o[i + 1] = g * gain;
        o[i + 2] = b * gain;
        o[i + 3] = 1;
        hgt[i / 4] = pore * 0.6 + pore2 * 0.4 - bs * stub * 0.3;
        const tz = Math.max(G2(nx, ny - 0.45, 0.3), G2(nx / 0.6, ny + 0.1, 0.18)) * fr;
        rgh[i / 4] = clamp2(0.62 - tz * 0.18 + (pore - 0.5) * 0.1 + bs * 0.12);
      });
      const nrm = heightToNormal(W, H, hgt, W / 256 * 0.8);
      const orm = new Float32Array(W * H * 4);
      for (let i = 0; i < W * H; i++) {
        orm[i * 4] = 1;
        orm[i * 4 + 1] = rgh[i];
        orm[i * 4 + 2] = 0;
        orm[i * 4 + 3] = 1;
      }
      const mk = (cv) => {
        const t = new T.CanvasTexture(cv);
        t.anisotropy = 4;
        return t;
      };
      const m = new T.MeshStandardMaterial({
        map: texEnc(mk(toCanvas(W, H, col))),
        normalMap: mk(toCanvas(W, H, nrm)),
        normalScale: new T.Vector2(0.12, 0.12),
        roughnessMap: mk(toCanvas(W, H, orm)),
        roughness: 1,
        metalness: 0
      });
      gameSkin(m, S.skin);
      m.name = "onumc:headskin";
      return m;
    });
  }
  function gameSkin(m, hex) {
    if (MODE === "game") {
      const c = new T.Color(hex);
      m.emissive = new T.Color(c.r * 0.09, c.g * 0.03, c.b * 0.02);
    } else m.emissive = lin(hexMix(hex, 16724e3, 0.5)).multiplyScalar(0.025);
  }
  function lidMat(S) {
    return cached(matCache, "lid" + S.skin + MODE, () => {
      const m = new T.MeshStandardMaterial({ color: linSkin(hexMix(S.skin, 6961712, 0.12)), roughness: 0.5 });
      gameSkin(m, S.skin);
      return m;
    });
  }
  function earMat(S) {
    return cached(matCache, "ear" + S.skin + MODE, () => {
      const m = new T.MeshStandardMaterial({ color: linSkin(hexMix(S.skin, 12601920, 0.16)), roughness: 0.55 });
      gameSkin(m, S.skin);
      return m;
    });
  }
  function irisMat(hex) {
    return cached(matCache, "iris" + hex + MODE, () => {
      const S2 = 64, c = document.createElement("canvas");
      c.width = c.height = S2;
      const g = c.getContext("2d"), base = deepen(new T.Color(hex)).multiplyScalar(0.55);
      const id = g.createImageData(S2, S2);
      for (let y = 0; y < S2; y++) for (let x = 0; x < S2; x++) {
        const dx = (x + 0.5) / S2 * 2 - 1, dy = (y + 0.5) / S2 * 2 - 1, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
        const fib = 0.75 + 0.25 * Math.sin(a * 37 + Math.sin(a * 11) * 2) * Math.sin(a * 23 + r * 7), ring = sstep2(0.82, 0.98, r), inner = 1 + 0.35 * (1 - sstep2(0.25, 0.6, r));
        const k = fib * inner * (1 - ring * 0.7), p = (y * S2 + x) * 4;
        id.data[p] = clamp2(base.r * k + (1 - sstep2(0.2, 0.5, r)) * 0.08) * 255;
        id.data[p + 1] = clamp2(base.g * k + (1 - sstep2(0.2, 0.5, r)) * 0.06) * 255;
        id.data[p + 2] = clamp2(base.b * k) * 255;
        id.data[p + 3] = 255;
      }
      g.putImageData(id, 0, 0);
      const t = texEnc(new T.CanvasTexture(c));
      return new T.MeshStandardMaterial({ map: t, roughness: 0.2 });
    });
  }
  // 20261030ab: hair strand cards. Alpha-cut clumps of strands, each its own tone, laid on the hair surface and lifted at the tips:
// a broken, layered outline at room distance instead of a solid painted shell.
function hairCardMat(S) {
  return cached(matCache, 'haircard' + S.hair + MODE, () => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
    const base = deepen(new T.Color(S.hair)); let sd = 13; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 60; i++) { const px = 4 + r() * 56, w = 0.8 + r() * 1.6, len = 70 + r() * 58, v = 0.55 + r() * 0.4;
      x.strokeStyle = 'rgb(' + Math.min(255, base.r * 255 * v | 0) + ',' + Math.min(255, base.g * 255 * v | 0) + ',' + Math.min(255, base.b * 255 * v | 0) + ')';
      x.lineWidth = w; x.beginPath(); x.moveTo(px, 0); x.quadraticCurveTo(px + (r() - 0.5) * 10, len * 0.5, px + (r() - 0.5) * 14, len); x.stroke(); }
    { x.globalCompositeOperation = 'source-atop'; const gr = x.createLinearGradient(0, 0, 0, 128);   /* 20261030ae: fake anisotropic sheen band + dark roots: clumps read as hair, not slabs */
      gr.addColorStop(0, 'rgba(0,0,0,0.45)'); gr.addColorStop(0.28, 'rgba(255,240,215,0.22)'); gr.addColorStop(0.42, 'rgba(255,240,215,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 128); x.globalCompositeOperation = 'source-over'; }
    const t = texEnc(new T.CanvasTexture(c));
    return new T.MeshStandardMaterial({ color: 0xffffff, map: t, alphaTest: 0.45, side: T.DoubleSide, roughness: 0.88, metalness: 0 });
  });
}
function hairShellMat(S, q) {
    return cached(matCache, "hairshell3" + S.style + S.hair + (S.fem ? 1 : 0) + q + MODE, () => {
      const W = q === "high" ? 512 : 256, H = W / 2, base = deepen(new T.Color(S.hair)); if ((base.r + base.g + base.b) / 3 > 0.4) base.multiplyScalar(0.78);
      const hgt = new Float32Array(W * H);
      const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
        const { m } = hairMask(S.style, nx, ny, nz, S.fem);
        const sc = mix2(nx, ny, sstep2(0.55, 0.9, Math.abs(nx))), al = (nz + ny) * 0.5;
        const strand = vn3(sc * 90, al * 6, 0, 11) * 0.6 + vn3(sc * 40, al * 3, 0, 12) * 0.4;
        const brk = vn3(nx * 60, ny * 60, nz * 60, 13);
        const a = sstep2(0.44, 0.56, m + (brk - 0.5) * 0.16 + (strand - 0.5) * 0.1);
        const k = 0.78 + strand * 0.42;
        o[i] = base.r * k;
        o[i + 1] = base.g * k;
        o[i + 2] = base.b * k;
        o[i + 3] = a;
        hgt[i / 4] = strand;
      });
      const alpha = new Float32Array(W * H * 4);
      for (let i = 0; i < W * H; i++) {
        const a = col[i * 4 + 3];
        alpha[i * 4] = alpha[i * 4 + 1] = alpha[i * 4 + 2] = a;
        alpha[i * 4 + 3] = 1;
        col[i * 4 + 3] = 1;
      }
      const nrm = heightToNormal(W, H, hgt, W / 256 * 1.5);
      const mk = (cv) => new T.CanvasTexture(cv);
      return new T.MeshStandardMaterial({
        map: texEnc(mk(toCanvas(W, H, col))),
        alphaMap: mk(toCanvas(W, H, alpha)),
        alphaTest: 0.5,
        normalMap: mk(toCanvas(W, H, nrm)),
        normalScale: new T.Vector2(0.5, 0.5),
        roughness: 0.9,
        metalness: 0,
        side: T.FrontSide
      });
    });
  }
  function hairFuzzMat(S, q) {
    return cached(matCache, "hairfuzz" + S.style + S.hair + (S.fem ? 1 : 0) + q + MODE, () => {
      const W = q === "high" ? 512 : 256, H = W / 2, base = deepen(new T.Color(S.hair)); if ((base.r + base.g + base.b) / 3 > 0.4) base.multiplyScalar(0.78);
      const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
        const { m: m2 } = hairMask(S.style, nx, ny, nz, S.fem);
        const sc = mix2(nx, ny, sstep2(0.55, 0.9, Math.abs(nx))), al = (nz + ny) * 0.5;
        const fine = vn3(sc * 220, al * 10, 0, 21) * 0.65 + vn3(sc * 420, al * 18, 0, 22) * 0.35;
        const clump = vn3(sc * 30, al * 4, 0, 23);
        const a = sstep2(0.56, 0.6, fine * 0.8 + clump * 0.35) * sstep2(0.48, 0.62, m2);
        const k = 0.85 + fine * 0.4;
        o[i] = base.r * k;
        o[i + 1] = base.g * k;
        o[i + 2] = base.b * k;
        o[i + 3] = a;
      });
      const alpha = new Float32Array(W * H * 4);
      for (let i = 0; i < W * H; i++) {
        const a = col[i * 4 + 3];
        alpha[i * 4] = alpha[i * 4 + 1] = alpha[i * 4 + 2] = a;
        alpha[i * 4 + 3] = 1;
        col[i * 4 + 3] = 1;
      }
      const mk = (cv) => new T.CanvasTexture(cv);
      const m = new T.MeshStandardMaterial({ map: texEnc(mk(toCanvas(W, H, col))), alphaMap: mk(toCanvas(W, H, alpha)), alphaTest: 0.5, roughness: 0.55, metalness: 0, side: T.DoubleSide });
      m.name = "onumc:hairfuzz";
      return m;
    });
  }
  function lipGeo(upper) {
    const g = new T.SphereGeometry(1, 28, 12), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const e = Math.sqrt(Math.max(0, 1 - x * x));
      y *= mix2(0.22, 1, e);
      z *= mix2(0.35, 1, e);
      if (upper) {
        if (y > 0) y *= 1 + 0.45 * (Math.exp(-(((x - 0.2) / 0.14) ** 2)) + Math.exp(-(((x + 0.2) / 0.14) ** 2))) - 0.45 * Math.exp(-((x / 0.08) ** 2));
        y -= 0.35 * x * x;
      } else {
        y += 0.35 * x * x - 0.1;
        z *= 1 + 0.15 * e;
      }
      p.setXYZ(i, x, y, z);
    }
    return weld(g);
  }
  function weld(geo) {
    geo.computeVertexNormals();
    const p = geo.attributes.position, n = geo.attributes.normal, m = /* @__PURE__ */ new Map();
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 1e4) + "," + Math.round(p.getY(i) * 1e4) + "," + Math.round(p.getZ(i) * 1e4);
      (m.get(k) || m.set(k, []).get(k)).push(i);
    }
    const v = new T.Vector3();
    for (const ids of m.values()) if (ids.length > 1) {
      v.set(0, 0, 0);
      for (const i of ids) v.add(new T.Vector3(n.getX(i), n.getY(i), n.getZ(i)));
      v.normalize();
      for (const i of ids) n.setXYZ(i, v.x, v.y, v.z);
    }
    if (geo.attributes.uv) geo.setAttribute("uv2", geo.attributes.uv);
    return geo;
  }
  function loft(rings, seg, pw = 2.2, caps = true) {
    const pos = [], uv = [], idx = [], R2 = rings.length;
    for (let r = 0; r < R2; r++) {
      const g = rings[r];
      for (let j = 0; j <= seg; j++) {
        const a = j / seg * Math.PI * 2, c = Math.sin(a), s = Math.cos(a);
        const e = 2 / (g.p || pw), cx = Math.sign(c) * Math.pow(Math.abs(c), e), sz = Math.sign(s) * Math.pow(Math.abs(s), e);
        pos.push((g.x || 0) + cx * g.w, g.y, (g.z || 0) + sz * g.d);
        uv.push(j / seg * (g.w + g.d) * 3.2 / 0.25 * 0.5, g.y / 0.25);
      }
    }
    for (let r = 0; r < R2 - 1; r++) for (let j = 0; j < seg; j++) {
      const a = r * (seg + 1) + j, b = a + seg + 1;
      if (rings[r].y > rings[r + 1].y) idx.push(a, b, a + 1, a + 1, b, b + 1);
      else idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
    if (caps) for (const r of [0, R2 - 1]) {
      const g = rings[r], c = pos.length / 3;
      pos.push(g.x || 0, g.y, g.z || 0);
      uv.push(0.5, 0.5);
      const top = r === R2 - 1 === rings[R2 - 1].y > rings[0].y;
      for (let j = 0; j < seg; j++) {
        const a = r * (seg + 1) + j;
        if (top) idx.push(c, a + 1, a);
        else idx.push(c, a, a + 1);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return weld(geo);
  }
  function limb(len, rads, seg, d = 1, p = 2) {
    return loft(rads.map((r, i) => ({ y: -len * i / (rads.length - 1), w: r, d: r * d, p })), seg);
  }
  function noiseCanvas(S, seed, fn) {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d"), id = ctx.createImageData(S, S);
    const r = mulberry323(seed), L = 64, lat = new Float32Array(L * L);
    for (let i = 0; i < lat.length; i++) lat[i] = r();
    const vn = (x, y, f) => {
      x *= f;
      y *= f;
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, P = Math.min(L, f);
      const a = lat[yi % P * L + xi % P], b = lat[yi % P * L + (xi + 1) % P], c2 = lat[(yi + 1) % P * L + xi % P], d = lat[(yi + 1) % P * L + (xi + 1) % P];
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return mix2(mix2(a, b, sx), mix2(c2, d, sx), sy);
    };
    const h = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = fn(vn, x / S, y / S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, p = i * 4;
      const dx = (h[y * S + (x + 1) % S] - h[y * S + (x - 1 + S) % S]) * S / 64, dy = (h[(y + 1) % S * S + x] - h[(y - 1 + S) % S * S + x]) * S / 64;
      const l = 1 / Math.hypot(dx, dy, 1);
      id.data[p] = (-dx * l * 0.5 + 0.5) * 255;
      id.data[p + 1] = (dy * l * 0.5 + 0.5) * 255;
      id.data[p + 2] = (l * 0.5 + 0.5) * 255;
      id.data[p + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  }
  function skinNormal(S) {
    return cached(texCache2, "skin" + S, () => {
      const t = noiseCanvas(S, 7, (n, u, v) => n(u, v, 64) * 0.5 + n(u, v, 32) * 0.35 + n(u, v, 8) * 0.15);
      t.repeat.set(6, 6);
      return t;
    });
  }
  function hairNormal(S) {
    return cached(texCache2, "hair" + S, () => (() => {
      const t = noiseCanvas(S, 9, (n, u, v) => n(u, v * 0.0625, 64) * 0.7 + n(u, v * 0.125, 32) * 0.3);
      t.repeat.set(6, 1);
      return t;
    })());
  }
  function stdMat(key, o) {
    return cached(matCache, key, () => {
      const m = new T.MeshStandardMaterial(o);
      m.name = "onumc:" + key;
      return m;
    });
  }
  function skinMat(hex, q) {
    return cached(matCache, "skin" + hex + q, () => {
      const m = new T.MeshStandardMaterial({
        color: linSkin(hex),
        roughness: 0.52,
        metalness: 0,
        normalMap: skinNormal(q === "high" ? 512 : 256),
        normalScale: new T.Vector2(0.06, 0.06)
      });
      gameSkin(m, hex);
      m.name = "onumc:skin";
      return m;
    });
  }
  function hairMat(hex, q) {
    return cached(matCache, "hair" + hex + q, () => new T.MeshStandardMaterial({
      color: lin(hex),
      roughness: 0.62,
      metalness: 0,
      normalMap: hairNormal(q === "high" ? 512 : 256),
      normalScale: new T.Vector2(0.3, 0.3)
    }));
  }
  function clothMat(hex, q, name = "suit_wool", rep = 1) {
    return cached(matCache, "cloth" + name + hex + q + rep, () => {
      if (MODE === "linear" && name === "suit_wool" && hex === 1713988) return makeMaterial("suit_wool", T, { repeat: rep, quality: Q[q].tex, physical: false });
      const tx = getTextures(name, T, { repeat: rep, quality: Q[q].tex });
      return new T.MeshStandardMaterial({ color: lin(hex), normalMap: tx.normalMap, roughnessMap: tx.ormMap, aoMap: tx.ormMap, aoMapIntensity: 0.5, roughness: 1, metalness: 0 });
    });
  }
  function leatherMat(hex, q) {
    return cached(matCache, "leather" + hex + q, () => {
      const tx = getTextures("leather", T, { repeat: 1, quality: Q[q].tex });
      return new T.MeshStandardMaterial({ color: lin(hex), normalMap: tx.normalMap, normalScale: new T.Vector2(0.5, 0.5), roughness: 0.32, metalness: 0 });
    });
  }
  function headShape(f) {
    const hw = 0.077 * f.faceW, hh = 0.112, hd = 0.098;
    return (nx, ny, nz, out) => {
      const fr = sstep2(0.05, 0.7, nz), ax = Math.abs(nx), age = f.age;
      let r = 1;
      const A = f.asym, eyY = nx < 0 ? A.eyeL : A.eyeR, nxs = nx - A.nose * sstep2(0.25, -0.3, ny);
      r -= 0.045 * G2(ax - 0.34, ny - 0.11 - eyY, 0.15) * fr;
      r += 0.05 * Math.exp(-(((ny - 0.27) / 0.075) ** 2)) * sstep2(0.62, 0.1, ax) * fr * f.brow;
      const nw = 0.104 * f.bridge + 0.085 * sstep2(0.12, -0.24, ny) * f.wing;
      const na = ny > -0.24 ? mix2(0.012, 0.112 * f.nose, sstep2(0.2, -0.2, ny)) : 0.112 * f.nose * sstep2(-0.33, -0.24, ny);
      r += (na + 0.035 * f.hook * G2(0, ny + 0.02, 0.11)) * Math.exp(-((nxs / nw) ** 2)) * fr;
      r += 0.052 * f.tip * G2(nxs / 1.2, ny + 0.19 - f.up, 0.085) * fr;
      r += 0.035 * f.wing * G2(Math.abs(nxs) - 0.12 * f.wing, ny + 0.22, 0.07) * fr;
      r += 0.06 * f.cheek * (1 + (nx < 0 ? -A.cheek : A.cheek)) * G2(ax - 0.46, ny + 0.03, 0.2) * fr;
      r -= 0.03 * G2(ax - 0.28, ny + 0.16, 0.12) * fr * (1 - age * 0.3);
      r += 0.07 * G2(nx * 0.9, (ny + 0.47) * 1.3, 0.26) * fr;
      r -= 0.025 * G2(nx, ny + 0.6, 0.08) * fr;
      r += 0.06 * f.chin * G2(nx * 0.95, ny + 0.8, 0.22) * fr;
      r -= 0.04 * G2(ax - 0.84, ny - 0.22, 0.22); r += 0.045 * G2(ax - 0.78, ny + 0.42, 0.17) * sstep2(-0.5, 0.2, nz) + 0.025 * G2(ax - 0.62, ny + 0.08, 0.16) * fr - 0.02 * G2(ax - 0.16, ny + 0.36, 0.05) * fr;   /* 20261030af: jaw angle, side-cheek volume, nasolabial crease: a face silhouette, not an egg */
      r -= age * 0.018 * G2(ax - 0.3, ny + 0.02, 0.07) * fr;
      r -= age * 0.022 * G2((ax - 0.2 - -(ny + 0.3) * 0.35) * 2.4, ny + 0.32, 0.14) * fr * sstep2(0.1, 0.16, ax);
      r += age * 0.03 * G2(ax - 0.5, ny + 0.62, 0.16);
      if (ny > 0.38 && ny < 0.75) r -= age * 5e-3 * Math.pow(Math.abs(Math.sin(ny * 48)), 6) * fr;
      let x = nx * r, y = ny * r, z = nz * r;
      const jaw = ny < 0 ? mix2(1, f.jaw * 0.92, sstep2(-0.15, -0.9, ny)) : 1;
      x *= jaw;
      if (ny < -0.3) {
        const sq = sstep2(-0.3, -0.75, ny) * (1 - 0.45 * sstep2(-0.86, -1, ny));
        x *= 1 + (f.fem ? 0.08 : 0.14) * sq;
      }
      if (ny < -0.8) y *= mix2(1, 0.95, sstep2(-0.8, -1, ny));
      if (nz < 0) z *= 1.08 - 0.25 * sstep2(-0.2, -0.8, ny);
      if (ny < -0.55 && nz < 0.3) z *= mix2(1, 0.75, sstep2(-0.55, -0.95, ny) * sstep2(0.3, -0.4, nz));
      out[0] = x * hw;
      out[1] = y * hh;
      out[2] = z * hd;
      return out;
    };
  }
  function sphereGeo(ws, hs, fnPoint) {
    const g = new T.SphereGeometry(1, ws, hs), p = g.attributes.position, o = [0, 0, 0];
    for (let i = 0; i < p.count; i++) {
      fnPoint(p.getX(i), p.getY(i), p.getZ(i), o);
      p.setXYZ(i, o[0], o[1], o[2]);
    }
    return weld(g);
  }
  var surf = (shape, nx, ny, nz) => {
    const l = Math.hypot(nx, ny, nz);
    return new T.Vector3(...shape(nx / l, ny / l, nz / l, [0, 0, 0]));
  };
  function hairMask(style, nx, ny, nz, fem) {
    const ax = Math.abs(nx);
    let h = mix2(-0.55, 0.45, sstep2(-0.25, 0.75, nz)) + 0.1 * G2(ax - 0.42, 0, 0.18) * sstep2(0.3, 0.8, nz) - 0.04 * G2(nx, 0, 0.2);
    const ear = sstep2(0.62, 0.85, ax) * sstep2(0.55, 0, nz) * sstep2(-0.55, -0.1, nz);
    h = Math.max(h, mix2(h, 0.05, ear));
    let t = 0.035 + 0.03 * sstep2(-0.2, 1, ny);
    if (style === "buzz" || style === "caesar") t = style === "buzz" ? 0.012 : 0.03;
    if (style === "caesar") h = mix2(h, 0.62, sstep2(0.3, 0.9, nz) * 0.6);
    if (style === "receding" || style === "bald_fringe") {
      h = mix2(h, 0.8, sstep2(0, 0.8, nz));
      h += 0.15 * G2(ax - 0.35, 0, 0.25) * sstep2(0.2, 0.9, nz);
    }
    if (style === "bald_fringe") {
      const top = sstep2(0.25, 0.4, ny);
      return { m: sstep2(h - 0.05, h + 0.05, ny) * (1 - top), t: 0.025 };
    }
    if (style === "side_part") {
      t += 0.035 * G2(nx + 0.25, ny - 0.75, 0.45) * sstep2(-0.2, 0.6, nz);
      t -= 0.02 * G2(nx - 0.3, ny - 0.8, 0.06);
    }
    if (style === "curls") t = 0.06 + 0.025 * Math.sin(nx * 23) * Math.sin(ny * 21) * Math.sin(nz * 19);
    if (style === "bob" || style === "long") {
      h = Math.min(h, mix2(-0.95, 0.44, sstep2(0.1, 0.8, nz)));
      t = 0.07 + 0.04 * sstep2(0.2, -0.8, ny);
      t += 0.03 * G2(nx + 0.35, ny - 0.75, 0.4);
      t -= 0.03 * G2(nx + 0.12, ny - 0.82, 0.05);
    }
    if (style === "bun") {
      t = 0.028;
      h = mix2(h, 0.5, sstep2(0.3, 0.8, nz));
    }
    return { m: sstep2(h - 0.09, h + 0.09, ny), t };
  }
  var UNIFORM_BY_GOV = {
    constitutional_monarchy: "court",
    absolute_monarchy: "court",
    empire: "court",
    junta: "military",
    dictatorship: "military",
    communist: "tunic",
    socialist: "tunic",
    theocracy: "robe",
    technocracy: "sleek",
    corporate: "sleek",
    tribal: "tribal",
    consular_republic: "consular"
  };
  var UNIFORM_STYLES = ["court", "military", "tunic", "robe", "sleek", "tribal", "consular", "civic"];
  var hexOf = (s) => typeof s === "number" ? s : parseInt(String(s).replace("#", ""), 16);
  var lumOf = (h) => ((h >> 16 & 255) * 0.3 + (h >> 8 & 255) * 0.59 + (h & 255) * 0.11) / 255;
  var satOf = (h) => {
    const r = h >> 16 & 255, g = h >> 8 & 255, b = h & 255;
    return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  };
  function hm(a, b, t) {
    const c = (x, s) => x >> s & 255, f = (s) => Math.round(c(a, s) + (c(b, s) - c(a, s)) * t);
    return f(16) << 16 | f(8) << 8 | f(0);
  }
  function resolveUniform(u, fem) {
    var _a, _b;
    if (!u) return null;
    const gov = u.govType || u.type || "republic", seed = (_a = u.seed) != null ? _a : 1, D = describeFlag(gov, seed);
    const pal = D.palette.map(hexOf), byLum = pal.slice().sort((a, b) => lumOf(a) - lumOf(b));
    const dark = byLum[0], light = byLum[byLum.length - 1], accent = pal.slice().sort((a, b) => satOf(b) - satOf(a))[0];
    const gold = (_b = pal.find((h) => satOf(h) > 0.35 && lumOf(h) > 0.55 && (h >> 16 & 255) > (h & 255) + 60)) != null ? _b : 13936202;
    const style = u.style || UNIFORM_BY_GOV[gov] || "civic";
    const U = { gov, seed, style, describe: D, dark, light, accent: accent === dark ? light : accent, trim: gold, flag: { type: gov, seed }, shirt: 15921386 };
    switch (style) {
      case "court":
        Object.assign(U, { main: hm(dark, 657932, 0.35), outfit: fem ? "dress_jacket" : "suit_tie", tie: U.accent });
        break;
      case "military":
        Object.assign(U, { main: hm(hm(dark, 4936480, 0.45), 1052688, 0.15), outfit: fem ? "mil_f" : "mil", tie: 1710618, shirt: 14209724 });
        break;
      case "tunic":
        Object.assign(U, { main: hm(hm(dark, 5921352, 0.6), 2105376, 0.1), outfit: "tunic", tie: accent });
        break;
      case "robe":
        Object.assign(U, { main: lumOf(light) > 0.7 ? hm(light, 16777215, 0.2) : light, outfit: "robe", tie: accent });
        U.dress = U.main;
        break;
      case "sleek":
        Object.assign(U, { main: hm(dark, 2500652, 0.6), outfit: fem ? "sleek_f" : "sleek", tie: 1381914, shirt: 1842465 });
        break;
      case "tribal":
        Object.assign(U, { main: pal[0], outfit: "tribal", tie: accent });
        U.dress = pal[0];
        break;
      case "consular":
        Object.assign(U, { main: 10165038, accent: 15259043, trim: 15259043, outfit: fem ? "skirt_suit" : "suit_tie", tie: 15259043, shirt: 15984324 });
        break;
      default:
        Object.assign(U, { main: hm(dark, 1053208, 0.4), outfit: fem ? "skirt_suit" : "suit_tie", tie: U.accent });
    }
    return U;
  }
  var pinTexCache = /* @__PURE__ */ new WeakMap();
  function pinTexture(src) {
    var _a;
    if (src && src.isTexture) return src;
    if (src && (src.getContext || src.tagName === "CANVAS")) {
      if (!pinTexCache.has(src)) {
        const t = new T.CanvasTexture(src);
        texEnc(t);
        pinTexCache.set(src, t);
      }
      return pinTexCache.get(src);
    }
    const ty = src && (src.type || src.govType) || "republic", sd = (_a = src && src.seed) != null ? _a : 1;
    return cached(texCache2, "pin" + ty + "|" + sd + MODE, () => {
      const t = new T.CanvasTexture(drawFlag(ty, sd, { width: 128, height: 80 }));
      texEnc(t);
      t.anisotropy = 4;
      return t;
    });
  }
  function pinMat(tex) {
    return cached(matCache, "pinmat" + tex.uuid, () => new T.MeshStandardMaterial({ map: tex, roughness: 0.28, metalness: 0.1 }));
  }
  function badgeMat(U) {
    return cached(matCache, "badge" + MODE, () => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d");
      g.fillStyle = "#9B1B2E";
      g.beginPath();
      g.arc(64, 64, 62, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#e8d5a3";
      g.lineWidth = 7;
      g.beginPath();
      g.arc(64, 64, 57, 0, Math.PI * 2);
      g.stroke();
      jerusalemCross(g, 64, 64, 36, "#f3e6c4");
      const t = texEnc(new T.CanvasTexture(c));
      return new T.MeshStandardMaterial({ map: t, roughness: 0.3, metalness: 0.3 });
    });
  }
  function dressFor(person = {}, nation = {}) {
    var _a, _b;
    const d = nation.decree || nation.dressCode;
    if (d && d.active !== false) return { uniform: { govType: d.govType || nation.govType, seed: (_b = (_a = d.seed) != null ? _a : nation.seed) != null ? _b : 1, style: d.style }, homeFlag: null };
    const hf = person.homeFlag || (nation.stateFlags && person.homeState != null ? nation.stateFlags[person.homeState] : null) || null;
    return { uniform: null, homeFlag: hf };
  }
  function applyDressCode(target, decree, THREE) {
    const g = target && (target.isObject3D ? target : target.group);
    if (!g) return { ...target || {}, uniform: decree || null };
    const ud = g.userData, three = THREE || ud.THREE, o = { ...ud.opts, uniform: decree || null };
    const h = makeCharacter(three, o), ng = h.group;
    ng.position.copy(g.position);
    ng.quaternion.copy(g.quaternion);
    ng.visible = g.visible;
    const parent = g.parent;
    if (parent) {
      const i = parent.children.indexOf(g);
      parent.remove(g);
      parent.add(ng);
      parent.children.splice(parent.children.indexOf(ng), 1);
      parent.children.splice(i, 0, ng);
    }
    disposeCharacter(g);
    return h;
  }
  var BEARDS = ["none", "stubble", "moustache", "kaiser", "short", "full"];
  function normBeard(b, fem, r, a01) {
    const roll = r();
    if (b == null) return fem ? "none" : roll < 0.12 ? "stubble" : roll < 0.2 ? "short" : roll < 0.26 ? "full" : roll < 0.31 ? "moustache" : roll < 0.32 + 0.03 * a01 ? "kaiser" : "none";
    if (b === true) return ["short", "full", "moustache", "stubble"][roll * 4 | 0];
    if (b === false) return "none";
    return BEARDS.includes(b) ? b : "none";
  }
  function rollSpec(o) {
    var _a;
    const r = mulberry323((o.seed >>> 0) * 2654435761 + 12345), pick = (a) => a[r() * a.length | 0];
    const sex = o.sex || (r() < 0.5 ? "m" : "f"), fem = sex === "f" || sex === "fem" || sex === "female";
    let age = o.age == null ? 30 + r() * 45 : o.age;
    if (age <= 1) age = 28 + age * 50;
    const a01 = clamp2((age - 25) / 55);
    let skin = o.skin == null ? pick(SKIN_TONES) : o.skin;
    if (skin <= 1) skin = SKIN_TONES[Math.round(skin * 7)];
    const builds = { slim: 0.88, average: 1, athletic: 1.05, broad: 1.12, heavy: 1.25 };
    const build = typeof o.build === "string" ? builds[o.build] || 1 : o.build || mix2(0.9, 1.2, r() * r() * 1.4 > 1 ? 1 : r());
    const rc = mulberry323((o.seed >>> 0) * 40503 + 99), pickC = (a) => a[rc() * a.length | 0];
    const outfitR = pickC(fem ? OUTFITS.slice(4) : OUTFITS.slice(0, 4)), outfit = o.outfit || outfitR;
    const style = o.hair || pick(fem ? ["bob", "long", "bun", "bob", "short", "curls"] : a01 > 0.55 ? ["receding", "bald_fringe", "side_part", "short", "caesar"] : ["short", "side_part", "caesar", "buzz", "curls"]);
    const baseHair = o.hairColor != null ? o.hairColor : skin <= 14265220 && skin >= 10251077 ? pick(HAIRS) : skin < 10251077 ? pick([1314829, 2037522, 3089176]) : pick(HAIRS);
    const grey = clamp2((a01 - 0.35) * 1.6 + (r() - 0.5) * 0.3);
    return {
      fem,
      age,
      a01,
      skin,
      build,
      outfit,
      style,
      glasses: (_a = o.glasses) != null ? _a : r() < 0.25 * (0.5 + a01),
      beard: normBeard(o.beard, fem, r, a01),
      height: o.height || (fem ? 1.56 + r() * 0.18 : 1.68 + r() * 0.2),
      hair: hexMix(baseHair, 13157564, grey * 0.9),
      eye: o.eye || pick(EYES),
      suit: ((s) => {
        var _a2;
        return (_a2 = o.suitColor) != null ? _a2 : s;
      })(pickC(SUITS)),
      shirt: ((s) => {
        var _a2;
        return (_a2 = o.shirtColor) != null ? _a2 : s;
      })(pickC(SHIRTS)),
      tie: ((s) => {
        var _a2;
        return (_a2 = o.tieColor) != null ? _a2 : s;
      })(pickC(TIES)),
      dress: o.dressColor,
      face: ((F) => o.face ? Object.assign(F, o.face) : F)({
        faceW: fem ? 0.92 + r() * 0.08 : 0.98 + r() * 0.08,
        jaw: fem ? 0.8 + r() * 0.1 : 0.92 + r() * 0.14,
        brow: fem ? 0.6 + r() * 0.3 : 0.9 + r() * 0.4,
        nose: fem ? 0.82 + r() * 0.25 : 0.95 + r() * 0.35,
        cheek: 0.8 + r() * 0.5,
        chin: 0.7 + r() * 0.6,
        lip: fem ? 1.1 + r() * 0.2 : 0.85 + r() * 0.2,
        age: a01,
        bridge: 0.8 + r() * 0.5,
        wing: 0.85 + r() * 0.35,
        hook: (r() - 0.45) * (fem ? 0.8 : 1.4),
        tip: 0.6 + r() * 0.9,
        up: (r() - 0.4) * 0.06,
        mouthW: 0.92 + r() * 0.16,
        lidDrop: r() * 0.12 + a01 * 0.1,
        ear: 0.9 + r() * 0.2,
        tilt: (r() - 0.5) * 0.12,
        browShape: { arch: r() * (fem ? 1.3 : 0.9), thick: fem ? 0.8 + r() * 0.4 : 0.9 + r() * 0.6, len: r(), tail: r(), gap: (r() - 0.5) * 0.04 },
        asym: { eyeL: (r() - 0.5) * 0.04, eyeR: (r() - 0.5) * 0.04, browL: (r() - 0.5) * 0.05, browR: (r() - 0.5) * 0.05, nose: (r() - 0.5) * 0.05, cheek: (r() - 0.5) * 0.2, mouth: (r() - 0.5) * 0.1 }
      }),
      seed: o.seed >>> 0,
      phase: r() * 100,
      blinkSeed: r() * 1e9 | 0
    };
  }
  function makeCharacter(THREE, opts = {}) {
    T = THREE;
    MODE = opts.colorMode === "linear" ? "linear" : "game";
    matCache = matCaches[MODE];
    const opts0 = opts;
    {
      const s0 = rollSpec({ seed: 1, ...opts }), U0 = resolveUniform(opts.uniform, s0.fem);
      if (U0) opts = { ...opts, outfit: U0.outfit, suitColor: liftCloth(U0.main), shirtColor: U0.shirt, tieColor: U0.tie, dressColor: U0.dress };
      opts.__U = U0;
    }
    const q = Q[opts.quality] ? opts.quality : "med", QQ = Q[q], S = rollSpec({ seed: 1, ...opts }), seg = QQ.seg;
    S.uniform = opts.__U;
    const fem = S.fem, B = S.build, root = new T.Group(), body = new T.Group(), rig = new T.Group();
    const hook = new T.Mesh(
      cached(geoCache, "hook", () => new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute([0, 1, 0, 1e-3, 1, 0, 0, 1.001, 0], 3))),
      cached(matCache, "hookmat", () => new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false }))
    );
    hook.frustumCulled = false;
    hook.name = "onumc-hook";
    root.add(hook);
    root.add(body); { /* 20261030ah: soft contact shadow so people sit on the rug, not float on it */ const cg = cached(geoCache, "contact", () => new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), cm = cached(matCache, "contactmat", () => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(0,0,0,0.6)"); gr.addColorStop(0.45, "rgba(0,0,0,0.32)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new T.MeshBasicMaterial({ name: "onumc:contact", map: new T.CanvasTexture(c), color: 0, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); }); const cs = new T.Mesh(cg, cm); cs.position.y = 0.006; cs.scale.set(0.78, 1, 0.6); cs.renderOrder = 1; cs.castShadow = false; cs.name = "onumc-contact"; root.add(cs); }
    body.add(rig);
    root.name = "onum-character";
    const meshes = [], faceFine = [], bodyFine = [];
    const add = (parent, geo, mat, x = 0, y = 0, z = 0, list) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      meshes.push(m);
      if (list) list.push(m);
      return m;
    };
    const W = {
      suit_tie: [1, 0, "tie", "trousers"],
      three_piece: [1, 1, "tie", "trousers"],
      suit_open: [1, 0, "open", "trousers"],
      shirt_vest: [0, 1, "tie", "trousers"],
      skirt_suit: [1, 0, "bow", "skirt"],
      trouser_suit: [1, 0, "bow", "trousers"],
      dress_jacket: [1, 0, "necklace", "dress"],
      blouse_skirt: [0, 0, "scarf", "skirt"],
      mil: [1, 0, "tie", "trousers"],
      mil_f: [1, 0, "tie", "trousers"],
      tunic: [1, 0, "mandarin", "trousers"],
      robe: [0, 0, "none", "robe"],
      tribal: [0, 0, "none", "robe_knee"],
      sleek: [1, 0, "open", "trousers"],
      sleek_f: [1, 0, "open", "trousers"]
    }[S.outfit] || [1, 0, "tie", "trousers"];
    const [jacket, vest, neck, bottom] = W;
    const skinM = skinMat(S.skin, q), hairM = hairMat(S.hair, q);
    const suitM = clothMat(S.suit, q), shirtM = clothMat(S.shirt, q, "suit_wool", 4);
    const longB = bottom === "dress" || bottom === "robe" || bottom === "robe_knee";
    const dressM = clothMat(S.dress != null ? S.dress : bottom === "dress" ? hexMix(S.suit, 6953514, 0.4) : S.suit, q);
    const shoeM = leatherMat(fem ? 1709076 : S.seed % 3 ? 1315346 : 3809300, q);
    const hoseM = stdMat("hose" + S.skin, { color: lin(hexMix(S.skin, 2759960, 0.25)), roughness: 0.45 });
    const tieM = clothMat(S.tie, q, "suit_wool", 3);
    const bkey = (fem ? "f" : "m") + Math.round(B * 10) + q;
    const bw = 0.88 + 0.12 * B;
    const gb = (k, fn) => cached(geoCache, bkey + k, fn);
    const tieGeo = () => cached(geoCache, "tie", () => loft([{ y: 0.46, w: 0.012, d: 5e-3 }, { y: 0.43, w: 0.018, d: 5e-3 }, { y: 0.17, w: 0.032, d: 4e-3 }, { y: 0.15, w: 1e-3, d: 3e-3 }], 8));
    const sc = S.height / 1.75;
    body.scale.set(sc * bw, sc, sc * (0.92 + 0.08 * B));
    const hipY = 0.95, legX = fem ? 0.085 : 0.09;
    const hips = new T.Group();
    hips.position.y = hipY;
    rig.add(hips);
    const torso = new T.Group();
    hips.add(torso);
    const heavy = clamp2((B - 1) * 4);
    const tp = fem ? [[-0.09, 0.175, 0.115], [0, 0.172, 0.112], [0.1, 0.132, 0.095], [0.2, 0.14, 0.1], [0.29, 0.155, 0.118, 0.018], [0.36, 0.152, 0.108, 0.01], [0.42, 0.152, 0.096], [0.46, 0.128, 0.084], [0.495, 0.088, 0.066], [0.53, 0.055, 0.055]] : [[-0.09, 0.165, 0.11], [0, 0.163, 0.108], [0.12, 0.14 + 0.022 * heavy, 0.105 + 0.035 * heavy, 0.02 * heavy], [0.25, 0.165 + 0.01 * heavy, 0.115 + 0.02 * heavy, 0.01 * heavy], [0.35, 0.172, 0.118], [0.42, 0.172, 0.108], [0.465, 0.145, 0.092], [0.495, 0.1, 0.072], [0.53, 0.058, 0.058]];
    const ring = (a, k = 1, dk = 0) => ({ y: a[0], w: a[1] * k + dk, d: a[2] * k + dk, z: a[3] || 0 });
    const shoulderY = 0.44, shX = fem ? 0.162 : 0.185;
    add(torso, gb("torso2", () => loft(tp.map((a) => {
      const r = ring(a);
      const pad = sstep2(0.36, 0.43, a[0]) * sstep2(0.5, 0.465, a[0]);
      r.w = Math.max(r.w, mix2(r.w, shX + 0.012 - 0.05 * sstep2(0.44, 0.5, a[0]), pad));
      return r;
    }), seg)), jacket || vest ? shirtM : longB ? dressM : shirtM);
    const neckG = new T.Group();
    neckG.position.set(0, 0.5, -5e-3);
    torso.add(neckG);
    add(neckG, gb("neck", () => limb(-0.1, [0.058, 0.055, 0.052], seg)), cached(matCache, "neckskin" + S.skin + q + MODE, () => { const m = skinM.clone(); m.color.multiplyScalar(0.8); return m; }));
    const head = new T.Group();
    head.position.set(0, 0.07, 0.012);
    neckG.add(head);
    const headPivot = new T.Group();
    headPivot.position.set(0, 0.1, 0);
    head.add(headPivot);
    const shape = headShape(Object.assign({ fem }, S.face));
    const headMat = headSkinMat(S, q);
    add(headPivot, sphereGeo(QQ.head[0], QQ.head[1], shape), headMat);
    const eyeW = stdMat("eyeW", { color: lin(13813951), roughness: 0.06 }), irisM = irisMat(S.eye), pupM = stdMat("pupil", { color: 328965, roughness: 0.1 });
    const lashM = stdMat("lash", { color: 788743, roughness: 0.7 });
    const lids = [], eyes = [], A = S.face.asym;
    for (const sx of [-1, 1]) {
      const ey = 0.11 + (sx < 0 ? A.eyeL : A.eyeR);
      const sp = surf(shape, sx * 0.33, ey, 0.94);
      const c = new T.Vector3(sp.x, sp.y, sp.z - 89e-4);
      const eg = new T.Group();
      eg.position.copy(c);
      headPivot.add(eg);
      eyes.push(eg);
      add(eg, cached(geoCache, "eyeball" + q, () => weld(new T.SphereGeometry(0.0127, 20, 14))), eyeW, 0, 0, 0, faceFine);
      add(eg, cached(geoCache, "iris", () => new T.CircleGeometry(76e-4, 24)), irisM, 0, 0, 0.0122, faceFine);
      add(eg, cached(geoCache, "pupil", () => new T.CircleGeometry(29e-4, 14)), pupM, 0, 0, 0.0125, faceFine);
      for (const up of [1, -1]) {
        const lg = new T.Group();
        lg.position.copy(c);
        lg.rotation.z = -sx * (S.face.tilt + (up > 0 ? 0 : 0.05));
        headPivot.add(lg);
        const lr = new T.Group();
        lg.add(lr);
        add(lr, cached(geoCache, "lid" + up, () => weld(new T.SphereGeometry(0.0136, 24, 10, 0, Math.PI * 2, up > 0 ? 0 : Math.PI * 0.5, Math.PI * 0.5))), lidMat(S), 0, 0, 0, faceFine);
        const lash = add(lr, cached(geoCache, "lash" + up, () => {
          const g = new T.TorusGeometry(0.0137, up > 0 ? 25e-4 : 11e-4, 4, 20, Math.PI * 0.9);
          g.rotateZ(Math.PI * 0.05);
          g.rotateX(Math.PI / 2 * (up > 0 ? -1 : -1));
          return g;
        }), lashM, 0, 0, 0, faceFine);
        if (up > 0) {
          const cr = add(
            lg,
            cached(geoCache, "crease", () => {
              const g = new T.TorusGeometry(0.0144, 8e-4, 4, 16, Math.PI * 0.7);
              g.rotateZ(Math.PI * 0.15);
              return g;
            }),
            stdMat("crease" + S.skin, { color: lin(hexMix(S.skin, 3809304, 0.35)), roughness: 0.7 }),
            0,
            5e-4,
            15e-4,
            faceFine
          );
          cr.rotation.x = -0.35;
        }
        lr.userData.up = up;
        lids.push(lr);
      }
    }
    const browM = hairMat(hexMix(S.hair, 0, 0.55), q);
    const BR = S.face.browShape;
    for (const sx of [-1, 1]) {
      const by = sx < 0 ? A.browL : A.browR;
      const xs = [0.1 + BR.gap, 0.24, 0.38, 0.47 + 0.08 * BR.len];
      const ys = [0.235, 0.27 + 0.03 * BR.arch, 0.275 + 0.035 * BR.arch, 0.235 - 0.03 * BR.tail];
      const pts = xs.map((x, i) => {
        const y = ys[i] + by;
        const p = surf(shape, sx * x, y, Math.sqrt(Math.max(0.05, 1 - x * x - y * y)));
        return p.add(p.clone().normalize().multiplyScalar(12e-4));
      });
      const curve = new T.CatmullRomCurve3(pts), tub = 14, rad = 6, base = (fem ? 47e-4 : 64e-4) * BR.thick;
      const tg = new T.TubeGeometry(curve, tub, base, rad);
      const P = tg.attributes.position;
      for (let i = 0; i <= tub; i++) {
        const cp = curve.getPointAt(i / tub), tt = i / tub, k = mix2(1, 0.3, Math.pow(tt, 1.6)) * (tt < 0.08 ? 0.8 : 1);
        for (let j = 0; j <= rad; j++) {
          const vi = i * (rad + 1) + j;
          const ox = P.getX(vi) - cp.x, oy = P.getY(vi) - cp.y, oz = P.getZ(vi) - cp.z;
          P.setXYZ(vi, cp.x + ox * k, cp.y + oy * k * 1.15, cp.z + oz * k * 0.45);
        }
      }
      weld(tg);
      const m = add(headPivot, tg, browM, 0, 0, 0, faceFine);
      m.userData.browSide = sx;
    }
    const lipCol = hexMix(S.skin, fem ? 10501704 : 9326152, fem ? 0.5 : 0.4);
    const lipM = stdMat("lip2" + lipCol + MODE, { color: linSkin(lipCol), roughness: 0.38 });
    const mp = surf(shape, 0, -0.47, 0.88);
    const mouthIn = add(headPivot, cached(geoCache, "mouthIn", () => new T.SphereGeometry(1, 16, 10)), stdMat("mouthIn", { color: 1705991, roughness: 0.9 }), mp.x, mp.y - 25e-4, mp.z - 7e-3, faceFine);
    mouthIn.scale.set(0.021, 24e-4, 6e-3);
    const teeth = add(headPivot, cached(geoCache, "teeth", () => new T.BoxGeometry(0.026, 6e-3, 0.01)), stdMat("teeth", { color: lin(14735818), roughness: 0.3 }), mp.x, mp.y + 5e-4, mp.z - 95e-4, faceFine);
    const lipU = add(headPivot, cached(geoCache, "lipU" + q, () => lipGeo(true)), lipM, mp.x, mp.y + 36e-4, mp.z - 48e-4, faceFine);
    lipU.scale.set(0.0225 * S.face.mouthW, 58e-4 * S.face.lip, 88e-4);
    lipU.rotation.z = A.mouth;
    const lipL = add(headPivot, cached(geoCache, "lipL" + q, () => lipGeo(false)), lipM, mp.x, mp.y - 42e-4, mp.z - 54e-4, faceFine);
    lipL.scale.set(0.0205 * S.face.mouthW, 72e-4 * S.face.lip, 96e-4);
    lipL.rotation.z = A.mouth;
    for (const sx of [-1, 1]) {
      const p = surf(shape, sx * 0.085 + A.nose, -0.265, 0.95);
      const m = add(headPivot, mouthIn.geometry, stdMat("nostril", { color: 2757648, roughness: 1 }), p.x, p.y + 2e-3, p.z - 8e-3, faceFine);
      m.scale.set(35e-4, 18e-4, 45e-4);
      m.rotation.y = sx * 0.4;
    }
    const earG = cached(geoCache, "ear", () => {
      const g = new T.TorusGeometry(0.016, 58e-4, 8, 18, Math.PI * 1.55);
      g.rotateZ(-Math.PI * 0.28);
      return weld(g);
    });
    const earB = cached(geoCache, "earb", () => weld(new T.SphereGeometry(1, 14, 10)));
    const earM = earMat(S);
    for (const sx of [-1, 1]) {
      const p = surf(shape, sx, -0.02, -0.08);
      const eg = new T.Group();
      eg.position.set(p.x + sx * 2e-3, p.y, p.z);
      eg.rotation.y = sx * 1.35;
      headPivot.add(eg);
      const e1 = add(eg, earG, earM);
      e1.scale.set(0.9, 1.25 * S.face.ear, 1);
      const e2 = add(eg, earB, earM, -2e-3 * sx, -1e-3, -4e-3);
      e2.scale.set(0.015, 0.026 * S.face.ear, 6e-3);
    }
    let hairShell = null;
    if (S.style !== "bald") {
      const shortCut = S.style === "buzz" || S.style === "caesar" || S.style === "bald_fringe";
      const hk = (nx, ny, nz, m, t) => (shortCut ? 0.003 : 0.011) * m * Math.sin(nx * 23 + ny * 17) * Math.sin(nz * 19 - ny * 29) + 1 + 6e-3 + t * 1.6 * sstep2(0, 0.6, m) + (shortCut ? 6e-3 : 0.024) * sstep2(0.2, 0.85, ny) * sstep2(-0.7, 0.3, nz) * sstep2(0.2, 0.7, m);
      const hs = sphereGeo(QQ.head[0] + 8, QQ.head[1] + 8, (nx, ny, nz, o) => {
        shape(nx, ny, nz, o);
        const { m, t } = hairMask(S.style, nx, ny, nz, fem);
        const k = m > 1e-3 ? hk(nx, ny, nz, m, t) : 0.95;
        o[0] *= k;
        o[1] *= k;
        o[2] *= k;
        return o;
      });
      hairShell = add(headPivot, hs, hairShellMat(S, q));
      if (q !== "low") {
        const fz = sphereGeo(QQ.head[0] + 8, QQ.head[1] + 8, (nx, ny, nz, o) => {
          shape(nx, ny, nz, o);
          const { m, t } = hairMask(S.style, nx, ny, nz, fem);
          const k = m > 1e-3 ? hk(nx, ny, nz, m, t) + (shortCut ? 4e-3 : 9e-3) : 0.95;
          o[0] *= k;
          o[1] *= k;
          o[2] *= k;
          return o;
        });
        add(headPivot, fz, hairFuzzMat(S, q), 0, 0, 0, faceFine);
      }
    // 20261030ab: strand cards over the shell (every quality: this is what reads at room distance)
    if (S.style !== 'buzz' && S.style !== 'bald_fringe') {
      const cardG = cached(geoCache, 'hcard', () => new T.PlaneGeometry(1, 1).translate(0, -0.45, 0)), cm = hairCardMat(S);
      let sd = 7 + ((S.hair * 31 + S.skin) % 100000); const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const Z = new T.Vector3(0, 0, 1), n = new T.Vector3(), o = [0, 0, 0], N = S.style === 'caesar' ? 36 : q === 'low' ? 56 : 84;
      for (let i = 0, tries = 0; i < N && tries < N * 6; tries++) {
        let nx = rr() * 2 - 1, ny = -0.15 + rr() * 1.15, nz = rr() * 2 - 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
        const { m, t } = hairMask(S.style, nx, ny, nz, fem); if (m < 0.7) continue; i++;
        shape(nx, ny, nz, o); const k = hk(nx, ny, nz, m, t) + 0.002;
        const c = add(headPivot, cardG, cm, o[0] * k, o[1] * k, o[2] * k); c.castShadow = false;
        n.set(o[0], o[1], o[2]).normalize(); c.quaternion.setFromUnitVectors(Z, n);
        const L = ((S.style === 'caesar' ? 0.022 : 0.034) + rr() * 0.028) * (ny > 0.72 ? 0.45 : 1);   /* 20261030ad: short at the crown, no spikes */
        c.rotateZ(Math.atan2(nx, ny) * 0.0 + (rr() - 0.5) * 0.7 + (nz < 0 ? Math.PI : 0) * 0); c.rotateX(-0.06 - rr() * 0.12);   /* 20261030ac: lie flat with the comb, no frizz */
        c.scale.set(0.032 + rr() * 0.024, L, 1);
      }
    }
    if (S.style === 'bun') {
        const b = add(headPivot, earB, hairM, 0, 0.06, -0.1);
        b.scale.set(0.038, 0.034, 0.034);
      }
      if (S.style === "long") {
        const lg = gb("longhair", () => loft([{ y: 0, w: 0.085, d: 0.03 }, { y: -0.08, w: 0.095, d: 0.03 }, { y: -0.2, w: 0.1, d: 0.025 }, { y: -0.25, w: 0.085, d: 0.015 }], seg));
        add(headPivot, lg, hairM, 0, -0.04, -0.07).rotation.x = 0.1;
      }
    }
    const bd = S.beard;
    if (bd === "short" || bd === "full") {
      const full = bd === "full";
      const bs = sphereGeo(QQ.head[0], QQ.head[1], (nx, ny, nz, o) => {
        shape(nx, ny, nz, o);
        const ax = Math.abs(nx);
        let m = sstep2(-0.12, -0.32, ny) * sstep2(-0.35, 0.1, nz) * sstep2(0.98, 0.75, ax);
        m = Math.max(m, sstep2(-0.3, -0.36, ny) * sstep2(0.05, 0.12, ax) * sstep2(0.2, 0.6, nz));
        m *= 1 - G2(nx * 1.1, (ny + 0.47) * 2.2, 0.22) * 0.97 * sstep2(0.4, 0.8, nz);
        if (!full) m *= sstep2(-0.42, -0.6, ny) + G2(nx, ny + 0.37, 0.18);
        const k = m > 0.05 ? 1 + (full ? 0.05 : 0.03) * m : 0.9;
        o[0] *= k;
        o[1] *= k;
        o[2] *= k;
        return o;
      });
      add(headPivot, bs, hairM, 0, 0, 5e-4);
    }
    if (bd === "moustache" || bd === "kaiser") {
      const kai = bd === "kaiser";
      for (const sx of [-1, 1]) {
        const raw = kai ? [[0.015, -0.33, 0], [0.12, -0.355, 2e-3], [0.26, -0.39, 4e-3], [0.4, -0.36, 0.012], [0.5, -0.24, 0.022], [0.53, -0.1, 0.03], [0.52, 0, 0.034]] : [[0.015, -0.33, 0], [0.12, -0.35, 1e-3], [0.24, -0.39, 2e-3], [0.3, -0.44, 2e-3]];
        const pts = raw.map(([x, y, out]) => {
          const p = surf(shape, sx * Math.min(x, 0.45), y, Math.sqrt(Math.max(0.1, 1 - Math.min(x, 0.45) ** 2 - y * y)));
          if (x > 0.45) p.x += sx * (x - 0.45) * 0.07;
          return p.add(new T.Vector3(sx * out * 0.2, 0, 3e-3 + out));
        });
        const curve = new T.CatmullRomCurve3(pts), tub = kai ? 28 : 12, rad = 7, base = kai ? 58e-4 : 4e-3;
        const tg = new T.TubeGeometry(curve, tub, base, rad);
        const P = tg.attributes.position;
        for (let i = 0; i <= tub; i++) {
          const cp = curve.getPointAt(i / tub), tt = i / tub;
          const k = kai ? mix2(0.75, 1, sstep2(0, 0.25, tt)) * mix2(1, 0.12, sstep2(0.25, 1, tt)) : mix2(1, 0.45, tt);
          for (let j = 0; j <= rad; j++) {
            const vi = i * (rad + 1) + j;
            P.setXYZ(vi, cp.x + (P.getX(vi) - cp.x) * k, cp.y + (P.getY(vi) - cp.y) * k * 0.8, cp.z + (P.getZ(vi) - cp.z) * k);
          }
        }
        weld(tg);
        add(headPivot, tg, hairM, 0, 0, 0, faceFine);
      }
    }
    if (S.glasses) {
      const gm = stdMat("frame", { color: 1381653, roughness: 0.3, metalness: 0.4 }), lens = stdMat("lens", { color: 16777215, roughness: 0.05, transparent: true, opacity: 0.12 });
      for (const sx of [-1, 1]) {
        const p2 = surf(shape, sx * 0.33, 0.1, 0.94);
        const rg = add(headPivot, cached(geoCache, "gl", () => new T.TorusGeometry(0.019, 13e-4, 6, 24)), gm, p2.x, p2.y, p2.z + 0.012, faceFine);
        rg.scale.set(1.15, 0.85, 1);
        const ln = add(headPivot, cached(geoCache, "lens", () => new T.CircleGeometry(0.019, 20)), lens, p2.x, p2.y, p2.z + 0.012, faceFine);
        ln.scale.set(1.15, 0.85, 1);
        const arm = add(headPivot, cached(geoCache, "glarm", () => new T.BoxGeometry(18e-4, 18e-4, 0.1)), gm, surf(shape, sx, 0.1, 0.1).x + sx * 4e-3, p2.y, p2.z - 0.045, faceFine);
      }
      const p = surf(shape, 0, 0.12, 1);
      add(headPivot, cached(geoCache, "bridge", () => new T.BoxGeometry(0.016, 18e-4, 18e-4)), gm, 0, p.y, p.z + 8e-3, faceFine);
    }
    let skirt = null;
    const jlen = bottom === "dress" ? -0.06 : -0.17;
    if (jacket) {
      const jp = tp.filter((a) => a[0] <= 0.51).map((a) => {
        const r = ring(a, 1.06, 0.012);
        const pad = sstep2(0.36, 0.43, a[0]) * sstep2(0.5, 0.465, a[0]);
        r.w = Math.max(r.w, mix2(r.w, shX + (fem ? 0.022 : 0.03) - 0.05 * sstep2(0.44, 0.5, a[0]), pad));
        return r;
      });
      jp.push({ y: 0.535, w: 0.072, d: 0.066 });
      jp.unshift({ y: jlen, w: tp[0][1] * 1.08 + 0.014, d: tp[0][2] * 1.06 + 0.012 });
      add(torso, gb("jacket" + jlen, () => loft(jp, seg)), suitM);
      const vz = (y) => {
        let a = tp[0];
        for (const t of tp) if (t[0] <= y) a = t;
        return a[2] * 1.06 + 0.012 + (a[3] || 0);
      };
      const vtop = 0.465, vbot = fem ? 0.2 : 0.17;
      const vMat = neck === "necklace" || fem && neck !== "bow" ? skinM : shirtM;
      const closed = neck === "mandarin";
      const plast = closed ? null : gb("plast" + vbot, () => loft([{ y: vbot, w: 4e-3, d: 4e-3 }, { y: (vbot + vtop) / 2, w: 0.04, d: 8e-3 }, { y: vtop, w: 0.05, d: 8e-3 }, { y: vtop + 0.03, w: 0.06, d: 0.02, z: -0.02 }], seg, 2));
      const pl = closed ? { userData: {} } : add(torso, plast, vMat, 0, 0, vz(0.35) - 0.012);
      if (!closed) for (const sx of [-1, 1]) {
        const lp = add(torso, cached(geoCache, "lapel", () => new T.BoxGeometry(0.022, 0.24, 6e-3)), suitM, sx * 0.04, (vbot + vtop) / 2 + 0.02, vz(0.33) + 0);
        lp.rotation.z = sx * 0.2;
        lp.rotation.x = -0.1;
      }
      for (const by of closed ? [0.06, 0.14, 0.22, 0.3, 0.38, 0.46] : [0.06, 0.13]) if (by < vbot || closed) add(torso, cached(geoCache, "btn", () => new T.CylinderGeometry(8e-3, 8e-3, 4e-3, 10).rotateX(Math.PI / 2)), stdMat("btn", { color: 1118481, roughness: 0.3 }), 0, by, vz(by) + 3e-3, bodyFine);
      if (neck === "tie") {
        add(torso, tieGeo(), tieM, 0, 0, vz(0.3) + 2e-3);
      }
      if (neck === "bow" || neck === "scarf") {
        const b = add(torso, earB, tieM, 0, 0.455, vz(0.42) + 4e-3);
        b.scale.set(0.035, 0.015, 0.012);
      }
      if (neck === "necklace") {
        const n = add(torso, cached(geoCache, "neckl", () => new T.TorusGeometry(0.07, 3e-3, 6, 30, Math.PI)), stdMat("pearl", { color: lin(15789280), roughness: 0.15 }), 0, 0.47, 0.03, bodyFine);
        n.rotation.set(1.7, 0, Math.PI);
      }
      pl.userData.v = 1;
    } else {
      if (vest) {
        const vp = tp.filter((a) => a[0] <= 0.42).map((a) => ring(a, 1.03, 6e-3));
        add(torso, gb("vest", () => loft(vp, seg)), suitM);
      }
      if (neck === "tie") add(torso, tieGeo(), tieM, 0, 0, 0.125);
      if (neck === "scarf") {
        const b = add(torso, cached(geoCache, "scarf", () => new T.TorusGeometry(0.06, 0.016, 8, 20)), tieM, 0, 0.47, 0.01);
        b.rotation.x = 1.4;
      }
    }
    const col = add(torso, cached(geoCache, "collar", () => new T.TorusGeometry(0.06, 0.012, 10, 32)), shirtM, 0, 0.514, 0);
    col.rotation.x = Math.PI / 2 - 0.25;
    if (bottom !== "trousers") {
      const rings = [{ y: 0.02, w: tp[0][1] * 1.02, d: tp[0][2] * 1.02 }];
      const slen = bottom === "robe" ? 0.88 : 0.54, flare = bottom === "robe" ? 0.04 : 0;
      for (let k = 1; k <= 8; k++) {
        const t = k / 8;
        rings.push({ y: 0.02 - slen * t, w: mix2(0.185, 0.178, t) + 0.012 * Math.sin(t * Math.PI) + flare * t, d: mix2(0.128, 0.122, t) + 0.01 * Math.sin(t * Math.PI) + flare * t });
      }
      const sk = gb("skirtsrc" + bottom, () => loft(rings, seg)).clone();
      skirt = add(hips, sk, longB ? dressM : suitM);
      skirt.userData.rest = Float32Array.from(sk.attributes.position.array);
      skirt.frustumCulled = false;
    }
    const sleeve = jacket ? suitM : shirtM, arms = [];
    for (const sx of [-1, 1]) {
      const sh = new T.Group();
      sh.position.set(sx * shX, shoulderY, -5e-3);
      torso.add(sh);
      add(sh, gb("shoulderBall", () => weld(new T.SphereGeometry(0.058, 16, 12))), sleeve, -sx * 0.01, -0.02, 0).scale.set(0.9, 0.7, 1);
      add(sh, gb("upArm", () => limb(0.3, [0.057, 0.052, 0.046, 0.042], seg)), sleeve);
      const el = new T.Group();
      el.position.y = -0.3;
      sh.add(el);
      add(el, gb("elbowBall", () => weld(new T.SphereGeometry(0.042, 12, 10))), sleeve);
      add(el, gb("foreArm", () => limb(0.25, [0.042, 0.04, 0.034], seg)), sleeve);
      const cuff = add(el, cached(geoCache, "cuff", () => new T.CylinderGeometry(0.031, 0.031, 0.02, 14)), shirtM, 0, -0.245, 0);
      const wr = new T.Group();
      wr.position.y = -0.255;
      el.add(wr);
      const palm = add(wr, gb("palm", () => loft([{ y: 0.01, w: 0.022, d: 0.016 }, { y: -0.03, w: 0.04, d: 0.016 }, { y: -0.085, w: 0.042, d: 0.013 }, { y: -0.095, w: 0.035, d: 0.011 }], 12, 2.6)), skinM);
      palm.rotation.y = sx * Math.PI / 2;
      const fingers = [];
      if (QQ.fingers) {
        const fg = cached(geoCache, "finger", () => limb(0.075, [85e-4, 8e-3, 7e-3, 6e-3], 8));
        for (let k = 0; k < 4; k++) {
          const f = new T.Group();
          f.position.set(0, -0.09, (k - 1.5) * 0.019);
          f.rotation.y = 0;
          wr.add(f);
          const m = add(f, fg, skinM, 0, 0, 0, faceFine);
          m.scale.set(1.28, [0.9, 1, 0.97, 0.78][k] * 1.08, 1.28);   /* 20261030ah: thicker fingers read as fingers, not nubs */
          f.rotation.z = -sx * 0.12;
          fingers.push(f);
        }
        const th = new T.Group();
        th.position.set(sx * -0, -0.03, 0.03);
        th.rotation.set(-0.6, 0, -sx * 0.3);
        wr.add(th);
        add(th, fg, skinM, 0, 0, 0, faceFine).scale.set(1.15, 0.75, 1.15);
        fingers.push(th);
      }
      sh.rotation.z = sx * 0.1;
      el.rotation.x = -0.12;
      arms.push({ sh, el, wr, fingers, sx });
    }
    const legs = [], legM = bottom === "trousers" ? suitM : hoseM;
    for (const sx of [-1, 1]) {
      const hp = new T.Group();
      hp.position.set(sx * legX, -0.03, 0);
      hips.add(hp);
      add(hp, gb("thigh" + bottom, () => limb(0.45, bottom === "trousers" ? [0.085, 0.08, 0.068, 0.058] : [0.075, 0.068, 0.055, 0.045], seg)), legM);
      const kn = new T.Group();
      kn.position.y = -0.45;
      hp.add(kn);
      add(kn, gb("knee" + bottom, () => weld(new T.SphereGeometry(bottom === "trousers" ? 0.056 : 0.045, 12, 10))), legM);
      add(kn, gb("shin" + bottom, () => limb(0.43, bottom === "trousers" ? [0.056, 0.054, 0.05, 0.052] : [0.045, 0.05, 0.036, 0.03], seg)), legM);
      const an = new T.Group();
      an.position.y = -0.43;
      kn.add(an);
      const shoe = add(an, gb("shoe" + (fem ? "f" : "m"), () => fem ? loft([{ y: -0.02, w: 0.03, d: 0.028, z: -0.01 }, { y: -0.05, w: 0.036, d: 0.11, z: 0.035 }, { y: -0.062, w: 0.036, d: 0.115, z: 0.035 }], 14, 3) : loft([{ y: 0, w: 0.04, d: 0.05, z: 0 }, { y: -0.045, w: 0.05, d: 0.135, z: 0.045 }, { y: -0.075, w: 0.052, d: 0.14, z: 0.045 }], 16, 3.2)), shoeM);
      if (fem) add(an, cached(geoCache, "heel", () => new T.BoxGeometry(0.014, 0.05, 0.014)), shoeM, 0, -0.06, -0.06);
      legs.push({ hp, kn, an, sx });
    }
    if (fem) hips.position.y += 0.012;
    const frontZ = (y) => {
      let a = tp[0];
      for (const t of tp) if (t[0] <= y) a = t;
      return a[2] * (jacket ? 1.06 : 1) + (jacket ? 0.012 : vest ? 6e-3 : 0) + (a[3] || 0);
    };
    const U = S.uniform, solid = (hex, rough = 0.5, metal = 0) => stdMat("u" + hex + "|" + rough + "|" + metal, { color: lin(hex), roughness: rough, metalness: metal });
    const goldM = solid(13936202, 0.3, 1);
    if (U) {
      const accM = clothMat(U.accent, q, "suit_wool", 3), trimM = U.trim === 13936202 ? goldM : solid(U.trim, 0.35, 0.5);
      const sash = (col2, tube = 0.014) => {
        const m = add(torso, cached(geoCache, "sash" + tube, () => new T.TorusGeometry(0.205, tube, 4, 48).rotateX(Math.PI / 2)), col2, 0, 0.27, 0);
        m.scale.set(1, 1, 0.68);
        m.rotation.z = 0.62;
        return m;
      };
      const medals = (n) => {
        for (let k = 0; k < n; k++) {
          const x = 0.065 + k % 3 * 0.022, y = 0.345 - Math.floor(k / 3) * 0.05;
          add(torso, cached(geoCache, "ribbon", () => new T.BoxGeometry(0.016, 0.014, 3e-3)), solid([U.accent, U.trim, U.dark][k % 3], 0.6), x, y + 0.014, frontZ(y) + 4e-3, bodyFine);
          add(torso, cached(geoCache, "medal", () => new T.CylinderGeometry(75e-4, 75e-4, 25e-4, 14).rotateX(Math.PI / 2)), goldM, x, y - 2e-3, frontZ(y) + 5e-3, bodyFine);
        }
      };
      const epaulettes = (fringe) => {
        for (const sx of [-1, 1]) {
          const e = add(torso, cached(geoCache, "epau", () => new T.BoxGeometry(0.075, 0.012, 0.06)), trimM, sx * (shX - 5e-3), 0.488, -5e-3);
          e.rotation.z = -sx * 0.18;
          if (fringe) {
            const f = add(torso, cached(geoCache, "fringe", () => new T.CylinderGeometry(0.036, 0.034, 0.03, 12, 1, true)), trimM, sx * (shX + 0.03), 0.465, -5e-3);
            f.scale.set(0.35, 1, 1);
          }
        }
      };
      const belt = () => {
        const b = add(torso, cached(geoCache, "belt", () => new T.TorusGeometry(0.19, 0.013, 4, 40).rotateX(Math.PI / 2)), solid(1709072, 0.4), 0, 0.03, 0);
        b.scale.set(1, 1, 0.66);
        add(torso, cached(geoCache, "buckle", () => new T.BoxGeometry(0.03, 0.024, 6e-3)), goldM, 0, 0.03, frontZ(0.03) + 0.01);
      };
      const capMat = U.style === "military" ? clothMat(U.main, q) : accM;
      if (U.style === "court") {
        sash(accM);
        medals(fem ? 3 : 5);
      }
      if (U.style === "military") {
        epaulettes(true);
        medals(4);
        belt();
        add(headPivot, cached(geoCache, "capcrown", () => new T.CylinderGeometry(0.104, 0.086, 0.06, 28)), capMat, 0, 0.095, -4e-3);
        add(headPivot, cached(geoCache, "capband", () => new T.CylinderGeometry(0.0875, 0.0875, 0.018, 28)), accM, 0, 0.07, -4e-3);
        const v = add(headPivot, cached(geoCache, "visor", () => new T.CircleGeometry(0.088, 20, 0, Math.PI).rotateX(-Math.PI / 2)), solid(855311, 0.15), 0, 0.063, 0);
        v.scale.set(1, 1, 0.75);
        v.rotation.x = 0.18;
        add(headPivot, cached(geoCache, "capbadge", () => new T.CylinderGeometry(0.011, 0.011, 4e-3, 12).rotateX(Math.PI / 2)), goldM, 0, 0.09, 0.098);
      }
      if (U.style === "tunic") {
        belt();
        add(torso, cached(geoCache, "mandarin", () => new T.CylinderGeometry(0.064, 0.066, 0.04, 24, 1, true)), suitM, 0, 0.515, 0);
        const starG = cached(geoCache, "starshape", () => {
          const s = new T.Shape();
          for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 38e-4 : 95e-4;
            i ? s.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, -Math.sin(a) * r);
          }
          return new T.ShapeGeometry(s);
        });
        for (const sx of [-1, 1]) {
          const st2 = add(torso, starG, solid(U.accent === U.main ? 13936202 : U.accent, 0.4, 0.3), sx * 0.048, 0.515, 0.045, faceFine);
          st2.rotation.y = sx * 0.75;
        }
        for (const sx of [-1, 1]) add(torso, cached(geoCache, "pocket", () => new T.BoxGeometry(0.06, 0.012, 4e-3)), suitM, sx * 0.08, 0.37, frontZ(0.37) + 3e-3);
        add(headPivot, cached(geoCache, "softcap", () => new T.CylinderGeometry(0.095, 0.088, 0.05, 24)), accM === suitM ? suitM : clothMat(U.main, q), 0, 0.09, -4e-3);
      }
      if (U.style === "robe") {
        for (const sx of [-1, 1]) {
          const st2 = add(torso, cached(geoCache, "stole", () => new T.BoxGeometry(0.045, 1.25, 6e-3)), accM, sx * 0.055, -0.15, 0.142);
          st2.rotation.z = -sx * 0.03;
          st2.rotation.x = -0.02;
        }
        const sc2 = add(torso, cached(geoCache, "stolecol", () => new T.TorusGeometry(0.075, 0.016, 6, 24)), accM, 0, 0.5, 0.01);
        sc2.rotation.x = 1.35;
        const cap = add(headPivot, cached(geoCache, "skullcap", () => weld(new T.SphereGeometry(0.09, 20, 8, 0, Math.PI * 2, 0, 0.9))), accM, 0, 0.035, -0.01);
        cap.scale.set(1, 0.9, 1.05);
        const cr = add(torso, cached(geoCache, "pect", () => new T.BoxGeometry(0.012, 0.06, 4e-3)), goldM, 0, 0.3, frontZ(0.3) + 0.014, bodyFine);
        add(torso, cached(geoCache, "pectb", () => new T.BoxGeometry(0.04, 0.012, 4e-3)), goldM, 0, 0.31, frontZ(0.3) + 0.015, bodyFine);
      }
      if (U.style === "sleek") {
        for (const sx of [-1, 1]) add(torso, cached(geoCache, "piping", () => new T.BoxGeometry(5e-3, 0.5, 4e-3)), solid(U.accent, 0.3, 0.2), sx * 0.075, 0.18, frontZ(0.18) + 6e-3);
      }
      if (U.style === "tribal") {
        sash(accM, 0.03);
        const bd2 = add(torso, cached(geoCache, "beads", () => new T.TorusGeometry(0.085, 9e-3, 6, 18)), trimM, 0, 0.49, 0.02);
        bd2.rotation.x = 1.3;
        const hb = add(headPivot, cached(geoCache, "headband", () => new T.TorusGeometry(0.085, 8e-3, 6, 32)), accM, 0, 0.055, -4e-3);
        hb.rotation.x = Math.PI / 2;
        hb.scale.set(1, 1.18, 1);
      }
      if (U.style === "consular") {
        epaulettes(false);
        sash(solid(15984324, 0.6), 0.011);
        const bt = add(torso, cached(geoCache, "badge", () => new T.CircleGeometry(0.03, 24)), badgeMat(U), 0.085, 0.35, frontZ(0.35) + 8e-3, faceFine);
        bt.rotation.y = 0.18;
      }
      if (U.style === "civic" && U.flag) addPin(U.flag);
    } else if (opts.homeFlag) addPin(opts.homeFlag);
    function addPin(src) {
      const tex = pinTexture(src), lapel = !!jacket && neck !== "mandarin";
      const g = new T.Group();
      if (lapel) {
        const y = 0.39;
        g.position.set(0.055, y, frontZ(y) + 8e-3);
        g.rotation.set(-0.12, 0.25, 0.2);
      } else {
        const y = fem ? 0.37 : 0.36;
        g.position.set(0.075, y, frontZ(y) + (fem ? 0.012 : 4e-3));
        g.rotation.set(-0.15, 0.3, 0);
      }
      torso.add(g);
      add(g, cached(geoCache, "pinback", () => new T.BoxGeometry(0.034, 0.022, 3e-3)), goldM, 0, 0, -5e-4, faceFine);
      add(g, cached(geoCache, "pinface", () => new T.PlaneGeometry(0.03, 0.0185)), pinMat(tex), 0, 0, 12e-4, faceFine);
      root.userData.pin = g;
    }
    const proxy = buildProxy(S, bottom, jacket, false), proxySit = buildProxy(S, bottom, jacket, true);
    body.add(proxy);
    body.add(proxySit);
    proxy.visible = proxySit.visible = false;
    const rr = mulberry323(S.blinkSeed);
    const st = { sit: 0, sitSide: 0, t: S.phase, walk: 0, ph: 0, blink: 0, nextBlink: 1 + rr() * 3, jaw: 0, gest: 0, lod: -1, browUp: 0, lookYaw: 0, lookPitch: 0, talkT: 0 };
    const browMeshes = [];
    headPivot.children.forEach((c) => {
      if (c.userData.browSide) browMeshes.push(c);
    });
    const v3 = new T.Vector3();
    const skirtSnap = { a: 1e9, b: 1e9 };
    function skinSkirt() {
      const aL = legs[0].hp.rotation.x, aR = legs[1].hp.rotation.x;
      if (Math.abs(aL - skirtSnap.a) < 1e-3 && Math.abs(aR - skirtSnap.b) < 1e-3) return;
      skirtSnap.a = aL;
      skirtSnap.b = aR;
      const P = skirt.geometry.attributes.position, R0 = skirt.userData.rest, py = -0.03;
      const cL = Math.cos(aL), sL = Math.sin(aL), cR = Math.cos(aR), sR = Math.sin(aR), sitk = st.sit;
      for (let i = 0; i < P.count; i++) {
        const x = R0[i * 3], y = R0[i * 3 + 1], z = R0[i * 3 + 2];
        const wd = sstep2(0, -0.16, y), wl = sstep2(0.07, -0.07, x), wr = 1 - wl, yy = y - py;
        const back = z < 0 ? sitk * sstep2(0, -0.08, z) * 0.85 : 0, w = wd * (1 - back);
        const yl = yy * cL - z * sL, zl = yy * sL + z * cL, yr = yy * cR - z * sR, zr = yy * sR + z * cR;
        let ny = mix2(yy, wl * yl + wr * yr, w) + py, nz = mix2(z, wl * zl + wr * zr, w);
        if (back > 0) {
          ny = Math.max(ny, py - 0.1);
        }
        P.setXYZ(i, x * (1 + 0.06 * sitk * wd), ny, nz);
      }
      P.needsUpdate = true;
      skirt.geometry.computeVertexNormals();
    }
    function setLod(l) {
      if (l === st.lod) return;
      st.lod = l;
      rig.visible = l < 3;
      proxy.visible = l >= 3 && st.sit < 0.5;
      proxySit.visible = l >= 3 && st.sit >= 0.5;
      for (const m of faceFine) m.visible = l <= 1 || l === 2 && m.material === hairM;
      for (const m of bodyFine) m.visible = l === 0;
    }
    function update(dt, state = {}) {
      var _a;
      dt = Math.min(dt || 0, 0.1);
      st.t += dt;
      let d = state.camDist;
      const cam = state.camera, viewCam = cam && cam.isPerspectiveCamera && !(cam.fov === 90 && cam.aspect === 1);
      if (d == null && viewCam) {
        root.getWorldPosition(v3);
        cam.getWorldPosition(st.cw || (st.cw = new T.Vector3()));
        d = v3.distanceTo(st.cw);
      }
      if (d == null && cam && !viewCam && st.lod >= 0) d = st.lastD;
      if (d != null) st.lastD = d;
      const lodD = opts.lodDistances || [3.5, 10, 30];
      const hy = (i) => lodD[i] * (st.lod > i ? 0.92 : 1);
      setLod(state.lod != null ? state.lod : d == null ? st.lod < 0 ? 0 : st.lod : d < hy(0) ? 0 : d < hy(1) ? 1 : d < hy(2) ? 2 : 3);
      const sitT = state.sitting ? 1 : 0;
      st.sit += (sitT - st.sit) * Math.min(1, dt * 2.6);
      if (st.lod >= 3) {
        const sp = st.sit >= 0.5;
        if (proxySit.visible !== sp) {
          proxySit.visible = sp;
          proxy.visible = !sp;
        }
        return;
      }
      const sit = st.sit, seatH = (_a = state.seatHeight) != null ? _a : 0.46, desk = state.desk ? 1 : 0;
      const speed = sit > 0.5 ? 0 : state.speed != null ? state.speed : state.moving ? 1.35 : 0;
      st.walk += (clamp2(speed / 1.35, 0, 1.6) - st.walk) * Math.min(1, dt * 6);
      const vel = state.velocity, planted = vel != null && sit < 0.5;
      if (planted) {
        if (!st.sc) {
          const s3 = new T.Vector3();
          root.updateMatrixWorld(true);
          rig.getWorldScale(s3);
          st.sc = s3.z || 1;
        }
        const turn = Math.abs(state.turn || 0), pivot = vel < 0.12 ? clamp2((turn - 0.5) / 1.2) : 0;
        st.pivot = (st.pivot || 0) + (pivot - (st.pivot || 0)) * Math.min(1, dt * 6);
        const vEff = Math.max(vel, 0.32 * st.pivot), vL = Math.max(0, vEff) / st.sc, stepL = (0.4 + 0.22 * Math.min(1.6, Math.max(0, vEff))) / st.sc;
        st.SL = 2 * stepL;
        st.sweep = vEff > 1e-3 ? clamp2(Math.max(0, vel) / vEff) : 1;
        if (vL > 0.02) st.ph += dt * vL / st.SL * Math.PI * 2;
      } else st.ph += dt * (speed > 0.05 ? speed / 1.25 * Math.PI * 2 * 0.5 : 0);
      const w = Math.min(1, st.walk), ph = st.ph, t = st.t;
      const breath = Math.sin(t * 1.5); const pz = S.phase || 0, PV1 = Math.sin(pz * 1.7), PV2 = Math.sin(pz * 2.3 + 1), PV3 = Math.sin(pz * 3.1 + 2), PV4 = Math.sin(pz * 0.7 + 3), iw = 1 - w;   /* 20261030ah: per-person stance */
      const gT = state.gesture === true ? 1 : typeof state.gesture === "number" ? state.gesture : state.gesture ? 1 : state.talking ? 0.35 + 0.35 * Math.max(0, Math.sin(t * 0.7)) : 0;
      st.gest += (gT * (1 - w * 0.7) - st.gest) * Math.min(1, dt * 3);
      const gs = st.gest;
      hips.position.y = hipY + (fem ? 0.012 : 0) - w * 0.012 + Math.abs(Math.cos(ph)) * 0.022 * w;
      hips.position.x = (1 - w) * Math.sin(t * 0.35) * 0.012;
      hips.rotation.y = Math.sin(ph) * 0.09 * w;
      hips.rotation.z = (1 - w) * Math.sin(t * 0.35) * 0.02;
      torso.rotation.y = -Math.sin(ph) * 0.13 * w;
      torso.rotation.x = 0.04 * w + breath * 8e-3;
      torso.scale.set(1 + breath * 6e-3, 1, 1 + breath * 0.01); hips.position.x += iw * 0.024 * PV1; hips.rotation.z += iw * 0.045 * PV1; torso.rotation.z = -iw * 0.035 * PV1; torso.rotation.x += iw * 0.05 * PV2; torso.scale.x *= 1 + 0.05 * PV3;   /* 20261030ah: weight shift, slouch, chest width */
      if (planted) {
        const duty = 0.62, SLf = duty * (st.SL || 1), A2 = 0.45, Bn = 0.43, yA = 0.04 + (fem ? 0.012 : 0), hipJ = hips.position.y - 0.03, ramp = clamp2(Math.max(0, vel, 0.32 * (st.pivot || 0)) / 0.12);
        for (const L of legs) {
          const s = L.sx < 0 ? 1 : -1;
          let u = ((ph - Math.PI / 2) / (Math.PI * 2) + (s > 0 ? 0 : 0.5)) % 1;
          if (u < 0) u += 1;
          let zf, yf, toe = 0;
          if (u < duty) {
            zf = SLf / 2 - SLf * (u / duty);
            yf = yA;
          } else {
            const q2 = (u - duty) / (1 - duty), e = q2 * q2 * (3 - 2 * q2);
            zf = -SLf / 2 + SLf * e;
            yf = yA + 0.065 * Math.sin(Math.PI * q2);
            toe = 0.35 * Math.sin(Math.PI * Math.min(1, q2 * 1.6)) * (1 - q2);
          }
          zf *= ramp * (st.sweep != null ? st.sweep : 1);
          yf = mix2(yA, yf, ramp);
          toe *= ramp;
          const dz = zf, dy = yf - hipJ, d2 = clamp2(Math.hypot(dz, dy), 0.25, A2 + Bn - 1e-4);
          const phi = Math.atan2(dz, -dy), beta = Math.acos(clamp2((A2 * A2 + d2 * d2 - Bn * Bn) / (2 * A2 * d2), -1, 1)), kappa = Math.PI - Math.acos(clamp2((A2 * A2 + Bn * Bn - d2 * d2) / (2 * A2 * Bn), -1, 1));
          L.hp.rotation.x = -(phi + beta);
          L.kn.rotation.x = kappa;
          L.an.rotation.x = phi + beta - kappa + toe;
          L.hp.rotation.z = -hips.rotation.z;
        }
      } else for (const L of legs) {
        const s = L.sx < 0 ? 1 : -1, a = Math.sin(ph) * s;
        L.hp.rotation.x = -a * 0.42 * w + (1 - w) * (L.sx < 0 ? 0.02 : -0.02) * Math.sin(t * 0.35);
        L.kn.rotation.x = Math.max(0, Math.cos(ph) * s) * 0.9 * w + 0.03;
        L.an.rotation.x = -L.hp.rotation.x - L.kn.rotation.x + Math.max(0, -Math.cos(ph) * s) * 0.15 * w;
        L.hp.rotation.z = -hips.rotation.z;
      }
      for (const A2 of arms) {
        const s = A2.sx < 0 ? -1 : 1, swing = Math.sin(ph) * s * 0.38 * w;
        let shx = swing + Math.sin(t * 0.6 + A2.sx) * 0.015, shz = A2.sx * (0.07 + 0.01 * B), elx = -0.12 - 0.25 * w * Math.max(0, -swing * 2) - 0.05;
        shz += iw * A2.sx * 0.035 * (1 + PV4); elx -= iw * 0.18 * (1 + (A2.sx > 0 ? PV3 : PV2));   /* 20261030ah: arm rest variety */
      const C2 = state.carry && state.carry.side === A2.sx && sit < 0.5 ? state.carry : null;
        if (C2) {
          const sip = clamp2(C2.sip || 0);
          if (C2.pose === "briefcase") {
            shx = swing * 0.35;
            shz = A2.sx * 0.11;
            elx = -0.05;
          } else if (C2.pose === "folder") {
            shx = -0.08 + swing * 0.3;
            shz = A2.sx * 0.05;
            elx = -0.38;
          } else if (C2.pose === "notebook") {
            shx = -0.48;
            shz = -A2.sx * 0.26;
            elx = -1.42;
          } else if (C2.pose === "cup") {
            shx = mix2(-0.24, -0.98, sip);
            shz = -A2.sx * mix2(0.08, 0.62, sip);
            elx = mix2(-1.42, -2.32, sip);
          } else if (C2.pose === "phone") {
            shx = -0.52;
            shz = -A2.sx * 0.16;
            elx = -1.62;
          }
          A2.wr.rotation.set(C2.pose === "cup" ? -(shx + elx) : C2.pose === "phone" ? -(shx + elx) * 0.4 + 0.5 : 0, 0, 0);
        } else if (A2.sx > 0 && gs > 0.01) {
          const osc = Math.sin(t * 3.1) * 0.25 + Math.sin(t * 1.7) * 0.15;
          shx = mix2(shx, -0.55 + osc * 0.3, gs);
          shz = mix2(shz, 0.35 + osc * 0.15, gs);
          elx = mix2(elx, -1.25 - osc * 0.35, gs);
          A2.wr.rotation.y = mix2(0, -0.9, gs);
          A2.wr.rotation.z = mix2(0, 0.5 + osc * 0.3, gs);
        } else {
          A2.wr.rotation.set(0, 0, 0);
        }
        A2.sh.rotation.x = shx;
        A2.sh.rotation.z = shz;
        A2.el.rotation.x = elx;
        const grip = C2 ? C2.pose === "briefcase" ? -1.25 : -0.9 : null;
        for (let k = 0; k < A2.fingers.length - 1; k++) A2.fingers[k].rotation.x = grip != null ? grip : -0.25 - (A2.sx > 0 ? -gs * 0.2 : 0.15);
      }
      if (sit > 1e-3) {
        const hipSit = seatH / (body.scale.y * root.scale.y) + 0.115, kh = hipSit - 0.03, L = 0.505, phi = Math.acos(clamp2(kh / L, -1, 1));
        hips.position.y = mix2(hips.position.y, hipSit, sit);
        hips.position.x *= 1 - sit;
        hips.rotation.y *= 1 - sit;
        hips.rotation.z *= 1 - sit;
        torso.rotation.x = mix2(torso.rotation.x, mix2(-0.06, 0.12, desk), sit);
        for (const Lg of legs) {
          const spread = Lg.sx * 0.06;
          Lg.hp.rotation.x = mix2(Lg.hp.rotation.x, -Math.PI / 2, sit);
          Lg.hp.rotation.z = mix2(Lg.hp.rotation.z, 0, sit);
          Lg.hp.rotation.y = spread * sit;
          Lg.kn.rotation.x = mix2(Lg.kn.rotation.x, Math.PI / 2 - phi, sit);
          Lg.an.rotation.x = mix2(Lg.an.rotation.x, -(-Math.PI / 2 + Math.PI / 2 - phi), sit);
        }
        for (const Ar of arms) {
          const g = Ar.sx > 0 ? st.gest : 0;
          Ar.sh.rotation.x = mix2(Ar.sh.rotation.x, mix2(mix2(-0.32, -0.62, desk), Ar.sh.rotation.x, g), sit);
          Ar.sh.rotation.z = mix2(Ar.sh.rotation.z, mix2(Ar.sx * 0.12, Ar.sh.rotation.z, g), sit);
          Ar.el.rotation.x = mix2(Ar.el.rotation.x, mix2(mix2(-1.05, -1, desk), Ar.el.rotation.x, g), sit);
        }
      } else for (const Lg of legs) Lg.hp.rotation.y = 0;
      if (skirt && st.lod <= 2) skinSkirt();
      let ly = state.lookYaw || 0, lp = state.lookPitch || 0;
      if (state.lookAt) {
        headPivot.updateMatrixWorld();
        root.worldToLocal(v3.copy(state.lookAt));
        ly = clamp2(Math.atan2(v3.x, v3.z), -1.1, 1.1);
        lp = clamp2(-Math.atan2(v3.y - 1.6 / body.scale.y, Math.hypot(v3.x, v3.z)), -0.5, 0.5);
      }
      st.lookYaw += (ly - st.lookYaw) * Math.min(1, dt * 4);
      st.lookPitch += (lp - st.lookPitch) * Math.min(1, dt * 4);
      neckG.rotation.y = st.lookYaw * 0.4;
      head.rotation.y = st.lookYaw * 0.6 + Math.sin(t * 0.43) * 0.04;
      head.rotation.x = st.lookPitch + Math.sin(t * 0.31) * 0.02 - torso.rotation.x + (state.talking ? Math.sin(t * 2.3) * 0.035 : 0);
      head.rotation.z = Math.sin(t * 0.27) * 0.025 + 0.05 * PV2; head.rotation.y += 0.2 * PV4 * (state.lookAt ? 0.3 : 1);   /* 20261030ah: head tilt/turn variety */
      if (st.lod > 1) return;
      st.nextBlink -= dt;
      if (st.nextBlink <= 0) {
        st.blink = 0.14;
        st.nextBlink = 2 + rr() * 4;
      }
      st.blink = Math.max(0, st.blink - dt);
      const bl = st.blink > 0 ? Math.sin((1 - st.blink / 0.14) * Math.PI) : 0;
      for (const l of lids) l.rotation.x = l.userData.up > 0 ? mix2(-0.24 + S.face.lidDrop, 0.4, bl) + st.lookPitch * 0.3 : mix2(0.37, 0.3, bl);
      for (const e of eyes) {
        e.rotation.y = st.lookYaw * 0.3;
        e.rotation.x = st.lookPitch * 0.4;
      }
      let jt = 0;
      if (state.talking) {
        st.talkT += dt;
        const s1 = Math.sin(st.talkT * 13.1), s2 = Math.sin(st.talkT * 7.3 + 1), s3 = Math.sin(st.talkT * 3.1);
        jt = clamp2(0.45 + 0.35 * s1 * s2 + 0.25 * s3) * (Math.sin(st.talkT * 1.3) > -0.85 ? 1 : 0);
      }
      st.jaw += (jt - st.jaw) * Math.min(1, dt * 18);
      const j = st.jaw;
      lipL.position.y = mp.y - 42e-4 - j * 7e-3;
      lipU.position.y = mp.y + 36e-4 + j * 12e-4;
      mouthIn.scale.y = 15e-4 + j * 65e-4;
      teeth.position.y = mp.y + 5e-4 + j * 4e-4;
      lipU.scale.x = 0.0225 * S.face.mouthW * (1 - j * 0.15);
      lipL.scale.x = 0.0205 * S.face.mouthW * (1 - j * 0.12);
      const bu = state.talking ? Math.max(0, Math.sin(st.talkT * 0.9)) * 25e-4 : 0;
      st.browUp += (bu - st.browUp) * Math.min(1, dt * 5);
      for (const b of browMeshes) b.position.y = st.browUp;
    }
    setLod(0);
    update(0, {});
    root.userData = { pin: root.userData.pin || null, opts: opts0, THREE, uniform: S.uniform || null, onum: true, H: S.height, spec: S, update, setLod, meshCount: meshes.length + 1, parts: { hips, torso, head, arms, legs, wrists: arms.map((a) => ({ sx: a.sx, wr: a.wr })) } };
    const handle = { group: root, update, spec: S, setLod, uniform: S.uniform || null, dispose: () => disposeCharacter(root) };
    root.userData.handle = handle;
    return handle;
  }
  function buildProxy(S, bottom, jacket, sitting) {
    const parts = [], H = new T.Color();
    const put = (geo2, hex, x, y, z) => {
      geo2.translate(x, y, z);
      const c = lin(hex), n2 = geo2.attributes.position.count, col2 = new Float32Array(n2 * 3);
      for (let i = 0; i < n2; i++) {
        col2[i * 3] = c.r;
        col2[i * 3 + 1] = c.g;
        col2[i * 3 + 2] = c.b;
      }
      geo2.setAttribute("color", new T.BufferAttribute(col2, 3));
      parts.push(geo2.index ? geo2.toNonIndexed() : geo2);
    };
    const legC = bottom === "trousers" ? S.suit : hexMix(S.skin, 2759960, 0.25);
    const dy = sitting ? 0.575 - 0.95 : 0;
    if (!sitting) {
      put(new T.CylinderGeometry(0.065, 0.05, 0.9, 6), legC, -0.09, 0.47, 0);
      put(new T.CylinderGeometry(0.065, 0.05, 0.9, 6), legC, 0.09, 0.47, 0);
    } else for (const x of [-0.09, 0.09]) {
      put(new T.CylinderGeometry(0.07, 0.06, 0.45, 6).rotateX(Math.PI / 2), bottom === "trousers" ? legC : S.suit, x, 0.545, 0.22);
      put(new T.CylinderGeometry(0.05, 0.045, 0.5, 6), legC, x, 0.27, 0.43);
    }
    if (bottom !== "trousers" && !sitting) put(new T.CylinderGeometry(0.17, 0.19, 0.5, 8), S.suit, 0, 0.72, 0);
    put(new T.CylinderGeometry(0.19, 0.16, 0.6, 8), jacket ? S.suit : S.shirt, 0, 1.18 + dy, 0);
    put(new T.CylinderGeometry(0.045, 0.04, 0.6, 5), jacket ? S.suit : S.shirt, -0.21, 1.15 + dy, 0);
    put(new T.CylinderGeometry(0.045, 0.04, 0.6, 5), jacket ? S.suit : S.shirt, 0.21, 1.15 + dy, 0);
    put(new T.SphereGeometry(0.1, 8, 6), S.skin, 0, 1.63 + dy, 0.01);
    put(new T.SphereGeometry(0.105, 8, 4, 0, Math.PI * 2, 0, 1.4), S.hair, 0, 1.65 + dy, -0.01);
    let n = 0;
    for (const g of parts) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
    let o = 0;
    for (const g of parts) {
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      col.set(g.attributes.color.array, o * 3);
      o += g.attributes.position.count;
      g.dispose();
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new T.BufferAttribute(nor, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const m = new T.Mesh(geo, stdMat("proxy", { vertexColors: true, roughness: 0.8 }));
    m.castShadow = true;
    m.userData.proxy = true;
    return m;
  }
  function optionsFromLook(L, extra = {}) {
    var _a;
    const styles = ["short", "side_part", "bun", "receding", "long", "curls", "caesar"];
    const fem = L.frame === "fem";
    let style = styles[(L.style | 0) % styles.length];
    if (fem && (style === "receding" || style === "caesar")) style = "bob";
    if (!fem && style === "bun") style = "short";
    const cl = (v, a = 0.7, b = 1.3) => v == null || isNaN(v) ? void 0 : Math.min(b, Math.max(a, +v));
    const face = {};
    const put = (k, v) => {
      if (v !== void 0) face[k] = v;
    };
    put("faceW", cl(L.faceW));
    put("jaw", cl(L.jawW));
    put("brow", cl(L.browH) != null ? cl(L.browH) - (fem ? 0.3 : 0.05) : void 0);
    put("nose", cl(L.noseL));
    put("lip", cl(L.lipF));
    put("cheek", cl(L.cheek));
    return {
      face: Object.keys(face).length ? face : void 0,
      seed: (_a = extra.seed) != null ? _a : Math.round((L.height * 1e4 + L.build * 1e3 + (L.skin || 0)) % 2147483647),
      sex: fem ? "f" : "m",
      age: L.age,
      skin: L.skin,
      build: L.build,
      height: L.height,
      outfit: L.wear,
      hair: style,
      hairColor: L.hair,
      suitColor: L.suit,
      shirtColor: L.shirt,
      eye: L.eye,
      glasses: !!L.glasses,
      beard: !!L.beard,
      ...extra
    };
  }
  var UNI_WEAR = {
    court: ["suit_tie", "skirt_suit"],
    military: ["suit_tie", "trouser_suit"],
    tunic: ["suit_tie", "trouser_suit"],
    robe: ["suit_open", "dress_jacket"],
    sleek: ["suit_open", "trouser_suit"],
    tribal: ["suit_open", "dress_jacket"],
    consular: ["suit_tie", "skirt_suit"],
    civic: ["suit_tie", "skirt_suit"]
  };
  function liftCloth(h, minLum = 0.17) {
    let l = lumOf(h), k = 0;
    while (l < minLum && k < 12) {
      h = hm(h, 12104876, 0.08);
      l = lumOf(h);
      k++;
    }
    return h;
  }
  function uniformLook(look, uniform) {
    if (!look || !uniform) return look;
    const fem = look.frame === "fem", U = resolveUniform(uniform, fem);
    if (!U) return look;
    const w = (UNI_WEAR[U.style] || UNI_WEAR.civic)[fem ? 1 : 0];
    return { ...look, suit: liftCloth(U.main), shirt: U.style === "sleek" ? liftCloth(U.shirt, 0.12) : U.shirt, wear: w, _nepUniform: U.style };
  }
  function dressGameRig(THREE, g, o = {}) {
    T = THREE;
    MODE = "game";
    matCache = matCaches[MODE];
    const u = g && g.userData;
    if (!u || !u.spine) return null;
    const old = g.getObjectByName("nep-dress");
    if (old) old.parent && old.parent.remove(old);
    const look = o.look || {}, fem = look.frame === "fem";
    const U = o.uniform ? resolveUniform(o.uniform, fem) : null;
    g.updateMatrixWorld(true);
    const skip = new Set([u.armL, u.armR, u.headG, u.detailHead, u.legL, u.legR].filter(Boolean));
    const under = (m, root) => {
      for (let q = m; q; q = q.parent) {
        if (skip.has(q) && q !== root) return false;
        if (q === root) return true;
      }
      return false;
    };
    const meshesOf = (root) => {
      const a = [];
      root.traverse((m) => {
        if (m.isMesh && !m.isSkinnedMesh && m.geometry && under(m, root)) a.push(m);
      });
      return a;
    };
    const boxIn = (root, list) => {
      const inv = new T.Matrix4().copy(root.matrixWorld).invert(), b = new T.Box3(), mb = new T.Box3(), mm = new T.Matrix4();
      for (const m of list) {
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        mb.copy(m.geometry.boundingBox).applyMatrix4(mm.multiplyMatrices(inv, m.matrixWorld));
        b.union(mb);
      }
      return b;
    };
    const rc = new T.Raycaster(), hits = [];
    const cast = (root, list, x, y, z, dir) => {
      const o3 = new T.Vector3(x, y, z).applyMatrix4(root.matrixWorld), d = dir.clone().transformDirection(root.matrixWorld);
      rc.set(o3, d);
      rc.near = 0;
      rc.far = 10;
      hits.length = 0;
      for (const m of list) m.raycast(rc, hits);
      if (!hits.length) return null;
      hits.sort((a, b) => a.distance - b.distance);
      return root.worldToLocal(hits[0].point.clone());
    };
    const shared = [];
    const mark = (m) => {
      if (m.geometry) m.geometry._shared = true;
      const mt = m.material;
      if (mt) {
        mt._shared = true;
        if (mt.map) mt.map._shared = true;
        if (mt.normalMap) mt.normalMap._shared = true;
      }
      m.castShadow = false;
      m.receiveShadow = false;
      shared.push(m);
      return m;
    };
    const put = (parent, geo, mat, x, y, z) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return mark(m);
    };
    const solid = (hex, rough = 0.5, metal = 0) => stdMat("u" + hex + "|" + rough + "|" + metal, { color: lin(hex), roughness: rough, metalness: metal });
    const goldM = solid(13936202, 0.3, 1);
    const out = new T.Group();
    out.name = "nep-dress";
    const spine = u.spine, sList = meshesOf(spine), sb = boxIn(spine, sList);
    if (sb.isEmpty()) return null;
    const chest = new T.Group();
    chest.name = "nep-dress";
    spine.add(chest);
    const hw = Math.max(sb.max.x, -sb.min.x), top = sb.max.y, bot = sb.min.y, ht = top - bot, fz = sb.max.z + 0.05, cz = (sb.max.z + sb.min.z) / 2;
    const front = (x, y, lift = 3e-3) => {
      const p = cast(spine, sList, x, y, fz + 0.2, new T.Vector3(0, 0, -1));
      return p ? p.setZ(p.z + lift) : new T.Vector3(x, y, sb.max.z + lift);
    };
    const onTop = (x) => cast(spine, sList, x, top + 0.2, cz, new T.Vector3(0, -1, 0));
    const k = hw / 0.2;
    const pinAt = (src) => {
      const tex = pinTexture(src), y = bot + ht * 0.7, x = hw * (fem ? 0.36 : 0.4), p = front(x, y, 4e-3);
      const pg = new T.Group();
      pg.position.copy(p);
      pg.rotation.set(-0.12, 0.18, 0.12);
      chest.add(pg);
      pg.scale.setScalar(Math.min(1.25, Math.max(0.8, k)));
      put(pg, cached(geoCache, "pinback", () => new T.BoxGeometry(0.034, 0.022, 3e-3)), goldM, 0, 0, -5e-4);
      put(pg, cached(geoCache, "pinface", () => new T.PlaneGeometry(0.03, 0.0185)), pinMat(tex), 0, 0, 12e-4);
      g.userData.nepPin = pg;
    };
    if (U) {
      const accM = solid(U.accent, 0.55), trimM = U.trim === 13936202 ? goldM : solid(U.trim, 0.35, 0.5);
      const medals = (n) => {
        for (let i = 0; i < n; i++) {
          const x = hw * 0.32 + i % 3 * 0.022 * k, y = bot + ht * 0.66 - Math.floor(i / 3) * 0.045 * k, p = front(x, y, 4e-3);
          put(chest, cached(geoCache, "ribbon", () => new T.BoxGeometry(0.016, 0.014, 3e-3)), solid([U.accent, U.trim, U.dark][i % 3], 0.6), p.x, p.y + 0.014, p.z);
          put(chest, cached(geoCache, "medal", () => new T.CylinderGeometry(75e-4, 75e-4, 25e-4, 14).rotateX(Math.PI / 2)), goldM, p.x, p.y - 2e-3, p.z + 1e-3);
        }
      };
      const epaulettes = (fringe) => {
        for (const sx of [-1, 1]) {
          const x = sx * hw * 0.74, p = onTop(x) || new T.Vector3(x, top, cz);
          const e = put(chest, cached(geoCache, "epau2", () => new T.BoxGeometry(0.07, 0.01, 0.055)), trimM, p.x, p.y + 4e-3, p.z);
          e.rotation.z = -sx * 0.22;
          e.scale.set(k, 1, k);
          if (fringe) {
            const f = put(chest, cached(geoCache, "fringe", () => new T.CylinderGeometry(0.036, 0.034, 0.03, 12, 1, true)), trimM, p.x + sx * 0.03 * k, p.y - 0.016, p.z);
            f.scale.set(0.35 * k, 1, k);
          }
        }
      };
      const buttons = (n, hex) => {
        for (let i = 0; i < n; i++) {
          const y = bot + ht * (0.18 + 0.62 * i / Math.max(1, n - 1)), p = front(0, y, 2e-3);
          put(chest, cached(geoCache, "btn2", () => new T.CylinderGeometry(75e-4, 75e-4, 4e-3, 10).rotateX(Math.PI / 2)), hex === "gold" ? goldM : solid(hex, 0.3), p.x, p.y, p.z);
        }
      };
      const sash = (mat, w = 0.05) => {
        const pts = [];
        for (let i = 0; i <= 10; i++) {
          const t = i / 10, x = mix2(-hw * 0.62, hw * 0.55, t), y = mix2(top - ht * 0.08, bot + ht * 0.08, t);
          pts.push(front(x, y, 6e-3));
        }
        const c = new T.CatmullRomCurve3(pts), tg = new T.TubeGeometry(c, 20, w * 0.5 * k, 4);
        tg.scale(1, 1, 1);
        return put(chest, tg, mat, 0, 0, 0);
      };
      const head = u.detailHead || u.headG, hList = head ? (() => {
        const a = [];
        head.traverse((m) => {
          if (m.isMesh && m.geometry) a.push(m);
        });
        return a;
      })() : [];
      let hb = null;
      if (head && hList.length) hb = boxIn(head, hList);
      const cap = (kind) => {
        if (!hb || hb.isEmpty()) return;
        const r = Math.max(hb.max.x - hb.min.x, hb.max.z - hb.min.z) / 2, cx = (hb.max.x + hb.min.x) / 2, cz2 = (hb.max.z + hb.min.z) / 2, y = hb.max.y;
        const hg = new T.Group();
        hg.name = "nep-dress";
        hg.position.set(cx, y - r * 0.32, cz2);
        head.add(hg);
        hg.scale.setScalar(r / 0.095);
        if (kind === "military") {
          put(hg, cached(geoCache, "capcrown", () => new T.CylinderGeometry(0.104, 0.086, 0.06, 28)), solid(liftCloth(U.main), 0.8), 0, 0.03, 0);
          put(hg, cached(geoCache, "capband", () => new T.CylinderGeometry(0.0875, 0.0875, 0.018, 28)), accM, 0, 5e-3, 0);
          const v = put(hg, cached(geoCache, "visor", () => new T.CircleGeometry(0.088, 20, 0, Math.PI).rotateX(-Math.PI / 2)), solid(855311, 0.15), 0, -2e-3, 4e-3);
          v.scale.set(1, 1, 0.75);
          v.rotation.x = 0.18;
          put(hg, cached(geoCache, "capbadge", () => new T.CylinderGeometry(0.011, 0.011, 4e-3, 12).rotateX(Math.PI / 2)), goldM, 0, 0.025, 0.098);
        }
        if (kind === "tunic") put(hg, cached(geoCache, "softcap", () => new T.CylinderGeometry(0.095, 0.088, 0.05, 24)), solid(liftCloth(U.main), 0.8), 0, 0.025, 0);
        if (kind === "robe") {
          const c = put(hg, cached(geoCache, "skullcap", () => weld(new T.SphereGeometry(0.09, 20, 8, 0, Math.PI * 2, 0, 0.9))), accM, 0, -0.03, -0.01);
          c.scale.set(1.04, 0.9, 1.08);
        }
        if (kind === "tribal") {
          const b = put(hg, cached(geoCache, "headband", () => new T.TorusGeometry(0.085, 8e-3, 6, 32)), accM, 0, -0.01, 0);
          b.rotation.x = Math.PI / 2;
          b.scale.set(1.08, 1.2, 1);
        }
      };
      switch (U.style) {
        case "court":
          sash(accM);
          medals(fem ? 3 : 5);
          break;
        case "military":
          epaulettes(true);
          medals(4);
          buttons(4, "gold");
          cap("military");
          break;
        case "tunic":
          buttons(5, 1710618);
          {
            const starG = cached(geoCache, "starshape", () => {
              const s2 = new T.Shape();
              for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 38e-4 : 95e-4;
                i ? s2.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s2.moveTo(Math.cos(a) * r, -Math.sin(a) * r);
              }
              return new T.ShapeGeometry(s2);
            });
            for (const sx of [-1, 1]) {
              const p = front(sx * hw * 0.3, top - ht * 0.1, 4e-3);
              const st2 = put(chest, starG, solid(U.accent === U.main ? 13936202 : U.accent, 0.4, 0.3), p.x, p.y, p.z);
              st2.rotation.y = sx * 0.5;
            }
          }
          cap("tunic");
          break;
        case "robe":
          {
            const p = front(0, bot + ht * 0.6, 6e-3);
            put(chest, cached(geoCache, "pect", () => new T.BoxGeometry(0.012, 0.06, 4e-3)), goldM, p.x, p.y, p.z);
            put(chest, cached(geoCache, "pectb", () => new T.BoxGeometry(0.04, 0.012, 4e-3)), goldM, p.x, p.y + 0.01, p.z + 1e-3);
          }
          cap("robe");
          break;
        case "sleek":
          for (const sx of [-1, 1]) {
            const a = front(sx * hw * 0.42, top - ht * 0.12, 3e-3), b = front(sx * hw * 0.42, bot + ht * 0.1, 3e-3);
            const m = put(chest, cached(geoCache, "piping", () => new T.BoxGeometry(5e-3, 1, 4e-3)), solid(U.accent, 0.3, 0.2), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
            m.scale.y = a.distanceTo(b);
            m.rotation.x = Math.atan2(a.z - b.z, a.y - b.y);
          }
          break;
        case "tribal":
          sash(accM, 0.08);
          cap("tribal");
          break;
        case "consular":
          epaulettes(false);
          sash(solid(15984324, 0.6), 0.04);
          {
            const p = front(hw * 0.42, bot + ht * 0.62, 6e-3);
            const bt = put(chest, cached(geoCache, "badge", () => new T.CircleGeometry(0.03, 24)), badgeMat(U), p.x, p.y, p.z);
            bt.rotation.y = 0.18;
            bt.scale.setScalar(k);
          }
          break;
        default:
          pinAt(U.flag);
      }
    } else if (o.homeFlag) pinAt(o.homeFlag);
    try {
      const f = u.fine || (u.fine = []), md = u.mid || (u.mid = []);
      for (const m of shared) {
        const gm = m.geometry;
        if (!gm.boundingSphere) gm.computeBoundingSphere();
        const ws = new T.Vector3();
        m.getWorldScale(ws);
        (gm.boundingSphere.radius * Math.max(ws.x, ws.y, ws.z) < 0.035 ? f : md).push(m);
      }
    } catch (e) {
    }
    for (const m of shared) if (m.geometry && m.geometry.type === "TubeGeometry") m.geometry._shared = false;
    g.userData.nepDress = { style: U ? U.style : null, pieces: shared.length };
    return g.userData.nepDress;
  }
  function disposeCharacter(group) {
    const shared = new Set(geoCache.values());
    group.traverse((o) => {
      if (o.isMesh && o.geometry && !shared.has(o.geometry)) o.geometry.dispose();
    });
    if (group.parent) group.parent.remove(group);
  }
  function cacheStats() {
    return { geometries: geoCache.size, materials: matCache.size, textures: texCache2.size };
  }
  var onum_characters_default = { uniformLook, dressGameRig, applyDressCode, dressFor, resolveUniform, UNIFORM_STYLES, makeCharacter, optionsFromLook, disposeCharacter, cacheStats, OUTFITS, HAIR_STYLES, SKIN_TONES };

  // __entry.js
  window.ONUM_NEPTUNE = { chars: onum_characters_exports, flags: onum_flags_exports, mats: onum_materials_exports };
})();
