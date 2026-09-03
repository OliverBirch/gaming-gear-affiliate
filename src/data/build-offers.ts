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
  defaultPayoutPct: number;
};

/**
 * Generic fallbacks plus individually-authored real offers, with the
 * fallback dropped for any retailer that now has a real one.
 *
 * Both would otherwise survive into `offers[]` for the same retailer, and
 * the price override that drives live pricing is keyed `{slug}__{retailer}`
 * — so the two entries would resolve to the same price behind two different
 * URLs and render as duplicate rows in the price comparison. Dropping the
 * fallback per retailer is also the ROADMAP's stated intent: remove a
 * category's fallback once, and only once, real data actually backs it.
 */
export function mergeOffers(
  generic: AffiliateOffer[],
  real: AffiliateOffer[] | undefined
): AffiliateOffer[] {
  const realRetailers = new Set((real ?? []).map((o) => o.retailer));
  return [...generic.filter((o) => !realRetailers.has(o.retailer)), ...(real ?? [])];
}

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
      generisk: true,
    });
  }

  // No verified retailer carries this product: show no offer rather than a
  // synthetic "see price at X" link to a retailer that isn't actually priced.
  return offers;
}
