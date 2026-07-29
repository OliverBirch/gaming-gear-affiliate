import type { Headset, AffiliateOffer } from "@/lib/types";
import { HeadsetSchema } from "@/lib/types";
import raw from "./headsets.json";
import { getHeadsetProSlugs } from "./pros-peripherals-mapping";

const SEARCH_URLS: Record<string, string> = {
  maxgaming: "https://www.maxgaming.dk/dk/computertilbehor/headset-lyd/gaming-headset",
  proshop: "https://www.proshop.dk/Headset",
  computersalg: "https://www.computersalg.dk/headset",
  elgiganten: "https://www.elgiganten.dk/computertilbehoer/headset",
  ultrashop: "https://www.ultrashop.dk/da/headsets-gaming",
};

const PAYOUT_MAP: Record<string, number> = {
  maxgaming: 4.0,
  elgiganten: 2.5,
  ultrashop: 3.0,
};

function buildOffers(
  slug: string,
  priser: Record<string, number> | null,
  urls?: Record<string, string>
): AffiliateOffer[] {
  if (!priser) return [];
  const offers: AffiliateOffer[] = [];
  for (const [retailer, pris] of Object.entries(priser)) {
    if (typeof pris !== "number") continue;
    if (!["maxgaming", "proshop", "computersalg", "elgiganten", "ultrashop"].includes(retailer)) continue;
    offers.push({
      retailer: retailer as AffiliateOffer["retailer"],
      produktUrl: urls?.[retailer] ?? SEARCH_URLS[retailer] ?? `https://www.maxgaming.dk/dk/search/${encodeURIComponent(slug)}`,
      prisDkk: pris,
      payoutPct: PAYOUT_MAP[retailer] ?? 3.5,
      inStock: true,
    });
  }
  if (offers.length === 0) {
    offers.push({
      retailer: "maxgaming",
      produktUrl: SEARCH_URLS.maxgaming,
      payoutPct: 4.0,
      inStock: false,
    });
  }
  return offers;
}

const _builtHeadsets: Headset[] = raw.headsets.map((h: any) => ({
  slug: h.slug,
  navn: h.navn,
  brand: h.brand,
  wireless: h.wireless,
  forbindelse: h.forbindelse,
  batteritidTimer: h.batteritidTimer ?? null,
  vaegtGram: h.vaegtGram,
  driverStoerrelseMm: h.driverStoerrelseMm ?? null,
  mikrofon: h.mikrofon,
  aftagelig: h.aftagelig ?? null,
  surroundSound: h.surroundSound,
  prisNiveau: h.prisNiveau,
  billede: h.billede ?? null,
  offers: buildOffers(h.slug, h.priser ?? null, (h as any).urls ?? undefined),
  beskrivelse: h.beskrivelse,
  fordele: h.fordele,
  ulemper: h.ulemper,
  kilde: h.udstyrskilde ?? "spillerens-valg",
  sidstVerificeret: h.sidstOpdateret ?? "2026-07-22",
  proBrugere: getHeadsetProSlugs(h.slug),
}));

for (const h of _builtHeadsets) HeadsetSchema.parse(h);

export const headsets: Headset[] = _builtHeadsets;

export function getHeadset(slug: string): Headset | undefined {
  return headsets.find((h) => h.slug === slug);
}
