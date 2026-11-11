#!/usr/bin/env node
/* 20261110by JUPITER: headless conversation tests.
   A held walk key must not dismiss a conversation just opened with E,
   and the choice buttons must be inside the talk panel, above the
   Say aloud bar, and hit-testable. Also checks a typed free reply
   produces a line (Engine fallback is enough) after New career and
   after Continue.
   Usage: node qa/convo-by.mjs [path-to-worktree]
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(here, ".."));
const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require("/tmp/pptr/node_modules/puppeteer-core"); }
catch (e) { puppeteer = require("puppeteer-core"); }

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function startServer() {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://127.0.0.1");
    let p = decodeURIComponent(u.pathname);
    if (p === "/") p = "/session.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("not found"); return; }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function clearSaves(page) {
  await page.evaluate(async () => {
    const drop = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) drop.push(k);
    }
    drop.forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    await new Promise((resolve) => {
      try {
        const d = indexedDB.deleteDatabase("onum-saves");
        d.onsuccess = d.onerror = d.onblocked = () => resolve(true);
      } catch (e) { resolve(false); }
    });
  });
}

async function resumeIfPaused(page) {
  await page.evaluate(() => {
    const o = document.getElementById("pauseOverlay");
    const b = document.getElementById("resumeGame") || document.getElementById("closeSettings");
    if (o && o.classList.contains("is-open") && b) b.click();
  });
  await delay(150);
}

async function bootNewCareer(page, origin, name) {
  await page.goto(origin + "/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
  await delay(600);
  await clearSaves(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await delay(1200);
  await page.waitForFunction(() => !!(document.getElementById("fresh") || document.getElementById("mkGo") || document.getElementById("nameIn")), { timeout: 90000 });
  if (await page.evaluate(() => !!document.getElementById("fresh"))) {
    await page.click("#fresh");
    await delay(400);
    if (await page.evaluate(() => !!document.getElementById("freshYes"))) {
      await page.click("#freshYes");
      await delay(400);
    }
  }
  await page.waitForFunction(() => !!(document.getElementById("nameIn") || document.getElementById("mkGo")), { timeout: 20000 });
  await page.evaluate((n) => {
    const i = document.getElementById("nameIn");
    if (i) {
      i.value = n;
      i.dispatchEvent(new Event("input", { bubbles: true }));
      i.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, name);
  await page.evaluate(() => { const b = document.getElementById("mkGo"); if (b) b.click(); });
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => ({
      q: !!document.querySelector("[data-q]"),
      go: !!(document.getElementById("qzGo") && !document.getElementById("qzGo").disabled),
      join: !!document.querySelector("[data-join]"),
    }));
    if (st.join) break;
    if (st.q) { await page.evaluate(() => { const b = document.querySelector("[data-q]"); if (b) b.click(); }); await delay(180); continue; }
    if (st.go) { await page.evaluate(() => document.getElementById("qzGo").click()); await delay(400); continue; }
    await delay(250);
  }
  await page.waitForFunction(() => !!document.querySelector("[data-join]"), { timeout: 20000 });
  await page.evaluate(() => {
    const b = document.querySelector('[data-join="IND"]') || document.querySelector("[data-join]");
    if (b) b.click();
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const mid = await page.evaluate(() => !!(window.ONUM && window.ONUM.running && window.ONUM.running()) && document.getElementById("veil") && document.getElementById("veil").hidden);
    if (mid) break;
    await delay(400);
  }
  await resumeIfPaused(page);
}

async function placeNpc(page) {
  return page.evaluate(() => {
    const dbg = window.NEPTUNE && window.NEPTUNE.debug && window.NEPTUNE.debug();
    if (!dbg || !dbg.G || !dbg.cam) return { ok: false, why: "no debug" };
    const G = dbg.G, cam = dbg.cam;
    const m = (G.members || []).find((x) => x && !x.gone && x !== G.you && x.id !== (G.you && G.you.id));
    if (!m) return { ok: false, why: "no npc", n: (G.members || []).length };
    m.room = G.room; m.gone = false;
    const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw);
    m.x = cam.x + fx * 1.05; m.z = cam.z + fz * 1.05; m.tx = m.x; m.tz = m.z;
    try { if (typeof dbg.syncPeople === "function") dbg.syncPeople(); } catch (e) {}
    return { ok: true, name: m.name, running: !!G.running };
  });
}

async function closeTalkUi(page) {
  await page.evaluate(() => {
    const T = document.getElementById("talk");
    if (!(T && T.classList.contains("is-open"))) return;
    const b = document.getElementById("tkDone") || [...T.querySelectorAll("button")].find((x) => /leave it|walk away|done \(esc\)|move along|nothing today/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await delay(200);
}

async function talkSnap(page) {
  return page.evaluate(() => {
    const T = document.getElementById("talk");
    const acts = document.getElementById("tkActs");
    const inp = document.getElementById("tkOwnIn");
    const box = document.getElementById("tkOwn");
    const say = document.getElementById("tkSay");
    const pause = document.getElementById("pauseOverlay");
    const hm = document.getElementById("hmBar");
    const open = !!(T && T.classList.contains("is-open"));
    const tr = T && T.getBoundingClientRect();
    const hr = hm && !hm.hidden ? hm.getBoundingClientRect() : null;
    const choices = acts ? [...acts.querySelectorAll("button.talk__btn, button")].filter((b) => {
      if (b.disabled || b.id === "tkMore" || b.id === "tkDone") return false;
      if (/leave it|walk away|done \(esc\)|move along|nothing today|more|less /i.test(b.textContent || "")) return false;
      const cs = getComputedStyle(b);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      return true;
    }).map((b) => {
      const r = b.getBoundingClientRect();
      const y = r.top + Math.min(12, Math.max(4, r.height / 3));
      const x = r.left + r.width / 2;
      const top = document.elementFromPoint(x, y);
      const inPanel = !!(tr && r.top >= tr.top - 1 && r.bottom <= tr.bottom + 1);
      const aboveBar = !hr || r.bottom <= hr.top + 1;
      const hit = !!(top && (top === b || b.contains(top)));
      return {
        text: (b.textContent || "").trim().slice(0, 70),
        y: r.y, bottom: r.bottom, h: r.height,
        inPanel, aboveBar, hit,
        topId: top && (top.id || top.tagName),
      };
    }) : [];
    const clickable = choices.filter((c) => c.inPanel && c.aboveBar && c.hit);
    return {
      stamp: (document.querySelector('meta[name="onum-build"]') || {}).content,
      open, running: !!(window.ONUM && window.ONUM.running && window.ONUM.running()),
      pause: !!(pause && pause.classList.contains("is-open")),
      say: say && (say.textContent || "").slice(0, 240),
      tkOwn: !!(box && !box.hidden && inp),
      focus: document.activeElement && (document.activeElement.id || document.activeElement.tagName),
      inpVal: inp && inp.value,
      talkBottom: tr && tr.bottom, talkTop: tr && tr.top, hmTop: hr && hr.top,
      choices: choices.length, clickable: clickable.length, first: clickable[0] || choices[0] || null,
    };
  });
}

async function playTalkSuite(page, label, ok) {
  await resumeIfPaused(page);
  await closeTalkUi(page);

  // Held W, then E: the conversation must open and stay open.
  const placed = await placeNpc(page);
  if (!placed.ok) {
    ok(label + ": placed an NPC in front", false, placed);
    return;
  }
  await delay(120);
  await page.keyboard.down("w");
  await delay(80);
  await page.keyboard.press("e");
  await delay(200);
  const at200 = await talkSnap(page);
  await delay(800);
  const at1s = await talkSnap(page);
  await page.keyboard.up("w");
  await delay(200);
  const after = await talkSnap(page);
  ok(label + ": E while W is held opens talk and it stays open (1s, then after release)",
    !!(at200.open && at1s.open && after.open && !at1s.pause),
    { placed, at200: { open: at200.open, say: at200.say }, at1s: { open: at1s.open, say: at1s.say }, after: after.open });

  // Choices must be on-panel, above the Say aloud bar, and hit-testable.
  const snap = after.open ? after : at1s.open ? at1s : await (async () => {
    await placeNpc(page);
    await page.keyboard.press("e");
    await delay(500);
    return talkSnap(page);
  })();
  ok(label + ": at least one conversation choice is inside the panel, above the Say aloud bar, and clickable",
    !!(snap.open && snap.clickable >= 1),
    { clickable: snap.clickable, choices: snap.choices, first: snap.first, talkBottom: snap.talkBottom, hmTop: snap.hmTop });

  if (snap.open && snap.clickable >= 1) {
    const clicked = await page.evaluate(() => {
      const T = document.getElementById("talk");
      const tr = T && T.getBoundingClientRect();
      const hm = document.getElementById("hmBar");
      const hr = hm && !hm.hidden ? hm.getBoundingClientRect() : null;
      const acts = document.getElementById("tkActs");
      const b = acts && [...acts.querySelectorAll("button")].find((btn) => {
        if (btn.disabled || /leave it|walk away|done \(esc\)|move along|more|less /i.test(btn.textContent || "")) return false;
        const cs = getComputedStyle(btn);
        if (cs.display === "none" || cs.visibility === "hidden") return false;
        const r = btn.getBoundingClientRect();
        const y = r.top + Math.min(12, Math.max(4, r.height / 3));
        const x = r.left + r.width / 2;
        const top = document.elementFromPoint(x, y);
        const inPanel = !!(tr && r.top >= tr.top - 1 && r.bottom <= tr.bottom + 1);
        const aboveBar = !hr || r.bottom <= hr.top + 1;
        return inPanel && aboveBar && top && (top === btn || btn.contains(top));
      });
      if (!b) return { ok: false };
      const text = (b.textContent || "").trim().slice(0, 80);
      b.click();
      return { ok: true, text };
    });
    await delay(700);
    const afterClick = await talkSnap(page);
    ok(label + ": clicking a visible choice keeps talk open",
      !!(clicked.ok && afterClick.open),
      { clicked, say: afterClick.say, open: afterClick.open });
  } else {
    ok(label + ": clicking a visible choice keeps talk open", false, snap);
  }

  // Free reply: type a line, get a spoken answer or fallback (not a hang on "…").
  await closeTalkUi(page);
  await resumeIfPaused(page);
  await placeNpc(page);
  await page.keyboard.press("e");
  await delay(500);
  let pre = await talkSnap(page);
  if (!pre.open) {
    ok(label + ": typed reply produces a line and leaves talk open", false, pre);
    return;
  }
  const inp = await page.$("#tkOwnIn");
  if (inp) {
    if (pre.focus !== "tkOwnIn") await inp.click();
    await page.keyboard.type("How is your family?", { delay: 10 });
  }
  const typed = await page.evaluate(() => (document.getElementById("tkOwnIn") || {}).value);
  const accepted = /family/i.test(typed || "");
  if (inp) await page.keyboard.press("Enter");
  let reply = pre;
  for (let i = 0; i < 20; i++) {
    await delay(400);
    reply = await talkSnap(page);
    const s = (reply.say || "").trim();
    if (reply.open && s && s !== "…" && s !== "...") break;
    if (!reply.open) break;
  }
  const said = ((reply.say || "").trim());
  ok(label + ": typed reply produces a line and leaves talk open",
    !!(accepted && reply.open && said && said !== "…" && said !== "..."),
    { accepted, typed, say: said, open: reply.open });
}

async function run() {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass, detail });
    console.log((pass ? "PASS" : "FAIL") + "  " + name + (detail ? " — " + (typeof detail === "string" ? detail : JSON.stringify(detail).slice(0, 360)) : ""));
  };

  const server = await startServer();
  const origin = "http://127.0.0.1:" + server.address().port;
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || "/usr/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
      "--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl",
      "--disable-gpu-sandbox", "--window-size=1280,720",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.setDefaultTimeout(90000);
  page.on("pageerror", () => {});

  try {
    await bootNewCareer(page, origin, "Convo Tester");
    const boot = await page.evaluate(() => ({
      running: !!(window.ONUM && window.ONUM.running && window.ONUM.running()),
      stamp: (document.querySelector('meta[name="onum-build"]') || {}).content,
      name: (() => { try { return window.NEPTUNE.debug().G.you.name; } catch (e) { return null; } })(),
    }));
    ok("new career is running", !!(boot.running && boot.name === "Convo Tester"), boot);

    await playTalkSuite(page, "New career", ok);

    // Continue: flush, reload, Continue, talk again.
    await closeTalkUi(page);
    await page.evaluate(() => { try { window.dispatchEvent(new Event("pagehide")); } catch (e) {} });
    await delay(800);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await delay(2000);
    await page.waitForFunction(() => !!(document.getElementById("cont") || document.getElementById("fresh")), { timeout: 90000 });
    const title = await page.evaluate(() => ({
      hasCont: !!document.getElementById("cont"),
      cont: (document.getElementById("cont") || {}).textContent,
    }));
    if (title.hasCont) await page.click("#cont");
    const t1 = Date.now();
    let mid = null;
    while (Date.now() - t1 < 60000) {
      mid = await page.evaluate(() => ({
        running: !!(window.ONUM && window.ONUM.running && window.ONUM.running()),
        veil: !!(document.getElementById("veil") && !document.getElementById("veil").hidden),
        name: (() => { try { return window.NEPTUNE.debug().G.you.name; } catch (e) { return null; } })(),
      }));
      if (mid.running && mid.veil === false) break;
      await delay(400);
    }
    await resumeIfPaused(page);
    ok("Continue reopens the career", !!(mid && mid.running && mid.name === "Convo Tester" && mid.veil === false), { title, mid });
    await playTalkSuite(page, "Continue", ok);
  } finally {
    const failed = results.filter((r) => !r.pass).length;
    console.log(failed ? "FAIL " + failed + " of " + results.length : "ALL PASS " + results.length);
    try { await browser.close(); } catch (e) {}
    try { server.close(); } catch (e) {}
    process.exitCode = failed ? 1 : 0;
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
