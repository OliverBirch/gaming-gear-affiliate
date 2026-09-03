/**
 * Small hand-picked set of mouse-vs-mouse comparison pairs, generated as
 * static pages at /sammenlign/mus/[par] so they have real indexable URLs —
 * unlike the query-string `?p=` picker, which deliberately canonicalizes
 * every combination onto the bare /sammenlign/mus page. Picked among mice
 * that are both pro-popular (mousePickerOptions() ranking) and have at
 * least one real offer and non-zero specs — pairing in a mouse with no
 * offers or a 0g stub spec would leave one side of the comparison empty.
 *
 * `par` is a literal lookup key, not parsed by splitting on "-vs-" — mouse
 * slugs can themselves contain hyphens, which would make that split
 * ambiguous.
 */
export type CuratedPair = {
  par: string;
  a: string;
  b: string;
  verdict: string;
};

export const CURATED_PAIRS: CuratedPair[] = [
  {
    par: "logitech-g-pro-x-superlight-2-vs-logitech-g-pro-x2-superstrike",
    a: "logitech-g-pro-x-superlight-2",
    b: "logitech-g-pro-x2-superstrike",
    verdict:
      "Begge vejer 60g og deler Logitechs Hero 2-sensor og 2,4 GHz-forbindelse — den tekniske forskel er minimal. G Pro X Superlight 2 er langt det mest brugte valg blandt pros i vores data (124 mod 34), så det er standardvalget medmindre SUPERSTRIKEs specifikke knap-features er afgørende for dig.",
  },
  {
    par: "logitech-g-pro-x-superlight-2-vs-razer-deathadder-v4-pro",
    a: "logitech-g-pro-x-superlight-2",
    b: "razer-deathadder-v4-pro",
    verdict:
      "G Pro X Superlight 2 (60g, Hero 2) er den symmetriske, letteste af de to; DeathAdder V4 Pro (56g, Focus Pro 45K Gen-2) er Razers ergonomiske form med både 2,4 GHz og Bluetooth. Begge er flagship-niveau — valget handler mest om håndform (symmetrisk vs. ergonomisk) end om specs.",
  },
  {
    par: "logitech-g-pro-x-superlight-2-vs-razer-deathadder-v3",
    a: "logitech-g-pro-x-superlight-2",
    b: "razer-deathadder-v3",
    verdict:
      "G Pro X Superlight 2 er 3g lettere (60g mod 63g) og symmetrisk, mens DeathAdder V3 Pro har Razers klassiske ergonomiske facon. Superlight 2 har langt flere trackede pro-brugere (124 mod 17) i vores data, men det afspejler også at den generelt er mere udbredt end ergo-mus i FPS-scenen.",
  },
  {
    par: "logitech-g-pro-x-superlight-2-vs-lamzu-maya-x",
    a: "logitech-g-pro-x-superlight-2",
    b: "lamzu-maya-x",
    verdict:
      "Lamzu Maya X er 10g lettere (50g mod 60g) og placeret i mellemklassen på pris, mod Superlight 2's flagship-niveau. Superlight 2 har flest trackede pro-brugere af de to (124 mod 10), men Maya X's PAW3395-sensor og lavere pris gør den til et solidt budgetalternativ.",
  },
  {
    par: "logitech-g-pro-x2-superstrike-vs-razer-deathadder-v4-pro",
    a: "logitech-g-pro-x2-superstrike",
    b: "razer-deathadder-v4-pro",
    verdict:
      "SUPERSTRIKE (60g, symmetrisk) og DeathAdder V4 Pro (56g, ergonomisk) er begge flagship-mus men med forskellig facon og sensor (Hero 2 mod Focus Pro 45K Gen-2). DeathAdder V4 Pro er 4g lettere og tilbyder Bluetooth som ekstra forbindelsesmulighed.",
  },
  {
    par: "logitech-g-pro-x2-superstrike-vs-razer-deathadder-v3",
    a: "logitech-g-pro-x2-superstrike",
    b: "razer-deathadder-v3",
    verdict:
      "SUPERSTRIKE er den lettere af de to (60g mod 63g) og symmetrisk, mens DeathAdder V3 Pro er ergonomisk formet. Begge er flagship-niveau med 2,4 GHz-forbindelse; valget afhænger primært af om du foretrækker symmetrisk eller ergonomisk facon.",
  },
  {
    par: "logitech-g-pro-x2-superstrike-vs-lamzu-maya-x",
    a: "logitech-g-pro-x2-superstrike",
    b: "lamzu-maya-x",
    verdict:
      "Maya X er markant lettere (50g mod 60g) og ligger i mellemklassen på pris, mod SUPERSTRIKEs flagship-niveau. SUPERSTRIKE har flere trackede pro-brugere (34 mod 10), men Maya X er det billigere valg med stadig konkurrencedygtige specs.",
  },
  {
    par: "razer-deathadder-v4-pro-vs-razer-deathadder-v3",
    a: "razer-deathadder-v4-pro",
    b: "razer-deathadder-v3",
    verdict:
      "V4 Pro er 7g lettere end V3 Pro (56g mod 63g) og opgraderer sensoren til Focus Pro 45K Gen-2 samt tilføjer Bluetooth ved siden af 2,4 GHz. Begge deler samme ergonomiske DeathAdder-facon, så V4 Pro er den nyere, lettere efterfølger i samme form.",
  },
  {
    par: "razer-deathadder-v4-pro-vs-lamzu-maya-x",
    a: "razer-deathadder-v4-pro",
    b: "lamzu-maya-x",
    verdict:
      "DeathAdder V4 Pro (56g, ergonomisk, flagship) og Maya X (50g, symmetrisk, mellemklasse) er formmæssigt og prismæssigt forskellige valg. Maya X er den lettere og billigere af de to; DeathAdder V4 Pro har flere trackede pro-brugere (22 mod 10).",
  },
  {
    par: "razer-deathadder-v3-vs-lamzu-maya-x",
    a: "razer-deathadder-v3",
    b: "lamzu-maya-x",
    verdict:
      "Maya X er 13g lettere end DeathAdder V3 Pro (50g mod 63g) og koster mindre, men DeathAdder V3 Pro har flere trackede pro-brugere (17 mod 10) og Razers ergonomiske facon frem for Maya X's symmetriske design.",
  },
];

export function findCuratedPair(slugA: string, slugB: string): CuratedPair | undefined {
  return CURATED_PAIRS.find(
    (p) => (p.a === slugA && p.b === slugB) || (p.a === slugB && p.b === slugA)
  );
}
