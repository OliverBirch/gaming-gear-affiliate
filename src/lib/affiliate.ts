import type { AffiliateOffer, OfferRecord, OfferableProduct } from "./types";
import { getOfferOverride } from "@/data/prices";

let _offerIdCounter = 0;

async function resolveOffer(product: OfferableProduct, offer: AffiliateOffer): Promise<AffiliateOffer> {
  const override = await getOfferOverride(product.slug, offer.retailer);
  return {
    ...offer,
    prisDkk: override?.prisDkk ?? offer.prisDkk,
    inStock: override?.inStock ?? offer.inStock ?? true,
  };
}

export async function bestOffer(product: OfferableProduct): Promise<AffiliateOffer | null> {
  const resolved = await Promise.all(product.offers.map((o) => resolveOffer(product, o)));
  const inStock = resolved.filter((o) => o.inStock !== false);
  if (inStock.length === 0) return null;

  return inStock.sort((a, b) => {
    const aPrice = a.prisDkk ?? Infinity;
    const bPrice = b.prisDkk ?? Infinity;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return b.payoutPct - a.payoutPct;
  })[0];
}

export async function bestOffers(product: OfferableProduct): Promise<AffiliateOffer[]> {
  const resolved = await Promise.all(product.offers.map((o) => resolveOffer(product, o)));
  return resolved.filter((o) => o.inStock !== false);
}

/**
 * Lowest resolved price across a product's in-stock offers, or null when no
 * offer carries a price. Callers previously inlined a `reduce(…, Infinity)`
 * and compared against Infinity themselves.
 */
export async function getLowestPrice(product: OfferableProduct): Promise<number | null> {
  let lowest: number | null = null;
  for (const offer of await bestOffers(product)) {
    if (offer.prisDkk == null) continue;
    if (lowest === null || offer.prisDkk < lowest) lowest = offer.prisDkk;
  }
  return lowest;
}

export function generateOfferId(): string {
  _offerIdCounter++;
  return `off_${Date.now()}_${_offerIdCounter}`;
}

export function buildOfferRecord(
  product: OfferableProduct,
  offer: AffiliateOffer
): OfferRecord {
  return {
    id: generateOfferId(),
    productSlug: product.slug,
    retailerSlug: offer.retailer,
    produktUrl: offer.produktUrl,
    affiliateUrl: offer.affiliateUrl ?? offer.produktUrl,
    prisDkk: offer.prisDkk ?? null,
    payoutPct: offer.payoutPct,
    inStock: offer.inStock ?? true,
    createdAt: new Date().toISOString(),
  };
}
