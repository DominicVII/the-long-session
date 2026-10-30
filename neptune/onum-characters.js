// onum-characters.js — procedural people for "One Nation, Under, ME." (Three.js r128, THREE passed in)
// Deterministic (seeded mulberry32, no Math.random). Rigid-part hierarchy (no skinning) so it is cheap to
// animate and easy to LOD. Forward = +Z, feet at y = 0, units = metres (same convention as session.html buildPerson).
import { makeMaterial, getTextures } from './onum-materials.js';
import { describeFlag, drawFlag, jerusalemCross } from './onum-flags.js';

export const OUTFITS = ['suit_tie', 'three_piece', 'suit_open', 'shirt_vest', 'skirt_suit', 'trouser_suit', 'dress_jacket', 'blouse_skirt'];
export const HAIR_STYLES = ['short', 'side_part', 'bun', 'receding', 'long', 'curls', 'caesar', 'bob', 'bald_fringe', 'buzz'];
export const SKIN_TONES = [0xf0d3ba, 0xe8c4a0, 0xd9ab84, 0xc08e64, 0x9c6b45, 0x7a4f31, 0x5c3a22, 0x3f2818]; // = session.html SKINS
const SUITS = [0x1a2744, 0x12141a, 0x7a2a2e, 0x3a2418, 0x4a6578, 0x6a5a3e, 0x1d2530, 0x2f4a38, 0x5c4030, 0x24313d, 0x0e1014, 0x8a6a32];
const HAIRS = [0x14100d, 0x2f2318, 0x4a3728, 0x6b5540, 0x8b7355, 0x5c3218, 0x1f1712];
const SHIRTS = [0xf2f0ea, 0xdfe6ef, 0xf3ece0, 0xe9e4f0, 0xffffff];
const TIES = [0x7a1f2b, 0x1f3a6b, 0x2c4a32, 0x5a4a1a, 0x3a2a4a, 0x8a2a1a];
const EYES = [0x5a3d24, 0x3d2a18, 0x6b4a2a, 0x4a6070, 0x556b4a, 0x2f2018, 0x7a6a4a, 0x3a4a5c];
const Q = { low: { seg: 20, head: [84, 64], fingers: true, tex: 'low' }, med: { seg: 24, head: [92, 70], fingers: true, tex: 'med' }, high: { seg: 28, head: [100, 76], fingers: true, tex: 'high' } };

// ---------- utils ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const G2 = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / (s * s));

let T = null;                       // THREE, set per call
const geoCache = new Map(), texCache = new Map(); let matCache = null;
function cached(map, key, fn) { if (!map.has(key)) map.set(key, fn()); return map.get(key); }
function hexMix(a, b, t) { const A = new T.Color(a), B = new T.Color(b); return A.lerp(B, t).getHex(); }

// ---------- colour convention ----------
// 'game' (default): hex colours used raw, exactly like session.html (no sRGB->linear conversion), so a figure
// built here sits at the same brightness as the existing buildPerson() people. 'linear': physically correct.
let MODE = 'game';
const matCaches = { game: new Map(), linear: new Map() };
// 'game' colours are written as raw numbers, which reads every colour pale (claret came out pink, tan skin white). People
// take them part of the way to linear: the same brightness order, with the depth and warmth of the colour actually named.
const DEEPEN = 1.55;
function deepen(c) { if (MODE === 'game') { c.r = Math.pow(c.r, DEEPEN); c.g = Math.pow(c.g, DEEPEN); c.b = Math.pow(c.b, DEEPEN); } return c; }
function lin(hex) { const c = new T.Color(hex); return MODE === 'linear' ? c.convertSRGBToLinear() : deepen(c); }
// skin needs more of the way: raw, the light tones carried so much green and blue that they lit up white
function deepenSkin(c) { if (MODE === 'game') { const l = (c.r + c.g + c.b) / 3, k = 1.55 + 0.55 * Math.max(0, l - 0.45) / 0.45; c.r = Math.pow(c.r, k); c.g = Math.pow(c.g, k + 0.12); c.b = Math.pow(c.b, k + 0.16); } return c; }   // light tones get the most correction, deep tones the least
function linSkin(hex) { const c = new T.Color(hex); return MODE === 'linear' ? c.convertSRGBToLinear() : deepenSkin(c); }
function texEnc(t) { if (MODE === 'linear') { if ('colorSpace' in t && T.SRGBColorSpace) t.colorSpace = T.SRGBColorSpace; else t.encoding = T.sRGBEncoding; } return t; }

// ---------- 3D value noise (seeded hash, no tables) ----------
function hash3(x, y, z, s) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn3(x, y, z, s) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); let fx = x - xi, fy = y - yi, fz = z - zi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t, h = (i, j, k) => hash3(xi + i, yi + j, zi + k, s);
  return l(l(l(h(0, 0, 0), h(1, 0, 0), fx), l(h(0, 1, 0), h(1, 1, 0), fx), fy), l(l(h(0, 0, 1), h(1, 0, 1), fx), l(h(0, 1, 1), h(1, 1, 1), fx), fy), fz); }
// iterate an equirect canvas (SphereGeometry UV layout) as unit directions
function eqPaint(W, H, fn) { const out = new Float32Array(W * H * 4);
  for (let py = 0; py < H; py++) { const th = (py + 0.5) / H * Math.PI, st = Math.sin(th), ny = Math.cos(th);
    for (let px = 0; px < W; px++) { const ph = (px + 0.5) / W * Math.PI * 2; fn(-Math.cos(ph) * st, ny, Math.sin(ph) * st, out, (py * W + px) * 4); } }
  return out; }
function toCanvas(W, H, f, normalFromAlpha = false) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'), id = ctx.createImageData(W, H);
  for (let i = 0; i < W * H * 4; i++) id.data[i] = clamp(f[i]) * 255; ctx.putImageData(id, 0, 0); return c; }
function heightToNormal(W, H, h, str) { const n = new Float32Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x;
    const dx = (h[y * W + (x + 1) % W] - h[y * W + (x - 1 + W) % W]) * str, dy = (h[Math.min(H - 1, y + 1) * W + x] - h[Math.max(0, y - 1) * W + x]) * str;
    const l = 1 / Math.hypot(dx, dy, 1); n[i * 4] = -dx * l * 0.5 + 0.5; n[i * 4 + 1] = dy * l * 0.5 + 0.5; n[i * 4 + 2] = l * 0.5 + 0.5; n[i * 4 + 3] = 1; }
  return n; }

// Head skin: colour zones (cheeks, nose, ears, lips, under-eye), beard shadow on men, pores + fine normal, T-zone sheen.
// Cached per skin tone x sex x beard-shadow x quality (not per person) to keep memory flat.
function headSkinMat(S, q) {
  const shadow = S.fem ? 0 : (S.beard === 'full' || S.beard === 'short') ? 0.6 : S.beard === 'stubble' ? 1 : 0.45;
  const key = 'headskin6' + S.skin + (S.fem ? 'f' : 'm') + shadow + q + MODE;
  return cached(matCache, key, () => {
    const W = q === 'high' ? 512 : q === 'med' ? 256 : 128, H = W / 2, base = deepenSkin(new T.Color(S.skin));
    const dark = (base.r + base.g + base.b) / 3 < 0.45;
    const hgt = new Float32Array(W * H), rgh = new Float32Array(W * H);
    const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
      const ax = Math.abs(nx), fr = sstep(0.05, 0.7, nz);
      const red = 0.75 * G2(ax - 0.45, ny + 0.12, 0.2) * fr + 0.8 * G2(nx / 0.7, ny + 0.14, 0.16) * fr + 0.7 * G2(ax - 0.98, ny + 0.02, 0.3) * sstep(0.45, -0.2, nz)
        + 0.45 * G2(nx, ny + 0.47, 0.2) * fr + 0.25 * G2(nx, ny - 0.55, 0.3) * fr * 0;
      const under = 0.5 * G2(ax - 0.32, ny + 0.0, 0.07) * fr;
      const beard = shadow * sstep(-0.18, -0.34, ny) * sstep(-0.3, 0.1, nz) * sstep(0.98, 0.72, ax) * (1 - G2(nx * 1.1, (ny + 0.47) * 2.4, 0.2) * 0.85 * fr)
        + shadow * sstep(-0.3, -0.36, ny) * sstep(0.04, 0.1, ax) * sstep(0.2, 0.6, nz) * sstep(-0.42, -0.36, ny) * 0;
      const mott = vn3(nx * 9, ny * 9, nz * 9, 3) - 0.5, freck = vn3(nx * 40, ny * 40, nz * 40, 5);
      const pore = vn3(nx * 140, ny * 140, nz * 140, 7), pore2 = vn3(nx * 70, ny * 70, nz * 70, 8);
      const stub = vn3(nx * 220, ny * 220, nz * 220, 9);
      let r = base.r, g = base.g, b = base.b;
      const rk = dark ? 0.5 : 1 + 0.9 * clamp(((base.r + base.g + base.b) / 3 - 0.45) / 0.3);   // fair skin shows the blood in cheeks, nose and ears most
      r *= 1 + 0.05 * red * rk; g *= 1 - 0.12 * red * rk; b *= 1 - 0.10 * red * rk;
      r *= 1 - 0.10 * under; g *= 1 - 0.12 * under; b *= 1 - 0.06 * under; { const ysk = G2(ax - 0.33, ny - 0.12, 0.10) * fr, ybr = G2(ax - 0.30, ny - 0.215, 0.05) * fr, ych = G2(ax - 0.55, ny + 0.3, 0.13) * fr, yjw = sstep(-0.5, -0.85, ny) * sstep(-0.2, 0.3, nz), ytm = G2(ax - 0.75, ny - 0.15, 0.12) * fr;   /* 20261030ad: painted sockets, under-brow, cheek hollow, temple and under-jaw shade: the face holds its planes at 6-10 m */
      const yao = G2(ax - 0.17, ny - 0.1, 0.045) * fr + 0.8 * G2(ax - 0.15, ny + 0.34, 0.04) * fr + sstep(-0.62, -0.9, ny) * sstep(0.0, 0.4, nz) * 0.9;   /* 20261030af: crease occlusion (inner eye corners, nasolabial, under chin) */
      const ysh = 1 - 0.5 * yao - 0.52 * ysk - 0.42 * ybr - 0.16 * ych - 0.16 * ytm - 0.5 * yjw - 0.22 * sstep(0.48, 0.66, ny) * sstep(-0.2, 0.4, nz) - 0.28 * G2(ax - 0.11, ny + 0.2, 0.05) * fr - 0.3 * G2(nx, ny + 0.33, 0.05) * fr;   /* 20261030ak: skin AO under brow, beside/under nose, hairline, under chin */ r *= ysh; g *= ysh * 0.985; b *= ysh * 0.99; }
      { const E = (v, w) => Math.exp(-(v / w) * (v / w));   /* 20261030ae: painted feature marks in the head albedo itself, so they survive every LOD tier and 6-10 m */
        const ybw = E(ny - 0.255 - 0.03 * (0.3 - Math.abs(ax - 0.3)), 0.05) * sstep(0.07, 0.13, ax) * sstep(0.5, 0.42, ax) * fr, yln = E(ny - 0.13, 0.038) * sstep(0.2, 0.25, ax) * sstep(0.45, 0.4, ax) * fr;
        const yns = E(ax - 0.1, 0.03) * sstep(0.06, -0.04, ny) * sstep(-0.32, -0.22, ny) * fr, yun = G2(nx, ny + 0.32, 0.06) * fr, ylp = E(ny + 0.47, 0.02) * sstep(0.2, 0.12, ax) * fr, yul = G2(nx * 0.5, ny + 0.58, 0.05) * fr;
        const yk = 1 - 1.15 * ybw - 1.05 * yln - 0.35 * G2(ax - 0.33, ny - 0.13, 0.09) * fr - 0.22 * yns - 0.22 * yun - 0.38 * ylp - 0.18 * yul; r *= yk; g *= yk * 0.97; b *= yk * 0.96; }
      const m = 1 + mott * 0.06 - sstep(0.7, 0.9, freck) * 0.05 * (dark ? 0.3 : 1);
      r *= m; g *= m; b *= m;
      const bs = beard * (0.55 + 0.45 * sstep(0.35, 0.75, stub));
      r = mix(r, r * 0.62, bs * 0.55); g = mix(g, g * 0.64, bs * 0.55); b = mix(b, b * 0.72, bs * 0.55);
      const gain = 1.07; o[i] = r * gain; o[i + 1] = g * gain; o[i + 2] = b * gain; o[i + 3] = 1;
      hgt[i / 4] = pore * 0.6 + pore2 * 0.4 - bs * stub * 0.3;
      const tz = Math.max(G2(nx, ny - 0.45, 0.3), G2(nx / 0.6, ny + 0.1, 0.18)) * fr;
      rgh[i / 4] = clamp(0.62 - tz * 0.18 + (pore - 0.5) * 0.1 + bs * 0.12);
    });
    const nrm = heightToNormal(W, H, hgt, W / 256 * 0.8);
    const orm = new Float32Array(W * H * 4); for (let i = 0; i < W * H; i++) { orm[i * 4] = 1; orm[i * 4 + 1] = rgh[i]; orm[i * 4 + 2] = 0; orm[i * 4 + 3] = 1; }
    const mk = (cv) => { const t = new T.CanvasTexture(cv); t.anisotropy = 4; return t; };
    const m = new T.MeshStandardMaterial({ map: texEnc(mk(toCanvas(W, H, col))), normalMap: mk(toCanvas(W, H, nrm)), normalScale: new T.Vector2(0.12, 0.12),
      roughnessMap: mk(toCanvas(W, H, orm)), roughness: 1, metalness: 0 });
    gameSkin(m, S.skin); m.name = 'onumc:headskin'; return m;
  });
}
function gameSkin(m, hex) { if (MODE === 'game') { const c = new T.Color(hex); m.emissive = new T.Color(c.r * 0.09, c.g * 0.03, c.b * 0.02); } else m.emissive = lin(hexMix(hex, 0xff3020, 0.5)).multiplyScalar(0.025); }
function lidMat(S) { return cached(matCache, 'lid' + S.skin + MODE, () => { const m = new T.MeshStandardMaterial({ color: linSkin(hexMix(S.skin, 0x6a3a30, 0.12)), roughness: 0.5 }); gameSkin(m, S.skin); return m; }); }
function earMat(S) { return cached(matCache, 'ear' + S.skin + MODE, () => { const m = new T.MeshStandardMaterial({ color: linSkin(hexMix(S.skin, 0xc04a40, 0.16)), roughness: 0.55 }); gameSkin(m, S.skin); return m; }); }
function irisMat(hex) { return cached(matCache, 'iris' + hex + MODE, () => {
  const S2 = 64, c = document.createElement('canvas'); c.width = c.height = S2; const g = c.getContext('2d'), base = deepen(new T.Color(hex)).multiplyScalar(0.55);
  const id = g.createImageData(S2, S2);
  for (let y = 0; y < S2; y++) for (let x = 0; x < S2; x++) { const dx = (x + 0.5) / S2 * 2 - 1, dy = (y + 0.5) / S2 * 2 - 1, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const fib = 0.75 + 0.25 * Math.sin(a * 37 + Math.sin(a * 11) * 2) * Math.sin(a * 23 + r * 7), ring = sstep(0.82, 0.98, r), inner = 1 + 0.35 * (1 - sstep(0.25, 0.6, r));
    const k = fib * inner * (1 - ring * 0.7), p = (y * S2 + x) * 4;
    id.data[p] = clamp(base.r * k + (1 - sstep(0.2, 0.5, r)) * 0.08) * 255; id.data[p + 1] = clamp(base.g * k + (1 - sstep(0.2, 0.5, r)) * 0.06) * 255; id.data[p + 2] = clamp(base.b * k) * 255; id.data[p + 3] = 255; }
  g.putImageData(id, 0, 0); const t = texEnc(new T.CanvasTexture(c));
  return new T.MeshStandardMaterial({ map: t, roughness: 0.2 }); }); }
