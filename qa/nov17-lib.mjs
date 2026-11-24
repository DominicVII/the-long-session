/* 20261117o JUPITER: shared headless helpers for the nov17 suites. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require("/tmp/pptr/node_modules/puppeteer-core"); } catch (e) { puppeteer = require("puppeteer-core"); }
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".glb": "model/gltf-binary", ".wasm": "application/wasm" };
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export function startServer(ROOT) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://127.0.0.1"); let p = decodeURIComponent(u.pathname); if (p === "/") p = "/session.html";
    const file = path.join(ROOT, p); if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("nf"); return; } res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" }); res.end(data); });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}
export async function launch() {
  return puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: "new", protocolTimeout: 600000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--disable-gpu-sandbox", "--window-size=1280,720", "--js-flags=--max-old-space-size=4096"] });
}
export async function newPage(browser, errs) {
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 }); page.setDefaultTimeout(180000);
  page.on("pageerror", (e) => { errs && errs.push(String(e && e.message || e).slice(0, 300)); });
  return page;
}
/* put a career into the IDB "career" slot (the path a >2.4 MB career lives on) and clear localStorage */
export async function seedIdb(page, origin, raw) {
  await page.goto(origin + "/log.html", { waitUntil: "domcontentloaded", timeout: 60000 });
  return page.evaluate((raw) => new Promise((resolve) => {
    try { localStorage.clear(); } catch (e) {}
    const d = indexedDB.deleteDatabase("onum-saves");
    d.onsuccess = d.onerror = d.onblocked = () => {
      const rq = indexedDB.open("onum-saves", 1);
      rq.onupgradeneeded = () => { try { rq.result.createObjectStore("s"); } catch (e) {} };
      rq.onsuccess = () => { const tx = rq.result.transaction("s", "readwrite"); tx.objectStore("s").put(raw, "career"); tx.oncomplete = () => { rq.result.close(); resolve(true); }; tx.onerror = () => resolve(false); };
      rq.onerror = () => resolve(false);
    };
  }), raw);
}
export async function resumeIfPaused(page) {
  await page.evaluate(() => { const o = document.getElementById("pauseOverlay"); const b = document.getElementById("resumeGame") || document.getElementById("closeSettings"); if (o && o.classList.contains("is-open") && b) b.click(); });
  await delay(150);
}
export async function continueCareer(page, origin, qs) {
  await page.goto(origin + "/session.html" + (qs || ""), { waitUntil: "domcontentloaded", timeout: 180000 });
  await page.waitForFunction(() => { const b = document.getElementById("cont"); return !!(b && /Continue/.test(b.textContent || "")); }, { timeout: 180000 });
  const label = await page.evaluate(() => document.getElementById("cont").textContent);
  await page.click("#cont");
  const t0 = Date.now(); let st = null;
  while (Date.now() - t0 < 240000) {
    st = await page.evaluate(() => { const v = document.getElementById("veil"); const c = document.getElementById("card");
      return { running: !!(window.ONUM && window.ONUM.running && window.ONUM.running()), veil: !!(v && !v.hidden), broken: !!(v && !v.hidden && c && /Could not open that sitting/.test(c.textContent || "")) }; });
    if (st.broken || (st.running && !st.veil)) break; await delay(500);
  }
  await resumeIfPaused(page);
  return { label, ...st };
}
export const dbgG = (page, fn, arg) => page.evaluate(fn, arg);
