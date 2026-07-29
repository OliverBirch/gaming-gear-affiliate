import type { Keyboard, AffiliateOffer } from "@/lib/types";
import { KeyboardSchema } from "@/lib/types";
import raw from "./keyboards.json";
import { getKeyboardProSlugs } from "./pros-peripherals-mapping";

/**
 * Shape of a row in keyboards.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and KeyboardSchema.parse below is
 * what actually guarantees the narrower types at build time. Unlike mice,
 * keyboard offers were never individually-authored per-product URLs —
 * every entry just points at a retailer's category page — so the raw row
 * stores the retailer list and `kbOffers` below expands it, instead of
 * storing (and duplicating) the generated offer objects.
 */
type RawKeyboard = {
  slug: string;
  ean?: string;
  navn: string;
  brand: string;
  layout: string;
  switchType: string;
  forbindelse: string;
  wireless: boolean;
  batteritidTimer: number | null;
  pollingHz: number;
  prisNiveau: Keyboard["prisNiveau"];
  formfaktor: string;
  taster: number;
  rgb: boolean;
  hotSwappable: boolean;
  keycapMaterial: string;
  beskrivelse: string;
  fordele: string[];
  ulemper: string[];
  billede?: string;
  retailers: string[];
};

const KB_SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Tastatur",
  maxgaming: "https://www.maxgaming.dk/dk/computertilbehor/tastatur-og-tilbehor/gaming-tastatur",
  computersalg: "https://www.computersalg.dk/tastaturer",
};

function kbOffers(retailers: string[]): AffiliateOffer[] {
  return retailers.map((r) => ({
    retailer: r as AffiliateOffer["retailer"],
    produktUrl: KB_SEARCH_URLS[r] ?? `https://www.maxgaming.dk/dk/search/${encodeURIComponent(r)}`,
    payoutPct: r === "maxgaming" ? 4.0 : 3.5,
    inStock: true,
  }));
}

const _builtKeyboards: Keyboard[] = (raw.keyboards as RawKeyboard[]).map((k) => ({
  slug: k.slug,
  ean: k.ean,
  navn: k.navn,
  brand: k.brand,
  layout: k.layout,
  switchType: k.switchType,
  forbindelse: k.forbindelse,
  wireless: k.wireless,
  batteritidTimer: k.batteritidTimer,
  pollingHz: k.pollingHz,
  prisNiveau: k.prisNiveau,
  formfaktor: k.formfaktor,
  taster: k.taster,
  rgb: k.rgb,
  hotSwappable: k.hotSwappable,
  keycapMaterial: k.keycapMaterial,
  beskrivelse: k.beskrivelse,
  fordele: k.fordele,
  ulemper: k.ulemper,
  billede: k.billede,
  offers: kbOffers(k.retailers),
  proBrugere: getKeyboardProSlugs(k.slug),
}));

for (const k of _builtKeyboards) KeyboardSchema.parse(k);

export const keyboards: Keyboard[] = _builtKeyboards;

export function getKeyboard(slug: string): Keyboard | undefined {
  return keyboards.find((k) => k.slug === slug);
}
