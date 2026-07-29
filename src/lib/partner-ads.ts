/**
 * Partner-ads tracking URL builder (deeplinks / text links only — no on-site banners).
 *
 * Partner-ads still requires a material id in the query string as `bannerid`.
 * That is NOT a visual banner: it is the program’s “deeplink” / textlink id from
 * Reklamemateriale or the Deeplink generator. Our UI never shows PA banners.
 *
 * Rules (official PA FAQ):
 * - SubIDs are only `uid` and `uid2` (lowercase) — never utm_*.
 * - When deeplinking, `uid` / `uid2` MUST appear before `htmlurl`.
 * - GA4 must not rewrite these params.
 */

import type { RetailerSlug } from "./types";

const KLIKBANNER = "https://www.partner-ads.com/dk/klikbanner.php";

/**
 * Env: PARTNER_ADS_DEEPLINK_<RETAILER> (preferred)
 * Legacy alias: PARTNER_ADS_BANNER_<RETAILER>
 */
const DEEPLINK_ENV: Partial<Record<RetailerSlug, { primary: string; legacy: string }>> = {
  proshop: {
    primary: "PARTNER_ADS_DEEPLINK_PROSHOP",
    legacy: "PARTNER_ADS_BANNER_PROSHOP",
  },
  computersalg: {
    primary: "PARTNER_ADS_DEEPLINK_COMPUTERSALG",
    legacy: "PARTNER_ADS_BANNER_COMPUTERSALG",
  },
  coolshop: {
    primary: "PARTNER_ADS_DEEPLINK_COOLSHOP",
    legacy: "PARTNER_ADS_BANNER_COOLSHOP",
  },
  billo: {
    primary: "PARTNER_ADS_DEEPLINK_BILLO",
    legacy: "PARTNER_ADS_BANNER_BILLO",
  },
  ultrashop: {
    primary: "PARTNER_ADS_DEEPLINK_ULTRASHOP",
    legacy: "PARTNER_ADS_BANNER_ULTRASHOP",
  },
};

export function getPartnerAdsPartnerId(): string | null {
  const id = process.env.PARTNER_ADS_PARTNER_ID?.trim();
  return id || null;
}

/**
 * Program deeplink material id (PA query param name is still `bannerid`).
 * Prefer PARTNER_ADS_DEEPLINK_*; falls back to PARTNER_ADS_BANNER_* for older env.
 */
export function getPartnerAdsDeeplinkId(retailer: RetailerSlug): string | null {
  const keys = DEEPLINK_ENV[retailer];
  if (!keys) return null;
  const id =
    process.env[keys.primary]?.trim() || process.env[keys.legacy]?.trim();
  return id || null;
}

/** @deprecated Use getPartnerAdsDeeplinkId — name kept for call sites / docs. */
export function getPartnerAdsBannerId(retailer: RetailerSlug): string | null {
  return getPartnerAdsDeeplinkId(retailer);
}

export function isPartnerAdsConfigured(retailer: RetailerSlug): boolean {
  return Boolean(getPartnerAdsPartnerId() && getPartnerAdsDeeplinkId(retailer));
}

export type BuildPartnerAdsUrlInput = {
  retailer: RetailerSlug;
  /** Merchant product URL (deeplink target). */
  deepUrl: string;
  /** Internal click id — joins redirect store ↔ PA callback. */
  uid: string;
  /** Optional second subid (e.g. product slug). */
  uid2?: string;
};

/**
 * Builds a Partner-ads tracking URL for a product deeplink.
 * Returns null if partnerid or program deeplink id is not configured.
 */
export function buildPartnerAdsUrl(input: BuildPartnerAdsUrlInput): string | null {
  const partnerid = getPartnerAdsPartnerId();
  const deeplinkId = getPartnerAdsDeeplinkId(input.retailer);
  if (!partnerid || !deeplinkId) return null;

  // Order: partnerid, bannerid (PA’s name for deeplink material), uid, uid2, htmlurl.
  const params = new URLSearchParams();
  params.set("partnerid", partnerid);
  params.set("bannerid", deeplinkId);
  params.set("uid", input.uid);
  if (input.uid2) params.set("uid2", input.uid2);
  params.set("htmlurl", input.deepUrl);

  return `${KLIKBANNER}?${params.toString()}`;
}

export function isPartnerAdsTrackingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "www.partner-ads.com" ||
      u.hostname === "partner-ads.com"
    );
  } catch {
    return false;
  }
}

/**
 * If the stored affiliateUrl is already a full PA tracking link, inject uid
 * (before htmlurl when present) without destroying existing params.
 */
export function injectUidIntoPartnerAdsUrl(
  trackingUrl: string,
  uid: string,
  uid2?: string
): string {
  const u = new URL(trackingUrl);
  const htmlurl = u.searchParams.get("htmlurl");
  const partnerid = u.searchParams.get("partnerid");
  const bannerid = u.searchParams.get("bannerid");
  const params = new URLSearchParams();
  if (partnerid) params.set("partnerid", partnerid);
  if (bannerid) params.set("bannerid", bannerid);
  u.searchParams.forEach((value, key) => {
    if (["partnerid", "bannerid", "uid", "uid2", "htmlurl"].includes(key)) return;
    params.set(key, value);
  });
  params.set("uid", uid);
  if (uid2) params.set("uid2", uid2);
  else if (u.searchParams.get("uid2")) params.set("uid2", u.searchParams.get("uid2")!);
  if (htmlurl) params.set("htmlurl", htmlurl);
  u.search = params.toString();
  return u.toString();
}
