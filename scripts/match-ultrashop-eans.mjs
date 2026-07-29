import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createReadStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sax from "sax";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEED_PATH = process.env.FEED_PATH || join(process.env.TEMP || "/tmp", "ultrashop-feed.xml");

const HEADSETS = JSON.parse(readFileSync(join(ROOT, "src/data/headsets.json"), "utf-8")).headsets;

// --- Build catalog lookup ---
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --- Build catalog lookup ---
// ... (tokenize is defined below with category mapping)

// Load all catalog products
const catalog = [];

function loadMice() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/mice.json"), "utf-8"));
  return data.mice.map((m) => ({ slug: m.slug, navn: m.navn, brand: m.brand, category: "mus" }));
}

function loadKeyboards() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/keyboards.json"), "utf-8"));
  return data.keyboards.map((k) => ({ slug: k.slug, navn: k.navn, brand: k.brand, category: "tastaturer" }));
}

function loadMousepads() {
  const src = readFileSync(join(ROOT, "src/data/mousepads.json"), "utf-8");
  const data = JSON.parse(src);
  return data.mousepads.map((p) => ({
    slug: p.slug,
    navn: p.model,
    brand: p.brand,
    category: "musemaatter",
  }));
}

function loadMonitors() {
  const src = readFileSync(join(ROOT, "src/data/monitors.json"), "utf-8");
  const data = JSON.parse(src);
  return data.monitors.map((p) => ({
    slug: p.slug,
    navn: p.navn,
    brand: p.brand,
    category: "skaerme",
  }));
}

// Headsets from JSON
const headsetEntries = HEADSETS.map((h) => ({
  slug: h.slug,
  navn: h.navn,
  brand: h.brand,
  category: "headset",
}));

catalog.push(...loadMice());
catalog.push(...loadKeyboards());
catalog.push(...loadMousepads());
catalog.push(...headsetEntries);
catalog.push(...loadMonitors());

// Pre-compute search index
const byBrand = {};
for (const p of catalog) {
  const b = normalize(p.brand);
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(p);
}

console.log(`Catalog: ${catalog.length} products, ${Object.keys(byBrand).length} brands`);

// --- Category mapping ---
const FEED_CAT_TO_OUR = {
  "gaming-mus": ["mus"],
  "gaming-tastaturer": ["tastaturer"],
  "gaming-headsets": ["headset"],
  "gaming-musemåtter": ["musemaatter"],
  "skærme (gaming)": ["skaerme"],
  "tastaturer & mus": ["tastaturer", "mus"],
  "computerlyd & headsets": ["headset"],
  "hovedtelefoner & headsets": ["headset"],
};

function mapFeedCat(feedCat) {
  const lower = (feedCat || "").toLowerCase().trim();
  return FEED_CAT_TO_OUR[lower] || [];
}

// Common words that don't help with matching
const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og", "med",
  "optisk", "trådløs", "kablet", "sort", "hvid", "rgb",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "høretelefoner", "wireless", "wired", "mus",
  "en", "et", "som", "der", "den", "det", "de", "på", "i", "af",
  "med", "til", "fr", "ved", "har", "kan", "alt", "her",
]);

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

// --- Parse feed ---
const matches = [];
let count = 0;
let matched = 0;

const parser = sax.createStream(true, { trim: true });

let current = null;
let text = "";

parser.on("opentag", (node) => {
  if (node.name === "produkt") current = {};
});

parser.on("text", (t) => {
  text += t;
});

parser.on("closetag", (name) => {
  if (!current) return;
  if (["forhandler", "kategorinavn", "brand", "produktnavn", "produktid", "ean", "nypris", "lagerantal", "billedurl", "vareurl"].includes(name)) {
    current[name] = text.trim();
  }
  text = "";

  if (name === "produkt") {
    count++;
    if (count % 5000 === 0) console.log(`  Scanned ${count} products, ${matched} matches...`);

    // Only look at gaming categories
    const feedCat = (current.kategorinavn || "").toLowerCase();
    const ourCats = mapFeedCat((current.kategorinavn || ""));

    if (ourCats.length === 0) {
      current = null;
      return;
    }

    const feedBrand = normalize(current.brand || "");
    const feedName = normalize(current.produktnavn || "");
    const feedEan = current.ean || "";

    if (!feedBrand || !feedName || !feedEan) {
      current = null;
      return;
    }

    // Check brand match
    const candidates = byBrand[feedBrand];
    if (!candidates) { current = null; return; }

    // Filter candidates by category match
    const catCandidates = candidates.filter((c) => ourCats.includes(c.category));
    if (catCandidates.length === 0) { current = null; return; }

    const feedTokens = tokenize(feedName);
    if (feedTokens.length < 2) { current = null; return; }

    // Score each candidate — must have strong overlap
    for (const cat of catCandidates) {
      const catTokens = tokenize(cat.navn);
      const overlap = catTokens.filter((t) => feedTokens.includes(t));
      // Require: all product tokens matched OR at least 3 token overlap
      const minMatch = Math.min(catTokens.length, 3);
      if (overlap.length >= minMatch) {
        matches.push({
          slug: cat.slug,
          category: cat.category,
          catalogName: `${cat.brand} ${cat.navn}`,
          feedName: `${current.brand} ${current.produktnavn}`,
          ean: feedEan,
          price: current.nypris,
          stock: current.lagerantal,
          imageUrl: current.billedurl,
        });
        matched++;
        break;
      }
    }

    current = null;
  }
});

parser.on("end", () => {
  // De-duplicate by slug
  const seen = new Set();
  const unique = [];
  for (const m of matches) {
    if (!m.ean) continue; // skip entries without EAN
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    unique.push(m);
  }

  console.log(`\nDone. Scanned ${count} products, found ${unique.length} unique EAN matches.\n`);

  // Print report
  for (const m of unique) {
    console.log(`  [${m.category}] ${m.catalogName}`);
    console.log(`    Feed:  ${m.feedName}`);
    console.log(`    EAN:   ${m.ean}`);
    console.log(`    Price: ${m.price} DKK (${m.stock})`);
    console.log(`    Image: ${m.imageUrl}`);
    console.log();
  }

  // Save report
  writeFileSync(join(ROOT, "scripts", "ultrashop-ean-matches.json"), JSON.stringify(unique, null, 2));
  console.log(`Report saved to scripts/ultrashop-ean-matches.json`);
});

const stream = createReadStream(FEED_PATH, { encoding: "utf-8" });
stream.pipe(parser);
