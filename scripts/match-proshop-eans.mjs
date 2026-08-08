import { readFileSync, writeFileSync, createReadStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEED_PATH = process.env.FEED_PATH || join(process.env.TEMP || "/tmp", "proshop-feed.xml");

const HEADSETS = JSON.parse(readFileSync(join(ROOT, "src/data/headsets.json"), "utf-8")).headsets;

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Load all catalog products
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

const headsetEntries = HEADSETS.map((h) => ({
  slug: h.slug,
  navn: h.navn,
  brand: h.brand,
  category: "headset",
  ean: h.ean ?? null,
}));

catalog.push(...loadMice());
catalog.push(...loadKeyboards());
catalog.push(...loadMousepads());
catalog.push(...headsetEntries);
catalog.push(...loadMonitors());

const byBrand = {};
for (const p of catalog) {
  const b = normalize(p.brand);
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(p);
}

console.log(`Catalog: ${catalog.length} products, ${Object.keys(byBrand).length} brands`);

// Proshop's kategorinavn is a flat, whole-catalog taxonomy (not gaming-specific
// like Geek'd's), so mapping is coarser — "Mus" covers every mouse Proshop
// sells, not just gaming ones. Brand + token overlap below does the real filtering.
const FEED_CAT_TO_OUR = {
  "mus": ["mus"],
  "tastatur": ["tastaturer"],
  "hovedtelefonerheadset2": ["headset"],
  "musemaatte tilbehoer": ["musemaatter"],
  "skaerm": ["skaerme"],
};

function mapFeedCat(feedCat) {
  const lower = (feedCat || "").toLowerCase().trim();
  return FEED_CAT_TO_OUR[lower] || [];
}

// Proshop files some monitors under the panel/OEM brand rather than the
// sub-brand our catalog uses (ZOWIE monitors are listed as "BenQ", Alienware
// monitors as "Dell"). Feed brand -> extra catalog brands to also search.
const BRAND_ALIAS_FEED_TO_CATALOG = {
  benq: ["zowie"],
  dell: ["alienware"],
};

const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og", "med",
  "optisk", "kablet", "sort", "hvid", "rgb", "knapper",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "hoeretelefoner", "mus", "nordisk",
  "en", "et", "som", "der", "den", "det", "de", "paa", "i", "af",
  "med", "til", "fra", "ved", "har", "kan", "alt", "her",
]);

// Default-allow extra feed words beyond the catalog name (colorway/finish
// vocabulary across a 270k-product catalog is unbounded — "Ocean", "Dark
// Frost", "Ebony Black", "Antique Silver Edition" — an allowlist can never
// keep up). Reject only on a KNOWN dangerous variant marker: every false
// positive actually observed (apex-pro-tkl-gen-3, g915-tkl, maya-x,
// superlight-vs-superlight-2, cloud-ii-vs-core-wireless, hs80-usb-vs-wireless,
// k100-vs-air) came from one of these, not from an unrecognized color word.
const DISALLOWED_EXTRA = new Set([
  "wireless", "wired", "kablet", "traadloes", "tradlos",
  "tkl", "tenkeyless", "air", "core", "lightspeed", "hyperspeed",
  "dex", "se", "pro", "max", "mini", "plus", "lite", "ultra",
  "champion", "edition", "signature", "special", "limited",
  "gen", "gen2", "gen3", "v2", "v3", "v4", "v5",
  "ii", "iii", "iv", "x2", "x3", "he", "s",
  "superstrike", "superlight", "wolf", "phantom",
  // Size variants (mousepads/mice ship in Medium/Large/XXL with distinct
  // EANs — see steelseries-qck-heavy) and bundle/region markers found via
  // ground-truth re-verification (logitech-g-pro-x "with BLUE VO!CE" bundle,
  // apex-pro-tkl-gen-3's US-layout vs Nordic-layout row).
  "medium", "large", "small", "xl", "xxl", "voce", "vo", "ce", "amerikansk", "engelsk",
  // Mousepad product-line qualifiers (a different line, not a variant of
  // the same product — QcK vs QcK Heavy is a different SKU family entirely).
  "heavy", "soft", "hard", "speed", "control",
  // Keyboard layout/region — a real different SKU/EAN (Wooting 80HE
  // US-ANSI, Razer Huntsman V3 Pro ANSI/Fransk both confirmed via ground truth).
  "us", "ansi", "iso", "international", "uk",
  "fransk", "tysk", "spansk", "italiensk", "svensk", "finsk", "norsk",
  "hollandsk", "nederlandsk", "portugisisk", "schweizisk", "belgisk",
  // Console-platform variants (different EAN for the PS/Xbox-branded SKU).
  "ps", "xbox", "playstation", "for",
  // Product-type confusion (HyperX "Cloud II" vs "Cloud Earbuds II" —
  // completely different product category, not a variant).
  "earbuds", "buds", "compact",
  // Bundle/accessory-inclusion (Wooting 80HE "Håndledsstøtte" wrist-rest
  // bundle is a different EAN than the standalone keyboard).
  "håndledsstøtte", "wrist", "bundle", "pakke",
  // Accessory-vs-product confusion (Wooting sells a "Travel Case 80HE" that
  // shares the keyboard's model code but is a completely different item).
  "travel", "case", "opgraderings", "tilbehør", "accessory", "upgrade",
]);

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

