import { Readable } from "stream";
import type { RetailerSlug } from "@/lib/types";
import type { OfferOverride } from "@/data/prices";
import { redisSet } from "@/lib/redis";
import { loadCatalog } from "./catalog";
import { FEED_CONFIGS, FEED_TRANSPORT } from "./configs";
import { hasExistingOffer } from "./existing-offers";
import { matchFeedAgainstCatalog } from "./matcher";
import { parsePartnerAdsXml } from "./adapters/partner-ads-xml";
import { parseGoogleShoppingRss } from "./adapters/google-shopping-rss";
import type { FeedCandidate, FeedRunSummary, NormalizedFeedItem } from "./types";

/** feedrun:, feedcandidate:, and price: keys all self-heal via TTL rather
 * than an explicit delete (src/lib/redis.ts has no redisDel) — a run that
 * stops happening should let its stale writes expire rather than keep
 * serving a price/candidate that's no longer confirmed. Picked a few days
 * longer than the intended run cadence; no cron exists yet, so runs are
 * manual for now. */
const FEED_SYNC_TTL_SECONDS = 60 * 60 * 24 * 3;

/**
 * fetch()'s body is a Web ReadableStream<Uint8Array>. Readable.fromWeb()
 * would hand the adapters plain Uint8Array chunks, which are NOT Buffer
 * instances — both adapters' Buffer.isBuffer()/`(chunk as Buffer).toString()`
 * checks silently mishandle that (mojibake on the latin1 feed, broken
 * stringification on the RSS one). Wrapping each chunk in a real Buffer
 * here keeps true streaming (no full-feed buffering — matters for
 * Komplett's ~6,230-item feed) while giving the adapters what they expect.
 */
async function* toBufferChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<Buffer> {
  const reader = body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      if (value) yield Buffer.from(value);
    }
  } finally {
    reader.releaseLock();
  }
}

/** Exported so spot-check.ts's runner can reuse the same fetch/decode path
 * rather than duplicating it. */
export async function fetchFeedItems(retailer: RetailerSlug): Promise<NormalizedFeedItem[]> {
  const transport = FEED_TRANSPORT[retailer];
  const url = process.env[transport.feedUrlEnv];
  if (!url) throw new Error(`${transport.feedUrlEnv} not set`);

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`fetch ${retailer} feed failed: HTTP ${res.status}`);
  }

  const stream = Readable.from(toBufferChunks(res.body));

  if (transport.adapter === "partner-ads") {
    return parsePartnerAdsXml(stream, { stripTitleSuffix: transport.stripTitleSuffix });
  }
  return parseGoogleShoppingRss(stream);
}

export interface RunFeedSyncOptions {
  /** Skip every Redis write; return what would have been written in the
   * summary instead, for inspection against the historical ground-truth
   * scripts/{retailer}-ean-matches.json before trusting a live run. */
  dryRun?: boolean;
}

export interface RunFeedSyncResult {
  summary: FeedRunSummary;
  /** Only populated in dryRun mode. */
  wouldWritePrices?: Array<{ key: string; value: OfferOverride }>;
  wouldWriteCandidates?: FeedCandidate[];
}

export async function runFeedSync(
  retailer: RetailerSlug,
  options: RunFeedSyncOptions = {}
): Promise<RunFeedSyncResult> {
  const fetchedAt = new Date().toISOString();
  const errors: string[] = [];
  let items: NormalizedFeedItem[] = [];

  try {
    items = await fetchFeedItems(retailer);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const config = FEED_CONFIGS[retailer];
  const catalog = loadCatalog();
  const { matches } = matchFeedAgainstCatalog(items, catalog, config.mapFeedCategory, config.brandAliasFeedToCatalog);

  const wouldWritePrices: Array<{ key: string; value: OfferOverride }> = [];
  const wouldWriteCandidates: FeedCandidate[] = [];

  for (const match of matches.values()) {
    if (hasExistingOffer(match.slug, retailer)) {
      // Only a refresh on an already human-verified pair is safe to
      // automate. priceDkk is omitted (not written as null) when the feed
      // didn't give a price, so a good static/prices.json price is never
      // clobbered by a missing one.
      const value: OfferOverride = { inStock: match.inStock };
      if (match.priceDkk != null) value.prisDkk = match.priceDkk;

      wouldWritePrices.push({ key: `price:${match.slug}__${retailer}`, value });
      if (!options.dryRun) {
        await redisSet(`price:${match.slug}__${retailer}`, value, FEED_SYNC_TTL_SECONDS);
      }
    } else {
      // A brand-new pairing must never be auto-applied — surfaced for
      // manual review only.
      const candidate: FeedCandidate = {
        retailer,
        slug: match.slug,
        category: match.category,
        feedTitle: match.feedTitle,
        gtin: match.ean,
        priceDkk: match.priceDkk,
        inStock: match.inStock,
        produktUrl: match.produktUrl,
        affiliateUrl: match.affiliateUrl,
        discoveredAt: fetchedAt,
        eanConfirmed: match.eanConfirmed,
      };
      wouldWriteCandidates.push(candidate);
      if (!options.dryRun) {
        await redisSet(`feedcandidate:${retailer}:${match.slug}`, candidate, FEED_SYNC_TTL_SECONDS);
      }
    }
  }

  const summary: FeedRunSummary = {
    retailer,
    fetchedAt,
    itemCount: items.length,
    matchedCount: matches.size,
    unmatchedCount: catalog.length - matches.size,
    errors,
  };
  if (!options.dryRun) {
    await redisSet(`feedrun:${retailer}:latest`, summary, FEED_SYNC_TTL_SECONDS);
  }

  return { summary, wouldWritePrices, wouldWriteCandidates };
}

/** Runs every retailer; one retailer's failure never blocks the others
 * (runFeedSync itself already catches fetch/parse errors into
 * summary.errors, so this only guards against something throwing past
 * that, e.g. a Redis write). */
export async function runAllFeedSyncs(options: RunFeedSyncOptions = {}): Promise<RunFeedSyncResult[]> {
  const retailers = Object.keys(FEED_CONFIGS) as RetailerSlug[];
  const settled = await Promise.allSettled(retailers.map((r) => runFeedSync(r, options)));

  return settled.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    const retailer = retailers[i];
    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    return {
      summary: {
        retailer,
        fetchedAt: new Date().toISOString(),
        itemCount: 0,
        matchedCount: 0,
        unmatchedCount: 0,
        errors: [message],
      },
    };
  });
}
