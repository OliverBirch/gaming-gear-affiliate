import type { Mouse, AffiliateOffer, OfferRecord } from "./types";
import { getPrice } from "@/data/prices";

let _offerIdCounter = 0;

export function bestOffer(mouse: Mouse): AffiliateOffer | null {
  const inStock = mouse.offers.filter((o) => o.inStock !== false);
  if (inStock.length === 0) return null;

  const withPrices = inStock.map((o) => {
    const external = getPrice(mouse.slug, o.retailer);
    return {
      ...o,
      prisDkk: o.prisDkk ?? external ?? undefined,
    };
  });

  return withPrices.sort((a, b) => {
    const aPrice = a.prisDkk ?? Infinity;
    const bPrice = b.prisDkk ?? Infinity;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return b.payoutPct - a.payoutPct;
  })[0];
}

export function bestOffers(mouse: Mouse): AffiliateOffer[] {
  const inStock = mouse.offers.filter((o) => o.inStock !== false);
  return inStock.map((o) => {
    const external = getPrice(mouse.slug, o.retailer);
    return {
      ...o,
      prisDkk: o.prisDkk ?? external ?? undefined,
    };
  });
}

export function generateOfferId(): string {
  _offerIdCounter++;
  return `off_${Date.now()}_${_offerIdCounter}`;
}

export function buildOfferRecord(
  mouse: Mouse,
  offer: AffiliateOffer
): OfferRecord {
  return {
    id: generateOfferId(),
    mouseSlug: mouse.slug,
    retailerSlug: offer.retailer,
    produktUrl: offer.produktUrl,
    affiliateUrl: offer.affiliateUrl ?? offer.produktUrl,
    prisDkk: offer.prisDkk ?? null,
    payoutPct: offer.payoutPct,
    inStock: offer.inStock ?? true,
    createdAt: new Date().toISOString(),
  };
}

export function createGoUrl(offerId: string): string {
  return `/go/${offerId}`;
}
