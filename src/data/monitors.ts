import type { Monitor, AffiliateOffer } from "@/lib/types";
import { MonitorSchema } from "@/lib/types";
import raw from "./monitors.json";

const SEARCH_URLS: Record<string, string> = {
  maxgaming: "https://www.maxgaming.dk/dk/computertilbehor/skaerme",
  proshop: "https://www.proshop.dk/Skaerm",
  computersalg: "https://www.computersalg.dk/skaerm",
  elgiganten: "https://www.elgiganten.dk/computere-tilbehoer/skaerm",
};

function buildOffers(
  slug: string,
  priser: Record<string, number> | null
): AffiliateOffer[] {
  if (!priser) return [];
  const offers: AffiliateOffer[] = [];
  for (const [retailer, pris] of Object.entries(priser)) {
    if (typeof pris !== "number") continue;
    if (!["maxgaming", "proshop", "computersalg", "elgiganten"].includes(retailer)) continue;
    offers.push({
      retailer: retailer as AffiliateOffer["retailer"],
      produktUrl: SEARCH_URLS[retailer] ?? `https://www.maxgaming.dk/dk/search/${encodeURIComponent(slug)}`,
      prisDkk: pris,
      payoutPct: retailer === "maxgaming" ? 4.0 : 3.5,
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

const _builtMonitors: Monitor[] = raw.monitors.map((m: any) => ({
  slug: m.slug,
  navn: m.navn,
  brand: m.brand,
  stoerrelseTommer: m.stoerrelseTommer,
  oploesning: m.oploesning,
  opdateringsHz: m.opdateringsHz,
  paneltype: m.paneltype,
  responstidMs: m.responstidMs ?? null,
  adaptiveSync: m.adaptiveSync,
  buet: m.buet,
  prisNiveau: m.prisNiveau,
  billede: m.billede ?? null,
  offers: buildOffers(m.slug, m.priser ?? null),
  beskrivelse: m.beskrivelse,
  fordele: m.fordele,
  ulemper: m.ulemper,
  kilde: m.udstyrskilde ?? "spillerens-valg",
  sidstVerificeret: m.sidstOpdateret ?? "2026-07-22",
}));

for (const m of _builtMonitors) MonitorSchema.parse(m);

export const monitors: Monitor[] = _builtMonitors;

export function getMonitor(slug: string): Monitor | undefined {
  return monitors.find((m) => m.slug === slug);
}
