import type { Mouse } from "@/lib/types";

export const STALE_DAYS = 90;

export interface DashboardIssue {
  type: string;
  severity: "high" | "medium" | "low";
  autoFixable: boolean;
  slug: string;
  label: string;
  file: string;
  context: Record<string, unknown>;
}

export interface HealthReport {
  generatedAt: string;
  summary: {
    totalIssues: number;
    high: number;
    medium: number;
    low: number;
    autoFixable: number;
  };
  issues: DashboardIssue[];
}

export function daysAgo(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function dateLabel(days: number): string {
  if (days === 0) return "i dag";
  if (days === 1) return "1 dag siden";
  return `${days} dage siden`;
}

/** Helper: a stub mouse has no offers, no description, no fordele, zero weight/specs */
export function isStubMouse(m: Mouse): boolean {
  return (
    m.offers.length === 0 &&
    (!m.beskrivelse || m.beskrivelse.length < 10) &&
    m.fordele.length === 0 &&
    m.vaegtGram === 0
  );
}

// ─── Pro staleness ────────────────────────────────────────────────

export function checkStalePros(
  pros: Array<{ slug: string; navn: string; esport: string; sidstVerificeret: string }>
): DashboardIssue[] {
  const issues: DashboardIssue[] = [];
  for (const p of pros) {
    const age = daysAgo(p.sidstVerificeret);
    if (age <= STALE_DAYS) continue;
    const sev = age > 180 ? "high" : age > 120 ? "medium" : "low";
    issues.push({
      type: "stale-pro",
      severity: sev,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — ${dateLabel(age)}`,
      file: "src/data/pros.ts",
      context: {
        esport: p.esport,
        ageDays: age,
        sourceUrl: `https://prosettings.net/players/${p.slug}/`,
      },
    });
  }
  return issues;
}

// ─── Mouse offers / URLs ──────────────────────────────────────────

export function checkNoOffers(mice: Mouse[]): DashboardIssue[] {
  return mice
    .filter((m) => m.offers.length === 0)
    .map((m) => ({
      type: "no-offers" as const,
      severity: "high" as const,
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen tilbud`,
      file: "src/data/mice.json",
      context: { brand: m.brand },
    }));
}

// ─── Price coverage ───────────────────────────────────────────────

export function computePriceCoverage(
  mice: Mouse[],
  pricedKeys: Set<string>
): { pct: number; covered: number; total: number } {
  let total = 0;
  let covered = 0;
  for (const m of mice) {
    for (const o of m.offers) {
      total++;
      if (pricedKeys.has(`${m.slug}__${o.retailer}`)) covered++;
    }
  }
  return {
    covered,
    total,
    pct: total > 0 ? Math.round((covered / total) * 100) : 0,
  };
}

export function checkMissingPrices(
  mice: Mouse[],
  pricedKeys: Set<string>
): DashboardIssue[] {
  return mice
    .filter(
      (m) =>
        m.offers.length > 0 &&
        !m.offers.some((o) => pricedKeys.has(`${m.slug}__${o.retailer}`))
    )
    .map((m) => ({
      type: "missing-price" as const,
      severity: "medium" as const,
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen pris-data`,
      file: "src/data/mice.json",
      context: { retailers: m.offers.map((o) => o.retailer) },
    }));
}

// ─── Product images ───────────────────────────────────────────────

/**
 * Root-relative paths (`/images/pros/x.png`) that actually exist under
 * `public/`. Passed in rather than read here so these checks stay pure and
 * testable — the caller (`/admin`, SSG) walks the filesystem at build time.
 */
export type ExistingImagePaths = ReadonlySet<string>;

/**
 * A `billede` that's set but points at a file that isn't there is worse than
 * no `billede` at all: the missing-image checks read it as covered while the
 * page silently falls back to a monogram. That exact mismatch has bitten this
 * catalog before (a pro image saved as `.webp` while the data said `.png`),
 * so it gets its own issue type instead of passing as healthy.
 */
function imageIssues<T extends { slug: string; navn: string; billede?: string | null }>(
  items: T[],
  existing: ExistingImagePaths | undefined,
  onMissing: (item: T) => DashboardIssue,
  onBroken: (item: T, path: string) => DashboardIssue
): DashboardIssue[] {
  const out: DashboardIssue[] = [];
  for (const item of items) {
    if (!item.billede) {
      out.push(onMissing(item));
      continue;
    }
    // Only local assets are checkable; a remote URL can't be resolved here.
    if (existing && item.billede.startsWith("/") && !existing.has(item.billede)) {
      out.push(onBroken(item, item.billede));
    }
  }
  return out;
}

export function checkMissingImages(
  products: Array<{ slug: string; navn: string; billede?: string | null }>,
  category: string,
  existingImagePaths?: ExistingImagePaths
): DashboardIssue[] {
  return imageIssues(
    products,
    existingImagePaths,
    (p) => ({
      type: "missing-image" as const,
      severity: "low" as const,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — intet billede`,
      file: `src/data/${category}.json`,
      context: {},
    }),
    (p, path) => ({
      type: "broken-image" as const,
      severity: "medium" as const,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — billedsti findes ikke: ${path}`,
      file: `src/data/${category}.json`,
      context: { path },
    })
  );
}

