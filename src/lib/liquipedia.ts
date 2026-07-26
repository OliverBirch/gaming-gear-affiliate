/**
 * Liquipedia API integration for pro team/roster data.
 *
 * Covers CS2, Valorant, and Rainbow Six Siege via the MediaWiki API.
 * Extracts current team, status, nationality, and team history from
 * the structured infobox HTML.
 *
 * Liquipedia content is CC-BY-SA licensed. We credit via `kilde` field
 * on pros alongside prosettings.net.
 */

const LIQUIPEDIA_BASE = "https://liquipedia.net";
const GAME_PATHS: Record<string, string> = {
  cs2: "counterstrike",
  valorant: "valorant",
  r6: "rainbowsix",
};

export interface LiquipediaPro {
  slug: string;
  esport: string;
  /** Current team name as it appears on Liquipedia */
  team: string | null;
  /** Status: Active, Inactive, Retired, etc. */
  status: string | null;
  /** Country/nationality */
  nationality: string | null;
  /** Whether the player record exists on Liquipedia */
  found: boolean;
}

/**
 * Fetches team data for a pro from Liquipedia API.
 * @param slug - Pro's handle/slug (e.g. "donk", "TenZ")
 * @param esport - One of "cs2", "valorant", "r6"
 */
export async function fetchLiquipediaPro(
  slug: string,
  esport: string
): Promise<LiquipediaPro> {
  const gamePath = GAME_PATHS[esport];
  if (!gamePath) {
    return { slug, esport, team: null, status: null, nationality: null, found: false };
  }

  // Capitalize first letter for Liquipedia page titles (MediaWiki convention)
  const pageTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
  const url = `${LIQUIPEDIA_BASE}/${gamePath}/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&prop=text&section=0`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ProSetups.dk/1.0 (progear data; contact@prosetups.dk)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return { slug, esport, team: null, status: null, nationality: null, found: false };

    const data = await res.json();
    if (!data?.parse?.text?.["*"]) return { slug, esport, team: null, status: null, nationality: null, found: false };

    const html: string = data.parse.text["*"];

    return {
      slug,
      esport,
      team: extractTeam(html, esport),
      status: extractStatus(html),
      nationality: extractNationality(html),
      found: true,
    };
  } catch {
    return { slug, esport, team: null, status: null, nationality: null, found: false };
  }
}

/**
 * Batch fetch team data for multiple pros.
 * Respects rate limits by adding delay between requests.
 */
export async function fetchLiquipediaPros(
  pros: Array<{ slug: string; esport: string }>,
  delayMs = 200
): Promise<LiquipediaPro[]> {
  const results: LiquipediaPro[] = [];
  for (const pro of pros) {
    const result = await fetchLiquipediaPro(pro.slug, pro.esport);
    results.push(result);
    if (delayMs > 0) await sleep(delayMs);
  }
  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── HTML parsing helpers ─────────────────────────────────────────────

function extractTeam(html: string, esport: string): string | null {
  // CS2 + Valorant: "Team:" label in infobox → next cell has team link
  const teamMatch = html.match(
    /<div class="infobox-cell-2\s+infobox-description">\s*Team:\s*<\/div>\s*<div[^>]*>\s*<a\s[^>]*>([^<]+)<\/a>/i
  );
  if (teamMatch) return teamMatch[1].trim();

  // R6: No "Team:" field — extract from History (last table row = current)
  if (esport === "r6") {
    const historyRows = html.match(/<tr>[\s\S]*?<td class="th-mono"[^>]*>[\s\S]*?"Present"[\s\S]*?<a\s[^>]*>([^<]+)<\/a>/i);
    if (historyRows) return historyRows[1].trim();

    // Fallback: last entry in history might not say "Present" explicitly
    // Try the very last team reference in history
    const allTeams = [...html.matchAll(/<a href="\/rainbowsix\/[^"]*"[^>]*>([^<]+)<\/a>/g)];
    if (allTeams.length > 0) {
      // The last team in the history section is typically the most recent
      return allTeams[allTeams.length - 1][1].trim();
    }
  }

  return null;
}

function extractStatus(html: string): string | null {
  const match = html.match(
    /<div class="infobox-cell-2\s+infobox-description">\s*Status:\s*<\/div>\s*<div[^>]*>\s*(?:<a\s[^>]*>)?([^<]+)(?:<\/a>)?\s*<\/div>/i
  );
  if (match) return match[1].trim();
  return null;
}

function extractNationality(html: string): string | null {
  // Match: Nationality: → <a>Country</a>
  const match = html.match(
    /<div class="infobox-cell-2\s+infobox-description">\s*Nationality:\s*<\/div>[\s\S]*?<a[^>]*title="(?:Category:)?([^"]+)"[^>]*>([^<]+)<\/a>/i
  );
  if (match) return match[2]?.trim() ?? match[1]?.trim() ?? null;
  return null;
}
