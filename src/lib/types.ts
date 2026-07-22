import { z } from "zod";

export const MouseProfileSchema = z.object({
  vaegtVigtighed: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  knapBehov: z.enum(["minimal", "medium", "mange"]),
  wirelessForventet: z.boolean(),
  typiskDpi: z.array(z.number()),
});

export type MouseProfile = z.infer<typeof MouseProfileSchema>;

export const EsportSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  genre: z.enum(["fps", "moba", "battle-royale", "hero-shooter"]),
  musProfil: MouseProfileSchema,
  aktiv: z.boolean(),
  beskrivelse: z.string(),
  heroImage: z.string().optional(),
});

export type Esport = z.infer<typeof EsportSchema>;

export const ProSettingsSchema = z.object({
  dpi: z.number(),
  inGameSens: z.number(),
  edpi: z.number(),
  pollingHz: z.number().optional(),
});

export type ProSettings = z.infer<typeof ProSettingsSchema>;

export const ProSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  esport: z.string(),
  hold: z.string().optional(),
  land: z.string().optional(),
  billede: z.string().optional(),
  musSlug: z.string(),
  tastaturSlug: z.string().optional(),
  musemaatteSlug: z.string().optional(),
  settings: ProSettingsSchema,
  kilde: z.string(),
  sidstVerificeret: z.string(),
});

export type Pro = z.infer<typeof ProSchema>;

/**
 * Closed on purpose: which retailers we run offers through is a business
 * decision, not something a data-gathering pass should be able to expand by
 * just picking a slug (that's how an Amazon.com offer - wrong currency, wrong
 * country - ended up live). Add a retailer here only after adding it to
 * retailers.ts with real payout/network data.
 */
export const RETAILER_SLUGS = ["proshop", "computersalg", "maxgaming", "coolshop", "elgiganten", "avxperten", "dustinhome", "komplett", "billo"] as const;

export const AffiliateOfferSchema = z.object({
  retailer: z.enum(RETAILER_SLUGS),
  produktUrl: z.string(),
  affiliateUrl: z.string().optional(),
  prisDkk: z.number().optional(),
  payoutPct: z.number(),
  inStock: z.boolean().optional(),
});

export type AffiliateOffer = z.infer<typeof AffiliateOfferSchema>;

/**
 * Guards against the other thing that just happened: a fabricated USD price
 * range ("Høj pris (~$180-250)") baked directly into ulemper copy instead of
 * offers[].prisDkk. Prices are DKK-only and belong in offers, never in prose.
 */
const CopyPoints = z.array(
  z.string().refine((s) => !/\$\s?\d/.test(s), {
    message: "no price literals in copy - prices belong in offers[].prisDkk",
  })
);

export const MouseSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  brand: z.string(),
  vaegtGram: z.number(),
  laengdeMm: z.number(),
  breddeMm: z.number(),
  hoejdeMm: z.number(),
  formfaktor: z.enum(["ergonomisk", "symmetrisk", "ambidextrous"]),
  greb: z.array(z.enum(["palm", "claw", "fingertip"])),
  haandStoerrelse: z.array(z.enum(["lille", "medium", "stor"])),
  wireless: z.boolean(),
  forbindelse: z.string(),
  batteritidTimer: z.number().nullable(),
  sensor: z.string(),
  maxDpi: z.number(),
  pollingHz: z.number(),
  switchType: z.enum(["optisk", "mekanisk"]),
  knapper: z.number(),
  lodMm: z.number(),
  softwarePaakraevet: z.boolean(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  billede: z.string().optional(),
  offers: z.array(AffiliateOfferSchema),
  beskrivelse: z.string(),
  fordele: CopyPoints,
  ulemper: CopyPoints,
  proBrugere: z.array(z.string()),
});

export type Mouse = z.infer<typeof MouseSchema>;

export const KeyboardSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  brand: z.string(),
  layout: z.string(),
  switchType: z.string(),
  forbindelse: z.string(),
  wireless: z.boolean(),
  batteritidTimer: z.number().nullable(),
  pollingHz: z.number(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  formfaktor: z.string(),
  taster: z.number(),
  rgb: z.boolean(),
  hotSwappable: z.boolean(),
  keycapMaterial: z.string().optional(),
  beskrivelse: z.string(),
  fordele: CopyPoints,
  ulemper: CopyPoints,
  billede: z.string().optional(),
  offers: z.array(AffiliateOfferSchema),
  proBrugere: z.array(z.string()),
  kilde: z.string().optional(),
  sidstVerificeret: z.string().optional(),
});

