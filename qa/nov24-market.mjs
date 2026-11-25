#!/usr/bin/env node
/* 20261124e/g JUPITER: stock market + currency ticker on the phone, tied to
   in-game economy & events, exposed as ONUM.market / ONUM.ticker data API
   emitting {o,h,l,c,v} rows for Neptune's onumDoc.chart.candles / odCandles.
   Usage: node qa/nov24-market.mjs [worktree] [--save save.json | save.json] */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";

const ROOT = path.resolve(process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : ".");
const si = process.argv.indexOf("--save");
const SAVE = si > 0 ? process.argv[si + 1] : (process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "/workspace/nov24/save540.json");
const raw = fs.readFileSync(SAVE, "utf8");
const WANT = JSON.parse(raw).day;
const baseBytes = raw.length;
let bad = 0;
const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };

const srv = await startServer(ROOT);
const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const errs = [];
const page = await newPage(br, errs);

await seedIdb(page, origin, raw);
const cont = await continueCareer(page, origin);
const dayNow = await page.evaluate(() => window.ONUM.day().day);
ok(cont.running && dayNow === WANT, "Continue opens day " + WANT + " (G.day " + dayNow + ")");

/* Check ONUM.market and ONUM.ticker API shapes and live value parity */
const api0 = await page.evaluate(() => {
  const snap = window.ONUM.market.snapshot(true);
  const tick = window.ONUM.ticker();
  const pb = window.onumPocketbook();
  const chest = window.ONUM.shops.chest();
  const cDock = window.ONUM.market.candles("dock");
  const cByTicker = window.ONUM.market.candles("DOCK", { limit: 8 });
  const cUgl = window.ONUM.market.candles("UGL");
  const cAll = window.ONUM.market.candles();
  const svgDock = window.onumDoc && window.onumDoc.chart ? window.onumDoc.chart.candles(cDock) : "";
  const svgUgl = window.onumDoc && window.onumDoc.chart ? window.onumDoc.chart.candles(cUgl) : "";
  return { snap, tick, pb, chest, cDock, cByTicker, cUgl, cAll, svgDock, svgUgl };
});
ok(api0.snap && api0.snap.guilder && api0.snap.guilder.code === "UGL" && api0.snap.guilder.index > 40,
  "ONUM.market.snapshot exposes Union Guilder (" + api0.snap.guilder.index + ")");
ok(api0.snap.currencies.length === 6 && api0.snap.currencies.every(c => c.code && c.rateInGuilders > 0 && c.driver),
  "All 6 continental currencies exposed with rates and drivers (" + api0.snap.currencies.map(c => c.code + ":" + c.rateInGuilders).join(", ") + ")");
ok(api0.snap.stocks.length === 8 && api0.snap.stocks.every(s => s.ticker && s.px > 0 && s.bid <= s.px && s.ask >= s.px && Array.isArray(s.drivers)),
  "All 8 listed stocks exposed with ticker, bid/ask, and drivers");
ok(Math.floor(api0.snap.portfolio.savings) === api0.pb.savings && api0.snap.portfolio.chestExcluded === true,
  "Market portfolio savings matches onumPocketbook().savings (" + api0.pb.savings + ") and excludes campaign chest");
ok(api0.tick && api0.tick.movers.length === 4 && typeof api0.tick.text === "string",
  "ONUM.ticker() returns compact ticker payload (" + api0.tick.text + ")");

/* Check OHLCV candle payloads for Neptune's onumDoc.chart.candles / odCandles */
const validBars = (rows) => Array.isArray(rows) && rows.length >= 12 && rows.every(r =>
  r && [r.o, r.h, r.l, r.c, r.v].every(x => typeof x === "number" && Number.isFinite(x)) &&
  r.h >= Math.max(r.o, r.c) && r.l <= Math.min(r.o, r.c) && r.v >= 0
);
ok(api0.snap.stocks.every(s => validBars(s.candles)) && validBars(api0.snap.guilder.candles),
  "Every stock and Union Guilder exposes valid OHLCV {o,h,l,c,v} candle rows (len=" + api0.cDock.length + ")");
ok(validBars(api0.cDock) && api0.cByTicker.length === 8 && validBars(api0.cUgl) &&
  api0.cAll && validBars(api0.cAll.guilder) && Object.keys(api0.cAll.byStock).length === 8,
  "ONUM.market.candles() supports stock key, ticker + limit, UGL, and full map");
ok(/<svg class="od-chart"/.test(api0.svgDock) && /<rect /.test(api0.svgDock) && !/NaN/.test(api0.svgDock) &&
  /<svg class="od-chart"/.test(api0.svgUgl) && !/NaN/.test(api0.svgUgl),
  "Neptune's onumDoc.chart.candles renders clean SVG from ONUM.market.candles()");

/* Open the Phone and verify currency + stock ticker strip & Ticker tab (plain, no SVG/canvas) */
await page.setViewport({ width: 1280, height: 720 });
const phone0 = await page.evaluate(() => {
  const hasTicker = window.ONUM.market.openPhoneTicker();
  const w = document.getElementById("pbPhone");
  const strip = document.getElementById("pbTicker");
  const txt = w ? w.innerText : "";
  const hasSvgOrCanvas = !!(w && w.querySelector("svg, canvas"));
  const badNames = /\b(purseOf|ownerId|G\.you|M\.px)\b/.test(txt);
  const r = w ? w.getBoundingClientRect() : null;
  return {
    hasTicker,
    stripText: strip ? strip.innerText : "",
    hasBuyBtn: !!(w && w.querySelector('[data-pbtk^="b:"]')),
    hasSvgOrCanvas,
    badNames,
    fits: !!r && r.width > 150 && r.right <= window.innerWidth + 2 && r.bottom <= window.innerHeight + 2
  };
});
ok(phone0.hasTicker && /UGL/.test(phone0.stripText) && phone0.hasBuyBtn,
  "Phone shows live currency ticker strip and Ticker exchange board (" + phone0.stripText.replace(/\n/g, " | ") + ")");
