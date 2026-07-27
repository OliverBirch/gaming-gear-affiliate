/**
 * Team logos for UI chips (hero, pro detail, etc.).
 * Keys are normalized hold names (lowercase, collapsed whitespace).
 * Missing holds simply omit the logo.
 *
 * Logos sourced from ProSettings.net CDN via scripts/fetch-team-logos.mjs.
 * Fallback monograms via scripts/_gen-team-monograms.mjs for teams not on ProSettings.
 */
const TEAM_LOGOS: Record<string, string> = {
  "team spirit": "/images/teams/team-spirit.png",
  spirit: "/images/teams/team-spirit.png",
  "g2 esports": "/images/teams/g2-esports.png",
  g2: "/images/teams/g2-esports.png",
  "team vitality": "/images/teams/vitality.png",
  vitality: "/images/teams/vitality.png",
  sentinels: "/images/teams/sentinels.png",
  falcons: "/images/teams/falcons.png",
  "team falcons": "/images/teams/falcons.png",
  "falcons esports": "/images/teams/falcons.png",
  astralis: "/images/teams/astralis.svg",
  navi: "/images/teams/navi.svg",
  "natus vincere": "/images/teams/navi.svg",
  faze: "/images/teams/faze.svg",
  "faze clan": "/images/teams/faze.svg",
  liquid: "/images/teams/liquid.svg",
  "team liquid": "/images/teams/liquid.svg",
  mouz: "/images/teams/mouz.png",
  mousesports: "/images/teams/mouz.png",
  furia: "/images/teams/furia.png",
  "furia esports": "/images/teams/furia.png",
  heroic: "/images/teams/heroic.svg",
  cloud9: "/images/teams/cloud9.svg",
  "cloud 9": "/images/teams/cloud9.svg",
  "100 thieves": "/images/teams/100-thieves.png",
  "100t": "/images/teams/100-thieves.png",
  loud: "/images/teams/loud.png",
  fnatic: "/images/teams/fnatic.svg",
  "the mongolz": "/images/teams/mongolz.png",
  mongolz: "/images/teams/mongolz.png",
  "edward gaming": "/images/teams/edward-gaming.png",
  edg: "/images/teams/edward-gaming.png",
  nrg: "/images/teams/nrg.png",
  "nrg esports": "/images/teams/nrg.png",
  "karmine corp": "/images/teams/karmine-corp.png",
  "team heretics": "/images/teams/heretics.png",
  heretics: "/images/teams/heretics.png",
  "w7m esports": "/images/teams/w7m.png",
  t1: "/images/teams/t1.png",
  mibr: "/images/teams/mibr.png",
  "paper rex": "/images/teams/paper-rex.png",
  "gen.g": "/images/teams/geng.svg",
  geng: "/images/teams/geng.svg",
};

function normalizeHold(hold: string): string {
  return hold
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTeamLogo(hold: string | null | undefined): string | undefined {
  if (!hold) return undefined;
  const key = normalizeHold(hold);
  if (TEAM_LOGOS[key]) return TEAM_LOGOS[key];
  const stripped = key.replace(/^(team|org|esports)\s+/, "").trim();
  if (stripped !== key && TEAM_LOGOS[stripped]) return TEAM_LOGOS[stripped];
  return undefined;
}
