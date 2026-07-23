const ROMAN_MAP: Record<string, string> = {
  ii: "2", iii: "3", iv: "4", vi: "6",
  vii: "7", viii: "8", ix: "9", xi: "11",
};

const STOP_WORDS = [
  "wireless", "trådløs", "kablet", "headset", "gaming", "lightspeed",
  "black", "white", "red", "blue", "green", "magenta", "pink", "purple", "orange",
  "edition", "rgb", "usb", "aux",
];

export function normalizeProductName(name: string): string {
  let s = name.toLowerCase();

  for (const [roman, digit] of Object.entries(ROMAN_MAP)) {
    s = s.replace(new RegExp(`\\b${roman}\\b`, "g"), digit);
  }

  for (const word of STOP_WORDS) {
    s = s.replace(new RegExp(`\\b${word}\\b`, "g"), "");
  }

  s = s.replace(/[^a-z0-9øæå]/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export interface DuplicateSuggestion {
  navn: string;
  slug: string;
  score: number;
}

export function findDuplicateSuggestions(
  candidateName: string,
  existing: { navn: string; slug: string }[],
  threshold = 0.5
): DuplicateSuggestion[] {
  const candidateNormalized = normalizeProductName(candidateName);
  const candidateTokens = candidateNormalized.split(" ").filter(Boolean);

  if (candidateTokens.length === 0) return [];

  return existing
    .map((p) => {
      const existingNormalized = normalizeProductName(p.navn);
      const existingTokens = existingNormalized.split(" ").filter(Boolean);

      const intersection = candidateTokens.filter((t) => existingTokens.includes(t));
      const union = new Set([...candidateTokens, ...existingTokens]);
      const jaccard = union.size > 0 ? intersection.length / union.size : 0;

      const slugMatch = p.slug === candidateNormalized.replace(/\s+/g, "-");

      return { navn: p.navn, slug: p.slug, score: slugMatch ? 1 : jaccard };
    })
    .filter((p) => p.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

export function isSlugTaken(
  slug: string,
  existing: { slug: string }[]
): boolean {
  return existing.some((p) => p.slug === slug);
}
