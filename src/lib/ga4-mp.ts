/**
 * GA4 Measurement Protocol — server-side events (Partner-ads sales).
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

function measurementId(): string {
  return process.env.GA4_MEASUREMENT_ID?.trim() || "G-BPNT90SDZ3";
}

function apiSecret(): string | null {
  return process.env.GA4_API_SECRET?.trim() || null;
}

export type AffiliateSaleMpPayload = {
  clientId: string;
  transactionId: string;
  /** Commission in DKK — primary GA4 value. */
  commissionDkk: number;
  /** Order total incl. VAT (optional custom). */
  orderTotalDkk?: number;
  currency?: string;
  retailer?: string;
  network?: string;
  productSlug?: string | null;
  programId?: string;
  pagePath?: string | null;
};

/**
 * Sends affiliate_sale to GA4. No-ops (returns false) if GA4_API_SECRET is unset.
 */
export async function sendAffiliateSaleEvent(
  payload: AffiliateSaleMpPayload
): Promise<{ ok: boolean; skipped?: boolean; status?: number }> {
  const secret = apiSecret();
  if (!secret) {
    console.warn("[ga4-mp] GA4_API_SECRET not set — skip affiliate_sale");
    return { ok: false, skipped: true };
  }

  const body = {
    client_id: payload.clientId,
    events: [
      {
        name: "affiliate_sale",
        params: {
          transaction_id: payload.transactionId,
          value: payload.commissionDkk,
          currency: payload.currency ?? "DKK",
          engagement_time_msec: 1,
          // Custom / ecommerce-adjacent params (register dimensions in GA4 admin)
          commission_dkk: payload.commissionDkk,
          ...(payload.orderTotalDkk != null
            ? { order_total_dkk: payload.orderTotalDkk }
            : {}),
          ...(payload.retailer ? { retailer: payload.retailer } : {}),
          ...(payload.network ? { network: payload.network } : {}),
          ...(payload.productSlug ? { product_slug: payload.productSlug } : {}),
          ...(payload.programId ? { pa_program_id: payload.programId } : {}),
          ...(payload.pagePath ? { page_path: payload.pagePath } : {}),
        },
      },
    ],
  };

  const url = `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(measurementId())}&api_secret=${encodeURIComponent(secret)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[ga4-mp] MP error", res.status, await res.text().catch(() => ""));
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("[ga4-mp] fetch failed", err);
    return { ok: false };
  }
}
