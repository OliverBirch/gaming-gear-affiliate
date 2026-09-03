import type { Mousepad, AffiliateOffer } from "@/lib/types";
import { MousepadSchema } from "@/lib/types";
import raw from "./mousepads.json";
import { getMousepadProSlugs } from "./pros-peripherals-mapping";

/**
 * Shape of a row in mousepads.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and MousepadSchema.parse below is
 * what actually guarantees the narrower types at build time. Note `priser` is
 * nested per size variant, unlike the flat maps headsets/monitors use.
 */
type RawMousepadSize = {
  navn: string;
  breddeMm: number;
  laengdeMm: number;
  tykkelseMm: number;
};

type RawMousepad = {
  slug: string;
  ean?: string;
  brand: string;
  model: string;
  variant?: string | null;
  type: string;
  materiale: string;
  størrelser: RawMousepadSize[];
  bund: string;
  vaskbar: boolean;
  billede?: string | null;
  prisNiveau: Mousepad["prisNiveau"];
  priser?: Record<string, number | Record<string, number> | null> | null;
  /**
   * Individually-authored per-product offers, additive to `priser`'s
   * generic category-page offers — for a retailer whose feed gives a real
   * per-product tracking link (see headsets.ts for the pattern this
   * mirrors, and feed-sync/apply.ts which writes into this field).
   */
  offers?: AffiliateOffer[];
  beskrivelse: string;
  fordele: string[];
  ulemper: string[];
  udstyrskilde?: string | null;
  sidstOpdateret?: string | null;
};

const SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Musemaatte",
  geekd: "https://geekd.dk/collections/musematte",
};

function lowestPrice(priser: Record<string, number | Record<string, number> | null> | null, retailer: string): number | null {
  if (!priser) return null;
  const entry = priser[retailer];
  if (!entry) return null;
  if (typeof entry === "number") return entry;
  if (typeof entry === "object") {
    const vals = Object.values(entry).filter((v): v is number => typeof v === "number");
    return vals.length > 0 ? Math.min(...vals) : null;
  }
  return null;
}

function buildOffers(
  priser: Record<string, number | Record<string, number> | null> | null
): AffiliateOffer[] {
  if (!priser) return [];
  const offers: AffiliateOffer[] = [];
  for (const retailer of Object.keys(priser)) {
    const pris = lowestPrice(priser, retailer);
    if (pris === null) continue;
    if (!["proshop", "geekd"].includes(retailer)) continue;
    const searchUrl = SEARCH_URLS[retailer];
    if (!searchUrl) continue;
    offers.push({
      retailer: retailer as AffiliateOffer["retailer"],
      produktUrl: searchUrl,
      prisDkk: pris,
      payoutPct: retailer === "geekd" ? 4.0 : 3.5,
      inStock: true,
    });
  }
  // No verified retailer carries this product: show no offer rather than a
  // synthetic "see price at X" link to a retailer that isn't actually priced.
  return offers;
}

const TYPE_MAP: Record<string, "speed" | "control" | "hybrid"> = {
  speed: "speed",
  control: "control",
  balanced: "hybrid",
};

const _builtPads: Mousepad[] = (raw.mousepads as unknown as RawMousepad[]).map((m) => ({
  slug: m.slug,
  ean: m.ean ?? null,
  brand: m.brand,
  model: m.model,
  variant: m.variant ?? null,
  type: TYPE_MAP[m.type] ?? "hybrid",
  materiale: m.materiale,
  størrelser: m.størrelser.map((s) => ({
    navn: s.navn,
    breddeMm: s.breddeMm,
    laengdeMm: s.laengdeMm,
    tykkelseMm: s.tykkelseMm,
  })),
  bund: m.bund,
  vaskbar: m.vaskbar,
  billede: m.billede ?? null,
  prisNiveau: m.prisNiveau,
  offers: [...buildOffers(m.priser ?? null), ...(m.offers ?? [])],
  beskrivelse: m.beskrivelse,
  fordele: m.fordele,
  ulemper: m.ulemper,
  kilde: m.udstyrskilde ?? null,
  sidstVerificeret: m.sidstOpdateret ?? null,
  proBrugere: getMousepadProSlugs(m.slug),
}));

for (const p of _builtPads) MousepadSchema.parse(p);

export const mousepads: Mousepad[] = _builtPads;

export function getMousepad(slug: string): Mousepad | undefined {
  return mousepads.find((m) => m.slug === slug);
}
