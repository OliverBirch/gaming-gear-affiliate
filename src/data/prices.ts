import pricesData from "./prices.json";
import { redisGet } from "@/lib/redis";

export interface OfferOverride {
  prisDkk?: number;
  inStock?: boolean;
}

const overrides: Record<string, OfferOverride> = pricesData.overrides;

/**
 * Keyed by `${productSlug}__${retailerSlug}`, covering any product category,
 * not just mice. bestOffer/bestOffers in lib/affiliate.ts read it as a live
 * override on top of the static offers[] data.
 *
 * Redis holds the live value written by the daily feed-sync job; prices.json
 * is the committed fallback. Build containers may not reach Redis (or it may
 * be empty on a cold cache), so every product still renders a price from the
 * fallback rather than shipping priceless - Redis, when reachable, always
 * wins since the sync job keeps it fresher than a hand-edited JSON file.
 */
export async function getOfferOverride(productSlug: string, retailerSlug: string): Promise<OfferOverride | null> {
  const key = `${productSlug}__${retailerSlug}`;
  const live = await redisGet<OfferOverride>(`price:${key}`);
  if (live) return live;
  return overrides[key] ?? null;
}
