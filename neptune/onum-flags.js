// onum-flags.js — procedural flag designs per government type + an animated waving-flag mesh (Three.js r128).
// Self-contained ES module; THREE is passed in. Seeded (mulberry32), no Math.random, no external files.
import { getTextures } from './onum-materials.js';

export const GOV_TYPES = ['republic', 'democracy', 'parliamentary', 'constitutional_monarchy', 'absolute_monarchy', 'theocracy',
  'dictatorship', 'communist', 'socialist', 'federation', 'confederation', 'junta', 'tribal', 'empire', 'oligarchy',
  'technocracy', 'corporate', 'anarchist', 'city_state', 'colonial', 'consular_republic'];

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const C = { red: '#b3202a', crimson: '#8c1020', scarlet: '#d52b1e', white: '#f4f1ea', blue: '#1f3a8a', navy: '#14213d', sky: '#4a90c8',
  green: '#1f7a3a', dkgreen: '#0f4a2a', gold: '#e2b23a', yellow: '#f2c81e', black: '#16161a', purple: '#5a2a7a', orange: '#e2731e',
  olive: '#5b6431', khaki: '#a89a63', brown: '#6b3f22', ochre: '#c2862e', teal: '#167a7a', silver: '#c9ccd1', graphite: '#3a3d44', cyan: '#2ab0c8', maroon: '#6a1426',
  // NO7 (Nieuw Oranje VII) colours, taken from session.html oranje7FlagTex(): field, border, cross
  no7red: '#9B1B2E', no7gold: '#e8d5a3', no7cream: '#f3e6c4' };
// per government type: palettes, layouts and emblems it may roll
const RULES = {
  republic: { pal: [['blue', 'white', 'red'], ['green', 'white', 'red'], ['red', 'white', 'sky'], ['navy', 'gold', 'red']], lay: ['tri_v', 'tri_h', 'canton_stripes', 'hoist_tri'], emb: ['star', 'wreath', 'none', 'cap'] },
  democracy: { pal: [['blue', 'white', 'red'], ['sky', 'white', 'gold'], ['green', 'yellow', 'blue']], lay: ['canton_stripes', 'stripes', 'tri_h', 'bicolor_h'], emb: ['stars_ring', 'torch', 'star', 'stars_row'] },
  parliamentary: { pal: [['red', 'white', 'blue'], ['green', 'white', 'orange'], ['navy', 'white', 'red']], lay: ['nordic', 'tri_v', 'tri_h', 'bicolor_h'], emb: ['none', 'shield', 'wreath'] },
  constitutional_monarchy: { pal: [['red', 'white', 'gold'], ['blue', 'yellow', 'white'], ['crimson', 'white', 'gold']], lay: ['nordic', 'quartered', 'tri_h', 'saltire'], emb: ['crown_shield', 'crown'] },
  absolute_monarchy: { pal: [['purple', 'gold', 'white'], ['crimson', 'gold', 'black'], ['navy', 'gold', 'white']], lay: ['field', 'border', 'bicolor_d'], emb: ['crown_shield', 'lion', 'crown'] },
  theocracy: { pal: [['white', 'gold', 'green'], ['dkgreen', 'white', 'gold'], ['white', 'maroon', 'gold']], lay: ['field', 'bicolor_v', 'hoist_band', 'cross'], emb: ['crescent', 'eye_rays', 'sun', 'cross_emb'] },
  dictatorship: { pal: [['black', 'red', 'gold'], ['red', 'black', 'white'], ['graphite', 'gold', 'crimson']], lay: ['field', 'bicolor_h', 'border', 'disc'], emb: ['eagle', 'fist', 'star_laurel', 'lightning'] },
  communist: { pal: [['scarlet', 'gold', 'scarlet'], ['crimson', 'yellow', 'white']], lay: ['field', 'field', 'hoist_band', 'canton_star'], emb: ['star_gear', 'star', 'wheat_star'] },
  socialist: { pal: [['red', 'white', 'green'], ['scarlet', 'black', 'gold'], ['red', 'blue', 'white']], lay: ['hoist_tri', 'bicolor_h', 'tri_h'], emb: ['star', 'star_gear', 'torch'] },
  federation: { pal: [['navy', 'gold', 'white'], ['blue', 'white', 'red'], ['sky', 'white', 'gold']], lay: ['field', 'canton_stripes', 'stripes'], emb: ['stars_ring', 'stars_grid', 'stars_row'] },
  confederation: { pal: [['red', 'blue', 'white'], ['navy', 'red', 'white'], ['green', 'white', 'gold']], lay: ['saltire', 'cross', 'tri_v'], emb: ['stars_saltire', 'star', 'none'] },
  junta: { pal: [['olive', 'khaki', 'black'], ['dkgreen', 'khaki', 'gold'], ['brown', 'olive', 'gold']], lay: ['tri_h', 'tri_v', 'field', 'border'], emb: ['swords', 'star', 'star_laurel'] },
  tribal: { pal: [['ochre', 'black', 'red'], ['brown', 'ochre', 'white'], ['green', 'black', 'yellow']], lay: ['zigzag', 'chevrons', 'border_tri', 'tri_h'], emb: ['spear_shield', 'sun', 'none'] },
  empire: { pal: [['gold', 'black', 'crimson'], ['black', 'gold', 'white'], ['purple', 'gold', 'crimson']], lay: ['field', 'sunburst', 'bicolor_h', 'border'], emb: ['eagle2', 'crown', 'sun'] },
  oligarchy: { pal: [['navy', 'silver', 'gold'], ['graphite', 'gold', 'white'], ['maroon', 'silver', 'gold']], lay: ['bicolor_d', 'diag_band', 'border'], emb: ['ring', 'coins', 'key'] },
  technocracy: { pal: [['white', 'cyan', 'graphite'], ['graphite', 'cyan', 'white'], ['navy', 'cyan', 'silver']], lay: ['field', 'hoist_band', 'bicolor_v', 'grid'], emb: ['atom', 'gear', 'hex'] },
  corporate: { pal: [['teal', 'white', 'graphite'], ['white', 'orange', 'graphite'], ['graphite', 'teal', 'silver']], lay: ['field', 'bicolor_v', 'diag_band'], emb: ['hex', 'ring', 'chevron_logo'] },
  anarchist: { pal: [['black', 'red', 'white'], ['black', 'green', 'white']], lay: ['bicolor_d', 'field'], emb: ['circle_a', 'star', 'none'] },
  city_state: { pal: [['white', 'red', 'gold'], ['blue', 'white', 'gold'], ['red', 'gold', 'white']], lay: ['quartered', 'bicolor_h', 'border', 'cross'], emb: ['tower', 'key', 'shield'] },
  consular_republic: { pal: [['no7red', 'no7cream', 'no7gold']], lay: ['no7'], emb: ['jerusalem'], fixed: true },
  colonial: { pal: [['navy', 'white', 'red'], ['blue', 'white', 'gold'], ['red', 'white', 'navy']], lay: ['canton_union', 'field'], emb: ['shield', 'star', 'wreath'] },
};

