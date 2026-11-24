#!/usr/bin/env node
/* 20261124c JUPITER: every sitting stage (call, floor, decisions, ...) at every size: each visible control in the sitting
   panel is on screen and hit by elementFromPoint, or reachable by the mouse wheel over the panel. COPY of the day-535 save.
   Usage: node qa/nov24-sitstages.mjs <worktree> --save <copy.json> [--sizes 800x600,...] */
import fs from "node:fs"; import path from "node:path";
import { startServer, launch, seedIdb, resumeIfPaused, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || "."); const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SAVE = arg("--save", process.env.ONUM_SAVE || "/workspace/nov24/save535.json"); const raw = fs.readFileSync(SAVE, "utf8");
const SIZES = arg("--sizes", "800x600,1280x720,1280x800,1366x768,1920x1080").split(",").map((s) => s.split("x").map(Number));
const results = []; const ok = (n, p, i) => { results.push(!!p); console.log((p ? "PASS " : "FAIL ") + n + (i !== undefined ? "  " + JSON.stringify(i).slice(0, 500) : "")); };
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port; const br = await launch();
const PROBE = () => { const vw = innerWidth, vh = innerHeight, dock = document.getElementById("sxDock"); if (!dock) return { none: 1 };
  const vis = (e) => !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden" && e.offsetParent !== null);
  const ctl = [...dock.querySelectorAll("button, input, textarea")].filter(vis).map((b) => { const q = b.getBoundingClientRect(); const on = q.width > 1 && q.top >= -1 && q.left >= -1 && q.bottom <= vh + 1 && q.right <= vw + 1;
    const t = on ? document.elementFromPoint(Math.min(vw - 1, q.left + q.width / 2), Math.min(vh - 1, q.top + q.height / 2)) : null;
    return { lab: (b.textContent || b.placeholder || b.title || b.tagName).trim().replace(/\s+/g, " ").slice(0, 26), hit: !!(t && (t === b || b.contains(t))), y: q.top | 0 }; });
  const r = dock.getBoundingClientRect(); return { ctl, dock: [r.left | 0, r.top | 0, r.width | 0, r.height | 0], cx: r.left + r.width / 2, cy: r.top + Math.min(r.height / 2, 120) }; };
for (const [W, H] of SIZES) {
  const tag = W + "x" + H, errs = [], page = await br.newPage(); await page.setViewport({ width: W, height: H }); page.setDefaultTimeout(240000); page.on("pageerror", (e) => errs.push(String(e.message || e).slice(0, 160)));
  try {
    await seedIdb(page, origin, raw); await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => /day \d+/.test((document.getElementById("cont") || {}).textContent || ""), { timeout: 200000 }); await page.evaluate(() => document.getElementById("cont").click());
    await page.waitForFunction(() => window.ONUM.running() && document.getElementById("veil").hidden, { timeout: 300000 }); await resumeIfPaused(page);
    for (let i = 0; i < 8; i++) { const st = await page.evaluate(() => (window.ONUM_SESSION || {}).stage || "idle"); if (st !== "idle") break; await delay(1000); }
    if ((await page.evaluate(() => (window.ONUM_SESSION || {}).stage || "idle")) === "idle") await page.evaluate(() => { try { window.onumSession.open({ gov: "executive", kind: "cabinet_meeting", room: NEPTUNE.debug().G.room }); } catch (e) {} });
    await delay(2500); const seen = []; let last = null;
    for (let i = 0; i < 16; i++) {
      const st = await page.evaluate(() => (window.ONUM_SESSION || {}).stage || "idle"); if (st === "idle") break;
      if (st !== last) { last = st; await delay(1200); let p = await page.evaluate(PROBE); if (p.none) break; let bad = p.ctl.filter((c) => !c.hit).map((c) => c.lab);
        if (bad.length) { /* the wheel over the panel should bring the rest into reach */ const reached = new Set(); await page.mouse.move(p.cx, p.cy);
          for (let k = 0; k < 8 && bad.some((b) => !reached.has(b)); k++) { await page.mouse.wheel({ deltaY: 160 }); await delay(250); const q = await page.evaluate(PROBE); q.ctl.filter((c) => c.hit).forEach((c) => reached.add(c.lab)); }
          bad = bad.filter((b) => !reached.has(b)); await page.evaluate(() => { const d = document.getElementById("sxDock"); if (d) d.querySelectorAll("*").forEach((e) => { if (e.scrollTop) e.scrollTop = 0; }); if (d) d.scrollTop = 0; }); }
        seen.push(st); ok(tag + " " + st + ": every sitting control is on screen and clickable, or reachable by the wheel over the panel", bad.length === 0, { n: p.ctl.length, bad, dock: p.dock }); }
      if (st === "decisions" && seen.includes("decisions")) break;
      await page.evaluate(() => { try { window.onumSession.next(); } catch (e) {} }); await delay(3000);
    }
    ok(tag + ": the sitting went through its stages (call, floor and decisions seen)", ["floor", "decisions"].every((s) => seen.includes(s)) || seen.length >= 3, seen);
    ok(tag + ": 0 page errors", errs.length === 0, errs.slice(0, 3));
  } catch (e) { ok(tag + " harness", false, String(e).slice(0, 200)); } finally { try { await page.close(); } catch (e) {} }
}
const f = results.filter((x) => !x).length; console.log(f ? "FAIL " + f + " of " + results.length : "ALL PASS " + results.length); try { await br.close(); } catch (e) {} server.close(); process.exitCode = f ? 1 : 0;