export function checkMissingImagesMice(
  mice: Mouse[],
  existingImagePaths?: ExistingImagePaths
): DashboardIssue[] {
  return checkMissingImages(mice, "mice", existingImagePaths);
}

export function checkMissingImagesPros(
  pros: Array<{ slug: string; navn: string; billede?: string }>,
  existingImagePaths?: ExistingImagePaths
): DashboardIssue[] {
  return imageIssues(
    pros,
    existingImagePaths,
    (p) => ({
      type: "missing-pro-image" as const,
      severity: "low" as const,
      autoFixable: true,
      slug: p.slug,
      label: `${p.navn} — intet billede`,
      file: "src/data/pros.ts",
      context: { sourceUrl: `https://prosettings.net/players/${p.slug}/` },
    }),
    (p, path) => ({
      type: "broken-pro-image" as const,
      severity: "medium" as const,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — billedsti findes ikke: ${path}`,
      file: "src/data/pros.ts",
      context: { path, sourceUrl: `https://prosettings.net/players/${p.slug}/` },
    })
  );
}

// ─── Content quality ──────────────────────────────────────────────

export function checkEmptyCopyMice(mice: Mouse[]): DashboardIssue[] {
  const issues: DashboardIssue[] = [];
  for (const m of mice) {
    if (!m.beskrivelse || m.beskrivelse.length < 10) {
      issues.push({
        type: "empty-description",
        severity: "medium",
        autoFixable: false,
        slug: m.slug,
        label: `${m.navn} — tom beskrivelse`,
        file: "src/data/mice.json",
        context: { brand: m.brand },
      });
    }
    if (m.fordele.length === 0) {
      issues.push({
        type: "empty-fordele",
        severity: "medium",
        autoFixable: false,
        slug: m.slug,
        label: `${m.navn} — ingen fordele`,
        file: "src/data/mice.json",
        context: { brand: m.brand },
      });
    }
    if (m.ulemper.length === 0) {
      issues.push({
        type: "empty-ulemper",
        severity: "medium",
        autoFixable: false,
        slug: m.slug,
        label: `${m.navn} — ingen ulemper`,
        file: "src/data/mice.json",
        context: { brand: m.brand },
      });
    }
  }
  return issues;
}

// ─── Orphaned / peripheral coverage ───────────────────────────────

export function checkOrphanedMice(
  pros: Array<{ slug: string; musSlug: string }>,
  mouseSlugs: Set<string>
): DashboardIssue[] {
  return [...new Set(pros.map((p) => p.musSlug))]
    .filter((s) => !mouseSlugs.has(s))
    .map((musSlug) => {
      const usedBy = pros.filter((p) => p.musSlug === musSlug).map((p) => p.slug);
      return {
        type: "orphaned-mus" as const,
        severity: "high" as const,
        autoFixable: false,
        slug: musSlug,
        label: `${musSlug} — mus findes ikke i kataloget`,
        file: "src/data/mice.json",
        context: { usedBy },
      };
    });
}

export function checkMissingPeripherals(
  pros: Array<{ slug: string; navn: string; esport: string; sidstVerificeret: string }>,
  peripheralKeys: Set<string>,
  maxDisplay = 50
): DashboardIssue[] {
  const issues: DashboardIssue[] = [];
  const missing = pros.filter((p) => !peripheralKeys.has(p.slug));
  for (const p of missing.slice(0, maxDisplay)) {
    issues.push({
      type: "missing-peripherals",
      severity: "low",
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — ingen periferi-data`,
      file: "src/data/pros-peripherals.json",
      context: {
        esport: p.esport,
        sourceUrl: `https://prosettings.net/players/${p.slug}/`,
      },
    });
  }
  if (missing.length > maxDisplay) {
    issues.push({
      type: "missing-peripherals-truncated",
      severity: "low",
      autoFixable: false,
      slug: "…",
      label: `+${missing.length - maxDisplay} flere pros uden periferi-data`,
      file: "src/data/pros-peripherals.json",
      context: { total: missing.length },
    });
  }
  return issues;
}

// ─── Stub mice ────────────────────────────────────────────────────

