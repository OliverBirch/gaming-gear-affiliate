/**
 * Fetch real team logos from ProSettings.net CDN and replace monogram placeholders.
 *
 * ProSettings hosts team logos at predictable URLs:
 *   SVG:  https://prosettings.net/wp-content/uploads/{slug}.svg
 *   PNG:  https://prosettings.net/wp-content/uploads/{slug}.png
 *
 * Run this after adding new teams to team-logos.ts.
 * Usage: node scripts/fetch-team-logos.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "teams");

const BASE = "https://prosettings.net/wp-content/uploads";

/**
 * Mapping from our normalized team key (as used in team-logos.ts)
 * to ProSettings.net team slug and our output filename (without extension).
 * Format is inferred: SVG tried first, falls back to PNG.
 */
const TEAMS = [
  { key: "team spirit",       pslug: "team-spirit",       out: "team-spirit" },
  { key: "spirit",            pslug: "team-spirit",       out: "team-spirit" },
  { key: "g2 esports",        pslug: "g2-esports",        out: "g2-esports" },
  { key: "g2",                pslug: "g2-esports",        out: "g2-esports" },
  { key: "team vitality",     pslug: "team-vitality",     out: "vitality" },
  { key: "vitality",          pslug: "team-vitality",     out: "vitality" },
  { key: "sentinels",         pslug: "sentinels",         out: "sentinels" },
  { key: "falcons",           pslug: "falcons-esports",   out: "falcons" },
  { key: "team falcons",      pslug: "falcons-esports",   out: "falcons" },
  { key: "falcons esports",   pslug: "falcons-esports",   out: "falcons" },
  { key: "astralis",          pslug: "astralis",          out: "astralis" },
  { key: "navi",              pslug: "natus-vincere",     out: "navi" },
  { key: "natus vincere",     pslug: "natus-vincere",     out: "navi" },
  { key: "faze",              pslug: "faze-clan",         out: "faze" },
  { key: "faze clan",         pslug: "faze-clan",         out: "faze" },
  { key: "liquid",            pslug: "team-liquid",       out: "liquid" },
  { key: "team liquid",       pslug: "team-liquid",       out: "liquid" },
  { key: "mouz",              pslug: "mouz",              out: "mouz" },
  { key: "mousesports",       pslug: "mouz",              out: "mouz" },
  { key: "furia",             pslug: "furia",             out: "furia" },
  { key: "furia esports",     pslug: "furia",             out: "furia" },
  { key: "heroic",            pslug: "heroic",            out: "heroic" },
  { key: "cloud9",            pslug: "cloud9",            out: "cloud9" },
  { key: "cloud 9",           pslug: "cloud9",            out: "cloud9" },
  { key: "100 thieves",       pslug: "100-thieves",       out: "100-thieves" },
  { key: "100t",              pslug: "100-thieves",       out: "100-thieves" },
  { key: "loud",              pslug: "loud",              out: "loud" },
  { key: "fnatic",            pslug: "fnatic",            out: "fnatic" },
  { key: "the mongolz",       pslug: "the-mongolz",       out: "mongolz" },
  { key: "mongolz",           pslug: "the-mongolz",       out: "mongolz" },
  { key: "edward gaming",     pslug: "edward-gaming",     out: "edward-gaming" },
  { key: "edg",               pslug: "edward-gaming",     out: "edward-gaming" },
  { key: "nrg",               pslug: "nrg",               out: "nrg" },
  { key: "nrg esports",       pslug: "nrg",               out: "nrg" },
  { key: "karmine corp",      pslug: "karmine-corp",      out: "karmine-corp" },
  { key: "team heretics",     pslug: "team-heretics",     out: "heretics" },
  { key: "heretics",          pslug: "team-heretics",     out: "heretics" },
  { key: "w7m esports",       pslug: "w7m-esports",        out: "w7m" },
  { key: "t1",                pslug: "t1",                 out: "t1" },
  { key: "mibr",              pslug: "mibr",               out: "mibr" },
  { key: "paper rex",         pslug: "paper-rex",          out: "paper-rex" },
  { key: "gen.g",             pslug: "gen-g",              out: "geng" },
  { key: "geng",              pslug: "gen-g",              out: "geng" },
];

/** Unique output files — skip alias duplicates. */
const seen = new Set();
const JOBS = TEAMS.filter((t) => {
  if (seen.has(t.out)) return false;
  seen.add(t.out);
  return true;
});

async function download(url, outPath) {
  console.log(`  GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  return buf.length;
}

async function main() {
  let svgCount = 0;
  let pngCount = 0;
  let skipped = 0;

  for (const team of JOBS) {
    console.log(`${team.out}:`);

    const svgUrl = `${BASE}/${team.pslug}.svg`;
    const svgPath = path.join(OUT_DIR, `${team.out}.svg`);
    let len = await download(svgUrl, svgPath);

    if (len) {
      const kb = (len / 1024).toFixed(1);
      console.log(`  ✓ SVG (${kb} KB)`);
      svgCount++;
      continue;
    }

    const pngUrl = `${BASE}/${team.pslug}.png`;
    const pngPath = path.join(OUT_DIR, `${team.out}.png`);
    len = await download(pngUrl, pngPath);

    if (len) {
      const kb = (len / 1024).toFixed(1);
      console.log(`  ✓ PNG (${kb} KB)`);
      pngCount++;
      continue;
    }

    console.log(`  ✗ Not found — keeping monogram`);
    skipped++;
  }

  console.log(`\nDone: ${svgCount} SVG, ${pngCount} PNG, ${skipped} skipped`);
  if (pngCount > 0) {
    console.log(`\nRun: node scripts/fetch-team-logos.mjs --fix-exts`);
    console.log(`to update team-logos.ts .svg → .png for PNG teams.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
