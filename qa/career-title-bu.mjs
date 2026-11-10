#!/usr/bin/env node
/* 20261110bu NEPTUNE: title / prompt presentation tests on top of bv continuity. */
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
  ".ts": "text/plain",
};

function startServer() {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://127.0.0.1");
    let p = decodeURIComponent(u.pathname);
    if (p === "/") p = "/public/session.html";
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

function fakeCareer(day, name, pad) {
  const you = { id: "you", name, office: "house", pos: { econ: 0, lib: 0, def: 0, wel: 0 }, rel: { warmth: 0, known: 0, debtFromYou: 0, debtToYou: 0 } };
  const members = [
    you,
    { id: "m2", name: "Ada Voss", office: "house", pos: { econ: 1, lib: 0, def: 0, wel: 0 }, rel: { warmth: 0, known: 0, debtFromYou: 0, debtToYou: 0 } },
  ];
  const d = {
    you, members, day, congress: 8, sittingDay: day, minute: 600,
    savedAtMs: 1700000000000, room: "office", country: { name: "the Republic" },
    uniqueMark: "bu-380-" + name + "-" + day,
  };
  if (pad) d.pad = "x".repeat(pad);
  return JSON.stringify(d);
}

const BAN = /\bdelet(?:e|es|ed|ing)\b|\breplace[sd]?\b/i;

async function seedOnOrigin(page, origin, fn, arg) {
  await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded", timeout: 30000 });
  return page.evaluate(fn, arg);
}

async function openGame(page, origin, extra) {
  const q = extra || "";
  await page.goto(origin + "/public/session.html" + q, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
}

async function waitReady(page) {
  await page.evaluate(() => new Promise((resolve) => {
    if (window.ONUM_CAREERS && window.ONUM_CAREERS.onReady) window.ONUM_CAREERS.onReady(() => resolve(true));
    else resolve(false);
  }));
}

const SEED_IDB = async (raw) => {
  const keys = ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta", "longsession.v3.careers"];
  keys.forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
  const drop = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf("onum_career_archive_") === 0) drop.push(k);
  }
  drop.forEach((k) => localStorage.removeItem(k));
  await new Promise((resolve, reject) => {
    const rq = indexedDB.open("onum-saves", 1);
    rq.onupgradeneeded = () => { try { rq.result.createObjectStore("s"); } catch (e) {} };
    rq.onerror = () => reject(new Error("idb open"));
    rq.onsuccess = () => {
      const db = rq.result;
      const tx = db.transaction("s", "readwrite");
      tx.objectStore("s").put(raw, "career");
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("idb put"));
    };
  });
};

