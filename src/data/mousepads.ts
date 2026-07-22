import type { Mousepad, AffiliateOffer } from "@/lib/types";
import raw from "./mousepads.json";
import { getMousepadProSlugs } from "./pros-peripherals-mapping";

const SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Musemaatte",
  maxgaming: "https://www.maxgaming.dk/da/tilbehoer/musemaatter",
  computersalg: "https://www.computersalg.dk/musemaatter",
  coolshop: "https://www.coolshop.dk/musemaatter",
};

function lowestPrice(priser: Record<string, number | Record<string, number>> | null, retailer: string): number | null {
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
  slug: string,
  priser: Record<string, Record<string, number>> | null
): AffiliateOffer[] {
  if (!priser) return [];
  const offers: AffiliateOffer[] = [];
  for (const retailer of Object.keys(priser)) {
    const pris = lowestPrice(priser as any, retailer);
    if (pris === null) continue;
    if (!["proshop", "maxgaming", "computersalg", "coolshop"].includes(retailer)) continue;
    const searchUrl = SEARCH_URLS[retailer] ?? `https://www.amazon.com/s?k=${encodeURIComponent(slug)}`;
    offers.push({
      retailer: retailer as AffiliateOffer["retailer"],
      produktUrl: searchUrl,
      prisDkk: pris,
      payoutPct: retailer === "maxgaming" ? 4.0 : 3.5,
      inStock: true,
    });
  }
  if (offers.length === 0) {
    offers.push({
      retailer: "maxgaming",
      produktUrl: `https://www.maxgaming.dk/da/tilbehoer/musemaatter`,
      payoutPct: 4.0,
      inStock: false,
    });
  }
  return offers;
}

const TYPE_MAP: Record<string, "speed" | "control" | "hybrid"> = {
  speed: "speed",
  control: "control",
  balanced: "hybrid",
};

export const mousepads: Mousepad[] = raw.mousepads.map((m: any) => ({
  slug: m.slug,
  brand: m.brand,
  model: m.model,
  variant: m.variant ?? null,
  type: TYPE_MAP[m.type] ?? "hybrid",
  materiale: m.materiale,
  størrelser: m.størrelser.map((s: any) => ({
    navn: s.navn,
    breddeMm: s.breddeMm,
    laengdeMm: s.laengdeMm,
    tykkelseMm: s.tykkelseMm,
  })),
  bund: m.bund,
  vaskbar: m.vaskbar,
  billede: m.billede ?? null,
  prisNiveau: m.prisNiveau,
  offers: buildOffers(m.slug, m.priser),
  beskrivelse: m.beskrivelse,
  fordele: m.fordele,
  ulemper: m.ulemper,
  kilde: m.udstyrskilde ?? "spillerens-valg",
  sidstVerificeret: m.sidstOpdateret ?? "2026-07-22",
  proBrugere: getMousepadProSlugs(m.slug),
}));

export function getMousepad(slug: string): Mousepad | undefined {
  return mousepads.find((m) => m.slug === slug);
}