// hair shell material: strand albedo variation + alpha mask hairline (alphaTest: no sorting issues)
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
  return cached(matCache, 'hairshell3' + S.style + S.hair + (S.fem ? 1 : 0) + q + MODE, () => {
    const W = q === 'high' ? 512 : 256, H = W / 2, base = deepen(new T.Color(S.hair)); if ((base.r + base.g + base.b) / 3 > 0.4) base.multiplyScalar(0.78);
    const hgt = new Float32Array(W * H);
    const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
      const { m } = hairMask(S.style, nx, ny, nz, S.fem);
      // combed hair runs front to back: across the top the strands are lines of constant x, down the sides lines of constant y
      const sc = mix(nx, ny, sstep(0.55, 0.9, Math.abs(nx))), al = (nz + ny) * 0.5;
      const strand = vn3(sc * 90, al * 6, 0, 11) * 0.6 + vn3(sc * 40, al * 3, 0, 12) * 0.4;
      const brk = vn3(nx * 60, ny * 60, nz * 60, 13);
      const a = sstep(0.44, 0.56, m + (brk - 0.5) * 0.16 + (strand - 0.5) * 0.10);
      const k = 0.78 + strand * 0.42; o[i] = base.r * k; o[i + 1] = base.g * k; o[i + 2] = base.b * k; o[i + 3] = a; hgt[i / 4] = strand;
    });
    const alpha = new Float32Array(W * H * 4); for (let i = 0; i < W * H; i++) { const a = col[i * 4 + 3]; alpha[i * 4] = alpha[i * 4 + 1] = alpha[i * 4 + 2] = a; alpha[i * 4 + 3] = 1; col[i * 4 + 3] = 1; }
    const nrm = heightToNormal(W, H, hgt, W / 256 * 1.5);
    const mk = cv => new T.CanvasTexture(cv);
    return new T.MeshStandardMaterial({ map: texEnc(mk(toCanvas(W, H, col))), alphaMap: mk(toCanvas(W, H, alpha)), alphaTest: 0.5, normalMap: mk(toCanvas(W, H, nrm)),
      normalScale: new T.Vector2(0.5, 0.5), roughness: 0.9, metalness: 0, side: T.FrontSide });
  });
}
// the loose outer strands: fine vertical breaks in an alpha cut-out, a shade lighter and darker than the body of the hair
function hairFuzzMat(S, q) {
  return cached(matCache, 'hairfuzz' + S.style + S.hair + (S.fem ? 1 : 0) + q + MODE, () => {
    const W = q === 'high' ? 512 : 256, H = W / 2, base = deepen(new T.Color(S.hair)); if ((base.r + base.g + base.b) / 3 > 0.4) base.multiplyScalar(0.78);
    const col = eqPaint(W, H, (nx, ny, nz, o, i) => {
      const { m } = hairMask(S.style, nx, ny, nz, S.fem);
      const sc = mix(nx, ny, sstep(0.55, 0.9, Math.abs(nx))), al = (nz + ny) * 0.5;
      const fine = vn3(sc * 220, al * 10, 0, 21) * 0.65 + vn3(sc * 420, al * 18, 0, 22) * 0.35;
      const clump = vn3(sc * 30, al * 4, 0, 23);
      const a = sstep(0.56, 0.6, fine * 0.8 + clump * 0.35) * sstep(0.48, 0.62, m);
      const k = 0.85 + fine * 0.4; o[i] = base.r * k; o[i + 1] = base.g * k; o[i + 2] = base.b * k; o[i + 3] = a;
    });
    const alpha = new Float32Array(W * H * 4); for (let i = 0; i < W * H; i++) { const a = col[i * 4 + 3]; alpha[i * 4] = alpha[i * 4 + 1] = alpha[i * 4 + 2] = a; alpha[i * 4 + 3] = 1; col[i * 4 + 3] = 1; }
    const mk = cv => new T.CanvasTexture(cv);
    const m = new T.MeshStandardMaterial({ map: texEnc(mk(toCanvas(W, H, col))), alphaMap: mk(toCanvas(W, H, alpha)), alphaTest: 0.5, roughness: 0.55, metalness: 0, side: T.DoubleSide });
    m.name = 'onumc:hairfuzz'; return m;
  });
}
// lips: cupid's bow on the upper lip, fuller lower lip, tapered corners (unit size; scaled by the caller)
function lipGeo(upper) {
  const g = new T.SphereGeometry(1, 28, 12), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const e = Math.sqrt(Math.max(0, 1 - x * x));
    y *= mix(0.22, 1, e); z *= mix(0.35, 1, e);
    if (upper) { if (y > 0) y *= 1 + 0.45 * (Math.exp(-(((x - 0.2) / 0.14) ** 2)) + Math.exp(-(((x + 0.2) / 0.14) ** 2))) - 0.45 * Math.exp(-((x / 0.08) ** 2)); y -= 0.35 * x * x; }
    else { y += 0.35 * x * x - 0.1; z *= 1 + 0.15 * e; }
    p.setXYZ(i, x, y, z); }
  return weld(g);
}

// average normals of coincident vertices (removes seam creases)
function weld(geo) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal, m = new Map();
  for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
    (m.get(k) || m.set(k, []).get(k)).push(i); }
  const v = new T.Vector3();
  for (const ids of m.values()) if (ids.length > 1) { v.set(0, 0, 0); for (const i of ids) v.add(new T.Vector3(n.getX(i), n.getY(i), n.getZ(i)));
    v.normalize(); for (const i of ids) n.setXYZ(i, v.x, v.y, v.z); }
  if (geo.attributes.uv) geo.setAttribute('uv2', geo.attributes.uv);
  return geo;
}
// Loft: rings [{y, w, d, z?, x?}] -> closed tube with superellipse section. uv in metres / 0.25.
function loft(rings, seg, pw = 2.2, caps = true) {
  const pos = [], uv = [], idx = [], R = rings.length;
  for (let r = 0; r < R; r++) { const g = rings[r];
    for (let j = 0; j <= seg; j++) { const a = j / seg * Math.PI * 2, c = Math.sin(a), s = Math.cos(a);
      const e = 2 / (g.p || pw), cx = Math.sign(c) * Math.pow(Math.abs(c), e), sz = Math.sign(s) * Math.pow(Math.abs(s), e);
      pos.push((g.x || 0) + cx * g.w, g.y, (g.z || 0) + sz * g.d); uv.push(j / seg * (g.w + g.d) * 3.2 / 0.25 * 0.5, g.y / 0.25); } }
  for (let r = 0; r < R - 1; r++) for (let j = 0; j < seg; j++) { const a = r * (seg + 1) + j, b = a + seg + 1;
    if (rings[r].y > rings[r + 1].y) idx.push(a, b, a + 1, a + 1, b, b + 1); else idx.push(a, a + 1, b, a + 1, b + 1, b); }
  if (caps) for (const r of [0, R - 1]) { const g = rings[r], c = pos.length / 3; pos.push(g.x || 0, g.y, g.z || 0); uv.push(0.5, 0.5);
    const top = (r === R - 1) === (rings[R - 1].y > rings[0].y);
    for (let j = 0; j < seg; j++) { const a = r * (seg + 1) + j; if (top) idx.push(c, a + 1, a); else idx.push(c, a, a + 1); } }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); return weld(geo);
}
// simple limb: radii along -Y from 0 to -len
function limb(len, rads, seg, d = 1, p = 2) { return loft(rads.map((r, i) => ({ y: -len * i / (rads.length - 1), w: r, d: r * d, p })), seg); }

// ---------- procedural textures (seeded, shared) ----------
function noiseCanvas(S, seed, fn) {
  const c = document.createElement('canvas'); c.width = c.height = S; const ctx = c.getContext('2d'), id = ctx.createImageData(S, S);
  const r = mulberry32(seed), L = 64, lat = new Float32Array(L * L); for (let i = 0; i < lat.length; i++) lat[i] = r();
  const vn = (x, y, f) => { x *= f; y *= f; const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, P = Math.min(L, f);
    const a = lat[((yi % P) * L + xi % P)], b = lat[((yi % P) * L + (xi + 1) % P)], c2 = lat[(((yi + 1) % P) * L + xi % P)], d = lat[(((yi + 1) % P) * L + (xi + 1) % P)];
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return mix(mix(a, b, sx), mix(c2, d, sx), sy); };
  const h = new Float32Array(S * S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = fn(vn, x / S, y / S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = y * S + x, p = i * 4;
    const dx = (h[y * S + (x + 1) % S] - h[y * S + (x - 1 + S) % S]) * S / 64, dy = (h[((y + 1) % S) * S + x] - h[((y - 1 + S) % S) * S + x]) * S / 64;
    const l = 1 / Math.hypot(dx, dy, 1); id.data[p] = (-dx * l * .5 + .5) * 255; id.data[p + 1] = (dy * l * .5 + .5) * 255; id.data[p + 2] = (l * .5 + .5) * 255; id.data[p + 3] = 255; }
  ctx.putImageData(id, 0, 0); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
}
function skinNormal(S) { return cached(texCache, 'skin' + S, () => { const t = noiseCanvas(S, 7, (n, u, v) => n(u, v, 64) * 0.5 + n(u, v, 32) * 0.35 + n(u, v, 8) * 0.15); t.repeat.set(6, 6); return t; }); }
function hairNormal(S) { return cached(texCache, 'hair' + S, () => (() => { const t = noiseCanvas(S, 9, (n, u, v) => n(u, v * 0.0625, 64) * 0.7 + n(u, v * 0.125, 32) * 0.3); t.repeat.set(6, 1); return t; })()); }

// ---------- materials ----------
function stdMat(key, o) { return cached(matCache, key, () => { const m = new T.MeshStandardMaterial(o); m.name = 'onumc:' + key; return m; }); }
function skinMat(hex, q) { return cached(matCache, 'skin' + hex + q, () => { const m = new T.MeshStandardMaterial({ color: linSkin(hex), roughness: 0.52, metalness: 0,
  normalMap: skinNormal(q === 'high' ? 512 : 256), normalScale: new T.Vector2(0.06, 0.06) });
  gameSkin(m, hex); m.name = 'onumc:skin'; return m; }); }
function hairMat(hex, q) { return cached(matCache, 'hair' + hex + q, () => new T.MeshStandardMaterial({ color: lin(hex), roughness: 0.62, metalness: 0,
  normalMap: hairNormal(q === 'high' ? 512 : 256), normalScale: new T.Vector2(0.3, 0.3) })); }
// cloth in any colour: wool normal + roughness/AO from onum-materials, colour ours
function clothMat(hex, q, name = 'suit_wool', rep = 1) { return cached(matCache, 'cloth' + name + hex + q + rep, () => {
  if (MODE === 'linear' && name === 'suit_wool' && hex === 0x1a2744) return makeMaterial('suit_wool', T, { repeat: rep, quality: Q[q].tex, physical: false });
  const tx = getTextures(name, T, { repeat: rep, quality: Q[q].tex });
  return new T.MeshStandardMaterial({ color: lin(hex), normalMap: tx.normalMap, roughnessMap: tx.ormMap, aoMap: tx.ormMap, aoMapIntensity: 0.5, roughness: 1, metalness: 0 }); }); }
function leatherMat(hex, q) { return cached(matCache, 'leather' + hex + q, () => { const tx = getTextures('leather', T, { repeat: 1, quality: Q[q].tex });
  return new T.MeshStandardMaterial({ color: lin(hex), normalMap: tx.normalMap, normalScale: new T.Vector2(0.5, 0.5), roughness: 0.32, metalness: 0 }); }); }

// ---------- head ----------
// unit-sphere direction -> deformed head point (head-local metres)
function headShape(f) {
  const hw = 0.077 * f.faceW, hh = 0.112, hd = 0.098;
  return (nx, ny, nz, out) => {
    const fr = sstep(0.05, 0.7, nz), ax = Math.abs(nx), age = f.age;
    let r = 1;
    const A = f.asym, eyY = nx < 0 ? A.eyeL : A.eyeR, nxs = nx - A.nose * sstep(0.25, -0.3, ny);
    r -= 0.045 * G2(ax - 0.34, ny - 0.11 - eyY, 0.15) * fr;                                 // eye sockets
    r += 0.05 * Math.exp(-(((ny - 0.27) / 0.075) ** 2)) * sstep(0.62, 0.1, ax) * fr * f.brow; // brow ridge
    const nw = 0.104 * f.bridge + 0.085 * sstep(0.12, -0.24, ny) * f.wing;   // a bridge with some breadth, not a blade
    const na = ny > -0.24 ? mix(0.012, 0.112 * f.nose, sstep(0.2, -0.2, ny)) : 0.112 * f.nose * sstep(-0.33, -0.24, ny);
    r += (na + 0.035 * f.hook * G2(0, ny + 0.02, 0.11)) * Math.exp(-((nxs / nw) ** 2)) * fr;   // nose (bridge, hook)
    r += 0.052 * f.tip * G2(nxs / 1.2, ny + 0.19 - f.up, 0.085) * fr;                       // tip bulb / upturn
    r += 0.035 * f.wing * G2(Math.abs(nxs) - 0.12 * f.wing, ny + 0.22, 0.07) * fr;                                    // nostril wings
    r += 0.06 * f.cheek * (1 + (nx < 0 ? -A.cheek : A.cheek)) * G2(ax - 0.46, ny + 0.03, 0.2) * fr;                           // cheekbones
    r -= 0.03 * G2(ax - 0.28, ny + 0.16, 0.12) * fr * (1 - age * 0.3);                  // under-cheek hollow
    r += 0.07 * G2(nx * 0.9, (ny + 0.47) * 1.3, 0.26) * fr;                              // muzzle
    r -= 0.025 * G2(nx, ny + 0.6, 0.08) * fr;                                           // groove under lip
    r += 0.06 * f.chin * G2(nx * 0.95, ny + 0.8, 0.22) * fr;                               // chin
    r -= 0.04 * G2(ax - 0.84, ny - 0.22, 0.22); r += 0.045 * G2(ax - 0.78, ny + 0.42, 0.17) * sstep(-0.5, 0.2, nz) + 0.025 * G2(ax - 0.62, ny + 0.08, 0.16) * fr - 0.02 * G2(ax - 0.16, ny + 0.36, 0.05) * fr;   /* 20261030af: jaw angle, side-cheek volume, nasolabial crease: a face silhouette, not an egg */                                          // temples
    // age
    r -= age * 0.018 * G2(ax - 0.30, ny + 0.02, 0.07) * fr;                              // under-eye
    r -= age * 0.022 * G2((ax - 0.2 - (-(ny + 0.3)) * 0.35) * 2.4, (ny + 0.32), 0.14) * fr * sstep(0.1, 0.16, ax); // nasolabial
    r += age * 0.03 * G2(ax - 0.5, ny + 0.62, 0.16);                                     // jowls
    if (ny > 0.38 && ny < 0.75) r -= age * 0.005 * Math.pow(Math.abs(Math.sin(ny * 48)), 6) * fr; // forehead lines
    let x = nx * r, y = ny * r, z = nz * r;
    const jaw = ny < 0 ? mix(1, f.jaw * 0.92, sstep(-0.15, -0.9, ny)) : 1;
    x *= jaw;
    // a sphere tapers to a point at the bottom; a jaw does not. Square the lower face out and blunt the chin.
    if (ny < -0.3) { const sq = sstep(-0.3, -0.75, ny) * (1 - 0.45 * sstep(-0.86, -1.0, ny)); x *= 1 + (f.fem ? 0.08 : 0.14) * sq; }
    if (ny < -0.8) y *= mix(1, 0.95, sstep(-0.8, -1.0, ny));
    if (nz < 0) z *= 1.08 - 0.25 * sstep(-0.2, -0.8, ny);                                // skull back / neck
    if (ny < -0.55 && nz < 0.3) z *= mix(1, 0.75, sstep(-0.55, -0.95, ny) * sstep(0.3, -0.4, nz));
    out[0] = x * hw; out[1] = y * hh; out[2] = z * hd; return out;
  };
}
function sphereGeo(ws, hs, fnPoint) {
  const g = new T.SphereGeometry(1, ws, hs), p = g.attributes.position, o = [0, 0, 0];
  for (let i = 0; i < p.count; i++) { fnPoint(p.getX(i), p.getY(i), p.getZ(i), o); p.setXYZ(i, o[0], o[1], o[2]); }
  return weld(g);
}
const surf = (shape, nx, ny, nz) => { const l = Math.hypot(nx, ny, nz); return new T.Vector3(...shape(nx / l, ny / l, nz / l, [0, 0, 0])); };

function hairMask(style, nx, ny, nz, fem) {
  const ax = Math.abs(nx);
  let h = mix(-0.55, 0.45, sstep(-0.25, 0.75, nz)) + 0.1 * G2(ax - 0.42, 0, 0.18) * sstep(0.3, 0.8, nz) - 0.04 * G2(nx, 0, 0.2);            // hairline height by front-ness
  const ear = sstep(0.62, 0.85, ax) * sstep(0.55, 0.0, nz) * sstep(-0.55, -0.1, nz);
  h = Math.max(h, mix(h, 0.05, ear));
  let t = 0.035 + 0.03 * sstep(-0.2, 1, ny);
  if (style === 'buzz' || style === 'caesar') t = style === 'buzz' ? 0.012 : 0.03;
  if (style === 'caesar') h = mix(h, 0.62, sstep(0.3, 0.9, nz) * 0.6);
  if (style === 'receding' || style === 'bald_fringe') { h = mix(h, 0.80, sstep(0.0, 0.8, nz)); h += 0.15 * G2(ax - 0.35, 0, 0.25) * sstep(0.2, 0.9, nz); }
  if (style === 'bald_fringe') { const top = sstep(0.25, 0.4, ny); return { m: sstep(h - 0.05, h + 0.05, ny) * (1 - top), t: 0.025 }; }
  if (style === 'side_part') { t += 0.035 * G2(nx + 0.25, ny - 0.75, 0.45) * sstep(-0.2, 0.6, nz); t -= 0.02 * G2(nx - 0.3, ny - 0.8, 0.06); }
  if (style === 'curls') t = 0.06 + 0.025 * Math.sin(nx * 23) * Math.sin(ny * 21) * Math.sin(nz * 19);
  if (style === 'bob' || style === 'long') { h = Math.min(h, mix(-0.95, 0.44, sstep(0.1, 0.8, nz))); t = 0.07 + 0.04 * sstep(0.2, -0.8, ny);
    t += 0.03 * G2(nx + 0.35, ny - 0.75, 0.4); t -= 0.03 * G2(nx + 0.12, ny - 0.82, 0.05); }
  if (style === 'bun') { t = 0.028; h = mix(h, 0.5, sstep(0.3, 0.8, nz)); }
  return { m: sstep(h - 0.09, h + 0.09, ny), t };
}

// ---------- dress codes ----------
// Uniform styles by government type. Colours come from describeFlag(govType, seed) of the decreeing nation.
const UNIFORM_BY_GOV = { constitutional_monarchy: 'court', absolute_monarchy: 'court', empire: 'court', junta: 'military', dictatorship: 'military',
  communist: 'tunic', socialist: 'tunic', theocracy: 'robe', technocracy: 'sleek', corporate: 'sleek', tribal: 'tribal', consular_republic: 'consular' };
export const UNIFORM_STYLES = ['court', 'military', 'tunic', 'robe', 'sleek', 'tribal', 'consular', 'civic'];
const hexOf = s => typeof s === 'number' ? s : parseInt(String(s).replace('#', ''), 16);
const lumOf = h => (((h >> 16) & 255) * 0.3 + ((h >> 8) & 255) * 0.59 + (h & 255) * 0.11) / 255;
const satOf = h => { const r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255; return (Math.max(r, g, b) - Math.min(r, g, b)) / 255; };
function hm(a, b, t) { const c = (x, s) => (x >> s) & 255, f = s => Math.round(c(a, s) + (c(b, s) - c(a, s)) * t); return (f(16) << 16) | (f(8) << 8) | f(0); }
export function resolveUniform(u, fem) {
  if (!u) return null;
  const gov = u.govType || u.type || 'republic', seed = u.seed ?? 1, D = describeFlag(gov, seed);
  const pal = D.palette.map(hexOf), byLum = pal.slice().sort((a, b) => lumOf(a) - lumOf(b));
  const dark = byLum[0], light = byLum[byLum.length - 1], accent = pal.slice().sort((a, b) => satOf(b) - satOf(a))[0];
  const gold = pal.find(h => satOf(h) > 0.35 && lumOf(h) > 0.55 && ((h >> 16) & 255) > ((h & 255) + 60)) ?? 0xd4a64a;
  const style = u.style || UNIFORM_BY_GOV[gov] || 'civic';
  const U = { gov, seed, style, describe: D, dark, light, accent: accent === dark ? light : accent, trim: gold, flag: { type: gov, seed }, shirt: 0xf2f0ea };
  switch (style) {
    case 'court': Object.assign(U, { main: hm(dark, 0x0a0a0c, 0.35), outfit: fem ? 'dress_jacket' : 'suit_tie', tie: U.accent }); break;
    case 'military': Object.assign(U, { main: hm(hm(dark, 0x4b5320, 0.45), 0x101010, 0.15), outfit: fem ? 'mil_f' : 'mil', tie: 0x1a1a1a, shirt: 0xd8d2bc }); break;
    case 'tunic': Object.assign(U, { main: hm(hm(dark, 0x5a5a48, 0.6), 0x202020, 0.1), outfit: 'tunic', tie: accent }); break;
    case 'robe': Object.assign(U, { main: lumOf(light) > 0.7 ? hm(light, 0xffffff, 0.2) : light, outfit: 'robe', tie: accent }); U.dress = U.main; break;
    case 'sleek': Object.assign(U, { main: hm(dark, 0x26282c, 0.6), outfit: fem ? 'sleek_f' : 'sleek', tie: 0x15161a, shirt: 0x1c1d21 }); break;
    case 'tribal': Object.assign(U, { main: pal[0], outfit: 'tribal', tie: accent }); U.dress = pal[0]; break;
    case 'consular': Object.assign(U, { main: 0x9B1B2E, accent: 0xe8d5a3, trim: 0xe8d5a3, outfit: fem ? 'skirt_suit' : 'suit_tie', tie: 0xe8d5a3, shirt: 0xf3e6c4 }); break; // NO7 colours (session.html oranje7FlagTex)
    default: Object.assign(U, { main: hm(dark, 0x101218, 0.4), outfit: fem ? 'skirt_suit' : 'suit_tie', tie: U.accent });
  }
  return U;
}
const pinTexCache = new WeakMap();
function pinTexture(src) {
  if (src && src.isTexture) return src;
  if (src && (src.getContext || src.tagName === 'CANVAS')) { if (!pinTexCache.has(src)) { const t = new T.CanvasTexture(src); texEnc(t); pinTexCache.set(src, t); } return pinTexCache.get(src); }
  const ty = (src && (src.type || src.govType)) || 'republic', sd = (src && src.seed) ?? 1;
  return cached(texCache, 'pin' + ty + '|' + sd + MODE, () => { const t = new T.CanvasTexture(drawFlag(ty, sd, { width: 128, height: 80 })); texEnc(t); t.anisotropy = 4; return t; });
}
function pinMat(tex) { return cached(matCache, 'pinmat' + tex.uuid, () => new T.MeshStandardMaterial({ map: tex, roughness: 0.28, metalness: 0.1 })); }
function badgeMat(U) { return cached(matCache, 'badge' + MODE, () => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#9B1B2E'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#e8d5a3'; g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 57, 0, Math.PI * 2); g.stroke();
  jerusalemCross(g, 64, 64, 36, '#f3e6c4'); const t = texEnc(new T.CanvasTexture(c)); return new T.MeshStandardMaterial({ map: t, roughness: 0.3, metalness: 0.3 }); }); }