export type Keyboard = z.infer<typeof KeyboardSchema>;

export const MousepadSchema = z.object({
  slug: z.string(),
  brand: z.string(),
  model: z.string(),
  variant: z.string().nullable(),
  type: z.enum(["speed", "control", "hybrid"]),
  materiale: z.string(),
  størrelser: z.array(
    z.object({
      navn: z.string(),
      breddeMm: z.number(),
      laengdeMm: z.number(),
      tykkelseMm: z.number(),
    })
  ),
  bund: z.string(),
  vaskbar: z.boolean(),
  billede: z.string().nullable(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  offers: z.array(AffiliateOfferSchema),
  beskrivelse: z.string(),
  fordele: CopyPoints,
  ulemper: CopyPoints,
  proBrugere: z.array(z.string()),
  kilde: z.string(),
  sidstVerificeret: z.string(),
});

export type Mousepad = z.infer<typeof MousepadSchema>;

export const HeadsetSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  brand: z.string(),
  wireless: z.boolean(),
  forbindelse: z.string(),
  batteritidTimer: z.number().nullable(),
  vaegtGram: z.number(),
  driverStoerrelseMm: z.number().nullable(),
  mikrofon: z.boolean(),
  aftagelig: z.boolean().nullable(),
  surroundSound: z.boolean(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  billede: z.string().nullable(),
  offers: z.array(AffiliateOfferSchema),
  beskrivelse: z.string(),
  fordele: CopyPoints,
  ulemper: CopyPoints,
  kilde: z.string(),
  sidstVerificeret: z.string(),
});

export type Headset = z.infer<typeof HeadsetSchema>;

export const MonitorSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  brand: z.string(),
  stoerrelseTommer: z.number(),
  oploesning: z.string(),
  opdateringsHz: z.number(),
  paneltype: z.enum(["TN", "IPS", "VA", "OLED"]),
  responstidMs: z.number().nullable(),
  adaptiveSync: z.enum(["ingen", "g-sync", "freesync", "begge"]),
  buet: z.boolean(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  billede: z.string().nullable(),
  offers: z.array(AffiliateOfferSchema),
  beskrivelse: z.string(),
  fordele: CopyPoints,
  ulemper: CopyPoints,
  kilde: z.string(),
  sidstVerificeret: z.string(),
});

export type Monitor = z.infer<typeof MonitorSchema>;

export const ProPeripheralsSchema = z.object({
  monitor: z.string().nullable(),
  monitorSlug: z.string().nullable().optional(),
  keyboard: z.string().nullable(),
  keyboardSlug: z.string().nullable().optional(),
  mousepad: z.string().nullable(),
  mousepadSlug: z.string().nullable().optional(),
  headset: z.string().nullable(),
  headsetSlug: z.string().nullable().optional(),
});

export type ProPeripherals = z.infer<typeof ProPeripheralsSchema>;

export const RetailerSchema = z.object({
  slug: z.enum(RETAILER_SLUGS),
  navn: z.string(),
  netvaerk: z.enum(["partner-ads", "adtraction", "impact", "daisycon", "direkte"]),
  basePayoutPct: z.number(),
  cookieDage: z.number(),
  logo: z.string().optional(),
  hjemmeside: z.string(),
});

export type Retailer = z.infer<typeof RetailerSchema>;

/**
 * Structural shape shared by every product category (Mouse, Keyboard,
 * Mousepad, Headset, Monitor) - lets bestOffer/bestOffers in lib/affiliate.ts
 * work across all of them instead of being hardcoded to Mouse.
 */
export interface OfferableProduct {
  slug: string;
  offers: AffiliateOffer[];
}

export const OfferRecordSchema = z.object({
  id: z.string(),
  productSlug: z.string(),
  retailerSlug: z.string(),
  produktUrl: z.string(),
  affiliateUrl: z.string(),
  prisDkk: z.number().nullable(),
  payoutPct: z.number(),
  inStock: z.boolean(),
  createdAt: z.string(),
});

export type OfferRecord = z.infer<typeof OfferRecordSchema>;

export interface FinderInput {
  esport: string;
  greb: "palm" | "claw" | "fingertip" | "ved-ikke";
  haand: "lille" | "medium" | "stor";
  wireless: boolean | null;
  budget: "budget" | "mid" | "flagship";
}
