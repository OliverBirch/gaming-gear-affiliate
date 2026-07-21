import type { Esport } from "@/lib/types";

export const esports: Esport[] = [
  {
    slug: "cs2",
    navn: "Counter-Strike 2",
    genre: "fps",
    aktiv: true,
    beskrivelse:
      "Counter-Strike 2 er en taktisk first-person shooter, hvor præcision og konsistens er alt. Pros foretrækker letvægtsmus med minimal vægt og høj polling rate til hurtige flick shots og præcist aim.",
    heroImage: "/images/esports/cs2.jpg",
    musProfil: {
      vaegtVigtighed: 5,
      knapBehov: "minimal",
      wirelessForventet: true,
      typiskDpi: [400, 800],
    },
  },
];

export function getEsport(slug: string): Esport | undefined {
  return esports.find((e) => e.slug === slug);
}
