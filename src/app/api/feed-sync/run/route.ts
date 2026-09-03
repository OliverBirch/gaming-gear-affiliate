import { NextRequest, NextResponse } from "next/server";
import { RETAILER_SLUGS, type RetailerSlug } from "@/lib/types";
import { runFeedSync } from "@/lib/feed-sync/run";

export const dynamic = "force-dynamic";

function isRetailerSlug(value: string | null): value is RetailerSlug {
  return value != null && (RETAILER_SLUGS as readonly string[]).includes(value);
}

/**
 * One retailer per call, not all four in one request — keeps each call
 * well under a serverless function's timeout even for Komplett's ~6,230-item
 * feed, and gives clean partial failure instead of one slow retailer
 * stalling the others.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);

  const secret = process.env.FEED_SYNC_SECRET?.trim();
  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retailerParam = url.searchParams.get("retailer");
  if (!isRetailerSlug(retailerParam)) {
    return NextResponse.json(
      { error: `retailer must be one of: ${RETAILER_SLUGS.join(", ")}` },
      { status: 400 }
    );
  }

  const dryRun = url.searchParams.get("dryRun") === "1";
  const result = await runFeedSync(retailerParam, { dryRun });

  return NextResponse.json(result);
}