// The rule: a decreed uniform wins; otherwise normal clothes + the home state's flag pin.
// person: { homeFlag?: {type, seed}|canvas|texture, homeState?: key }   nation: { govType, seed, decree?: {govType?, seed?, style?, active?}, stateFlags?: {key: {type, seed}} }
export function dressFor(person = {}, nation = {}) {
  const d = nation.decree || nation.dressCode;
  if (d && d.active !== false) return { uniform: { govType: d.govType || nation.govType, seed: d.seed ?? nation.seed ?? 1, style: d.style }, homeFlag: null };
  const hf = person.homeFlag || (nation.stateFlags && person.homeState != null ? nation.stateFlags[person.homeState] : null) || null;
  return { uniform: null, homeFlag: hf };
}
// Switch a character's dress code. Given a character handle/group: rebuilds it in place (same parent, transform,
// seed, face) and returns the new handle. Given a plain options object: returns new options. decree null = no uniform.
export function applyDressCode(target, decree, THREE) {
  const g = target && (target.isObject3D ? target : target.group);
  if (!g) return { ...(target || {}), uniform: decree || null };
  const ud = g.userData, three = THREE || ud.THREE, o = { ...ud.opts, uniform: decree || null };
  const h = makeCharacter(three, o), ng = h.group;
  ng.position.copy(g.position); ng.quaternion.copy(g.quaternion); ng.visible = g.visible;
  const parent = g.parent; if (parent) { const i = parent.children.indexOf(g); parent.remove(g); parent.add(ng); parent.children.splice(parent.children.indexOf(ng), 1); parent.children.splice(i, 0, ng); }
  disposeCharacter(g); return h;
}

// ---------- character ----------
export const BEARDS = ['none', 'stubble', 'moustache', 'kaiser', 'short', 'full'];
function normBeard(b, fem, r, a01) {
  const roll = r();
  if (b == null) return fem ? 'none' : roll < 0.12 ? 'stubble' : roll < 0.2 ? 'short' : roll < 0.26 ? 'full' : roll < 0.31 ? 'moustache' : roll < 0.32 + 0.03 * a01 ? 'kaiser' : 'none';
  if (b === true) return ['short', 'full', 'moustache', 'stubble'][(roll * 4) | 0];
  if (b === false) return 'none';
  return BEARDS.includes(b) ? b : 'none';
}
function rollSpec(o) {
  const r = mulberry32((o.seed >>> 0) * 2654435761 + 12345), pick = a => a[(r() * a.length) | 0];
  const sex = o.sex || (r() < 0.5 ? 'm' : 'f'), fem = sex === 'f' || sex === 'fem' || sex === 'female';
  let age = o.age == null ? 30 + r() * 45 : o.age; if (age <= 1) age = 28 + age * 50;
  const a01 = clamp((age - 25) / 55);
  let skin = o.skin == null ? pick(SKIN_TONES) : o.skin; if (skin <= 1) skin = SKIN_TONES[Math.round(skin * 7)];
  const builds = { slim: 0.88, average: 1, athletic: 1.05, broad: 1.12, heavy: 1.25 };
  const build = typeof o.build === 'string' ? builds[o.build] || 1 : (o.build || mix(0.9, 1.2, r() * r() * 1.4 > 1 ? 1 : r()));
  const rc = mulberry32((o.seed >>> 0) * 40503 + 99), pickC = a => a[(rc() * a.length) | 0];
  const outfitR = pickC(fem ? OUTFITS.slice(4) : OUTFITS.slice(0, 4)), outfit = o.outfit || outfitR;
  const style = o.hair || pick(fem ? ['bob', 'long', 'bun', 'bob', 'short', 'curls'] : (a01 > 0.55 ? ['receding', 'bald_fringe', 'side_part', 'short', 'caesar'] : ['short', 'side_part', 'caesar', 'buzz', 'curls']));
  const baseHair = o.hairColor != null ? o.hairColor : (skin <= 0xd9ab84 && skin >= 0x9c6b45 ? pick(HAIRS) : skin < 0x9c6b45 ? pick([0x14100d, 0x1f1712, 0x2f2318]) : pick(HAIRS));
  const grey = clamp((a01 - 0.35) * 1.6 + (r() - 0.5) * 0.3);
  return {
    fem, age, a01, skin, build, outfit, style, glasses: o.glasses ?? r() < 0.25 * (0.5 + a01), beard: normBeard(o.beard, fem, r, a01),
    height: o.height || (fem ? 1.56 + r() * 0.18 : 1.68 + r() * 0.2),
    hair: hexMix(baseHair, 0xc8c4bc, grey * 0.9), eye: o.eye || pick(EYES),
    suit: (s => o.suitColor ?? s)(pickC(SUITS)), shirt: (s => o.shirtColor ?? s)(pickC(SHIRTS)), tie: (s => o.tieColor ?? s)(pickC(TIES)), dress: o.dressColor,
    face: ((F) => o.face ? Object.assign(F, o.face) : F)({ faceW: fem ? 0.92 + r() * 0.08 : 0.98 + r() * 0.08, jaw: fem ? 0.80 + r() * 0.1 : 0.92 + r() * 0.14, brow: fem ? 0.6 + r() * 0.3 : 0.9 + r() * 0.4,
      nose: fem ? 0.82 + r() * 0.25 : 0.95 + r() * 0.35, cheek: 0.8 + r() * 0.5, chin: 0.7 + r() * 0.6, lip: fem ? 1.1 + r() * 0.2 : 0.85 + r() * 0.2, age: a01,
      bridge: 0.8 + r() * 0.5, wing: 0.85 + r() * 0.35, hook: (r() - 0.45) * (fem ? 0.8 : 1.4), tip: 0.6 + r() * 0.9, up: (r() - 0.4) * 0.06,
      mouthW: 0.92 + r() * 0.16, lidDrop: r() * 0.12 + a01 * 0.1, ear: 0.9 + r() * 0.2, tilt: (r() - 0.5) * 0.12,
      browShape: { arch: r() * (fem ? 1.3 : 0.9), thick: fem ? 0.8 + r() * 0.4 : 0.9 + r() * 0.6, len: r(), tail: r(), gap: (r() - 0.5) * 0.04 },
      asym: { eyeL: (r() - 0.5) * 0.04, eyeR: (r() - 0.5) * 0.04, browL: (r() - 0.5) * 0.05, browR: (r() - 0.5) * 0.05, nose: (r() - 0.5) * 0.05, cheek: (r() - 0.5) * 0.2, mouth: (r() - 0.5) * 0.1 } }),
    seed: o.seed >>> 0, phase: r() * 100, blinkSeed: (r() * 1e9) | 0
  };
}

