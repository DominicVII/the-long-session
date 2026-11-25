#!/usr/bin/env node
/* 20261124d JUPITER: history tiers + Engine ask accessor, on a COPY of the day-540 save.
   - Nothing the player did vanishes without a record
   - A day-100 law is still citable after condense
   - Save size of the tracked logs does not grow per old conversation
   - Documents built when opened do not grow the save by 10% or more
   - Engine ask never answers from a single shared word, and numbers match the simulation
   Usage: node qa/nov24-history.mjs [worktree] [save.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay, resumeIfPaused } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const SAVE = process.argv[3] || "/workspace/nov24/save540.json";
const raw = fs.readFileSync(SAVE, "utf8");
const disk = JSON.parse(raw);
if (disk.day !== 540) { console.log("FAIL reference save is day " + disk.day + ", expected 540 (file was not written by this test)"); process.exit(1); }
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch(); const errs = []; const page = await newPage(br, errs);
await seedIdb(page, origin, raw);
const cont = await continueCareer(page, origin);
const st = await page.evaluate(() => ({ day: window.ONUM.day().day, running: !!(window.ONUM && window.ONUM.running && window.ONUM.running()) }));
ok(cont.running && st.day === 540, "Continue opens day 540 (G.day " + st.day + ", label " + JSON.stringify(cont.label) + ")");
const before = await page.evaluate(() => window.ONUM.history.measure());
ok(!!before && before.day === 540, "measured the day-540 career before condense (" + JSON.stringify({tlog: before.tlog, daylog: before.daylog, total: before.totalTracked}) + ")");
console.log("SIZE before", before);
/* plant a day-100 law if the career does not already have one, without touching the file on disk */
const planted = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const L = G.statute || (G.statute = []);
  let s = L.find(x => x && +x.day === 100);
  if (!s) {
    s = { title: "Day One Hundred Test Act", congress: 2, day: 100, aye: 91, no: 88, fate: "carried", id: "hist-test-100", why: "planted only in this running copy for the citation test", clauses: ["kept on the roll"] };
    L.push(s);
  }
  return { title: s.title, aye: s.aye, no: s.no, day: s.day, id: s.id || null };
});
const youOld = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const floor = (G.day || 1) - 29;
  return (G.daylog || []).filter(x => x && x.you && x.d < floor).map(x => ({ d: x.d, t: String(x.t || "").slice(0, 80) }));
});
const cond = await page.evaluate(() => new Promise((resolve) => {
  window.ONUM.history.condense((info) => resolve(info));
  setTimeout(() => resolve({ ok: false, reason: "timeout" }), 60000);
}));
ok(cond && cond.ok, "histCondense succeeded (" + JSON.stringify({ reason: cond && cond.reason, records: cond && cond.records, eras: cond && cond.eras, backed: cond && cond.backed }) + ")");
const after = await page.evaluate(() => window.ONUM.history.measure());
console.log("SIZE after", after);
ok(after.totalTracked < before.totalTracked, "tracked save size shrank after condense (" + before.totalTracked + " → " + after.totalTracked + ", " + Math.round(100 * after.totalTracked / before.totalTracked) + "%)");
ok(after.tlog < before.tlog && after.daylog < before.daylog, "vivid logs dropped the older entries (tlog " + before.tlog + "→" + after.tlog + ", daylog " + before.daylog + "→" + after.daylog + ")");
const vivid = await page.evaluate((vividDays) => {
  const G = NEPTUNE.debug().G;
  const floor = (G.day || 1) - vividDays + 1;
  const oldT = (G.tlog || []).filter(x => x && x.d < floor).length;
  const oldD = (G.daylog || []).filter(x => x && x.d < floor).length;
  const newT = (G.tlog || []).filter(x => x && x.d >= floor).length;
  const newD = (G.daylog || []).filter(x => x && x.d >= floor).length;
  return { floor, oldT, oldD, newT, newD, records: (G.histTier.records || []).length };
}, 30);
ok(vivid.oldT === 0 && vivid.oldD === 0, "no full log older than 30 days remains in tlog/daylog (old tlog " + vivid.oldT + ", old daylog " + vivid.oldD + ")");
ok(vivid.newT > 0 && vivid.newD > 0, "the last ~30 days stay vivid (tlog " + vivid.newT + ", daylog " + vivid.newD + ")");
ok(vivid.records > 0, "older days condensed into compact records (" + vivid.records + ")");
if (youOld.length) {
  const missing = await page.evaluate((acts) => {
    const G = NEPTUNE.debug().G;
    const rec = G.histTier.records || [];
    return acts.filter(a => !rec.some(r => r.d === a.d && (r.you || []).some(y => (y.t || "").slice(0, 40) === a.t.slice(0, 40) || (r.t || "").indexOf("you:") >= 0))).length;
  }, youOld);
  ok(missing === 0, "nothing the player did vanishes without a record (" + youOld.length + " older acts, missing " + missing + ")");
} else {
  ok(true, "no older player-flagged daylog acts in this copy (record rule still enforced when any exist)");
}
const cited = await page.evaluate((planted) => {
  const a = window.ONUM.history.citeLaw(100);
  const b = window.ONUM.history.citeLaw(planted.title);
  const one = Array.isArray(a) ? a.find(x => x.day === 100) : a;
  const G = NEPTUNE.debug().G;
  const sim = (G.statute || []).find(x => x && +x.day === 100);
  return { one, bTitle: b && (Array.isArray(b) ? b[0] : b) && (Array.isArray(b) ? b[0] : b).title, simAye: sim && sim.aye, simNo: sim && sim.no, ask: window.ONUM.engine.ask(planted.title) };
}, planted);
ok(cited.one && cited.one.day === 100 && cited.one.aye === planted.aye && cited.one.no === planted.no, "a day-100 law is still citable after condense (" + JSON.stringify(cited.one && { title: cited.one.title, aye: cited.one.aye, no: cited.one.no, day: cited.one.day }) + ")");
ok(cited.one && cited.one.aye === cited.simAye && cited.one.no === cited.simNo, "cited aye/no equal the simulation values (" + cited.simAye + "–" + cited.simNo + ")");
ok(cited.ask && cited.ask.sourceKind === "statute" && cited.ask.confidence === 1 && /100/.test(cited.ask.answer) && cited.ask.answer.indexOf(String(planted.aye)) >= 0, "Engine ask cites the same day-100 law with matching numbers (" + JSON.stringify(cited.ask && { answer: cited.ask.answer, ref: cited.ask.sourceRef }) + ")");
const harvest = await page.evaluate(() => window.ONUM.history.citeLaw("Harvest Visa Act"));
ok(harvest && (harvest.day === 105 || (Array.isArray(harvest) && harvest.some(x => x.day === 105))), "the career's own day-105 Harvest Visa Act is still on the roll");
/* conversations dated in the condensed window must not grow the tracked save */
const grew = await page.evaluate(() => new Promise((resolve) => {
  const G = NEPTUNE.debug().G;
  const floor = (G.day || 1) - 40;
  const before = window.ONUM.history.measure().totalTracked;
  for (let i = 0; i < 80; i++) (G.tlog = G.tlog || []).push({ d: floor, at: "12:00 pm", who: "A clerk", t: "A long conversation that should not live forever in the save: " + i + " " + "word ".repeat(20), k: "civ" });
  const mid = window.ONUM.history.measure().totalTracked;
  window.ONUM.history.condense((info) => {
    const after = window.ONUM.history.measure().totalTracked;
    resolve({ before, mid, after, ok: info && info.ok, grewMid: mid - before, grewAfter: after - before });
  });
}));
ok(grew.grewMid > 1000, "the planted conversations did enlarge the log before condense (+" + grew.grewMid + ")");
ok(grew.ok && grew.after <= grew.before * 1.02, "after condense, save size stops growing per conversation (before " + grew.before + ", after " + grew.after + ", delta " + grew.grewAfter + ")");
/* documents are built when opened, from numbers already in the save */
const docs = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const before = JSON.stringify(G.academy || {}).length;
  let texts = 0;
  try {
    const list = (window.onumAcademy && window.onumAcademy.list && window.onumAcademy.list()) || [];
    list.slice(0, 8).forEach(p => { const t = window.onumAcademy.text(p.no); if (t && t.length > 80) texts++; });
  } catch (e) { return { err: String(e), before }; }
  const after = JSON.stringify(G.academy || {}).length;
  return { before, after, texts, growth: after - before, pct: before ? (after - before) / before : 0 };
});
ok(!docs.err, "opening papers did not throw (" + JSON.stringify(docs) + ")");
ok(docs.growth <= 0 || docs.pct < 0.10, "documents built when opened do not grow the stored academy by 10% or more (before " + docs.before + ", after " + docs.after + ", " + Math.round((docs.pct || 0) * 1000) / 10 + "%)");
/* Engine mind logic: no shared-word answers, no field names, numbers match */
const asks = await page.evaluate(() => {
  const G = NEPTUNE.debug().G;
  const approval = Math.round(G.you.approval);
  const a = window.ONUM.engine.ask("cloud");
  const b = window.ONUM.engine.ask("star");
  const c = window.ONUM.engine.ask("What is my approval?");
  const d = window.ONUM.engine.ask("(you.name)");
  const e = window.ONUM.engine.ask("work");
  const own = (typeof engOwnVoice === "function") ? engOwnVoice("cloud", G.eng) : "";
  const fieldRe = /\([a-z_]+\.[a-z_]+\)/i;
  return {
    approval, a, b, c, d, e, own,
    cloudOk: a.sourceKind === "none" && !/weather|wind/i.test(a.answer || ""),
    starOk: b.sourceKind === "none" && !/fusion|sun\b/i.test(b.answer || ""),
    workOk: e.sourceKind === "none",
    apOk: c.sourceKind === "poll" && c.confidence === 1 && c.answer.indexOf(String(approval)) >= 0,
    fieldOk: ![a, b, c, d, e].some(x => fieldRe.test(x.answer || "")),
    ownOk: !/weather|wind/i.test(own || "")
  };
});
ok(asks.cloudOk, "asking 'cloud' is not answered with the weather (" + JSON.stringify(asks.a) + ")");
ok(asks.starOk, "asking 'star' is not answered from a shared word (" + JSON.stringify(asks.b) + ")");
ok(asks.workOk, "asking 'work' alone is not an economy answer (" + JSON.stringify(asks.e) + ")");
ok(asks.apOk, "approval answer equals the simulation value " + asks.approval + " (" + JSON.stringify(asks.c) + ")");
ok(asks.fieldOk && asks.d.sourceKind === "none", "no internal field names appear in answers (" + JSON.stringify(asks.d) + ")");
ok(asks.ownOk, "engOwnVoice('cloud') does not invent weather from a shared word (" + JSON.stringify(asks.own).slice(0, 180) + ")");
const backed = await page.evaluate(() => new Promise((resolve) => {
  try { window.ONUM.history.peekBackup((info) => resolve(info || { ok: false })); }
  catch (e) { resolve({ err: String(e) }); }
}));
ok(backed && backed.day === 540 && backed.tlog >= 16000 && backed.daylog >= 11000, "pre-condense backup is in IndexedDB (day " + (backed && backed.day) + ", tlog " + (backed && backed.tlog) + ", daylog " + (backed && backed.daylog) + ", " + (backed && backed.bytes) + " bytes), not in the career file on disk");
ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
/* the reference copies on disk must be untouched — this test only seeded a browser */
const disk2 = JSON.parse(fs.readFileSync(SAVE, "utf8"));
ok(disk2.day === 540 && !disk2.histTier, "the day-540 working copy on disk was not modified (still day " + disk2.day + ", no histTier written to the file)");
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed");
process.exit(bad ? 1 : 0);
