import type { AffiliateOffer, OfferRecord, OfferableProduct } from "./types";
import { getOfferOverride } from "@/data/prices";

let _offerIdCounter = 0;

function resolveOffer(product: OfferableProduct, offer: AffiliateOffer): AffiliateOffer {
  const override = getOfferOverride(product.slug, offer.retailer);
  return {
    ...offer,
    prisDkk: offer.prisDkk ?? override?.prisDkk,
    inStock: offer.inStock ?? override?.inStock ?? true,
  };
}

export function bestOffer(product: OfferableProduct): AffiliateOffer | null {
  const inStock = product.offers
    .map((o) => resolveOffer(product, o))
    .filter((o) => o.inStock !== false);
  if (inStock.length === 0) return null;

  return inStock.sort((a, b) => {
    const aPrice = a.prisDkk ?? Infinity;
    const bPrice = b.prisDkk ?? Infinity;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return b.payoutPct - a.payoutPct;
  })[0];
}

export function bestOffers(product: OfferableProduct): AffiliateOffer[] {
  return product.offers
    .map((o) => resolveOffer(product, o))
    .filter((o) => o.inStock !== false);
}

/**
 * Lowest resolved price across a product's in-stock offers, or null when no
 * offer carries a price. Callers previously inlined a `reduce(…, Infinity)`
 * and compared against Infinity themselves.
 */
export function getLowestPrice(product: OfferableProduct): number | null {
  let lowest: number | null = null;
  for (const offer of bestOffers(product)) {
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