export function makeCharacter(THREE, opts = {}) {
  T = THREE; MODE = opts.colorMode === 'linear' ? 'linear' : 'game'; matCache = matCaches[MODE];
  const opts0 = opts; { const s0 = rollSpec({ seed: 1, ...opts }), U0 = resolveUniform(opts.uniform, s0.fem);
    if (U0) opts = { ...opts, outfit: U0.outfit, suitColor: liftCloth(U0.main), shirtColor: U0.shirt, tieColor: U0.tie, dressColor: U0.dress }; opts.__U = U0; }
  const q = Q[opts.quality] ? opts.quality : 'med', QQ = Q[q], S = rollSpec({ seed: 1, ...opts }), seg = QQ.seg; S.uniform = opts.__U;
  const fem = S.fem, B = S.build, root = new T.Group(), body = new T.Group(), rig = new T.Group();
  // render hook: always drawn (never culled, never LOD-hidden), so a host that hooks onBeforeRender on the first mesh keeps
  // getting update() calls at every LOD (hooking a rig mesh froze LOD 3: rig hidden -> hook never ran again)
  const hook = new T.Mesh(cached(geoCache, 'hook', () => new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([0, 1, 0, 0.001, 1, 0, 0, 1.001, 0], 3))),
    cached(matCache, 'hookmat', () => new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false }))); hook.frustumCulled = false; hook.name = 'onumc-hook';
  root.add(hook); root.add(body); { /* 20261030ah: soft contact shadow so people sit on the rug, not float on it */ const cg = cached(geoCache, "contact", () => new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), cm = cached(matCache, "contactmat4", () => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(0,0,0,0.97)"); gr.addColorStop(0.3, "rgba(0,0,0,0.88)"); gr.addColorStop(0.55, "rgba(0,0,0,0.5)"); gr.addColorStop(0.72, "rgba(255,226,196,0.28)"); gr.addColorStop(0.88, "rgba(255,226,196,0.12)");   /* 20261030am: warm halo ring so the dark core reads against the red rug */   /* 20261030al: near-black contact core */   /* 20261030aj: darker contact core */ gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new T.MeshBasicMaterial({ name: "onumc:contact", map: new T.CanvasTexture(c), color: 0xffffff, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); }); const cs = new T.Mesh(cg, cm); cs.position.y = 0.006; cs.scale.set(1.45, 1, 1.2);   /* 20261030aj: larger, reads under feet at 7-9 m */ cs.renderOrder = 1; cs.castShadow = false; cs.name = "onumc-contact"; root.add(cs); } body.add(rig);
  root.name = 'onum-character'; const meshes = [], faceFine = [], bodyFine = [];
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, list) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    parent.add(m); meshes.push(m); if (list) list.push(m); return m; };
  const W = { suit_tie: [1, 0, 'tie', 'trousers'], three_piece: [1, 1, 'tie', 'trousers'], suit_open: [1, 0, 'open', 'trousers'], shirt_vest: [0, 1, 'tie', 'trousers'],
    skirt_suit: [1, 0, 'bow', 'skirt'], trouser_suit: [1, 0, 'bow', 'trousers'], dress_jacket: [1, 0, 'necklace', 'dress'], blouse_skirt: [0, 0, 'scarf', 'skirt'],
    mil: [1, 0, 'tie', 'trousers'], mil_f: [1, 0, 'tie', 'trousers'], tunic: [1, 0, 'mandarin', 'trousers'], robe: [0, 0, 'none', 'robe'], tribal: [0, 0, 'none', 'robe_knee'],
    sleek: [1, 0, 'open', 'trousers'], sleek_f: [1, 0, 'open', 'trousers'] }[S.outfit] || [1, 0, 'tie', 'trousers'];
  const [jacket, vest, neck, bottom] = W;
  const skinM = skinMat(S.skin, q), hairM = hairMat(S.hair, q);
  const suitM = clothMat(S.suit, q), shirtM = clothMat(S.shirt, q, 'suit_wool', 4);
  const longB = bottom === 'dress' || bottom === 'robe' || bottom === 'robe_knee';
  const dressM = clothMat(S.dress != null ? S.dress : bottom === 'dress' ? hexMix(S.suit, 0x6a1a2a, 0.4) : S.suit, q);
  const shoeM = leatherMat(fem ? 0x1a1414 : (S.seed % 3 ? 0x141212 : 0x3a2014), q);
  const hoseM = stdMat('hose' + S.skin, { color: lin(hexMix(S.skin, 0x2a1d18, 0.25)), roughness: 0.45 });
  const tieM = clothMat(S.tie, q, 'suit_wool', 3);
  const bkey = (fem ? 'f' : 'm') + Math.round(B * 10) + q;            // body geometry bucket (shared)
  const bw = 0.88 + 0.12 * B;                                            // width factor
  const gb = (k, fn) => cached(geoCache, bkey + k, fn);
  const tieGeo = () => cached(geoCache, 'tie', () => loft([{ y: 0.46, w: 0.012, d: 0.005 }, { y: 0.43, w: 0.018, d: 0.005 }, { y: 0.17, w: 0.032, d: 0.004 }, { y: 0.15, w: 0.001, d: 0.003 }], 8));

  // --- dimensions (canonical 1.75 m person; root scaled to height) ---
  const sc = S.height / 1.75; body.scale.set(sc * bw, sc, sc * (0.92 + 0.08 * B));   // on body, not root: hosts may set root.scale
  const hipY = 0.95, legX = fem ? 0.085 : 0.09;
  const hips = new T.Group(); hips.position.y = hipY; rig.add(hips);
  const torso = new T.Group(); hips.add(torso);
  const heavy = clamp((B - 1) * 4);
  const tp = fem ? [[-0.09, .175, .115], [0, .172, .112], [0.10, .132, .095], [0.2, .14, .1], [0.29, .155, .118, .018], [0.36, .152, .108, .01], [0.42, .152, .096], [0.46, .128, .084], [0.495, .088, .066], [0.53, .055, .055]]
    : [[-0.09, .165, .11], [0, .163, .108], [0.12, .14 + .022 * heavy, .105 + .035 * heavy, .02 * heavy], [0.25, .165 + .01 * heavy, .115 + .02 * heavy, .01 * heavy], [0.35, .172, .118], [0.42, .172, .108], [0.465, .145, .092], [0.495, .10, .072], [0.53, .058, .058]];
  const ring = (a, k = 1, dk = 0) => ({ y: a[0], w: a[1] * k * (1 - 0.06 * Math.exp(-(((a[0] - 0.14) / 0.09) ** 2)) + 0.035 * Math.exp(-(((a[0] - 0.38) / 0.06) ** 2))) + dk,   /* 20261030ak: chest/waist taper */ d: a[2] * k + dk, z: a[3] || 0 });
  const shoulderY = 0.44, shX = (fem ? 0.162 : 0.185);
  add(torso, gb('torso2', () => loft(tp.map(a => { const r = ring(a); const pad = sstep(0.36, 0.43, a[0]) * sstep(0.50, 0.465, a[0]); r.w = Math.max(r.w, mix(r.w, shX + 0.012 - 0.05 * sstep(0.44, 0.5, a[0]), pad)); return r; }), seg)), (jacket || vest) ? shirtM : (longB ? dressM : shirtM));
  // neck + head
  const neckG = new T.Group(); neckG.position.set(0, 0.5, -0.005); torso.add(neckG);
  add(neckG, gb('neck', () => limb(-0.1, [0.058, 0.055, 0.052], seg)), cached(matCache, 'neckskin' + S.skin + q + MODE, () => { const m = skinM.clone(); m.color.multiplyScalar(0.8); return m; }));   /* 20261030ad: the neck sits in the jaw's shadow */
  const head = new T.Group(); head.position.set(0, 0.07, 0.012); neckG.add(head);
  const headPivot = new T.Group(); headPivot.position.set(0, 0.10, 0); head.add(headPivot);
  const shape = headShape(Object.assign({ fem }, S.face));
  const headMat = headSkinMat(S, q);
  add(headPivot, sphereGeo(QQ.head[0], QQ.head[1], shape), headMat);
  // eyes
  const eyeW = stdMat('eyeW', { color: lin(0xd2c8bf), roughness: 0.06 }), irisM = irisMat(S.eye), pupM = stdMat('pupil', { color: 0x050505, roughness: 0.1 });
  const lashM = stdMat('lash', { color: 0x0c0907, roughness: 0.7 });
  const lids = [], eyes = [], A = S.face.asym;
  for (const sx of [-1, 1]) {
    const ey = 0.11 + (sx < 0 ? A.eyeL : A.eyeR);
    const sp = surf(shape, sx * 0.33, ey, 0.94); const c = new T.Vector3(sp.x, sp.y, sp.z - 0.0089);
    const eg = new T.Group(); eg.position.copy(c); headPivot.add(eg); eyes.push(eg);
    add(eg, cached(geoCache, 'eyeball' + q, () => weld(new T.SphereGeometry(0.0127, 20, 14))), eyeW, 0, 0, 0, faceFine);
    add(eg, cached(geoCache, 'iris', () => new T.CircleGeometry(0.0076, 24)), irisM, 0, 0, 0.0122, faceFine);
    add(eg, cached(geoCache, 'pupil', () => new T.CircleGeometry(0.0029, 14)), pupM, 0, 0, 0.0125, faceFine);
    for (const up of [1, -1]) {   // eyelids: skin shells that hug the eyeball, with a lash line on the edge
      const lg = new T.Group(); lg.position.copy(c); lg.rotation.z = -sx * (S.face.tilt + (up > 0 ? 0 : 0.05)); headPivot.add(lg);
      const lr = new T.Group(); lg.add(lr);
      add(lr, cached(geoCache, 'lid' + up, () => weld(new T.SphereGeometry(0.0136, 24, 10, 0, Math.PI * 2, up > 0 ? 0 : Math.PI * 0.5, Math.PI * 0.5))), lidMat(S), 0, 0, 0, faceFine);
      const lash = add(lr, cached(geoCache, 'lash' + up, () => { const g = new T.TorusGeometry(0.0137, up > 0 ? 0.0025 : 0.0011, 4, 20, Math.PI * 0.9);
        g.rotateZ(Math.PI * 0.05); g.rotateX(Math.PI / 2 * (up > 0 ? -1 : -1)); return g; }), lashM, 0, 0, 0, faceFine);
      // crease above upper lid
      if (up > 0) { const cr = add(lg, cached(geoCache, 'crease', () => { const g = new T.TorusGeometry(0.0144, 0.0008, 4, 16, Math.PI * 0.7); g.rotateZ(Math.PI * 0.15); return g; }),
        stdMat('crease' + S.skin, { color: lin(hexMix(S.skin, 0x3a2018, 0.35)), roughness: 0.7 }), 0, 0.0005, 0.0015, faceFine); cr.rotation.x = -0.35; }
      lr.userData.up = up; lids.push(lr);
    }
  }
  // brows: tapered, seeded shape
  const browM = hairMat(hexMix(S.hair, 0x000000, 0.55), q);
  const BR = S.face.browShape;
  for (const sx of [-1, 1]) {
    const by = (sx < 0 ? A.browL : A.browR);
    const xs = [0.10 + BR.gap, 0.24, 0.38, 0.47 + 0.08 * BR.len];
    const ys = [0.235, 0.27 + 0.03 * BR.arch, 0.275 + 0.035 * BR.arch, 0.235 - 0.03 * BR.tail];
    const pts = xs.map((x, i) => { const y = ys[i] + by; const p = surf(shape, sx * x, y, Math.sqrt(Math.max(0.05, 1 - x * x - y * y))); return p.add(p.clone().normalize().multiplyScalar(0.0012)); });
    const curve = new T.CatmullRomCurve3(pts), tub = 14, rad = 6, base = (fem ? 0.0047 : 0.0064) * BR.thick * 1.9;   /* 20261030aj: brows read across the rug */
    const tg = new T.TubeGeometry(curve, tub, base, rad); const P = tg.attributes.position;
    for (let i = 0; i <= tub; i++) { const cp = curve.getPointAt(i / tub), tt = i / tub, k = mix(1, 0.3, Math.pow(tt, 1.6)) * (tt < 0.08 ? 0.8 : 1);
      for (let j = 0; j <= rad; j++) { const vi = i * (rad + 1) + j; const ox = P.getX(vi) - cp.x, oy = P.getY(vi) - cp.y, oz = P.getZ(vi) - cp.z;
        P.setXYZ(vi, cp.x + ox * k, cp.y + oy * k * 1.15, cp.z + oz * k * 0.45); } }
    weld(tg); const m = add(headPivot, tg, browM, 0, 0, 0, faceFine); m.userData.browSide = sx;
  }
  // lips + mouth
  const lipCol = hexMix(S.skin, fem ? 0xa03e48 : 0x8e4e48, fem ? 0.5 : 0.4);
  const lipM = stdMat('lip2' + lipCol + MODE, { color: linSkin(lipCol), roughness: 0.38 });
  const mp = surf(shape, 0, -0.47, 0.88);
  const mouthIn = add(headPivot, cached(geoCache, 'mouthIn', () => new T.SphereGeometry(1, 16, 10)), stdMat('mouthIn', { color: 0x1a0807, roughness: 0.9 }), mp.x, mp.y - 0.0025, mp.z - 0.007, faceFine);
  mouthIn.scale.set(0.021, 0.0024, 0.006);
  const teeth = add(headPivot, cached(geoCache, 'teeth', () => new T.BoxGeometry(0.026, 0.006, 0.01)), stdMat('teeth', { color: lin(0xe0d9ca), roughness: 0.3 }), mp.x, mp.y + 0.0005, mp.z - 0.0095, faceFine);
  const lipU = add(headPivot, cached(geoCache, 'lipU' + q, () => lipGeo(true)), lipM, mp.x, mp.y + 0.0036, mp.z - 0.0048, faceFine);
  lipU.scale.set(0.0225 * S.face.mouthW, 0.0058 * S.face.lip, 0.0088); lipU.rotation.z = A.mouth;
  const lipL = add(headPivot, cached(geoCache, 'lipL' + q, () => lipGeo(false)), lipM, mp.x, mp.y - 0.0042, mp.z - 0.0054, faceFine);
  lipL.scale.set(0.0205 * S.face.mouthW, 0.0072 * S.face.lip, 0.0096); lipL.rotation.z = A.mouth;
  // nostrils
  for (const sx of [-1, 1]) { const p = surf(shape, sx * 0.085 + A.nose, -0.265, 0.95); const m = add(headPivot, mouthIn.geometry, stdMat('nostril', { color: 0x2a1410, roughness: 1 }), p.x, p.y + 0.002, p.z - 0.008, faceFine); m.scale.set(0.0035, 0.0018, 0.0045); m.rotation.y = sx * 0.4; }
  // ears
  const earG = cached(geoCache, 'ear', () => { const g = new T.TorusGeometry(0.016, 0.0058, 8, 18, Math.PI * 1.55); g.rotateZ(-Math.PI * 0.28); return weld(g); });
  const earB = cached(geoCache, 'earb', () => weld(new T.SphereGeometry(1, 14, 10)));
  const earM = earMat(S);
  for (const sx of [-1, 1]) { const p = surf(shape, sx, -0.02, -0.08);
    const eg = new T.Group(); eg.position.set(p.x + sx * 0.002, p.y, p.z); eg.rotation.y = sx * 1.35; headPivot.add(eg);
    const e1 = add(eg, earG, earM); e1.scale.set(0.9, 1.25 * S.face.ear, 1); const e2 = add(eg, earB, earM, -0.002 * sx, -0.001, -0.004); e2.scale.set(0.015, 0.026 * S.face.ear, 0.006); }
  // hair shell: geometry gives volume, a painted alpha mask gives a clean, strand-broken hairline
  let hairShell = null;
  if (S.style !== 'bald') {
    // hair has volume: more at the crown and over the top than at the hairline, so the head is not a cap on an egg
    const shortCut = S.style === 'buzz' || S.style === 'caesar' || S.style === 'bald_fringe';
    const hk = (nx, ny, nz, m, t) => (shortCut ? 0.002 : 0.004) * m * Math.sin(nx * 23 + ny * 17) * Math.sin(nz * 19 - ny * 29) + (shortCut ? 0.006 : 0.026) * m * Math.sin(nx * 6 + ny * 4 + 1) * Math.sin(nz * 5 - ny * 3) + (shortCut ? 0.008 : 0.03) * sstep(0.3, 0.8, m) * sstep(-0.6, 0.2, ny) * sstep(0.2, -0.6, nz) + 1 +   /* 20261030ak: soft lobed hair mass, fuller back/nape, less shard noise */ 0.006 + t * 1.6 * sstep(0, 0.6, m) + (shortCut ? 0.006 : 0.024) * sstep(0.2, 0.85, ny) * sstep(-0.7, 0.3, nz) * sstep(0.2, 0.7, m);
    const hs = sphereGeo(QQ.head[0] + 8, QQ.head[1] + 8, (nx, ny, nz, o) => { shape(nx, ny, nz, o); const { m, t } = hairMask(S.style, nx, ny, nz, fem);
      const k = m > 0.001 ? hk(nx, ny, nz, m, t) : 0.95; o[0] *= k; o[1] *= k; o[2] *= k; return o; });
    hairShell = add(headPivot, hs, hairShellMat(S, q));
    // a loose outer layer of strands: alpha-cut, a few millimetres out, it breaks the outline and the hairline the way real hair does
    if (q !== 'low') {
      const fz = sphereGeo(QQ.head[0] + 8, QQ.head[1] + 8, (nx, ny, nz, o) => { shape(nx, ny, nz, o); const { m, t } = hairMask(S.style, nx, ny, nz, fem);
        const k = m > 0.001 ? hk(nx, ny, nz, m, t) + (shortCut ? 0.004 : 0.009) : 0.95; o[0] *= k; o[1] *= k; o[2] *= k; return o; });
      add(headPivot, fz, hairFuzzMat(S, q), 0, 0, 0, faceFine);
    }
    // 20261030ab: strand cards over the shell (every quality: this is what reads at room distance)
    if (S.style !== 'buzz' && S.style !== 'bald_fringe') {
      const cardG = cached(geoCache, 'hcard', () => new T.PlaneGeometry(1, 1).translate(0, -0.45, 0)), cm = hairCardMat(S);
      let sd = 7 + ((S.hair * 31 + S.skin) % 100000); const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const Z = new T.Vector3(0, 0, 1), n = new T.Vector3(), o = [0, 0, 0], N = S.style === 'caesar' ? 22 : q === 'low' ? 34 : 50;   /* 20261030ak: fewer, wider clumps (mass, not shards) */
      for (let i = 0, tries = 0; i < N && tries < N * 6; tries++) {
        let nx = rr() * 2 - 1, ny = -0.15 + rr() * 1.15, nz = rr() * 2 - 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
        const { m, t } = hairMask(S.style, nx, ny, nz, fem); if (m < 0.7) continue; i++;
        shape(nx, ny, nz, o); const k = hk(nx, ny, nz, m, t) + 0.002;
        const c = add(headPivot, cardG, cm, o[0] * k, o[1] * k, o[2] * k, faceFine);   /* 20261030al: strand cards near only; far silhouette is the soft mass */ c.castShadow = false;
        n.set(o[0], o[1], o[2]).normalize(); c.quaternion.setFromUnitVectors(Z, n);
        const L = ((S.style === 'caesar' ? 0.022 : 0.034) + rr() * 0.028) * (ny > 0.72 ? 0.45 : 1);   /* 20261030ad: short at the crown, no spikes */
        c.rotateZ(Math.atan2(nx, ny) * 0.0 + (rr() - 0.5) * 0.7 + (nz < 0 ? Math.PI : 0) * 0); c.rotateX(-0.06 - rr() * 0.12);   /* 20261030ac: lie flat with the comb, no frizz */
        c.scale.set(0.05 + rr() * 0.03, L * 0.85, 1);
      }
    }
    if (S.style === 'bun') { const b = add(headPivot, earB, hairM, 0, 0.06, -0.1); b.scale.set(0.038, 0.034, 0.034); }
    if (S.style === 'long') { const lg = gb('longhair', () => loft([{ y: 0, w: .085, d: .03 }, { y: -0.08, w: .095, d: .03 }, { y: -0.2, w: .1, d: .025 }, { y: -0.25, w: .085, d: .015 }], seg));
      add(headPivot, lg, hairM, 0, -0.04, -0.07).rotation.x = 0.1; }
  }
  // facial hair: 'stubble' (painted), 'moustache', 'kaiser', 'short', 'full'
  const bd = S.beard;
  if (bd === 'short' || bd === 'full') {
    const full = bd === 'full';
    const bs = sphereGeo(QQ.head[0], QQ.head[1], (nx, ny, nz, o) => { shape(nx, ny, nz, o); const ax = Math.abs(nx);
      let m = sstep(-0.12, -0.32, ny) * sstep(-0.35, 0.1, nz) * sstep(0.98, 0.75, ax);
      m = Math.max(m, sstep(-0.3, -0.36, ny) * sstep(0.05, 0.12, ax) * sstep(0.2, 0.6, nz));
      m *= 1 - G2(nx * 1.1, (ny + 0.47) * 2.2, 0.22) * 0.97 * sstep(0.4, 0.8, nz);
      if (!full) m *= sstep(-0.42, -0.6, ny) + G2(nx, ny + 0.37, 0.18);
      const k = m > 0.05 ? 1 + (full ? 0.05 : 0.03) * m : 0.9; o[0] *= k; o[1] *= k; o[2] *= k; return o; });
    add(headPivot, bs, hairM, 0, 0, 0.0005);
  }
  if (bd === 'moustache' || bd === 'kaiser') {
    const kai = bd === 'kaiser';
    for (const sx of [-1, 1]) {
      const raw = kai ? [[0.015, -0.33, 0], [0.12, -0.355, 0.002], [0.26, -0.39, 0.004], [0.40, -0.36, 0.012], [0.50, -0.24, 0.022], [0.53, -0.10, 0.03], [0.52, 0.0, 0.034]]
        : [[0.015, -0.33, 0], [0.12, -0.35, 0.001], [0.24, -0.39, 0.002], [0.30, -0.44, 0.002]];
      const pts = raw.map(([x, y, out]) => { const p = surf(shape, sx * Math.min(x, 0.45), y, Math.sqrt(Math.max(0.1, 1 - Math.min(x, 0.45) ** 2 - y * y)));
        if (x > 0.45) p.x += sx * (x - 0.45) * 0.07; return p.add(new T.Vector3(sx * out * 0.2, 0, 0.003 + out)); });
      const curve = new T.CatmullRomCurve3(pts), tub = kai ? 28 : 12, rad = 7, base = kai ? 0.0058 : 0.004;
      const tg = new T.TubeGeometry(curve, tub, base, rad); const P = tg.attributes.position;
      for (let i = 0; i <= tub; i++) { const cp = curve.getPointAt(i / tub), tt = i / tub;
        const k = kai ? mix(0.75, 1, sstep(0, 0.25, tt)) * mix(1, 0.12, sstep(0.25, 1, tt)) : mix(1, 0.45, tt);
        for (let j = 0; j <= rad; j++) { const vi = i * (rad + 1) + j; P.setXYZ(vi, cp.x + (P.getX(vi) - cp.x) * k, cp.y + (P.getY(vi) - cp.y) * k * 0.8, cp.z + (P.getZ(vi) - cp.z) * k); } }
      weld(tg); add(headPivot, tg, hairM, 0, 0, 0, faceFine);
    }
  }
  if (S.glasses) {
    const gm = stdMat('frame', { color: 0x151515, roughness: 0.3, metalness: 0.4 }), lens = stdMat('lens', { color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.12 });
    for (const sx of [-1, 1]) { const p = surf(shape, sx * 0.33, 0.1, 0.94);
      const rg = add(headPivot, cached(geoCache, 'gl', () => new T.TorusGeometry(0.019, 0.0013, 6, 24)), gm, p.x, p.y, p.z + 0.012, faceFine); rg.scale.set(1.15, 0.85, 1);
      const ln = add(headPivot, cached(geoCache, 'lens', () => new T.CircleGeometry(0.019, 20)), lens, p.x, p.y, p.z + 0.012, faceFine); ln.scale.set(1.15, 0.85, 1);
      const arm = add(headPivot, cached(geoCache, 'glarm', () => new T.BoxGeometry(0.0018, 0.0018, 0.1)), gm, surf(shape, sx, 0.1, 0.1).x + sx * 0.004, p.y, p.z - 0.045, faceFine); }
    const p = surf(shape, 0, 0.12, 1); add(headPivot, cached(geoCache, 'bridge', () => new T.BoxGeometry(0.016, 0.0018, 0.0018)), gm, 0, p.y, p.z + 0.008, faceFine);
  }
  let skirt = null;
  // --- clothing on torso ---
  const jlen = bottom === 'dress' ? -0.06 : -0.17;
  if (jacket) {
    const jp = tp.filter(a => a[0] <= 0.51).map(a => { const r = ring(a, 1.06, 0.012); const pad = sstep(0.36, 0.43, a[0]) * sstep(0.50, 0.465, a[0]); r.w = Math.max(r.w, mix(r.w, shX + (fem ? 0.022 : 0.03) - 0.05 * sstep(0.44, 0.5, a[0]), pad)); return r; }); jp.push({ y: 0.535, w: 0.072, d: 0.066 }); jp.unshift({ y: jlen, w: tp[0][1] * 1.08 + 0.014, d: tp[0][2] * 1.06 + 0.012 });
    add(torso, gb('jacket' + jlen, () => loft(jp, seg)), suitM);
    // shirt V + lapels
    const vz = (y) => { let a = tp[0]; for (const t of tp) if (t[0] <= y) a = t; return a[2] * 1.06 + 0.012 + (a[3] || 0); };
    const vtop = 0.465, vbot = fem ? 0.2 : 0.17;
    const vMat = (neck === 'necklace' || (fem && neck !== 'bow')) ? skinM : shirtM;
    const closed = neck === 'mandarin';
    const plast = closed ? null : gb('plast' + vbot, () => loft([{ y: vbot, w: 0.004, d: 0.004 }, { y: (vbot + vtop) / 2, w: 0.04, d: 0.008 }, { y: vtop, w: 0.05, d: 0.008 }, { y: vtop + 0.03, w: 0.06, d: 0.02, z: -0.02 }], seg, 2));
    const pl = closed ? { userData: {} } : add(torso, plast, vMat, 0, 0, vz(0.35) - 0.012);
    if (!closed) for (const sx of [-1, 1]) { const lp = add(torso, cached(geoCache, 'lapel', () => new T.BoxGeometry(0.022, 0.24, 0.006)), suitM, sx * 0.04, (vbot + vtop) / 2 + 0.02, vz(0.33) + 0.0); lp.rotation.z = sx * 0.2; lp.rotation.x = -0.1; }
    for (const by of closed ? [0.06, 0.14, 0.22, 0.30, 0.38, 0.46] : [0.06, 0.13]) if (by < vbot || closed) add(torso, cached(geoCache, 'btn', () => new T.CylinderGeometry(0.008, 0.008, 0.004, 10).rotateX(Math.PI / 2)), stdMat('btn', { color: 0x111111, roughness: 0.3 }), 0, by, vz(by) + 0.003, bodyFine);
    if (neck === 'tie') { add(torso, tieGeo(), tieM, 0, 0, vz(0.3) + 0.002); }
    if (neck === 'bow' || neck === 'scarf') { const b = add(torso, earB, tieM, 0, 0.455, vz(0.42) + 0.004); b.scale.set(0.035, 0.015, 0.012); }
    if (neck === 'necklace') { const n = add(torso, cached(geoCache, 'neckl', () => new T.TorusGeometry(0.07, 0.003, 6, 30, Math.PI)), stdMat('pearl', { color: lin(0xf0ece0), roughness: 0.15 }), 0, 0.47, 0.03, bodyFine); n.rotation.set(1.7, 0, Math.PI); }
    pl.userData.v = 1;
  } else {
    if (vest) { const vp = tp.filter(a => a[0] <= 0.42).map(a => ring(a, 1.03, 0.006)); add(torso, gb('vest', () => loft(vp, seg)), suitM); }
    if (neck === 'tie') add(torso, tieGeo(), tieM, 0, 0, 0.125);
    if (neck === 'scarf') { const b = add(torso, cached(geoCache, 'scarf', () => new T.TorusGeometry(0.06, 0.016, 8, 20)), tieM, 0, 0.47, 0.01); b.rotation.x = 1.4; }
  }
  // collar
  const col = add(torso, cached(geoCache, 'collar', () => new T.TorusGeometry(0.06, 0.012, 10, 32)), shirtM, 0, 0.514, 0.0); col.rotation.x = Math.PI / 2 - 0.25;
  // skirt / dress lower
  if (bottom !== 'trousers') {
    // per-person copy: its vertices are skinned to the two thigh bones every frame (see skinSkirt)
    const rings = [{ y: 0.02, w: tp[0][1] * 1.02, d: tp[0][2] * 1.02 }];
    const slen = bottom === 'robe' ? 0.88 : 0.54, flare = bottom === 'robe' ? 0.04 : 0;
    for (let k = 1; k <= 8; k++) { const t = k / 8; rings.push({ y: 0.02 - slen * t, w: mix(0.185, 0.178, t) + 0.012 * Math.sin(t * Math.PI) + flare * t, d: mix(0.128, 0.122, t) + 0.01 * Math.sin(t * Math.PI) + flare * t }); }
    const sk = gb('skirtsrc' + bottom, () => loft(rings, seg)).clone();
    skirt = add(hips, sk, longB ? dressM : suitM); skirt.userData.rest = Float32Array.from(sk.attributes.position.array); skirt.frustumCulled = false;
  }
    // --- arms ---
  const sleeve = jacket ? suitM : shirtM, arms = [];
  for (const sx of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(sx * shX, shoulderY, -0.005); torso.add(sh);
    add(sh, gb('shoulderBall', () => weld(new T.SphereGeometry(0.058, 16, 12))), sleeve, -sx * 0.01, -0.02, 0).scale.set(1.04, 0.8, 1.05);   /* 20261030ak: rounder shoulder */   /* 20261030ag: sloped shoulder */   // a rounded deltoid that caps the sleeve and runs into the shoulder
    add(sh, gb('upArm2', () => limb(0.3, [0.062, 0.055, 0.046, 0.041], seg)), sleeve);
    const el = new T.Group(); el.position.y = -0.30; sh.add(el);
    add(el, gb('elbowBall', () => weld(new T.SphereGeometry(0.042, 12, 10))), sleeve);   /* 20261030al: aj torus fold rings removed (read as diorama parts); sleeve tapers instead */
    add(el, gb('foreArm2', () => limb(0.25, [0.047, 0.04, 0.031], seg)), sleeve);
    const cuff = add(el, cached(geoCache, 'cuff2', () => new T.CylinderGeometry(0.0325, 0.031, 0.024, 16)), shirtM, 0, -0.25, 0);   /* 20261030al: cuff flush on the wrist */   /* 20261030ak: cuff hugs the sleeve end, no floating ring */
    const wr = new T.Group(); wr.position.y = -0.255; el.add(wr);
    // hand
    const palm = add(wr, gb('palm', () => loft([{ y: 0.01, w: .022, d: .016 }, { y: -0.03, w: .040, d: .016 }, { y: -0.085, w: .042, d: .013 }, { y: -0.095, w: .035, d: .011 }], 12, 2.6)), skinM);
    palm.rotation.y = sx * Math.PI / 2;
    const fingers = [];
    if (QQ.fingers) {
      const fg = cached(geoCache, 'finger', () => limb(0.075, [0.0085, 0.008, 0.007, 0.006], 8));
      for (let k = 0; k < 4; k++) { const f = new T.Group(); f.position.set(0, -0.09, (k - 1.5) * 0.019); f.rotation.y = 0; wr.add(f);
        const m = add(f, fg, skinM, 0, 0, 0, faceFine); m.scale.set(1.32, [0.9, 1, 0.97, 0.78][k] * 1.05, 1.25); f.rotation.x = -0.35 - 0.12 * k; f.position.z *= 0.96;   /* 20261030al: relaxed curled digits, not splayed */   /* 20261030aj: distinct splayed digits */   /* 20261030ah: thicker fingers read as fingers, not nubs */ f.rotation.z = -sx * 0.12; fingers.push(f); }
      const th = new T.Group(); th.position.set(sx * -0.0, -0.03, 0.03); th.rotation.set(-0.6, 0, -sx * 0.3); wr.add(th);
      add(th, fg, skinM, 0, 0, 0, faceFine).scale.set(1.15, 0.75, 1.15); fingers.push(th);
    }
    sh.rotation.z = sx * 0.1; el.rotation.x = -0.12;
    arms.push({ sh, el, wr, fingers, sx });
  }
  // --- legs ---
  const legs = [], legM = bottom === 'trousers' ? suitM : hoseM;
  for (const sx of [-1, 1]) {
    const hp = new T.Group(); hp.position.set(sx * legX, -0.03, 0); hips.add(hp);
    add(hp, gb('thigh' + bottom, () => limb(0.45, bottom === 'trousers' ? [0.085, 0.08, 0.068, 0.058] : [0.075, 0.068, 0.055, 0.045], seg)), legM);
    const kn = new T.Group(); kn.position.y = -0.45; hp.add(kn);
    add(kn, gb('knee' + bottom, () => weld(new T.SphereGeometry(bottom === 'trousers' ? 0.056 : 0.045, 12, 10))), legM);
    add(kn, gb('shin' + bottom, () => limb(0.43, bottom === 'trousers' ? [0.056, 0.054, 0.05, 0.052] : [0.045, 0.05, 0.036, 0.03], seg)), legM);
    const an = new T.Group(); an.position.y = -0.43; kn.add(an);
    const shoe = add(an, gb('shoe' + (fem ? 'f' : 'm'), () => fem
      ? loft([{ y: -0.02, w: .03, d: .028, z: -0.01 }, { y: -0.05, w: .036, d: .11, z: 0.035 }, { y: -0.062, w: .036, d: .115, z: 0.035 }], 14, 3)
      : loft([{ y: 0.0, w: .04, d: .05, z: 0.0 }, { y: -0.045, w: .05, d: .135, z: 0.045 }, { y: -0.075, w: .052, d: .14, z: 0.045 }], 16, 3.2)), shoeM);
    if (fem) add(an, cached(geoCache, 'heel', () => new T.BoxGeometry(0.014, 0.05, 0.014)), shoeM, 0, -0.06, -0.06);
    legs.push({ hp, kn, an, sx });
  }
  if (fem) hips.position.y += 0.012;   // heels

  // ---------- dress code: uniform extras, or the home-state lapel pin ----------
  const frontZ = (y) => { let a = tp[0]; for (const t of tp) if (t[0] <= y) a = t; return a[2] * (jacket ? 1.06 : 1) + (jacket ? 0.012 : vest ? 0.006 : 0) + (a[3] || 0); };
  const U = S.uniform, solid = (hex, rough = 0.5, metal = 0) => stdMat('u' + hex + '|' + rough + '|' + metal, { color: lin(hex), roughness: rough, metalness: metal });
  const goldM = solid(0xd4a64a, 0.3, 1);
  if (U) {
    const accM = clothMat(U.accent, q, 'suit_wool', 3), trimM = U.trim === 0xd4a64a ? goldM : solid(U.trim, 0.35, 0.5);
    const sash = (col, tube = 0.014) => { const m = add(torso, cached(geoCache, 'sash' + tube, () => new T.TorusGeometry(0.205, tube, 4, 48).rotateX(Math.PI / 2)), col, 0, 0.27, 0.0);
      m.scale.set(1.0, 1, 0.68); m.rotation.z = 0.62; return m; };
    const medals = (n) => { for (let k = 0; k < n; k++) { const x = 0.065 + (k % 3) * 0.022, y = 0.345 - Math.floor(k / 3) * 0.05;
      add(torso, cached(geoCache, 'ribbon', () => new T.BoxGeometry(0.016, 0.014, 0.003)), solid([U.accent, U.trim, U.dark][k % 3], 0.6), x, y + 0.014, frontZ(y) + 0.004, bodyFine);
      add(torso, cached(geoCache, 'medal', () => new T.CylinderGeometry(0.0075, 0.0075, 0.0025, 14).rotateX(Math.PI / 2)), goldM, x, y - 0.002, frontZ(y) + 0.005, bodyFine); } };
    const epaulettes = (fringe) => { for (const sx of [-1, 1]) { const e = add(torso, cached(geoCache, 'epau', () => new T.BoxGeometry(0.075, 0.012, 0.06)), trimM, sx * (shX - 0.005), 0.488, -0.005); e.rotation.z = -sx * 0.18;
      if (fringe) { const f = add(torso, cached(geoCache, 'fringe', () => new T.CylinderGeometry(0.036, 0.034, 0.03, 12, 1, true)), trimM, sx * (shX + 0.03), 0.465, -0.005); f.scale.set(0.35, 1, 1); } } };
    const belt = () => { const b = add(torso, cached(geoCache, 'belt', () => new T.TorusGeometry(0.19, 0.013, 4, 40).rotateX(Math.PI / 2)), solid(0x1a1410, 0.4), 0, 0.03, 0.0); b.scale.set(1, 1, 0.66);
      add(torso, cached(geoCache, 'buckle', () => new T.BoxGeometry(0.03, 0.024, 0.006)), goldM, 0, 0.03, frontZ(0.03) + 0.01); };
    const capMat = U.style === 'military' ? clothMat(U.main, q) : accM;
    if (U.style === 'court') { sash(accM); medals(fem ? 3 : 5); }
    if (U.style === 'military') { epaulettes(true); medals(4); belt();
      add(headPivot, cached(geoCache, 'capcrown', () => new T.CylinderGeometry(0.104, 0.086, 0.06, 28)), capMat, 0, 0.095, -0.004);
      add(headPivot, cached(geoCache, 'capband', () => new T.CylinderGeometry(0.0875, 0.0875, 0.018, 28)), accM, 0, 0.07, -0.004);
      const v = add(headPivot, cached(geoCache, 'visor', () => new T.CircleGeometry(0.088, 20, 0, Math.PI).rotateX(-Math.PI / 2)), solid(0x0d0d0f, 0.15), 0, 0.063, 0.0); v.scale.set(1, 1, 0.75); v.rotation.x = 0.18;
      add(headPivot, cached(geoCache, 'capbadge', () => new T.CylinderGeometry(0.011, 0.011, 0.004, 12).rotateX(Math.PI / 2)), goldM, 0, 0.09, 0.098); }
    if (U.style === 'tunic') { belt();
      add(torso, cached(geoCache, 'mandarin', () => new T.CylinderGeometry(0.064, 0.066, 0.04, 24, 1, true)), suitM, 0, 0.515, 0.0);
      const starG = cached(geoCache, 'starshape', () => { const s = new T.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.0038 : 0.0095; i ? s.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, -Math.sin(a) * r); } return new T.ShapeGeometry(s); });
      for (const sx of [-1, 1]) { const st2 = add(torso, starG, solid(U.accent === U.main ? 0xd4a64a : U.accent, 0.4, 0.3), sx * 0.048, 0.515, 0.045, faceFine); st2.rotation.y = sx * 0.75; }
      for (const sx of [-1, 1]) add(torso, cached(geoCache, 'pocket', () => new T.BoxGeometry(0.06, 0.012, 0.004)), suitM, sx * 0.08, 0.37, frontZ(0.37) + 0.003);
      add(headPivot, cached(geoCache, 'softcap', () => new T.CylinderGeometry(0.095, 0.088, 0.05, 24)), accM === suitM ? suitM : clothMat(U.main, q), 0, 0.09, -0.004); }
    if (U.style === 'robe') {
      for (const sx of [-1, 1]) { const st2 = add(torso, cached(geoCache, 'stole', () => new T.BoxGeometry(0.045, 1.25, 0.006)), accM, sx * 0.055, -0.15, 0.142); st2.rotation.z = -sx * 0.03; st2.rotation.x = -0.02; }
      const sc2 = add(torso, cached(geoCache, 'stolecol', () => new T.TorusGeometry(0.075, 0.016, 6, 24)), accM, 0, 0.5, 0.01); sc2.rotation.x = 1.35;
      const cap = add(headPivot, cached(geoCache, 'skullcap', () => weld(new T.SphereGeometry(0.09, 20, 8, 0, Math.PI * 2, 0, 0.9))), accM, 0, 0.035, -0.01); cap.scale.set(1, 0.9, 1.05);
      const cr = add(torso, cached(geoCache, 'pect', () => new T.BoxGeometry(0.012, 0.06, 0.004)), goldM, 0, 0.3, frontZ(0.3) + 0.014, bodyFine);
      add(torso, cached(geoCache, 'pectb', () => new T.BoxGeometry(0.04, 0.012, 0.004)), goldM, 0, 0.31, frontZ(0.3) + 0.015, bodyFine); }
    if (U.style === 'sleek') { for (const sx of [-1, 1]) add(torso, cached(geoCache, 'piping', () => new T.BoxGeometry(0.005, 0.5, 0.004)), solid(U.accent, 0.3, 0.2), sx * 0.075, 0.18, frontZ(0.18) + 0.006); }
    if (U.style === 'tribal') { sash(accM, 0.03);
      const bd2 = add(torso, cached(geoCache, 'beads', () => new T.TorusGeometry(0.085, 0.009, 6, 18)), trimM, 0, 0.49, 0.02); bd2.rotation.x = 1.3;
      const hb = add(headPivot, cached(geoCache, 'headband', () => new T.TorusGeometry(0.085, 0.008, 6, 32)), accM, 0, 0.055, -0.004); hb.rotation.x = Math.PI / 2; hb.scale.set(1.0, 1.18, 1); }
    if (U.style === 'consular') { epaulettes(false); sash(solid(0xf3e6c4, 0.6), 0.011);
      const bt = add(torso, cached(geoCache, 'badge', () => new T.CircleGeometry(0.03, 24)), badgeMat(U), 0.085, 0.35, frontZ(0.35) + 0.008, faceFine); bt.rotation.y = 0.18; }
    if (U.style === 'civic' && U.flag) addPin(U.flag);
  } else if (opts.homeFlag) addPin(opts.homeFlag);
  function addPin(src) {
    const tex = pinTexture(src), lapel = !!jacket && neck !== 'mandarin';
    const g = new T.Group();
    if (lapel) { const y = 0.39; g.position.set(0.055, y, frontZ(y) + 0.008); g.rotation.set(-0.12, 0.25, 0.2); }
    else { const y = fem ? 0.37 : 0.36; g.position.set(0.075, y, frontZ(y) + (fem ? 0.012 : 0.004)); g.rotation.set(-0.15, 0.3, 0); }
    torso.add(g);
    add(g, cached(geoCache, 'pinback', () => new T.BoxGeometry(0.034, 0.022, 0.003)), goldM, 0, 0, -0.0005, faceFine);
    add(g, cached(geoCache, 'pinface', () => new T.PlaneGeometry(0.03, 0.0185)), pinMat(tex), 0, 0, 0.0012, faceFine);
    root.userData.pin = g;
  }

  // --- far proxy (LOD 3): one merged vertex-coloured mesh ---
  const proxy = buildProxy(S, bottom, jacket, false), proxySit = buildProxy(S, bottom, jacket, true);
  body.add(proxy); body.add(proxySit); proxy.visible = proxySit.visible = false;
  // contact shadow-ish disc is left to the game (it has its own)

  // ---------- animation ----------
  const rr = mulberry32(S.blinkSeed);
  const st = { sit: 0, sitSide: 0, t: S.phase, walk: 0, ph: 0, blink: 0, nextBlink: 1 + rr() * 3, jaw: 0, gest: 0, lod: -1, browUp: 0, lookYaw: 0, lookPitch: 0, talkT: 0 };
  const browMeshes = []; headPivot.children.forEach(c => { if (c.userData.browSide) browMeshes.push(c); });
  const v3 = new T.Vector3();
  // Linear-blend skinning of the skirt to the two thigh bones (+ hips, implicit): weight by height below the
  // waist and by side (x), rotation about each hip's X axis through the hip joint. Legs therefore never poke out.
  const skirtSnap = { a: 1e9, b: 1e9 };
  function skinSkirt() {
    const aL = legs[0].hp.rotation.x, aR = legs[1].hp.rotation.x;
    if (Math.abs(aL - skirtSnap.a) < 1e-3 && Math.abs(aR - skirtSnap.b) < 1e-3) return; skirtSnap.a = aL; skirtSnap.b = aR;
    const P = skirt.geometry.attributes.position, R0 = skirt.userData.rest, py = -0.03;
    const cL = Math.cos(aL), sL = Math.sin(aL), cR = Math.cos(aR), sR = Math.sin(aR), sitk = st.sit;
    for (let i = 0; i < P.count; i++) { const x = R0[i * 3], y = R0[i * 3 + 1], z = R0[i * 3 + 2];
      const wd = sstep(0.0, -0.16, y), wl = sstep(0.07, -0.07, x), wr = 1 - wl, yy = y - py;
      // seated: the back panel stays under the seat line instead of swinging up
      const back = z < 0 ? sitk * sstep(0, -0.08, z) * 0.85 : 0, w = wd * (1 - back);
      const yl = yy * cL - z * sL, zl = yy * sL + z * cL, yr = yy * cR - z * sR, zr = yy * sR + z * cR;
      let ny = mix(yy, wl * yl + wr * yr, w) + py, nz = mix(z, wl * zl + wr * zr, w);
      if (back > 0) { ny = Math.max(ny, py - 0.1); }
      P.setXYZ(i, x * (1 + 0.06 * sitk * wd), ny, nz); }
    P.needsUpdate = true; skirt.geometry.computeVertexNormals();
  }
  function setLod(l) {
    if (l === st.lod) return; st.lod = l;
    rig.visible = l < 3; proxy.visible = l >= 3 && st.sit < 0.5; proxySit.visible = l >= 3 && st.sit >= 0.5;
    for (const m of faceFine) m.visible = l <= 1 || (l === 2 && m.material === hairM);
    for (const m of bodyFine) m.visible = l === 0;
  }
  function update(dt, state = {}) {
    dt = Math.min(dt || 0, 0.1); st.t += dt;
    // LOD by camera distance
    let d = state.camDist;
    const cam = state.camera, viewCam = cam && cam.isPerspectiveCamera && !(cam.fov === 90 && cam.aspect === 1);
    if (d == null && viewCam) { root.getWorldPosition(v3); cam.getWorldPosition(st.cw || (st.cw = new T.Vector3())); d = v3.distanceTo(st.cw); }
    if (d == null && cam && !viewCam && st.lod >= 0) d = st.lastD;   // keep the last view-camera LOD
    if (d != null) st.lastD = d;
    const lodD = opts.lodDistances || [3.5, 10, 30];
    const hy = (i) => lodD[i] * (st.lod > i ? 0.92 : 1.0);   // 8% hysteresis: no flicker at a band edge
    setLod(state.lod != null ? state.lod : d == null ? (st.lod < 0 ? 0 : st.lod) : d < hy(0) ? 0 : d < hy(1) ? 1 : d < hy(2) ? 2 : 3);
    const sitT = state.sitting ? 1 : 0; st.sit += (sitT - st.sit) * Math.min(1, dt * 2.6);   // lowering into a chair or rising takes most of a second if (dt === 0 || state.snap) st.sit = sitT;
    if (st.lod >= 3) { const sp = st.sit >= 0.5; if (proxySit.visible !== sp) { proxySit.visible = sp; proxy.visible = !sp; } return; }
    const sit = st.sit, seatH = state.seatHeight ?? 0.46, desk = state.desk ? 1 : 0;
    const speed = sit > 0.5 ? 0 : state.speed != null ? state.speed : (state.moving ? 1.35 : 0);
    st.walk += (clamp(speed / 1.35, 0, 1.6) - st.walk) * Math.min(1, dt * 6);
    // planted gait: given the body's real ground speed (state.velocity, m/s), each foot locks to the floor through its stance
    // and swings to the next footfall; hip and knee come from two-bone IK. The cycle runs at the rate the ground passes.
    const vel = state.velocity, planted = vel != null && sit < 0.5;
    if (planted) {
      if (!st.sc) { const s3 = new T.Vector3(); root.updateMatrixWorld(true); rig.getWorldScale(s3); st.sc = s3.z || 1; }
      const turn = Math.abs(state.turn || 0), pivot = vel < 0.12 ? clamp((turn - 0.5) / 1.2) : 0;   // turning on the spot: step round, do not spin on frozen feet
      st.pivot = (st.pivot || 0) + (pivot - (st.pivot || 0)) * Math.min(1, dt * 6);
      const vEff = Math.max(vel, 0.32 * st.pivot), vL = Math.max(0, vEff) / st.sc, stepL = (0.40 + 0.22 * Math.min(1.6, Math.max(0, vEff))) / st.sc;
      st.SL = 2 * stepL; st.sweep = vEff > 1e-3 ? clamp(Math.max(0, vel) / vEff) : 1; if (vL > 0.02) st.ph += dt * vL / st.SL * Math.PI * 2;
    } else st.ph += dt * (speed > 0.05 ? speed / 1.25 * Math.PI * 2 * 0.5 : 0);
    const w = Math.min(1, st.walk), ph = st.ph, t = st.t;
    const breath = Math.sin(t * 1.5); const pz = S.phase || 0, PV1 = Math.sin(pz * 1.7), PV2 = Math.sin(pz * 2.3 + 1), PV3 = Math.sin(pz * 3.1 + 2), PV4 = Math.sin(pz * 0.7 + 3), iw = 1 - w;   /* 20261030ah: per-person stance */
    // gesture target
    const gT = state.gesture === true ? 1 : typeof state.gesture === 'number' ? state.gesture : state.gesture ? 1 : (state.talking ? 0.35 + 0.35 * Math.max(0, Math.sin(t * 0.7)) : 0);
    st.gest += (gT * (1 - w * 0.7) - st.gest) * Math.min(1, dt * 3);
    const gs = st.gest;
    // hips & torso
    hips.position.y = hipY + (fem ? 0.012 : 0) - w * 0.012 + Math.abs(Math.cos(ph)) * 0.022 * w;
    hips.position.x = (1 - w) * Math.sin(t * 0.35) * 0.012;
    hips.rotation.y = Math.sin(ph) * 0.09 * w; hips.rotation.z = (1 - w) * Math.sin(t * 0.35) * 0.02;
    torso.rotation.y = -Math.sin(ph) * 0.13 * w; torso.rotation.x = 0.04 * w + breath * 0.008;
    torso.scale.set(1 + breath * 0.006, 1, 1 + breath * 0.01); hips.position.x += iw * 0.024 * PV1; hips.rotation.z += iw * 0.045 * PV1; torso.rotation.z = -iw * 0.035 * PV1; torso.rotation.x += iw * 0.05 * PV2; torso.scale.x *= 1 + 0.05 * PV3; hips.position.x += iw * 0.009 * Math.sin(t * 0.23 + pz); torso.rotation.y += iw * 0.03 * Math.sin(t * 0.17 + pz * 2); torso.rotation.x += breath * 0.007;   /* 20261030ai: idle sway + breath */   /* 20261030ah: weight shift, slouch, chest width */
    // legs
    if (planted) {
      const duty = 0.62, SLf = duty * (st.SL || 1), A = 0.45, Bn = 0.43, yA = 0.04 + (fem ? 0.012 : 0), hipJ = hips.position.y - 0.03, ramp = clamp(Math.max(0, vel, 0.32 * (st.pivot || 0)) / 0.12);   // the stride fades with the real speed, so a slow walk still plants its feet
      for (const L of legs) { const s = L.sx < 0 ? 1 : -1;
        let u = ((ph - Math.PI / 2) / (Math.PI * 2) + (s > 0 ? 0 : 0.5)) % 1; if (u < 0) u += 1;
        let zf, yf, toe = 0;
        if (u < duty) { zf = SLf / 2 - SLf * (u / duty); yf = yA; }                               // stance: the foot stays where it landed
        else { const q = (u - duty) / (1 - duty), e = q * q * (3 - 2 * q); zf = -SLf / 2 + SLf * e; yf = yA + 0.065 * Math.sin(Math.PI * q); toe = 0.35 * Math.sin(Math.PI * Math.min(1, q * 1.6)) * (1 - q); }  // swing: lift, carry forward, set down
        zf *= ramp * (st.sweep != null ? st.sweep : 1); yf = mix(yA, yf, ramp); toe *= ramp;   // stepping in place lifts the feet without sweeping them
        const dz = zf, dy = yf - hipJ, d = clamp(Math.hypot(dz, dy), 0.25, A + Bn - 1e-4);
        const phi = Math.atan2(dz, -dy), beta = Math.acos(clamp((A * A + d * d - Bn * Bn) / (2 * A * d), -1, 1)), kappa = Math.PI - Math.acos(clamp((A * A + Bn * Bn - d * d) / (2 * A * Bn), -1, 1));
        L.hp.rotation.x = -(phi + beta); L.kn.rotation.x = kappa; L.an.rotation.x = (phi + beta) - kappa + toe; L.hp.rotation.z = -hips.rotation.z; }
    } else for (const L of legs) { const s = L.sx < 0 ? 1 : -1, a = Math.sin(ph) * s;
      L.hp.rotation.x = -a * 0.42 * w + (1 - w) * (L.sx < 0 ? 0.02 : -0.02) * Math.sin(t * 0.35);
      L.kn.rotation.x = Math.max(0, Math.cos(ph) * s) * 0.9 * w + 0.03;
      L.an.rotation.x = -L.hp.rotation.x - L.kn.rotation.x + (Math.max(0, -Math.cos(ph) * s)) * 0.15 * w; L.hp.rotation.z = -hips.rotation.z; }
    // arms
    for (const A of arms) { const s = A.sx < 0 ? -1 : 1, swing = Math.sin(ph) * s * 0.38 * w;
      let shx = swing + Math.sin(t * 0.6 + A.sx) * 0.015, shz = A.sx * (0.07 + 0.01 * B), elx = -0.12 - 0.25 * w * Math.max(0, -swing * 2) - 0.05;
      shz += iw * A.sx * 0.035 * (1 + PV4); elx -= iw * 0.18 * (1 + (A.sx > 0 ? PV3 : PV2));   /* 20261030ah: arm rest variety */
      const C = state.carry && state.carry.side === A.sx && sit < 0.5 ? state.carry : null;   // a hand that holds something is posed for it
      if (C) {
        const sip = clamp(C.sip || 0);
        if (C.pose === 'briefcase') { shx = swing * 0.35; shz = A.sx * 0.11; elx = -0.05; }
        else if (C.pose === 'folder') { shx = -0.08 + swing * 0.3; shz = A.sx * 0.05; elx = -0.38; }
        else if (C.pose === 'notebook') { shx = -0.48; shz = -A.sx * 0.26; elx = -1.42; }   // held open in front of the chest
        else if (C.pose === 'cup') { shx = mix(-0.24, -0.98, sip); shz = -A.sx * mix(0.08, 0.62, sip); elx = mix(-1.42, -2.32, sip); }   // all the way to the mouth
        else if (C.pose === 'phone') { shx = -0.52; shz = -A.sx * 0.16; elx = -1.62; }
        A.wr.rotation.set(C.pose === 'cup' ? -(shx + elx) : C.pose === 'phone' ? -(shx + elx) * 0.4 + 0.5 : 0, 0, 0);   // the wrist keeps a cup level all the way to the mouth
      } else if (A.sx > 0 && gs > 0.01) {  // right arm gestures
        const osc = Math.sin(t * 3.1) * 0.25 + Math.sin(t * 1.7) * 0.15;
        shx = mix(shx, -0.55 + osc * 0.3, gs); shz = mix(shz, 0.35 + osc * 0.15, gs); elx = mix(elx, -1.25 - osc * 0.35, gs);
        A.wr.rotation.y = mix(0, -0.9, gs); A.wr.rotation.z = mix(0, 0.5 + osc * 0.3, gs);
      } else { A.wr.rotation.set(0, 0, 0); }
      A.sh.rotation.x = shx; A.sh.rotation.z = shz; A.el.rotation.x = elx;
      const grip = C ? (C.pose === 'briefcase' ? -1.25 : -0.9) : null;   // fingers close round a handle or a cup
      for (let k = 0; k < A.fingers.length - 1; k++) A.fingers[k].rotation.x = grip != null ? grip : -0.55 - 0.1 * k - (A.sx > 0 ? -gs * 0.2 : 0.15); }
    // sitting: thighs forward, shins down to the floor, hands on lap or desk (blended by st.sit)
    if (sit > 0.001) {
      const hipSit = seatH / (body.scale.y * root.scale.y) + 0.115, kh = hipSit - 0.03, L = 0.505, phi = Math.acos(clamp(kh / L, -1, 1));
      hips.position.y = mix(hips.position.y, hipSit, sit); hips.position.x *= 1 - sit; hips.rotation.y *= 1 - sit; hips.rotation.z *= 1 - sit;
      torso.rotation.x = mix(torso.rotation.x, mix(-0.06, 0.12, desk), sit);
      for (const Lg of legs) { const spread = Lg.sx * 0.06;
        Lg.hp.rotation.x = mix(Lg.hp.rotation.x, -Math.PI / 2, sit); Lg.hp.rotation.z = mix(Lg.hp.rotation.z, 0, sit); Lg.hp.rotation.y = spread * sit;
        Lg.kn.rotation.x = mix(Lg.kn.rotation.x, Math.PI / 2 - phi, sit); Lg.an.rotation.x = mix(Lg.an.rotation.x, -(-Math.PI / 2 + Math.PI / 2 - phi), sit); }
      for (const Ar of arms) { const g = Ar.sx > 0 ? st.gest : 0;
        Ar.sh.rotation.x = mix(Ar.sh.rotation.x, mix(mix(-0.32, -0.62, desk), Ar.sh.rotation.x, g), sit);
        Ar.sh.rotation.z = mix(Ar.sh.rotation.z, mix(Ar.sx * 0.12, Ar.sh.rotation.z, g), sit);
        Ar.el.rotation.x = mix(Ar.el.rotation.x, mix(mix(-1.05, -1.0, desk), Ar.el.rotation.x, g), sit); }
    } else for (const Lg of legs) Lg.hp.rotation.y = 0;
    if (skirt && st.lod <= 2) skinSkirt();
    // head look
    let ly = state.lookYaw || 0, lp = state.lookPitch || 0;
    if (state.lookAt) { headPivot.updateMatrixWorld(); root.worldToLocal(v3.copy(state.lookAt)); ly = clamp(Math.atan2(v3.x, v3.z), -1.1, 1.1); lp = clamp(-Math.atan2(v3.y - 1.6 / body.scale.y, Math.hypot(v3.x, v3.z)), -0.5, 0.5); }
    st.lookYaw += (ly - st.lookYaw) * Math.min(1, dt * 4); st.lookPitch += (lp - st.lookPitch) * Math.min(1, dt * 4);
    neckG.rotation.y = st.lookYaw * 0.4; head.rotation.y = st.lookYaw * 0.6 + Math.sin(t * 0.43) * 0.04;
    head.rotation.x = st.lookPitch + Math.sin(t * 0.31) * 0.02 - torso.rotation.x + (state.talking ? Math.sin(t * 2.3) * 0.035 : 0);
    head.rotation.z = Math.sin(t * 0.27) * 0.025 + 0.05 * PV2; head.rotation.y += 0.2 * PV4 * (state.lookAt ? 0.3 : 1);   /* 20261030ah: head tilt/turn variety */ head.rotation.y += 0.05 * Math.sin(t * 0.13 + pz * 3); head.rotation.x += 0.015 * Math.sin(t * 0.21 + pz);   /* 20261030ai: fidget */
    if (st.lod > 1) return;
    // blink
    st.nextBlink -= dt; if (st.nextBlink <= 0) { st.blink = 0.14; st.nextBlink = 2 + rr() * 4; }
    st.blink = Math.max(0, st.blink - dt); const bl = st.blink > 0 ? Math.sin((1 - st.blink / 0.14) * Math.PI) : 0;
    for (const l of lids) l.rotation.x = l.userData.up > 0 ? mix(-0.24 + S.face.lidDrop, 0.4, bl) + st.lookPitch * 0.3 : mix(0.37, 0.3, bl);   // resting lids cover the top of the iris and meet the bottom of it: an almond, not a stare
    for (const e of eyes) { e.rotation.y = st.lookYaw * 0.3; e.rotation.x = st.lookPitch * 0.4; }
    // speech
    let jt = 0;
    if (state.talking) { st.talkT += dt; const s1 = Math.sin(st.talkT * 13.1), s2 = Math.sin(st.talkT * 7.3 + 1), s3 = Math.sin(st.talkT * 3.1);
      jt = clamp(0.45 + 0.35 * s1 * s2 + 0.25 * s3) * (Math.sin(st.talkT * 1.3) > -0.85 ? 1 : 0); }
    st.jaw += (jt - st.jaw) * Math.min(1, dt * 18);
    const j = st.jaw;
    lipL.position.y = mp.y - 0.0042 - j * 0.007; lipU.position.y = mp.y + 0.0036 + j * 0.0012;
    mouthIn.scale.y = 0.0015 + j * 0.0065; teeth.position.y = mp.y + 0.0005 + j * 0.0004;
    lipU.scale.x = 0.0225 * S.face.mouthW * (1 - j * 0.15); lipL.scale.x = 0.0205 * S.face.mouthW * (1 - j * 0.12);
    const bu = state.talking ? Math.max(0, Math.sin(st.talkT * 0.9)) * 0.0025 : 0;
    st.browUp += (bu - st.browUp) * Math.min(1, dt * 5); for (const b of browMeshes) b.position.y = st.browUp;
  }
  setLod(0);
  update(0, {});
  root.userData = { pin: root.userData.pin || null, opts: opts0, THREE, uniform: S.uniform || null, onum: true, H: S.height, spec: S, update, setLod, meshCount: meshes.length + 1, parts: { hips, torso, head, arms, legs, wrists: arms.map(a => ({ sx: a.sx, wr: a.wr })) } };
  const handle = { group: root, update, spec: S, setLod, uniform: S.uniform || null, dispose: () => disposeCharacter(root) }; root.userData.handle = handle; return handle;
}

