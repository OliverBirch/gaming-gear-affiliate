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
  settings: ProSettingsSchema,
  kilde: z.string(),
  sidstVerificeret: z.string(),
});

export type Pro = z.infer<typeof ProSchema>;

export const AffiliateOfferSchema = z.object({
  retailer: z.string(),
  produktUrl: z.string(),
  affiliateUrl: z.string().optional(),
  prisDkk: z.number().optional(),
  payoutPct: z.number(),
  inStock: z.boolean().optional(),
});

export type AffiliateOffer = z.infer<typeof AffiliateOfferSchema>;

export const MouseSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  brand: z.string(),
  vaegtGram: z.number(),
  formfaktor: z.enum(["ergonomisk", "symmetrisk", "ambidextrous"]),
  greb: z.array(z.enum(["palm", "claw", "fingertip"])),
  haandStoerrelse: z.array(z.enum(["lille", "medium", "stor"])),
  wireless: z.boolean(),
  sensor: z.string(),
  maxDpi: z.number(),
  pollingHz: z.number(),
  prisNiveau: z.enum(["budget", "mid", "flagship"]),
  billede: z.string().optional(),
  offers: z.array(AffiliateOfferSchema),
  beskrivelse: z.string(),
  fordele: z.array(z.string()),
  ulemper: z.array(z.string()),
  proBrugere: z.array(z.string()),
});

export type Mouse = z.infer<typeof MouseSchema>;

export const RetailerSchema = z.object({
  slug: z.string(),
  navn: z.string(),
  netvaerk: z.enum(["partner-ads", "adtraction", "impact", "daisycon", "direkte"]),
  basePayoutPct: z.number(),
  cookieDage: z.number(),
  logo: z.string().optional(),
  hjemmeside: z.string(),
});

export type Retailer = z.infer<typeof RetailerSchema>;

export const OfferRecordSchema = z.object({
  id: z.string(),
  mouseSlug: z.string(),
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
