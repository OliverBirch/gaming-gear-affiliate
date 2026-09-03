import { describe, it, expect } from "vitest";
import { buildFlatOffers, mergeOffers, type BuildOffersConfig } from "./build-offers";

const HEADSET_CONFIG: BuildOffersConfig = {
  searchUrls: {
    geekd: "https://geekd/hs",
    proshop: "https://pro/hs",
  },
  allowedRetailers: ["geekd", "proshop"],
  payoutPct: { geekd: 4.0, proshop: 3.5 },
  defaultPayoutPct: 3.5,
};

describe("buildFlatOffers", () => {
  it("emits one offer per priced, allowed retailer", () => {
    const offers = buildFlatOffers(
      { geekd: 1299, proshop: 1399 },
      HEADSET_CONFIG
    );
    // generisk marks these as category-search links, not product pages —
    // feed-sync reads it to know the pair still needs a real URL.
    expect(offers).toEqual([
      {
        retailer: "geekd",
        produktUrl: "https://geekd/hs",
        prisDkk: 1299,
        payoutPct: 4.0,
        inStock: true,
        generisk: true,
      },
      {
        retailer: "proshop",
        produktUrl: "https://pro/hs",
        prisDkk: 1399,
        payoutPct: 3.5,
        inStock: true,
        generisk: true,
      },
    ]);
  });

  it("skips retailers outside the allowlist", () => {
    const offers = buildFlatOffers(
      { geekd: 100, amazon: 50, coolshop: 60 },
      HEADSET_CONFIG
    );
    expect(offers.map((o) => o.retailer)).toEqual(["geekd"]);
  });

  it("skips null and non-numeric prices", () => {
    const offers = buildFlatOffers(
      { geekd: null, proshop: 499 },
      HEADSET_CONFIG
    );
    expect(offers.map((o) => o.retailer)).toEqual(["proshop"]);
  });

  it("returns no offers when nothing is priced, rather than a synthetic fallback", () => {
    expect(buildFlatOffers(null, HEADSET_CONFIG)).toEqual([]);
    expect(buildFlatOffers({}, HEADSET_CONFIG)).toEqual([]);
  });

  it("applies the per-retailer payout, falling back to the default", () => {
    const offers = buildFlatOffers(
      { geekd: 900, proshop: 900, unlisted: 900 },
      {
        ...HEADSET_CONFIG,
        searchUrls: { ...HEADSET_CONFIG.searchUrls, unlisted: "https://unlisted/hs" },
        allowedRetailers: ["geekd", "proshop", "unlisted"],
      }
    );
    expect(offers.find((o) => o.retailer === "geekd")?.payoutPct).toBe(4.0);
    expect(offers.find((o) => o.retailer === "proshop")?.payoutPct).toBe(3.5);
    // "unlisted" has no entry in payoutPct, so it must fall back to defaultPayoutPct.
    expect(
      offers.find((o) => (o.retailer as string) === "unlisted")?.payoutPct
    ).toBe(3.5);
  });
});

describe("mergeOffers", () => {
  const generic = (retailer: string) => ({
    retailer: retailer as never,
    produktUrl: `https://${retailer}/search`,
    payoutPct: 3.5,
    generisk: true,
  });
  const real = (retailer: string) => ({
    retailer: retailer as never,
    produktUrl: `https://${retailer}/product/x`,
    payoutPct: 3.5,
  });

  it("drops the generic fallback for a retailer that now has a real offer", () => {
    // Both surviving would resolve the same price:{slug}__{retailer}
    // override behind two different URLs — a duplicate row per retailer.
    const merged = mergeOffers([generic("proshop"), generic("geekd")], [real("proshop")]);
    expect(merged.map((o) => [o.retailer, o.produktUrl])).toEqual([
      ["geekd", "https://geekd/search"],
      ["proshop", "https://proshop/product/x"],
    ]);
  });

  it("keeps every fallback when there are no real offers", () => {
    expect(mergeOffers([generic("proshop")], undefined)).toHaveLength(1);
    expect(mergeOffers([generic("proshop")], [])).toHaveLength(1);
  });

  it("keeps real offers for retailers with no fallback", () => {
    expect(mergeOffers([], [real("komplett")]).map((o) => o.retailer)).toEqual(["komplett"]);
  });
});
