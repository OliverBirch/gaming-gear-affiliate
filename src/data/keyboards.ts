import type { Keyboard, AffiliateOffer } from "@/lib/types";
import { KeyboardSchema } from "@/lib/types";
import { mergeOffers } from "./build-offers";
import raw from "./keyboards.json";
import { getKeyboardProSlugs } from "./pros-peripherals-mapping";

/**
 * Shape of a row in keyboards.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and KeyboardSchema.parse below is
 * what actually guarantees the narrower types at build time. `retailers`
 * (a bare name list, expanded into generic category-page offers by
 * `kbOffers` below) is the fallback for a keyboard with no real
 * per-product data yet; `offers` is additive, individually-authored real
 * per-product offers, same escape hatch headsets/monitors/mousepads use.
 * No keyboard has one today — every current offer is still the generic
 * fallback — but the field exists so a feed-sync candidate can be applied
 * with a real link instead of being rejected.
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
  /**
   * Individually-authored per-product offers, additive to `retailers`'s
   * generic category-page offers — for a retailer whose feed gives a real
   * per-product tracking link (see headsets.ts for the pattern this
   * mirrors, and feed-sync/apply.ts which writes into this field).
   */
  offers?: AffiliateOffer[];
};

const KB_SEARCH_URLS: Record<string, string> = {
  proshop: "https://www.proshop.dk/Tastatur",
  geekd: "https://geekd.dk/collections/tastatur",
};

function kbOffers(retailers: string[]): AffiliateOffer[] {
  return retailers
    .filter((r) => KB_SEARCH_URLS[r])
    .map((r) => ({
      retailer: r as AffiliateOffer["retailer"],
      produktUrl: KB_SEARCH_URLS[r],
      payoutPct: r === "geekd" ? 4.0 : 3.5,
      generisk: true,
      // Left undefined (not hardcoded true) so a prices.json override can
      // actually mark a specific retailer out of stock — resolveOffer's
      // `offer.inStock ?? override?.inStock ?? true` only consults the
      // override when the base value isn't already set.
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
  offers: mergeOffers(kbOffers(k.retailers), k.offers),
  proBrugere: getKeyboardProSlugs(k.slug),
}));

for (const k of _builtKeyboards) KeyboardSchema.parse(k);

export const keyboards: Keyboard[] = _builtKeyboards;

export function getKeyboard(slug: string): Keyboard | undefined {
  return keyboards.find((k) => k.slug === slug);
}
