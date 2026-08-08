import { readFileSync, writeFileSync, createReadStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEED_PATH = process.env.FEED_PATH || join(process.env.TEMP || "/tmp", "proshop-feed.xml");

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// All catalog products — re-matched against the feed regardless of whether
// they already have an image, so inconsistent art (lifestyle photos, box
// shots) can be replaced with a uniform isolated product shot. Pass
// IMAGES_MISSING_ONLY=1 to restore the old gap-filling-only behavior.
const MISSING_ONLY = process.env.IMAGES_MISSING_ONLY === "1";
const catalog = [];

function loadMice() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/mice.json"), "utf-8"));
  return data.mice
    .filter((m) => !MISSING_ONLY || !m.billede)
    .map((m) => ({ slug: m.slug, navn: m.navn, brand: m.brand, ean: m.ean || null, category: "mus" }));
}
function loadKeyboards() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/keyboards.json"), "utf-8"));
  return data.keyboards
    .filter((k) => !MISSING_ONLY || !k.billede)
    .map((k) => ({ slug: k.slug, navn: k.navn, brand: k.brand, ean: k.ean || null, category: "tastaturer" }));
}
function loadMousepads() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/mousepads.json"), "utf-8"));
  return data.mousepads
    .filter((p) => !MISSING_ONLY || !p.billede)
    .map((p) => ({ slug: p.slug, navn: p.model, brand: p.brand, ean: p.ean || null, category: "musemaatter" }));
}
function loadHeadsets() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/headsets.json"), "utf-8"));
  return data.headsets
    .filter((h) => !MISSING_ONLY || !h.billede)
    .map((h) => ({ slug: h.slug, navn: h.navn, brand: h.brand, ean: h.ean || null, category: "headset" }));
}
function loadMonitors() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/monitors.json"), "utf-8"));
  return data.monitors
    .filter((p) => !MISSING_ONLY || !p.billede)
    .map((p) => ({ slug: p.slug, navn: p.navn, brand: p.brand, ean: p.ean || null, category: "skaerme" }));
}

catalog.push(...loadMice(), ...loadKeyboards(), ...loadMousepads(), ...loadHeadsets(), ...loadMonitors());

const byBrand = {};
const byEan = {};
for (const p of catalog) {
  const b = normalize(p.brand);
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(p);
  if (p.ean) byEan[p.ean] = p;
}

console.log(`Catalog (${MISSING_ONLY ? "missing image only" : "all products"}): ${catalog.length} products, ${Object.keys(byBrand).length} brands`);

// Includes brand aliases Proshop uses that differ from our catalog brand
// (ZOWIE monitors are listed under BenQ, Alienware monitors under Dell).
const FEED_CAT_TO_OUR = {
  "mus": ["mus"],
  "tastatur": ["tastaturer"],
  "hovedtelefonerheadset2": ["headset"],
  "musemaatte tilbehoer": ["musemaatter"],
  "skaerm": ["skaerme"],
};

function mapFeedCat(feedCat) {
  return FEED_CAT_TO_OUR[(feedCat || "").toLowerCase().trim()] || [];
}

const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og",
  "optisk", "kablet", "sort", "hvid", "rgb", "knapper",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "hoeretelefoner", "mus", "nordisk",
  "en", "et", "som", "der", "den", "det", "de", "paa", "i", "af",
  "fra", "ved", "har", "kan", "alt", "her",
]);

// A wrong-product photo (different generation/variant) is just as misleading
// as a wrong price. Default-allow extra feed words (colorway vocabulary
// across a 270k-product catalog is unbounded) and reject only on a known
// dangerous variant marker — see match-proshop-eans.mjs for the full
// rationale and the false positives (apex-pro-tkl-gen-3, superlight-2,
// qck-vs-qck-heavy, g-pro-x-vs-g-pro-x-2, ...) this list was built from.
const DISALLOWED_EXTRA = new Set([
  "wireless", "wired", "kablet", "traadloes", "tradlos",
  "tkl", "tenkeyless", "air", "core", "lightspeed", "hyperspeed",
  "dex", "se", "pro", "max", "mini", "plus", "lite", "ultra",
  "champion", "edition", "signature", "special", "limited",
  "gen", "gen2", "gen3", "v2", "v3", "v4", "v5",
  "ii", "iii", "iv", "x2", "x3", "he", "s",
  "superstrike", "superlight", "wolf", "phantom",
  "medium", "large", "small", "xl", "xxl", "voce", "vo", "ce", "amerikansk", "engelsk",
  "heavy", "soft", "hard", "speed", "control",
  "us", "ansi", "iso", "international", "uk",
  "fransk", "tysk", "spansk", "italiensk", "svensk", "finsk", "norsk",
  "hollandsk", "nederlandsk", "portugisisk", "schweizisk", "belgisk",
  "ps", "xbox", "playstation", "for",
  "earbuds", "buds", "compact",
  "håndledsstøtte", "wrist", "bundle", "pakke",
  "travel", "case", "opgraderings", "tilbehør", "accessory", "upgrade",
]);

// See match-proshop-eans.mjs — Proshop files ZOWIE/Alienware monitors under
// the OEM brand (BenQ/Dell) rather than the sub-brand our catalog uses.
const BRAND_ALIAS_FEED_TO_CATALOG = {
  benq: ["zowie"],
  dell: ["alienware"],
};

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

