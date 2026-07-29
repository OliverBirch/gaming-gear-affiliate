import type { Pro } from "@/lib/types";
import type { ShareSegment } from "@/lib/esport-stats";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { headsets } from "@/data/headsets";
import {
  getKeyboardSlug,
  getMousepadSlug,
  getHeadsetSlug,
} from "@/data/pros-peripherals-mapping";

export interface CategoryTopProduct {
  slug: string;
  navn: string;
  brand: string;
  billede?: string | null;
  proCount: number;
  sharePct: number;
}

export interface CategoryStatsSet {
  segments: ShareSegment[];
  uniqueCount: number;
  totalPros: number;
  topProducts: CategoryTopProduct[];
}

function buildStats(
  filteredPros: Pro[],
  getSlug: (proSlug: string) => string | undefined,
  getProduct: (slug: string) => { navn: string; brand: string; billede?: string | null } | undefined,
): CategoryStatsSet {
  const counts = new Map<string, number>();
  for (const p of filteredPros) {
    const slug = getSlug(p.slug);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries())
    .map(([slug, count]) => ({ slug, count, product: getProduct(slug) }))
    .filter((x): x is typeof x & { product: NonNullable<typeof x.product> } => x.product != null)
    .sort((a, b) => b.count - a.count);

  const total = filteredPros.filter((p) => getSlug(p.slug) != null).length;

  const top8 = sorted.slice(0, 8);
  const others = sorted.slice(8);
  const otherCount = others.reduce((s, m) => s + m.count, 0);

  const segments: ShareSegment[] = top8.map((m) => ({
    slug: m.slug,
    navn: m.product.navn,
    count: m.count,
    pct: total > 0 ? Math.round((m.count / total) * 100) : 0,
  }));

  if (otherCount > 0) {
    segments.push({
      slug: "__andre__",
      navn: "Andre",
      count: otherCount,
      pct: Math.round((otherCount / total) * 100),
    });
  }

  const topProducts: CategoryTopProduct[] = sorted.slice(0, 3).map((m) => ({
    slug: m.slug,
    navn: m.product.navn,
    brand: m.product.brand,
    billede: m.product.billede,
    proCount: m.count,
    sharePct: total > 0 ? Math.round((m.count / total) * 100) : 0,
  }));

  return { segments, uniqueCount: sorted.length, totalPros: total, topProducts };
}

function forAllEsports(fn: (pros: Pro[]) => CategoryStatsSet): Record<string, CategoryStatsSet> {
  return {
    alle: fn(pros),
    cs2: fn(pros.filter((p) => p.esport === "cs2")),
    valorant: fn(pros.filter((p) => p.esport === "valorant")),
    r6: fn(pros.filter((p) => p.esport === "r6")),
  };
}

export function computeMusStats(): Record<string, CategoryStatsSet> {
  return forAllEsports((filtered) =>
    buildStats(
      filtered,
      (slug) => pros.find((p) => p.slug === slug)?.musSlug,
      (slug) => mice.find((m) => m.slug === slug),
    ),
  );
}

export function computeKeyboardStats(): Record<string, CategoryStatsSet> {
  return forAllEsports((filtered) =>
    buildStats(filtered, getKeyboardSlug, (slug) => keyboards.find((k) => k.slug === slug)),
  );
}

export function computeMousepadStats(): Record<string, CategoryStatsSet> {
  return forAllEsports((filtered) =>
    buildStats(filtered, getMousepadSlug, (slug) => {
      const mp = mousepads.find((p) => p.slug === slug);
      if (!mp) return undefined;
      return { navn: `${mp.brand} ${mp.model}`, brand: mp.brand, billede: mp.billede };
    }),
  );
}

export function computeHeadsetStats(): Record<string, CategoryStatsSet> {
  return forAllEsports((filtered) =>
    buildStats(filtered, getHeadsetSlug, (slug) => headsets.find((h) => h.slug === slug)),
  );
}
