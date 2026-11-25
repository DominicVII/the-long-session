#!/usr/bin/env node
/* 20261124f JUPITER: the Engine opens from the Menu at 1920x1080 (and 1280x720), and "Who is sovereign?" is answered from the office-holder record.
   Usage: node qa/nov24-engine-menu.mjs <worktree> <save.json> */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || "."), SAVE = process.argv[3] || "/workspace/nov24/save540.json";
const raw = fs.readFileSync(SAVE, "utf8");
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch(); const errs = []; const page = await newPage(br, errs);
const waitFor = async (fn, ms) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { v = await page.evaluate(fn); if (v) return v; await delay(200); } return v; };
const closeAll = async () => { for (let i = 0; i < 10; i++) { const open = await page.evaluate(() => { const v = document.getElementById("veil"); if (v && !v.hidden) { const c = document.getElementById("gcClose"); if (c) c.click(); return 1; } return 0; }); if (!open) { await delay(500); const again = await page.evaluate(() => { const v = document.getElementById("veil"); return !!(v && !v.hidden); }); if (!again) return; } await delay(400); } };
const engShown = () => { const v = document.getElementById("veil"), c = document.getElementById("card"); return !!(v && !v.hidden && c && /The Engine/.test((c.querySelector("h1") || {}).textContent || "")); };
try {
  await seedIdb(page, origin, raw); await continueCareer(page, origin);
  const s = await page.evaluate(() => window.ONUM.engine.ask("Who is sovereign?"));
  const G0 = await page.evaluate(() => { const G = NEPTUNE.debug().G; const R = G.ofh && G.ofh.seats && G.ofh.seats.pres; const H = (R && R.holders) || []; const o = H.length && H[H.length - 1].to == null ? H[H.length - 1] : null; return { open: o && o.name, exec: G.exec && G.exec.name, you: G.you && G.you.name }; });
  ok(s && s.sourceKind === "office" && G0.open && s.answer.indexOf(G0.open) >= 0, "'Who is sovereign?' answered from the office record (" + JSON.stringify(G0) + "): " + JSON.stringify(s && s.answer));
  ok(!/\(you\.|you\.name|country\./.test(s.answer || ""), "no config field in the answer");
  const s2 = await page.evaluate(() => window.ONUM.engine.ask("Who is the head of state?"));
  ok(s2 && s2.sourceKind === "office", "'Who is the head of state?' from the record: " + JSON.stringify(s2 && s2.answer));
  for (const [w, h] of [[1920, 1080], [1280, 720]]) {
    await page.setViewport({ width: w, height: h }); await delay(600);
    await closeAll();
    await page.evaluate(() => { const po = document.getElementById("pauseOverlay"); if (!(po && po.classList.contains("is-open"))) document.getElementById("btnMenu").click(); });
    await delay(1200);
    const btn = await page.evaluate(() => { const b = document.querySelector('#pauseOverlay [data-cleng]'); if (!b) return { found: false }; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y);
      return { found: true, vis: r.width > 0 && r.height > 0, x, y, hit: !!(top && (top === b || b.contains(top))), topId: top && (top.id || top.className || top.tagName) }; });
    ok(btn.found && btn.vis, w + "x" + h + " Menu has The Engine button " + JSON.stringify(btn));
    await delay(2600);
    const y2 = await page.evaluate(() => { const b = document.querySelector('#pauseOverlay [data-cleng]'); const r = b.getBoundingClientRect(); return r.top + r.height / 2; });
    ok(Math.abs(y2 - btn.y) < 1, w + "x" + h + " the Engine row stays put while the Menu is open (" + btn.y.toFixed(1) + " → " + y2.toFixed(1) + ")");
    if (btn.found) { await page.mouse.click(btn.x, btn.y); }
    await waitFor(engShown, 10000); await delay(300);
    const st = await page.evaluate(() => { const v = document.getElementById("veil"), c = document.getElementById("card"), po = document.getElementById("pauseOverlay");
      return { veil: !!(v && !v.hidden), eng: !!(c && /Engine/.test(c.textContent || "")), engIn: !!document.getElementById("engIn") || !!(c && /Speak with the Engine|thinking machines|The Engine/.test(c.innerHTML || "")), menuOpen: !!(po && po.classList.contains("is-open")) }; });
    ok(st.veil && st.eng && !st.menuOpen, w + "x" + h + " clicking it opens the Engine page " + JSON.stringify(st));
    const rawF = await page.evaluate(() => (((document.getElementById("card") || {}).innerText || "").match(/\((?:you|world|country|weather|treasury|G)\.[a-z_]+\)/g) || []));
    ok(rawF.length === 0, w + "x" + h + " the Engine page shows no raw field names " + JSON.stringify(rawF.slice(0, 5)));
  }
  /* the row is redrawn between press and release: the click then goes to the panel, not the button */
  {
    await page.setViewport({ width: 1920, height: 1080 }); await delay(600);
    await closeAll();
    await page.evaluate(() => { const po = document.getElementById("pauseOverlay"); if (!(po && po.classList.contains("is-open"))) document.getElementById("btnMenu").click(); });
    await delay(1200);
    const p = await page.evaluate(() => { const b = document.querySelector('#pauseOverlay [data-cleng]'); b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(p.x, p.y); await page.mouse.down();
    await page.evaluate(() => { const b = document.querySelector('#pauseOverlay [data-cleng]'); b.replaceWith(b.cloneNode(true)); });
    await page.mouse.up(); await waitFor(engShown, 10000); await delay(300);
    const st = await page.evaluate(() => { const v = document.getElementById("veil"), c = document.getElementById("card"), po = document.getElementById("pauseOverlay"); return { veil: !!(v && !v.hidden), h1: c && (c.querySelector("h1") || {}).textContent, menuOpen: !!(po && po.classList.contains("is-open")) }; });
    ok(st.veil && /Engine/.test(st.h1 || "") && !st.menuOpen, "1920x1080 the Engine opens even when the Menu row is redrawn mid-click " + JSON.stringify(st));
  }
  ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
} catch (e) { ok(false, "threw " + (e && e.stack || e)); }
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