export function checkStubMice(mice: Mouse[]): DashboardIssue[] {
  return mice
    .filter(isStubMouse)
    .map((m) => ({
      type: "stub-mouse" as const,
      severity: "high" as const,
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — stub (mangler specs, copy og tilbud)`,
      file: "src/data/mice.json",
      context: { brand: m.brand, vaegtGram: m.vaegtGram, offers: m.offers.length },
    }));
}

// ─── Unmapped peripherals ─────────────────────────────────────────

export interface UnmappedResult {
  total: number;
  mapped: number;
  pct: number;
  topUnmapped: Array<{ text: string; count: number }>;
}

export function checkUnmappedPeripherals(
  prosPeripherals: Record<string, string | undefined>,
  mappingFn: (text: string) => string | undefined
): UnmappedResult {
  const textCounts = new Map<string, number>();
  let total = 0;
  let mapped = 0;

  for (const value of Object.values(prosPeripherals)) {
    if (!value || typeof value !== "string") continue;
    total++;
    const slug = mappingFn(value);
    if (slug) {
      mapped++;
    } else {
      textCounts.set(value, (textCounts.get(value) ?? 0) + 1);
    }
  }

  const topUnmapped = [...textCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([text, count]) => ({ text, count }));

  return {
    total,
    mapped,
    pct: total > 0 ? Math.round((mapped / total) * 100) : 0,
    topUnmapped,
  };
}

// ─── Feed age ─────────────────────────────────────────────────────

export function checkFeedAge(
  scrapedAt: string,
  maxDays = 7
): { ageDays: number; stale: boolean } {
  const ageDays = daysAgo(scrapedAt);
  return { ageDays, stale: ageDays > maxDays };
}

// ─── Priority stale pros (sorted by age) ──────────────────────────

export function getStaleProsByAge(
  pros: Array<{ slug: string; navn: string; esport: string; sidstVerificeret: string }>
): Array<{
  slug: string;
  navn: string;
  esport: string;
  ageDays: number;
  sidstVerificeret: string;
}> {
  return pros
    .map((p) => ({ ...p, ageDays: daysAgo(p.sidstVerificeret) }))
    .filter((p) => p.ageDays > STALE_DAYS)
    .sort((a, b) => b.ageDays - a.ageDays);
}

// ─── Average pro age by esport ────────────────────────────────────

export function avgAgeByEsport(
  pros: Array<{ esport: string; sidstVerificeret: string }>
): Record<string, { total: number; count: number }> {
  const map: Record<string, { total: number; count: number }> = {};
  for (const p of pros) {
    if (!map[p.esport]) map[p.esport] = { total: 0, count: 0 };
    map[p.esport].total += daysAgo(p.sidstVerificeret);
    map[p.esport].count++;
  }
  return map;
}

export function esportCounts(
  pros: Array<{ esport: string }>
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of pros) counts[p.esport] = (counts[p.esport] ?? 0) + 1;
  return counts;
}

// ─── Product-level staleness for non-mice categories ──────────────

export function checkProductStaleness(
  products: Array<{ slug: string; navn: string; sidstVerificeret?: string | null }>,
  category: string,
  staleDays = 180
): DashboardIssue[] {
  return products
    .filter((p) => {
      if (!p.sidstVerificeret) return true; // never verified
      return daysAgo(p.sidstVerificeret) > staleDays;
    })
    .map((p) => ({
      type: "product-stale" as const,
      severity: "low" as const,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — ${p.sidstVerificeret ? dateLabel(daysAgo(p.sidstVerificeret)) : "aldrig verificeret"}`,
      file: `src/data/${category}.ts`,
      context: {
        category,
        lastVerified: p.sidstVerificeret ?? null,
        ageDays: p.sidstVerificeret ? daysAgo(p.sidstVerificeret) : null,
      },
    }));
}

// ─── Retailer partnership status ──────────────────────────────────

/** Scans `.offers[]` across every category array, counting live offers per retailer slug. */
export function countOffersByRetailer(
  categories: Array<Array<{ offers: Array<{ retailer: string }> }>>
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const products of categories) {
    for (const p of products) {
      for (const o of p.offers) {
        counts[o.retailer] = (counts[o.retailer] ?? 0) + 1;
      }
    }
  }
  return counts;
}

/**
 * Guards against the MaxGaming/placeholder-retailer failure mode: a retailer
 * with no confirmed feed (harFeed: false) that somehow still has live offers
 * in the catalog. Should always be empty in normal operation - it exists to
 * catch the mistake early if a future retailer gets added to retailers.ts
 * before a real feed backs it.
 */
export function checkRetailerFeedMismatch(
  retailers: Array<{ slug: string; navn: string; harFeed: boolean }>,
  offerCounts: Record<string, number>
): DashboardIssue[] {
  return retailers
    .filter((r) => !r.harFeed && (offerCounts[r.slug] ?? 0) > 0)
    .map((r) => ({
      type: "retailer-unverified-offers",
      severity: "medium",
      autoFixable: false,
      slug: r.slug,
      label: `${r.navn} — ${offerCounts[r.slug]} tilbud uden bekræftet feed`,
      file: "src/data/retailers.ts",
      context: { offerCount: offerCounts[r.slug] },
    }));
}

// ─── Full health report ───────────────────────────────────────────

export function buildHealthReport(issues: DashboardIssue[]): HealthReport {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIssues: issues.length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
      autoFixable: issues.filter((i) => i.autoFixable).length,
    },
    issues,
  };
}
