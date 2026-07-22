export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "cs2-sæson-2026-roster-moves",
    title: "CS2 sæson 2026: Store roster moves og nye mus",
    description:
      "Sæsonen 2026 har bragt store roster moves i CS2-verdenen. Her er hvad spillerne nu bruger af mus og settings.",
    date: "2026-07-20",
    author: "ProSetups.dk",
    tags: ["CS2", "roster", "sæson 2026"],
    content: `2026-sæsonen i CS2 har budt på flere overraskende roster moves, der har flyttet nogle af verdens bedste spillere til nye hold. Her er et overblik over de største skift og hvad spillerne bruger af mus og settings.

## s1mple til Falcons

Efter en længere pause er s1mple tilbage på topplan med Falcons. Han fortsætter med sin Logitech G Pro X Superlight 2, som har været hans foretrukne mus gennem hele karrieren. Hans settings: 400 DPI, 2.08 in-game sens, 832 eDPI.

## karrigan til Falcons

karrigan har også skiftet til Falcons og bringer sin Razer DeathAdder V3 med sig. Med 800 DPI og 0.9 in-game sens (720 eDPI) kører han en klassisk opsætning, der har gjort ham til en af de mest erfarne in-game leaders i verden.

## Nye talenter på vej

Flere unge talenter har slået igennem i 2026. donk (Team Spirit) fortsætter med at dominere med sin Logitech G Pro X Superlight 2, 800 DPI og 1.25 sens (1000 eDPI). Hans aggressive spillestil kræver en let og responsiv mus, hvilket Superlight 2 leverer.

## Hvad betyder det for dig?

Når pros skifter hold, ændrer det sjældent deres mus- og settings-valg. De fleste pros holder fast i det setup, de kender. Det betyder, at dataene på ProSetups.dk forbliver relevante, selv når holdene skifter.`,
  },
  {
    slug: "logitech-g-pro-x-superlight-2-analyse",
    title: "Logitech G Pro X Superlight 2: Derfor bruger flest CS2-pros den",
    description:
      "Vi dykker ned i hvorfor Logitech G Pro X Superlight 2 er den mest brugte mus blandt CS2-pros - og om den er det rigtige valg for dig.",
    date: "2026-07-15",
    author: "ProSetups.dk",
    tags: ["Logitech", "Superlight 2", "anmeldelse", "CS2"],
    content: `Logitech G Pro X Superlight 2 er uden sammenligning den mest populære mus blandt CS2-pros. Men hvorfor? Og er den det rigtige valg for dig? Vi ser nærmere på, hvad der gør denne mus til førstevalget.

## Hvad siger tallene?

Af de over 900 trackede CS2-pros på ProSettings.net bruger over 60% en Logitech G Pro X Superlight 2. Det er en dominerende markedsandel, som ingen anden mus i historien har haft.

## Hvorfor vælger pros den?

Der er flere grunde:

- **Vægt:** 60 gram er let nok til hurtige flick shots men tung nok til at føles stabil
- **Form:** Den symmetriske form passer til palm, claw og fingertip greb
- **Hero 2-sensoren:** Ekstremt præcis med 4000 Hz polling rate
- **Batteritid:** 95 timer på en opladning
- **Pålidelighed:** Logitechs byggekvalitet er blandt de bedste i branchen

## Er den noget for dig?

Superlight 2 passer bedst til dig, hvis:
- Du har medium til store hænder
- Du bruger palm-, claw- eller fingertip-greb
- Du vil have en pålidelig mus uden kompromiser
- Dit budget er over 1000 kr.

Hvis du har små hænder eller foretrækker ergonomisk design, kan ZOWIE EC2-DW eller Razer DeathAdder V3 være bedre alternativer.`,
  },
  {
    slug: "valorant-pro-mus-tendenser-2026",
    title: "Valorant-pro mus og settings: Tendenser 2026",
    description:
      "Se hvilke mus Valorant-pros foretrækker i 2026, og hvordan deres settings adskiller sig fra CS2-spillerne.",
    date: "2026-07-10",
    author: "ProSetups.dk",
    tags: ["Valorant", "tendenser", "settings"],
    content: `Valorant og CS2 deler mange ting, men når det kommer til mus og settings, er der interessante forskelle. Her er tendenserne for Valorant-pros i 2026.

## Højere DPI, lavere in-game sens

Hvor CS2-pros typisk kører 400 eller 800 DPI, ser vi flere Valorant-pros på 800 og 1600 DPI med en lavere in-game sens. Det giver en glattere cursor i menuer og browser, samtidig med at eDPI'en forbliver lav.

For eksempel kører TenZ 1600 DPI med 0.24 in-game sens (384 eDPI), mens aspas kører 800 DPI med 0.37 sens (296 eDPI).

## De mest populære mus i Valorant

1. **Logitech G Pro X Superlight 2** - Brugt af aspas, cNed, yay, Derke, Sacy og mange flere
2. **Razer DeathAdder V4 Pro** - Brugt af Alfajer og pANcada
3. **ZOWIE U2-DW** - Brugt af nAts

## Hvad kan du lære af deres valg?

Valorant-pros prioriterer letvægtsmus med høj polling rate, men eDPI'en er generelt lavere end i CS2. Det skyldes, at Valorant har mindre kort og fokus på præcist crosshair-placement gennem små sprækker og huller.

Vores anbefaling: Start med 800 DPI og juster in-game sens, indtil din eDPI lander omkring 200-400. Det er sweet spot for de fleste Valorant-pros.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
