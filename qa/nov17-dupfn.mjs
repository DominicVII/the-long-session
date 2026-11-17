#!/usr/bin/env node
/* 20261117o JUPITER: a top-level function declared twice in session.html silently replaces the first everywhere (both are global).
   20261116c's second onumWorldCard made "open the Engine" open the world map; 20261116b's second onumDeskCopy broke election-night copy.
   Usage: node qa/nov17-dupfn.mjs [worktree].
   20261117q: strict. Zero duplicates allowed. Scope-aware: a script wrapped in its own IIFE is its own scope (two boot()s in two
   separate wrapped scripts do not collide); unwrapped scripts share the global scope. */
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(process.argv[2] || ".");
const s = fs.readFileSync(path.join(ROOT, "session.html"), "utf8");
const pos = new Map(), scoped = new Map(); const re = /<script(?![^>]*src)([^>]*)>([\s\S]*?)<\/script>/g; let m, si = 0;
const wrapped = (code) => /^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*[;!]?\(?\s*(?:\(\s*)?(?:function\s*\w*\s*\(|\(\s*\)\s*=>)/.test(code) && /\}\s*\)?\s*\(\s*\)\s*\)?\s*;?\s*$/.test(code);
while ((m = re.exec(s))) { si++; if (/module|json|importmap/.test(m[1])) continue; const base = s.slice(0, m.index + m[0].indexOf(">") + 1).split("\n").length; const scope = wrapped(m[2]) ? "script" + si : "global";
  const fr = /^(?:async )?function ([A-Za-z_$][\w$]*)\s*\(/gm; let f; while ((f = fr.exec(m[2]))) { const ln = base + m[2].slice(0, f.index).split("\n").length - 1; (pos.get(f[1]) || pos.set(f[1], []).get(f[1])).push(ln); const k = scope + ":" + f[1]; (scoped.get(k) || scoped.set(k, []).get(k)).push(ln); } }
const dup = [...scoped].filter(([, v]) => v.length > 1).map(([k, v]) => [k.replace(/^[^:]*:/, ""), v]);
let bad = 0; const res = [];
for (const name of ["onumWorldCard", "onumDeskCopy", "onumOpenWorldCard", "onumPaperCopy", "engCard", "engChannelOut", "engCharterHTML"]) { const n = (pos.get(name) || []).length; const pass = n === 1; if (!pass) bad++; res.push((pass ? "PASS " : "FAIL ") + name + " declared exactly once (" + n + ": " + (pos.get(name) || []).join(", ") + ")"); }
if (dup.length) bad++;
res.push((dup.length ? "FAIL " : "PASS ") + "zero duplicate top-level functions in any one scope (strict, none allowed)" + (dup.length ? ": " + dup.map(([k, v]) => k + "@" + v.join("/")).join(", ") : ""));
/* the four that used to collide: each caller's behaviour now has its own name */
for (const [name, want] of [["feelHue", 1], ["feelColor", 1], ["voxNpcReact", 1], ["voxReact", 1], ["kinWarTie", 1], ["kinEnsure", 1], ["cabPick", 1]]) { const n = (pos.get(name) || []).length; const pass = n === want; if (!pass) bad++; res.push((pass ? "PASS " : "FAIL ") + name + " declared exactly " + want + " (" + n + ")"); }
const callsOk = /background:' \+ feelHue\(r\.est\)/.test(s) && /voxNpcReact\(post, pick\(others\)\)/.test(s) && !/[^\w.]feelColor\((?:r\.est|mood\.val)\)/.test(s) && !/[^\w.]voxReact\(post,/.test(s);
if (!callsOk) bad++; res.push((callsOk ? "PASS " : "FAIL ") + "colour callers use feelHue(v); post callers use voxNpcReact(post, m)");
const mirrors = ["session.html", "index.html", "One Nation, Under, ME.html", "public/session.html"].map((f) => { try { return fs.readFileSync(path.join(ROOT, f)).equals(fs.readFileSync(path.join(ROOT, "session.html"))); } catch (e) { return false; } });
if (!mirrors.every(Boolean)) bad++; res.push((mirrors.every(Boolean) ? "PASS " : "FAIL ") + "the four live HTML mirrors are byte-identical");
console.log(res.join("\n")); console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