ok(!phone0.hasSvgOrCanvas, "Phone ticker has zero fancy SVG/canvas renderers on our side");
ok(!phone0.badNames && phone0.fits, "Phone ticker fits 1280x720 with no internal field names");

/* Buy & sell on the Phone Ticker tab from buyer savings (never touching chest) */
const phoneTrade = await page.evaluate(() => {
  const beforeSav = window.ONUM.market.snapshot().portfolio.savings;
  const beforeChest = window.ONUM.shops.chest();
  const btn = document.querySelector('#pbPhone [data-pbtk^="b:"]');
  const boughtKey = btn.getAttribute("data-pbtk").split(":")[1];
  const volBefore = window.ONUM.market.candles(boughtKey).slice(-1)[0].v;
  btn.click();
  const afterBuySav = window.ONUM.market.snapshot().portfolio.savings;
  const afterChest = window.ONUM.shops.chest();
  const volAfterBuy = window.ONUM.market.candles(boughtKey).slice(-1)[0].v;
  document.querySelector(`#pbPhone [data-pbtk="s:${boughtKey}"]`)?.click();
  const afterSellSav = window.ONUM.market.snapshot().portfolio.savings;
  return { boughtKey, beforeSav, afterBuySav, afterSellSav, beforeChest, afterChest, volBefore, volAfterBuy };
});
ok(phoneTrade.afterBuySav < phoneTrade.beforeSav && phoneTrade.afterSellSav > phoneTrade.afterBuySav && phoneTrade.volAfterBuy === phoneTrade.volBefore + 1,
  "Phone buy/sell debits/credits buyer savings and increments candle volume (" + phoneTrade.beforeSav + " -> " + phoneTrade.afterBuySav + " -> " + phoneTrade.afterSellSav + ")");
ok(phoneTrade.beforeChest === phoneTrade.afterChest,
  "Stock trades never touch campaign chest (" + phoneTrade.afterChest + ")");

/* Check 800x600 fit on phone AND exchange card (soc-mkt) with zero fancy renderers */
await page.setViewport({ width: 800, height: 600 });
await delay(100);
const phone800 = await page.evaluate(() => {
  const w = document.getElementById("pbPhone");
  const r = w ? w.getBoundingClientRect() : null;
  return { open: !!w, right: r?.right, bottom: r?.bottom, vw: window.innerWidth, vh: window.innerHeight };
});
ok(phone800.open && phone800.right <= phone800.vw + 2 && phone800.bottom <= phone800.vh + 2,
  "Phone currency ticker fits cleanly at 800x600 (" + Math.round(phone800.right) + "<=" + phone800.vw + ")");

await page.evaluate(() => { document.querySelector("#pbPhone [data-pbx]")?.click(); window.ONUM.market.openCard(); });
await delay(150);
const cardCheck = await page.evaluate(() => {
  const c = document.getElementById("card");
  const txt = c ? c.innerText : "";
  return {
    open: !!c && /Currency ticker/i.test(txt),
    hasSvgOrCanvas: !!(c && c.querySelector("svg, canvas")),
    badNames: /\b(purseOf|ownerId|G\.you|M\.px)\b/.test(txt)
  };
});
ok(cardCheck.open && !cardCheck.hasSvgOrCanvas && !cardCheck.badNames,
  "Exchange sheet opens with currency ticker, zero fancy renderers, and zero internal field names");
await page.evaluate(() => document.getElementById("gcClose")?.click());
await delay(150);

/* Economy & events linkage: advance day and confirm market, currencies & candles react */
const preDay = await page.evaluate(() => window.ONUM.market.snapshot());
await page.evaluate(() => window.ONUM.n24.nextDay(true));
await delay(600);
const postDay = await page.evaluate(() => window.ONUM.market.snapshot(true));
const movedStocks = postDay.stocks.filter((st, idx) => st.px !== preDay.stocks[idx].px).length;
const newBarAll = postDay.stocks.every(st => st.candles.length && st.candles[st.candles.length - 1].d === WANT + 1);
ok(postDay.day === WANT + 1 && movedStocks >= 3 && newBarAll,
  "Advancing to day " + (WANT + 1) + " updates stock prices and opens new daily OHLCV candles (" + movedStocks + "/8 moved)");

/* Check save growth < 10% */
const saveOut = await page.evaluate(() => window.ONUM.shops.saveBytes());
const growthPct = ((saveOut - baseBytes) / baseBytes) * 100;
ok(saveOut > 0 && growthPct < 10,
  "Save size growth under 10% (" + growthPct.toFixed(2) + "%, " + baseBytes + " -> " + saveOut + " bytes)");
ok(errs.length === 0, "Zero page/console errors (" + errs.length + ")");

await br.close();
srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed");
process.exit(bad ? 1 : 0);
