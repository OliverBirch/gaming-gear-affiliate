import { describe, it, expect } from "vitest";
import { matchFeedAgainstCatalog } from "./matcher";
import type { CatalogItem, NormalizedFeedItem } from "./types";

const feedItem = (title: string, brand: string, gtin: string): NormalizedFeedItem => ({
  brand,
  title,
  gtin,
  priceDkk: 999,
  inStock: true,
  productType: "headset",
  produktUrl: `https://example.dk/${gtin}`,
  affiliateUrl: `https://example.dk/${gtin}?deeplink`,
});

const catalogItem = (slug: string, navn: string, brand: string, ean: string | null = null): CatalogItem => ({
  slug,
  navn,
  brand,
  category: "headset",
  ean,
});

const mapCategory = () => ["headset" as const];

describe("matchFeedAgainstCatalog — Danish/English connectivity wording", () => {
  // A Danish feed lists "HyperX Cloud II Trådløs". The catalog carries both a
  // wired `hyperx-cloud-ii` and a `hyperx-cloud-ii-wireless`. Before the
  // synonym fix, the wired entry rejected it (correctly) and the wireless
  // entry could never match it, so the listing matched nothing at all.
  const catalog = [
    catalogItem("hyperx-cloud-ii", "HyperX Cloud II", "HyperX"),
    catalogItem("hyperx-cloud-ii-wireless", "HyperX Cloud II Wireless", "HyperX"),
  ];

  it("matches a Danish 'Trådløs' listing to the English 'Wireless' slug", () => {
    const { matches } = matchFeedAgainstCatalog(
      [feedItem("HyperX Cloud II Trådløs Gaming Headset", "HyperX", "0196188875681")],
      catalog,
      mapCategory
    );
    expect([...matches.keys()]).toEqual(["hyperx-cloud-ii-wireless"]);
  });

  it("still keeps the wired slug away from the wireless listing", () => {
    const { matches, nearMiss } = matchFeedAgainstCatalog(
      [feedItem("HyperX Cloud II Trådløs Gaming Headset", "HyperX", "0196188875681")],
      [catalogItem("hyperx-cloud-ii", "HyperX Cloud II", "HyperX", "0000000000001")],
      mapCategory
    );
    expect(matches.has("hyperx-cloud-ii")).toBe(false);
    expect(nearMiss.get("hyperx-cloud-ii")?.reason).toBe("dangerous-token");
  });

  it("does not make the wireless slug swallow a plain wired listing", () => {
    const { matches } = matchFeedAgainstCatalog(
      [feedItem("HyperX Cloud II Gaming Headset", "HyperX", "0740617281033")],
      [catalogItem("hyperx-cloud-ii-wireless", "HyperX Cloud II Wireless", "HyperX")],
      mapCategory
    );
    expect(matches.size).toBe(0);
  });

  it("accepts the English spelling too, unchanged", () => {
    const { matches } = matchFeedAgainstCatalog(
      [feedItem("HyperX Cloud II Wireless Gaming Headset", "HyperX", "0196188875681")],
      [catalogItem("hyperx-cloud-ii-wireless", "HyperX Cloud II Wireless", "HyperX")],
      mapCategory
    );
    expect([...matches.keys()]).toEqual(["hyperx-cloud-ii-wireless"]);
  });
});

describe("matchFeedAgainstCatalog — multi-size products", () => {
  const pad = (extra: Partial<CatalogItem> = {}): CatalogItem => ({
    slug: "steelseries-qck-heavy",
    navn: "QcK Heavy",
    brand: "SteelSeries",
    category: "musemaatter",
    ean: "5707119026154",
    sizeNames: ["Medium", "Large", "XXL"],
    ...extra,
  });
  const padFeed = (title: string, gtin: string): NormalizedFeedItem => ({
    ...feedItem(title, "SteelSeries", gtin),
    productType: "musemaatte",
  });
  const mapPads = () => ["musemaatter" as const];

  it("matches a listing for one of the product's own sizes, and names the size", () => {
    // "xxl" is in DISALLOWED_EXTRA, so before this the whole listing was
    // rejected as a different SKU — the qck-heavy ambiguity.
    const { matches } = matchFeedAgainstCatalog(
      [padFeed("SteelSeries QcK Heavy XXL Musemåtte", "5707119043298")],
      [pad()],
      mapPads
    );
    expect(matches.get("steelseries-qck-heavy")?.matchedSize).toBe("XXL");
  });

  it("confirms by EAN when the feed carries a *size's* barcode, not the product's", () => {
    const { matches } = matchFeedAgainstCatalog(
      [padFeed("SteelSeries QcK Heavy XXL Musemåtte", "5707119043298")],
      [pad({ extraEans: ["5707119043298"] })],
      mapPads
    );
    expect(matches.get("steelseries-qck-heavy")?.eanConfirmed).toBe(true);
  });

  it("leaves matchedSize null when the size is already the product's name", () => {
    const { matches } = matchFeedAgainstCatalog(
      [padFeed("SteelSeries QcK Large Musemåtte", "5707119001762")],
      [pad({ slug: "steelseries-qck-large", navn: "QcK Large", ean: "5707119001762" })],
      mapPads
    );
    expect(matches.get("steelseries-qck-large")?.matchedSize).toBeNull();
  });

  it("does not let one pad's size tokens rescue a different pad", () => {
    const { matches } = matchFeedAgainstCatalog(
      [padFeed("SteelSeries QcK Heavy XXL Musemåtte", "5707119043298")],
      [pad({ slug: "steelseries-qck-large", navn: "QcK Large", ean: "5707119001762" })],
      mapPads
    );
    expect(matches.size).toBe(0);
  });
});
