/**
 * Shared "is this a stub product page" predicate. A product with zero
 * configured offers still has a real retailer relationship if any offer
 * entry exists but is temporarily out of stock — that's not a stub, just
 * momentarily unavailable, and shouldn't be noindexed for it. A product
 * with no offer entries at all has nothing configured yet.
 */
export function isStubOffers(product: { offers: { produktUrl: string }[] }): boolean {
  return product.offers.length === 0;
}
