#!/usr/bin/env node
/* 20261117o JUPITER: a top-level function declared twice in session.html silently replaces the first everywhere (both are global).
   20261116c's second onumWorldCard made "open the Engine" open the world map; 20261116b's second onumDeskCopy broke election-night copy.
   Usage: node qa/nov17-dupfn.mjs [worktree]. Fails on any new duplicate; KNOWN lists older ones still to be untangled. */
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(process.argv[2] || ".");
const s = fs.readFileSync(path.join(ROOT, "session.html"), "utf8");
const KNOWN = new Set(["feelColor", "voxReact", "kinEnsure", "cabPick", "boot"]);   /* pre-20261110; boot lives inside two separate IIFEs */
const pos = new Map(); const re = /<script(?![^>]*src)([^>]*)>([\s\S]*?)<\/script>/g; let m;
while ((m = re.exec(s))) { if (/module|json|importmap/.test(m[1])) continue; const base = s.slice(0, m.index + m[0].indexOf(">") + 1).split("\n").length;
  const fr = /^(?:async )?function ([A-Za-z_$][\w$]*)\s*\(/gm; let f; while ((f = fr.exec(m[2]))) { const ln = base + m[2].slice(0, f.index).split("\n").length - 1; (pos.get(f[1]) || pos.set(f[1], []).get(f[1])).push(ln); } }
const dup = [...pos].filter(([, v]) => v.length > 1);
let bad = 0; const res = [];
for (const name of ["onumWorldCard", "onumDeskCopy", "onumOpenWorldCard", "onumPaperCopy", "engCard", "engChannelOut", "engCharterHTML"]) { const n = (pos.get(name) || []).length; const pass = n === 1; if (!pass) bad++; res.push((pass ? "PASS " : "FAIL ") + name + " declared exactly once (" + n + ": " + (pos.get(name) || []).join(", ") + ")"); }
const fresh = dup.filter(([k]) => !KNOWN.has(k)); if (fresh.length) bad++;
res.push((fresh.length ? "FAIL " : "PASS ") + "no new duplicate top-level functions" + (fresh.length ? ": " + fresh.map(([k, v]) => k + "@" + v.join("/")).join(", ") : ""));
res.push("INFO known older duplicates: " + dup.filter(([k]) => KNOWN.has(k)).map(([k, v]) => k + "@" + v.join("/")).join(", "));
const mirrors = ["session.html", "index.html", "One Nation, Under, ME.html", "public/session.html"].map((f) => { try { return fs.readFileSync(path.join(ROOT, f)).equals(fs.readFileSync(path.join(ROOT, "session.html"))); } catch (e) { return false; } });
if (!mirrors.every(Boolean)) bad++; res.push((mirrors.every(Boolean) ? "PASS " : "FAIL ") + "the four live HTML mirrors are byte-identical");
console.log(res.join("\n")); console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
