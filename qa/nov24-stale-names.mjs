#!/usr/bin/env node
/* 20261124a JUPITER: a person whose seat renamed them speaks under the name they have now. Dominic's saves hold secretaries whose
   own lines still use the old name (1450 "I am Siobhan Doyle", 1452 "Marguerite Vance", 1453 "Willem ten Boom").
   Usage: node qa/nov24-stale-names.mjs [worktree] --save <copy.json> */
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, newPage, seedIdb, continueCareer } from "./nov17-lib.mjs";
const ROOT = path.resolve(process.argv[2] || ".");
const si = process.argv.indexOf("--save"), SAVE = si > 0 ? process.argv[si + 1] : process.env.ONUM_SAVE || "/workspace/nov24/save535.json";
const raw = fs.readFileSync(SAVE, "utf8"); const D = JSON.parse(raw);
const all = [].concat(D.members || [], D.press || [], D.civ || []);
const stale = all.filter((p) => p && p.sent && typeof p.sent.i === "string" && /^I am (.+?)\. There is no spare\./.test(p.sent.i) && p.sent.i.match(/^I am (.+?)\./)[1] !== p.name && p.sent.i.match(/^I am (.+?)\./)[1] !== "myself").map((p) => ({ id: p.id, name: p.name, old: p.sent.i.match(/^I am (.+?)\./)[1] }));
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "PASS " : "FAIL ") + m); };
ok(stale.length > 0, "the save holds " + stale.length + " people whose self line uses an old name: " + stale.slice(0, 6).map((x) => x.id + " " + x.old + " -> " + x.name).join(", "));
/* a line someone ELSE said about the old name must stay as it was */
const other = all.find((p) => p && !stale.some((x) => x.id === p.id) && (p.chat || []).some((c) => c && typeof c.content === "string" && stale.some((x) => c.content.includes(x.old))));
const srv = await startServer(ROOT); const origin = "http://127.0.0.1:" + srv.address().port;
const br = await launch(); const errs = []; const page = await newPage(br, errs);
await seedIdb(page, origin, raw);
const c = await continueCareer(page, origin, "");
ok(c.running && !c.broken, "Continue loads the career (" + c.label + ")");
const r = await page.evaluate((stale, otherId) => {
  const G = NEPTUNE.debug().G; const all = [].concat(G.members || [], G.press || [], G.civ || []); const by = (id) => all.find((p) => p && p.id === id);
  const out = stale.map((x) => { const p = by(x.id); if (!p) return { id: x.id, missing: true };
    let dos = ""; try { dos = window.ONUM_N17 && window.ONUM_N17.v ? window.ONUM_N17.v.dossierFor(p) : ""; } catch (e) {}
    const fam = G.fam && G.fam.p && G.fam.p[p.id], dyn = G.dyn && G.dyn.P && G.dyn.P[p.id];
    return { id: x.id, name: p.name, old: x.old, self: (p.sent && p.sent.i || "").slice(0, 60), iName: p.sent && p.sent.iName, fam: fam && fam.name, dyn: dyn && dyn.name, dosOld: dos.includes("I am " + x.old) };
  });
  const o = otherId != null ? by(otherId) : null;
  return { out, otherKept: o ? (o.chat || []).some((c) => c && typeof c.content === "string" && stale.some((x) => c.content.includes(x.old))) : null, last: window.ONUM_N17 && window.ONUM_N17.v ? window.ONUM_N17.v.last() : null };
}, stale, other ? other.id : null);
for (const x of r.out.filter((x) => [1450, 1452, 1453].includes(x.id)).concat(r.out.filter((x) => ![1450, 1452, 1453].includes(x.id)).slice(0, 3))) {
  ok(!x.missing && x.self.startsWith("I am " + x.name + "."), x.id + " speaks as " + x.name + " (self line: " + JSON.stringify(x.self) + ")");
  ok(!x.missing && x.iName !== x.old.split(" ")[0], x.id + " private first name is not the old " + x.old.split(" ")[0] + " (" + x.iName + ")");
}
const allFixed = r.out.every((x) => x.missing || x.self.startsWith("I am " + x.name + "."));
ok(allFixed, "every one of the " + r.out.length + " stale self lines now uses the current name");
if (r.otherKept !== null) ok(r.otherKept === true, "what someone else said about the old name is unchanged");
ok(!r.last || r.last.ms < 1500, "the repair on load took " + (r.last ? r.last.ms + " ms for " + r.last.people + " people" : "n/a"));
ok(errs.length === 0, "0 page errors" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
await br.close(); srv.close();
console.log(bad ? "\nFAILED " + bad : "\nall passed"); process.exit(bad ? 1 : 0);
