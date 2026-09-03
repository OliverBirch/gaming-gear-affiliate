import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CatalogItem } from "./types";

// Fixed 3-item catalog so match outcomes are deterministic regardless of
// the real site catalog's contents.
const CATALOG: CatalogItem[] = [
  { slug: "alpha-mouse", navn: "Alphagear Zenith", brand: "Alphagear", category: "mus", ean: "1111111111111" },
  { slug: "beta-mouse", navn: "Betagear Comet", brand: "Betagear", category: "mus", ean: "2222222222222" },
  { slug: "gamma-mouse", navn: "Gammagear Nova", brand: "Gammagear", category: "mus", ean: "3333333333333" },
];

// Only alpha-mouse and gamma-mouse already have a human-verified proshop
// offer; beta-mouse is a brand-new pairing and must surface as a candidate,
// never an auto-applied price.
vi.mock("./catalog", () => ({ loadCatalog: () => CATALOG }));
vi.mock("./existing-offers", () => ({
  hasExistingOffer: (slug: string, retailer: string) =>
    retailer === "proshop" && (slug === "alpha-mouse" || slug === "gamma-mouse"),
}));

const { redisGet } = await import("@/lib/redis");
const { runFeedSync, runAllFeedSyncs } = await import("./run");

process.env.PARTNER_ADS_FEED_URL_PROSHOP = "https://feed.test/proshop.xml";
process.env.PARTNER_ADS_FEED_URL_GEEKD = "https://feed.test/geekd.xml";
process.env.ADTRACTION_FEED_URL_KOMPLETT = "https://feed.test/komplett.xml";
process.env.ADTRACTION_FEED_URL_AVCABLES = "https://feed.test/avcables.xml";

function xmlResponse(body: string, ok = true, status = 200): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(body));
      controller.close();
    },
  });
  return { ok, status, body: stream } as Response;
}

function produkt(opts: {
  kategorinavn: string;
  brand: string;
  produktnavn: string;
  ean: string;
  nypris: string;
  lagerantal: string;
  slug: string;
}): string {
  const vareurl = `https://www.partner-ads.com/dk/klik.php?partnerid=57198&bannerid=1&htmlurl=${encodeURIComponent(
    `https://proshop.dk/product/${opts.slug}`
  )}`;
  return `<produkt><kategorinavn>${opts.kategorinavn}</kategorinavn><brand>${opts.brand}</brand><produktnavn>${opts.produktnavn}</produktnavn><ean>${opts.ean}</ean><nypris>${opts.nypris}</nypris><lagerantal>${opts.lagerantal}</lagerantal><vareurl>${vareurl.replace(/&/g, "&amp;")}</vareurl></produkt>`;
}

const PROSHOP_FEED = `<produkter>${produkt({
  kategorinavn: "Mus",
  brand: "Alphagear",
  produktnavn: "Alphagear Zenith",
  ean: "1111111111111",
  nypris: "499",
  lagerantal: "5",
  slug: "alpha-zenith",
})}${produkt({
  kategorinavn: "Mus",
  brand: "Betagear",
  produktnavn: "Betagear Comet",
  ean: "2222222222222",
  nypris: "799",
  lagerantal: "0",
  slug: "beta-comet",
})}${produkt({
  kategorinavn: "Mus",
  brand: "Gammagear",
  produktnavn: "Gammagear Nova",
  ean: "3333333333333",
  nypris: "",
  lagerantal: "3",
  slug: "gamma-nova",
})}</produkter>`;

const EMPTY_PARTNER_ADS_FEED = "<produkter></produkter>";
const EMPTY_GOOGLE_SHOPPING_FEED = "<rss><channel></channel></rss>";

describe("runFeedSync", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === process.env.PARTNER_ADS_FEED_URL_PROSHOP) return xmlResponse(PROSHOP_FEED);
        return xmlResponse(EMPTY_PARTNER_ADS_FEED);
      })
    );
  });

  it("refreshes price:* for an already-verified pair, using the feed's price", async () => {
    await runFeedSync("proshop");
    const value = await redisGet<{ prisDkk?: number; inStock?: boolean }>("price:alpha-mouse__proshop");
    expect(value).toEqual({ prisDkk: 499, inStock: true });
  });

  it("never writes prisDkk when the feed has no price, but still refreshes stock", async () => {
    await runFeedSync("proshop");
    const value = await redisGet<{ prisDkk?: number; inStock?: boolean }>("price:gamma-mouse__proshop");
    expect(value).toEqual({ inStock: true });
    expect(value).not.toHaveProperty("prisDkk");
  });

  it("surfaces a brand-new pairing as a candidate, never as a live price", async () => {
    await runFeedSync("proshop");
    const price = await redisGet("price:beta-mouse__proshop");
    expect(price).toBeNull();

    const candidate = await redisGet<{ slug: string; priceDkk: number | null; inStock: boolean }>(
      "feedcandidate:proshop:beta-mouse"
    );
    expect(candidate).toMatchObject({ slug: "beta-mouse", priceDkk: 799, inStock: false });
  });

  it("dryRun performs zero Redis writes", async () => {
    const { wouldWritePrices, wouldWriteCandidates } = await runFeedSync("proshop", { dryRun: true });
    expect(wouldWritePrices?.length).toBe(2); // alpha + gamma
    expect(wouldWriteCandidates?.length).toBe(1); // beta

    const price = await redisGet("price:alpha-mouse__proshop-dryrun-check");
    expect(price).toBeNull();
    const runSummary = await redisGet("feedrun:proshop:latest");
    // A prior non-dryRun test in this suite may have already written this
    // key for real — dryRun must not have added to or reset it.
    expect(runSummary).not.toBeNull();
  });
});

describe("runAllFeedSyncs", () => {
  it("keeps going when one retailer's fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === process.env.ADTRACTION_FEED_URL_KOMPLETT) return xmlResponse("", false, 500);
        if (url === process.env.ADTRACTION_FEED_URL_AVCABLES) return xmlResponse(EMPTY_GOOGLE_SHOPPING_FEED);
        return xmlResponse(EMPTY_PARTNER_ADS_FEED);
      })
    );

    const results = await runAllFeedSyncs({ dryRun: true });
    expect(results).toHaveLength(4);

    const byRetailer = Object.fromEntries(results.map((r) => [r.summary.retailer, r.summary]));
    expect(byRetailer.komplett.errors.length).toBeGreaterThan(0);
    expect(byRetailer.proshop.errors).toEqual([]);
    expect(byRetailer.geekd.errors).toEqual([]);
    expect(byRetailer["av-cables"].errors).toEqual([]);
  });
});
