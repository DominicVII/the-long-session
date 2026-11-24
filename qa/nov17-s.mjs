#!/usr/bin/env node
/* 20261117s JUPITER: appointees persist. On a copy of a real presidential career: the cabinet the save holds sits at the table
   with the same names; a secretary named through the record (the write the hearing makes: presStaff[k] = the nominee) is seated
   as a new person, the old one retires with their own history; you text the new one; the game saves itself on pagehide, and
   after two reloads the same person holds the office, sits at the table, and the text thread is intact.
   Uses only game paths present on every build (G through NEPTUNE.debug, the 5 s seating tick, the N key, the Texts form (its input is filled in the page: headless, the panel has no layout to type into),
   the pagehide save), so it runs on b61d7b0 too, where it fails.
   Usage: node qa/nov17-s.mjs <worktree> --save /path/to/a/COPY/of/a/career.json   (the save is only read). Exit 1 on any failure. */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || null;
if (!SAVE) { console.log("FAIL needs --save"); process.exit(1); }
const raw = fs.readFileSync(SAVE, "utf8"); const saved = JSON.parse(raw);
const results = []; const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 500) : "")); };
const savedNames = Object.keys(saved.presStaff || {}).sort().map((k) => k + ":" + saved.presStaff[k].name);
const NEW = "Hendrika Vos-Appelman", POST = "war", MSG = "Secretary, a word on the frontier budget before Thursday.";
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch(); const errs = []; const page = await newPage(browser, errs);
const table = () => page.evaluate(() => { const G = NEPTUNE.debug().G, Q = (window.ONUM_N17 || {}).q, o = {};
  const st = G.presStaff || {}; o.rec = Object.keys(st).sort().map((k) => k + ":" + (st[k] && st[k].name));
  o.holder = {}; Object.keys(st).forEach((k) => { const c = (G.civ || []).find((x) => x && !x.gone && x.kslot === "exec:sec:" + k); o.holder[k] = c ? { id: c.id, name: c.name, key: c.cabKey || null } : null; });
  try { const S = { kind: "cabinet_meeting", seats: [] }; Q.cabSeatMeeting(S); const by = (id) => [].concat(G.members, G.press, G.civ, G.officials || []).find((p) => p && p.id === id);
    o.seated = S.seats.filter((s) => s.personId !== "you").map((s) => { const p = by(s.personId); return p ? p.name : "?" + s.personId; }).sort(); } catch (e) { o.seatErr = String(e).slice(0, 160); }
  o.day = G.day; return o; });
const text = async (id) => { await page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); } catch (e) {} });
  await page.keyboard.press("n"); await delay(900);
  const r = await page.evaluate((id) => { const w = document.querySelector(".dmw"); if (!w) return { form: false }; const sel = w.querySelector(".dmWho");
    const opt = [...sel.options].find((o) => String(o.value) === String(id)); return { form: true, listed: !!opt, label: opt ? opt.textContent : null, n: sel.options.length }; }, id);
  return r; };
