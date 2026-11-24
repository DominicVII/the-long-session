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
  ok("0 page errors", errs.length === 0, errs.slice(0, 3));
  await page.close();
} finally {
  const failed = results.filter((r) => !r.pass).length; console.log(failed ? "FAIL " + failed + " of " + results.length : "ALL PASS " + results.length);
  try { await browser.close(); } catch (e) {} try { server.close(); } catch (e) {} process.exitCode = failed ? 1 : 0;
}
