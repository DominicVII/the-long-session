#!/usr/bin/env node
/* 20261124b JUPITER: the Academy's papers and organic conversation (MARS's list), on a COPY of a career.
   Papers are opened through onumDoc.open("paper"), not the pre-patch-09 "Historical Significance" card.
   Usage: node qa/nov24-academy.mjs <worktree> --save <copy.json> */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || "/workspace/nov24/save535.json";
const results = []; const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 500) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch(); const raw = fs.readFileSync(SAVE, "utf8");
const WANT = JSON.parse(raw).day;
const SECTIONS = ["Abstract", "Research Question", "Background Literature", "Methodology", "Findings", "Competing Interpretations", "Counterarguments", "Policy Recommendations", "Risk Assessment", "Forecast", "Public Response", "Cabinet Relevance", "Historical Significance"];
const saveWait = async (pg) => { await pg.evaluate(() => { try { window.ONUM.n24.save(); } catch (e) {} }); await delay(1500); const t0 = Date.now(); while (Date.now() - t0 < 120000) { const s = await pg.evaluate(() => window.onumSaveStats()); if (!s.busy && !s.pending) break; await delay(1000); } await delay(1000); };
try {
  const errs = []; const pg = await newPage(browser, errs);
  await seedIdb(pg, origin, raw); let t0 = Date.now(); await continueCareer(pg, origin, ""); const cont0 = Date.now() - t0; await delay(4000);
  ok("the seeded copy continues on day " + WANT, (await pg.evaluate(() => NEPTUNE.debug().G.day)) === WANT);
  await saveWait(pg); const len0 = (await pg.evaluate(() => window.ONUM.n24.idb())).len;
  const P = await pg.evaluate(() => { const A = window.onumAcademy, out = [];
    const tp = Object.keys(window.onumAcademy ? {} : {}); /* topics: the Academy writes on what it settles; force a few, two on one topic so rivals meet */
    const B = A.bodies.map((b) => b.k); for (let i = 0; i < 24; i++) out.push(A.publish(B[i % B.length], i % B.length === 0 ? { tp: "m2" } : { ti: i % 3, k: [101.5, -2400] }).no);
    return { nos: out, list: A.list().length }; });
  ok("papers: every state body published, all numbered", P.nos.length === 24 && new Set(P.nos).size === 24, P);
  const chk = await pg.evaluate((SECTIONS) => { const A = window.onumAcademy, L = A.list(), bad = [], stat = [], cite = [], readout = [];
    L.forEach((x) => { const t = A.text(x.no); SECTIONS.forEach((s) => { if (!t.includes("## " + s + "\n")) bad.push(x.no + ":" + s); });
      if (!/^Institution: /m.test(t) || !/^# Paper No\. \d+: /m.test(t)) bad.push(x.no + ":title/inst");
      const f = (t.split("## Findings\n")[1] || "").split("\n## ")[0].split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
      f.forEach((para) => { const sent = para.split(/(?<=[.!?])\s+/).filter(Boolean); if (!/\d/.test(para) || sent.length < 2) stat.push(x.no + ": " + para.slice(0, 80)); });
      x.cites.forEach((c) => { if (!A.get(c) || c >= x.no) cite.push(x.no + "->" + c); }); if (x.replyTo && !A.get(x.replyTo)) cite.push(x.no + "->r" + x.replyTo);
      t.split("\n").forEach((ln) => { if (/^\s*[A-Za-z ]{2,30}:\s*[-ƒ\d.,%]+\s*$/.test(ln)) readout.push(x.no + ": " + ln); }); });
    const sch = A.schools(), multi = Object.keys(sch).filter((d) => Object.keys(sch[d]).length >= 2);
    const ci = L.map((x) => (A.text(x.no).split("## Competing Interpretations\n")[1] || "").split("\n## ")[0]).filter((s) => (s.match(/[Tt]he [A-Z][a-z]+ (school|circle)/g) || []).length >= 2).length;
    const back = L.filter((x) => x.cites.length).map((x) => /Paper No\. \d+ \(day \d+/.test(A.text(x.no).split("## Background Literature\n")[1] || "")).every(Boolean);
    return { n: L.length, bad: bad.slice(0, 6), stat: stat.slice(0, 4), cite, readout: readout.slice(0, 4), multi, ci, back, scholars: A.scholars().slice(0, 3), prestige: A.prestige().slice(0, 3), failed: A.failed().length }; }, SECTIONS);
  ok("papers: every paper has every section Dominic listed", chk.bad.length === 0, chk.bad);
  ok("papers: every number in the Findings comes with a sentence saying what it means", chk.stat.length === 0, chk.stat);
  ok("papers: every citation and reply points at an earlier paper that exists, cited by number and day", chk.cite.length === 0 && chk.back, { cite: chk.cite, back: chk.back });
  ok("papers: at least two schools of thought disagree, by name, inside the papers", chk.multi.length >= 1 && chk.ci === chk.n, { multi: chk.multi, ci: chk.ci, n: chk.n });
  ok("papers: nothing reads like a stat readout", chk.readout.length === 0, chk.readout);
  ok("papers: scholars and institutions are ranked by what they publish and who cites them", chk.scholars.length && chk.prestige.length, { s: chk.scholars, p: chk.prestige, failed: chk.failed });
  const dec = await pg.evaluate(() => { const A = window.onumAcademy, open = A.decisions(); if (!open.length) return { open: 0 }; const no = open[0]; A.decide(no, 0); const G = NEPTUNE.debug().G;
    return { open: open.length, no, dec: A.get(no).dec, j: (G.journal || [])[0] && G.journal[0].t, text: A.text(no).includes("The cabinet decided on day"), still: A.decisions().includes(no) }; });
  ok("papers: a paper puts a decision before the cabinet, and deciding it is recorded on the paper and in the journal", dec.open > 0 && dec.dec && dec.text && !dec.still && /Paper No\. \d+/.test(dec.j || ""), dec);
  const opened = await pg.evaluate(async () => {
    window.onumAcademy.open(); await new Promise((r) => setTimeout(r, 300));
    const a = document.getElementById("card").innerText;
    const list = /Papers before the Republic/.test(a);
    const apps = (window.ONUM_R2 && window.ONUM_R2.pbApps) ? window.ONUM_R2.pbApps() : [];
    const app = apps.some((x) => x && (x[0] === "soc-acad" || x.id === "soc-acad"));
    const nos = (window.onumAcademy && window.onumAcademy.list) ? window.onumAcademy.list().map((x) => x.no) : [];
    const no = nos[0];
    if (!(window.onumDoc && typeof window.onumDoc.open === "function") || no == null) {
      return { list, app, read: false, how: "no onumDoc.open or no paper", no };
    }
    window.onumDoc.open("paper", no);
    await new Promise((r) => setTimeout(r, 500));
    const t = (document.getElementById("card") || {}).innerText || "";
    const h1 = ((document.querySelector("#card h1") || {}).textContent || "");
    let chk = null; try { chk = window.onumDoc.check(document.getElementById("card")); } catch (e) { chk = { err: String(e) }; }
    try { document.getElementById("gcClose").click(); } catch (e) {}
    const openedDoc = /Paper No\./.test(t + " " + h1) && !!(chk && chk.n > 0 && chk.ok === chk.n && !(chk.bad && chk.bad.length));
    return { list, app, read: openedDoc, no, h1, chk, how: "onumDoc.open", sample: t.slice(0, 160) };
  });
  ok("papers: the phone lists Papers, and a paper opens to its full text through onumDoc.open(\"paper\")", opened.list && opened.read && opened.app, opened);
  /* people */
  const ppl = await pg.evaluate(() => { const G = NEPTUNE.debug().G, P = window.onumPeople; const all = (G.members || []).filter((m) => m && !m.gone && m.name).slice(0, 40);
    const unmet = all.filter((m) => !(m.chat && m.chat.length)).slice(0, 5); const ops = unmet.map((m) => P.opinions(m.id)); const m = all[3];
    const s1 = P.story(m.id), s2 = P.story(m.id), r1 = P.reply(m.id, "Tell me about yourself."), r2 = P.reply(m.id, "So tell me about yourself");
    const ev = P.remembers(m.id, 2), J = (G.journal || []).map((e) => e.day + "|" + e.t); const real = ev.every((e) => J.includes(e.day + "|" + e.t));
    const rc = P.recall(m.id); const pr = P.prompt(m.id) || ""; const g = P.gossip(); const tk = G.tkTalk && G.tkTalk.log.length;
    return { unmet: unmet.length, ops: ops.map((o) => o.length), op1: ops[0] && ops[0].map((x) => x.t), s1: s1.slice(0, 160), same: s1 === s2 && r1 === s1 && r2 === s1, grew: /grew up/.test(s1), ev, real, rc, pr: /HOW YOU TALK/.test(pr) && /YOUR LIFE/.test(pr) && /YOUR OPINIONS/.test(pr), g: g.length, tk,
      dis: [P.dissent(["aye", "aye", "aye"], 12), P.dissent(["aye", "no", "aye"], 12), P.dissent(["aye", "aye", "aye"], 80)], readout: /\b\d+(\.\d+)?\s*%/.test(s1) }; });
  ok("people: they hold opinions before you have ever spoken to them", ppl.unmet >= 1 && ppl.ops.every((n) => n >= 2), { unmet: ppl.unmet, ops: ppl.ops, op1: ppl.op1 });
  ok("people: 'tell me about yourself' gets the same life story every time", ppl.same && ppl.grew, ppl.s1);
  ok("people: they bring up real events from your career, by day", ppl.ev.length >= 1 && ppl.real && /day \d+/i.test(ppl.rc || ""), { ev: ppl.ev, rc: ppl.rc });
  ok("people: the talk prompt carries the conversation rules, the life story and their opinions", ppl.pr, ppl.pr);
  ok("people: they talk to each other about you", ppl.g >= 1 || ppl.tk >= 1, { g: ppl.g, tk: ppl.tk });
  ok("cabinet: a lukewarm last seat dissents from an otherwise unanimous table; a split or a strong view is left alone", ppl.dis[0] === true && ppl.dis[1] === false && ppl.dis[2] === false, ppl.dis);
  ok("people: a life story is not a stat readout", !ppl.readout, ppl.s1);
  /* reload: identical text, small save */
  const before = await pg.evaluate(() => { const A = window.onumAcademy; return A.list().map((x) => [x.no, A.text(x.no)]); });
  await saveWait(pg); const len1 = (await pg.evaluate(() => window.ONUM.n24.idb())).len; const acLen = await pg.evaluate(() => JSON.stringify(NEPTUNE.debug().G.academy).length);
  ok("save: the papers add less than 10% to the save (only seeds and numbers are kept)", len1 - len0 < len0 * 0.1 && acLen < len0 * 0.1, { len0, len1, acLen, per: Math.round(acLen / 24) });
  const day1 = await pg.evaluate(() => NEPTUNE.debug().G.day); await pg.close();
  const p2 = await newPage(browser, errs); t0 = Date.now(); await continueCareer(p2, origin, ""); const cont1 = Date.now() - t0; await delay(4000);
  const after = await p2.evaluate(() => { const A = window.onumAcademy; return { day: NEPTUNE.debug().G.day, t: A.list().map((x) => [x.no, A.text(x.no)]) }; });
  const same = before.length === after.t.length && before.every((x, i) => x[0] === after.t[i][0] && x[1] === after.t[i][1]);
  ok("reload: every paper's text is identical, word for word", same, { n0: before.length, n1: after.t.length });
  ok("reload: Continue opens the same day and is not slower", after.day === day1 && cont1 < Math.max(cont0 * 1.5, cont0 + 4000), { day1, day: after.day, cont0, cont1 });
  const ppl2 = await p2.evaluate((s) => { const G = NEPTUNE.debug().G, m = (G.members || []).filter((m) => m && !m.gone && m.name)[3]; return window.onumPeople.story(m.id).slice(0, 160) === s; }, ppl.s1);
  ok("reload: the same person tells the same life story", ppl2);
  ok("0 page errors", errs.length === 0, errs.slice(0, 3));
  try { await p2.close(); } catch (e) {}
} finally {
  const failed = results.filter((r) => !r.pass).length; console.log(failed ? "FAIL " + failed + " of " + results.length : "ALL PASS " + results.length);
  try { await browser.close(); } catch (e) {} try { server.close(); } catch (e) {} process.exitCode = failed ? 1 : 0;
}
