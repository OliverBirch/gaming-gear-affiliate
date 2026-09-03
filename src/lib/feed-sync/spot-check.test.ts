import { describe, it, expect } from "vitest";
import type { CatalogItem, NormalizedFeedItem } from "./types";
import { matchFeedAgainstCatalog } from "./matcher";
import { spotCheckNearMisses } from "./spot-check";

function mapCat(): ("mus" | "headset")[] {
  return ["mus", "headset"];
}

function feedItem(overrides: Partial<NormalizedFeedItem>): NormalizedFeedItem {
  return {
    brand: "Razer",
    title: "Razer Test Headset",
    gtin: "0000000000000",
    priceDkk: 500,
    inStock: true,
    productType: "headset",
    produktUrl: "https://example.test/p",
    affiliateUrl: "https://example.test/p?aff=1",
    ...overrides,
  };
}

const HEADSET: CatalogItem = {
  slug: "razer-test-headset",
  navn: "Razer Test Headset",
  brand: "Razer",
  category: "headset",
  ean: null,
};

const HEADSET_WITH_EAN: CatalogItem = { ...HEADSET, slug: "razer-test-headset-ean", ean: "1111111111111" };

describe("spotCheckNearMisses", () => {
  it("scores a dangerous-token near-miss with no catalog EAN, capped well under 100", () => {
    const catalog = [HEADSET];
    const items = [feedItem({ title: "Razer Test Headset Wireless", gtin: "9999999999999" })];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat);
    expect(run.matches.size).toBe(0);
    // HEADSET has no catalog `ean`, so the matcher's own near-miss reason
    // is "no-gtin-in-catalog" (see matcher.ts: reason is "dangerous-token"
    // only when cat.ean is set) — spot-check treats both as scoreable.
    expect(run.nearMiss.get(HEADSET.slug)?.reason).toBe("no-gtin-in-catalog");

    const results = spotCheckNearMisses(run, catalog, items, mapCat);
    expect(results).toHaveLength(1);
    expect(results[0].catalogSlug).toBe(HEADSET.slug);
    expect(results[0].confidence).toBeLessThan(90);
    expect(results[0].confidence).toBeGreaterThan(0);
    expect(results[0].reasons.join(" ")).toMatch(/wireless/);
  });

  it("penalizes an EAN conflict more heavily than a missing EAN", () => {
    const catalog = [HEADSET_WITH_EAN];
    const items = [feedItem({ title: "Razer Test Headset Wireless", gtin: "2222222222222" })];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat);
    const results = spotCheckNearMisses(run, catalog, items, mapCat);

    expect(results).toHaveLength(1);
    expect(results[0].reasons.join(" ")).toMatch(/EAN i katalog.*matcher ikke/);

    // Same scenario but without a recorded catalog EAN at all — the
    // "unconfirmed" penalty should be smaller than an outright conflict.
    const noEanCatalog = [HEADSET];
    const noEanRun = matchFeedAgainstCatalog(items, noEanCatalog, mapCat);
    const noEanResults = spotCheckNearMisses(noEanRun, noEanCatalog, items, mapCat);
    expect(noEanResults[0].confidence).toBeGreaterThan(results[0].confidence);
  });

  it("skips catalog items the matcher never recorded a near-miss for at all (brand-not-found etc — those are synthesized later by diagnostics.ts, not present in matchFeedAgainstCatalog's own nearMiss map)", () => {
    const catalog = [HEADSET];
    const items = [feedItem({ brand: "SomeOtherBrand", title: "Unrelated Product" })];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat);
    expect(run.nearMiss.has(HEADSET.slug)).toBe(false);

    const results = spotCheckNearMisses(run, catalog, items, mapCat);
    expect(results).toHaveLength(0);
  });

  it("never scores a slug the real matcher already matched", () => {
    const catalog = [HEADSET_WITH_EAN];
    const items = [feedItem({ title: "Razer Test Headset", gtin: HEADSET_WITH_EAN.ean! })];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat);
    expect(run.matches.size).toBe(1);
    expect(run.nearMiss.size).toBe(0);

    const results = spotCheckNearMisses(run, catalog, items, mapCat);
    expect(results).toHaveLength(0);
  });

  it("sorts multiple results by confidence, descending", () => {
    // Both unconfirmed (no catalog EAN) so the only variable is how many
    // dangerous extra tokens the closest feed title carries.
    const weak: CatalogItem = { ...HEADSET, slug: "weak-match", navn: "Weak Match Headset" };
    const strong: CatalogItem = { ...HEADSET, slug: "strong-match", navn: "Strong Match Headset" };
    const catalog = [weak, strong];
    const items = [
      feedItem({ brand: "Razer", title: "Weak Match Headset Wireless Pro Max Ultra", gtin: "1" }),
      feedItem({ brand: "Razer", title: "Strong Match Headset Wireless", gtin: "2" }),
    ];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat);
    const results = spotCheckNearMisses(run, catalog, items, mapCat);

    expect(results).toHaveLength(2);
    expect(results[0].catalogSlug).toBe("strong-match");
    expect(results[1].catalogSlug).toBe("weak-match");
    expect(results[0].confidence).toBeGreaterThan(results[1].confidence);
  });

  it("respects brand aliases when re-deriving the candidate row", () => {
    const monitor: CatalogItem = { slug: "zowie-monitor", navn: "ZOWIE Test Monitor", brand: "ZOWIE", category: "headset", ean: null };
    const catalog = [monitor];
    const items = [feedItem({ brand: "BenQ", title: "ZOWIE Test Monitor 240Hz", gtin: "4444444444444" })];
    const run = matchFeedAgainstCatalog(items, catalog, mapCat, { benq: ["zowie"] });
    expect(run.nearMiss.get(monitor.slug)?.reason).toBe("no-gtin-in-catalog");

    const results = spotCheckNearMisses(run, catalog, items, mapCat, { benq: ["zowie"] });
    expect(results).toHaveLength(1);
    expect(results[0].feedGtin).toBe("4444444444444");
  });
});
