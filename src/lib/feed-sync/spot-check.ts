import type { CatalogItem, NormalizedFeedItem } from "./types";
import { normalize, tokenize, isDangerousToken, isSpecDescriptor, type MatchRunResult } from "./matcher";

/**
 * A fuzzy, human-review-only companion to the strict matcher's binary
 * accept/reject. Operates ONLY on slugs the real matcher (matchFeedAgainstCatalog)
 * already flagged as a near-miss with reason "dangerous-token" or
 * "no-gtin-in-catalog" — the two cases where a real candidate row exists
 * but got rejected. Deliberately does not re-derive its own notion of "is
 * this a candidate" (an earlier version did, independently, and it
 * produced false positives for products the real matcher had already
 * matched successfully — the harmless-token penalty made an EAN-confirmed
 * match look like an unresolved near-miss). "not-in-feed" /
 * "category-unmapped" / "brand-not-found" near-misses have no specific
 * candidate row to show and are skipped.
 */
export interface SpotCheckMatch {
  catalogSlug: string;
  catalogNavn: string;
  feedTitle: string;
  feedGtin: string;
  confidence: number; // 0-100
  reasons: string[];
}

function scoreCandidate(cat: CatalogItem, item: NormalizedFeedItem, catTokenSet: Set<string>): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 100;

  const feedTokens = tokenize(item.title);
  const feedTokenSet = new Set(feedTokens);
  const knapperCountMatch = item.title.toLowerCase().match(/(\d+)\s*knapper/);
  const knapperCount = knapperCountMatch ? knapperCountMatch[1] : null;
  const extraTokens = feedTokens.filter((t) => !catTokenSet.has(t));
  const dangerousExtra = extraTokens.filter(
    (t) => !(cat.category === "skaerme" && isSpecDescriptor(t)) && isDangerousToken(t, knapperCount)
  );

  if (dangerousExtra.length > 0) {
    score -= dangerousExtra.length * 12;
    reasons.push(`${dangerousExtra.length} usikre ekstra-ord: ${dangerousExtra.join(", ")}`);
  }

  const eanConfirmed = Boolean(cat.ean) && cat.ean === item.gtin;
  const eanConflict = Boolean(cat.ean) && item.gtin && cat.ean !== item.gtin;
  if (eanConfirmed) {
    score = 100;
    reasons.length = 0;
    reasons.push("EAN matcher præcist — burde allerede være et rigtigt match, ikke kun et near-miss");
  } else if (eanConflict) {
    score -= 40;
    reasons.push(`EAN i katalog (${cat.ean}) matcher ikke feedens GTIN (${item.gtin}) — sandsynligvis en anden variant`);
  } else if (!cat.ean) {
    score -= 15;
    reasons.push("intet EAN i kataloget til at bekræfte — kun navne-match");
  }

  if (!eanConfirmed) {
    const harmlessExtraRatio = (extraTokens.length - dangerousExtra.length) / Math.max(feedTokenSet.size, 1);
    score -= Math.round(harmlessExtraRatio * 10);
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

/**
 * `run` must come from a real matchFeedAgainstCatalog() call against the
 * same `feedItems`/`catalog` — this only re-examines slugs that run
 * already marked as a genuine near-miss, it never widens the candidate set
 * beyond what the strict matcher itself considered.
 */
export function spotCheckNearMisses(
  run: MatchRunResult,
  catalog: CatalogItem[],
  feedItems: NormalizedFeedItem[],
  mapFeedCategory: (raw: string) => CatalogItem["category"][],
  brandAliasFeedToCatalog: Record<string, string[]> = {}
): SpotCheckMatch[] {
  const catalogBySlug = new Map(catalog.map((c) => [c.slug, c]));
  const results: SpotCheckMatch[] = [];

  for (const [slug, diag] of run.nearMiss) {
    if (diag.reason !== "dangerous-token" && diag.reason !== "no-gtin-in-catalog") continue;
    const cat = catalogBySlug.get(slug);
    if (!cat) continue;

    const catTokens = tokenize(cat.navn);
    if (catTokens.length === 0) continue;
    const catTokenSet = new Set(catTokens);
    const catBrandNorm = normalize(cat.brand);

    let best: { item: NormalizedFeedItem; score: number; reasons: string[] } | null = null;

    for (const item of feedItems) {
      const feedBrandNorm = normalize(item.brand);
      const brandMatches =
        feedBrandNorm === catBrandNorm || (brandAliasFeedToCatalog[feedBrandNorm] ?? []).includes(catBrandNorm);
      if (!brandMatches) continue;

      const ourCats = mapFeedCategory(item.productType);
      if (!ourCats.includes(cat.category)) continue;

      const feedTokenSet = new Set(tokenize(item.title));
      if (!catTokens.every((t) => feedTokenSet.has(t))) continue;

      const { score, reasons } = scoreCandidate(cat, item, catTokenSet);
      if (!best || score > best.score) best = { item, score, reasons };
    }

    if (best) {
      results.push({
        catalogSlug: cat.slug,
        catalogNavn: cat.navn,
        feedTitle: best.item.title,
        feedGtin: best.item.gtin,
        confidence: best.score,
        reasons: best.reasons,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}
