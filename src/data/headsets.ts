import type { Headset } from "@/lib/types";
import { HeadsetSchema } from "@/lib/types";
import { buildFlatOffers, type BuildOffersConfig } from "./build-offers";
import raw from "./headsets.json";
import { getHeadsetProSlugs } from "./pros-peripherals-mapping";

/**
 * Shape of a row in headsets.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and HeadsetSchema.parse below is
 * what actually guarantees the narrower types at build time.
 */
type RawHeadset = {
  slug: string;
  ean?: string;
  navn: string;
  brand: string;
  wireless: boolean;
  forbindelse: string;
  batteritidTimer?: number | null;
  vaegtGram: number;
  driverStoerrelseMm?: number | null;
  mikrofon: boolean;
  aftagelig?: boolean | null;
  surroundSound: boolean;
  prisNiveau: Headset["prisNiveau"];
  billede?: string | null;
  priser?: Record<string, number | null | undefined> | null;
  beskrivelse: string;
  fordele: string[];
  ulemper: string[];
  udstyrskilde?: string | null;
  sidstOpdateret?: string | null;
};

const SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Headset",
  geekd: "https://geekd.dk/collections/headset",
};

const OFFER_CONFIG: BuildOffersConfig = {
  searchUrls: SEARCH_URLS,
  allowedRetailers: ["proshop", "geekd"],
  payoutPct: { proshop: 3.5, geekd: 4.0 },
  defaultPayoutPct: 3.5,
};

const _builtHeadsets: Headset[] = (raw.headsets as RawHeadset[]).map((h) => ({
  slug: h.slug,
  ean: h.ean ?? null,
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
  offers: buildFlatOffers(h.priser ?? null, OFFER_CONFIG),
  beskrivelse: h.beskrivelse,
  fordele: h.fordele,
  ulemper: h.ulemper,
  kilde: h.udstyrskilde ?? null,
  sidstVerificeret: h.sidstOpdateret ?? null,
  proBrugere: getHeadsetProSlugs(h.slug),
}));

for (const h of _builtHeadsets) HeadsetSchema.parse(h);

export const headsets: Headset[] = _builtHeadsets;

export function getHeadset(slug: string): Headset | undefined {
  return headsets.find((h) => h.slug === slug);
}
