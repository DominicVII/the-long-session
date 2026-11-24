#!/usr/bin/env node
/* 20261117o JUPITER: live review on a real career. Usage:
   ONUM_SAVE=/path/to/copy.json node qa/nov17-live.mjs <worktree> <shot-prefix> [query]
   Seeds the save into the IDB career slot, Continues, and records what the player sees. Never writes the save file. */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer, delay } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || "."), PFX = process.argv[3] || "/workspace/nov17-shots/live", QS = process.argv[4] || "";
const raw = fs.readFileSync(process.env.ONUM_SAVE, "utf8");
const errs = [];
const server = await startServer(ROOT), origin = "http://127.0.0.1:" + server.address().port;
const browser = await launch(); const page = await newPage(browser, errs);
const logs = []; page.on("console", (m) => { const t = m.text(); if (/NEPTUNE|warn|rror/i.test(t) && logs.length < 60) logs.push(m.type() + ": " + t.slice(0, 200)); });
export const snapFn = () => {
  const D = window.NEPTUNE && NEPTUNE.debug && NEPTUNE.debug(); const G = D && D.G; if (!G) return { noG: true };
  const E = G.eng || {}; const vis = (id) => { const n = document.getElementById(id); if (!n) return null; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 ? { t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), sh: n.scrollHeight } : null; };
  let people = null; try { const here = D.hereNow ? D.hereNow() : []; people = { here: here.length, mesh: here.filter((p) => p.mesh).length, inGroup: here.filter((p) => p.mesh && p.mesh.parent).length, nep: here.filter((p) => p.mesh && p.mesh.userData && p.mesh.userData.nep).length, cheap: here.filter((p) => p.mesh && p.mesh.userData && p.mesh.userData.cheap).length, visible: here.filter((p) => p.mesh && p.mesh.visible).length, mods: !!(window.NEPTUNE && NEPTUNE.mods), failed: !!(window.NEPTUNE && NEPTUNE.failed) }; } catch (e) { people = String(e); }
  let ssn = null; try { const s = window.onumSession && onumSession.state ? onumSession.state() : null; ssn = s ? { kind: s.kind, stage: s.stage, room: s.room } : null; } catch (e) {}
  let cab = null; try { cab = typeof cabKind === "function" ? cabKind() : "n/a"; } catch (e) { cab = "err"; }
  const open = [...document.querySelectorAll("body *")].filter((n) => { const cs = getComputedStyle(n); if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false; const r = n.getBoundingClientRect(); return r.width > 200 && r.height > 120; }).slice(0, 12).map((n) => { const r = n.getBoundingClientRect(); return (n.id || n.className || n.tagName).toString().slice(0, 40) + "@" + Math.round(r.top) + "-" + Math.round(r.bottom) + (n.scrollHeight > n.clientHeight + 4 ? " overflow " + n.scrollHeight + ">" + n.clientHeight : ""); });
  return { day: G.day, room: G.room, office: G.you && G.you.office, vote: G.you && G.you.vote, voteBill: G.you && G.you.voteBill, bill: G.bill && { id: G.bill.id, t: G.bill.title, myVote: G.bill.myVote, marked: G.bill.marked },
    eng: { p: Math.round(E.p), compute: Math.round(E.compute), talent: Math.round(E.talent), beyond: Math.round(E.beyond || 0), scaleOpen: E.scaleOpen, st: E.st },
    limits: window.onumLimDump ? (({ hist, npc, save, cap, seats, letters, mindsPerTick, apPerDay, mode }) => ({ hist, npc, save, cap, seats, letters, mindsPerTick, apPerDay, mode }))(onumLimDump()) : null,
    people, ssn, cab, talkOpen: !!(document.getElementById("talk") && document.getElementById("talk").classList.contains("is-open")), open, hm: vis("hmBar"), running: !!(window.ONUM && ONUM.running && ONUM.running()) };
};
const snap = async (tag) => { await page.screenshot({ path: PFX + "-" + tag + ".png" }); return page.evaluate(snapFn); };
try {
  await seedIdb(page, origin, raw);
  const c = await continueCareer(page, origin, QS);
  console.log("CONTINUE", JSON.stringify(c));
  await delay(8000);
  console.log("SNAP0", JSON.stringify(await snap("0")));
  await delay(6000);
  console.log("SNAP1", JSON.stringify(await snap("1")));
  if (process.env.LIVE_EXTRA) { const fn = (await import(path.resolve(process.env.LIVE_EXTRA))).default; await fn(page, PFX, snap); }
} catch (e) { console.log("HARNESS", String(e && e.stack || e).slice(0, 600)); }
finally { console.log("PAGEERRORS", errs.length, JSON.stringify(errs.slice(0, 8))); console.log("LOGS", JSON.stringify(logs.slice(0, 25))); await browser.close(); server.close(); }
