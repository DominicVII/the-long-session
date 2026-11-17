#!/usr/bin/env node
/* 20261117q JUPITER: the q asks on a real career. 1 race book in G.raceBook beside the election results in G.races (and the old
   shape migrated); 2 the restored systems from 90ad8b6 answer; 3 Enter/Space pick the highlighted talk choice without breaking the
   reply box; 4 (see nov17-dupfn.mjs) the four old duplicates each keep their callers' behaviour.
   Usage: node qa/nov17-q.mjs <worktree> --save /path/to/a/COPY/of/a/career.json   (the save is only read). Exit 1 on any failure. */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || null;
if (!SAVE) { console.log("FAIL needs --save"); process.exit(1); }
const raw = fs.readFileSync(SAVE, "utf8"); const saved = JSON.parse(raw);
const results = []; const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 400) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch(); const errs = []; const page = await newPage(browser, errs);
try {
  await seedIdb(page, origin, raw); const c = await continueCareer(page, origin, ""); await delay(5000);
  ok("save: Continue opens the day-447 career", c.running && !c.broken, c);
  /* 1: race book */
  const savedRaces = Array.isArray(saved.races) ? saved.races : null;
  const r = await page.evaluate(async () => { const G = NEPTUNE.debug().G, N = window.ONUM_N17 || {}, o = {}; const shut = () => { try { const v = document.getElementById("veil"); if (v) v.hidden = true; G.running = true; } catch (e) {} };
    o.racesJSON0 = JSON.stringify(G.races);
    try { const B = N.raceEnsure(); o.live = Object.keys(B.live || {}).length; for (let i = 0; i < 3; i++) N.raceDay(); o.book = G.raceBook === B; } catch (e) { o.err = String(e).slice(0, 200); }
    o.racesJSON1 = JSON.stringify(G.races); o.isArr = Array.isArray(G.races);
    try { N.raceCard(); await new Promise((x) => setTimeout(x, 400)); o.card = (document.getElementById("card") || {}).innerText.slice(0, 120); shut(); } catch (e) { o.cardErr = String(e).slice(0, 200); }
    try { N.q.writtenCard("races"); await new Promise((x) => setTimeout(x, 400)); o.results = (document.getElementById("card") || {}).innerText.slice(0, 300); shut(); } catch (e) { o.resErr = String(e).slice(0, 200); }
    try { const s = N.saveCapture(); o.cap = { book: !!(s.raceBook && s.raceBook.live), races: Array.isArray(s.races) ? s.races.length : typeof s.races }; } catch (e) { o.capErr = String(e).slice(0, 200); }
    try { const keep = G.races, keepB = G.raceBook; G.races = { v: 1, hist: [{ c: 3 }], live: { pres: { k: "pres" } } }; G.raceBook = null; N.raceBookMigrate(); o.mig = { races: Array.isArray(G.races) ? G.races.length : typeof G.races, book: !!(G.raceBook && G.raceBook.live && G.raceBook.live.pres) };
      G.races = { v: 1, hist: [], live: { x: {} }, results: [{ d: 1, congress: 9, won: true }] }; G.raceBook = null; N.raceBookMigrate(); o.mig2 = Array.isArray(G.races) && G.races.length === 1 && G.races[0].congress === 9; G.races = keep; G.raceBook = keepB; } catch (e) { o.migErr = String(e).slice(0, 200); }
    try { const M = N.MAP(); M.mode = "race"; o.col = N.mapColor(G.states[0]); M.mode = "lean"; } catch (e) { o.mapErr = String(e).slice(0, 200); }
    shut(); return o; });
  ok("1 race book: the book lives in G.raceBook with live races, and its card opens", r.live > 20 && r.book && /BOOK OF RACES/i.test(r.card || ""), { live: r.live, card: r.card, err: r.err || r.cardErr });
  ok("1 race book: the election results in G.races are untouched by the book (same as the save)", r.isArr && r.racesJSON0 === r.racesJSON1 && (!savedRaces || r.racesJSON1 === JSON.stringify(savedRaces)), { n: r.isArr ? JSON.parse(r.racesJSON1).length : r.racesJSON1 });
  ok("1 race book: the results card still lists the election results", /Races on file/i.test(r.results || "") && /th/.test(r.results || ""), { results: (r.results || r.resErr || "").slice(0, 160) });
  ok("1 race book: a save carries both (raceBook, and races as the results list)", r.cap && r.cap.book && typeof r.cap.races === "number", r.cap || r.capErr);
  ok("1 race book: an old save whose G.races holds the book is migrated, results kept", r.mig && r.mig.races === 0 && r.mig.book && r.mig2, r.mig || r.migErr);
  ok("1 race book: the map can shade by the race", typeof r.col === "string" && r.col.length > 2, r.col || r.mapErr);
  /* 2: restored systems */
  const q = await page.evaluate(() => { const G = NEPTUNE.debug().G, Q = (window.ONUM_N17 || {}).q, o = {}; if (!Q) return { none: true };
    const t = (k, f) => { try { o[k] = f(); } catch (e) { o[k] = "ERR " + String(e).slice(0, 120); } };
    const b = G.bill && !G.bill.done ? G.bill : null, m = (G.members || []).find((x) => x && !x.gone && x.kind === "member");
    t("nature", () => { const N = Q.natureOf(m, b); return N && typeof N.kind === "string" ? N.kind : null; });
    t("floor", () => { const F = Q.floorLean(b); return F && typeof F.aye === "number"; });
    t("line", () => { const a = Q.procLineFor(m, { k: "floor" }), c = Q.procLineFor(m, { k: "floor" }); return typeof a === "string" && a.length > 20 && a !== c; });
    t("heard", () => { Q.rememberLine("q-test line one"); return Q.heardBefore("q-test line one") && !Q.heardBefore("q-test never said"); });
    t("motive", () => { const R = Q.realmEnsure(); const k = (R[0] && R[0].k) || "x"; const M = Q.realmMotive(k); return !!(M && M.line && M.because); });
    t("atlas", () => /<svg/.test(Q.foreignAtlas(G.world && G.world.foe)));
    t("cab", () => { const P = Q.cabRoster(); const S = { kind: "cabinet_meeting", seats: [] }; Q.cabSeatMeeting(S); /* 20261117s: the roster is the record's four secretaries, each keyed */ return P.length === 4 && S.seats.length >= 4 && P.every((p) => /^cab:exec\./.test(p.cabKey || "")) && P.every((p) => Q.everyone().indexOf(p) >= 0) && P.some((p) => /Treasury/.test(p.role)); });
    t("suit", () => { const s = Q.suitExplain({ t: "A v. B" }); return typeof s === "string" && s.length > 40; });
    t("claim", () => /Given:/.test(Q.clmSheet({ k: "dzz", claim: "It finds a use nobody ordered", status: "unverified", tries: 0 })));
    t("sci", () => typeof Q.sciBoard() === "string");
    t("land", () => /^#/.test(Q.wmLandFill(10)));
    t("speech", () => { const C = Q.CATCH(); return typeof Q.speechRevive("nope") === "boolean" || Q.speechRevive("nope") == null; });
    t("kin", () => { const K = Q.kinEnsure(m), T = Q.kinWarTie(m); return K && K.v === 2 && T && typeof T.who === "string" && m.kin === K && m.kinTie === T; });
    t("worldLine", () => { const s = Q.worldLine(m); return typeof s === "string" && !/undefined/.test(s); });
    t("hue", () => /var\(--/.test(Q.feelHue(30)));
    return o; });
  const want = { nature: (v) => typeof v === "string", floor: true, line: true, heard: true, motive: true, atlas: true, cab: true, suit: true, claim: true, sci: true, land: true, speech: true, kin: true, worldLine: true, hue: true };
  for (const k in want) { const v = q[k]; ok("2 restored: " + k, typeof want[k] === "function" ? want[k](v) && !/^ERR/.test(v) : v === want[k], v === undefined ? q : v); }
  /* 3: Enter / Space pick the highlighted talk choice */
  const open = async () => page.evaluate(async () => { const G = NEPTUNE.debug().G, N = window.ONUM_N17; try { N.closeTalk(); } catch (e) {} try { const v = document.getElementById("veil"); if (v) v.hidden = true; G.running = true; } catch (e) {}
    const m = (G.members || []).filter((x) => x && !x.gone && !x.away && x.kind === "member").sort((a, b) => (a.room === G.room ? 0 : 1) - (b.room === G.room ? 0 : 1))[0];
    try { m.room = G.room; m._timeOk = true; G.running = true; } catch (e) {} N.openTalk(m); await new Promise((x) => setTimeout(x, 600));
    const box = document.getElementById("tkActs"); window.__picked = null; if (box && !box.__qspy) { box.__qspy = 1; box.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("button"); if (b) window.__picked = b.textContent.trim().slice(0, 60); }, true); }
    const tgt = window.ONUM_TKPICK ? window.ONUM_TKPICK.target() : null;
    return { open: N.talkOpen(), n: box ? box.querySelectorAll("button").length : 0, target: tgt ? tgt.textContent.trim().slice(0, 60) : null, own: !!document.getElementById("tkOwnIn") }; });
  let o1 = await open();
  ok("3 talk: a talk is open with choices and a reply box", o1.open && o1.n > 0 && o1.own, o1);
  await page.evaluate(() => { const i = document.getElementById("tkOwnIn"); i.value = ""; i.focus(); window.__picked = null; }); await page.keyboard.press("Enter"); await delay(400);
  let p1 = await page.evaluate(() => window.__picked);
  ok("3 talk: Enter in the empty reply box picks the highlighted choice", !!p1 && (!o1.target || p1 === o1.target), { picked: p1, target: o1.target });
  o1 = await open();
  await page.evaluate(() => { const i = document.getElementById("tkOwnIn"); i.value = ""; i.focus(); window.__picked = null; }); await page.keyboard.type("we need the bill"); await delay(200);
  const typed = await page.evaluate(() => ({ v: document.getElementById("tkOwnIn").value, picked: window.__picked }));
  ok("3 talk: typing (with spaces) in the reply box types and picks nothing", typed.v === "we need the bill" && !typed.picked, typed);
  await page.keyboard.press("Enter"); await delay(300);
  const sent = await page.evaluate(() => ({ v: (document.getElementById("tkOwnIn") || {}).value, picked: window.__picked }));
  ok("3 talk: Enter with text in the box sends it (box cleared) and picks nothing", sent.v === "" && !sent.picked, sent);
  await delay(1500); o1 = await open();
  await page.evaluate(() => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (e) {} window.__picked = null; }); await page.keyboard.press("Space"); await delay(400);
  const p2 = await page.evaluate(() => ({ picked: window.__picked, act: document.activeElement && (document.activeElement.id || document.activeElement.tagName) }));
  ok("3 talk: Space with the reply box unfocused picks the highlighted choice", !!p2.picked && (!o1.target || p2.picked === o1.target), { ...p2, target: o1.target });
  await page.evaluate(() => { try { window.ONUM_N17.closeTalk(); } catch (e) {} });
  /* 3b (restores 20261107f propStay): a desk/rostrum/urn you open has no person and must stay open (the 1 s watchdog closed it) */
  const pr = await page.evaluate(async () => { const G = NEPTUNE.debug().G, N = window.ONUM_N17; try { N.closeTalk(); } catch (e) {} try { document.getElementById("veil").hidden = true; G.running = true; } catch (e) {}
    const P = N.q.props(); const list = [].concat(...Object.values(P).map((x) => Array.isArray(x) ? x : [])); const o = list.find((x) => x && x.label && Array.isArray(x.acts)) || list.find((x) => x && x.label);
    if (!o) return { none: Object.keys(P) }; N.q.openProp(o); await new Promise((x) => setTimeout(x, 2600)); const st = N.q.talkState(); try { N.closeTalk(); } catch (e) {} return { label: o.label, ...st }; });
  ok("3b talk: an opened desk/rostrum stays open past the watchdog (2.6 s) with its tk-prop frame", pr.open && pr.prop && /is-open/.test(pr.cls) && /tk-prop/.test(pr.cls), pr);
  /* 2b: the District/Capital Ledger dialog (90ad8b6, whole IIFE) has its opener and opens */
  let led = await page.evaluate(async () => { const b = document.getElementById("onumCapitalLedgerButton"); if (!b) return { button: false, api: !!window.ONUM_CAPITAL_LEDGER }; b.click(); await new Promise((x) => setTimeout(x, 500)); const d = document.getElementById("onumCapitalLedgerDialog"); const o = { button: true, api: !!window.ONUM_CAPITAL_LEDGER, open: !!(d && !d.hidden), text: d ? d.innerText.slice(0, 160) : null }; return o; });
  await page.keyboard.press("Escape"); await delay(300);
  Object.assign(led, await page.evaluate(() => { const d = document.getElementById("onumCapitalLedgerDialog"), po = document.getElementById("pauseOverlay"); return { closed: !!(d && d.hidden), pause: !!(po && po.classList.contains("is-open")) }; }));
  ok("2b ledger: the District Ledger button is on the toolbar and opens its dialog (Esc closes it)", led.button && led.api && led.open && led.closed && !led.pause, led);
  await delay(1000);
  ok("save: 0 page errors through the q checks", errs.length === 0, errs.slice(0, 4));
} catch (e) { ok("harness", false, String(e && e.stack || e).slice(0, 400)); }
await browser.close(); server.close();
const bad = results.filter((x) => !x.pass).length; console.log("\n" + (results.length - bad) + "/" + results.length + " passed"); process.exit(bad ? 1 : 0);
