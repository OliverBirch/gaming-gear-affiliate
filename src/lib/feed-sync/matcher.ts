import type { CatalogItem, Diagnostic, MatchedOffer, NormalizedFeedItem, ProductCategory } from "./types";

/**
 * Shared normalize/tokenize/danger-word core, canonicalized from the 4
 * original scripts/match-{retailer}-eans.mjs files. Those had drifted apart:
 * Komplett/AV-Cables (Adtraction feeds) had a ps5/xbox360-style digit-fusion
 * guard and an EAN-ground-truth escape hatch that Proshop/Geek'd
 * (Partner-Ads feeds) never got. Both refinements only ever *relax* a
 * rejection when there's real proof (a matching catalog EAN) or *tighten* a
 * known false-positive pattern - neither can turn a previously-good match
 * bad - so this canonical version applies both everywhere rather than
 * picking one retailer's script as "the" version.
 *
 * STOP_WORDS/DISALLOWED_EXTRA are likewise the union of all 4 scripts'
 * lists: each entry was added after a real ground-truth false positive at
 * one specific retailer, but the underlying confusion (e.g. "Cloud II" vs
 * "Cloud II Wireless") is retailer-agnostic, so every retailer benefits from
 * every other retailer's findings.
 */
export const STOP_WORDS = new Set([
  "the", "usb", "for", "and", "med", "til", "og",
  "optisk", "kablet", "sort", "hvid", "rgb", "knapper",
  "gaming", "mouse", "keyboard", "tastatur", "headset",
  "hoeretelefoner", "mus", "nordisk", "geekd", "dk",
  "en", "et", "som", "der", "den", "det", "de", "paa", "i", "af",
  "fra", "ved", "har", "kan", "alt", "her",
]);

export const DISALLOWED_EXTRA = new Set([
  "wireless", "wired", "kablet", "traadloes", "tradlos", "trådløs", "trådløst",
  "tkl", "tenkeyless", "air", "core", "lightspeed", "hyperspeed",
  "dex", "se", "pro", "max", "mini", "plus", "lite", "ultra",
  "champion", "edition", "signature", "special", "limited",
  "gen", "gen2", "gen3", "v2", "v3", "v4", "v5",
  "ii", "iii", "iv", "x2", "x3", "he", "s",
  "superstrike", "superlight", "wolf", "phantom",
  "medium", "large", "small", "xl", "xxl", "voce", "vo", "ce", "amerikansk", "engelsk",
  "heavy", "soft", "hard", "speed", "control",
  "us", "ansi", "iso", "international", "uk",
  "fransk", "tysk", "spansk", "italiensk", "svensk", "finsk", "norsk",
  "hollandsk", "nederlandsk", "portugisisk", "schweizisk", "belgisk",
  "ps", "xbox", "playstation", "for",
  "x",
  "earbuds", "buds", "compact",
  "håndledsstøtte", "wrist", "bundle", "pakke",
  "travel", "case", "opgraderings", "tilbehør", "accessory", "upgrade",
]);

const SPEC_DESCRIPTORS = new Set([
  "fhd", "qhd", "wqhd", "uhd", "4k", "2k", "ips", "tn", "va", "oled", "mini", "led", "curved",
]);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 1 && !STOP_WORDS.has(t));
}

/** Exported for spot-check.ts, which scores the same near-misses this file
 * already rejects rather than re-deriving its own "is this token
 * dangerous" definition. */
export function isSpecDescriptor(t: string): boolean {
  return /^\d+x\d+$/.test(t) || /^\d+hz$/.test(t) || /^\d+$/.test(t) || SPEC_DESCRIPTORS.has(t);
}

export function isDangerousToken(t: string, knapperCount: string | null): boolean {
  return DISALLOWED_EXTRA.has(t) || /^(ps|xbox)\d+$/.test(t) || (/^\d/.test(t) && t !== knapperCount);
}

export interface MatchRunResult {
  matches: Map<string, MatchedOffer>;
  /** Best near-miss reason recorded per catalog slug during the pass -
   * consumed by diagnostics.ts to build the final per-slug Diagnostic. */
  nearMiss: Map<string, Diagnostic>;
  /** Catalog slugs whose brand appeared anywhere in the feed. */
  brandSeen: Set<string>;
  /** Catalog slugs whose brand+category appeared together in the feed. */
  categorySeen: Set<string>;
  duplicateEanWarnings: Array<{ ean: string; slugs: string[] }>;
}

