import type { Monitor } from "@/lib/types";
import { MonitorSchema } from "@/lib/types";
import { buildFlatOffers, type BuildOffersConfig } from "./build-offers";
import raw from "./monitors.json";
import { getMonitorProSlugs } from "./pros-peripherals-mapping";

/**
 * Shape of a row in monitors.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and MonitorSchema.parse below is
 * what actually guarantees the narrower types at build time.
 */
type RawMonitor = {
  slug: string;
  ean?: string;
  navn: string;
  brand: string;
  stoerrelseTommer: number;
  oploesning: string;
  opdateringsHz: number;
  paneltype: Monitor["paneltype"];
  responstidMs?: number | null;
  adaptiveSync: Monitor["adaptiveSync"];
  buet: boolean;
  prisNiveau: Monitor["prisNiveau"];
  billede?: string | null;
  priser?: Record<string, number | null | undefined> | null;
  beskrivelse: string;
  fordele: string[];
  ulemper: string[];
  udstyrskilde?: string | null;
  sidstOpdateret?: string | null;
};

const SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Skaerm",
};

const OFFER_CONFIG: BuildOffersConfig = {
  searchUrls: SEARCH_URLS,
  allowedRetailers: ["proshop"],
  payoutPct: {},
  defaultPayoutPct: 3.5,
};

const _builtMonitors: Monitor[] = (raw.monitors as RawMonitor[]).map((m) => ({
  slug: m.slug,
  ean: m.ean ?? null,
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
  offers: buildFlatOffers(m.priser ?? null, OFFER_CONFIG),
  beskrivelse: m.beskrivelse,
  fordele: m.fordele,
  ulemper: m.ulemper,
  proBrugere: getMonitorProSlugs(m.slug),
  kilde: m.udstyrskilde ?? null,
  sidstVerificeret: m.sidstOpdateret ?? null,
}));

for (const m of _builtMonitors) MonitorSchema.parse(m);

export const monitors: Monitor[] = _builtMonitors;

export function getMonitor(slug: string): Monitor | undefined {
  return monitors.find((m) => m.slug === slug);
}
