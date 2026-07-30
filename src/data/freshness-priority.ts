/**
 * Priority lists for pro re-verification.
 * Tier-1 pros represent the most visible/highest-traffic players and should be
 * re-verified most frequently (≤ 30 days).
 *
 * These lists are a starting point and should be updated as the scene evolves.
 * Source: HLTV top 20 (CS2) + VCT/Liquipedia rankings (Valorant) + R6 event picks.
 */

export const PRIORITY_CS2 = [
  "donk", "m0nesy", "zywoo", "niko", "ropz", "xantares",
  "s1mple", "kyousuke", "jimpphat", "frozen",
  "spinx", "flamez", "twistzz", "elige", "broky",
  "sh1ro", "w0nderful", "isak", "bit", "jambo",
];

export const PRIORITY_VALORANT = [
  "tenz", "aspas", "zekken", "something", "f0rsaken",
  "demon1", "leaf", "alfajer", "leo", "c0m",
  "meteor", "chronicle", "marved", "bang", "cryocells",
];

export const PRIORITY_R6 = [
  "shaiiko", "pengu", "canadian", "nade", "fabian",
  "nxrway", "spoit", "beaulo", "jume", "likemike",
];

export function getPriorityPros(): Map<string, "cs2" | "valorant" | "r6"> {
  const map = new Map<string, "cs2" | "valorant" | "r6">();
  for (const slug of PRIORITY_CS2) map.set(slug, "cs2");
  for (const slug of PRIORITY_VALORANT) map.set(slug, "valorant");
  for (const slug of PRIORITY_R6) map.set(slug, "r6");
  return map;
}

/** Returns a priority pro list sorted by verification age (oldest first). */
export function getPriorityReVerifyList(
  pros: Array<{ slug: string; navn: string; esport: string; sidstVerificeret: string }>,
  maxAgeDays = 30
): Array<{ slug: string; navn: string; esport: string; ageDays: number }> {
  const priority = getPriorityPros();
  const now = Date.now();
  return pros
    .filter((p) => {
      const esport = priority.get(p.slug);
      if (!esport || esport !== p.esport) return false;
      const age = Math.floor((now - new Date(p.sidstVerificeret).getTime()) / (1000 * 60 * 60 * 24));
      return age > maxAgeDays;
    })
    .map((p) => ({
      slug: p.slug,
      navn: p.navn,
      esport: p.esport,
      ageDays: Math.floor((now - new Date(p.sidstVerificeret).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.ageDays - a.ageDays);
}
