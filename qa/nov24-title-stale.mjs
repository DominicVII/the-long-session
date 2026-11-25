#!/usr/bin/env node
/* 20261124d JUPITER: when IndexedDB is 10 s late and the only localStorage copy is a full
   day-(N-19) career with no 24c+ summary (longsession.v3.meta), the title must never print
   that stale day. Sample #cont every 200 ms; 0 frames may show it. After IndexedDB answers,
   the title names day N and Continue opens day N.
   Usage: node qa/nov24-title-stale.mjs [worktree] [save.json] */
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
const errs = []; const page = await newPage(br, errs);
const SLOW = () => { if (!/session\.html/.test(location.pathname)) return; const o = IDBFactory.prototype.open;
  IDBFactory.prototype.open = function () { const rq = o.apply(this, arguments); let f = null;
    Object.defineProperty(rq, "onsuccess", { configurable: true, get: () => f, set: (fn) => { f = fn; } });
    rq.addEventListener("success", (e) => setTimeout(() => { try { if (f) f.call(rq, e); } catch (x) { setTimeout(() => { throw x; }); } }, 10000));
    return rq; }; };
await page.evaluateOnNewDocument(SLOW);
await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded" });
const seeded = await page.evaluate((fresh, staleRaw) => new Promise((resolve) => {
  try { localStorage.clear(); } catch (e) {}
  let lsOk = true;
  try { localStorage.setItem("longsession.v3", staleRaw); localStorage.setItem("longsession.v3.backup", staleRaw); } catch (e) { lsOk = false; }
  try { localStorage.removeItem("longsession.v3.meta"); } catch (e) {}
  const d = indexedDB.deleteDatabase("onum-saves");
  d.onsuccess = d.onerror = d.onblocked = () => { const rq = indexedDB.open("onum-saves", 1);
    rq.onupgradeneeded = () => { try { rq.result.createObjectStore("s"); } catch (e) {} };
    rq.onsuccess = () => { const tx = rq.result.transaction("s", "readwrite"); tx.objectStore("s").put(fresh, "career"); tx.oncomplete = () => { rq.result.close(); resolve(lsOk); }; tx.onerror = () => resolve(false); }; };
}), fresh, staleRaw);
ok(seeded, "seeded stale day-" + OLD + " full localStorage copy, no 24c+ summary, day-" + NEW + " in IndexedDB");
await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded", timeout: 180000 });
const reOld = new RegExp("\\bday " + OLD + "\\b", "i");
const reNew = new RegExp("\\bday " + NEW + "\\b", "i");
const reCheck = /checking for the latest day/i;
const frames = []; const staleFrames = [];
const t0 = Date.now();
while (Date.now() - t0 < 16000) {
  const f = await page.evaluate(() => {
    const c = document.getElementById("cont"), n = document.getElementById("fresh"), h = document.querySelector("#card h1");
    const card = document.getElementById("card");
    return {
      ms: 0,
      cont: c ? c.textContent : "",
      fresh: !!n,
      h1: h ? h.textContent : "",
      body: card ? (card.innerText || "").replace(/\s+/g, " ").slice(0, 400) : "",
      ready: !!(typeof ENG_IDB !== "undefined" && ENG_IDB && ENG_IDB.ready),
      meta: !!(function () { try { return localStorage.getItem("longsession.v3.meta"); } catch (e) { return null; } })()
    };
  }).catch((e) => ({ err: String(e) }));
  f.ms = Date.now() - t0;
  frames.push(f);
  const blob = [f.cont, f.h1, f.body].join(" ");
  if (reOld.test(blob)) staleFrames.push(f);
  await delay(200);
}
const before = frames.filter((f) => f.ms < 10000);
const after = frames.filter((f) => f.ms >= 10500);
ok(staleFrames.length === 0, "0 of " + frames.length + " frames (every 200 ms, 16 s, IndexedDB 10 s late) show day " + OLD
  + (staleFrames.length ? " — first at " + staleFrames[0].ms + " ms: " + JSON.stringify(staleFrames[0].cont) : ""));
ok(before.some((f) => reCheck.test(f.cont)), "before IndexedDB answers the Continue label says checking for the latest day… (first: "
  + JSON.stringify((before.find((f) => f.cont) || {}).cont) + ")");
ok(!before.some((f) => reNew.test(f.cont) || reOld.test(f.cont)), "before IndexedDB answers, no frame prints a day number on Continue");
ok(after.some((f) => reNew.test(f.cont)), "after IndexedDB answers the title shows day " + NEW + " (last: "
  + JSON.stringify((after[after.length - 1] || {}).cont) + ")");
ok(frames.every((f) => !f.fresh || f.cont || /Looking for your career/.test(f.h1 || "")), "the title never shows Start a new career alone");
ok(before.every((f) => !f.meta), "no 24c+ summary was present before IndexedDB answered (the no-meta path)");
const late = frames[frames.length - 1] || {};
if (reNew.test(late.cont || "")) {
  await page.click("#cont");
  const t1 = Date.now();
  while (Date.now() - t1 < 220000) {
    const r = await page.evaluate(() => !!(window.ONUM && window.ONUM.running && window.ONUM.running()) && document.getElementById("veil").hidden).catch(() => false);
    if (r) break;
    await delay(500);
  }
  await resumeIfPaused(page); await delay(1500);
  const st = await page.evaluate(() => ({ day: window.ONUM.day().day, txt: [...document.querySelectorAll(".hud,#kClock,#hmBar")].map((n) => n.innerText).join(" | ").slice(0, 600) })).catch(() => ({ day: null, txt: "" }));
  ok(st.day === NEW, "Continue opens day " + NEW + " (G.day " + st.day + ", " + Math.round((Date.now() - t1) / 1000) + "s)");
  ok(!reOld.test(st.txt || ""), "the HUD does not show day " + OLD);
} else {
  ok(false, "Continue was not on day " + NEW + " after 16 s, load skipped (last " + JSON.stringify(late.cont) + ")");
}
ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
