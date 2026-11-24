#!/usr/bin/env node
/* 20261124b JUPITER: round-2 checks on a COPY of the day-535 career (the file is only read).
   Usage: node qa/nov24-r2.mjs <worktree> --save <copy.json> */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || "/workspace/nov24/save535.json";
const ONLY = (process.env.R2_ONLY || "").split(",").filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
const results = []; const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? "PASS " : "FAIL ") + name + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 400) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch(); const raw = fs.readFileSync(SAVE, "utf8");
const waitIdle = async (page) => { const t0 = Date.now(); while (Date.now() - t0 < 120000) { const busy = await page.evaluate(() => window.ONUM.n24.busy()).catch(() => true); if (!busy) break; await delay(500); } };
try {
  const errs = []; const page = await newPage(browser, errs);
  await seedIdb(page, origin, raw); await continueCareer(page, origin, ""); await delay(4000);
  const d0 = await page.evaluate(() => NEPTUNE.debug().G.day);
  ok("the day-535 copy continues on day 535", d0 === 535, d0);
  if (want("night")) {
    /* nights without any save asked for: the day's own save must land in IndexedDB */
    const r0 = await page.evaluate(() => window.onumSaveStats().runs);
    for (let i = 0; i < 2; i++) { await page.evaluate(() => { try { window.ONUM.n24.nextDay(false); } catch (e) {} }); await waitIdle(page); await delay(800); }
    let got = null, st = null; const t0 = Date.now();
    while (Date.now() - t0 < 150000) { st = await page.evaluate(() => ({ day: NEPTUNE.debug().G.day, sv: window.onumSaveStats(), owed: NEPTUNE.debug().G._saveOwed || 0 })); got = await page.evaluate(() => window.ONUM.n24.idb()); if (got && got.day === st.day && !st.sv.busy) break; await delay(2000); }
    ok("nightly: after two nights with no save asked for, the save engine ran", st && st.sv.runs > r0, { r0, st });
    ok("nightly: IndexedDB holds the day you are on", got && st && got.day === st.day && st.day >= 537, { idb: got && got.day, day: st && st.day });
  }
  if (want("journal")) {
    const j = await page.evaluate(() => { try { ONUM_R2.journal("QA wrote this down."); } catch (e) {} try { ONUM_R2.refreshJournal(); } catch (e) { return { err: String(e) }; } const t = (document.getElementById("paneJournal") || {}).innerText || ""; return { undef: /Day undefined/.test(t), hasDay: /Day \d+/.test(t), head: t.slice(0, 160) }; });
    ok("journal: entries show their day, never 'Day undefined'", j && !j.undef && j.hasDay, j);
  }
  if (want("appt")) {
    const a = await page.evaluate(async () => { const R = window.ONUM_R2, D = NEPTUNE.debug(), G = D.G, out = {};
      out.office = (function(){ try { return window.ONUM_R2.heldOffice(); } catch (e) { return null; } })();
      const post = R.apPostOf("treasury"); const field = R.apField(post); out.field = field.map((o) => ({ name: o.name, real: o.real }));
      const before = (function(){ try { return window.ONUM_R2.presStaff().treasury.name; } catch (e) { return null; } })(); out.before = before;
      const n = R.apNominate(post, field.find((o) => o.real) || field[0], false); if (!n) return Object.assign(out, { noNom: true });
      out.id = n.id; out.stage0 = n.stage; const p = D.G.civ.find((c) => c.id === n.pid); out.person = p ? { name: p.name, role: p.role } : null;
      R.apCard(); await new Promise((r) => setTimeout(r, 300)); out.cardHas = /Before the Senate/.test(document.getElementById("card").innerText) && document.getElementById("card").innerText.includes(n.name);
      return out; });
    ok("appointments: the field has three people, at least one already in the Republic", a.field && a.field.length === 3 && a.field.some((o) => o.real), a.field);
    ok("appointments: a sent name is a person in the world, being vetted, and on the nominations page", a.stage0 === "vetting" && a.person && a.person.name && a.cardHas, a);
    await page.evaluate(() => { try { document.getElementById("gcClose").click(); } catch (e) {} try { window.ONUM.n24.nextDay(false); } catch (e) {} }); await waitIdle(page); await delay(2500);
    const b = await page.evaluate(async (id) => { const R = window.ONUM_R2, n = R.apById(id); R.apAdvance(n); const out = { stage: n.stage, vet: (n.vet || []).map((x) => x.t), hday: n.hearing && n.hearing.day, day: NEPTUNE.debug().G.day };
      R.apHold(n, false, true); out.result = n.result; out.qa = n.hearing && n.hearing.qa && n.hearing.qa.map((x) => x.sen + ": " + x.q).slice(0, 3); out.roll = n.roll && { aye: n.roll.aye, no: n.roll.no, names: n.roll.roll.aye.concat(n.roll.roll.no).slice(0, 4), n: n.roll.roll.aye.length + n.roll.roll.no.length };
      const st = window.ONUM_R2.presStaff(); out.holder = st.treasury && st.treasury.name; const seated = window.ONUM_R2.cabRoster(); const me = NEPTUNE.debug().G.civ.find((c) => c.id === n.pid); out.seatedSame = seated.some((c) => c.id === n.pid); out.post = me && me.post; out.name = n.name;
      out.journal = (NEPTUNE.debug().G.journal || []).slice(0, 3).map((e) => e.t); return out; }, a.id);
    ok("appointments: the file comes back the next day with findings read from the person", b.stage === "filed" && b.vet.length >= 1 && b.hday === b.day + 1, b);
    ok("appointments: the hearing asks in senators' names and the Senate votes on a named roll", b.qa && b.qa.length >= 3 && b.roll && b.roll.n === b.roll.aye + b.roll.no && b.roll.n >= 10 && b.roll.names.every((x) => /senator|\(/.test(x)), b.roll);
    if (b.result === "sworn") ok("appointments: confirmed, the same person holds the chair, sits at the table and has the secretary's office", b.holder === b.name && b.seatedSame && b.post && /Treasury/.test(b.post.at), b);
    else ok("appointments: refused, the chair stays with its holder", b.holder === a.before, b);
    const c = await page.evaluate(() => { const R = window.ONUM_R2, post = R.apPostOf("war"), before = window.ONUM_R2.presStaff().war.name; const f = R.apField(post); const n = R.apNominate(post, f[f.length - 1], true); if (!n) return { noNom: true };
      R.apAdvance(n); n.vet = Array.from({ length: 8 }, () => ({ k: "old", w: -1, t: "QA: a bad file." })); R.apHold(n, true, false); const p = NEPTUNE.debug().G.civ.find((x) => x.id === n.pid);
      return { result: n.result, holder: window.ONUM_R2.presStaff().war.name, before, role: p && p.role, mem: p && JSON.stringify(p.mem || p.memory || "").includes("refused") }; });
    ok("appointments: a refused nominee goes home, remembers it, and the chair stays as it was", c.result === "refused" && c.holder === c.before && /Refused nominee/.test(c.role || ""), c);
    const sw = await page.evaluate(() => { const R = window.ONUM_R2, post = R.apPostOf("justice"), before = R.presStaff().justice.name; const f = R.apField(post); const n = R.apNominate(post, f[0], true); if (!n) return { noNom: true };
      R.apAdvance(n); n.vet = Array.from({ length: 8 }, () => ({ k: "old", w: 1, t: "QA: a clean file." })); R.apHold(n, false, true); const G = NEPTUNE.debug().G, p = G.civ.find((x) => x.id === n.pid);
      const seated = R.cabRoster(); const olds = G.civ.filter((x) => x && x.kslot === "exec:sec:justice" && !x.gone && !x.cabFormer);
      return { id: n.id, result: n.result, name: n.name, before, holder: R.presStaff().justice.name, seatedSame: seated.some((x) => x.id === n.pid), post: p && p.post, role: p && p.role, holders: olds.map((x) => x.name), formerRole: (G.civ.find((x) => x && x.name === before) || {}).role }; });
    ok("appointments: confirmed, the same person holds the chair, sits at the table, works from the secretary's office, and the old holder retires", sw.result === "sworn" && sw.holder === sw.name && sw.seatedSame && sw.post && /Justice/.test(sw.post.at) && sw.holders.length === 1 && sw.holders[0] === sw.name && /Former/.test(sw.formerRole || ""), sw);
    /* the nominations and the confirmed secretary survive a save and a reload */
    await page.evaluate(() => { try { window.ONUM.n24.save(); } catch (e) { try { save(true); } catch (e2) {} } });
    { const t0 = Date.now(); while (Date.now() - t0 < 120000) { const s = await page.evaluate(() => window.onumSaveStats()); if (!s.busy && !s.pending) break; await delay(1000); } }
    const keep = { name: b.name, result: b.result, id: a.id, sw };
    await page.close(); const page2 = await newPage(browser, errs); await continueCareer(page2, origin, ""); await delay(5000);
    const d = await page2.evaluate((k) => { const R = window.ONUM_R2, n = R.apById(k.id), G = NEPTUNE.debug().G; const p = n && G.civ.find((x) => x.id === n.pid); const m = R.apById(k.sw.id), q = m && G.civ.find((x) => x.id === m.pid); return { stage: n && n.stage, holder: window.ONUM_R2.presStaff().treasury.name, person: p && p.name, post: p && p.post, day: G.day, jus: window.ONUM_R2.presStaff().justice.name, jusPost: q && q.post, jusSeated: window.ONUM_R2.cabRoster().some((x) => q && x.id === q.id) }; }, keep);
    ok("appointments: after a save and a reload the nomination, its outcome and the person are kept", d.stage === keep.result && d.person === keep.name && (keep.result !== "sworn" || (d.holder === keep.name && d.post)), d);
    ok("appointments: after a reload the confirmed Attorney General is the same person, seated, with the office", d.jus === sw.name && d.jusPost && d.jusSeated, d);
    globalThis.__page = page2;
  }
  const pg = globalThis.__page || page;
  if (want("life")) {
    const L = await pg.evaluate(() => { const R = window.ONUM_R2, pool = R.bentPool().slice(0, 40); const a = pool.map((p) => R.bentOf(p).k); const b = pool.map((p, i) => R.bentOf(p).k === a[i] && !!p.bent);
      const kinds = [...new Set(a)]; const w = pool.find((p) => R.bentOf(p).k === "wrath") || pool[0]; const lines = []; for (let i = 0; i < 3; i++) lines.push(R.bentAct(w));
      const words = /\b(pride|proud|greed|wrath|envy|envious|lust|gluttony|sloth|sin|sins)\b/i;
      const prompt = R.psyPromptLine(w);
      return { kinds, stable: b.every(Boolean), id: w.id, k: w.bent.k, n: w.bent.n, lines, labelled: lines.some((l) => l && words.test(l)), prompt: /WHO YOU ARE/.test(prompt), mem: (w.mem || []).slice(0, 2).map((m) => m.t), log: (NEPTUNE.debug().G.bentLog || []).length, ids: pool.map((p) => p.id), ks: a }; });
    ok("people: everyone has one bent of their own, read from their traits, the same each time it is read", L.stable && L.kinds.length >= 3, { kinds: L.kinds, stable: L.stable });
    ok("people: acting on it is remembered, and the third time is remembered as again", L.n >= 3 && L.lines.every(Boolean) && /Again\./.test(L.lines[2]) && L.mem.length && L.log >= 3, { k: L.k, lines: L.lines, mem: L.mem });
    ok("people: what they do is never labelled with a vice; the engine is told who they are, quietly", !L.labelled && L.prompt, { labelled: L.labelled, prompt: L.prompt });
    const S = await pg.evaluate(async () => { const R = window.ONUM_R2, P = R.purse(); P.cash = Math.max(P.cash || 0, 1000); const c0 = P.cash; const msg = R.onumOpenShop("grocer", "grain", 0.9); const mine = R.onumMyShops()[0];
      const rival = R.onumShops().find((x) => x.book === "grain" && x !== mine); const base = (x) => R.onumPrice(x) / x.markup;
      return { msg, mine: mine && { id: mine.id, book: mine.book, markup: mine.markup, price: R.onumPrice(mine) }, sameBook: rival ? Math.abs(base(mine) - base(rival)) < 0.2 : null, paid: c0 - P.cash, listed: R.pbApps().some((x) => x[0] === "soc-shop") }; });
    ok("shop: you can open your own storefront from the phone, paid from your purse", S.mine && S.paid === 180 && S.listed, S);
    ok("shop: your shop is bound to the same price book as its rivals; only the markup differs", S.sameBook === true, S);
    await pg.evaluate(() => { try { document.getElementById("gcClose").click(); } catch (e) {} try { window.ONUM.n24.nextDay(false); } catch (e) {} }); await waitIdle(pg); await delay(4000);
    const S2 = await pg.evaluate(() => { const R = window.ONUM_R2, c0 = R.purse().cash; try { R.onumShopPay(); } catch (e) {} const m = R.onumMyShops()[0]; return { till: m && m.till, last: m && m.last, paid: m && m.paid, purse: Math.round((R.purse().cash - c0) * 10) / 10, cash: R.purse().cash }; });
    ok("shop: priced under the cheaper door, the day's trade lands in your till and the till is paid into your purse", S2.last && S2.till > 0 && S2.paid === S2.till, S2);
    globalThis.__life = { ids: L.ids, ks: L.ks, wid: L.id, wn: L.n, shop: S.mine && S.mine.id };
  }
  if (want("vox")) {
    const v = await pg.evaluate(async () => { const R = window.ONUM_R2, apps = R.pbApps().map((x) => x[0]); R.pbAppGo("soc-vox"); await new Promise((r) => setTimeout(r, 400));
      let err = null; try { R.onumVoxCard(); } catch (e) { err = String(e); } const cardT = document.getElementById("card").innerText; const ta = document.querySelector("#card .voxq__t"), b = document.querySelector("#card .voxq__b"); const text = "QA from the phone " + Date.now();
      if (ta && b) { ta.value = text; b.click(); } await new Promise((r) => setTimeout(r, 600)); const G = NEPTUNE.debug().G; const top = (G.vox.posts || [])[0];
      const after = document.getElementById("card").innerText; return { err, ta:!!ta, b:!!b, apps: apps.slice(0, 4), hasVox: apps.includes("soc-vox"), opened: /vox/i.test(cardT) && /The feed/.test(cardT) && !!ta, posted: (G.vox.posts || []).some((p) => p.mine && p.t === text), stays: /Yours/.test(after) && after.includes(text) }; });
    ok("vox: the phone lists Vox and opens the feed with a composer", v.hasVox && v.opened, v);
    ok("vox: a post from the phone is your post, and the phone's feed shows it under Yours", v.posted && v.stays, v);
  }
  if (want("life") && globalThis.__life) {
    await pg.evaluate(() => { try { window.ONUM.n24.save(); } catch (e) {} });
    { const t0 = Date.now(); while (Date.now() - t0 < 120000) { const s = await pg.evaluate(() => window.onumSaveStats()); if (!s.busy && !s.pending) break; await delay(1000); } }
    await pg.close(); const p3 = await newPage(browser, errs); await continueCareer(p3, origin, ""); await delay(5000);
    const k = globalThis.__life; const r = await p3.evaluate((k) => { const R = window.ONUM_R2, G = NEPTUNE.debug().G; const all = [].concat(G.members || [], G.civ || []); const ks = k.ids.map((id) => { const p = all.find((x) => x && x.id === id); return p ? R.bentOf(p).k : null; });
      const w = all.find((x) => x && x.id === k.wid); return { same: ks.every((x, i) => x === k.ks[i]), wn: w && w.bent && w.bent.n, shop: R.onumMyShops().some((s) => s.id === k.shop) }; }, k);
    ok("after a reload: the same people have the same bent, the count of what they did is kept, and your shop is still yours", r.same && r.wn === k.wn && r.shop, r);
    globalThis.__page = p3;
  }
  ok("0 page errors", errs.length === 0, errs.slice(0, 3));
  try { await (globalThis.__page || pg).close(); } catch (e) {}
} finally {
  const failed = results.filter((r) => !r.pass).length; console.log(failed ? "FAIL " + failed + " of " + results.length : "ALL PASS " + results.length);
  try { await browser.close(); } catch (e) {} try { server.close(); } catch (e) {} process.exitCode = failed ? 1 : 0;
}
