#!/usr/bin/env node
/* 20261124a JUPITER: "the day still says 516". A career too big for localStorage saves only to IndexedDB, so the localStorage copy
   froze at the last day it fitted. Three set-ups, each from a COPY of the save:
     A  stale day-(N-19) copy in localStorage + day-N career in IndexedDB (Dominic's browser)
     B  the same, with IndexedDB answering 10 s late and Continue clicked the moment it shows (the data-loss path MARS found:
        on f30620b this loaded the old copy and the next save wrote it over the newer career)
     C  the career only in IndexedDB, nothing in localStorage (on f30620b: no Continue at all, only New career)
   In every case: the title names day N (never New career alone), Continue opens day N, the HUD never shows the old day,
   and no store ever goes back to an older day: after play, a save and a reload, IndexedDB and the title are on the newest day.
   Usage: node qa/nov24-stale-day.mjs [worktree] [save.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, delay, resumeIfPaused } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const SAVE = process.argv[3] || "/workspace/nov24/save535.json";
const fresh = fs.readFileSync(SAVE, "utf8"); const D = JSON.parse(fresh);
const stale = {}; for (const [k, v] of Object.entries(D)) { if (k === "members" || k === "you" || JSON.stringify(v).length < 20000) stale[k] = v; }
const NEW = D.day, OLD = NEW - 19; stale.day = OLD; stale.sittingDay = OLD; stale.minute = 600; stale.savedAtMs = (D.savedAtMs || Date.now()) - 5 * 864e5;
const staleRaw = JSON.stringify(stale);
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const SLOW = () => { if (!/session\.html/.test(location.pathname)) return; const o = IDBFactory.prototype.open;
  IDBFactory.prototype.open = function () { const rq = o.apply(this, arguments); let f = null;
    Object.defineProperty(rq, "onsuccess", { configurable: true, get: () => f, set: (fn) => { f = fn; } });
    rq.addEventListener("success", (e) => setTimeout(() => { try { if (f) f.call(rq, e); } catch (x) { setTimeout(() => { throw x; }); } }, 10000));
    return rq; }; };
async function seed(page, withLs) {
  await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded" });
  return page.evaluate((fresh, staleRaw, withLs) => new Promise((resolve) => {
    try { localStorage.clear(); } catch (e) {}
    let lsOk = true; if (withLs) try { localStorage.setItem("longsession.v3", staleRaw); localStorage.setItem("longsession.v3.backup", staleRaw); } catch (e) { lsOk = false; }
    const d = indexedDB.deleteDatabase("onum-saves");
    d.onsuccess = d.onerror = d.onblocked = () => { const rq = indexedDB.open("onum-saves", 1);
      rq.onupgradeneeded = () => { try { rq.result.createObjectStore("s"); } catch (e) {} };
      rq.onsuccess = () => { const tx = rq.result.transaction("s", "readwrite"); tx.objectStore("s").put(fresh, "career"); tx.oncomplete = () => { rq.result.close(); resolve(lsOk); }; tx.onerror = () => resolve(false); }; };
  }), fresh, staleRaw, withLs);
}
const contTxt = (page) => page.evaluate(() => { const b = document.getElementById("cont"); return b ? b.textContent : ""; }).catch(() => "");
/* watch the title: record every frame where Start a new career stands alone (no Continue, not "Looking for your career") */
async function title(page, { fast = false, settle = 4000, max = 150000 } = {}) {
  await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded", timeout: 180000 });
  const t0 = Date.now(); let label = "", lonely = 0, frames = 0;
  while (Date.now() - t0 < max) {
    const f = await page.evaluate(() => { const c = document.getElementById("cont"), n = document.getElementById("fresh"), h = document.querySelector("#card h1");
      return { cont: c ? c.textContent : "", fresh: !!n, looking: !!(h && /Looking for your career/.test(h.textContent || "")) }; }).catch(() => ({}));
    frames++; if (f.fresh && !f.cont && !f.looking) lonely++;
    label = f.cont || "";
    if (/day \d+/i.test(label)) { if (fast) break; await delay(settle); label = await contTxt(page); if (!/checking for a later day/.test(label)) break; }
    await delay(250);
  }
  return { label, lonely, frames, ms: Date.now() - t0 };
}
async function cont(page) {
  await page.click("#cont"); const t0 = Date.now();
  while (Date.now() - t0 < 220000) { const r = await page.evaluate(() => !!(window.ONUM && window.ONUM.running && window.ONUM.running()) && document.getElementById("veil").hidden).catch(() => false); if (r) break; await delay(500); }
  await resumeIfPaused(page); await delay(1500);
  return page.evaluate(() => ({ day: window.ONUM.day().day, txt: [...document.querySelectorAll(".hud,#kClock,#hmBar")].map((n) => n.innerText).join(" | ").slice(0, 600) })).catch(() => ({ day: null, txt: "" }));
}
const n24 = (page) => page.evaluate(() => !!(window.ONUM && window.ONUM.n24 && window.ONUM.n24.idb)).catch(() => false);
const idbDay = (page) => page.evaluate(() => window.ONUM.n24.idb()).catch(() => null);
async function waitSave(page) { const t0 = Date.now(); await delay(1500); while (Date.now() - t0 < 60000) { const b = await page.evaluate(() => { const s = window.ONUM.n24.sv(); return s.busy || s.pending; }).catch(() => false); if (!b) break; await delay(500); } await delay(2000); }
for (const [tag, withLs, slow] of [["A", true, false], ["B", true, true], ["C", false, false]]) {
  const errs = []; const page = await newPage(br, errs);
  if (slow) await page.evaluateOnNewDocument(SLOW);
  const what = tag === "A" ? "stale day-" + OLD + " in localStorage, day-" + NEW + " in IndexedDB" : tag === "B" ? "the same, IndexedDB 10 s late, Continue clicked at once" : "day-" + NEW + " only in IndexedDB, localStorage empty";
  ok(await seed(page, withLs), tag + " seeded: " + what);
  let T = await title(page, { fast: slow });
  if (!slow) ok(new RegExp("day " + NEW + "\\b").test(T.label), tag + " title Continue shows day " + NEW + " (got " + JSON.stringify(T.label) + ", " + Math.round(T.ms / 1000) + "s)");
  else ok(!!T.label, tag + " title offers Continue at once (got " + JSON.stringify(T.label) + ")");
  ok(T.lonely === 0, tag + " the title never shows Start a new career alone while a career is stored (" + T.lonely + " of " + T.frames + " frames)");
  const t1 = Date.now(); const st = T.label ? await cont(page) : { day: null, txt: "" };
  ok(st.day === NEW, tag + " Continue opens day " + NEW + ", not an older copy (G.day " + st.day + ", " + Math.round((Date.now() - t1) / 1000) + "s)");
  ok(!new RegExp("\\b(day|Day) " + OLD + "\\b").test(st.txt), tag + " the HUD does not show day " + OLD);
  if (!(await n24(page))) { ok(false, tag + " needs window.ONUM.n24 (not on this build): save/reload steps skipped"); await page.close(); continue; }
  if (st.day === NEW) {
    await page.evaluate(() => { try { window.ONUM.n24.save(); } catch (e) {} }); await waitSave(page);
    let I = await idbDay(page);
    ok(I && I.day === NEW, tag + " after a save IndexedDB still holds day " + NEW + " (got " + JSON.stringify(I) + ")");
    const ls = await page.evaluate(() => window.ONUM.n24.ls()).catch(() => ({}));
    ok(!Object.values(ls).some((d) => d != null && d < NEW), tag + " no older full copy is left in localStorage once the career saves to IndexedDB only (" + JSON.stringify(ls) + ")");
    if (tag !== "B") {
      for (let i = 0; i < (tag === "A" ? 3 : 1); i++) { await page.evaluate(() => { try { window.ONUM.n24.nextDay(false); } catch (e) {} }); const t0 = Date.now(); while (Date.now() - t0 < 120000) { const busy = await page.evaluate(() => window.ONUM.n24.busy()).catch(() => true); if (!busy) break; await delay(500); } await delay(1000); }
      const dNow = await page.evaluate(() => window.ONUM.day().day);
      await page.evaluate(() => { try { window.ONUM.n24.save(); } catch (e) {} }); await waitSave(page);
      { const t0 = Date.now(); while (Date.now() - t0 < 150000) { I = await idbDay(page); if (I && I.day === dNow) break; await delay(3000); } } ok(dNow > NEW && I && I.day === dNow, tag + " after playing to day " + dNow + " and saving, IndexedDB holds day " + dNow + " (got " + JSON.stringify(I) + ")");
      T = await title(page); ok(new RegExp("day " + dNow + "\\b").test(T.label), tag + " after reload the title shows day " + dNow + " (got " + JSON.stringify(T.label) + ")");
      const s2 = T.label ? await cont(page) : { day: null }; ok(s2.day === dNow, tag + " after reload Continue opens day " + dNow + " (G.day " + s2.day + ")");
    } else {
      /* the older copy must never be written over the newer one: try saving an older state on purpose */
      const r = await page.evaluate(async () => { const G = NEPTUNE.debug().G; const d0 = G.day; G.day = d0 - 19; try { window.ONUM.n24.save(); } catch (e) {} await new Promise((x) => setTimeout(x, 6000)); G.day = d0; return window.ONUM.n24.idb(); }).catch((e) => String(e));
      ok(r && r.day === NEW, tag + " an older state saved on purpose is refused: IndexedDB stays on day " + NEW + " (got " + JSON.stringify(r) + ")");
    }
  }
  ok(errs.length === 0, tag + " 0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
  await page.close();
}
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
