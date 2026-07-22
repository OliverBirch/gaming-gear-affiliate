import pricesData from "./prices.json";

export interface OfferOverride {
  prisDkk?: number;
  inStock?: boolean;
}

const overrides: Record<string, OfferOverride> = pricesData.overrides;

/**
 * Feed-shaped on purpose: this is the seam a scheduled Adtraction (or any
 * other network) feed ingestion job writes into - keyed by
 * `${productSlug}__${retailerSlug}`, covering any product category, not just
 * mice. bestOffer/bestOffers in lib/affiliate.ts read it as a live override
 * on top of the static offers[] data.
 */
export function getOfferOverride(productSlug: string, retailerSlug: string): OfferOverride | null {
  const key = `${productSlug}__${retailerSlug}`;
  return overrides[key] ?? null;
}
