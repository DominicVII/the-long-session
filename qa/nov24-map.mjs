#!/usr/bin/env node
/* 20261124e JUPITER: inline continental world map + nation map, keeping all 5 filters,
   zero external fetch, zero clipping at 800x600 and 1280x720. On a COPY of day-540 save.
   Usage: node qa/nov24-map.mjs [worktree] [save.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const SAVE = process.argv[3] || "/workspace/nov24/save540.json";
const raw = fs.readFileSync(SAVE, "utf8");
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch(); const errs = []; const extReqs = [];
const page = await newPage(br, errs);
await page.setRequestInterception(true);
let mapWatch = false;
page.on("request", (req) => {
  const u = req.url();
  if (u.startsWith(origin) || u.startsWith("data:") || u.startsWith("blob:")) req.continue();
  else { if (mapWatch) extReqs.push(u); req.abort(); }
});
await seedIdb(page, origin, raw);
const cont = await continueCareer(page, origin);
const wantDay = JSON.parse(raw).day;
const dayNow = await page.evaluate(() => window.ONUM.day().day);
ok(cont.running && dayNow === wantDay, "Continue opens day " + wantDay + " (G.day " + dayNow + ")");

/* Open the Union/Map pane */
mapWatch = true;
await page.keyboard.press("m");
await delay(400);

const geo = await page.evaluate(() => window.ONUM.map.geo());
ok(geo.continents.length === 6, "6 surrounding continents defined (" + geo.continents.map(c => c.name).join(", ") + ")");
ok(geo.states.length === 20 && geo.states.every(s => s.vertices >= 16), "all 20 states have organic multi-vertex borders (min vertices " + Math.min(...geo.states.map(s => s.vertices)) + ")");

const dom0 = await page.evaluate(() => {
  const P = document.getElementById("paneUnion");
  const svg = P && P.querySelector('svg[aria-label="Map of the Union"]');
  const conts = svg ? [...svg.querySelectorAll(".mapcont")].map(g => g.getAttribute("data-cont")) : [];
  const sts = svg ? [...svg.querySelectorAll(".mapstate")].map(g => ({ n: g.getAttribute("data-st"), fill: g.querySelector("path")?.getAttribute("fill") })) : [];
  return { view: svg?.getAttribute("data-map-view"), vb: svg?.getAttribute("viewBox"), conts, sts };
});
ok(dom0.view === "world" && dom0.conts.length === 6 && dom0.sts.length === 20, "world view renders 6 continents and 20 states (viewBox " + dom0.vb + ")");

/* Test all 5 filters produce valid colors and distinct modes actually recolor states */
const fillsByMode = {};
for (const mode of ["lean", "party", "faith", "tension", "race"]) {
  await page.locator(`[data-qmode="${mode}"]`).click();
  await delay(150);
  const f = await page.evaluate(() => {
    const P = document.getElementById("paneUnion");
    const svg = P.querySelector('svg[aria-label="Map of the Union"]');
    return [...svg.querySelectorAll(".mapstate path")].map(p => p.getAttribute("fill"));
  });
  fillsByMode[mode] = f;
  ok(f.length === 20 && f.every(Boolean), `filter '${mode}' colors all 20 states`);
}
const sig = m => fillsByMode[m].join("|");
ok(sig("lean") !== sig("party"), "lean filter and party filter are distinct");
ok(sig("faith") !== sig("tension") && sig("tension") !== sig("lean"), "faith and tension filters re-shade the states");

/* Toggle to nation view and back */
await page.locator('[data-mapview="nation"]').click();
await delay(150);
const nat = await page.evaluate(() => {
  const svg = document.querySelector('#paneUnion svg[aria-label="Map of the Union"]');
  return { view: svg?.getAttribute("data-map-view"), vb: svg?.getAttribute("viewBox"), sts: svg?.querySelectorAll(".mapstate").length };
});
ok(nat.view === "nation" && nat.sts === 20 && nat.vb !== dom0.vb, "nation view zooms into the 20 states (" + nat.vb + ")");

/* Filters work in nation view too */
await page.locator('[data-qmode="tension"]').click();
await delay(100);
const natTension = await page.evaluate(() => [...document.querySelectorAll('#paneUnion .mapstate path')].map(p => p.getAttribute("fill")).join("|"));
ok(natTension === sig("tension"), "tension filter works identically in nation view");

await page.locator('[data-mapview="world"]').click();
await page.locator('[data-qmode="lean"]').click();
await delay(100);

/* Click a state and a continent */
await page.click('#paneUnion [data-st="Blackwater"]');
await delay(150);
const selState = await page.evaluate(() => {
  try { const c = document.getElementById("card"); if (c && c.classList.contains("card--open")) document.querySelector("#card .btn")?.click(); } catch (e) {}
  return NEPTUNE.debug().G.mapSel;
});
ok(selState === "Blackwater", "clicking a state selects it (G.mapSel = " + selState + ")");

/* Fit check at 800x600 and 1280x720 (no clipping / overflow) */
for (const [w, h] of [[800, 600], [1280, 720]]) {
  await page.setViewport({ width: w, height: h });
  await delay(150);
  const fit = await page.evaluate(() => {
    const P = document.getElementById("paneUnion");
    const svg = P.querySelector('svg[aria-label="Map of the Union"]');
    const pr = P.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    return {
      vw: innerWidth, vh: innerHeight,
      srLeft: sr.left, srRight: sr.right, srWidth: sr.width, srHeight: sr.height,
      prLeft: pr.left, prRight: pr.right,
      fitsHoriz: sr.width > 100 && sr.left >= pr.left - 2 && sr.right <= pr.right + 2 && sr.right <= innerWidth + 2,
      fitsHeight: sr.height > 80 && sr.height <= innerHeight + 40
    };
  });
  ok(fit.fitsHoriz && fit.fitsHeight, `map SVG fits at ${w}x${h} with no clipping (` + JSON.stringify({ w: Math.round(fit.srWidth), h: Math.round(fit.srHeight), right: Math.round(fit.srRight), prRight: Math.round(fit.prRight) }) + ")");
}

ok(extReqs.length === 0, "zero external network requests (" + extReqs.length + ")");
ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""));
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed");
process.exit(bad ? 1 : 0);