export function matchFeedAgainstCatalog(
  feedItems: NormalizedFeedItem[],
  catalog: CatalogItem[],
  mapFeedCategory: (rawCategory: string) => ProductCategory[],
  brandAliasFeedToCatalog: Record<string, string[]> = {}
): MatchRunResult {
  const byBrand = new Map<string, CatalogItem[]>();
  for (const c of catalog) {
    const b = normalize(c.brand);
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b)!.push(c);
  }

  const matches = new Map<string, MatchedOffer>();
  const nearMiss = new Map<string, Diagnostic>();
  const brandSeen = new Set<string>();
  const categorySeen = new Set<string>();
  const eanToSlugs = new Map<string, Set<string>>();

  for (const item of feedItems) {
    const feedBrand = normalize(item.brand);
    const feedName = normalize(item.title);
    if (!feedBrand || !feedName || !item.gtin) continue;

    const candidates = [
      ...(byBrand.get(feedBrand) ?? []),
      ...(brandAliasFeedToCatalog[feedBrand] ?? []).flatMap((b) => byBrand.get(b) ?? []),
    ];
    if (candidates.length === 0) continue;
    for (const c of candidates) brandSeen.add(c.slug);

    const ourCats = mapFeedCategory(item.productType);
    if (ourCats.length === 0) continue;
    const catCandidates = candidates.filter((c) => ourCats.includes(c.category));
    for (const c of catCandidates) categorySeen.add(c.slug);
    if (catCandidates.length === 0) continue;

    const feedTokens = tokenize(feedName);
    if (feedTokens.length < 2) continue;
    const feedTokenSet = new Set(feedTokens);

    for (const cat of catCandidates) {
      if (matches.has(cat.slug)) continue;

      const catTokens = tokenize(cat.navn);
      const catTokenSet = new Set(catTokens);

      const allCatTokensPresent = catTokens.every((t) => feedTokenSet.has(t));
      if (!allCatTokensPresent) continue;

      const brandTokens = new Set([...tokenize(cat.brand), ...tokenize(item.brand)]);
      const knapperCountMatch = feedName.match(/(\d+)\s*knapper/);
      const knapperCount = knapperCountMatch ? knapperCountMatch[1] : null;

      const dangerousExtraTokens = feedTokens.filter(
        (t) =>
          !catTokenSet.has(t) &&
          !brandTokens.has(t) &&
          t !== knapperCount &&
          !(cat.category === "skaerme" && isSpecDescriptor(t)) &&
          isDangerousToken(t, knapperCount)
      );

      const eanConfirmed = Boolean(cat.ean) && cat.ean === item.gtin;

      if (dangerousExtraTokens.length > 0 && !eanConfirmed) {
        nearMiss.set(cat.slug, {
          reason: cat.ean ? "dangerous-token" : "no-gtin-in-catalog",
          detail: dangerousExtraTokens.join(","),
        });
        continue;
      }

      const specificEnough =
        catTokens.length >= 2 || (catTokens.length === 1 && catTokens[0].length >= 5 && /\d/.test(catTokens[0]));
      if (!specificEnough) continue;

      matches.set(cat.slug, {
        slug: cat.slug,
        category: cat.category,
        ean: item.gtin,
        eanConfirmed,
        priceDkk: item.priceDkk,
        inStock: item.inStock,
        produktUrl: item.produktUrl,
        affiliateUrl: item.affiliateUrl,
        feedTitle: item.title,
      });
      nearMiss.delete(cat.slug);

      if (!eanToSlugs.has(item.gtin)) eanToSlugs.set(item.gtin, new Set());
      eanToSlugs.get(item.gtin)!.add(cat.slug);
      break;
    }
  }

  const duplicateEanWarnings = [...eanToSlugs.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([ean, slugs]) => ({ ean, slugs: [...slugs] }));

  return { matches, nearMiss, brandSeen, categorySeen, duplicateEanWarnings };
}
