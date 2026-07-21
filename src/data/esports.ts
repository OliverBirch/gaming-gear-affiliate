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
  {
    slug: "valorant",
    navn: "Valorant",
    genre: "fps",
    aktiv: true,
    beskrivelse:
      "Valorant er en taktisk hero-shooter, hvor præcision og reaktionstid er afgørende. Pros bruger typisk letvægtsmus med lave eDPI-værdier for præcist crosshair-placement.",
    heroImage: "/images/esports/valorant.jpg",
    musProfil: {
      vaegtVigtighed: 4,
      knapBehov: "minimal",
      wirelessForventet: true,
      typiskDpi: [800, 1600],
    },
  },
  {
    slug: "r6",
    navn: "Rainbow Six Siege",
    genre: "fps",
    aktiv: true,
    beskrivelse:
      "Rainbow Six Siege er en taktisk first-person shooter, hvor holdbaserede angreb og forsvar kræver præcision og kommunikation. Pros bruger ofte lav DPI med en unik multiplikator for at opnå pixel-præcist aim gennem små sprækker og huller.",
    heroImage: "/images/esports/r6.jpg",
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
