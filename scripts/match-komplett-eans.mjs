import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEED_PATH = process.env.FEED_PATH || join(process.env.TEMP || "/tmp", "komplett-feed.xml");
const RETAILER = "komplett";

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Load all catalog products (same shape/loaders as match-proshop-eans.mjs)
const catalog = [];

function loadMice() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/mice.json"), "utf-8"));
  return data.mice.map((m) => ({ slug: m.slug, navn: m.navn, brand: m.brand, category: "mus", ean: m.ean ?? null }));
}

function loadKeyboards() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/keyboards.json"), "utf-8"));
  return data.keyboards.map((k) => ({ slug: k.slug, navn: k.navn, brand: k.brand, category: "tastaturer", ean: k.ean ?? null }));
}

function loadMousepads() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/mousepads.json"), "utf-8"));
  return data.mousepads.map((p) => ({
    slug: p.slug,
    navn: p.model,
    brand: p.brand,
    category: "musemaatter",
    ean: p.ean ?? null,
  }));
}

function loadMonitors() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/monitors.json"), "utf-8"));
  return data.monitors.map((p) => ({
    slug: p.slug,
    navn: p.navn,
    brand: p.brand,
    category: "skaerme",
    ean: p.ean ?? null,
  }));
}

function loadHeadsets() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/headsets.json"), "utf-8"));
  return data.headsets.map((h) => ({ slug: h.slug, navn: h.navn, brand: h.brand, category: "headset", ean: h.ean ?? null }));
}

catalog.push(...loadMice());
catalog.push(...loadKeyboards());
catalog.push(...loadMousepads());
catalog.push(...loadHeadsets());
catalog.push(...loadMonitors());

const byBrand = {};
for (const p of catalog) {
  const b = normalize(p.brand);
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(p);
}

console.log(`Catalog: ${catalog.length} products, ${Object.keys(byBrand).length} brands`);

// Komplett's g:product_type is a full breadcrumb ("Gaming > Spiludstyr >
// Gamingmus"). We map on the leaf segment only, allow-listing just the
// gaming-relevant and general hardware leaves (accessory leaves like
// "Tilbehør til gamingheadset" are deliberately left unmapped — default-deny
// on category, same conservative posture Proshop's coarse "Mus" catch-all
// relies on brand+token filtering for; here the leaf itself is already
// specific, so we don't need the same catch-all breadth).
const FEED_CAT_TO_OUR = {
  gamingmus: ["mus"],
  mus: ["mus"],
  keyboards: ["tastaturer"],
  gamingheadset: ["headset"],
  headset: ["headset"],
  gamingmusemåtte: ["musemaatter"],
  musemåtter: ["musemaatter"],
  gamingskærme: ["skaerme"],
  skærme: ["skaerme"],
};

function leafCategory(productType) {
  const parts = productType
    .split(">")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? normalize(parts[parts.length - 1]) : "";
}

function mapFeedCat(productType) {
  return FEED_CAT_TO_OUR[leafCategory(productType)] || [];
}

// No known brand-taxonomy aliasing quirks found yet for Komplett (unlike
// Proshop filing ZOWIE monitors under "BenQ") — extend this only once a
// concrete false negative is confirmed, not preemptively.
const BRAND_ALIAS_FEED_TO_CATALOG = {};

const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og", "med",
  "optisk", "kablet", "sort", "hvid", "rgb", "knapper",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "hoeretelefoner", "mus", "nordisk",
  "en", "et", "som", "der", "den", "det", "de", "paa", "i", "af",
  "med", "til", "fra", "ved", "har", "kan", "alt", "her",
]);

// Same disallowed-variant-marker set as match-proshop-eans.mjs — these were
// hardened against real false positives across the same brand catalog and
// apply identically here (same manufacturers, same DK-market SKU splits).
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

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function field(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}

const xml = readFileSync(FEED_PATH, "utf-8");
const itemRe = /<item>([\s\S]*?)<\/item>/g;

const matches = [];
let count = 0;
let matched = 0;
let m;

while ((m = itemRe.exec(xml))) {
  count++;
  if (count % 2000 === 0) console.log(`  Scanned ${count} items, ${matched} matches...`);
  handleProduct(m[1]);
}

