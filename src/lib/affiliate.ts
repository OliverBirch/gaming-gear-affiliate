import type { Mouse, AffiliateOffer, OfferRecord } from "./types";

let _offerIdCounter = 0;

export function bestOffer(mouse: Mouse): AffiliateOffer | null {
  return (
    mouse.offers
      .filter((o) => o.inStock !== false)
      .sort((a, b) => b.payoutPct - a.payoutPct)[0] ?? null
  );
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