// --- Parse feed (regex-based per-<produkt> block; feed has no nested/repeated tags) ---
const matches = [];
let count = 0;
let matched = 0;

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

function handleProduct(block) {
  count++;
  if (count % 20000 === 0) console.log(`  Scanned ${count} products, ${matched} matches...`);

  const kategorinavn = decodeEntities(field(block, "kategorinavn"));
  const ourCats = mapFeedCat(kategorinavn);
  if (ourCats.length === 0) return;

  const brand = decodeEntities(field(block, "brand"));
  const produktnavn = decodeEntities(field(block, "produktnavn"));
  const ean = field(block, "ean");
  const nypris = field(block, "nypris");
  const lagerantal = field(block, "lagerantal");
  const billedurl = field(block, "billedurl");
  const vareurl = decodeEntities(field(block, "vareurl"));
  const produktUrl = (() => {
    try {
      return new URL(vareurl).searchParams.get("htmlurl") || null;
    } catch {
      return null;
    }
  })();

  const feedBrand = normalize(brand);
  const feedName = normalize(produktnavn);
  if (!feedBrand || !feedName || !ean) return;

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

    // Every catalog token must appear in the feed name — a missing token
    // (e.g. catalog says "TKL" and the feed match doesn't) means the feed
    // row is a different, less-specific SKU.
    const allCatTokensPresent = catTokens.every((t) => feedTokenSet.has(t));
    if (!allCatTokensPresent) continue;

    // Feed tokens beyond the catalog name (and brand, which the feed repeats
    // in produktnavn) must all be benign (colors, boilerplate) — anything
    // else (Wireless, Air, TKL, Core, S, Champion, generation/edition
    // markers, ...) means the feed row is a *different* variant that happens
    // to share the catalog's base name.
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
      /^\d+x\d+$/.test(t) || // resolution, e.g. 1920x1080
      /^\d+hz$/.test(t) || // refresh rate, e.g. 600hz
      /^\d+$/.test(t) || // bare screen-size inch number, e.g. 24, 1 (24,1")
      ["fhd", "qhd", "wqhd", "uhd", "4k", "2k", "ips", "tn", "va", "oled", "mini", "led", "curved"].includes(t);
    // Default-allow: an extra token only disqualifies the match if it's a
    // known dangerous variant marker (see DISALLOWED_EXTRA above), OR a bare
    // digit that isn't the knapper count — a lone number ("G Pro X 2") is
    // almost always a generation/model marker, never decorative.
    // Starts-with-digit (not just pure-digit) so "2c" (Superlight 2c Compact)
    // is caught the same way a bare "2" would be — both are generation/model
    // codes, not decoration.
    const isDangerous = (t) => DISALLOWED_EXTRA.has(t) || (/^\d/.test(t) && t !== knapperCount);
    const dangerousExtraTokens = feedTokens.filter(
      (t) =>
        !catTokenSet.has(t) &&
        !brandTokens.has(t) &&
        t !== knapperCount &&
        !(ourCats.includes("skaerme") && isSpecDescriptor(t)) &&
        isDangerous(t)
    );
    if (dangerousExtraTokens.length > 0) continue;

    // A single catalog token is only safe to match on if it's a specific
    // alphanumeric model code (e.g. "xl2586x"), not a short/generic word — a
    // 4-char code like "80he" gets reused across a whole accessory line
    // (Wooting sells a "Travel Case 80HE" that matched the keyboard's slug).
    const specificEnough =
      catTokens.length >= 2 || (catTokens.length === 1 && catTokens[0].length >= 5 && /\d/.test(catTokens[0]));
    if (specificEnough) {
      matches.push({
        slug: cat.slug,
        category: cat.category,
        catalogName: `${cat.brand} ${cat.navn}`,
        feedName: `${brand} ${produktnavn}`,
        ean,
        catalogEan: cat.ean,
        price: nypris,
        stock: lagerantal,
        imageUrl: billedurl,
        vareurl,
        produktUrl,
      });
      matched++;
      break;
    }
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
  for (const m of matches) {
    if (!m.ean) continue;
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    unique.push(m);
  }

  const eanToSlugs = new Map();
  for (const m of unique) {
    if (!eanToSlugs.has(m.ean)) eanToSlugs.set(m.ean, []);
    eanToSlugs.get(m.ean).push(m.slug);
  }
  for (const [ean, slugs] of eanToSlugs) {
    if (slugs.length > 1) {
      console.warn(`  WARNING: EAN ${ean} claimed by multiple slugs: ${slugs.join(", ")}`);
    }
  }

  console.log(`\nDone. Scanned ${count} products, found ${unique.length} unique EAN matches.\n`);

  for (const m of unique) {
    console.log(`  [${m.category}] ${m.catalogName}`);
    console.log(`    Feed:  ${m.feedName}`);
    console.log(`    EAN:   ${m.ean}`);
    console.log(`    Price: ${m.price} DKK (stock: ${m.stock})`);
    console.log(`    Image: ${m.imageUrl}`);
    console.log();
  }

  writeFileSync(join(ROOT, "scripts", "proshop-ean-matches.json"), JSON.stringify(unique, null, 2));
  console.log(`Report saved to scripts/proshop-ean-matches.json`);
});
