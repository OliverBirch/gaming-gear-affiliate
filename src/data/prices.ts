import pricesData from "./prices.json";
import { redisGet, redisMget } from "@/lib/redis";
import { allOfferKeys } from "@/lib/feed-sync/existing-offers";

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
 *
 * The known key set (which `${slug}__${retailer}` pairs could possibly have
 * an override) comes from feed-sync/existing-offers.ts's allOfferKeys() —
 * the same "flatten the built catalog's offers[]" logic the sync job's
 * trust-boundary check uses, not a second hand-rolled copy of it.
 */

// getOfferOverride() is called once per (product, offer) — 1000+ times in a
// production build. A real Redis connection would turn every one of those
// into its own network round trip, so the whole known key set is fetched in
// a single MGET on first use and cached for the process lifetime instead.
//
// Only the Redis layer is cached here — never the merged/fallback result.
// On a warm Vercel lambda this module stays loaded across requests, and the
// whole point of the daily feed-sync job is to change what's in Redis; a
// cache of the merged value would keep serving the pre-sync price to an ISR
// regeneration that runs on the same warm instance. The static prices.json
// `overrides` map can't go stale the same way (it only changes on deploy),
// so it stays a live per-call lookup instead of being folded into the cache.
let redisCache: Map<string, OfferOverride | null> | null = null;
let redisCachePromise: Promise<Map<string, OfferOverride | null>> | null = null;

async function loadRedisCache(): Promise<Map<string, OfferOverride | null>> {
  if (redisCache) return redisCache;
  if (!redisCachePromise) {
    redisCachePromise = (async () => {
      const keys = allOfferKeys();
      const live = await redisMget<OfferOverride>(keys.map((k) => `price:${k}`));
      const map = new Map<string, OfferOverride | null>();
      keys.forEach((key, i) => map.set(key, live[i] ?? null));
      redisCache = map;
      return map;
    })();
  }
  return redisCachePromise;
}

/**
 * Drops the cached Redis snapshot. The feed-sync cron route must call this
 * right after it writes new `price:*` keys and before it calls
 * revalidatePath() — otherwise the regenerated page reads the pre-sync
 * snapshot on a warm instance and renders the old price anyway.
 */
export function resetOfferOverrideCache(): void {
  redisCache = null;
  redisCachePromise = null;
}

export async function getOfferOverride(productSlug: string, retailerSlug: string): Promise<OfferOverride | null> {
  const key = `${productSlug}__${retailerSlug}`;
  const preloaded = await loadRedisCache();
  if (preloaded.has(key)) {
    const live = preloaded.get(key)!;
    if (live) return live;
    return overrides[key] ?? null;
  }
  // Pair not in the precomputed catalog snapshot (e.g. a test double) — fall
  // back to a direct read rather than silently returning null.
  const live = await redisGet<OfferOverride>(`price:${key}`);
  if (live) return live;
  return overrides[key] ?? null;
}
