import { NextRequest, NextResponse } from "next/server";
import { RETAILER_SLUGS, type RetailerSlug } from "@/lib/types";
import { getRetailer } from "@/data/retailers";
import {
  isAllowedRedirectUrl,
  mintClickUid,
  parseGaClientId,
  resolveNetworkDestination,
  saveClick,
} from "@/lib/affiliate-tracking";

export const dynamic = "force-dynamic";

function isRetailerSlug(v: string): v is RetailerSlug {
  return (RETAILER_SLUGS as readonly string[]).includes(v);
}

/**
 * First-party affiliate hop:
 * 1. Validate params
 * 2. Mint uid, store click context (for PA callback → GA4)
 * 3. 302 to Partner-ads (or merchant) — never attach utm_*
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const retailerParam = url.searchParams.get("r") ?? "";
  const productSlug = url.searchParams.get("p");
  const deepUrl = url.searchParams.get("u");
  const affiliateUrl = url.searchParams.get("a");
  let pagePath = url.searchParams.get("path");
  if (!pagePath) {
    const ref = request.headers.get("referer");
    if (ref) {
      try {
        pagePath = new URL(ref).pathname;
      } catch {
        /* ignore */
      }
    }
  }

  // Legacy: ?url= absolute destination (still allowlisted)
  const legacyUrl = url.searchParams.get("url");

  if (!deepUrl && legacyUrl) {
    if (!isAllowedRedirectUrl(legacyUrl)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }
    return NextResponse.redirect(legacyUrl, {
      status: 302,
      headers: { "cache-control": "no-store" },
    });
  }

  if (!deepUrl || !isRetailerSlug(retailerParam)) {
    return NextResponse.json(
      { error: "Missing or invalid r (retailer) / u (product url)" },
      { status: 400 }
    );
  }

  if (!isAllowedRedirectUrl(deepUrl)) {
    return NextResponse.json({ error: "Product URL not allowed" }, { status: 400 });
  }
  if (affiliateUrl && !isAllowedRedirectUrl(affiliateUrl)) {
    return NextResponse.json({ error: "Affiliate URL not allowed" }, { status: 400 });
  }

  const retailer = retailerParam;
  const meta = getRetailer(retailer);
  const network = meta?.netvaerk ?? "direkte";
  const uid = mintClickUid();
  const uid2 = productSlug ?? undefined;

  const clientId = parseGaClientId(request.cookies.get("_ga")?.value);

  const destination = resolveNetworkDestination({
    retailer,
    deepUrl,
    affiliateUrl,
    uid,
    uid2,
  });

  if (!isAllowedRedirectUrl(destination)) {
    return NextResponse.json({ error: "Resolved destination not allowed" }, { status: 400 });
  }

  await saveClick({
    uid,
    retailer,
    network,
    productSlug: productSlug ?? null,
    pagePath: pagePath ?? null,
    destinationUrl: destination,
    clientId,
    sessionId: null,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.redirect(destination, {
    status: 302,
    headers: {
      "cache-control": "no-store",
      // Helps debugging without leaking to third parties beyond Location
      "x-aff-uid": uid,
    },
  });
}
