import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { RetailerSlug } from "@/lib/types";
import { getRetailer } from "@/data/retailers";
import { invalidateOfferKeysCache } from "./existing-offers";

/**
 * Every category now has the same `offers[]` escape hatch mice originated
 * — individually-authored, real per-product offers, additive to whatever
 * generic category-search fallback (priser/retailers) that category still
 * carries for products with no real data yet. Applying a candidate always
 * writes here, for any retailer, regardless of category.
 */
export type ApplyCategory = "mus" | "headset" | "musemaatter" | "tastaturer" | "skaerme";

const FILE_CONFIG: Record<ApplyCategory, { file: string; arrayKey: string }> = {
  mus: { file: "mice.json", arrayKey: "mice" },
  headset: { file: "headsets.json", arrayKey: "headsets" },
  musemaatter: { file: "mousepads.json", arrayKey: "mousepads" },
  tastaturer: { file: "keyboards.json", arrayKey: "keyboards" },
  skaerme: { file: "monitors.json", arrayKey: "monitors" },
};

export interface ApplyCandidateInput {
  retailer: RetailerSlug;
  slug: string;
  category: ApplyCategory;
  produktUrl: string;
  affiliateUrl: string;
  prisDkk: number | null;
}

/**
 * Writes a reviewed-and-approved feed candidate into the right category's
 * raw JSON as a real, individually-authored offer, then invalidates the
 * existing-offers cache so a later sync run in the same process treats
 * this pair as verified. Uses a full JSON.parse -> mutate ->
 * JSON.stringify(data, null, 2) round-trip, which is only safe because all
 * 5 category files are confirmed byte-identical against that exact
 * round-trip today (verified before writing this, and keyboards.json was
 * explicitly normalized once to make it true — a prior session's naive
 * round-trip on mice.json wasn't checked first and produced a 489-line
 * diff for what should've been a one-line edit, see ROADMAP.md). If a
 * future edit reintroduces non-canonical formatting in any of these files,
 * this will start producing noisy diffs and needs revisiting rather than
 * trusting blindly.
 */
export function applyCandidateToCatalog(input: ApplyCandidateInput): void {
  if (input.prisDkk == null) {
    throw new Error("candidate has no price — nothing usable to apply");
  }

  const config = FILE_CONFIG[input.category];
  if (!config) {
    throw new Error(`applying a "${input.category}" candidate isn't supported yet`);
  }

  const retailerInfo = getRetailer(input.retailer);
  if (!retailerInfo) throw new Error(`unknown retailer: ${input.retailer}`);

  const path = join(process.cwd(), "src", "data", config.file);
  const original = readFileSync(path, "utf-8");
  const usesCrlf = original.includes("\r\n");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(original);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data[config.arrayKey];
  const item = items.find((i) => i.slug === input.slug);
  if (!item) {
    throw new Error(`${input.slug} not found in ${config.file}`);
  }

  const newOffer = {
    affiliateUrl: input.affiliateUrl,
    // Always true: this is a static, committed value, not a live
    // signal — a stockout at write time shouldn't freeze the product as
    // permanently sold out. Real-time stock is carried by the
    // price:{slug}__{retailer} Redis override once this pair's next sync
    // run treats it as an existing, trusted offer.
    inStock: true,
    payoutPct: retailerInfo.basePayoutPct,
    prisDkk: input.prisDkk,
    produktUrl: input.produktUrl,
    retailer: input.retailer,
  };
  item.offers = [...(item.offers ?? []), newOffer];

  const serialized = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(path, usesCrlf ? serialized.replace(/\n/g, "\r\n") : serialized, "utf-8");

  invalidateOfferKeysCache();
}