export function describeFlag(type, seed = 1) {
  const R = RULES[type] || RULES.republic, r = mulberry32((seed >>> 0) * 7919 + GOV_TYPES.indexOf(type) * 104729 + 17), pick = a => a[(r() * a.length) | 0];
  const names = pick(R.pal).slice(); if (r() < 0.5 && !R.fixed) names.reverse();
  return { type, seed, palette: names.map(n => C[n]), paletteNames: names, layout: pick(R.lay), emblem: pick(R.emb), emScale: 0.8 + r() * 0.4, n: 3 + ((r() * 6) | 0), r2: r() };
}

// ---------- canvas drawing ----------
function star(g, x, y, R, n = 5, inner = 0.38, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? R * inner : R; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function gear(g, x, y, R, teeth = 12, bg) { g.beginPath(); for (let i = 0; i < teeth * 4; i++) { const a = i / (teeth * 4) * Math.PI * 2, rr = (i % 4 < 2) ? R : R * 0.82; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill();
  if (bg) { const f = g.fillStyle; g.fillStyle = bg; circle(g, x, y, R * 0.45); g.fillStyle = f; } }
function wreath(g, x, y, R, col) { g.fillStyle = col; for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const a = Math.PI / 2 + s * (0.35 + i * 0.27), px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
  g.save(); g.translate(px, py); g.rotate(a + s * 0.9); g.beginPath(); g.ellipse(0, 0, R * 0.16, R * 0.07, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
function crown(g, x, y, s) { poly(g, [[x - s, y + s * 0.5], [x - s, y - s * 0.4], [x - s * 0.5, y], [x, y - s * 0.7], [x + s * 0.5, y], [x + s, y - s * 0.4], [x + s, y + s * 0.5]]);
  for (const k of [-1, -0.5, 0, 0.5, 1]) circle(g, x + k * s, y - (k === 0 ? s * 0.78 : Math.abs(k) === 1 ? s * 0.48 : s * 0.08), s * 0.12); }
function shield(g, x, y, s) { g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y - s); g.lineTo(x + s, y + s * 0.2); g.quadraticCurveTo(x + s, y + s * 0.9, x, y + s * 1.25); g.quadraticCurveTo(x - s, y + s * 0.9, x - s, y + s * 0.2); g.closePath(); g.fill(); }
function eagle(g, x, y, s, twoHead) { // stylised heraldic eagle silhouette
  g.beginPath(); g.moveTo(x, y - s * 0.55);
  const wing = sx => { g.lineTo(x + sx * s * 0.25, y - s * 0.35); for (let i = 0; i < 5; i++) { const t = i / 4; g.lineTo(x + sx * s * (0.35 + 0.65 * t), y - s * (0.55 - 0.35 * t) + (i % 2 ? s * 0.12 : 0)); }
    g.lineTo(x + sx * s * 0.95, y + s * 0.15); g.lineTo(x + sx * s * 0.3, y + s * 0.15); g.lineTo(x + sx * s * 0.35, y + s * 0.55); g.lineTo(x + sx * s * 0.12, y + s * 0.4); };
  wing(1); g.lineTo(x, y + s * 0.75); wing(-1); g.closePath(); g.fill();
  for (const sx of twoHead ? [-1, 1] : [0]) { circle(g, x + sx * s * 0.17, y - s * 0.62, s * 0.11); poly(g, [[x + sx * s * 0.17 + (sx || 1) * s * 0.08, y - s * 0.66], [x + sx * s * 0.17 + (sx || 1) * s * 0.24, y - s * 0.6], [x + sx * s * 0.17 + (sx || 1) * s * 0.08, y - s * 0.56]]); } }
// Jerusalem cross: a large cross potent (T-bar ends) with a small Greek cross in each quarter
export function jerusalemCross(g, cx, cy, arm, col) {
  g.fillStyle = col; const t = arm * 0.22, bar = arm * 0.62, bt = t * 0.85;
  g.fillRect(cx - t / 2, cy - arm, t, arm * 2); g.fillRect(cx - arm, cy - t / 2, arm * 2, t);
  g.fillRect(cx - bar / 2, cy - arm, bar, bt); g.fillRect(cx - bar / 2, cy + arm - bt, bar, bt);
  g.fillRect(cx - arm, cy - bar / 2, bt, bar); g.fillRect(cx + arm - bt, cy - bar / 2, bt, bar);
  const s = arm * 0.2, st = s * 0.4, off = arm * 0.55;
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const sx = cx + dx * off, sy = cy + dy * off; g.fillRect(sx - st / 2, sy - s, st, s * 2); g.fillRect(sx - s, sy - st / 2, s * 2, st); }
}
function emblem(g, D, x, y, s, col, bg) {
  g.fillStyle = col; g.strokeStyle = col;
  switch (D.emblem) {
    case 'none': break;
    case 'star': star(g, x, y, s); break;
    case 'stars_row': for (let i = 0; i < D.n; i++) star(g, x + (i - (D.n - 1) / 2) * s * 0.75, y, s * 0.3); break;
    case 'stars_ring': for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; star(g, x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.16); } break;
    case 'stars_grid': for (let i = 0; i < D.n + 2; i++) for (let j = 0; j < 3; j++) star(g, x + (i - (D.n + 1) / 2) * s * 0.42, y + (j - 1) * s * 0.5, s * 0.15); break;
    case 'wreath': wreath(g, x, y, s * 0.8, col); break;
    case 'star_laurel': wreath(g, x, y, s * 0.9, col); star(g, x, y, s * 0.5); break;
    case 'cap': g.beginPath(); g.moveTo(x - s * 0.6, y + s * 0.5); g.quadraticCurveTo(x - s * 0.7, y - s * 0.6, x + s * 0.1, y - s * 0.7); g.quadraticCurveTo(x + s * 0.8, y - s * 0.6, x + s * 0.4, y - s * 0.1); g.lineTo(x + s * 0.6, y + s * 0.5); g.closePath(); g.fill(); break;
    case 'torch': poly(g, [[x - s * 0.15, y - s * 0.1], [x + s * 0.15, y - s * 0.1], [x + s * 0.07, y + s * 0.9], [x - s * 0.07, y + s * 0.9]]); g.beginPath(); g.moveTo(x, y - s * 0.95); g.quadraticCurveTo(x + s * 0.45, y - s * 0.4, x, y - s * 0.15); g.quadraticCurveTo(x - s * 0.45, y - s * 0.4, x, y - s * 0.95); g.fill(); break;
    case 'shield': shield(g, x, y - s * 0.1, s * 0.6); g.fillStyle = bg; star(g, x, y - s * 0.05, s * 0.28); break;
    case 'crown': crown(g, x, y, s * 0.7); break;
    case 'crown_shield': shield(g, x, y + s * 0.15, s * 0.5); crown(g, x, y - s * 0.62, s * 0.42); g.fillStyle = bg; poly(g, [[x - s * 0.08, y - s * 0.3], [x + s * 0.08, y - s * 0.3], [x + s * 0.08, y + s * 0.65], [x - s * 0.08, y + s * 0.65]]); poly(g, [[x - s * 0.4, y + s * 0.1], [x + s * 0.4, y + s * 0.1], [x + s * 0.4, y + s * 0.25], [x - s * 0.4, y + s * 0.25]]); break;
    case 'lion': shield(g, x, y, s * 0.75); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y + s * 0.05, s * 0.3, s * 0.2, -0.3, 0, Math.PI * 2); g.fill(); circle(g, x + s * 0.22, y - s * 0.22, s * 0.16); for (const k of [-0.2, 0.15]) poly(g, [[x + k * s, y + s * 0.15], [x + k * s + s * 0.06, y + s * 0.15], [x + k * s + s * 0.04, y + s * 0.5], [x + k * s - s * 0.02, y + s * 0.5]]); break;
    case 'crescent': circle(g, x, y, s * 0.7); g.fillStyle = bg; circle(g, x + s * 0.22, y - s * 0.06, s * 0.6); g.fillStyle = col; star(g, x + s * 0.5, y - s * 0.05, s * 0.2); break;
    case 'eye_rays': for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; poly(g, [[x + Math.cos(a - 0.08) * s * 0.55, y + Math.sin(a - 0.08) * s * 0.55], [x + Math.cos(a) * s * 1.05, y + Math.sin(a) * s * 1.05], [x + Math.cos(a + 0.08) * s * 0.55, y + Math.sin(a + 0.08) * s * 0.55]]); }
      poly(g, [[x - s * 0.5, y + s * 0.35], [x + s * 0.5, y + s * 0.35], [x, y - s * 0.5]]); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y + s * 0.05, s * 0.2, s * 0.1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = col; circle(g, x, y + s * 0.05, s * 0.06); break;
    case 'sun': circle(g, x, y, s * 0.42); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.1; poly(g, [[x + Math.cos(a - 0.12) * s * 0.5, y + Math.sin(a - 0.12) * s * 0.5], [x + Math.cos(a) * s * (i % 2 ? 0.8 : 1), y + Math.sin(a) * s * (i % 2 ? 0.8 : 1)], [x + Math.cos(a + 0.12) * s * 0.5, y + Math.sin(a + 0.12) * s * 0.5]]); } break;
    case 'cross_emb': poly(g, [[x - s * 0.12, y - s * 0.8], [x + s * 0.12, y - s * 0.8], [x + s * 0.12, y + s * 0.8], [x - s * 0.12, y + s * 0.8]]); poly(g, [[x - s * 0.5, y - s * 0.38], [x + s * 0.5, y - s * 0.38], [x + s * 0.5, y - s * 0.14], [x - s * 0.5, y - s * 0.14]]); break;
    case 'eagle': eagle(g, x, y, s, false); break;
    case 'eagle2': eagle(g, x, y, s, true); break;
    case 'fist': g.beginPath(); g.roundRect ? g.roundRect(x - s * 0.35, y - s * 0.55, s * 0.7, s * 0.55, s * 0.12) : g.rect(x - s * 0.35, y - s * 0.55, s * 0.7, s * 0.55); g.fill(); poly(g, [[x - s * 0.25, y], [x + s * 0.25, y], [x + s * 0.2, y + s * 0.8], [x - s * 0.2, y + s * 0.8]]);
      g.fillStyle = bg; for (let i = 1; i < 4; i++) poly(g, [[x - s * 0.35 + i * s * 0.175 - 2, y - s * 0.5], [x - s * 0.35 + i * s * 0.175 + 2, y - s * 0.5], [x - s * 0.35 + i * s * 0.175 + 2, y - s * 0.2], [x - s * 0.35 + i * s * 0.175 - 2, y - s * 0.2]]); break;
    case 'lightning': poly(g, [[x + s * 0.2, y - s], [x - s * 0.45, y + s * 0.1], [x - s * 0.02, y + s * 0.1], [x - s * 0.25, y + s], [x + s * 0.45, y - s * 0.15], [x + s * 0.02, y - s * 0.15]]); break;
    case 'star_gear': gear(g, x, y, s * 0.8, 14, bg); star(g, x, y, s * 0.42); break;
    case 'wheat_star': wreath(g, x, y + s * 0.1, s * 0.8, col); star(g, x, y - s * 0.1, s * 0.4); break;
    case 'swords': for (const k of [-1, 1]) { g.save(); g.translate(x, y); g.rotate(k * 0.7); poly(g, [[-s * 0.05, -s], [s * 0.05, -s], [s * 0.05, s * 0.6], [-s * 0.05, s * 0.6]]); poly(g, [[-s * 0.22, s * 0.55], [s * 0.22, s * 0.55], [s * 0.22, s * 0.64], [-s * 0.22, s * 0.64]]); poly(g, [[-s * 0.05, -s], [s * 0.05, -s], [0, -s * 1.12]]); g.restore(); } star(g, x, y - s * 0.65, s * 0.25); break;
    case 'spear_shield': g.save(); g.translate(x, y); g.rotate(0.5); poly(g, [[-s * 0.03, -s * 1.1], [s * 0.03, -s * 1.1], [s * 0.03, s * 1.1], [-s * 0.03, s * 1.1]]); poly(g, [[0, -s * 1.3], [s * 0.1, -s * 1.05], [-s * 0.1, -s * 1.05]]); g.restore();
      g.save(); g.translate(x, y); g.rotate(-0.5); poly(g, [[-s * 0.03, -s * 1.1], [s * 0.03, -s * 1.1], [s * 0.03, s * 1.1], [-s * 0.03, s * 1.1]]); poly(g, [[0, -s * 1.3], [s * 0.1, -s * 1.05], [-s * 0.1, -s * 1.05]]); g.restore();
      g.beginPath(); g.ellipse(x, y, s * 0.42, s * 0.75, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, s * 0.12, s * 0.6, 0, 0, Math.PI * 2); g.fill(); break;
    case 'ring': g.lineWidth = s * 0.18; g.beginPath(); g.arc(x, y, s * 0.6, 0, Math.PI * 2); g.stroke(); circle(g, x, y, s * 0.2); break;
    case 'coins': for (let i = 0; i < 3; i++) circle(g, x + (i - 1) * s * 0.55, y + (i === 1 ? -s * 0.3 : s * 0.15), s * 0.32); break;
    case 'key': g.lineWidth = s * 0.14; g.beginPath(); g.arc(x, y - s * 0.55, s * 0.28, 0, Math.PI * 2); g.stroke(); poly(g, [[x - s * 0.07, y - s * 0.3], [x + s * 0.07, y - s * 0.3], [x + s * 0.07, y + s * 0.85], [x - s * 0.07, y + s * 0.85]]); poly(g, [[x, y + s * 0.55], [x + s * 0.3, y + s * 0.55], [x + s * 0.3, y + s * 0.68], [x, y + s * 0.68]]); poly(g, [[x, y + s * 0.75], [x + s * 0.22, y + s * 0.75], [x + s * 0.22, y + s * 0.85], [x, y + s * 0.85]]); break;
    case 'atom': g.lineWidth = s * 0.07; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y, s * 0.85, s * 0.3, i * Math.PI / 3, 0, Math.PI * 2); g.stroke(); } circle(g, x, y, s * 0.14); break;
    case 'gear': gear(g, x, y, s * 0.8, 10, bg); break;
    case 'hex': { const hx = k => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; g.lineTo(x + Math.cos(a) * s * k, y + Math.sin(a) * s * k); } g.closePath(); }; hx(0.8); g.fill(); g.fillStyle = bg; hx(0.5); g.fill(); g.fillStyle = col; hx(0.25); g.fill(); break; }
    case 'chevron_logo': for (let i = 0; i < 3; i++) poly(g, [[x - s * 0.7, y - s * 0.5 + i * s * 0.4], [x, y + i * s * 0.4 - s * 0.1], [x + s * 0.7, y - s * 0.5 + i * s * 0.4], [x + s * 0.7, y - s * 0.3 + i * s * 0.4], [x, y + i * s * 0.4 + s * 0.1], [x - s * 0.7, y - s * 0.3 + i * s * 0.4]]); break;
    case 'circle_a': g.lineWidth = s * 0.14; g.beginPath(); g.arc(x, y, s * 0.75, 0, Math.PI * 2); g.stroke(); g.lineWidth = s * 0.16; g.beginPath(); g.moveTo(x - s * 0.55, y + s * 0.85); g.lineTo(x, y - s * 0.95); g.lineTo(x + s * 0.55, y + s * 0.85); g.moveTo(x - s * 0.45, y + s * 0.15); g.lineTo(x + s * 0.45, y + s * 0.15); g.stroke(); break;
    case 'tower': poly(g, [[x - s * 0.5, y + s * 0.8], [x - s * 0.5, y - s * 0.3], [x - s * 0.7, y - s * 0.3], [x - s * 0.7, y - s * 0.6], [x - s * 0.5, y - s * 0.6], [x - s * 0.5, y - s * 0.45], [x - s * 0.25, y - s * 0.45], [x - s * 0.25, y - s * 0.6], [x, y - s * 0.6], [x, y - s * 0.45], [x + s * 0.25, y - s * 0.45], [x + s * 0.25, y - s * 0.6], [x + s * 0.5, y - s * 0.6], [x + s * 0.5, y - s * 0.45], [x + s * 0.7, y - s * 0.6], [x + s * 0.7, y - s * 0.3], [x + s * 0.5, y - s * 0.3], [x + s * 0.5, y + s * 0.8]]);
      g.fillStyle = bg; g.beginPath(); g.moveTo(x - s * 0.18, y + s * 0.8); g.lineTo(x - s * 0.18, y + s * 0.35); g.arc(x, y + s * 0.35, s * 0.18, Math.PI, 0); g.lineTo(x + s * 0.18, y + s * 0.8); g.fill(); break;
    case 'jerusalem': jerusalemCross(g, x, y, s, col); break;
    case 'stars_saltire': break; // drawn by the saltire layout
    default: star(g, x, y, s);
  }
}

