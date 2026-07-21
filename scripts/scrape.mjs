import * as cheerio from "cheerio";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PRICES_OUT = resolve(ROOT, "src/data/prices.json");

const DELAY_MS = 1500;
const TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(id);
      if (!res.ok) {
        console.warn(`  HTTP ${res.status} for ${url}`);
        continue;
      }
      return await res.text();
    } catch (err) {
      console.warn(`  Fetch failed (attempt ${i + 1}/${retries + 1}): ${err.message}`);
      if (i < retries) await sleep(2000);
    }
  }
  return null;
}

function extractPrice(html, retailer) {
  if (!html) return null;
  const $ = cheerio.load(html);

  // Remove script/style content for cleaner text
  $("script, style, noscript").remove();

  const pageText = $.text();
  const pricePatterns = [
    // "1.299,-" or "1.299,00"
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:kr\.?|DKK)?/,
    // "1299 kr" or "1299 DKK"
    /(\d{3,6})\s*(?:kr\.?|DKK)/i,
    // "kr 1.299"  
    /kr\s*[.,]?\s*(\d{1,3}(?:[ .,]\d{3})*)/i,
    // "DKK 1.299"
    /DKK\s*[.,]?\s*(\d{1,3}(?:[ .,]\d{3})*)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = pageText.match(pattern);
    if (match) {
      let priceStr = match[1].replace(/[^0-9,]/g, "").replace(",", ".");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 10 && price < 5000) {
        return Math.round(price);
      }
    }
  }
  return null;
}

// --- Prices ---

const mice = [
  {
    slug: "logitech-g-pro-x-superlight-2",
    offers: [
      { retailer: "proshop", url: "https://www.proshop.dk/Mus/Logitech-G-Pro-X-Superlight-2/3173290" },
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/logitech-g-pro-x-superlight-2" },
    ],
  },
  {
    slug: "razer-viper-v3-pro",
    offers: [
      { retailer: "proshop", url: "https://www.proshop.dk/Mus/Razer-Viper-V3-Pro/3173291" },
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/razer-viper-v3-pro" },
    ],
  },
  {
    slug: "zowie-ec2-dw",
    offers: [
      { retailer: "computersalg", url: "https://www.computersalg.dk/mus/zowie-ec2-dw" },
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/zowie-ec2-dw" },
    ],
  },
  {
    slug: "logitech-g403-hero",
    offers: [
      { retailer: "proshop", url: "https://www.proshop.dk/Mus/Logitech-G403-Hero/3173292" },
      { retailer: "coolshop", url: "https://www.coolshop.dk/mus/logitech-g403-hero" },
    ],
  },
  {
    slug: "razer-deathadder-v3",
    offers: [
      { retailer: "proshop", url: "https://www.proshop.dk/Mus/Razer-DeathAdder-V3/3173293" },
    ],
  },
  {
    slug: "finalmouse-starlight-pro-small",
    offers: [
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/finalmouse-starlight-pro-small" },
    ],
  },
  {
    slug: "pulsar-x2h",
    offers: [
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/pulsar-x2h" },
    ],
  },
  {
    slug: "vaxee-xe-wireless",
    offers: [
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/vaxee-xe-wireless" },
    ],
  },
  {
    slug: "g-wolves-hts-pro-4k",
    offers: [
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/g-wolves-hts-pro-4k" },
    ],
  },
  {
    slug: "lamzu-maya-x",
    offers: [
      { retailer: "maxgaming", url: "https://www.maxgaming.dk/da/tilbehoer/mus/lamzu-maya-x" },
    ],
  },
];

async function scrapePrices() {
  console.log("--- Scraping prices ---\n");
  const results = { scrapedAt: new Date().toISOString(), prices: {} };

  for (const mouse of mice) {
    for (const offer of mouse.offers) {
      const key = `${mouse.slug}__${offer.retailer}`;
      console.log(`Fetching ${offer.retailer}: ${mouse.slug}`);
      const html = await fetchWithTimeout(offer.url);
      const price = extractPrice(html, offer.retailer);
      if (price) {
        results.prices[key] = price;
        console.log(`  -> ${price} kr`);
      } else {
        console.log(`  -> no price found`);
      }
      await sleep(DELAY_MS);
    }
  }

  writeFileSync(PRICES_OUT, JSON.stringify(results, null, 2));
  console.log(`\nSaved prices to ${PRICES_OUT}`);
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "prices";

  if (mode === "prices") {
    await scrapePrices();
  } else if (mode === "all") {
    await scrapePrices();
  } else {
    console.log("Usage: node scripts/scrape.mjs [prices|all]");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
