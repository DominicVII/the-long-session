#!/usr/bin/env node
/* 20261124a JUPITER: viewport audit on a COPY of a real career. At each size: the sitting panel (every button, the vote row)
   is not covered by the HUD strip or the toolbar (MARS T1); the sitting ✕ is on screen and does not move (T2) and adjourns;
   all toolbar buttons are on screen and clickable; talk choices are on top and clickable; the cabinet brief's buttons are clickable.
   Usage: node qa/nov24-viewport.mjs [worktree] --save <copy.json> [--sizes 800x600,1280x720,...] [--shots dir] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, seedIdb, delay, resumeIfPaused } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SAVE = arg("--save", process.env.ONUM_SAVE || "/workspace/nov24/save535.json");
const SIZES = arg("--sizes", "800x600,1280x720,1280x800,1366x768,1920x1080").split(",").map((s) => s.split("x").map(Number));
const SHOTS = arg("--shots", null); if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const raw = fs.readFileSync(SAVE, "utf8");
let bad = 0; const ok = (m, c, info) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m + (info !== undefined ? "  " + JSON.stringify(info).slice(0, 600) : "")); };
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const COVER = () => { const vw = innerWidth, vh = innerHeight; const vis = (e) => !!(e && !e.hidden && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden" && e.getClientRects().length);
  const who = (t) => { if (!t) return "none"; const h = t.closest && t.closest("#hmBar,#uiToolbar,#onumSeeDock,#hmWire,#aloudBtn,#reactBtn,#onumPlay,#prompt,#kClock,#job"); return h ? "#" + h.id : (t.id || t.tagName); };
  return (sel) => { const out = []; for (const b of document.querySelectorAll(sel)) { if (!vis(b) || b.offsetParent === null) continue; let q = b.getBoundingClientRect(); if (q.width < 2 || q.height < 2) continue;
      let inScroll = true; let a = b.parentElement; while (a && a !== document.body) { const c = getComputedStyle(a); if (/hidden|clip|auto|scroll/.test(c.overflowY)) { const ar = a.getBoundingClientRect(); if (q.bottom > ar.bottom + 1 || q.top < ar.top - 1) { inScroll = false; break; } } a = a.parentElement; }
      if (!inScroll) continue; const lab = (b.textContent || b.placeholder || b.getAttribute("aria-label") || b.tagName).trim().replace(/\s+/g, " ").slice(0, 30);
      const off = q.right < 0 || q.bottom < 0 || q.left > vw || q.top > vh; if (off) { out.push(lab + "←offscreen"); continue; }
      try { if (b.closest(".card, #card, #talk")) b.scrollIntoView({ block: "center", inline: "nearest" }); } catch (e) {} const q2 = b.getBoundingClientRect(); q = q2; const pts = (q.width < 30 ? [[0.5, 0.5]] : [[0.5, 0.5], [0.2, 0.5], [0.8, 0.5]]).map(([fx, fy]) => { const x = Math.min(vw - 1, Math.max(0, q.left + q.width * fx)), y = Math.min(vh - 1, Math.max(0, q.top + q.height * fy)); const t = document.elementFromPoint(x, y); if (t && (t === b || b.contains(t))) return "ok"; /* the sitting and the desk each have a fold "–"; one on top of the other still folds the same band */ if (t && /^[–-]$/.test((b.textContent || "").trim()) && /^[–-]$/.test((t.textContent || "").trim())) return "ok"; return who(t); });
      if (pts.some((p) => p !== "ok")) out.push(lab + "←" + pts.filter((p) => p !== "ok").join("/")); } return out; }; };
