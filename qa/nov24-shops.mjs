#!/usr/bin/env node
/* 20261124e JUPITER: owned storefronts competing at shared price points,
   purchases paid strictly from buyer's own savings (purseOf). On a copy of a career.
   Usage: node qa/nov24-shops.mjs [worktree] [--save save.json | save.json] */
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

/* Check sane savings and shared-price-book competition */
const init = await page.evaluate(() => {
  const books = window.ONUM.shops.books();
  const list = window.ONUM.shops.list();
  const sav = window.ONUM.shops.savings("you");
  const pb = window.onumPocketbook();
  const chest = window.ONUM.shops.chest();
  return { books, list, sav, pb, chest };
});
ok(Number.isFinite(init.sav) && init.sav > 0 && init.sav <= 25000 && init.pb && init.pb.savings === Math.floor(init.sav),
  "Player savings normalized to finite working balance (" + init.sav + ", pocketbook " + init.pb?.savings + ")");
ok(Object.keys(init.books).length === 5 && Object.values(init.books).every(b => b.shopsCount >= 2),
  "All 5 shared books have >= 2 competing storefronts");
ok(init.list.every(s => s.ownerId && s.owner && Math.abs(s.price - Math.round(s.basePrice * s.markup * 10) / 10) < 0.2),
  "Every storefront has an owner and derives price from shared book * markup");

/* Open player storefront at 0.80 markup (undercutting rivals on grain), paid from savings */
const openRes = await page.evaluate(() => {
  const beforeSav = window.ONUM.shops.savings("you");
  const beforeChest = window.ONUM.shops.chest();
  const msg = window.ONUM.shops.open("grocer", "grain", 0.80);
  const afterSav = window.ONUM.shops.savings("you");
  const afterChest = window.ONUM.shops.chest();
  const mine = window.ONUM.shops.list().filter(s => s.mine);
  return { msg, beforeSav, afterSav, beforeChest, afterChest, mine };
});
ok(Math.abs((openRes.beforeSav - openRes.afterSav) - 180) < 0.01,
  "Opening a storefront deducts 180 from buyer savings (" + openRes.beforeSav + " -> " + openRes.afterSav + ")");
ok(openRes.beforeChest === openRes.afterChest,
  "Opening a storefront never touches campaign chest (funds=" + openRes.afterChest + ")");
ok(openRes.mine.length === 1 && openRes.mine[0].book === "grain" && openRes.mine[0].markup === 0.80,
  "Player storefront opened on shared grain book at 0.80 markup");

/* Player buys from a competing NPC storefront using savings */
const buyRes = await page.evaluate(() => {
  const target = window.ONUM.shops.list().find(s => !s.mine && s.book === "iron");
  const ownerBefore = window.ONUM.shops.savings(target.ownerId);
  const savBefore = window.ONUM.shops.savings("you");
  const chestBefore = window.ONUM.shops.chest();
  const res = window.ONUM.shops.buy(target.id, "you");
  const ownerAfter = window.ONUM.shops.savings(target.ownerId);
  const savAfter = window.ONUM.shops.savings("you");
  const chestAfter = window.ONUM.shops.chest();
  return { target, res, ownerBefore, ownerAfter, savBefore, savAfter, chestBefore, chestAfter };
});
ok(buyRes.res.ok && Math.abs((buyRes.savBefore - buyRes.savAfter) - buyRes.res.price) < 0.02,
  "Buying from storefront deducts exact price from buyer savings (" + buyRes.res.price + ")");
ok(Math.abs((buyRes.ownerAfter - buyRes.ownerBefore) - buyRes.res.price) < 0.02,
  "Seller savings credited exact purchase price (" + buyRes.ownerBefore + " -> " + buyRes.ownerAfter + ")");
ok(buyRes.chestBefore === buyRes.chestAfter, "Purchase never touches campaign chest");

