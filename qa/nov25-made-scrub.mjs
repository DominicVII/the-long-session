#!/usr/bin/env node
/* 20261125 JUPITER: Verify r4fix engScrubStoredFields x patch 09 odMadeParse fix:
   1) Fresh 540 copy on fix build: Continue -> made mind shows Current/Stale (~5/11) and 6 Setting echoes; save+reload preserves it; 0 raw tags on screen or in G.eng.
   2) Exact MARS path: load 540 copy on r4fix (/workspace/tls-nov24), save so G.eng is scrubbed, then load on fix build -> same ~5 current / 11 stale / 6 setting; save+reload preserves it.
   3) Economy report Risks guilder value equals Headline guilder index (both 540 and 535).
   4) Recovery with no backup reports only actually-lost range (not 105-518); a 24d condense of the 540 copy at day 540 is 445-(dlMin-1).
   5) MARS day-548 damaged export (no backup) reports the exact lost span 445-518, and the red notice shows once, not on reload.
   Usage: node qa/nov25-made-scrub.mjs <fix worktree> [r4fix worktree] [24d worktree] [save540.json] [save535.json] [damaged-export-548.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";

const FIX = path.resolve(process.argv[2] || ".");
const R4FIX = path.resolve(process.argv[3] || "/workspace/tls-nov24");
const OLD24D = path.resolve(process.argv[4] || "/workspace/tls-24d");
const SAVE540 = process.argv[5] || "/workspace/nov24/save540.json";
const SAVE535 = process.argv[6] || "/workspace/nov24/save535.json";
const SAVE548 = process.argv[7] || "/workspace/nov24/mars-copies/damaged-export-548.json";
const raw540 = fs.readFileSync(SAVE540, "utf8");
const raw535 = fs.readFileSync(SAVE535, "utf8");
const raw548 = fs.readFileSync(SAVE548, "utf8");

const LINK = "/tmp/onum-scrubswap";
const point = (to) => { try { fs.unlinkSync(LINK); } catch (e) {} fs.symlinkSync(to, LINK); };
let bad = 0;
const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };

point(FIX);
const srv = await startServer(LINK);
const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const errs = [];
const page = await newPage(br, errs);

const waitSave = () => page.evaluate(() => new Promise((res) => {
  try { window.ONUM.n24.save(); } catch (e) {}
  const t0 = Date.now();
  const ck = () => {
    const s = window.ONUM.n24.sv();
    if ((!s.busy && !s.pending) || Date.now() - t0 > 60000) setTimeout(res, 1000);
    else setTimeout(ck, 200);
  };
  setTimeout(ck, 300);
}));

const inspectMade = async () => {
  await page.evaluate(() => {
    try { window.pbOpen && window.pbOpen(); } catch (e) {}
    if (window.onumDoc) window.onumDoc.open("made");
  });
  await delay(600);
  const res = await page.evaluate(() => {
    const G = NEPTUNE.debug().G;
    const cards = window.onumDoc.madeCards();
    const cur = cards.filter(c => c.status === "current").length;
    const stale = cards.filter(c => c.status === "stale").length;
    const unk = cards.filter(c => c.status === "unknown").length;
    const setting = cards.filter(c => c.setting).length;
    const cardEl = document.getElementById("card");
    const txt = cardEl ? cardEl.innerText : "";
    const more = cardEl ? cardEl.querySelector("details.od-more") : null;
    if (more) more.open = true;
    const fullTxt = cardEl ? cardEl.innerText : "";
    const rawTags = (fullTxt.match(/\((?:you|country|world|weather|calendar|treasury)\.[a-z_]+\)|\((?:calendar|weather)\)/gi) || []).length;
    const rawRe = /\((?:you|country|world|bill|weather|calendar|G|m|s)\.[a-z0-9_]+\)/i;
    let engRaw = 0;
    (function walk(v) {
      if (typeof v === "string") { if (rawRe.test(v)) engRaw++; }
      else if (v && typeof v === "object") { for (const k in v) walk(v[k]); }
    })(G.eng);
    const echoBadges = (fullTxt.match(/Setting echo, not knowledge/gi) || []).length;
    const stillTile = /Still current[\s\S]{0,30}?(\d+) of (\d+)/i.exec(fullTxt);
    const sovCur = cards.some(c => /sovereign/i.test(c.question) && c.status === "current");
    document.getElementById("gcClose")?.click();
    return { total: cards.length, cur, stale, unk, setting, rawTags, engRaw, echoBadges, stillTile: stillTile ? stillTile[1] + "/" + stillTile[2] : null, sovCur };
  });
  await delay(300);
  return res;
};

try {
  /* 1. Fresh 540 on fix build + save + reload */
  point(FIX);
  await seedIdb(page, origin, raw540);
  await continueCareer(page, origin);
  const mFresh = await inspectMade();
  ok(mFresh.total === 16 && mFresh.unk === 0 && mFresh.cur >= 4 && mFresh.stale >= 10 && mFresh.setting === 6,
    "Fresh 540 Continue: madeCards resolves all 16 cards (" + mFresh.cur + " current / " + mFresh.stale + " stale / " + mFresh.setting + " setting / " + mFresh.unk + " unknown)");
  ok(mFresh.echoBadges === 6 && mFresh.sovCur && mFresh.stillTile === mFresh.cur + "/16",
    "Fresh 540 UI: 6 'Setting echo, not knowledge' badges, sovereign Current, tile=" + mFresh.stillTile);
  ok(mFresh.rawTags === 0 && mFresh.engRaw === 0,
    "Fresh 540: zero raw field tags on screen (" + mFresh.rawTags + ") or in G.eng (" + mFresh.engRaw + ")");

  await waitSave();
  await continueCareer(page, origin);
  const mReload = await inspectMade();
  ok(mReload.unk === 0 && mReload.cur === mFresh.cur && mReload.stale === mFresh.stale && mReload.setting === 6 && mReload.echoBadges === 6 && mReload.rawTags === 0,
    "Fresh 540 save+reload: preserves " + mReload.cur + " current / " + mReload.stale + " stale / " + mReload.setting + " setting, 0 raw tags");

  /* 2. Exact MARS migration path: load 540 on r4fix (71b89b7), save so it is scrubbed, then load on fix */
  point(R4FIX);
  await seedIdb(page, origin, raw540);
  await continueCareer(page, origin);
  await waitSave();
  const scrubbedOnR4 = await page.evaluate(() => {
    const finds = (NEPTUNE.debug().G.eng && NEPTUNE.debug().G.eng.made && NEPTUNE.debug().G.eng.made.finds) || [];
    return finds.map(f => f.claim).slice(-4);
  });
  ok(scrubbedOnR4.every(c => !/\(you\.name\)|\(calendar\)|\(weather\)|\(country\.name\)/.test(c)),
    "r4fix scrubbed G.eng.made.finds on save (" + JSON.stringify(scrubbedOnR4[scrubbedOnR4.length - 1]) + ")");

  point(FIX);
  await continueCareer(page, origin);
  const mMigrated = await inspectMade();
  ok(mMigrated.total === 16 && mMigrated.unk === 0 && mMigrated.cur === mFresh.cur && mMigrated.stale === mFresh.stale && mMigrated.setting === 6,
    "Migrated r4fix save on fix build: " + mMigrated.cur + " current / " + mMigrated.stale + " stale / " + mMigrated.setting + " setting / " + mMigrated.unk + " unknown");
  ok(mMigrated.echoBadges === 6 && mMigrated.sovCur && mMigrated.rawTags === 0 && mMigrated.engRaw === 0,
    "Migrated r4fix UI: 6 setting echoes, sovereign Current, 0 raw tags");
  await waitSave();
  await continueCareer(page, origin);
  const mMigReload = await inspectMade();
  ok(mMigReload.unk === 0 && mMigReload.cur === mFresh.cur && mMigReload.stale === mFresh.stale && mMigReload.setting === 6,
    "Migrated save+reload: preserves " + mMigReload.cur + " current / " + mMigReload.stale + " stale / " + mMigReload.setting + " setting");

  /* 3. Economy report Risks guilder value equals Headline guilder index on 540 & 535 */
  for (const [label, raw] of [["540", raw540], ["535", raw535]]) {
    if (label === "535") { await seedIdb(page, origin, raw); await continueCareer(page, origin); }
    await page.evaluate(() => window.onumDoc.open("econ"));
    await delay(500);
    const econ = await page.evaluate(() => {
      const txt = (document.getElementById("card") || {}).innerText || "";
      const mHead = /Guilder index\s+([0-9]+\.[0-9]+)/.exec(txt);
      const mRisk = /The guilder is at\s+([0-9]+\.[0-9]+)/.exec(txt);
      document.getElementById("gcClose")?.click();
      return { head: mHead && mHead[1], risk: mRisk && mRisk[1] };
    });
    ok(econ.head && econ.risk && econ.head === econ.risk,
      "Econ " + label + ": Risks guilder (" + econ.risk + ") === Headline (" + econ.head + ")");
    await delay(250);
  }

  /* 4. Recovery without backup: accurate range (>=445, not 105) + red notice shown ONCE, not on reload */
  point(OLD24D);
  await seedIdb(page, origin, raw540);
  await continueCareer(page, origin);
  await page.evaluate(() => new Promise((r) => { window.ONUM.history.condense((i) => r(i)); setTimeout(() => r(null), 90000); }));
  await waitSave();
  await page.evaluate(() => new Promise((res) => {
    const rq = indexedDB.open("onum-saves", 1);
    rq.onsuccess = () => {
      const tx = rq.result.transaction("s", "readwrite");
      tx.objectStore("s").delete("hist-backup");
      tx.objectStore("s").delete("hist-backup-legacy");
      tx.oncomplete = () => { rq.result.close(); res(); };
    };
  }));
  point(FIX);
  await continueCareer(page, origin);
  for (let i = 0; i < 60; i++) {
    const done = await page.evaluate(() => !!NEPTUNE.debug().G.histRecovery && !window.ONUM.history.recovering());
    if (done) break;
    await delay(300);
  }
  await delay(500);
  const rec1 = await page.evaluate(() => {
    const G = NEPTUNE.debug().G;
    const dlMin = (G.daylog || []).reduce((m, x) => Math.min(m, x.d), 1e9);
    const j = (G.journal || []).filter(x => /History recovery/.test(x && x.t || ""));
    const cl = (window.NEPTUNE_CLARITY && window.NEPTUNE_CLARITY.items || []).filter(x => /History recovery/.test(x && x.text || ""));
    const fd = (G.feed || []).filter(x => /History recovery/.test(x && x.t || ""));
    return { rec: G.histRecovery, dlMin, jLen: j.length, jText: j[0] && j[0].t, clLen: cl.length, clTitle: cl[0] && cl[0].title, fdLen: fd.length, fdKind: fd[0] && fd[0].kind };
  });
  ok(rec1.rec && rec1.rec.missing.length === 1 && rec1.rec.missing[0][0] === 445 && rec1.rec.missing[0][1] === rec1.dlMin - 1,
    "No-backup 540-condense missing range starts at 445 (" + JSON.stringify(rec1.rec && rec1.rec.missing) + ", dlMin=" + rec1.dlMin + ", not 105-" + (rec1.dlMin - 1) + ")");
  ok(rec1.jLen === 1 && /445/.test(rec1.jText || "") && rec1.clLen === 1 && rec1.clTitle === "Notice" && rec1.fdLen === 1 && rec1.fdKind === "big",
    "No-backup recovery shows red notice once on first load (jLen=" + rec1.jLen + ", clLen=" + rec1.clLen + ", fdKind=" + rec1.fdKind + ")");

  await waitSave();
  await continueCareer(page, origin);
  await delay(2500);
  const rec2 = await page.evaluate(() => {
    const G = NEPTUNE.debug().G;
    const j = (G.journal || []).filter(x => /History recovery/.test(x && x.t || ""));
    const cl = (window.NEPTUNE_CLARITY && window.NEPTUNE_CLARITY.items || []).filter(x => /History recovery/.test(x && x.text || ""));
    const fd = (G.feed || []).filter(x => /History recovery/.test(x && x.t || ""));
    return { rec: G.histRecovery, jLen: j.length, clLen: cl.length, fdLen: fd.length };
  });
  ok(rec2.jLen === 1 && rec2.clLen === 0 && rec2.fdLen === 1,
    "Reload after no-backup recovery does NOT repeat notice or duplicate journal (jLen=" + rec2.jLen + ", clLen=" + rec2.clLen + ", fdLen=" + rec2.fdLen + ")");

  /* 5. MARS damaged export at day 548, no backup: exact lost span 445-518 */
  point(FIX);
  await seedIdb(page, origin, raw548);
  await continueCareer(page, origin);
  for (let i = 0; i < 60; i++) {
    const done = await page.evaluate(() => !!NEPTUNE.debug().G.histRecovery && !window.ONUM.history.recovering());
    if (done) break;
    await delay(300);
  }
  await delay(500);
  const recM1 = await page.evaluate(() => {
    const G = NEPTUNE.debug().G;
    const j = (G.journal || []).filter(x => /History recovery/.test(x && x.t || ""));
    const cl = (window.NEPTUNE_CLARITY && window.NEPTUNE_CLARITY.items || []).filter(x => /History recovery/.test(x && x.text || ""));
    const fd = (G.feed || []).filter(x => /History recovery/.test(x && x.t || ""));
    return { rec: G.histRecovery, day: G.day, dlMin: (G.daylog || []).reduce((m, x) => Math.min(m, x.d), 1e9), jLen: j.length, jText: j[0] && j[0].t, clLen: cl.length, clTitle: cl[0] && cl[0].title, fdLen: fd.length, fdKind: fd[0] && fd[0].kind };
  });
  ok(recM1.day === 548 && recM1.rec && JSON.stringify(recM1.rec.missing) === JSON.stringify([[445, 518]]),
    "MARS damaged day-548 no-backup missing range is exactly 445-518 (" + JSON.stringify(recM1.rec && recM1.rec.missing) + ", day=" + recM1.day + ", dlMin=" + recM1.dlMin + ")");
  ok(recM1.jLen === 1 && /445/.test(recM1.jText || "") && /518/.test(recM1.jText || "") && recM1.clLen === 1 && recM1.clTitle === "Notice" && recM1.fdLen === 1 && recM1.fdKind === "big",
    "MARS damaged no-backup shows red notice once (jLen=" + recM1.jLen + ", clLen=" + recM1.clLen + ", fdKind=" + recM1.fdKind + ")");

  await waitSave();
  await continueCareer(page, origin);
  await delay(2500);
  const recM2 = await page.evaluate(() => {
    const G = NEPTUNE.debug().G;
    const j = (G.journal || []).filter(x => /History recovery/.test(x && x.t || ""));
    const cl = (window.NEPTUNE_CLARITY && window.NEPTUNE_CLARITY.items || []).filter(x => /History recovery/.test(x && x.text || ""));
    const fd = (G.feed || []).filter(x => /History recovery/.test(x && x.t || ""));
    return { rec: G.histRecovery, jLen: j.length, clLen: cl.length, fdLen: fd.length };
  });
  ok(recM2.jLen === 1 && recM2.clLen === 0 && recM2.fdLen === 1 && JSON.stringify(recM2.rec && recM2.rec.missing) === JSON.stringify([[445, 518]]),
    "Reload of MARS damaged save does NOT repeat notice (jLen=" + recM2.jLen + ", clLen=" + recM2.clLen + ", fdLen=" + recM2.fdLen + ", missing=" + JSON.stringify(recM2.rec && recM2.rec.missing) + ")");

  ok(errs.length === 0, "Zero page errors (" + errs.length + ")");
} catch (e) {
  ok(false, "threw: " + (e && e.stack || e));
}
await br.close();
srv.close();
try { fs.unlinkSync(LINK); } catch (e) {}
console.log(bad ? "\nFAILED " + bad : "\nall passed");
process.exit(bad ? 1 : 0);
