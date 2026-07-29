import type { Mouse } from "@/lib/types";
import { MouseSchema } from "@/lib/types";
import raw from "./mice.json";
import { pros } from "./pros";

/**
 * Shape of a row in mice.json. Declared explicitly rather than inferred:
 * JSON widens enum-ish fields to `string`, and MouseSchema.parse below is
 * what actually guarantees the narrower types at build time. Offers are
 * individually-authored per-product URLs, not a generic search-page
 * fallback, so they're stored verbatim rather than built from a price map.
 * They are NOT confirmed live links — the site has no affiliate program
 * hooked up yet, so every produktUrl/affiliateUrl here is provisional
 * placeholder data pending real verification, not a trustworthy deep link.
 */
type RawOffer = {
  retailer: string;
  produktUrl: string;
  affiliateUrl?: string;
  prisDkk?: number;
  payoutPct: number;
  inStock?: boolean;
};

type RawMouse = {
  slug: string;
  ean?: string;
  navn: string;
  brand: string;
  vaegtGram: number;
  laengdeMm: number;
  breddeMm: number;
  hoejdeMm: number;
  formfaktor: string;
  greb: string[];
  haandStoerrelse: string[];
  wireless: boolean;
  forbindelse: string;
  batteritidTimer: number | null;
  sensor: string;
  maxDpi: number;
  pollingHz: number;
  switchType: string;
  knapper: number;
  lodMm: number;
  softwarePaakraevet: boolean;
  prisNiveau: Mouse["prisNiveau"];
  billede?: string;
  offers: RawOffer[];
  beskrivelse: string;
  fordele: string[];
  ulemper: string[];
};

function proBrugereOf(mouseSlug: string): string[] {
  return pros.filter((p) => p.musSlug === mouseSlug).map((p) => p.slug);
}

const _built: Mouse[] = (raw.mice as RawMouse[]).map((m) => ({
  ...m,
  formfaktor: m.formfaktor as Mouse["formfaktor"],
  greb: m.greb as Mouse["greb"],
  haandStoerrelse: m.haandStoerrelse as Mouse["haandStoerrelse"],
  switchType: m.switchType as Mouse["switchType"],
  offers: m.offers.map((o) => ({
    ...o,
    retailer: o.retailer as Mouse["offers"][number]["retailer"],
  })),
  proBrugere: proBrugereOf(m.slug),
}));

// Zod validation at module level — fails build if data is invalid
for (const m of _built) {
  MouseSchema.parse(m);
}

export const mice: Mouse[] = _built;

export function getMouse(slug: string): Mouse | undefined {
  return mice.find((m) => m.slug === slug);
}
