#!/usr/bin/env node
/* 20261125n NEPTUNE: institutional documents and the Engine's "mind it made", on a COPY of a career.
   Every restyled document opens, draws, scrolls, shows no internal field names, every tagged number equals the career value
   behind it (window.onumDoc.check), controls are reachable (elementFromPoint after scrolling into view), and opening them
   does not grow the save more than 10%.
   Usage: node qa/nov25-docs.mjs <worktree> --save <copy.json> [--size 1280x720] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE;
const zi = process.argv.indexOf("--size"), [VW, VH] = (zi > 0 ? process.argv[zi + 1] : "1280x720").split("x").map(Number);
let bad = 0; const ok = (name, pass, info) => { if (!pass) bad++; console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 400) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch();
try {
  const errs = []; const pg = await newPage(browser, errs); await pg.setViewport({ width: VW, height: VH });
  await seedIdb(pg, origin, fs.readFileSync(SAVE, "utf8")); await continueCareer(pg, origin, ""); await delay(4000);
  const size = () => pg.evaluate(() => { try { return JSON.stringify(NEPTUNE.debug().G).length; } catch (e) { return -1; } });
  const s0 = await size();
  const close = () => pg.evaluate(() => { const c = document.getElementById("gcClose"); if (c) c.click(); });
  const kinds = ["paper", "intel", "econ", "polls", "election", "district", "made"];
  for (const k of kinds) {
    const arg = k === "paper" ? await pg.evaluate(() => { const L = window.onumAcademy ? window.onumAcademy.list() : []; return L.length ? L[L.length - 1].no : null; }) : null;
    if (k === "paper" && arg == null) { ok("paper: no Academy paper in this career (skipped)", true); continue; }
    await pg.evaluate((k, a) => window.onumDoc.open(k, a), k, arg); await delay(1200);
    const r = await pg.evaluate(async () => {
      const c = document.getElementById("card"), v = document.getElementById("veil");
      const tags = (c.innerText.match(/\((?:calendar|weather|(?:you|country|world|treasury|money|eng|states|dist|adv)\.[A-Za-z.]+)\)/g) || []);
      const chk = window.onumDoc.check(c); const d = c.querySelector(".od-doc,.od-plain"); const dr = (c.querySelector(".od-doc") || c).getBoundingClientRect();
      const clip = [...c.querySelectorAll("svg.od-chart,.od-tw,.od-tiles")].filter(e => { const q = e.getBoundingClientRect(); return q.width > 2 && (q.right > dr.right + 1 || q.left < dr.left - 1); }).length + [...c.querySelectorAll(".od-tw")].filter(e => e.scrollWidth > e.clientWidth + 2).length;
      const sc = [c, v].find(e => e && e.scrollHeight > e.clientHeight + 4); let scrolls = true; if (sc) { const t = sc.scrollTop; sc.scrollTop = t + 150; scrolls = sc.scrollTop > t; sc.scrollTop = t; }
      const miss = []; for (const e of [...c.querySelectorAll("button,select,input:not([type=hidden])")].filter(e => e.getClientRects().length && !(e.closest("details:not([open])") && !e.closest("summary")))) {
        e.scrollIntoView({ block: "center" }); await new Promise(r => requestAnimationFrame(r)); const q = e.getBoundingClientRect(); const t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, q.left + Math.min(20, q.width / 2))), Math.min(innerHeight - 1, Math.max(0, q.top + q.height / 2)));
        if (!(t && (t === e || e.contains(t)))) miss.push((e.textContent || e.id).trim().slice(0, 24)); }
      return { drawn: !!d, tags, chk: { n: chk.n, ok: chk.ok, bad: chk.bad.slice(0, 3) }, clip, scrolls, miss };
    });
    ok(k + ": drawn, no field names on screen", r.drawn && !r.tags.length, r.tags);
    ok(k + ": every tagged number equals the career (" + r.chk.ok + "/" + r.chk.n + ")", r.chk.ok === r.chk.n, r.chk.bad);
    ok(k + ": charts and tables fit at " + VW + "x" + VH, r.clip === 0, r.clip);
    ok(k + ": scrolls, and every control is reachable", r.scrolls && !r.miss.length, r.miss);
    await close(); await delay(500);
  }
  const made = await pg.evaluate(async () => { window.onumDoc.open("made"); await new Promise(r => setTimeout(r, 900)); const t = document.getElementById("card").innerText; return { plain: /In plain words/.test(t), old: /Lines folded in:|Times asked:|What could not be had \(/.test(t), cards: document.querySelectorAll("#card .od-fact").length }; });
  ok("Engine: the mind it made reads in plain words (no 'Lines folded in' / 'What could not be had (…)')", made.plain && !made.old, made);
  const ask = await pg.evaluate(() => { const e = window.ONUM && ONUM.engine ? ONUM.engine.ask("cloud") : null; return e && !(e.confidence > 0); });
  ok("Engine: a single shared word is refused, not answered (r4 accessor)", ask);
  const s1 = await size(); ok("opening every document grows the career under 10%", s1 > 0 && (s1 - s0) / s0 < 0.1, { s0, s1 });
  ok("no page errors", !errs.length, errs.slice(0, 3));
} catch (e) { ok("run", false, String(e && e.stack || e).slice(0, 300)); }
await browser.close(); server.close(); console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
