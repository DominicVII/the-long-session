#!/usr/bin/env node
/* 20261124f JUPITER: recovery for careers saved on 24d. Same browser, same origin; the server's root is switched between the
   24d build (origin/main bbafaf8) and the fix build, so IndexedDB carries over exactly as in a player's browser.
   A: 24d: Continue the 540 copy, condense, save, reload -> the loss (0 records, daylog starts late).
      fix: load -> old days merged back from hist-backup, records rebuilt, reported in the journal and onumSaveStats().recovery.
   B: 24d loss again, hist-backup deleted -> fix reports the missing range (never silent); an older export of the same career,
      imported, merges its older days back without rolling the newer day back.
   Usage: node qa/nov24-recovery.mjs <fix worktree> <24d worktree> [save540.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const FIX = path.resolve(process.argv[2] || "."), OLD = path.resolve(process.argv[3] || "/workspace/tls-24d");
const SAVE = process.argv[4] || "/workspace/nov24/save540.json";
const raw = fs.readFileSync(SAVE, "utf8"); const D = JSON.parse(raw);
const LINK = "/tmp/onum-rootswap";
const point = (to) => { try { fs.unlinkSync(LINK); } catch (e) {} fs.symlinkSync(to, LINK); };
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
point(OLD);
const srv = await startServer(LINK); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch(); const errs = []; const page = await newPage(br, errs);
const stamp = () => page.evaluate(() => (document.querySelector('meta[name="onum-build"]') || {}).content);
const waitSave = () => page.evaluate(() => new Promise((res) => { try { window.ONUM.n24.save(); } catch (e) {} const t0 = Date.now();
  const ck = () => { const s = window.ONUM.n24.sv(); if ((!s.busy && !s.pending) || Date.now() - t0 > 60000) setTimeout(res, 1200); else setTimeout(ck, 200); }; setTimeout(ck, 300); }));
const state = () => page.evaluate(() => { const G = NEPTUNE.debug().G; const H = G.histTier || {}; const dl = (G.daylog || []).map((x) => x.d);
  return { day: G.day, records: (H.records || []).length, recMin: (H.records || [])[0] ? H.records[0].d : null, dlMin: dl.length ? Math.min(...dl) : null,
    rec: G.histRecovery || null, stats: window.onumSaveStats ? window.onumSaveStats().recovery : undefined,
    journal: (G.journal || []).filter((j) => /History recovery/.test(j.t || "")).map((j) => j.t) }; });
const idbKeys = (keys) => page.evaluate((keys) => new Promise((res) => { const rq = indexedDB.open("onum-saves", 1); rq.onsuccess = () => { const db = rq.result, out = {}; let n = keys.length;
  keys.forEach((k) => { const g = db.transaction("s").objectStore("s").get(k); g.onsuccess = () => { let v = g.result; try { const o = typeof v === "string" ? JSON.parse(v) : v; out[k] = o ? { keys: Object.keys(o).length, dlMin: o.daylog && o.daylog.length ? Math.min(...o.daylog.map((x) => x.d)) : null } : null; } catch (e) { out[k] = "unparsed"; } if (!--n) { db.close(); res(out); } }; }); }; }), keys);
const loseOn24d = async (tag) => {
  point(OLD); await seedIdb(page, origin, raw); await continueCareer(page, origin);
  ok((await stamp()) === "20261124d", tag + " the 24d build is the one running (" + (await stamp()) + ")");
  const c = await page.evaluate(() => new Promise((r) => { window.ONUM.history.condense((i) => r(i)); setTimeout(() => r({ ok: false, t: 1 }), 90000); }));
  ok(c && c.ok, tag + " 24d condensed (" + (c && c.records) + " records)");
  await waitSave(); await continueCareer(page, origin);
  const s = await state();
  ok(s.records === 0 && s.dlMin >= s.day - 30, tag + " reproduced the 24d loss after save+reload: " + s.records + " records, daylog starts at day " + s.dlMin);
  return s;
};
const waitRecovery = async () => { const t0 = Date.now(); while (Date.now() - t0 < 120000) { const r = await page.evaluate(() => { const G = NEPTUNE.debug().G; return !!G.histRecovery && !window.ONUM.history.recovering() && !window.ONUM.history.busy(); }); if (r) break; await delay(500); } await delay(800); };
try {
  /* A */
  await loseOn24d("A");
  const bk = await idbKeys(["hist-backup"]);
  ok(bk["hist-backup"] && bk["hist-backup"].keys <= 12, "A the 24d hist-backup is the short one (" + JSON.stringify(bk) + ")");
  point(FIX); await continueCareer(page, origin); await waitRecovery();
  const WANT = (fs.readFileSync(path.join(FIX, "session.html"), "utf8").match(/<meta name="onum-build" content="([^"]+)"/) || [])[1];
  ok((await stamp()) === WANT, "A the fix build is running (" + (await stamp()) + ")");
  let s = await state();
  const lost0 = D.daylog.concat(D.tlog || []).reduce((m, x) => Math.min(m, x.d), 1e9);
  const rb = (s.rec && s.rec.rebuilt) || [];
  ok(rb.length && rb[0][0] === lost0 && rb[rb.length - 1][1] >= s.day - 31, "A rebuilt the lost days from hist-backup: " + JSON.stringify(rb));
  ok(s.rec && s.rec.missing.length === 0, "A no day is left missing: " + JSON.stringify(s.rec && s.rec.missing));
  ok(s.records >= 60 && s.recMin === lost0, "A records rebuilt (" + s.records + ", from day " + s.recMin + ")");
  ok(s.stats && JSON.stringify(s.stats.rebuilt) === JSON.stringify(rb) && Array.isArray(s.stats.missing), "A onumSaveStats().recovery reports it: " + JSON.stringify(s.stats));
  ok(s.journal.length === 1 && /rebuilt days/.test(s.journal[0]), "A one journal notice: " + JSON.stringify(s.journal));
  const cov = await page.evaluate(() => window.ONUM.history.covered());
  const gaps = []; for (let d = lost0; d < s.day; d++) if (!cov.includes(d)) gaps.push(d);
  ok(gaps.length === 0, "A every day " + lost0 + "–" + (s.day - 1) + " is vivid or a record (gaps " + JSON.stringify(gaps.slice(0, 10)) + ")");
  const k2 = await idbKeys(["hist-backup", "hist-backup-legacy"]);
  ok(k2["hist-backup-legacy"] && k2["hist-backup-legacy"].dlMin === D.daylog.reduce((m, x) => Math.min(m, x.d), 1e9) && k2["hist-backup"] && k2["hist-backup"].keys >= 187, "A the 24d backup is kept as hist-backup-legacy and hist-backup is now a full copy (" + JSON.stringify(k2) + ")");
  await waitSave(); await continueCareer(page, origin); await delay(3000);
  s = await state();
  ok(s.records >= 60 && s.recMin === lost0 && s.journal.length === 1, "A after save+reload the rebuilt records stay (" + s.records + " from day " + s.recMin + ") and the notice is not repeated (" + s.journal.length + ")");
  /* B */
  await loseOn24d("B");
  await page.evaluate(() => new Promise((res) => { const rq = indexedDB.open("onum-saves", 1); rq.onsuccess = () => { const tx = rq.result.transaction("s", "readwrite"); tx.objectStore("s").delete("hist-backup"); tx.objectStore("s").delete("hist-backup-legacy"); tx.oncomplete = () => { rq.result.close(); res(); }; }; }));
  point(FIX); await continueCareer(page, origin); await waitRecovery();
  s = await state();
  const ms = (s.rec && s.rec.missing) || [];
  ok(s.rec && !s.rec.rebuilt.length && ms.length && ms[ms.length - 1][1] === s.dlMin - 1, "B with no backup the loss is reported, not silent: missing " + JSON.stringify(ms));
  ok(s.journal.length === 1 && /Could not rebuild/.test(s.journal[0]), "B journal says what could not be rebuilt: " + JSON.stringify(s.journal[0]).slice(0, 220));
  ok(s.stats && JSON.stringify(s.stats.missing) === JSON.stringify(ms), "B onumSaveStats().recovery.missing matches");
  await page.evaluate(() => window.ONUM.n24.nextDay(false)); await delay(2500);
  await page.evaluate(() => { try { const b = document.querySelector("#card .card__actions button:not([disabled])"); if (b) b.click(); } catch (e) {} });
  await waitSave();
  const day1 = await page.evaluate(() => NEPTUNE.debug().G.day);
  const seen = [];
  page.on("dialog", async (dl) => { seen.push(dl.message()); await dl.accept(); });
  await page.evaluate(() => { const po = document.getElementById("pauseOverlay"); if (!(po && po.classList.contains("is-open"))) document.getElementById("btnMenu").click(); });
  await delay(400);
  const inp = await page.$("#pzImportFile"); await inp.uploadFile(SAVE);
  { const t0 = Date.now(); while (Date.now() - t0 < 90000) { const r = await page.evaluate(() => { const G = NEPTUNE.debug().G; return G.histRecovery && G.histRecovery.source === "import" && !window.ONUM.history.busy(); }); if (r) break; await delay(500); } }
  s = await state();
  const rbi = (s.rec && s.rec.rebuilt) || [];
  ok(seen.length >= 1 && /Merge its older days/.test(seen[0]), "B importing the older export offers a merge: " + JSON.stringify(seen[0]));
  ok(s.day === day1, "B the merge did not roll the career back (day " + s.day + ", was " + day1 + ")");
  ok(s.rec && s.rec.source === "import" && rbi.length && rbi[0][0] === lost0 && s.rec.missing.length === 0, "B the import rebuilt the missing days: " + JSON.stringify(s.rec && { rebuilt: s.rec.rebuilt, missing: s.rec.missing }));
  ok(s.records >= 60, "B records rebuilt from the import (" + s.records + ")");
  ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
} catch (e) { ok(false, "threw: " + (e && e.stack || e)); }
const disk2 = JSON.parse(fs.readFileSync(SAVE, "utf8")); ok(disk2.day === D.day && !disk2.histTier, "the save copy on disk was not modified");
await br.close(); srv.close(); try { fs.unlinkSync(LINK); } catch (e) {}
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
