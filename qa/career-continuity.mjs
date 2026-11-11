#!/usr/bin/env node
/* 20261110bv JUPITER / 20261110bw NEPTUNE: headless continuity tests.
   Seeds a day-380 career and asserts Continue / archive / restore.
   bw adds Continue-after-wipe (reload and crash-before-first-save).
   Usage: node qa/career-continuity.mjs [path-to-worktree]
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
    uniqueMark: "bv-380-" + name + "-" + day,
  };
  if (pad) d.pad = "x".repeat(pad);
  return JSON.stringify(d);
}

async function seedOnOrigin(page, origin, fn, arg) {
  await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded", timeout: 30000 });
  return page.evaluate(fn, arg);
}

async function openGame(page, origin) {
  await page.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
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
      const st = tx.objectStore("s");
      st.put(raw, "career");
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("idb put"));
    };
  });
};

const SEED_LS = (key, raw, clearOthers) => {
  if (clearOthers) {
    ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta"].forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }
  localStorage.setItem(key, raw);
  return true;
};

const SEED_META = (meta) => {
  localStorage.setItem("longsession.v3.meta", JSON.stringify(meta));
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
  page.on("pageerror", (e) => { /* game may throw on 3D in headless; save path must still work */ });

  try {
    // ── 1. IDB-only, no sidecar: Continue appears after onReady (the original race) ──
    await seedOnOrigin(page, origin, SEED_IDB, raw);
    await openGame(page, origin);
    await waitReady(page);
    const idbOnly = await page.evaluate(async (expectedDay) => {
      const btn = document.getElementById("cont");
      const peek = window.ONUM_CAREERS.peek && window.ONUM_CAREERS.peek();
      const loaded = await new Promise((resolve) => window.ONUM_CAREERS.load("career", resolve));
      return {
        hasContinue: !!(btn && btn.textContent),
        btn: btn ? btn.textContent : null,
        peek,
        loadOk: !!(loaded && loaded.ok && loaded.data && loaded.data.day === expectedDay),
        loadName: loaded && loaded.data && loaded.data.you && loaded.data.you.name,
        loadDay: loaded && loaded.data && loaded.data.day,
        bytes: loaded && loaded.raw && loaded.raw.length,
      };
    }, 380);
    ok("IDB-only: Continue shown after IDB ready", !!(idbOnly.hasContinue && /380/.test(idbOnly.btn || "") && /Dominic/.test(idbOnly.btn || "")), idbOnly.btn);
    ok("IDB-only: load('career') returns day 380 Dominic Z. Taylor", !!(idbOnly.loadOk && idbOnly.loadName === "Dominic Z. Taylor"), JSON.stringify({ day: idbOnly.loadDay, name: idbOnly.loadName }));

    // ── 2. IDB-only + sidecar: Continue on first title paint (no need to wait for blob) ──
    await seedOnOrigin(page, origin, async (arg) => {
      await (async () => {})();
      const keys = ["longsession.v3", "longsession.v3.backup", "longsession.v3.best"];
      keys.forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
      localStorage.setItem("longsession.v3.meta", JSON.stringify(arg.meta));
      await new Promise((resolve, reject) => {
        const rq = indexedDB.open("onum-saves", 1);
        rq.onupgradeneeded = () => { try { rq.result.createObjectStore("s"); } catch (e) {} };
        rq.onsuccess = () => {
          const db = rq.result;
          const tx = db.transaction("s", "readwrite");
          tx.objectStore("s").put(arg.raw, "career");
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        };
        rq.onerror = () => reject(new Error("idb"));
      });
    }, { raw, meta: { name: "Dominic Z. Taylor", day: 380, rank: 8 * 1e9 + 380 * 1e6, slot: "career", congress: 8 } });
    const firstPeek = { done: false };
    await page.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    // peek() must be usable as soon as ONUM_CAREERS exists, from the sidecar, even if IDB is still opening
    await page.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek));
    const sidecar = await page.evaluate(() => {
      const p = window.ONUM_CAREERS.peek();
      const btn = document.getElementById("cont");
      return { peek: p, hasContinue: !!(btn && /380/.test(btn.textContent || "")), btn: btn && btn.textContent };
    });
    ok("sidecar peek() is sync and names the 380-day career on first API frame",
      !!(sidecar.peek && sidecar.peek.day === 380 && sidecar.peek.name === "Dominic Z. Taylor" && sidecar.peek.slot && sidecar.peek.rank),
      JSON.stringify(sidecar.peek));
    ok("sidecar: Continue visible from first title paint", sidecar.hasContinue, sidecar.btn);

    // ── 3. localStorage-only ──
    await seedOnOrigin(page, origin, async (raw) => {
      await new Promise((resolve) => {
        try {
          const d = indexedDB.deleteDatabase("onum-saves");
          d.onsuccess = () => resolve(true);
          d.onerror = () => resolve(false);
          d.onblocked = () => resolve(false);
        } catch (e) { resolve(false); }
      });
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    const lsOnly = await page.evaluate(() => {
      const btn = document.getElementById("cont");
      return new Promise((resolve) => window.ONUM_CAREERS.load("career", (r) => resolve({
        hasContinue: !!(btn && /380/.test(btn.textContent || "")),
        btn: btn && btn.textContent,
        ok: !!(r && r.ok && r.data && r.data.day === 380),
        name: r && r.data && r.data.you && r.data.you.name,
      })));
    });
    ok("localStorage-only: Continue + load day 380", !!(lsOnly.hasContinue && lsOnly.ok && lsOnly.name === "Dominic Z. Taylor"), lsOnly.btn);

    // ── 4. backup-key-only ──
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3.backup", raw);
      return true;
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    const bak = await page.evaluate(() => new Promise((resolve) => {
      const btn = document.getElementById("cont");
      window.ONUM_CAREERS.load("longsession.v3.backup", (r) => resolve({
        hasContinue: !!(btn && /380/.test(btn.textContent || "")),
        btn: btn && btn.textContent,
        ok: !!(r && r.ok && r.data && r.data.day === 380),
      }));
    }));
    ok("backup-key-only: Continue + load day 380", !!(bak.hasContinue && bak.ok), bak.btn);

    // ── 5. new career (archive + wipe active) then reload; old career restorable byte-for-byte ──
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta", "longsession.v3.careers"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    const archived = await page.evaluate((orig) => new Promise((resolve) => {
      window.ONUM_CAREERS.archiveCurrent((res) => {
        if (!res || !res.ok) return resolve({ ok: false, stage: "archive", res });
        const id = res.id;
        const rawAtArchive = res.raw;
        const match = rawAtArchive === orig;
        window.G = window.G || {};
        window.G._archiveVerified = res;
        window.G._wipeOnOath = true;
        window.ONUM_CAREERS.wipeActive();
        resolve({ ok: true, id, match, bytes: rawAtArchive && rawAtArchive.length, wipeArmedCleared: null });
      });
    }), raw);
    ok("archiveCurrent verified and raw matches seed byte-for-byte", !!(archived.ok && archived.match), "id=" + archived.id + " bytes=" + archived.bytes);

    const clearWipe = await page.evaluate(() => {
      const armed = window.ONUM_CAREERS._qaSetWipe(true);
      const mid = window.ONUM_CAREERS.clearWipe();
      return { armed, mid };
    });
    ok("clearWipe() clears G._wipeOnOath and G._freshOk",
      !!(clearWipe.armed && clearWipe.mid && clearWipe.mid.ok && clearWipe.mid.wipeOnOath === false && clearWipe.mid.freshOk === false),
      JSON.stringify(clearWipe));

    // reload: archive still there, active gone, restore is byte-for-byte
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
    await waitReady(page);
    const afterReload = await page.evaluate((arg) => new Promise((resolve) => {
      const listed = window.ONUM_CAREERS.list();
      const has = (listed.archives || []).some((x) => x.id === arg.id);
      window.ONUM_CAREERS.load(arg.id, (loaded) => {
        const loadMatch = !!(loaded && loaded.ok && loaded.raw === arg.raw);
        window.ONUM_CAREERS.restore(arg.id, (rest) => {
          const active = window.ONUM_CAREERS.activeRaw && window.ONUM_CAREERS.activeRaw();
          resolve({
            listed: has,
            loadMatch,
            restoreOk: !!(rest && rest.ok),
            restoreMatch: !!(rest && rest.raw === arg.raw),
            activeMatch: active === arg.raw,
            archiveCount: (listed.archives || []).length,
          });
        });
      });
    }), { id: archived.id, raw });
    ok("after new-career wipe + reload, list() still has the archive", afterReload.listed, "archives=" + afterReload.archiveCount);
    ok("load(slotId) returns the old career byte-for-byte", afterReload.loadMatch);
    ok("restore(slotId) writes the old career back to the active slot byte-for-byte", !!(afterReload.restoreOk && afterReload.restoreMatch && afterReload.activeMatch));

    // ── 5b. oath/wipe + reload before first save: Continue (not the API) opens day 380 ──
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta", "longsession.v3.careers"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      const drop = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("onum_career_archive_") === 0) drop.push(k);
      }
      drop.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    const preCont = await page.evaluate(() => new Promise((resolve) => {
      window.ONUM_CAREERS.archiveCurrent((res) => {
        if (res && res.ok) {
          try { if (window.G) { G._archiveVerified = res; G._wipeOnOath = false; } } catch (e) {}
          window.ONUM_CAREERS.wipeActive();
        }
        resolve({ ok: !!(res && res.ok), id: res && res.id, peek: window.ONUM_CAREERS.peek && window.ONUM_CAREERS.peek(), active: !!(window.ONUM_CAREERS.activeRaw && window.ONUM_CAREERS.activeRaw()) });
      });
    }));
    ok("5b archive+wipe leaves sidecar pointing at the archive, active empty",
      !!(preCont.ok && !preCont.active && preCont.peek && preCont.peek.day === 380 && preCont.peek.slot && preCont.peek.slot !== "career"),
      JSON.stringify(preCont));
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
    await waitReady(page);
    await page.waitForFunction(() => {
      const b = document.getElementById("cont");
      return !!(b && /380/.test(b.textContent || "") && /Continue/.test(b.textContent || ""));
    }, { timeout: 20000 });
    await page.click("#cont");
    await page.waitForFunction(() => {
      const veil = document.getElementById("veil");
      const hidden = !!(veil && veil.hidden);
      const card = document.getElementById("card");
      const broken = !!(!hidden && card && /Could not open that sitting/.test(card.textContent || ""));
      const day = (typeof window.onumDay === "function") ? window.onumDay() : 0;
      const name = (typeof window.onumNameOf === "function") ? window.onumNameOf("you") : null;
      const clock = (document.getElementById("kClock") && document.getElementById("kClock").textContent) || "";
      return broken || (day === 380 && name === "Dominic Z. Taylor" && /day 380/.test(clock));
    }, { timeout: 60000 });
    const clicked = await page.evaluate(() => {
      const veil = document.getElementById("veil");
      const hidden = !!(veil && veil.hidden);
      const card = document.getElementById("card");
      return {
        broken: !!(!hidden && card && /Could not open that sitting/.test(card.textContent || "")),
        day: typeof window.onumDay === "function" ? window.onumDay() : 0,
        name: typeof window.onumNameOf === "function" ? window.onumNameOf("you") : null,
        clock: (document.getElementById("kClock") && document.getElementById("kClock").textContent) || "",
      };
    });
    ok("5b Continue after wipe+reload opens the 380-day career (onumDay + #kClock)",
      !!(!clicked.broken && clicked.day === 380 && clicked.name === "Dominic Z. Taylor" && /day 380/.test(clicked.clock || "")),
      JSON.stringify(clicked));

    // ── 5c. crash before first save: kill the in-memory page right after the wipe, then Continue on a new tab ──
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best", "longsession.v3.meta", "longsession.v3.careers"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      const drop = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("onum_career_archive_") === 0) drop.push(k);
      }
      drop.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    await page.evaluate(() => new Promise((resolve) => {
      window.ONUM_CAREERS.archiveCurrent((res) => {
        if (res && res.ok) window.ONUM_CAREERS.wipeActive();
        resolve(res);
      });
    }));
    const pageCrash = await browser.newPage();
    pageCrash.setDefaultTimeout(90000);
    pageCrash.on("pageerror", () => {});
    await pageCrash.goto(origin + "/public/session.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    await pageCrash.waitForFunction(() => !!(window.ONUM_CAREERS && window.ONUM_CAREERS.peek), { timeout: 90000 });
    await pageCrash.evaluate(() => new Promise((resolve) => {
      if (window.ONUM_CAREERS && window.ONUM_CAREERS.onReady) window.ONUM_CAREERS.onReady(() => resolve(true));
      else resolve(false);
    }));
    await pageCrash.waitForFunction(() => {
      const b = document.getElementById("cont");
      return !!(b && /380/.test(b.textContent || "") && /Continue/.test(b.textContent || ""));
    }, { timeout: 20000 });
    await pageCrash.click("#cont");
    await pageCrash.waitForFunction(() => {
      const veil = document.getElementById("veil");
      const hidden = !!(veil && veil.hidden);
      const card = document.getElementById("card");
      const broken = !!(!hidden && card && /Could not open that sitting/.test(card.textContent || ""));
      const day = (typeof window.onumDay === "function") ? window.onumDay() : 0;
      const name = (typeof window.onumNameOf === "function") ? window.onumNameOf("you") : null;
      const clock = (document.getElementById("kClock") && document.getElementById("kClock").textContent) || "";
      return broken || (day === 380 && name === "Dominic Z. Taylor" && /day 380/.test(clock));
    }, { timeout: 60000 });
    const crashed = await pageCrash.evaluate(() => {
      const veil = document.getElementById("veil");
      const hidden = !!(veil && veil.hidden);
      const card = document.getElementById("card");
      return {
        broken: !!(!hidden && card && /Could not open that sitting/.test(card.textContent || "")),
        day: typeof window.onumDay === "function" ? window.onumDay() : 0,
        name: typeof window.onumNameOf === "function" ? window.onumNameOf("you") : null,
        clock: (document.getElementById("kClock") && document.getElementById("kClock").textContent) || "",
      };
    });
    ok("5c crash-before-first-save: Continue opens the 380-day career",
      !!(!crashed.broken && crashed.day === 380 && crashed.name === "Dominic Z. Taylor" && /day 380/.test(crashed.clock || "")),
      JSON.stringify(crashed));
    await pageCrash.close();

    // ── 6. quota-full localStorage: archive still verified via IDB; archives are not evicted ──
    await seedOnOrigin(page, origin, (raw) => {
      ["longsession.v3", "longsession.v3.backup", "longsession.v3.best"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem("longsession.v3", raw);
    }, raw);
    await openGame(page, origin);
    await waitReady(page);
    const quota = await page.evaluate(() => {
      const filler = [];
      let filled = 0;
      try {
        const chunk = "q".repeat(50000);
        for (let i = 0; i < 400; i++) {
          const k = "onum.qa.filler." + i;
          localStorage.setItem(k, chunk);
          filler.push(k);
          filled += chunk.length;
        }
      } catch (e) { /* quota reached */ }
      return new Promise((resolve) => {
        window.ONUM_CAREERS.archiveCurrent((res) => {
          // try the game's quota-free path (best/backup only) and confirm archives stay
          const before = (window.ONUM_CAREERS.list().archives || []).map((x) => x.id);
          try { window.ONUM_CAREERS.freeQuota(); } catch (e) {}
          const after = (window.ONUM_CAREERS.list().archives || []).map((x) => x.id);
          const evicted = before.filter((id) => after.indexOf(id) < 0);
          // archives still readable?
          const id = res && res.id;
          let stillThere = false;
          try { stillThere = !!(id && (localStorage.getItem(id) || true)); } catch (e) {}
          resolve({
            ok: !!(res && res.ok && res.verified),
            idbOk: !!(res && res.idbOk),
            lsOk: !!(res && res.lsOk),
            evicted,
            id,
            filled,
            why: res && res.why,
          });
        });
      });
    });
    ok("quota-full localStorage: archiveCurrent still verifies (IDB if LS cannot hold it)",
      !!(quota.ok && (quota.idbOk || quota.lsOk)),
      JSON.stringify({ idbOk: quota.idbOk, lsOk: quota.lsOk, filled: quota.filled, why: quota.why }));
    ok("quota-full: careerFreeQuota does not evict archives", (quota.evicted || []).length === 0, "evicted=" + JSON.stringify(quota.evicted));

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
