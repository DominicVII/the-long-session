#!/usr/bin/env node
/* 20261124f JUPITER: full MARS blocker & soft-item verification on save540 or save535.
   Tests:
   1) histTier persists across save(true) + reload, and across 40 played days + save + reload (no lost days)
   2) hist-backup holds all >=187 keys, refreshes on new day condense, and exports from Menu ("Export pre-condense backup")
   3) vivid source is never deleted when career save fails
   4) Engine ask: never answers forecast/setting fields, scrubs stored (you.name)/(country.name), answers >=20/24 record questions
   5) importCareerSave: rank check + confirm dialog when importing older save over newer career
   6) Soft items: runaway purse/treasury clamped on load & day tick; sent.i member self-names fixed; bill titles deduped
   Usage: node qa/nov24-r4-blockers.mjs [worktree] [save.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";

const ROOT = path.resolve(process.argv[2] || ".");
const SAVE = process.argv[3] || "/workspace/nov24/save540.json";
const raw = fs.readFileSync(SAVE, "utf8");
const disk = JSON.parse(raw);
const startDay = disk.day;

let bad = 0;
const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };

const srv = await startServer(ROOT);
const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const errs = [];
const page = await newPage(br, errs);

await seedIdb(page, origin, raw);
const cont = await continueCareer(page, origin);
const curDay0 = await page.evaluate(() => window.ONUM.day().day);
ok(cont.running && curDay0 === startDay, "Continue opens day " + startDay + " (got " + curDay0 + ")");

// 1. Check Soft Items + Stored-Field Scrubbing right after load
const soft = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const purseBtn = (document.getElementById("uiPurseBtn") || {}).textContent || "";
  const purseCash = G.you && G.you.purse && G.you.purse.cash;
  const blocksMax = G.blocks && G.blocks.list ? Math.max(...G.blocks.list.map(b => Math.max(b.price || 0, b.till || 0))) : 0;
  let sentBad = 0;
  (G.members || []).concat(G.civ || [], G.press || []).forEach(p => {
    if (p && p.sent && typeof p.sent.i === "string") {
      const m = p.sent.i.match(/^I am (.+?)\. There is no spare\./);
      if (m && m[1] !== p.name && m[1] !== "myself") sentBad++;
    }
  });
  const billTitle = G.bill && G.bill.title;
  const dupWordRe = /\b([A-Za-z]+)(?:\s+\1\b)+/i;
  const statuteDup = (G.statute || []).filter(s => s && dupWordRe.test(s.title || "")).length;
  const rawRe = /\((?:you|country|world|bill|weather|calendar|G|m|s)\.[a-z0-9_]+\)/i;
  let engRaw = 0;
  (function walk(v) {
    if (typeof v === "string") { if (rawRe.test(v)) engRaw++; }
    else if (v && typeof v === "object") { for (const k in v) walk(v[k]); }
  })(G.eng);
  return { purseBtn, purseCash, blocksMax, sentBad, billTitle, billDup: dupWordRe.test(billTitle || ""), statuteDup, engRaw };
});
ok(isFinite(soft.purseCash) && soft.purseCash <= 25000 && !/e\+/i.test(soft.purseBtn), "Runaway purse/toolbar clamped (" + soft.purseBtn + ", cash=" + soft.purseCash + ")");
ok(soft.blocksMax <= 5000, "Blocks price/till clamped (max=" + soft.blocksMax + ")");
ok(soft.sentBad === 0, "Zero members whose sent.i names someone else (found " + soft.sentBad + ")");
ok(!soft.billDup && soft.statuteDup === 0, "Repeated words deduped in bill/statute titles (floor='" + soft.billTitle + "', statuteDup=" + soft.statuteDup + ")");
ok(soft.engRaw === 0, "Zero raw (you.name)/(country.name) strings left in G.eng after load (found " + soft.engRaw + ")");

// 2. Test Engine Ask (24 MARS-style questions)
const engRes = await page.evaluate((startDay) => {
  const G = NEPTUNE.debug().G;
  const ask = q => window.ONUM.engine.ask(q);
  const qs = [
    // 15 real record questions
    { q: "What became of the Harvest Visa Act?", expectAns: true, check: r => /105/.test(r.answer) && /95/.test(r.answer) },
    { q: "What became of the Interstate Docks Appropriation Act?", expectAns: true, check: r => /Interstate Docks/i.test(r.answer) },
    { q: "How did the vote go on the Public Public Land Regulation Act?", expectAns: startDay >= 540, optional: startDay < 540, check: r => /Public Land Regulation Act/i.test(r.answer) },
    { q: "What is the status of bill " + (G.bill ? G.bill.id : 470) + "?", expectAns: true, check: r => /Bill \d+/i.test(r.answer) },
    { q: "Who sits in the cabinet?", expectAns: true, check: r => r.sourceKind === "cabinet" && /Secretary/i.test(r.answer) },
    { q: "Who was appointed to the cabinet?", expectAns: true, check: r => r.sourceKind === "cabinet" },
    { q: "Any scandals this month?", expectAns: true, check: r => r.sourceKind === "log" },
    { q: "What is the price of bread on the market?", expectAns: true, check: r => r.sourceKind === "market" && /bread/i.test(r.answer) },
    { q: "What is the guilder?", expectAns: true, check: r => r.sourceKind === "market" && /guilder/i.test(r.answer) },
    { q: "What is in the treasury?", expectAns: true, check: r => r.sourceKind === "treasury" },
    { q: "Who is Gerrit Smit?", expectAns: true, check: r => r.sourceKind === "person" && /Gerrit Smit/.test(r.answer) && /Zeeland/.test(r.answer) },
    { q: "What is my approval?", expectAns: true, check: r => r.sourceKind === "poll" && r.answer.indexOf(String(Math.round(G.you.approval))) >= 0 },
    { q: "How capable is the engine?", expectAns: true, check: r => r.sourceKind === "engine-state" },
    { q: "What is the unrest across the states?", expectAns: true, check: r => r.sourceKind === "economy" },
    { q: "What became of the Naturalization Reform Act?", expectAns: true, check: r => /121/.test(r.answer) && /99/.test(r.answer) },
    { q: "What became of the National Docks Reform Act?", expectAns: true, check: r => /113/.test(r.answer) },
    // 8 refused questions (single common words, raw field names, setting/forecast)
    { q: "What is the forecast today?", expectAns: false, check: r => r.sourceKind === "none" && r.sourceKind !== "weather" },
    { q: "What is the weather?", expectAns: false, check: r => r.sourceKind === "none" && r.sourceKind !== "weather" },
    { q: "cloud", expectAns: false, check: r => r.sourceKind === "none" },
    { q: "star", expectAns: false, check: r => r.sourceKind === "none" },
    { q: "work", expectAns: false, check: r => r.sourceKind === "none" },
    { q: "law", expectAns: false, check: r => r.sourceKind === "none" },
    { q: "(you.name)", expectAns: false, check: r => r.sourceKind === "none" },
    { q: "Tell me about country.name", expectAns: false, check: r => r.sourceKind === "none" }
  ];
  const results = qs.map(x => {
    const r = ask(x.q);
    const screenOk = window.ONUM.engine.screenOk(r.answer);
    const answered = r.sourceKind !== "none" && r.confidence > 0;
    const passed = (x.optional || (answered === x.expectAns)) && x.check(r) && screenOk;
    return { q: x.q, sourceKind: r.sourceKind, answer: r.answer, passed, expected: x.expectAns, answered };
  });
  const totalCorrect = results.filter(r => r.passed).length;
  return { totalCorrect, total: results.length, results };
}, startDay);
ok(engRes.totalCorrect >= 23, "Engine ask passes " + engRes.totalCorrect + "/" + engRes.total + " questions (target >=20/24; forecast/setting refused, records answered)");
for (const r of engRes.results) {
  if (!r.passed) console.log("  DETAIL:", JSON.stringify(r));
}

// 3. Vivid source protection test: simulate failing IDB career put via real IDBObjectStore.prototype.put
const safeCondense = await page.evaluate(() => new Promise(resolve => {
  const G = NEPTUNE.debug().G;
  const origDaylogLen = (G.daylog || []).length;
  const origTlogLen = (G.tlog || []).length;
  const origPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(val, key) {
    if (key === "career") {
      try { this.transaction.abort(); } catch (e) {}
      throw new DOMException("Simulated quota error", "QuotaExceededError");
    }
    return origPut.apply(this, arguments);
  };
  window.ONUM.history.condense(info => {
    IDBObjectStore.prototype.put = origPut;
    resolve({
      info,
      daylogPreserved: (G.daylog || []).length >= origDaylogLen,
      tlogPreserved: (G.tlog || []).length >= origTlogLen,
      histTierUntouched: !G.histTier || (G.histTier.records || []).length === 0
    });
  });
}));
ok(safeCondense.info && !safeCondense.info.ok && safeCondense.daylogPreserved && safeCondense.tlogPreserved && safeCondense.histTierUntouched,
  "Vivid source preserved when career save fails before condense (" + JSON.stringify(safeCondense) + ")");

// 4. Condense -> save(true) -> reload -> verify histTier persists (NOT 0!)
const cond1 = await page.evaluate(() => new Promise(resolve => {
  const G = NEPTUNE.debug().G;
  const minVividDay = Math.min(...(G.daylog || []).map(x => x.d || 9999));
  window.ONUM.history.condense(info => {
    resolve({ info, minVividDay, daylogMinAfter: Math.min(...(G.daylog || []).map(x => x.d || 9999)) });
  });
}));
ok(cond1.info && cond1.info.ok && cond1.info.records > 0, "Condense succeeded on day " + startDay + " (" + cond1.info.records + " records, daylog starts at " + cond1.daylogMinAfter + ")");
await page.evaluate(() => new Promise(resolve => {
  window.ONUM.n24.save();
  const t0 = Date.now();
  const check = () => {
    const sv = window.ONUM.n24.sv();
    if (!sv.busy && !sv.pending) { setTimeout(resolve, 350); return; }
    if (Date.now() - t0 > 15000) { resolve(); return; }
    setTimeout(check, 100);
  };
  setTimeout(check, 150);
}));

// Reload & Continue
await page.reload({ waitUntil: "domcontentloaded" });
const cont2 = await continueCareer(page, origin);
const afterReload1 = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const recs = (G.histTier && G.histTier.records) || [];
  const daylogDays = (G.daylog || []).map(x => x.d).filter(Boolean);
  return {
    day: G.day,
    recCount: recs.length,
    recMin: recs.length ? recs[0].d : null,
    recMax: recs.length ? recs[recs.length - 1].d : null,
    daylogMin: daylogDays.length ? Math.min(...daylogDays) : null,
    daylogMax: daylogDays.length ? Math.max(...daylogDays) : null
  };
});
ok(cont2.running && afterReload1.recCount === cond1.info.records && afterReload1.recCount > 0,
  "After save+reload, histTier records persisted (" + afterReload1.recCount + " records [" + afterReload1.recMin + ".." + afterReload1.recMax + "], daylog [" + afterReload1.daylogMin + ".." + afterReload1.daylogMax + "])");

// 5. Play 40 days -> save(true) -> reload -> every day stays as vivid or as a record
const play40 = await page.evaluate(async () => {
  const G = NEPTUNE.debug().G;
  for (let i = 0; i < 40; i++) {
    window.ONUM.n24.nextDay(false);
    const t0 = Date.now();
    while (window.ONUM.n24.busy() && Date.now() - t0 < 4000) {
      await new Promise(r => setTimeout(r, 30));
    }
    // Wait for histCondense queue if active
    while (window.ONUM.history.busy()) {
      await new Promise(r => setTimeout(r, 25));
    }
    // Close dayPlan / morning card if open so G.running stays healthy
    try {
      const btn = document.querySelector("#card .card__actions button:not([disabled])");
      if (btn && !/sleeping/i.test(btn.textContent || "")) btn.click();
    } catch (e) {}
  }
  await new Promise(r => setTimeout(r, 400));
  window.ONUM.n24.save();
  await new Promise(resolve => {
    const t0 = Date.now();
    const check = () => {
      const sv = window.ONUM.n24.sv();
      if (!sv.busy && !sv.pending) { setTimeout(resolve, 400); return; }
      if (Date.now() - t0 > 15000) { resolve(); return; }
      setTimeout(check, 100);
    };
    setTimeout(check, 150);
  });
  return { day: G.day, purseCash: G.you && G.you.purse && G.you.purse.cash };
});
ok(play40.day === startDay + 40 && isFinite(play40.purseCash) && play40.purseCash <= 25000,
  "Played 40 days to day " + play40.day + " with clamped purse (" + play40.purseCash + ")");

await page.reload({ waitUntil: "domcontentloaded" });
const cont3 = await continueCareer(page, origin);
const afterReload40 = await page.evaluate((minExpect) => {
  const G = NEPTUNE.debug().G;
  const recs = (G.histTier && G.histTier.records) || [];
  const eras = (G.histTier && G.histTier.eras) || [];
  const have = new Set();
  recs.forEach(r => { if (r && r.d != null) have.add(r.d); });
  (G.daylog || []).forEach(x => { if (x && x.d != null) have.add(x.d); });
  eras.forEach(e => { if (e && e.from && e.to) { for (let d = e.from; d <= e.to; d++) have.add(d); } });
  const missing = [];
  for (let d = minExpect; d < G.day; d++) {
    if (!have.has(d)) missing.push(d);
  }
  return {
    day: G.day,
    records: recs.length,
    eras: eras.length,
    vividDays: new Set((G.daylog || []).map(x => x.d)).size,
    missing
  };
}, cond1.minVividDay);
ok(cont3.running && afterReload40.day === startDay + 40 && afterReload40.missing.length === 0,
  "After 40 days + save + reload: day " + afterReload40.day + ", " + afterReload40.records + " records, " + afterReload40.vividDays + " vivid days, missing=" + JSON.stringify(afterReload40.missing));

// 6. Check hist-backup has >= 187 keys, refreshed on day 580, and UI button "Export pre-condense backup" works
const bakPeek = await page.evaluate(() => new Promise(resolve => {
  window.ONUM.history.peekBackup(info => resolve(info));
}));
ok(bakPeek && bakPeek.keys >= 187 && bakPeek.day >= startDay + 39,
  "hist-backup is a full save (" + (bakPeek && bakPeek.keys) + " keys, day " + (bakPeek && bakPeek.day) + ", " + (bakPeek && bakPeek.bytes) + " bytes)");

await page.evaluate(() => { const m = document.getElementById("btnMenu"); if (m) m.click(); });
await delay(300);
const uiBak = await page.evaluate(() => new Promise(res => {
  const btn = document.getElementById("pzHistBak");
  if (!btn) { res({ present: false }); return; }
  const origCreate = document.createElement.bind(document);
  const timer = setTimeout(() => { document.createElement = origCreate; res({ present: true, text: btn.textContent, downloadedName: null }); }, 4000);
  document.createElement = function(tag) {
    const el = origCreate(tag);
    if (String(tag).toLowerCase() === "a") {
      el.click = function() {
        clearTimeout(timer);
        document.createElement = origCreate;
        res({ present: true, text: btn.textContent, downloadedName: el.download });
      };
    }
    return el;
  };
  btn.click();
}));
ok(uiBak.present && uiBak.downloadedName === "one-nation-under-me-pre-condense-backup.json",
  "Menu button 'Export pre-condense backup' present and exports (" + JSON.stringify(uiBak) + ")");

// 7. Blocker 3: importCareerSave rank check + confirm dialogs when importing an older save over a newer career.
//    Same career: first "Merge its older days…?" then "Replace your newer career anyway?". Different career: the replace confirm only.
{
  const olderPath = startDay >= 536 ? "/workspace/nov24/save535.json" : "/workspace/nov24/save535.json";
  const seen = []; let mode = "dismiss";
  const onDlg = async (dlg) => { const m = dlg.message(); seen.push(m); if (mode === "replace" && /Replace your newer career/.test(m)) await dlg.accept(); else await dlg.dismiss(); };
  page.on("dialog", onDlg);
  await page.evaluate(() => { const po = document.getElementById("pauseOverlay"); if (po && !po.classList.contains("is-open")) { const m = document.getElementById("btnMenu"); if (m) m.click(); } });
  await delay(200);
  const impInput = await page.$("#pzImportFile");
  await impInput.uploadFile(olderPath);
  { const t0 = Date.now(); while (Date.now() - t0 < 10000 && !seen.some((m) => /Replace your newer career/.test(m))) await delay(200); }
  await delay(800);
  const stillNewer = await page.evaluate(() => NEPTUNE.debug().G.day);
  ok(seen.some((m) => /older/i.test(m) && /Replace your newer career/.test(m)) && stillNewer === startDay + 40,
    "importCareerSave confirms an older file and keeps day " + stillNewer + " when both prompts are declined (" + JSON.stringify(seen) + ")");
  if (startDay >= 536) {
    seen.length = 0; mode = "replace";
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }),
      impInput.uploadFile(olderPath)
    ]);
    page.off("dialog", onDlg);
    const contImp = await continueCareer(page, origin);
    const impDay = await page.evaluate(() => window.ONUM.day().day);
    ok(contImp.running && impDay === 535, "Confirmed older import (replace) cleanly reloaded into day " + impDay + " (" + seen.length + " prompts)");
  } else page.off("dialog", onDlg);
}

ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
await br.close();
srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed");
process.exit(bad ? 1 : 0);
