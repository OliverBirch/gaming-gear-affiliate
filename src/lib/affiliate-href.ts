import type { RetailerSlug, AffiliateOffer } from "./types";

export type OutboundLinkParams = {
  retailer: RetailerSlug;
  productSlug?: string;
  produktUrl: string;
  affiliateUrl?: string | null;
  pagePath?: string;
};

/**
 * Client-safe: builds the first-party redirect path for an affiliate click.
 * Never put utm_* here. No server module imports (no redis, no ioredis).
 */
export function buildRedirectHref(params: OutboundLinkParams): string {
  const q = new URLSearchParams();
  q.set("r", params.retailer);
  if (params.productSlug) q.set("p", params.productSlug);
  q.set("u", params.produktUrl);
  if (params.affiliateUrl) q.set("a", params.affiliateUrl);
  if (params.pagePath) q.set("path", params.pagePath);
  return `/api/redirect?${q.toString()}`;
}

export function offerToRedirectHref(
  offer: AffiliateOffer,
  productSlug: string,
  pagePath?: string
): string {
  return buildRedirectHref({
    retailer: offer.retailer,
    productSlug,
    produktUrl: offer.produktUrl,
    affiliateUrl: offer.affiliateUrl,
    pagePath,
  });
}