function handleProduct(block) {
  const productType = decodeEntities(field(block, "g:product_type"));
  const ourCats = mapFeedCat(productType);
  if (ourCats.length === 0) return;

  const brand = decodeEntities(field(block, "g:brand"));
  const title = decodeEntities(field(block, "title"));
  const gtin = field(block, "g:gtin");
  const priceRaw = field(block, "g:price");
  const price = priceRaw ? parseFloat(priceRaw.replace(/[^\d.]/g, "")) : null;
  const availability = field(block, "g:availability");
  const imageUrl = decodeEntities(field(block, "g:image_link"));

  // The feed occasionally appends stray unencoded breadcrumb text after the
  // real tracking URL inside <link> (space-separated, not part of the URL) —
  // take only the first whitespace-delimited token as the actual link.
  const linkRaw = decodeEntities(field(block, "link")).split(/\s+/)[0] || "";

  let produktUrl = null;
  try {
    produktUrl = new URL(linkRaw).searchParams.get("url");
  } catch {
    return;
  }
  if (!produktUrl) return;

  const feedBrand = normalize(brand);
  const feedName = normalize(title);
  if (!feedBrand || !feedName || !gtin) return;

  const candidates = [
    ...(byBrand[feedBrand] || []),
    ...(BRAND_ALIAS_FEED_TO_CATALOG[feedBrand] || []).flatMap((b) => byBrand[b] || []),
  ];
  if (candidates.length === 0) return;

  const catCandidates = candidates.filter((c) => ourCats.includes(c.category));
  if (catCandidates.length === 0) return;

  const feedTokens = tokenize(feedName);
  if (feedTokens.length < 2) return;

  for (const cat of catCandidates) {
    const catTokens = tokenize(cat.navn);
    const feedTokenSet = new Set(feedTokens);
    const catTokenSet = new Set(catTokens);

    const allCatTokensPresent = catTokens.every((t) => feedTokenSet.has(t));
    if (!allCatTokensPresent) continue;

    const brandTokens = new Set([...tokenize(cat.brand), ...tokenize(brand)]);
    const knapperCountMatch = feedName.match(/(\d+)\s*knapper/);
    const knapperCount = knapperCountMatch ? knapperCountMatch[1] : null;
    const isSpecDescriptor = (t) =>
      /^\d+x\d+$/.test(t) ||
      /^\d+hz$/.test(t) ||
      /^\d+$/.test(t) ||
      ["fhd", "qhd", "wqhd", "uhd", "4k", "2k", "ips", "tn", "va", "oled", "mini", "led", "curved"].includes(t);
    // A console-platform marker fused with its generation digit (e.g. "ps5",
    // "xbox360") isn't caught by DISALLOWED_EXTRA's bare "ps"/"xbox" entries
    // or the leading-digit check — confirmed via a real false positive
    // (Razer BlackShark V3 Pro PS5 matching the PC-standalone catalog entry).
    const isDangerous = (t) =>
      DISALLOWED_EXTRA.has(t) || /^(ps|xbox)\d+$/.test(t) || (/^\d/.test(t) && t !== knapperCount);
    const dangerousExtraTokens = feedTokens.filter(
      (t) =>
        !catTokenSet.has(t) &&
        !brandTokens.has(t) &&
        t !== knapperCount &&
        !(ourCats.includes("skaerme") && isSpecDescriptor(t)) &&
        isDangerous(t)
    );
    // An exact EAN match against the catalog's own recorded barcode is
    // ground truth that this is the same physical product, regardless of
    // what the heuristic above guesses from wording — confirmed necessary
    // by a real case (SteelSeries Arctis Nova Pro Wireless "PC/PS5" title
    // tripped the ps5-marker check above despite being a genuine
    // dual-platform SKU with the exact catalog EAN).
    const eanConfirmed = Boolean(cat.ean) && cat.ean === gtin;
    if (dangerousExtraTokens.length > 0 && !eanConfirmed) continue;

    const specificEnough =
      catTokens.length >= 2 || (catTokens.length === 1 && catTokens[0].length >= 5 && /\d/.test(catTokens[0]));
    if (specificEnough) {
      matches.push({
        slug: cat.slug,
        category: cat.category,
        catalogName: `${cat.brand} ${cat.navn}`,
        feedName: title,
        ean: gtin,
        catalogEan: cat.ean,
        price,
        stock: availability || "unknown",
        imageUrl,
        produktUrl,
        affiliateUrl: linkRaw,
      });
      matched++;
      break;
    }
  }
}

const seen = new Set();
const unique = [];
for (const mt of matches) {
  if (!mt.ean) continue;
  if (seen.has(mt.slug)) continue;
  seen.add(mt.slug);
  unique.push(mt);
}

const eanToSlugs = new Map();
for (const mt of unique) {
  if (!eanToSlugs.has(mt.ean)) eanToSlugs.set(mt.ean, []);
  eanToSlugs.get(mt.ean).push(mt.slug);
}
for (const [ean, slugs] of eanToSlugs) {
  if (slugs.length > 1) {
    console.warn(`  WARNING: EAN ${ean} claimed by multiple slugs: ${slugs.join(", ")}`);
  }
}

console.log(`\nDone. Scanned ${count} items, found ${unique.length} unique EAN matches.\n`);

for (const mt of unique) {
  const eanMatch = mt.catalogEan && mt.catalogEan === mt.ean ? "EAN-MATCH" : "ean-differs";
  console.log(`  [${mt.category}] ${mt.catalogName} (${eanMatch})`);
  console.log(`    Feed:  ${mt.feedName}`);
  console.log(`    EAN:   ${mt.ean} (catalog: ${mt.catalogEan ?? "none"})`);
  console.log(`    Price: ${mt.price} DKK (${mt.stock})`);
  console.log(`    URL:   ${mt.produktUrl}`);
  console.log();
}

writeFileSync(join(ROOT, "scripts", `${RETAILER}-ean-matches.json`), JSON.stringify(unique, null, 2));
console.log(`Report saved to scripts/${RETAILER}-ean-matches.json`);