/* Insufficient savings test (try buying with an NPC or player when savings < price) */
const poorRes = await page.evaluate(() => {
  const target = window.ONUM.shops.list().find(s => !s.mine && s.book === "iron");
  const lowNpc = window.ONUM.shops.list().map(s => s.ownerId).filter(id => id !== "you").find(() => false);
  const shops = window.ONUM.shops;
  let sav = shops.savings("you");
  /* Spend down to < target.price or check insufficient_savings by finding an NPC below target.price, else buy until < target.price */
  const buyers = [];
  for (let i = 1; i <= 260; i++) {
    const s = shops.savings(i);
    if (s != null && s < target.price) buyers.push({ id: i, s });
  }
  if (buyers.length) {
    const b = buyers[0];
    const r = shops.buy(target.id, b.id);
    return { r, after: shops.savings(b.id), before: b.s };
  }
  /* Fallback: buy at target until player cannot afford another */
  let guard = 0;
  let last = null;
  while (guard++ < 300) {
    last = shops.buy(target.id, "you");
    if (!last.ok) break;
  }
  return { r: last, after: shops.savings("you"), before: null };
});
ok(!poorRes.r.ok && poorRes.r.reason === "insufficient_savings",
  "Purchase rejected cleanly when buyer savings are below price (" + poorRes.r.reason + ")");

/* Competing shoppers prefer cheapest door and pay from their own savings */
const compRes = await page.evaluate(() => {
  const mine = window.ONUM.shops.list().find(s => s.mine && s.book === "grain");
  const grainBook = window.ONUM.shops.books().grain;
  const mineTillBefore = mine.till;
  const ticks = [];
  for (let i = 0; i < 14; i++) {
    const r = window.ONUM.shops.competeTick("grain");
    if (r && r.ok) ticks.push(r);
  }
  const mineAfter = window.ONUM.shops.list().find(s => s.mine && s.book === "grain");
  const mineHits = ticks.filter(t => t.shopId === mine.id).length;
  const savBefore = window.ONUM.shops.savings("you");
  const collected = window.ONUM.shops.takeTill(mine.id);
  const savAfter = window.ONUM.shops.savings("you");
  return {
    cheapestIsMine: grainBook.cheapestShopId === mine.id,
    ticks: ticks.length,
    mineHits,
    mineTillBefore,
    mineTillAfter: mineAfter.till,
    collected,
    savBefore,
    savAfter
  };
});
ok(compRes.cheapestIsMine && compRes.ticks >= 8 && compRes.mineHits > compRes.ticks * 0.55,
  "Undercut storefront is cheapest on grain book and wins majority of shoppers (" + compRes.mineHits + "/" + compRes.ticks + ")");
ok(compRes.collected > 0 && Math.abs((compRes.mineTillAfter - compRes.mineTillBefore) - compRes.collected) < 0.05 && Math.abs((compRes.savAfter - compRes.savBefore) - compRes.collected) < 0.05,
  "Taking the till transfers exact shop receipts into owner savings (" + compRes.collected + ")");

/* Open UI card for Your shop and verify fit + no internal field names */
await page.setViewport({ width: 1280, height: 720 });
await page.evaluate(() => window.ONUM.shops.openCard());
await delay(200);
const ui1280 = await page.evaluate(() => {
  const c = document.getElementById("card");
  const r = c ? c.getBoundingClientRect() : null;
  const txt = c ? c.innerText : "";
  const badNames = /\b(ownerId|purseOf|G\.you|onumSpend)\b/.test(txt);
  const hasBuyBtn = !!c?.querySelector("[data-shbuy]");
  return { open: !!c && r.width > 100, badNames, hasBuyBtn };
});
ok(ui1280.open && ui1280.hasBuyBtn && !ui1280.badNames,
  "Your shop card renders competing storefronts + Buy buttons without internal field names");

/* Buy via UI button click */
const uiBuy = await page.evaluate(() => {
  const before = window.ONUM.shops.savings("you");
  const btn = document.querySelector("#card [data-shbuy]");
  btn.click();
  const after = window.ONUM.shops.savings("you");
  const say = document.getElementById("gcSay")?.textContent || "";
  return { before, after, say };
});
ok(uiBuy.after < uiBuy.before && /Bought/.test(uiBuy.say),
  "Clicking Buy in Your shop debits buyer savings (" + uiBuy.before + " -> " + uiBuy.after + ")");

await page.setViewport({ width: 800, height: 600 });
await delay(100);
const ui800 = await page.evaluate(() => {
  const c = document.getElementById("card");
  const r = c ? c.getBoundingClientRect() : null;
  return { w: r?.width, right: r?.right, vw: window.innerWidth };
});
ok(ui800.w > 200 && ui800.right <= ui800.vw + 2,
  "Your shop card fits horizontally at 800x600 (" + Math.round(ui800.w) + "px <= " + ui800.vw + "px)");

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
