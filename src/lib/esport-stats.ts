import type { Mouse, Pro, Mousepad } from "@/lib/types";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import {
  getKeyboardSlug,
  getMousepadSlug,
  getHeadsetSlug,
  getMonitorSlug,
} from "@/data/pros-peripherals-mapping";

type PrisNiveau = "budget" | "mid" | "flagship";

interface TierMouseCount {
  slug: string;
  navn: string;
  count: number;
  pct: number;
}

interface TierStats {
  niveau: PrisNiveau;
  label: string;
  pros: number;
  totalPros: number;
  topMice: TierMouseCount[];
}

export interface EsportMouseStats {
  tierStats: TierStats[];
  localPopularMice: Mouse[];
}

export interface ShareSegment {
  slug: string;
  navn: string;
  count: number;
  pct: number;
}

export interface GearTopItem {
  slug: string;
  navn: string;
  brand: string;
  pros: number;
  href: string;
}

const TIER_LABELS: Record<PrisNiveau, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

const TIERS: PrisNiveau[] = ["budget", "mid", "flagship"];

export function computeEsportMouseStats(esportPros: Pro[]): EsportMouseStats {
  const localCounts = new Map<string, number>();
  for (const p of esportPros) {
    if (!p.musSlug) continue;
    localCounts.set(p.musSlug, (localCounts.get(p.musSlug) ?? 0) + 1);
  }

  const tierMice: Record<PrisNiveau, Map<string, number>> = {
    budget: new Map(),
    mid: new Map(),
    flagship: new Map(),
  };
  const tierProCounts: Record<PrisNiveau, number> = {
    budget: 0,
    mid: 0,
    flagship: 0,
  };

  for (const p of esportPros) {
    if (!p.musSlug) continue;
    const mouse = mice.find((m) => m.slug === p.musSlug);
    if (!mouse) continue;
    const tier = mouse.prisNiveau;
    tierMice[tier].set(p.musSlug, (tierMice[tier].get(p.musSlug) ?? 0) + 1);
    tierProCounts[tier]++;
  }

  const tierStats: TierStats[] = TIERS.map((niveau) => {
    const total = tierProCounts[niveau];
    const entries = Array.from(tierMice[niveau].entries())
      .map(([slug, count]) => {
        const mouse = mice.find((m) => m.slug === slug)!;
        return {
          slug,
          navn: mouse.navn,
          count,
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      niveau,
      label: TIER_LABELS[niveau],
      pros: total,
      totalPros: esportPros.length,
      topMice: entries,
    };
  });

  const uniqueSlugs = [...new Set(esportPros.map((p) => p.musSlug).filter(Boolean) as string[])];
  const localPopularMice = uniqueSlugs
    .map((slug) => mice.find((m) => m.slug === slug))
    .filter((m): m is Mouse => m != null)
    .sort((a, b) => (localCounts.get(b.slug) ?? 0) - (localCounts.get(a.slug) ?? 0))
    .slice(0, 3);

  return { tierStats, localPopularMice };
}

const SHARE_LIMIT = 8;

export function buildShareSegments(esportPros: Pro[]): {
  segments: ShareSegment[];
  uniqueCount: number;
  totalPros: number;
} {
  const counts = new Map<string, number>();
  for (const p of esportPros) {
    if (!p.musSlug) continue;
    counts.set(p.musSlug, (counts.get(p.musSlug) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries())
    .map(([slug, count]) => {
      const mouse = mice.find((m) => m.slug === slug);
      return { slug, navn: mouse?.navn ?? slug, count };
    })
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = esportPros.length;
  const top = sorted.slice(0, SHARE_LIMIT);
  const other = sorted.slice(SHARE_LIMIT);
  const otherCount = other.reduce((s, m) => s + m.count, 0);

  const segments: ShareSegment[] = top.map((m) => ({
    slug: m.slug,
    navn: m.navn,
    count: m.count,
    pct: Math.round((m.count / total) * 100),
  }));

  if (otherCount > 0) {
    segments.push({
      slug: "__andre__",
      navn: "Andre",
      count: otherCount,
      pct: Math.round((otherCount / total) * 100),
    });
  }

  return { segments, uniqueCount: sorted.length, totalPros: total };
}

function countBySlug<T>(
  esportPros: Pro[],
  getSlug: (proSlug: string) => string | undefined,
  catalog: T[],
  getItemSlug: (item: T) => string,
  getItemBrand: (item: T) => string,
  getItemDisplay: (item: T) => string,
  hrefPrefix: string
): GearTopItem[] {
  const counts = new Map<string, number>();
  for (const p of esportPros) {
    const slug = getSlug(p.slug);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([slug, count]) => {
      const item = catalog.find((i) => getItemSlug(i) === slug);
      if (!item) return null;
      return {
        slug,
        navn: getItemDisplay(item),
        brand: getItemBrand(item),
        pros: count,
        href: `${hrefPrefix}/${slug}`,
      };
    })
    .filter((x): x is GearTopItem => x != null)
    .sort((a, b) => b.pros - a.pros)
    .slice(0, 3);
}

export function getTopKeyboards(
  esportPros: Pro[]
): GearTopItem[] {
  return countBySlug(
    esportPros,
    getKeyboardSlug,
    keyboards,
    (k) => k.slug,
    (k) => k.brand,
    (k) => k.navn,
    "/tastaturer"
  );
}

export function getTopMousepads(
  esportPros: Pro[]
): GearTopItem[] {
  return countBySlug(
    esportPros,
    getMousepadSlug,
    mousepads,
    (p) => p.slug,
    (p) => p.brand,
    (p) => p.model,
    "/musemaatter"
  );
}

export function getTopMonitors(
  esportPros: Pro[]
): GearTopItem[] {
  return countBySlug(
    esportPros,
    getMonitorSlug,
    monitors,
    (m) => m.slug,
    (m) => m.brand,
    (m) => m.navn,
    "/skaerme"
  );
}

export function getTopHeadsets(
  esportPros: Pro[]
): GearTopItem[] {
  return countBySlug(
    esportPros,
    getHeadsetSlug,
    headsets,
    (h) => h.slug,
    (h) => h.brand,
    (h) => h.navn,
    "/headset"
  );
}