async function run() {
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass, detail });
    console.log((pass ? "PASS" : "FAIL") + "  " + name + (detail ? " — " + detail : ""));
  };

  const server = await startServer();
  const port = server.address().port;
  const origin = "http://127.0.0.1:" + port;
  const raw = fakeCareer(380, "Dominic Z. Taylor", 8000);
  const rawBig = fakeCareer(380, "Dominic Z. Taylor", 2500000); // >2.4 MB IDB-only style
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || "/usr/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
      "--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl",
      "--disable-gpu-sandbox",
    ],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  const pageErrors = [];
  page.on("pageerror", (e) => { pageErrors.push(String(e && e.message || e)); });

  const installSnaps = async () => {
    await page.evaluateOnNewDocument(() => {
      window.__titleSnaps = [];
      const rec = () => {
        try {
          const card = document.getElementById("card");
          if (!card) return;
          const html = card.innerHTML || "";
          if (!html) return;
          const last = window.__titleSnaps[window.__titleSnaps.length - 1];
          if (last && last.html === html) return;
          window.__titleSnaps.push({
            t: Date.now(),
            html,
            text: card.textContent || "",
            hasCont: !!document.getElementById("cont"),
            hasFresh: !!document.getElementById("fresh"),
            looking: /Looking for your career/.test(card.textContent || ""),
          });
        } catch (e) {}
      };
      const moStart = () => {
        rec();
        const card = document.getElementById("card");
        if (card && window.MutationObserver) {
          new MutationObserver(rec).observe(card, { childList: true, subtree: true, characterData: true });
        }
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", moStart);
      else moStart();
    });
  };

  try {
    // ── 1. localStorage-only (no sidecar): Continue on first title paint, no delete/replace wording ──
    await installSnaps();
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta", "longsession.v3.careers"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    const lsFirst = await page.evaluate(() => {
      const snaps = window.__titleSnaps || [];
      const firstAction = snaps.find((s) => s.hasCont || s.hasFresh || s.looking);
      const btn = document.getElementById("cont");
      const fresh = document.getElementById("fresh");
      const text = (document.getElementById("card") && document.getElementById("card").textContent) || "";
      return {
        first: firstAction,
        btn: btn && btn.textContent,
        fresh: fresh && fresh.textContent,
        focused: document.activeElement && document.activeElement.id,
        text,
        banned: /\\bdelet(?:e|es|ed|ing)\\b|\\breplace[sd]?\\b/i.test(text),
      };
    });
    ok("LS-only: Continue on title with day 380 and name",
      !!(lsFirst.btn && /380/.test(lsFirst.btn) && /Dominic/.test(lsFirst.btn) && /Continue/.test(lsFirst.btn)),
      lsFirst.btn);
    ok("LS-only: secondary is 'Start a new career'",
      !!(lsFirst.fresh && /Start a new career/.test(lsFirst.fresh)), lsFirst.fresh);
    ok("LS-only: Continue is default-focused", lsFirst.focused === "cont", "focus=" + lsFirst.focused);
    ok("LS-only: no delete/replace wording on the title", !lsFirst.banned, (lsFirst.text || "").slice(0, 200));
    const lsFirstWasNewOnly = lsFirst.first && lsFirst.first.hasFresh && !lsFirst.first.hasCont && !lsFirst.first.looking;
    ok("LS-only: first action frame was not New-career-only", !lsFirstWasNewOnly, JSON.stringify(lsFirst.first));

    // Enter / Space must not open the confirm
    await page.keyboard.press("Enter");
    await new Promise((r) => setTimeout(r, 400));
    let afterEnter = await page.evaluate(() => ({
      h1: (document.querySelector("#card h1") || {}).textContent || "",
      hasYes: !!document.getElementById("freshYes"),
      hasCont: !!document.getElementById("cont"),
    }));
    ok("LS-only: Enter does not reach Start a new career", !afterEnter.hasYes && !/Start a new career\?/.test(afterEnter.h1), JSON.stringify(afterEnter));

    // If Enter started Continue (loading), go back by reloading for Space test
    await page.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => !!(document.getElementById("cont") || document.getElementById("fresh")), { timeout: 90000 });
    // focus the fresh button, then press Space — must still not activate it
    await page.evaluate(() => { const f = document.getElementById("fresh"); if (f) f.focus(); });
    await page.keyboard.press(" ");
    await new Promise((r) => setTimeout(r, 400));
    const afterSpace = await page.evaluate(() => ({
      h1: (document.querySelector("#card h1") || {}).textContent || "",
      hasYes: !!document.getElementById("freshYes"),
      hasCont: !!document.getElementById("cont"),
      focus: document.activeElement && document.activeElement.id,
    }));
    ok("LS-only: Space on focused Start a new career does not open confirm",
      !afterSpace.hasYes && !/Start a new career\?/.test(afterSpace.h1), JSON.stringify(afterSpace));

    // Clicking Start a new career opens truthful confirm; Back is primary
    await page.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => !!document.getElementById("fresh"), { timeout: 90000 });
    await page.click("#fresh");
    await page.waitForFunction(() => !!document.getElementById("freshYes"), { timeout: 10000 });
    const confirm = await page.evaluate(() => {
      const card = document.getElementById("card");
      const text = card ? card.textContent : "";
      const back = document.getElementById("freshBack");
      const yes = document.getElementById("freshYes");
      const backPrimary = !!(back && back.classList.contains("btn") && !back.classList.contains("btn--ghost"));
      const yesGhost = !!(yes && yes.classList.contains("btn--ghost"));
      return {
        text,
        backPrimary,
        yesGhost,
        yesLabel: yes && yes.textContent,
        hasArchive: /stays saved as an archive/.test(text) && /return to it any time/.test(text),
        bannedBefore: false,
        hasDelete: /\\bdelet(?:e|es|ed|ing)\\b/i.test(text),
        hasReplace: /\\breplace[sd]?\\b/i.test(text),
      };
    });
    ok("confirm: archive-and-keep copy, Back primary, Yes secondary",
      !!(confirm.hasArchive && confirm.backPrimary && confirm.yesGhost && /Yes, start a new career/.test(confirm.yesLabel || "")),
      JSON.stringify({ backPrimary: confirm.backPrimary, yesGhost: confirm.yesGhost, hasArchive: confirm.hasArchive }));

    // Yes should archive then open the oath (nameCard)
    await page.click("#freshYes");
    await page.waitForFunction(() => !!document.getElementById("nameIn") || !!document.getElementById("mkGo") || !!document.getElementById("freshType"), { timeout: 20000 });
    const oath = await page.evaluate(() => ({
      oath: !!(document.getElementById("mkGo") || document.getElementById("nameIn")),
      hasBack: !!document.getElementById("mkNameBack"),
      archives: (window.ONUM_CAREERS.list().archives || []).length,
    }));
    ok("Yes starts the oath and archives the old career", !!(oath.oath && oath.archives >= 1), JSON.stringify(oath));
    ok("nameCard has Back", oath.hasBack);

    // Back from oath returns to title and Continue still names day 380? After archive+Yes, wipe is armed but active slot not yet wiped.
    // Back calls clearWipe; opening() should still peek the active career (still there).
    await page.click("#mkNameBack");
    await page.waitForFunction(() => !!document.getElementById("cont") || !!document.getElementById("bootArchives"), { timeout: 10000 });
    const afterBack = await page.evaluate(() => {
      const btn = document.getElementById("cont");
      const arch = document.getElementById("bootArchives");
      return { btn: btn && btn.textContent, arch: arch && arch.textContent, archives: (window.ONUM_CAREERS.list().archives || []).length };
    });
    ok("Back from oath returns to title; earlier careers listed",
      !!(afterBack.btn && /380/.test(afterBack.btn) && afterBack.archives >= 1 && afterBack.arch && /Earlier careers/.test(afterBack.arch)),
      JSON.stringify(afterBack));

    // ── 2. IDB-only, no sidecar: first frame is Looking for… (never New-career-only), then Continue ──
    await page.evaluateOnNewDocument(() => {}); // keep snaps from previous install — need a new page for clean evaluateOnNewDocument
    const page2 = await browser.newPage();
    const errors2 = [];
    page2.on("pageerror", (e) => { errors2.push(String(e && e.message || e)); });
    await page2.evaluateOnNewDocument(() => {
      window.__titleSnaps = [];
      const rec = () => {
        try {
          const card = document.getElementById("card");
          if (!card) return;
          const html = card.innerHTML || "";
          if (!html) return;
          const last = window.__titleSnaps[window.__titleSnaps.length - 1];
          if (last && last.html === html) return;
          window.__titleSnaps.push({
            html,
            text: card.textContent || "",
            hasCont: !!document.getElementById("cont"),
            hasFresh: !!document.getElementById("fresh"),
            looking: /Looking for your career/.test(card.textContent || ""),
          });
        } catch (e) {}
      };
      const moStart = () => {
        rec();
        const card = document.getElementById("card");
        if (card && window.MutationObserver) {
          new MutationObserver(rec).observe(card, { childList: true, subtree: true, characterData: true });
        }
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", moStart);
      else moStart();
    });
    await seedOnOrigin(page2, origin, SEED_IDB, rawBig);
    await page2.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page2.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
    await page2.evaluate(() => new Promise((resolve) => {
      if (window.ONUM_CAREERS && window.ONUM_CAREERS.onReady) window.ONUM_CAREERS.onReady(() => resolve(true));
      else resolve(false);
    }));
    // wait until Continue or timeout
    await page2.waitForFunction(() => {
      const b = document.getElementById("cont");
      return !!(b && /380/.test(b.textContent || ""));
    }, { timeout: 20000 });
    const idb = await page2.evaluate(() => {
      const snaps = window.__titleSnaps || [];
      const firstAction = snaps.find((s) => s.hasCont || s.hasFresh || s.looking);
      const newOnly = snaps.filter((s) => s.hasFresh && !s.hasCont && !s.looking);
      const btn = document.getElementById("cont");
      return {
        first: firstAction,
        newOnlyCount: newOnly.length,
        btn: btn && btn.textContent,
        lookingSeen: snaps.some((s) => s.looking),
      };
    });
    ok("IDB-only: Continue shown after ready with day 380",
      !!(idb.btn && /380/.test(idb.btn) && /Dominic/.test(idb.btn)), idb.btn);
    ok("IDB-only: never painted a New-career-only title", idb.newOnlyCount === 0,
      "newOnly=" + idb.newOnlyCount + " first=" + JSON.stringify(idb.first) + " lookingSeen=" + idb.lookingSeen);

    // ── 3. backup-key-only ──
    await seedOnOrigin(page2, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3.backup", raw);
    }, raw);
    await page2.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page2.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
    await page2.evaluate(() => new Promise((resolve) => {
      if (window.ONUM_CAREERS && window.ONUM_CAREERS.onReady) window.ONUM_CAREERS.onReady(() => resolve(true));
      else resolve(false);
    }));
    const bak = await page2.evaluate(() => {
      const btn = document.getElementById("cont");
      return { btn: btn && btn.textContent };
    });
    ok("backup-key-only: Continue names day 380", !!(bak.btn && /380/.test(bak.btn) && /Dominic/.test(bak.btn)), bak.btn);

    // ── 4. ?limits=classic still boots ──
    const page3 = await browser.newPage();
    const errors3 = [];
    page3.on("pageerror", (e) => { errors3.push(String(e && e.message || e)); });
    await page3.goto(origin + "/public/session.html?limits=classic", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page3.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek) && (document.getElementById("cont") || document.getElementById("fresh") || /Looking for your career/.test((document.getElementById("card") || {}).textContent || "")), { timeout: 90000 });
    const classic = await page3.evaluate(() => ({
      stamp: (document.querySelector('meta[name="onum-build"]') || {}).content,
      dump: window.onumLimDump && window.onumLimDump(),
      hasCard: !!(document.getElementById("card") && document.getElementById("card").innerHTML),
    }));
    ok("?limits=classic boots (stamp bu, limits mode classic, title card present)",
      !!(classic.stamp === "20261110bu" && classic.dump && classic.dump.mode === "classic" && classic.hasCard),
      JSON.stringify({ stamp: classic.stamp, mode: classic.dump && classic.dump.mode }));

    const unexpected = [...pageErrors, ...errors2, ...errors3].filter((m) => {
      // known pre-existing noise in headless / reactEmit
      if (/reactEmit/.test(m)) return false;
      if (/WebGL|THREE|swiftshader|context/i.test(m)) return false;
      return true;
    });
    ok("no unexpected page errors on title boots", unexpected.length === 0, unexpected.slice(0, 5).join(" | "));

  } finally {
    await browser.close().catch(() => {});
    server.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n" + (results.length - failed.length) + " passed, " + failed.length + " failed, " + results.length + " total");
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => {
  console.error("TEST HARNESS ERROR", e);
  process.exit(2);
});
