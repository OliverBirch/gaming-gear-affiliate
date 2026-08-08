/**
 * First-party affiliate click tracking + outbound URL helpers.
 * Partner-ads join key is `uid` only — never utm_* on outbound.
 */

import type { RetailerSlug } from "./types";
import { getRetailer } from "@/data/retailers";
import {
  buildPartnerAdsUrl,
  injectUidIntoPartnerAdsUrl,
  isPartnerAdsTrackingUrl,
} from "./partner-ads";
import { redisGet, redisSet } from "./redis";

export const CLICK_TTL_SECONDS = 60 * 60 * 24 * 60; // 60 days ≥ PA cookie windows
const CLICK_KEY_PREFIX = "aff:click:";

export type AffiliateClickRecord = {
  uid: string;
  retailer: RetailerSlug;
  network: string;
  productSlug: string | null;
  pagePath: string | null;
  destinationUrl: string;
  clientId: string | null;
  sessionId: string | null;
  createdAt: string;
};

export function mintClickUid(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 12);
  return `clk_${Date.now().toString(36)}_${rand}`;
}

export async function saveClick(record: AffiliateClickRecord): Promise<void> {
  await redisSet(`${CLICK_KEY_PREFIX}${record.uid}`, record, CLICK_TTL_SECONDS);
}

export async function getClick(uid: string): Promise<AffiliateClickRecord | null> {
  return redisGet<AffiliateClickRecord>(`${CLICK_KEY_PREFIX}${uid}`);
}

/**
 * Parse GA4 client_id from the `_ga` cookie value (GA1.1.XXXXXXXX.YYYYYYYY).
 */
export function parseGaClientId(gaCookie: string | undefined | null): string | null {
  if (!gaCookie) return null;
  const parts = gaCookie.split(".");
  // GA1.1.<client_id_part1>.<client_id_part2>
  if (parts.length >= 4) {
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  }
  return null;
}

/**
 * Resolve the final network hop destination for a click.
 * Prefer Partner-ads when configured; otherwise use the offer URL as-is.
 */
export function resolveNetworkDestination(opts: {
  retailer: RetailerSlug;
  deepUrl: string;
  affiliateUrl?: string | null;
  uid: string;
  uid2?: string;
}): string {
  const { retailer, deepUrl, affiliateUrl, uid, uid2 } = opts;
  const retailerMeta = getRetailer(retailer);
  const network = retailerMeta?.netvaerk ?? "direkte";

  // Already a full PA tracking URL in data → inject uid only.
  if (affiliateUrl && isPartnerAdsTrackingUrl(affiliateUrl)) {
    return injectUidIntoPartnerAdsUrl(affiliateUrl, uid, uid2);
  }

  if (network === "partner-ads") {
    const pa = buildPartnerAdsUrl({
      retailer,
      deepUrl: affiliateUrl && !isPartnerAdsTrackingUrl(affiliateUrl) ? affiliateUrl : deepUrl,
      uid,
      uid2,
    });
    if (pa) return pa;
  }

  // Adtraction / Impact / etc. or PA not configured: pass through best available URL.
  // Do not append utm_* — network-specific SubIDs belong in dedicated builders later.
  return affiliateUrl || deepUrl;
}

export { buildRedirectHref, offerToRedirectHref, type OutboundLinkParams } from "./affiliate-href";

/** Hosts we allow the redirect endpoint to send users to. */
export const ALLOWED_REDIRECT_HOSTS = new Set([
  "www.partner-ads.com",
  "partner-ads.com",
  "www.proshop.dk",
  "proshop.dk",
  "www.computersalg.dk",
  "computersalg.dk",
  "www.coolshop.dk",
  "coolshop.dk",
  "www.billo.dk",
  "billo.dk",
  "geekd.dk",
  "www.geekd.dk",
  "www.elgiganten.dk",
  "elgiganten.dk",
  "www.avxperten.dk",
  "avxperten.dk",
  "www.dustinhome.dk",
  "dustinhome.dk",
  "www.komplett.dk",
  "komplett.dk",
  // Common network tracking hosts (extend as programs go live)
  "www.adtraction.com",
  "adtraction.com",
  "track.adtraction.com",
  "www.impact.com",
  "impact.com",
  "goto.shop.com",
]);

export function isAllowedRedirectUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_REDIRECT_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}
