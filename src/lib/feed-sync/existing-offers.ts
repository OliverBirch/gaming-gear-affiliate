import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import { mousepads } from "@/data/mousepads";
import type { OfferableProduct, RetailerSlug } from "@/lib/types";

/**
 * The trust-boundary enforcement point: does `slug` already have a
 * human-verified offer from `retailer`? All 5 categories' differing raw-JSON
 * shapes (mice's authored offers[], headsets/monitors' priser->
 * buildFlatOffers, mousepads' nested-per-size, keyboards' retailers[]->
 * kbOffers) converge here, because this reads the *built* offers[] array -
 * the one thing every shape ends up producing and the only thing
 * resolveOffer() ever iterates. A feed match for a pair not in this set is a
 * brand-new relationship and must never be auto-applied (see
 * src/lib/feed-sync/run.ts) - only a price/stock refresh on an
 * already-trusted pair is safe to automate.
 */
let offerKeysCache: Set<string> | null = null;

function buildOfferKeys(): Set<string> {
  const products: OfferableProduct[] = [...mice, ...keyboards, ...headsets, ...monitors, ...mousepads];
  const keys = new Set<string>();
  for (const product of products) {
    for (const offer of product.offers) {
      keys.add(`${product.slug}__${offer.retailer}`);
    }
  }
  return keys;
}

/** Call after writing a new offer directly to a category's JSON file (see
 * feed-sync/apply.ts) so a subsequent hasExistingOffer() call in the same
 * process sees it — the cache below is otherwise built once and kept for
 * the process lifetime. */
export function invalidateOfferKeysCache(): void {
  offerKeysCache = null;
}

/** Every `${slug}__${retailer}` pair with a human-verified offer today. */
export function allOfferKeys(): string[] {
  if (!offerKeysCache) offerKeysCache = buildOfferKeys();
  return [...offerKeysCache];
}

export function hasExistingOffer(slug: string, retailer: RetailerSlug): boolean {
  if (!offerKeysCache) offerKeysCache = buildOfferKeys();
  return offerKeysCache.has(`${slug}__${retailer}`);
}