function buildProxy(S, bottom, jacket, sitting) {
  const parts = [], H = new T.Color();
  const put = (geo, hex, x, y, z) => { geo.translate(x, y, z); const c = lin(hex), n = geo.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } geo.setAttribute('color', new T.BufferAttribute(col, 3)); parts.push(geo.index ? geo.toNonIndexed() : geo); };
  const legC = bottom === 'trousers' ? S.suit : hexMix(S.skin, 0x2a1d18, 0.25);
  const dy = sitting ? 0.575 - 0.95 : 0;   // seated: pelvis at 0.575 (seat 0.46)
  if (!sitting) { put(new T.CylinderGeometry(0.065, 0.05, 0.9, 6), legC, -0.09, 0.47, 0); put(new T.CylinderGeometry(0.065, 0.05, 0.9, 6), legC, 0.09, 0.47, 0); }
  else for (const x of [-0.09, 0.09]) { put(new T.CylinderGeometry(0.07, 0.06, 0.45, 6).rotateX(Math.PI / 2), bottom === 'trousers' ? legC : S.suit, x, 0.545, 0.22);
    put(new T.CylinderGeometry(0.05, 0.045, 0.5, 6), legC, x, 0.27, 0.43); }
  if (bottom !== 'trousers' && !sitting) put(new T.CylinderGeometry(0.17, 0.19, 0.5, 8), S.suit, 0, 0.72, 0);
  put(new T.CylinderGeometry(0.19, 0.16, 0.6, 8), jacket ? S.suit : S.shirt, 0, 1.18 + dy, 0);
  put(new T.CylinderGeometry(0.045, 0.04, 0.6, 5), jacket ? S.suit : S.shirt, -0.21, 1.15 + dy, 0); put(new T.CylinderGeometry(0.045, 0.04, 0.6, 5), jacket ? S.suit : S.shirt, 0.21, 1.15 + dy, 0);
  put(new T.SphereGeometry(0.1, 8, 6), S.skin, 0, 1.63 + dy, 0.01); put(new T.SphereGeometry(0.105, 8, 4, 0, Math.PI * 2, 0, 1.4), S.hair, 0, 1.65 + dy, -0.01);
  let n = 0; for (const g of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
  const m = new T.Mesh(geo, stdMat('proxy', { vertexColors: true, roughness: 0.8 })); m.castShadow = true; m.userData.proxy = true; return m;
}

