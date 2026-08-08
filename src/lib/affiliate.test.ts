import { describe, it, expect, vi } from "vitest";

// prices.json overrides are the live-feed seam on top of static offers.
// Stubbed so these tests don't move when real price data changes.
vi.mock("@/data/prices", () => ({
  getOfferOverride: async (productSlug: string, retailerSlug: string) => {
    const table: Record<string, { prisDkk?: number; inStock?: boolean }> = {
      "test-mouse__proshop": { prisDkk: 449 },
      "test-mouse__coolshop": { inStock: false },
    };
    return table[`${productSlug}__${retailerSlug}`] ?? null;
  },
}));

const { bestOffer, bestOffers, getLowestPrice } = await import("./affiliate");

type Offer = Parameters<typeof bestOffer>[0]["offers"][number];

function product(offers: Array<Partial<Offer>>) {
  return {
    slug: "test-mouse",
    offers: offers.map((o) => ({
      retailer: "geekd",
      produktUrl: "https://example.test",
      payoutPct: 3.5,
      ...o,
    })) as Offer[],
  };
}

describe("resolveOffer via bestOffers", () => {
  it("uses the static price when one is set", async () => {
    const [offer] = await bestOffers(product([{ retailer: "proshop", prisDkk: 399 }]));
    expect(offer.prisDkk).toBe(399);
  });

  it("falls back to the prices.json override when static price is absent", async () => {
    const [offer] = await bestOffers(product([{ retailer: "proshop" }]));
    expect(offer.prisDkk).toBe(449);
  });

  it("treats offers as in stock unless explicitly marked otherwise", async () => {
    const [offer] = await bestOffers(product([{ retailer: "geekd", prisDkk: 100 }]));
    expect(offer.inStock).toBe(true);
  });

  it("drops offers the override marks out of stock", async () => {
    const offers = await bestOffers(
      product([
        { retailer: "coolshop", prisDkk: 10 },
        { retailer: "geekd", prisDkk: 200 },
      ])
    );
    expect(offers.map((o) => o.retailer)).toEqual(["geekd"]);
  });
});

describe("bestOffer", () => {
  it("picks the cheapest in-stock offer", async () => {
    const best = await bestOffer(
      product([
        { retailer: "geekd", prisDkk: 500 },
        { retailer: "computersalg", prisDkk: 450 },
      ])
    );
    expect(best?.retailer).toBe("computersalg");
  });

  it("breaks price ties on the higher payout", async () => {
    const best = await bestOffer(
      product([
        { retailer: "geekd", prisDkk: 500, payoutPct: 3.5 },
        { retailer: "computersalg", prisDkk: 500, payoutPct: 5.0 },
      ])
    );
    expect(best?.retailer).toBe("computersalg");
  });

  it("ranks priceless offers last rather than first", async () => {
    const best = await bestOffer(
      product([
        { retailer: "geekd" },
        { retailer: "computersalg", prisDkk: 900 },
      ])
    );
    expect(best?.retailer).toBe("computersalg");
  });

  it("returns null when every offer is out of stock", async () => {
    expect(await bestOffer(product([{ retailer: "coolshop", prisDkk: 10 }]))).toBeNull();
  });

  it("returns null when there are no offers at all", async () => {
    expect(await bestOffer(product([]))).toBeNull();
  });
});

describe("getLowestPrice", () => {
  it("returns the cheapest resolved price", async () => {
    expect(
      await getLowestPrice(
        product([
          { retailer: "geekd", prisDkk: 800 },
          { retailer: "computersalg", prisDkk: 650 },
        ])
      )
    ).toBe(650);
  });

  it("ignores offers with no price", async () => {
    expect(
      await getLowestPrice(
        product([{ retailer: "geekd" }, { retailer: "computersalg", prisDkk: 700 }])
      )
    ).toBe(700);
  });

  it("returns null when no offer carries a price", async () => {
    expect(await getLowestPrice(product([{ retailer: "geekd" }]))).toBeNull();
  });

  it("returns null for a product with no offers", async () => {
    expect(await getLowestPrice(product([]))).toBeNull();
  });
});
