import type { CatalogItem, Diagnostic } from "./types";
import type { MatchRunResult } from "./matcher";

/**
 * Reconciles one matcher pass into a final per-slug reason for every catalog
 * item that didn't match this run - a stored reason instead of the silent
 * `continue` the original scripts.match-*-eans.mjs scripts had. Priority,
 * most to least specific:
 *   1. a recorded near-miss (a real token-level comparison happened)
 *   2. brand+category candidates existed, but nothing got far enough to be
 *      a near-miss (title too short, etc.)
 *   3. brand appeared, but never under a category mapped to this item
 *   4. brand never appeared in the feed at all
 */
export function buildDiagnostics(catalog: CatalogItem[], run: MatchRunResult): Map<string, Diagnostic> {
  const diagnostics = new Map<string, Diagnostic>();

  for (const cat of catalog) {
    if (run.matches.has(cat.slug)) continue;

    const nearMiss = run.nearMiss.get(cat.slug);
    if (nearMiss) {
      diagnostics.set(cat.slug, nearMiss);
    } else if (run.categorySeen.has(cat.slug)) {
      diagnostics.set(cat.slug, { reason: "not-in-feed" });
    } else if (run.brandSeen.has(cat.slug)) {
      diagnostics.set(cat.slug, { reason: "category-unmapped" });
    } else {
      diagnostics.set(cat.slug, { reason: "brand-not-found" });
    }
  }

  return diagnostics;
}
