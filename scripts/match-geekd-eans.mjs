import { readFileSync, writeFileSync, createReadStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEED_PATH = process.env.FEED_PATH || join(process.env.TEMP || "/tmp", "geekd-feed.xml");

const HEADSETS = JSON.parse(readFileSync(join(ROOT, "src/data/headsets.json"), "utf-8")).headsets;

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  return data.mousepads.map((p) => ({ slug: p.slug, navn: p.model, brand: p.brand, category: "musemaatter", ean: p.ean ?? null }));
}
function loadMonitors() {
  const data = JSON.parse(readFileSync(join(ROOT, "src/data/monitors.json"), "utf-8"));
  return data.monitors.map((p) => ({ slug: p.slug, navn: p.navn, brand: p.brand, category: "skaerme", ean: p.ean ?? null }));
}
const headsetEntries = HEADSETS.map((h) => ({ slug: h.slug, navn: h.navn, brand: h.brand, category: "headset", ean: h.ean ?? null }));

catalog.push(...loadMice(), ...loadKeyboards(), ...loadMousepads(), ...headsetEntries, ...loadMonitors());

const byBrand = {};
for (const p of catalog) {
  const b = normalize(p.brand);
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(p);
}

console.log(`Catalog: ${catalog.length} products, ${Object.keys(byBrand).length} brands`);

// Geek'd (Shopify, geekd.dk) uses a hierarchical, gaming-specific taxonomy —
// "Gaming Udstyr > Gamer Mus > Trådløs Mus" — unlike Proshop's flat one.
// "Mus Tilbehør" / "Musefødder" are accessories (grips, feet), not mice —
// deliberately excluded to avoid the accessory-vs-product confusion class
// of bug (see match-proshop-eans.mjs's Wooting Travel Case 80HE incident).
const FEED_CAT_TO_OUR = {
  "gaming udstyr > gamer mus > trådløs mus": ["mus"],
  "gaming udstyr > gamer mus": ["mus"],
  "gaming udstyr > gamer tastatur > mekanisk tastatur": ["tastaturer"],
  "gaming udstyr > gamer tastatur > trådløs tastatur": ["tastaturer"],
  "gaming udstyr > gamer tastatur": ["tastaturer"],
  "gaming udstyr > gamer headset > trådløst headset": ["headset"],
  "gaming udstyr > gamer headset": ["headset"],
  "gaming udstyr > gamer musemåtte > stor måsemåtte": ["musemaatter"],
  "gaming udstyr > gamer musemåtte": ["musemaatter"],
  "gaming udstyr > gamer skærm": ["skaerme"],
};

function mapFeedCat(feedCat) {
  return FEED_CAT_TO_OUR[(feedCat || "").toLowerCase().trim()] || [];
}

const BRAND_ALIAS_FEED_TO_CATALOG = {
  benq: ["zowie"],
  dell: ["alienware"],
};

const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og",
  "optisk", "kablet", "sort", "hvid", "rgb", "knapper",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "hoeretelefoner", "mus", "nordisk", "geekd", "dk",
  "en", "et", "som", "der", "den", "det", "de", "paa", "i", "af",
  "fra", "ved", "har", "kan", "alt", "her",
]);

// Same rationale and word list as match-proshop-eans.mjs — default-allow
// extra feed words, reject only on a known dangerous variant marker.
const DISALLOWED_EXTRA = new Set([
  // "trådløs"/"trådløst": proper-Danish-diacritics form was missing — only the
  // ASCII-transliterated "traadloes"/"tradlos" were listed, so a feed row for
  // HyperX "Cloud II Trådløs" (wireless) matched our WIRED hyperx-cloud-ii
  // catalog entry, when hyperx-cloud-ii-wireless existed and should have
  // matched instead (blocked by "wireless" vs "trådløs" being different
  // words in different languages — a cross-language synonym gap, not fixed
  // by this token alone; the mismatch is now blocked, not corrected).
  "wireless", "wired", "kablet", "traadloes", "tradlos", "trådløs", "trådløst",
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
  // bare "x": SteelSeries "Arctis Nova Pro Wireless" vs "Arctis Nova Pro X
  // Wireless" (Xbox-specific SKU, different EAN) — found via ground-truth
  // EAN cross-check against a real Geek'd candidate.
  "x",
  "earbuds", "buds", "compact",
  "håndledsstøtte", "wrist", "bundle", "pakke",
  "travel", "case", "opgraderings", "tilbehør", "accessory", "upgrade",
]);

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

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
  // Every listing ends with " - GEEKD.dk" — pure site branding, strip it so
  // it can't skew token counts or hide a real trailing variant marker.
  const produktnavnRaw = decodeEntities(field(block, "produktnavn"));
  const produktnavn = produktnavnRaw.replace(/-\s*GEEKD\.dk\s*$/i, "").trim();
  const ean = field(block, "ean");
  const nypris = field(block, "nypris");
  const lagerantal = field(block, "lagerantal"); // string, e.g. "in_stock" / "out_of_stock"
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

  writeFileSync(join(ROOT, "scripts", "geekd-ean-matches.json"), JSON.stringify(unique, null, 2));
  console.log(`Report saved to scripts/geekd-ean-matches.json`);
});
