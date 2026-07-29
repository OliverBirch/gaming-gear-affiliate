import { NextRequest, NextResponse } from "next/server";
import { getClick } from "@/lib/affiliate-tracking";
import { sendAffiliateSaleEvent } from "@/lib/ga4-mp";

export const dynamic = "force-dynamic";

/**
 * Partner-ads conversion callback.
 *
 * Register in PA dashboard (Dataudtræk / API → Callback), e.g.:
 * https://prosetups.dk/api/partner-ads/callback?uid=[uid]&ordre=[ordrenummer]&prov=[belob]&sum=[omprsalg]&prg=[cprogramid]&uid2=[uid2]
 *
 * Optional: append &secret=YOUR_SECRET and set PARTNER_ADS_CALLBACK_SECRET.
 *
 * Does not use or require UTM. Joins sales to on-site sessions via stored uid.
 */
export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}

async function handleCallback(request: NextRequest) {
  const url = new URL(request.url);
  const secret = process.env.PARTNER_ADS_CALLBACK_SECRET?.trim();
  if (secret) {
    const provided = url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const uid = url.searchParams.get("uid")?.trim() || "";
  const ordre = url.searchParams.get("ordre")?.trim() || "";
  const provRaw = url.searchParams.get("prov") ?? url.searchParams.get("belob") ?? "";
  const sumRaw = url.searchParams.get("sum") ?? url.searchParams.get("omprsalg") ?? "";
  const prg = url.searchParams.get("prg")?.trim() || url.searchParams.get("cprogramid")?.trim() || "";
  const uid2 = url.searchParams.get("uid2")?.trim() || null;

  const commission = parseDkNumber(provRaw);
  const orderTotal = parseDkNumber(sumRaw);

  if (!uid && !ordre) {
    return NextResponse.json({ error: "Missing uid or ordre" }, { status: 400 });
  }

  const click = uid ? await getClick(uid) : null;

  // Prefer client_id from the original click so GA4 can attribute the session.
  // Fallback anonymous id keeps MP valid if cookie was missing / Redis expired.
  const clientId =
    click?.clientId ||
    `pa.${uid || ordre || "unknown"}`.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 36);

  const transactionId = ordre || `pa-${uid}-${Date.now()}`;

  if (commission != null && commission >= 0) {
    await sendAffiliateSaleEvent({
      clientId,
      transactionId,
      commissionDkk: commission,
      orderTotalDkk: orderTotal ?? undefined,
      currency: "DKK",
      retailer: click?.retailer,
      network: click?.network ?? "partner-ads",
      productSlug: click?.productSlug ?? uid2,
      programId: prg || undefined,
      pagePath: click?.pagePath,
    });
  } else {
    console.warn("[partner-ads/callback] no parseable commission", { uid, provRaw });
  }

  // Partner-ads only needs a 200; body is optional.
  return new NextResponse("OK", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Partner-ads may send "12,50" or "12.50". */
function parseDkNumber(raw: string): number | null {
  if (!raw || raw.includes("[")) return null; // unreplaced placeholder
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
