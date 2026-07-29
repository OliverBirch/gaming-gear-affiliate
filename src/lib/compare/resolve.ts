import { getMouse, mice } from "@/data/mice";
import type { Mouse } from "@/lib/types";
import { COMPARE_MAX } from "./types";

/** Parse `?p=slug-a,slug-b` into up to COMPARE_MAX distinct valid mouse slugs (order preserved). */
export function parseCompareSlugs(raw: string | string[] | undefined): string[] {
  if (raw == null) return [];
  const str = Array.isArray(raw) ? raw.join(",") : raw;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of str.split(",")) {
    const slug = part.trim();
    if (!slug || seen.has(slug)) continue;
    if (!getMouse(slug)) continue;
    seen.add(slug);
    out.push(slug);
    if (out.length >= COMPARE_MAX) break;
  }
  return out;
}

export function resolveCompareMice(slugs: string[]): Mouse[] {
  return slugs
    .map((s) => getMouse(s))
    .filter((m): m is Mouse => m != null)
    .slice(0, COMPARE_MAX);
}

export function buildCompareUrl(slugs: string[]): string {
  const valid = parseCompareSlugs(slugs.join(","));
  if (valid.length === 0) return "/sammenlign/mus";
  return `/sammenlign/mus?p=${valid.join(",")}`;
}

/** Options for pickers: all mice sorted by pro popularity. */
export function mousePickerOptions(): { slug: string; navn: string }[] {
  return [...mice]
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .map((m) => ({ slug: m.slug, navn: m.navn }));
}