export function drawFlag(type, seed = 1, opts = {}) {
  const D = describeFlag(type, seed), W = opts.width || 512, H = opts.height || Math.round(W / 1.6);
  const c = opts.canvas || document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const [c0, c1, c2] = D.palette; let ex = W / 2, ey = H / 2, es = H * 0.28 * D.emScale, eCol = c1, eBg = c0;
  const rect = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  rect(0, 0, W, H, c0);
  switch (D.layout) {
    case 'field': eCol = c1; eBg = c0; if (D.r2 < 0.4) { ex = W * 0.3; es *= 0.8; } break;
    case 'tri_v': rect(W / 3, 0, W / 3, H, c1); rect(W * 2 / 3, 0, W / 3, H, c2); eCol = c0 === c2 ? c1 : c2; eBg = c1; es *= 0.75; break;
    case 'tri_h': rect(0, H / 3, W, H / 3, c1); rect(0, H * 2 / 3, W, H / 3, c2); eCol = c2; eBg = c1; es *= 0.7; break;
    case 'bicolor_h': rect(0, H / 2, W, H / 2, c1); eCol = c2; eBg = c0; ex = W * 0.25; ey = H * 0.27; es *= 0.55; break;
    case 'bicolor_v': rect(W / 2, 0, W / 2, H, c1); eCol = c2; eBg = c0; ex = W * 0.25; es *= 0.7; break;
    case 'bicolor_d': g.fillStyle = c1; poly(g, [[W, 0], [W, H], [0, H]]); eCol = c2; eBg = c0; ex = W * 0.28; ey = H * 0.3; es *= 0.55; break;
    case 'stripes': for (let i = 0; i < 7 + (D.n % 3) * 2; i++) if (i % 2) rect(0, i * H / (7 + (D.n % 3) * 2), W, H / (7 + (D.n % 3) * 2), c1); eCol = c1; eBg = c2; { const cw = W * 0.0; } g.fillStyle = c2; g.beginPath(); g.arc(W / 2, H / 2, H * 0.3, 0, Math.PI * 2); g.fill(); es *= 0.75; break;
    case 'canton_stripes': { const n = 13 - (D.n % 3) * 2; for (let i = 0; i < n; i++) if (i % 2) rect(0, i * H / n, W, H / n, c1); rect(0, 0, W * 0.42, H * (Math.ceil(n / 2)) / n, c2); ex = W * 0.21; ey = H * Math.ceil(n / 2) / n / 2; es = H * 0.17; eCol = c1 === c0 ? C.white : c1; eBg = c2; if (D.emblem === 'none') D.emblem = 'stars_grid'; break; }
    case 'canton_star': rect(0, 0, W * 0.4, H * 0.5, c0); ex = W * 0.2; ey = H * 0.25; es = H * 0.17; eCol = c1; break;
    case 'canton_union': rect(0, 0, W / 2, H / 2, c1); g.strokeStyle = c2; g.lineWidth = H * 0.06; g.beginPath(); g.moveTo(0, 0); g.lineTo(W / 2, H / 2); g.moveTo(W / 2, 0); g.lineTo(0, H / 2); g.stroke();
      rect(W / 4 - H * 0.06, 0, H * 0.12, H / 2, c2); rect(0, H / 4 - H * 0.06, W / 2, H * 0.12, c2); ex = W * 0.72; ey = H * 0.55; es *= 0.8; eCol = c1 === c0 ? c2 : C.white; eBg = c0; break;
    case 'hoist_tri': rect(0, H / 2, W, H / 2, c1); g.fillStyle = c2; poly(g, [[0, 0], [W * 0.42, H / 2], [0, H]]); ex = W * 0.13; es *= 0.55; eCol = c1 === C.white ? C.white : C.white; eBg = c2; break;
    case 'hoist_band': rect(0, 0, W * 0.28, H, c1); ex = W * 0.6; eCol = c1; eBg = c0; es *= 0.9; break;
    case 'nordic': rect(W * 0.3, 0, H * 0.2, H, c1); rect(0, H * 0.4, W, H * 0.2, c1); if (D.r2 > 0.5) { rect(W * 0.3 + H * 0.05, 0, H * 0.1, H, c2); rect(0, H * 0.45, W, H * 0.1, c2); } D.emblem = D.emblem === 'none' ? 'none' : D.emblem; ex = W * 0.3 + H * 0.1; es *= 0.7; eCol = c2; eBg = c1; if (D.emblem !== 'crown' && D.emblem !== 'crown_shield') D.emblem = 'none'; break;
    case 'cross': rect(W / 2 - H * 0.1, 0, H * 0.2, H, c1); rect(0, H * 0.4, W, H * 0.2, c1); eCol = c2; eBg = c1; es *= 0.45; break;
    case 'saltire': { g.strokeStyle = c1; g.lineWidth = H * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
      if (D.emblem === 'stars_saltire') { g.fillStyle = c2; for (let i = 0; i < 13; i++) { const t = (i % 7) / 6, d = i < 7 ? 1 : -1; const x = i < 7 ? t * W : (1 - ((i - 7) + 0.5) / 6) * W, y = i < 7 ? t * H : ((i - 7) + 0.5) / 6 * H; if (i === 3) continue; star(g, i < 7 ? x : x, y, H * 0.05); } D.emblem = 'none'; }
      eCol = c2; eBg = c1; es *= 0.5; break; }
    case 'quartered': rect(W / 2, 0, W / 2, H / 2, c1); rect(0, H / 2, W / 2, H / 2, c1); eCol = c2; eBg = c0; g.fillStyle = c2; circle(g, ex, ey, es * 1.1); eCol = c0; eBg = c2; es *= 0.75; break;
    case 'border': rect(0, 0, W, H, c1); rect(H * 0.08, H * 0.08, W - H * 0.16, H - H * 0.16, c0); eCol = c1; eBg = c0; break;
    case 'border_tri': rect(0, 0, W, H, c0); g.fillStyle = c1; for (let i = 0; i < 16; i++) { poly(g, [[i * W / 16, 0], [(i + 0.5) * W / 16, H * 0.1], [(i + 1) * W / 16, 0]]); poly(g, [[i * W / 16, H], [(i + 0.5) * W / 16, H * 0.9], [(i + 1) * W / 16, H]]); } eCol = c2; eBg = c0; break;
    case 'zigzag': rect(0, H * 0.35, W, H * 0.3, c1); g.fillStyle = c2; for (let i = 0; i < 12; i++) { poly(g, [[i * W / 12, H * 0.35], [(i + 0.5) * W / 12, H * 0.42], [(i + 1) * W / 12, H * 0.35]]); poly(g, [[i * W / 12, H * 0.65], [(i + 0.5) * W / 12, H * 0.58], [(i + 1) * W / 12, H * 0.65]]); } eCol = c2; eBg = c1; es *= 0.55; ex = W * 0.5; break;
    case 'chevrons': for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? c1 : c2; poly(g, [[i * W * 0.08, 0], [W * 0.32 + i * W * 0.08, H / 2], [i * W * 0.08, H], [(i + 1) * W * 0.08, H], [W * 0.32 + (i + 1) * W * 0.08, H / 2], [(i + 1) * W * 0.08, 0]]); } ex = W * 0.72; eCol = c1; eBg = c0; es *= 0.8; break;
    case 'sunburst': g.fillStyle = c1; for (let i = 0; i < 24; i += 2) { const a = i / 24 * Math.PI * 2, b = (i + 1) / 24 * Math.PI * 2, R = W; poly(g, [[W / 2, H / 2], [W / 2 + Math.cos(a) * R, H / 2 + Math.sin(a) * R], [W / 2 + Math.cos(b) * R, H / 2 + Math.sin(b) * R]]); } g.fillStyle = c0; circle(g, W / 2, H / 2, es * 1.25); eCol = c2; eBg = c0; break;
    case 'disc': g.fillStyle = c1; circle(g, ex, ey, es * 1.25); eCol = c2 === c0 ? C.black : c2; eBg = c1; break;
    case 'diag_band': g.fillStyle = c1; poly(g, [[0, H], [0, H * 0.75], [W * 0.75, 0], [W, 0], [W, H * 0.25], [W * 0.25, H]]); eCol = c2; eBg = c0; ex = W * 0.2; ey = H * 0.25; es *= 0.5; break;
    case 'no7': g.strokeStyle = c2; g.lineWidth = H * 0.05; g.strokeRect(H * 0.04, H * 0.04, W - H * 0.08, H - H * 0.08);
      g.strokeStyle = 'rgba(243,230,196,0.4)'; g.lineWidth = Math.max(1, H * 0.008); g.strokeRect(H * 0.09, H * 0.09, W - H * 0.18, H - H * 0.18);
      eCol = c1; eBg = c0; es = H * 0.3; break;
    case 'grid': g.fillStyle = c1; for (let i = 1; i < 8; i++) { g.fillRect(i * W / 8 - 1, 0, 2, H); g.fillRect(0, i * H / 5 - 1, W, 2); } eCol = c2; eBg = c0; g.fillStyle = c0; circle(g, ex, ey, es * 1.1); break;
  }
  if (eCol === eBg) eCol = eBg === C.white ? C.black : C.white;
  emblem(g, D, ex, ey, es, eCol, eBg);
  // cloth: faint weave + soft shading so it reads as fabric, not a decal
  const id = g.getImageData(0, 0, W, H), d = id.data, rr = mulberry32(seed * 31 + 5);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, wv = ((x & 1) ^ (y & 1)) ? 0.985 : 1.0, k = wv * (0.97 + rr() * 0.03); d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
  g.putImageData(id, 0, 0);
  c.userData = D; return c;
}

