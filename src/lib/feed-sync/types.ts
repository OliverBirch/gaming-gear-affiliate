import type { RetailerSlug } from "@/lib/types";

export type ProductCategory = "mus" | "tastaturer" | "headset" | "skaerme" | "musemaatter";

/** One catalog product, flattened from the built @/data/* modules. */
export interface CatalogItem {
  slug: string;
  navn: string;
  brand: string;
  category: ProductCategory;
  ean: string | null;
}

/** One product row from a retailer feed, after its adapter has parsed the
 * retailer's own XML dialect into a shape the matcher understands. */
export interface NormalizedFeedItem {
  brand: string;
  title: string;
  gtin: string;
  priceDkk: number | null;
  inStock: boolean;
  /** Raw feed category string (breadcrumb or flat) - retailer-specific
   * mapping into ProductCategory happens in the matcher, not the adapter. */
  productType: string;
  produktUrl: string;
  affiliateUrl: string;
}

export interface MatchedOffer {
  slug: string;
  category: ProductCategory;
  ean: string;
  eanConfirmed: boolean;
  priceDkk: number | null;
  inStock: boolean;
  produktUrl: string;
  affiliateUrl: string;
  feedTitle: string;
}

export type UnmatchedReason =
  /** Brand+category candidate existed, token check failed, and the catalog
   * has no recorded EAN to fall back on - recording one might fix this. */
  | "no-gtin-in-catalog"
  /** Brand+category candidate existed, token check failed despite a
   * recorded catalog EAN that doesn't match the feed's GTIN - a genuinely
   * different SKU, not a data gap. */
  | "dangerous-token"
  /** This catalog item's brand appeared in the feed, but never under a
   * product_type/kategorinavn that maps to this item's category. */
  | "category-unmapped"
  /** This catalog item's brand never appeared in the feed at all. */
  | "brand-not-found"
  /** Brand+category candidates existed but never reached a token-level
   * comparison (e.g. every candidate title was too short to compare). */
  | "not-in-feed";

export interface Diagnostic {
  reason: UnmatchedReason;
  /** For dangerous-token/no-gtin-in-catalog: the blocking token(s). */
  detail?: string;
}

export interface RetailerFeedConfig {
  retailer: RetailerSlug;
  mapFeedCategory: (rawCategory: string) => ProductCategory[];
  brandAliasFeedToCatalog?: Record<string, string[]>;
}

/** Written to `feedrun:{retailer}:latest` after every sync run - the
 * live replacement for retailers.ts's hand-typed sidstFeedHentet string. */
export interface FeedRunSummary {
  retailer: RetailerSlug;
  fetchedAt: string;
  itemCount: number;
  matchedCount: number;
  unmatchedCount: number;
  errors: string[];
}

/** Written to `feedcandidate:{retailer}:{slug}` for a feed match against a
 * product+retailer pair with no existing human-verified offer - surfaced
 * for manual review, never auto-applied (see feed-sync/existing-offers.ts). */
export interface FeedCandidate {
  retailer: RetailerSlug;
  slug: string;
  category: ProductCategory;
  feedTitle: string;
  gtin: string;
  priceDkk: number | null;
  inStock: boolean;
  produktUrl: string;
  affiliateUrl: string;
  discoveredAt: string;
  eanConfirmed: boolean;
}
