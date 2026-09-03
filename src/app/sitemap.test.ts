import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { getTeamPages } from "@/data/pro-teams";
import { SITE_URL } from "@/lib/schema-org";

describe("sitemap", () => {
  it("has no duplicate URLs", () => {
    const entries = sitemap();
    const locs = entries.map((e) => e.url);
    expect(new Set(locs).size).toBe(locs.length);
  });

  // The team-page section used to dedupe by Set-of-object-literals (a no-op —
  // Set dedupes by reference) and used a filter that disagreed with the
  // route's own generateStaticParams, so the sitemap listed pages that didn't
  // exist and duplicated the ones that did. getTeamPages() is now the single
  // source both consume, but this pins the sitemap's actual output shape.
  it("emits exactly one URL per team page, matching getTeamPages()", () => {
    const entries = sitemap();
    const sitemapUrls = new Set(entries.map((e) => e.url));
    const teamPages = getTeamPages();

    expect(teamPages.length).toBeGreaterThan(0);
    for (const t of teamPages) {
      expect(sitemapUrls.has(`${SITE_URL}/${t.esport}/hold/${t.slug}`)).toBe(true);
    }

    const holdUrls = entries.filter((e) => e.url.includes("/hold/"));
    expect(holdUrls.length).toBe(teamPages.length);
  });
});