const texCache = new Map();
export function makeFlagTexture(THREE, type, seed = 1, opts = {}) {
  const key = type + '|' + seed + '|' + (opts.width || 512);
  if (texCache.has(key)) return texCache.get(key);
  const t = new THREE.CanvasTexture(drawFlag(type, seed, opts)); t.anisotropy = 4;
  if (opts.srgb !== false) { if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; }
  texCache.set(key, t); return t;
}

// Waving flag on a pole. Hoist edge pinned; a travelling wave grows toward the fly edge; normals recomputed per frame.
// { group, cloth, update(dt, {wind=1 (0..2), gust}), dispose() }. Origin = foot of the pole; cloth faces +Z, flies toward +X.
export function makeWavingFlag(THREE, opts = {}) {
  const type = opts.type || 'republic', seed = opts.seed ?? 1, fw = opts.width || 1.6, fh = opts.height || fw / 1.6;
  const sx = opts.segments || 32, sy = Math.max(4, Math.round(sx / 1.6 / 2)), poleH = opts.poleHeight ?? 4.5;
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(fw, fh, sx, sy); geo.translate(fw / 2, 0, 0);
  const rest = Float32Array.from(geo.attributes.position.array); geo.setAttribute('uv2', geo.attributes.uv);
  let normalMap = null; try { normalMap = getTextures('flag_cloth', THREE, { repeat: [4, 2.5], quality: opts.quality || 'low' }).normalMap; } catch (e) { normalMap = null; }
  const mat = new THREE.MeshStandardMaterial({ map: makeFlagTexture(THREE, type, seed, { width: opts.textureWidth || 512 }), normalMap, normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.82, metalness: 0, side: THREE.DoubleSide });
  const cloth = new THREE.Mesh(geo, mat); cloth.castShadow = true; cloth.position.set(0.035, poleH - fh / 2 - 0.08, 0); group.add(cloth);
  if (opts.pole !== false) {
    const pm = opts.poleMaterial || new THREE.MeshStandardMaterial({ color: 0xc9c6bd, roughness: 0.35, metalness: 0.8 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, poleH, 12), pm); pole.position.y = poleH / 2; pole.castShadow = true; group.add(pole);
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), opts.finialMaterial || new THREE.MeshStandardMaterial({ color: 0xd4a64a, roughness: 0.25, metalness: 1 })); fin.position.y = poleH + 0.04; group.add(fin);
  }
  const r = mulberry32(seed * 13 + 1); let t = r() * 100;
  function update(dt, st = {}) {
    const wind = st.wind ?? 1, gust = 0.75 + 0.25 * Math.sin(t * 0.37) * Math.sin(t * 0.23 + 1); t += (dt || 0) * (0.6 + wind * 0.9);
    const P = geo.attributes.position, amp = 0.14 * fw * wind * gust, droop = fh * 0.22 * Math.max(0, 1 - wind);
    for (let i = 0; i < P.count; i++) { const x0 = rest[i * 3], y0 = rest[i * 3 + 1], u = x0 / fw, v = y0 / fh;
      const ph = x0 / fw * 6.5 - t * 4.2 + v * 0.8, a = amp * Math.pow(u, 1.2);
      const z = a * Math.sin(ph) + a * 0.35 * Math.sin(ph * 1.9 + v * 3 + t * 1.3);
      const x = x0 - Math.abs(z) * 0.25 * u - droop * u * u * 0.6, y = y0 - droop * u * u * (0.6 - v);
      P.setXYZ(i, x, y, z); }
    P.needsUpdate = true; geo.computeVertexNormals();
  }
  update(0, {});
  return { group, cloth, update, describe: describeFlag(type, seed), dispose() { geo.dispose(); mat.dispose(); } };
}
export default { GOV_TYPES, describeFlag, drawFlag, makeFlagTexture, makeWavingFlag };