// Map a session.html person look (p.look from rollLook) to makeCharacter options.
export function optionsFromLook(L, extra = {}) {
  const styles = ['short', 'side_part', 'bun', 'receding', 'long', 'curls', 'caesar'];
  const fem = L.frame === 'fem';
  // game style index (session.html buildPerson hs): 0 short, 1 side part, 2 pinned-up, 3 thinning, 4 long, 5 curls, 6 caesar
  let style = styles[(L.style | 0) % styles.length]; if (fem && (style === 'receding' || style === 'caesar')) style = 'bob'; if (!fem && style === 'bun') style = 'short';
  const cl = (v, a = 0.7, b = 1.3) => v == null || isNaN(v) ? undefined : Math.min(b, Math.max(a, +v));
  const face = {}; const put = (k, v) => { if (v !== undefined) face[k] = v; };
  put('faceW', cl(L.faceW)); put('jaw', cl(L.jawW)); put('brow', cl(L.browH) != null ? (cl(L.browH) - (fem ? 0.3 : 0.05)) : undefined);
  put('nose', cl(L.noseL)); put('lip', cl(L.lipF)); put('cheek', cl(L.cheek));
  return { face: Object.keys(face).length ? face : undefined, seed: extra.seed ?? Math.round((L.height * 1e4 + L.build * 1e3 + (L.skin || 0)) % 2147483647), sex: fem ? 'f' : 'm', age: L.age, skin: L.skin, build: L.build,
    height: L.height, outfit: L.wear, hair: style, hairColor: L.hair, suitColor: L.suit, shirtColor: L.shirt, eye: L.eye, glasses: !!L.glasses, beard: !!L.beard, ...extra };
}