function field(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

const matches = [];
let count = 0;
let matched = 0;
let buffer = "";
const stream = createReadStream(FEED_PATH, { encoding: "latin1" });

function processBuffer(isFinal) {
  let startIdx;
  while ((startIdx = buffer.indexOf("<produkt>")) !== -1) {
    const endIdx = buffer.indexOf("</produkt>", startIdx);
    if (endIdx === -1) {
      if (isFinal) break;
      buffer = buffer.slice(startIdx);
      return;
    }
    const block = buffer.slice(startIdx, endIdx + "</produkt>".length);
    buffer = buffer.slice(endIdx + "</produkt>".length);
    handleProduct(block);
  }
  if (isFinal) buffer = "";
}

function pushMatch(cat, brand, produktnavn, ean, billedurl, matchType) {
  matches.push({
    slug: cat.slug,
    category: cat.category,
    catalogName: `${cat.brand} ${cat.navn}`,
    feedName: `${brand} ${produktnavn}`,
    ean,
    imageUrl: billedurl,
    matchType,
  });
  matched++;
}

function handleProduct(block) {
  count++;
  if (count % 40000 === 0) console.log(`  Scanned ${count} products, ${matched} matches...`);

  const ean = field(block, "ean");
  const billedurl = field(block, "billedurl");
  const brand = decodeEntities(field(block, "brand"));
  const produktnavn = decodeEntities(field(block, "produktnavn"));

  if (!billedurl) return;

  // Exact-EAN pass — trumps everything, no category filter needed.
  if (ean && byEan[ean]) {
    pushMatch(byEan[ean], brand, produktnavn, ean, billedurl, "exact-ean");
    return;
  }

  const kategorinavn = decodeEntities(field(block, "kategorinavn"));
  const ourCats = mapFeedCat(kategorinavn);
  if (ourCats.length === 0) return;

  const feedBrand = normalize(brand);
  const feedName = normalize(produktnavn);
  if (!feedBrand || !feedName) return;

  const candidates = [
    ...(byBrand[feedBrand] || []),
    ...(BRAND_ALIAS_FEED_TO_CATALOG[feedBrand] || []).flatMap((b) => byBrand[b] || []),
  ];
  if (candidates.length === 0) return;
  const catCandidates = candidates.filter((c) => ourCats.includes(c.category));
  if (catCandidates.length === 0) return;

  const feedTokens = tokenize(feedName);
  if (feedTokens.length < 2) return;
  const feedTokenSet = new Set(feedTokens);

  for (const cat of catCandidates) {
    const catTokens = tokenize(cat.navn);
    const catTokenSet = new Set(catTokens);
    const allPresent = catTokens.every((t) => feedTokenSet.has(t));
    if (!allPresent) continue;

    const brandTokens = new Set([...tokenize(cat.brand), ...tokenize(brand)]);
    // A digit is only a benign "knapper count" extra if it's actually
    // adjacent to "knapper" in the source text — a bare digit elsewhere
    // (e.g. "Superlight 2") is a generation/model marker, not a count.
    const knapperCountMatch = feedName.match(/(\d+)\s*knapper/);
    const knapperCount = knapperCountMatch ? knapperCountMatch[1] : null;
    // Monitor listings are packed with spec descriptors (resolution, refresh
    // rate, panel type, screen size) that restate what the model number
    // already implies rather than signal a different SKU — benign to allow.
    const isSpecDescriptor = (t) =>
      /^\d+x\d+$/.test(t) ||
      /^\d+hz$/.test(t) ||
      /^\d+$/.test(t) ||
      ["fhd", "qhd", "wqhd", "uhd", "4k", "2k", "ips", "tn", "va", "oled", "mini", "led", "curved"].includes(t);
    const isDangerous = (t) => DISALLOWED_EXTRA.has(t) || (/^\d/.test(t) && t !== knapperCount);
    const dangerousExtraTokens = feedTokens.filter(
      (t) =>
        !catTokenSet.has(t) &&
        !brandTokens.has(t) &&
        t !== knapperCount &&
        !(cat.category === "skaerme" && isSpecDescriptor(t)) &&
        isDangerous(t)
    );
    if (dangerousExtraTokens.length > 0) continue;

    // A single catalog token is only safe to match on if it's a specific
    // alphanumeric model code (e.g. "xl2586x"), not a short/generic word.
    const specificEnough =
      catTokens.length >= 2 || (catTokens.length === 1 && catTokens[0].length >= 5 && /\d/.test(catTokens[0]));
    if (!specificEnough) continue;

    pushMatch(cat, brand, produktnavn, ean, billedurl, "fuzzy-full-overlap");
    break;
  }
}

stream.on("data", (chunk) => {
  buffer += chunk;
  processBuffer(false);
});

stream.on("end", () => {
  processBuffer(true);

  const seen = new Set();
  const unique = [];
  // Prefer exact-ean matches over fuzzy ones for the same slug.
  for (const m of matches.filter((m) => m.matchType === "exact-ean")) {
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    unique.push(m);
  }
  for (const m of matches.filter((m) => m.matchType === "fuzzy-full-overlap")) {
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    unique.push(m);
  }

  console.log(`\nDone. Scanned ${count} products, found ${unique.length} unique image matches (of ${catalog.length} catalog products considered).\n`);
  for (const m of unique) {
    console.log(`  [${m.matchType}] [${m.category}] ${m.catalogName}  ←  ${m.feedName}`);
  }

  writeFileSync(join(ROOT, "scripts", "proshop-image-matches.json"), JSON.stringify(unique, null, 2));
  console.log(`\nReport saved to scripts/proshop-image-matches.json`);
});
