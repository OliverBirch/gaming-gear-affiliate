import { NextRequest, NextResponse } from "next/server";
import { RETAILER_SLUGS, type RetailerSlug } from "@/lib/types";
import { redisGet, redisDel } from "@/lib/redis";
import { applyCandidateToCatalog, type ApplyCategory } from "@/lib/feed-sync/apply";
import type { FeedCandidate } from "@/lib/feed-sync/types";

export const dynamic = "force-dynamic";

function isRetailerSlug(value: unknown): value is RetailerSlug {
  return typeof value === "string" && (RETAILER_SLUGS as readonly string[]).includes(value);
}

const APPLYABLE_CATEGORIES: readonly string[] = ["mus", "headset", "musemaatter", "tastaturer", "skaerme"];

/**
 * Approves one pending candidate: re-reads it from Redis (never trusts a
 * client-supplied price/URL for a write into committed data), writes it
 * into the right category's JSON via feed-sync/apply.ts, then clears the
 * candidate key so it stops showing as pending on /admin/feeds.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const retailer = body?.retailer;
  const slug = body?.slug;

  if (!isRetailerSlug(retailer) || typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "retailer and slug are required" }, { status: 400 });
  }

  const key = `feedcandidate:${retailer}:${slug}`;
  const candidate = await redisGet<FeedCandidate>(key);
  if (!candidate) {
    return NextResponse.json({ error: "candidate not found — it may already have been applied or expired" }, { status: 404 });
  }

  if (!APPLYABLE_CATEGORIES.includes(candidate.category)) {
    return NextResponse.json(
      { error: `applying a "${candidate.category}" candidate isn't supported yet` },
      { status: 400 }
    );
  }

  try {
    applyCandidateToCatalog({
      retailer: candidate.retailer,
      slug: candidate.slug,
      category: candidate.category as ApplyCategory,
      produktUrl: candidate.produktUrl,
      affiliateUrl: candidate.affiliateUrl,
      prisDkk: candidate.priceDkk,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await redisDel(key);

  return NextResponse.json({ applied: true, slug: candidate.slug, retailer: candidate.retailer });
}
