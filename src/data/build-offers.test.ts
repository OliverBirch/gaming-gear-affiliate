import { describe, it, expect } from "vitest";
import { buildFlatOffers, type BuildOffersConfig } from "./build-offers";
import { headsets } from "./headsets";
import { monitors } from "./monitors";

const HEADSET_CONFIG: BuildOffersConfig = {
  searchUrls: {
    maxgaming: "https://max/hs",
    proshop: "https://pro/hs",
    computersalg: "https://cs/hs",
    elgiganten: "https://elg/hs",
  },
  allowedRetailers: ["maxgaming", "proshop", "computersalg", "elgiganten"],
  payoutPct: { maxgaming: 4.0, elgiganten: 2.5, proshop: 3.5, computersalg: 3.5 },
  fallbackRetailer: "maxgaming",
  defaultPayoutPct: 3.5,
};

describe("buildFlatOffers", () => {
  it("emits one offer per priced, allowed retailer", () => {
    const offers = buildFlatOffers(
      { maxgaming: 1299, proshop: 1399 },
      HEADSET_CONFIG
    );
    expect(offers).toEqual([
      {
        retailer: "maxgaming",
        produktUrl: "https://max/hs",
        prisDkk: 1299,
        payoutPct: 4.0,
        inStock: true,
      },
      {
        retailer: "proshop",
        produktUrl: "https://pro/hs",
        prisDkk: 1399,
        payoutPct: 3.5,
        inStock: true,
      },
    ]);
  });

  it("skips retailers outside the allowlist", () => {
    const offers = buildFlatOffers(
      { maxgaming: 100, amazon: 50, coolshop: 60 },
      HEADSET_CONFIG
    );
    expect(offers.map((o) => o.retailer)).toEqual(["maxgaming"]);
  });

  it("skips null and non-numeric prices", () => {
    const offers = buildFlatOffers(
      { maxgaming: null, proshop: undefined, computersalg: 499 },
      HEADSET_CONFIG
    );
    expect(offers.map((o) => o.retailer)).toEqual(["computersalg"]);
  });

  it("falls back to an out-of-stock offer when nothing is priced", () => {
    expect(buildFlatOffers(null, HEADSET_CONFIG)).toEqual([
      {
        retailer: "maxgaming",
        produktUrl: "https://max/hs",
        payoutPct: 4.0,
        inStock: false,
      },
    ]);
    expect(buildFlatOffers({}, HEADSET_CONFIG)).toHaveLength(1);
    expect(buildFlatOffers({}, HEADSET_CONFIG)[0].inStock).toBe(false);
  });

  it("applies the per-retailer payout, falling back to the default", () => {
    const offers = buildFlatOffers(
      { elgiganten: 900, computersalg: 900 },
      HEADSET_CONFIG
    );
    expect(offers.find((o) => o.retailer === "elgiganten")?.payoutPct).toBe(2.5);
    expect(offers.find((o) => o.retailer === "computersalg")?.payoutPct).toBe(3.5);
  });
});

// Pins the payout difference between the two catalogs. headsets pays
// elgiganten 2.5%, monitors pays it the 3.5% default — a real business
// difference that looked like duplication and must not be "unified" away.
describe("catalog payout rates", () => {
  it("pays elgiganten 2.5% on headsets", () => {
    const elg = headsets
      .flatMap((h) => h.offers)
      .filter((o) => o.retailer === "elgiganten");
    for (const o of elg) expect(o.payoutPct).toBe(2.5);
  });

  it("pays elgiganten 3.5% on monitors", () => {
    const elg = monitors
      .flatMap((m) => m.offers)
      .filter((o) => o.retailer === "elgiganten");
    for (const o of elg) expect(o.payoutPct).toBe(3.5);
  });

  it("gives every catalogued product at least one offer", () => {
    for (const h of headsets) expect(h.offers.length).toBeGreaterThan(0);
    for (const m of monitors) expect(m.offers.length).toBeGreaterThan(0);
  });
});
