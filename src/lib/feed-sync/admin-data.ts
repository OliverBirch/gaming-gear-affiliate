import { RETAILER_SLUGS, type RetailerSlug } from "@/lib/types";
import { redisGet, redisKeys } from "@/lib/redis";
import type { FeedCandidate, FeedRunSummary } from "./types";

/** Latest run summary per retailer, `null` for one that's never run. */
export async function getFeedRuns(): Promise<Record<RetailerSlug, FeedRunSummary | null>> {
  const entries = await Promise.all(
    RETAILER_SLUGS.map(async (retailer) => [retailer, await redisGet<FeedRunSummary>(`feedrun:${retailer}:latest`)] as const)
  );
  return Object.fromEntries(entries) as Record<RetailerSlug, FeedRunSummary | null>;
}

/** Every pending feed-match candidate awaiting human review, across all
 * retailers - the slugs aren't known ahead of time, so this scans rather
 * than reading a fixed key list. */
export async function getFeedCandidates(): Promise<FeedCandidate[]> {
  const keys = await redisKeys("feedcandidate:");
  const values = await Promise.all(keys.map((key) => redisGet<FeedCandidate>(key)));
  return values.filter((v): v is FeedCandidate => v != null);
}