try {
  await seedIdb(page, origin, raw); let c = await continueCareer(page, origin, ""); await delay(6000);
  ok("load: Continue opens the career", c.running && !c.broken, c);
  /* 1: the save's cabinet is the cabinet */
  let t0 = await table();
  const savedCiv = {}; (saved.civ || []).forEach((x) => { if (x && /^exec:sec:/.test(x.kslot || "")) savedCiv[x.kslot.slice(9)] = x; });
  /* 20261124a: a secretary the family book marks dead (Dominic's day-535 save: Niek Brouwer died on day 471 and the record still named him) leaves a vacancy that is filled by a new person */
  const dead = Object.keys(savedCiv).filter((k) => savedCiv[k].gone && saved.dyn && saved.dyn.P && saved.dyn.P[savedCiv[k].id] && saved.dyn.P[savedCiv[k].id].alive === false);
  const alive = Object.keys(savedCiv).filter((k) => !dead.includes(k));
  const recOk = alive.every((k) => t0.rec.includes(k + ":" + saved.presStaff[k].name)) && dead.every((k) => !t0.rec.includes(k + ":" + saved.presStaff[k].name));
  ok("1 migrate: the office record keeps the save's living secretaries" + (dead.length ? " and fills the chair of the dead (" + dead.map((k) => saved.presStaff[k].name).join(", ") + ")" : " (same four names)"), recOk, { rec: t0.rec, saved: savedNames, dead });
  const want = t0.rec.map((s) => s.split(":")[1]).sort();
  ok("1 migrate: the cabinet table seats the record's four secretaries, no one else", JSON.stringify(t0.seated) === JSON.stringify(want), { seated: t0.seated, err: t0.seatErr });
  ok("1 migrate: each living secretary is the same person as in the save (same id, same chat history)", Object.keys(savedCiv).length === 4 && alive.every((k) => t0.holder[k] && t0.holder[k].id === savedCiv[k].id && t0.holder[k].name === savedCiv[k].name), { holder: t0.holder });
  if (dead.length) ok("1 migrate: a dead secretary's chair goes to a new person, never a second person with the dead name", dead.every((k) => t0.holder[k] && t0.holder[k].id >= 700000000 && t0.holder[k].name !== savedCiv[k].name), { holder: t0.holder });
  ok("1 migrate: each secretary carries a key in the cabinet namespace", Object.values(t0.holder).every((h) => h && /^cab:exec\.\w+:\d+$/.test(h.key || "")), { keys: Object.values(t0.holder).map((h) => h && h.key) });
  /* 2: appoint a named secretary through the record, as the hearing does */
  const before = t0.holder[POST];
  await page.evaluate((a) => { const G = NEPTUNE.debug().G; const old = G.presStaff[a.post] || {};
    G.presStaff[a.post] = { name: a.name, role: old.role || "Secretary of War", bg: old.bg, creed: old.creed, origin: old.origin, pos: Object.assign({}, old.pos || {}, { def: 22 }), temper: 52, warm: 0, since: G.day, town: old.town, prior: old.prior };
    G.room = "exec"; G._cabSeat = null; }, { post: POST, name: NEW });
  await delay(6500);
  let t1 = await table();
  const hold = t1.holder[POST];
  ok("2 appoint: the named secretary holds the office and sits at the table", hold && hold.name === NEW && t1.seated.indexOf(NEW) >= 0, { hold, seated: t1.seated });
  const oldNow = await page.evaluate((b) => { const G = NEPTUNE.debug().G; const p = (G.civ || []).find((x) => x && x.id === b.id); return p ? { name: p.name, role: p.role, kslot: p.kslot } : null; }, before);
  ok("2 appoint: the new secretary is a new person; the one replaced keeps their own name and history in a former title", hold && before && hold.id !== before.id && oldNow && oldNow.name === before.name && /^Former /.test(oldNow.role || ""), { before, oldNow, hold });
  /* 2b: the appointment card's path (appointCard -> cabOpenPost/cabInstall) names a secretary the same way */
  const NEW2 = "Maarten Okonkwo-Dijk";
  const inst = await page.evaluate((nm) => { const S = (window.ONUM_N17 || {}).s, G = NEPTUNE.debug().G; if (!S) return { none: true };
    const post = S.posts().find((p) => p.k === "justice"); const p = S.cabInstall(post, { name: nm, pos: { lib: 10 } });
    return p ? { id: p.id, name: p.name, key: p.cabKey, rec: G.presStaff.justice.name, seated: S.cabRoster().map((x) => x.name) } : null; }, NEW2);
  ok("2b appoint card: cabInstall names the Attorney General in the record and seats them", inst && inst.name === NEW2 && inst.rec === NEW2 && inst.seated.indexOf(NEW2) >= 0, inst);
  /* 3: text them */
  const tx = hold ? await text(hold.id) : { form: false };
  ok("3 text: the new secretary is in the Texts list", tx.form && tx.listed, tx);
  if (tx.listed) { await page.select(".dmw .dmWho", String(hold.id)); await page.evaluate((m) => { document.querySelector(".dmw .dmIn").value = m; const f = document.querySelector(".dmw .dmForm"); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true })); }, MSG); await delay(3500); }
  const th0 = hold ? await page.evaluate((id) => { const T = (NEPTUNE.debug().G.dm || { th: {} }).th[id] || []; return T.map((m) => ({ f: m.f, t: String(m.t).slice(0, 80) })); }, hold.id) : [];
  ok("3 text: the text went out and they answered", th0.length >= 2 && th0[0].t === MSG && th0[1].f === hold.id, th0);
  /* 4: two reloads; the game saves itself on pagehide */
  for (const n of [1, 2]) {
    c = await continueCareer(page, origin, ""); await delay(6000);
    ok("4 reload " + n + ": Continue opens the career", c.running && !c.broken, c);
    const t = await table(), h = t.holder[POST];
    ok("4 reload " + n + ": the same secretary holds the office (name, id, key)", h && hold && h.name === NEW && h.id === hold.id && h.key === hold.key, { h, hold });
    ok("4 reload " + n + ": the table seats the same four (the two named, the other two from the save)", t.seated.indexOf(NEW) >= 0 && t.seated.length === 4 && t.seated.indexOf(NEW2) >= 0 && t0.rec.filter((s) => !s.startsWith(POST + ":") && !s.startsWith("justice:")).every((s) => t.seated.indexOf(s.split(":")[1]) >= 0), { seated: t.seated });
    const j = await page.evaluate(() => { const G = NEPTUNE.debug().G, c = (G.civ || []).find((x) => x && !x.gone && x.kslot === "exec:sec:justice"); return c ? { id: c.id, name: c.name, key: c.cabKey, rec: (G.presStaff.justice || {}).name } : null; });
    ok("4 reload " + n + ": the Attorney General named by the card is the same person", j && inst && j.id === inst.id && j.name === NEW2 && j.rec === NEW2 && j.key === inst.key, { j, inst });
    const th = h ? await page.evaluate((id) => { const T = (NEPTUNE.debug().G.dm || { th: {} }).th[id] || []; return T.map((m) => ({ f: m.f, t: String(m.t).slice(0, 80) })); }, h.id) : [];
    ok("4 reload " + n + ": the text thread is intact", JSON.stringify(th.slice(0, th0.length)) === JSON.stringify(th0) && th0.length >= 2, { n: th.length });
    const tl = h ? await text(h.id) : { form: false };
    ok("4 reload " + n + ": the secretary can still be texted (in the Texts list)", tl.form && tl.listed, tl);
    const old = await page.evaluate((b) => { const G = NEPTUNE.debug().G; const p = (G.civ || []).find((x) => x && x.id === b.id); return p ? { name: p.name, role: p.role } : null; }, before);
    ok("4 reload " + n + ": the replaced secretary is still the same person, retired", old && old.name === before.name && /^Former /.test(old.role || ""), old);
  }
  const ids = await page.evaluate(() => { const G = NEPTUNE.debug().G, all = [].concat(G.members, G.press, G.civ).filter(Boolean), seen = {}, d = []; all.forEach((p) => { if (seen[p.id]) d.push(p.id); seen[p.id] = 1; }); return d.slice(0, 10); });
  ok("ids: no two people share a number", ids.length === 0, ids);
  ok("no page errors", errs.length === 0, errs.slice(0, 5));
} catch (e) { ok("harness", false, String(e && e.stack || e).slice(0, 600)); }
finally { try { await browser.close(); } catch (e) {} server.close(); }
const bad = results.filter((r) => !r.pass); console.log("\n" + (results.length - bad.length) + "/" + results.length + " passed"); process.exit(bad.length ? 1 : 0);