// ---------- game-rig dress (fallback: NEPTUNE.fullFigure = false, 20261012u) ----------
// The full Neptune figure is authored to its own proportions (torso half-width = the arm line, a separate head
// sculpt, its own hair shell) and cannot be fitted reliably over session.html's skinned rig, so the game keeps its
// own figure (its face, hair, tailoring, LOD tiers) and Neptune only (1) re-colours the clothes for a decreed
// uniform via uniformLook() before the game builds the person, and (2) adds the uniform insignia and the lapel pin
// as small overlays parented to the game's bones (dressGameRig). Placement is measured from the built rig
// (surface ray-casts), so it follows height, build and frame without hard-coded offsets.
const UNI_WEAR = { court: ['suit_tie', 'skirt_suit'], military: ['suit_tie', 'trouser_suit'], tunic: ['suit_tie', 'trouser_suit'],
  robe: ['suit_open', 'dress_jacket'], sleek: ['suit_open', 'trouser_suit'], tribal: ['suit_open', 'dress_jacket'],
  consular: ['suit_tie', 'skirt_suit'], civic: ['suit_tie', 'skirt_suit'] };
// lift very dark uniform cloth so it still reads as cloth (folds, seams) under the game's night lighting / ACES
function liftCloth(h, minLum = 0.17) { let l = lumOf(h), k = 0; while (l < minLum && k < 12) { h = hm(h, 0xb8b4ac, 0.08); l = lumOf(h); k++; } return h; }
export function uniformLook(look, uniform) {
  if (!look || !uniform) return look;
  const fem = look.frame === 'fem', U = resolveUniform(uniform, fem); if (!U) return look;
  const w = (UNI_WEAR[U.style] || UNI_WEAR.civic)[fem ? 1 : 0];
  return { ...look, suit: liftCloth(U.main), shirt: U.style === 'sleek' ? liftCloth(U.shirt, 0.12) : U.shirt, wear: w, _nepUniform: U.style };
}
export function dressGameRig(THREE, g, o = {}) {
  T = THREE; MODE = 'game'; matCache = matCaches[MODE];
  const u = g && g.userData; if (!u || !u.spine) return null;
  const old = g.getObjectByName('nep-dress'); if (old) old.parent && old.parent.remove(old);
  const look = o.look || {}, fem = look.frame === 'fem';
  const U = o.uniform ? resolveUniform(o.uniform, fem) : null;
  g.updateMatrixWorld(true);
  const skip = new Set([u.armL, u.armR, u.headG, u.detailHead, u.legL, u.legR].filter(Boolean));
  const under = (m, root) => { for (let q = m; q; q = q.parent) { if (skip.has(q) && q !== root) return false; if (q === root) return true; } return false; };
  const meshesOf = root => { const a = []; root.traverse(m => { if (m.isMesh && !m.isSkinnedMesh && m.geometry && under(m, root)) a.push(m); }); return a; };
  const boxIn = (root, list) => { const inv = new T.Matrix4().copy(root.matrixWorld).invert(), b = new T.Box3(), mb = new T.Box3(), mm = new T.Matrix4();
    for (const m of list) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); mb.copy(m.geometry.boundingBox).applyMatrix4(mm.multiplyMatrices(inv, m.matrixWorld)); b.union(mb); } return b; };
  const rc = new T.Raycaster(), hits = [];
  // local point on root at (x, y) with the ray cast along -z (front) or -y (top); returns local surface point or null
  const cast = (root, list, x, y, z, dir) => { const o3 = new T.Vector3(x, y, z).applyMatrix4(root.matrixWorld), d = dir.clone().transformDirection(root.matrixWorld);
    rc.set(o3, d); rc.near = 0; rc.far = 10; hits.length = 0; for (const m of list) m.raycast(rc, hits); if (!hits.length) return null;
    hits.sort((a, b) => a.distance - b.distance); return root.worldToLocal(hits[0].point.clone()); };
  const shared = [];
  const mark = (m) => { if (m.geometry) m.geometry._shared = true; const mt = m.material; if (mt) { mt._shared = true; if (mt.map) mt.map._shared = true; if (mt.normalMap) mt.normalMap._shared = true; } m.castShadow = false; m.receiveShadow = false; shared.push(m); return m; };
  const put = (parent, geo, mat, x, y, z) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return mark(m); };
  const solid = (hex, rough = 0.5, metal = 0) => stdMat('u' + hex + '|' + rough + '|' + metal, { color: lin(hex), roughness: rough, metalness: metal });
  const goldM = solid(0xd4a64a, 0.3, 1);
  const out = new T.Group(); out.name = 'nep-dress';
  // chest frame
  const spine = u.spine, sList = meshesOf(spine), sb = boxIn(spine, sList);
  if (sb.isEmpty()) return null;
  const chest = new T.Group(); chest.name = 'nep-dress'; spine.add(chest);
  const hw = Math.max(sb.max.x, -sb.min.x), top = sb.max.y, bot = sb.min.y, ht = top - bot, fz = sb.max.z + 0.05, cz = (sb.max.z + sb.min.z) / 2;
  const front = (x, y, lift = 0.003) => { const p = cast(spine, sList, x, y, fz + 0.2, new T.Vector3(0, 0, -1)); return p ? p.setZ(p.z + lift) : new T.Vector3(x, y, sb.max.z + lift); };
  const onTop = (x) => cast(spine, sList, x, top + 0.2, cz, new T.Vector3(0, -1, 0));
  const k = hw / 0.2;                                  // insignia scale relative to a 0.2 m half-chest
  const pinAt = (src) => { const tex = pinTexture(src), y = bot + ht * 0.70, x = hw * (fem ? 0.36 : 0.40), p = front(x, y, 0.004);
    const pg = new T.Group(); pg.position.copy(p); pg.rotation.set(-0.12, 0.18, 0.12); chest.add(pg); pg.scale.setScalar(Math.min(1.25, Math.max(0.8, k)));
    put(pg, cached(geoCache, 'pinback', () => new T.BoxGeometry(0.034, 0.022, 0.003)), goldM, 0, 0, -0.0005);
    put(pg, cached(geoCache, 'pinface', () => new T.PlaneGeometry(0.03, 0.0185)), pinMat(tex), 0, 0, 0.0012); g.userData.nepPin = pg; };
  if (U) {
    const accM = solid(U.accent, 0.55), trimM = U.trim === 0xd4a64a ? goldM : solid(U.trim, 0.35, 0.5);
    const medals = (n) => { for (let i = 0; i < n; i++) { const x = hw * 0.32 + (i % 3) * 0.022 * k, y = bot + ht * 0.66 - Math.floor(i / 3) * 0.045 * k, p = front(x, y, 0.004);
      put(chest, cached(geoCache, 'ribbon', () => new T.BoxGeometry(0.016, 0.014, 0.003)), solid([U.accent, U.trim, U.dark][i % 3], 0.6), p.x, p.y + 0.014, p.z);
      put(chest, cached(geoCache, 'medal', () => new T.CylinderGeometry(0.0075, 0.0075, 0.0025, 14).rotateX(Math.PI / 2)), goldM, p.x, p.y - 0.002, p.z + 0.001); } };
    const epaulettes = (fringe) => { for (const sx of [-1, 1]) { const x = sx * hw * 0.74, p = onTop(x) || new T.Vector3(x, top, cz);
      const e = put(chest, cached(geoCache, 'epau2', () => new T.BoxGeometry(0.07, 0.01, 0.055)), trimM, p.x, p.y + 0.004, p.z); e.rotation.z = -sx * 0.22; e.scale.set(k, 1, k);
      if (fringe) { const f = put(chest, cached(geoCache, 'fringe', () => new T.CylinderGeometry(0.036, 0.034, 0.03, 12, 1, true)), trimM, p.x + sx * 0.03 * k, p.y - 0.016, p.z); f.scale.set(0.35 * k, 1, k); } } };
    const buttons = (n, hex) => { for (let i = 0; i < n; i++) { const y = bot + ht * (0.18 + 0.62 * i / Math.max(1, n - 1)), p = front(0, y, 0.002);
      put(chest, cached(geoCache, 'btn2', () => new T.CylinderGeometry(0.0075, 0.0075, 0.004, 10).rotateX(Math.PI / 2)), hex === 'gold' ? goldM : solid(hex, 0.3), p.x, p.y, p.z); } };
    const sash = (mat, w = 0.05) => { // diagonal band, shoulder to opposite hip, laid on the measured chest surface
      const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10, x = mix(-hw * 0.62, hw * 0.55, t), y = mix(top - ht * 0.08, bot + ht * 0.08, t); pts.push(front(x, y, 0.006)); }
      const c = new T.CatmullRomCurve3(pts), tg = new T.TubeGeometry(c, 20, w * 0.5 * k, 4); tg.scale(1, 1, 1); return put(chest, tg, mat, 0, 0, 0); };
    const head = u.detailHead || u.headG, hList = head ? (() => { const a = []; head.traverse(m => { if (m.isMesh && m.geometry) a.push(m); }); return a; })() : [];
    let hb = null; if (head && hList.length) hb = boxIn(head, hList);
    const cap = (kind) => { if (!hb || hb.isEmpty()) return; const r = Math.max(hb.max.x - hb.min.x, hb.max.z - hb.min.z) / 2, cx = (hb.max.x + hb.min.x) / 2, cz2 = (hb.max.z + hb.min.z) / 2, y = hb.max.y;
      const hg = new T.Group(); hg.name = 'nep-dress'; hg.position.set(cx, y - r * 0.32, cz2); head.add(hg); hg.scale.setScalar(r / 0.095);
      if (kind === 'military') { put(hg, cached(geoCache, 'capcrown', () => new T.CylinderGeometry(0.104, 0.086, 0.06, 28)), solid(liftCloth(U.main), 0.8), 0, 0.03, 0);
        put(hg, cached(geoCache, 'capband', () => new T.CylinderGeometry(0.0875, 0.0875, 0.018, 28)), accM, 0, 0.005, 0);
        const v = put(hg, cached(geoCache, 'visor', () => new T.CircleGeometry(0.088, 20, 0, Math.PI).rotateX(-Math.PI / 2)), solid(0x0d0d0f, 0.15), 0, -0.002, 0.004); v.scale.set(1, 1, 0.75); v.rotation.x = 0.18;
        put(hg, cached(geoCache, 'capbadge', () => new T.CylinderGeometry(0.011, 0.011, 0.004, 12).rotateX(Math.PI / 2)), goldM, 0, 0.025, 0.098); }
      if (kind === 'tunic') put(hg, cached(geoCache, 'softcap', () => new T.CylinderGeometry(0.095, 0.088, 0.05, 24)), solid(liftCloth(U.main), 0.8), 0, 0.025, 0);
      if (kind === 'robe') { const c = put(hg, cached(geoCache, 'skullcap', () => weld(new T.SphereGeometry(0.09, 20, 8, 0, Math.PI * 2, 0, 0.9))), accM, 0, -0.03, -0.01); c.scale.set(1.04, 0.9, 1.08); }
      if (kind === 'tribal') { const b = put(hg, cached(geoCache, 'headband', () => new T.TorusGeometry(0.085, 0.008, 6, 32)), accM, 0, -0.01, 0); b.rotation.x = Math.PI / 2; b.scale.set(1.08, 1.2, 1); } };
    switch (U.style) {
      case 'court': sash(accM); medals(fem ? 3 : 5); break;
      case 'military': epaulettes(true); medals(4); buttons(4, 'gold'); cap('military'); break;
      case 'tunic': buttons(5, 0x1a1a1a); { const starG = cached(geoCache, 'starshape', () => { const s2 = new T.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.0038 : 0.0095; i ? s2.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s2.moveTo(Math.cos(a) * r, -Math.sin(a) * r); } return new T.ShapeGeometry(s2); });
        for (const sx of [-1, 1]) { const p = front(sx * hw * 0.3, top - ht * 0.1, 0.004); const st2 = put(chest, starG, solid(U.accent === U.main ? 0xd4a64a : U.accent, 0.4, 0.3), p.x, p.y, p.z); st2.rotation.y = sx * 0.5; } }
        cap('tunic'); break;
      case 'robe': { const p = front(0, bot + ht * 0.6, 0.006); put(chest, cached(geoCache, 'pect', () => new T.BoxGeometry(0.012, 0.06, 0.004)), goldM, p.x, p.y, p.z); put(chest, cached(geoCache, 'pectb', () => new T.BoxGeometry(0.04, 0.012, 0.004)), goldM, p.x, p.y + 0.01, p.z + 0.001); } cap('robe'); break;
      case 'sleek': for (const sx of [-1, 1]) { const a = front(sx * hw * 0.42, top - ht * 0.12, 0.003), b = front(sx * hw * 0.42, bot + ht * 0.1, 0.003);
        const m = put(chest, cached(geoCache, 'piping', () => new T.BoxGeometry(0.005, 1, 0.004)), solid(U.accent, 0.3, 0.2), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.scale.y = a.distanceTo(b); m.rotation.x = Math.atan2(a.z - b.z, a.y - b.y); } break;
      case 'tribal': sash(accM, 0.08); cap('tribal'); break;
      case 'consular': epaulettes(false); sash(solid(0xf3e6c4, 0.6), 0.04); { const p = front(hw * 0.42, bot + ht * 0.62, 0.006); const bt = put(chest, cached(geoCache, 'badge', () => new T.CircleGeometry(0.03, 24)), badgeMat(U), p.x, p.y, p.z); bt.rotation.y = 0.18; bt.scale.setScalar(k); } break;
      default: pinAt(U.flag);
    }
  } else if (o.homeFlag) pinAt(o.homeFlag);
  // the game's distance tiers: insignia are fine detail, dropped with the buttons
  try { const f = u.fine || (u.fine = []), md = u.mid || (u.mid = []);
    for (const m of shared) { const gm = m.geometry; if (!gm.boundingSphere) gm.computeBoundingSphere(); const ws = new T.Vector3(); m.getWorldScale(ws);
      (gm.boundingSphere.radius * Math.max(ws.x, ws.y, ws.z) < 0.035 ? f : md).push(m); } } catch (e) {}
  for (const m of shared) if (m.geometry && m.geometry.type === 'TubeGeometry') m.geometry._shared = false;
  g.userData.nepDress = { style: U ? U.style : null, pieces: shared.length };
  return g.userData.nepDress;
}

// Dispose per-character geometry (head, hair, beard). Shared geometry/materials stay cached.
export function disposeCharacter(group) {
  const shared = new Set(geoCache.values());
  group.traverse(o => { if (o.isMesh && o.geometry && !shared.has(o.geometry)) o.geometry.dispose(); });
  if (group.parent) group.parent.remove(group);
}
export function cacheStats() { return { geometries: geoCache.size, materials: matCache.size, textures: texCache.size }; }
export default { uniformLook, dressGameRig, applyDressCode, dressFor, resolveUniform, UNIFORM_STYLES, makeCharacter, optionsFromLook, disposeCharacter, cacheStats, OUTFITS, HAIR_STYLES, SKIN_TONES };
