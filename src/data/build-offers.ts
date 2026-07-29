import type { AffiliateOffer } from "@/lib/types";

/**
 * Builds a product's offer list from a flat `{ retailer: price }` map.
 *
 * headsets.ts and monitors.ts had byte-identical copies of this. The parts
 * that genuinely differ per category — which retailers are carried, what each
 * pays out, and the category search URLs — are parameters.
 *
 * mousepads.ts does NOT use this: its prices are nested per size variant, so
 * it keeps its own variant-aware builder rather than contorting this one.
 */
export type BuildOffersConfig = {
  /** Category listing URL per retailer, used as the offer's produktUrl. */
  searchUrls: Record<string, string>;
  /** Retailers to emit offers for. Anything else in `priser` is ignored. */
  allowedRetailers: readonly string[];
  /** Payout percentage per retailer. */
  payoutPct: Record<string, number>;
  /** Retailer used for the no-price fallback offer. */
  fallbackRetailer: string;
  defaultPayoutPct: number;
};

export function buildFlatOffers(
  priser: Record<string, number | null | undefined> | null,
  config: BuildOffersConfig
): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];

  for (const [retailer, pris] of Object.entries(priser ?? {})) {
    if (typeof pris !== "number") continue;
    if (!config.allowedRetailers.includes(retailer)) continue;
    const produktUrl = config.searchUrls[retailer];
    if (!produktUrl) continue;
    offers.push({
      retailer: retailer as AffiliateOffer["retailer"],
      produktUrl,
      prisDkk: pris,
      payoutPct: config.payoutPct[retailer] ?? config.defaultPayoutPct,
      inStock: true,
    });
  }

  // No priced offer: still surface a "se pris hos X" path rather than nothing.
  if (offers.length === 0) {
    offers.push({
      retailer: config.fallbackRetailer as AffiliateOffer["retailer"],
      produktUrl: config.searchUrls[config.fallbackRetailer],
      payoutPct: config.payoutPct[config.fallbackRetailer] ?? config.defaultPayoutPct,
      inStock: false,
    });
  }

  return offers;
}
