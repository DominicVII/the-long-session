#!/usr/bin/env node
/* 20261117o JUPITER: systems suite for the Nov 17 asks (A engine scale, B fixed vote, C cabinet/briefs/sitting, D people, boot).
   Usage: node qa/nov17-systems.mjs <worktree> [--save /path/to/a/COPY/of/a/career.json]
   Without --save only the save-free cases run. The save file is only read, never written. Exit 1 on any failure. */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || null;
const results = []; const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 400) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch();
async function boot(qs) { const errs = []; const page = await newPage(browser, errs);
  await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded" }); await page.evaluate(() => { try { localStorage.clear(); indexedDB.deleteDatabase("onum-saves"); } catch (e) {} });
  await page.goto(origin + "/session.html" + qs, { waitUntil: "domcontentloaded", timeout: 180000 }); await delay(9000);
  const lim = await page.evaluate(() => window.onumLimDump ? onumLimDump() : null); await page.close(); return { errs, lim }; }
try {
  /* boot: default, classic, max; and the limits each one sets */
  for (const qs of ["", "?limits=classic", "?limits=max"]) { const r = await boot(qs); ok("boot " + (qs || "default") + " has 0 page errors", r.errs.length === 0, r.errs.slice(0, 3));
    if (qs === "") ok("A limits: default is uncapped (npc, cap, seats, asks per day all inf) and keeps the frame budget", r.lim && ["npc", "cap", "seats", "apPerDay", "hist", "letters"].every((k) => r.lim[k] === "inf") && r.lim.tickMs === 3 && r.lim.engBudgetMax === 10, r.lim);
    if (qs === "?limits=classic") ok("A limits: ?limits=classic still restores the old numbers", r.lim && r.lim.npc === 1 && r.lim.apPerDay === 3 && r.lim.mode === "classic", r.lim && { npc: r.lim.npc, ap: r.lim.apPerDay }); }
  /* D: file:// play (Play.bat, Play.ps1) draws people from the classic bundle; it must carry the 20261111c finish (eyes, mouth, buttons past 3.5 m, pocket square) */
  { const errs = []; const page = await newPage(browser, errs);
    await page.goto("file://" + ROOT + "/session.html", { waitUntil: "domcontentloaded", timeout: 180000 });
    await page.waitForFunction(() => !!window.ONUM_NEPTUNE, { timeout: 60000 }).catch(() => {});
    const src = await page.evaluate(() => { try { return String(window.ONUM_NEPTUNE.chars.makeCharacter); } catch (e) { return ""; } });
    ok("D people: file:// bundle has the finished figure (LOD 7/16/34, fine face kept to the far proxy, pocket square)", /\[7, 16, 34\]/.test(src) && /pocksq/.test(src) && /m\.visible = card \? l <= 1 : l < 3/.test(src), { len: src.length, lod: (src.match(/lodDistances \|\| \[[^\]]+\]/) || [""])[0] });
    await page.close(); }
  /* E: opening the Engine must open the Engine (20261116c's second onumWorldCard replaced it with the open-world card) */
  { const errs = []; const page = await newPage(browser, errs); await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded" }); await delay(9000);
    const r = await page.evaluate(async () => { try { ndEngCard(); } catch (e) {} await new Promise((x) => setTimeout(x, 300)); return { t: ((document.querySelector("#card h2, #card .card__title, #card h1") || {}).textContent || "").trim().slice(0, 60), ch: !!document.getElementById("chOut") }; });
    ok("E engine file: opening the Engine opens the Engine card and the maker's channel (no save)", r.ch && /Engine/.test(r.t), r); await page.close(); }
  if (SAVE) {
    const raw = fs.readFileSync(SAVE, "utf8");
    /* first load: continuity, engine, fixed vote, docket, speak, E-talk, ✕ */
    { const errs = []; const page = await newPage(browser, errs);
      await seedIdb(page, origin, raw); let c; try { c = await continueCareer(page, origin, ""); } catch (e) { c = { label: await page.evaluate(() => (document.getElementById("cont") || document.getElementById("card") || document.body).innerText.slice(0, 160)), err: String(e).slice(0, 80) }; }
      ok("save: Continue offers and opens the IDB career intact", /Continue/.test(c.label || "") && c.running && !c.broken, c);
      if (!c.running) { ok("save: (later save cases skipped: the career never opened)", false); await page.close(); throw new Error("career did not open"); }
      await delay(6000);
      const e0 = await page.evaluate(() => { const G = NEPTUNE.debug().G, E = G.eng || {}; return { p: E.p, c: E.compute, t: E.talent, beyond: E.beyond, open: E.scaleOpen, day: G.day, you: G.you && G.you.name, bill: G.bill && G.bill.id }; });
      ok("A engine: an open-scale Engine is restored above 100 (capability, compute, talent)", e0.p > 100 && e0.c > 100 && e0.t > 100, e0);
      await delay(15000);
      const e1 = await page.evaluate(() => { const E = NEPTUNE.debug().G.eng || {}; return { p: E.p, c: E.compute, t: E.talent }; });
      ok("A engine: it stays above 100 while the world runs (no clamp comes back)", e1.p > 100 && e1.c > 100, e1);
      const v0 = await page.evaluate(() => { const G = NEPTUNE.debug().G; return { myVote: G.bill && G.bill.myVote, vote: G.you.vote, voteBill: G.you.voteBill, bill: G.bill && G.bill.id }; });
      ok("B fixed vote: the stance saved by an older build is kept on the current bill", v0.myVote === 1 && v0.voteBill === v0.bill, v0);
      const dk = await page.evaluate(() => { try { const its = ONUM_N17.dkItems(); ONUM_N17.dkCard(0); const r = document.querySelector("[data-myvote-row]"); return { n: its.length, kinds: its.map((x) => x.kind), row: r ? r.innerText.slice(0, 200) : null }; } catch (e) { return { err: String(e) }; } });
      ok("B fixed vote: the docket shows the bill in Congress with your fixed vote", dk.row && /fixed/i.test(dk.row), dk);
      const v1 = await page.evaluate(async () => { const b = document.querySelector('[data-dkmv="-1"]'); if (b) b.click(); await new Promise((r) => setTimeout(r, 400)); const G = NEPTUNE.debug().G; let mv = null; try { mv = ONUM_N17.memberVote(G.you, G.bill); } catch (e) {} return { clicked: !!b, myVote: G.bill.myVote, vote: G.you.vote, mv }; });
      ok("B fixed vote: setting it against from the docket sticks to the bill and is the vote you cast", v1.clicked && v1.myVote === -1 && v1.vote === -1 && v1.mv === -1, v1);
      await page.evaluate(() => { try { ONUM_N17.setMyVote(1, NEPTUNE.debug().G.bill); } catch (e) {} const b = document.getElementById("dkClose"); if (b) b.click(); });
      const bf = await page.evaluate(async () => { try { ONUM_N17.presBrief(); } catch (e) { return "nofn"; } await new Promise((r) => setTimeout(r, 600)); const b = document.querySelector('[data-pb2="treasury:0"]'); if (b) b.click(); await new Promise((r) => setTimeout(r, 400)); return (document.getElementById("pb2_treasury") || {}).textContent || null; });
      ok("C briefs: a brief's choice is put to the table, aye and nay by name, carried or lost", bf && /Aye:/.test(bf) && /Nay:/.test(bf) && /(Carried|Lost)/.test(bf), bf);
      await page.evaluate(() => { try { veil.hidden = true; } catch (e) {} });
      const s0 = await page.evaluate(() => ({ s: (window.ONUM_SESSION || {}).stage, chair: (window.ONUM_SESSION || {}).chairId }));
      if (s0.s && s0.s !== "idle") {
        const sp = await page.evaluate(() => { try { return window.onumSession.speak("Let us begin with the border."); } catch (e) { return String(e); } });
        ok("C sitting: the chair can speak at the " + s0.s + " stage", sp === true, { stage: s0.s, sp });
        const et = await page.evaluate(async () => { const D = NEPTUNE.debug(), G = D.G, S = window.ONUM_SESSION || {}; const seat = new Set((S.seats || []).map((x) => String(x.personId)));
          const m = D.hereNow().find((p) => p && p !== G.you && !seat.has(String(p.id))) || D.hereNow().find((p) => p && p !== G.you); if (!m) return { none: true };
          m._timeOk = true; G.running = true; ONUM_N17.openTalk(m); await new Promise((r) => setTimeout(r, 600)); const open = ONUM_N17.talkOpen(); try { ONUM_N17.closeTalk(); } catch (e) {} return { who: m.name, open }; });
        ok("C sitting: the chair can take someone aside (E-talk) mid-sitting", et.open === true, et);
        const x = await page.evaluate(async () => { const b = document.querySelector("#sxParkBar [data-p=close]"); if (b) b.click(); else if (window.onumEndChairedSitting) onumEndChairedSitting("qa"); await new Promise((r) => setTimeout(r, 5000)); return { bar: !!b, s: (window.ONUM_SESSION || {}).stage || "idle" }; });
        ok("C sitting: closing the chaired sitting ends it and it does not reopen", x.s === "idle", x);
      } else ok("C sitting: a chaired sitting was open to test", false, s0);
      /* the Engine's file: every way in opens the Engine card with the maker's channel, and the file is written */
      const op = await page.evaluate(async () => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); const title = () => ((document.querySelector("#card h2, #card .card__title, #card h1") || {}).textContent || "").trim().slice(0, 60); const r = {};
        try { ndEngCard(); } catch (e) { r.e1 = String(e); } await w(300); r.direct = { t: title(), ch: !!document.getElementById("chOut") };
        try { const P = NEPTUNE.debug().PROPS.engine.find((x) => x.id === "engmach"); P.acts()[0].run(); } catch (e) { r.e2 = String(e); } await w(500); r.station = { t: title(), ch: !!document.getElementById("chOut") };
        try { window.onumBoardCard(); await w(300); const b = document.getElementById("bdEng"); r.bd = !!b; if (b) b.click(); } catch (e) { r.e3 = String(e); } await w(500); r.board = { t: title(), ch: !!document.getElementById("chOut") };
        return r; });
      ok("E engine file: the Engine card opens with the maker's channel (direct, the Engine station, the election board)", op.direct.ch && op.station.ch && op.board.ch && [op.direct, op.station, op.board].every((x) => /Engine/.test(x.t) && !/walk/i.test(x.t)), op);
      { const dl = "/tmp/nov17-qa-dl-" + process.pid + "-" + Date.now(); fs.mkdirSync(dl, { recursive: true });
        const cdp = await page.target().createCDPSession(); await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: dl }).catch(() => cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: dl }));
        await page.evaluate(() => { try { ndEngCard(); } catch (e) {} const b = document.getElementById("chOut"); if (b) b.click(); });
        let files = []; for (let k = 0; k < 20 && !files.some((f) => /\.json$/.test(f)); k++) { await delay(500); files = fs.readdirSync(dl); }
        const f = files.find((x) => /^engine-channel-out-day\d+\.json$/.test(x)); let parsed = null; try { parsed = f ? JSON.parse(fs.readFileSync(dl + "/" + f, "utf8")) : null; } catch (e) {}
        ok("E engine file: 'Write the file for the writer' downloads engine-channel-out-dayN.json that parses", !!(parsed && parsed.kind === "engine-channel-out" && parsed.engine && parsed.engine.capability > 100), { files, size: f ? fs.statSync(dl + "/" + f).size : 0, cap: parsed && parsed.engine && parsed.engine.capability });
        try { fs.rmSync(dl, { recursive: true, force: true }); } catch (e) {} }
      { const fp = "/tmp/nov17-qa-in-" + process.pid + ".json"; fs.writeFileSync(fp, JSON.stringify({ kind: "engine-channel-in", letters: [{ text: "QA letter " + Date.now() }] }));
        let said = null; try { await page.evaluate(() => { try { ndEngCard(); } catch (e) {} });
          const [ch] = await Promise.all([page.waitForFileChooser({ timeout: 8000 }), page.evaluate(() => document.getElementById("chIn").click())]); await ch.accept([fp]);
          for (let k = 0; k < 30; k++) { await delay(500); said = await page.evaluate(() => (document.getElementById("gcSay") || {}).textContent || ""); if (/letter read|Nothing new/.test(said)) break; } } catch (e) { said = "err " + String(e).slice(0, 120); }
        ok("E engine file: 'Read a letter from the writer' reads engine-channel-in.json", /1 letter read/.test(said || ""), (said || "").slice(0, 120)); try { fs.unlinkSync(fp); } catch (e) {} }
      { const said = await page.evaluate(async () => { try { ndEngCard(); } catch (e) {} const ta = document.getElementById("chText"); if (!ta) return "no box"; ta.value = "QA pasted letter " + Date.now(); document.getElementById("chPaste").click();
          for (let k = 0; k < 30; k++) { await new Promise((r) => setTimeout(r, 500)); const t = (document.getElementById("gcSay") || {}).textContent || ""; if (/letter read/.test(t)) return t; } return (document.getElementById("gcSay") || {}).textContent; });
        ok("E engine file: a pasted letter is read and answered", /1 letter read/.test(said || ""), (said || "").slice(0, 120)); }
      ok("save: first load has 0 page errors", errs.length === 0, errs.slice(0, 3)); await page.close(); }
    /* second load: the cabinet vote, end to end */
    { const errs = []; const page = await newPage(browser, errs);
      await seedIdb(page, origin, raw); await continueCareer(page, origin, ""); await delay(5000);
      const cv = await page.evaluate(async () => { const st = () => (window.ONUM_SESSION || {}).stage; if (!st() || st() === "idle") return { noSitting: true };
        for (let k = 0; k < 10 && st() !== "decisions"; k++) { window.onumSession.next(); await new Promise((r) => setTimeout(r, 300)); }
        if (st() !== "decisions") return { stage: st() };
        window.onumSession.callVote(); const t0 = Date.now(); const G = NEPTUNE.debug().G;
        while (Date.now() - t0 < 30000 && !(G.bill && G.bill.cabinetVote)) await new Promise((r) => setTimeout(r, 500));
        return { cv: G.bill && G.bill.cabinetVote, fixed: G.bill && G.bill.myVote }; });
      ok("C cabinet: the vote casts your fixed vote first and keeps a named roll and the outcome", cv.cv && cv.cv.roll && cv.cv.roll.aye.indexOf("you") >= 0 && typeof cv.cv.carried === "boolean", cv);
      ok("save: second load has 0 page errors", errs.length === 0, errs.slice(0, 3)); await page.close(); }
    /* third load: Esc adjourns the sitting you chair; no template holes in offline lines */
    { const errs = []; const page = await newPage(browser, errs);
      await seedIdb(page, origin, raw); await continueCareer(page, origin, ""); await delay(5000);
      const s0 = await page.evaluate(() => ({ s: (window.ONUM_SESSION || {}).stage, chair: (window.ONUM_SESSION || {}).chairId }));
      await page.evaluate(() => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (e) {} });
      await page.keyboard.press("Escape"); await delay(4500);
      const s1 = await page.evaluate(() => ({ s: (window.ONUM_SESSION || {}).stage || "idle" }));
      ok("C sitting: Esc adjourns a sitting you chair and it stays adjourned", s0.s && s0.s !== "idle" && s1.s === "idle", { s0, s1 });
      const holes = await page.evaluate(() => { const D = NEPTUNE.debug(), G = D.G; const bad = []; (G.members || []).slice(0, 400).forEach((m) => { if (m.kin && (!m.kin.who || !m.kin.where) && /undefined/.test(String(m.kin.who) + String(m.kin.where))) bad.push(m.name); });
        const txt = [...document.querySelectorAll("#tkSay, .fd-l .t, #feed, #chat")].map((n) => n.textContent || "").join(" "); return { kinHoles: bad.length, textUndefined: /undefined is (dead|at)/.test(txt) }; });
      ok("S6 dialogue: no 'undefined is dead at undefined' in what is on screen", !holes.textUndefined, holes);
      ok("save: third load has 0 page errors", errs.length === 0, errs.slice(0, 3)); await page.close(); }
  }
} catch (e) { ok("harness", false, String(e && e.stack || e).slice(0, 500)); }
finally { await browser.close(); server.close(); }
const f = results.filter((r) => !r.pass).length; console.log("\n" + (results.length - f) + "/" + results.length + " passed"); process.exit(f ? 1 : 0);