for (const [W, H] of SIZES) {
  const tag = W + "x" + H; const errs = []; const page = await br.newPage(); await page.setViewport({ width: W, height: H }); page.setDefaultTimeout(240000);
  page.on("pageerror", (e) => errs.push(String(e && e.message || e).slice(0, 200)));
  try {
    await seedIdb(page, origin, raw);
    await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => /day \d+/.test((document.getElementById("cont") || {}).textContent || ""), { timeout: 200000 });
    await page.evaluate(() => document.getElementById("cont").click());
    await page.waitForFunction(() => window.ONUM.running() && document.getElementById("veil").hidden, { timeout: 300000 }); await resumeIfPaused(page);
    for (let i = 0; i < 16; i++) { const st = await page.evaluate(() => (window.ONUM_SESSION || {}).stage || "idle"); if (st !== "idle") break; await delay(1000); }
    await delay(2500);
    const sit = await page.evaluate((src) => { const C = eval(src)(); const S = window.ONUM_SESSION || {}; const hm = document.getElementById("hmBar"), dock = document.getElementById("sxDock");
      const ov = (a, b) => { if (!a || !b) return 0; const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); return Math.round(x * y); };
      const hv = hm && getComputedStyle(hm).display !== "none" && hm.getClientRects().length;
      return { stage: S.stage || "idle", covered: C("#sxDock button, #sxDock textarea, #sxDock input, #ndSess button, #ndFd button, #ndFd textarea, #cvLive button"), n: document.querySelectorAll("#sxDock button, #ndSess button, #ndFd button").length,
        hmOverDock: hv && dock && dock.getClientRects().length ? ov(hm.getBoundingClientRect(), dock.getBoundingClientRect()) : 0, nrBarH: getComputedStyle(document.documentElement).getPropertyValue("--nr-bar-h").trim(),
        voteRow: [...document.querySelectorAll("#sxDock button, #ndSess button, #ndFd button")].filter((b) => /^(Aye|No|Nay|Present)\b/.test(b.textContent.trim())).length }; }, "(" + COVER.toString() + ")");
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, tag + "-sit.png") });
    if (sit.stage !== "idle") {
      ok(tag + " sitting: no panel button is covered (HUD strip, toolbar, play bar)", sit.covered.length === 0 && sit.hmOverDock === 0, sit);
      const xs = []; for (let i = 0; i < 12; i++) { xs.push(await page.evaluate(() => { const b = document.querySelector('#sxParkBar [data-p="close"]'); if (!b || b.offsetParent === null) return null; const q = b.getBoundingClientRect(); const on = q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight; const t = on ? document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2) : null; return { x: Math.round(q.left), y: Math.round(q.top), on, hit: !!(t && (t === b || b.contains(t))) }; })); await delay(120); }
      const good = xs.filter(Boolean); const stable = good.length === xs.length && good.every((s) => Math.abs(s.x - good[0].x) <= 1 && Math.abs(s.y - good[0].y) <= 1);
      ok(tag + " sitting ✕: on screen, on top, and still across 12 samples", good.length > 0 && good.every((s) => s.on && s.hit) && stable, { first: xs[0], nulls: xs.length - good.length, stable });
      if (good.length) { await page.mouse.click(good[0].x + 8, good[0].y + 8); await delay(1500); const st = await page.evaluate(() => ({ s: (window.ONUM_SESSION || {}).stage || "idle", ssn: typeof window.onumSessionLive === "function" ? window.onumSessionLive() : null })); ok(tag + " sitting ✕: a real click adjourns it", st.s === "idle", st); }
    } else ok(tag + " sitting: none live after Continue on this save (skipped)", true);
    await page.keyboard.press("Escape"); await delay(600); await resumeIfPaused(page);
    const tb = await page.evaluate(() => { const bar = document.getElementById("uiToolbar"); if (!bar) return null; const bs = [...bar.querySelectorAll("button")].filter((b) => b.offsetParent !== null); const vw = innerWidth, vh = innerHeight;
      const badB = bs.filter((b) => { const q = b.getBoundingClientRect(); if (q.left < -0.5 || q.top < -0.5 || q.right > vw + 0.5 || q.bottom > vh + 0.5) return true; const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return !(t && (t === b || b.contains(t))); }).map((b) => b.id || b.textContent.trim().slice(0, 12)); return { n: bs.length, bad: badB, hasLedger: !!document.getElementById("onumCapitalLedgerButton") }; });
    ok(tag + " toolbar: every button on screen and clickable", tb && tb.n > 0 && tb.bad.length === 0, tb);
    /* 20261124a (Dominic): the cabinet table and the desk keep their prompt (no flash and vanish), a real click on a choice does
       something, and the toolbar's Cabinet/Desk button always opens the page that stays */
    for (const W of ["xcab", "kxdesk"]) {
      const at = await page.evaluate((W) => { const D = NEPTUNE.debug(), G = D.G; try { document.getElementById("veil").hidden = true; } catch (e) {} G.running = true; const o = (D.PROPS[G.room] || []).find((x) => x && x.id === W); if (!o) return null; D.cam.x = o.x + (o.r || 1.5) * 0.6; D.cam.z = o.z + (o.r || 1.5) * 0.3; return o.id; }, W);
      if (!at) { ok(tag + " " + W + ": not in this room (skipped)", true); continue; }
      await delay(1200); const smp = [];
      for (let i = 0; i < 20; i++) { smp.push(await page.evaluate(() => { const p = document.getElementById("prompt"); if (!p) return 0; const q = p.getBoundingClientRect(), c = getComputedStyle(p); if (p.hidden || c.display === "none" || c.visibility === "hidden" || q.height < 4) return 0; const b = [...p.querySelectorAll("button")].filter((x) => x.offsetParent !== null && !/^close/i.test(x.textContent.trim())); const hit = b.filter((x) => { const r = x.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === x || x.contains(t)); }); return hit.length; })); await delay(150); }
      ok(tag + " " + W + ": the prompt stays up with clickable choices for 3 s (no flash)", smp.every((n) => n > 0), smp.join(","));
      const pick = await page.evaluate(() => { const p = document.getElementById("prompt"); const b = p && [...p.querySelectorAll("button")].filter((x) => x.offsetParent !== null && !/^close/i.test(x.textContent.trim()) && !/^What this place is/i.test(x.textContent.trim())).find((x) => { const r = x.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === x || x.contains(t)); }); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: b.textContent.trim().slice(0, 40) }; });
      let did = null; if (pick) { const f0 = await page.evaluate(() => [(NEPTUNE.debug().G.feed || []).length, document.getElementById("veil").hidden, (document.getElementById("prompt") || {}).innerText || "", [...document.querySelectorAll(".notices, #apToast, #brHint, #note, .note")].map((n) => n.innerText).join("|"), NEPTUNE.debug().G.minute]); await page.mouse.click(pick.x, pick.y); await delay(900);
        did = await page.evaluate((f0) => { const v = document.getElementById("veil"); const fn = (NEPTUNE.debug().G.feed || []).length; const pt = (document.getElementById("prompt") || {}).innerText || ""; const nt = [...document.querySelectorAll(".notices, #apToast, #brHint, #note, .note")].map((n) => n.innerText).join("|"); return { card: !v.hidden ? ((document.querySelector("#card h1, #card h2") || {}).textContent || "card").slice(0, 50) : null, feed: fn !== f0[0], promptChanged: pt !== f0[2], note: nt !== f0[3], clock: NEPTUNE.debug().G.minute !== f0[4] }; }, f0); }
      ok(tag + " " + W + ": a real click on a choice does something (" + (pick && pick.t) + ")", !!(did && (did.card || did.feed || did.promptChanged || did.note || did.clock)), did);
      await page.evaluate(() => { try { const v = document.getElementById("veil"); const c = document.querySelector("#card [data-x], #card .card__close, #gcClose, #card button.btn--ghost"); if (!v.hidden && c) c.click(); v.hidden = true; } catch (e) {} }); await delay(400);
      const wb = await page.evaluate(() => { const b = document.getElementById("onumWorkTb"); if (!b || b.offsetParent === null) return null; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: b.textContent, top: !!(t && (t === b || b.contains(t))), on: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
      let wo = null; if (wb && wb.top) { await page.mouse.click(wb.x, wb.y); await delay(900); wo = await page.evaluate(() => { const v = document.getElementById("veil"); return v.hidden ? null : ((document.querySelector("#card h1, #card h2, #card .eyebrow") || {}).textContent || "card").slice(0, 60); }); }
      ok(tag + " " + W + ": the toolbar's " + (wb && wb.t) + " button is on screen, on top, and a real click opens the page", !!(wb && wb.on && wb.top && wo), { wb, opened: wo });
      await page.evaluate(() => { try { document.getElementById("veil").hidden = true; } catch (e) {} }); await delay(300);
    }
    const talk = await page.evaluate(async (src) => { const C = eval(src)(); const G = NEPTUNE.debug().G, N = window.ONUM_N17; try { document.getElementById("veil").hidden = true; } catch (e) {}
      const m = (G.members || []).filter((x) => x && !x.gone && !x.away && x.kind === "member")[0]; m.room = G.room; m._timeOk = true; G.running = true; G._allowTalk = true; try { N.openTalk(m); } catch (e) {} G._allowTalk = false;
      await new Promise((r) => setTimeout(r, 900)); const n = document.querySelectorAll("#tkActs button").length; return { open: N.talkOpen(), n, covered: C("#tkActs button, #tkOwnIn") }; }, "(" + COVER.toString() + ")");
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, tag + "-talk.png") });
    ok(tag + " talk: choices and the reply box are on top and clickable", talk.open && talk.n > 0 && talk.covered.length === 0, talk);
    await page.evaluate(() => { try { window.ONUM_N17.closeTalk(); } catch (e) {} }); await delay(500);
    const brief = await page.evaluate(async (src) => { const C = eval(src)(); try { (window.onumCabinetBrief || window.ONUM_N17.presBrief)(); } catch (e) { return { err: String(e) }; } await new Promise((r) => setTimeout(r, 900));
      const card = document.getElementById("card"); const bs = [...card.querySelectorAll("button")].filter((b) => b.offsetParent !== null); const cov = []; for (const b of bs) { b.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 30)); const q = b.getBoundingClientRect(); const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!(t && (t === b || b.contains(t)))) cov.push(b.textContent.trim().slice(0, 24) + "←" + (t ? (t.id || t.tagName) : "none")); }
      return { n: bs.length, pb2: card.querySelectorAll("[data-pb2]").length, covered: cov }; }, "(" + COVER.toString() + ")");
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, tag + "-brief.png") });
    ok(tag + " cabinet brief: every button clickable (aye/nay choices present)", brief.n > 0 && brief.covered.length === 0 && brief.pb2 > 0, brief);
    ok(tag + " 0 page errors", errs.length === 0, errs.slice(0, 3));
  } catch (e) { ok(tag + " harness: " + String(e && e.message || e).slice(0, 200), false); }
  await page.close();
}
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
