import { esports } from "@/data/esports";
import { pros } from "@/data/pros";

export type TeamPage = { esport: string; slug: string };

/**
 * Unique {esport, team-slug} pairs that have a real /[esport]/hold/[slug]
 * page. Single source of truth for both `generateStaticParams` on that
 * route and the sitemap — they used to compute this independently and
 * disagreed (sitemap excluded "Content Creator" teams and didn't filter
 * by esport.aktiv; the route's generateStaticParams did neither/both the
 * other way), so the sitemap silently listed pages that didn't exist.
 */
export function getTeamPages(): TeamPage[] {
  const seen = new Set<string>();
  const teamPages: TeamPage[] = [];
  for (const e of esports.filter((e) => e.aktiv)) {
    const teams = [
      ...new Set(
        pros
          .filter((p) => p.esport === e.slug)
          .map((p) => p.hold)
          .filter(Boolean)
      ),
    ].filter((h) => h !== "Free Agent" && h !== "Retired");
    for (const team of teams) {
      const slug = team!.toLowerCase().replace(/\s+/g, "-");
      const key = `${e.slug}|${slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      teamPages.push({ esport: e.slug, slug });
    }
  }
  return teamPages;
}
