# HANDOVER — Dansk esport-mus ekspertside (affiliate)

> **Til:** Claude Code
> **Fra:** Oliver
> **Projekttype:** SEO-drevet affiliate-site, dansksproget, niche = "hvilken mus bruger pros i hver esport"
> **Arbejdstitel / domæne:** `[DOMÆNE]` — forslag: `promus.dk`, `esportgear.dk`, `promus.gg`. Vælg og lås før build.

---

## 0. TL;DR for build-agenten

Byg et statisk-genereret, dansksproget affiliate-site der besvarer ét spørgsmål bedre end nogen anden på dansk: **"hvilken mus skal jeg købe til det spil jeg spiller — og hvad bruger pros?"**

Kernen er tre ting:
1. **Struktureret pro-data pr. esport** (mus + settings), normaliseret i en canonical datamodel.
2. **Et finder-værktøj** (quiz) der matcher bruger → mus → **bedst-betalende danske affiliate-tilbud**.
3. **En affiliate link-resolver** der pr. produkt vælger den DK-butik med højeste payout og tracker klik.

Datastrukturen (ikke selve rådataen) er moaten. prosettings.net ejer engelsk rådata; vi ejer **dansk syntese + køb-routing til danske forhandlere**.

---

## 1. Mål og ikke-mål

**Mål**
- Ranke på danske long-tail transaktionelle keywords: `bedste mus til cs2`, `[pro] mus`, `bedste letvægtsmus fps`, `bedste mus til fingertip greb`, `bedste mus små hænder`.
- Konvertere via "Se pris"-CTA'er til danske forhandlere.
- Være hurtig (Core Web Vitals grøn) og teknisk ren — det er en SEO-forudsætning, ikke pynt.

**Ikke-mål (v1)**
- Ikke en generisk prissammenligner à la Pricempire (rødt hav, data-moat).
- Ikke gambling/skins.
- Ikke fysiske egne tests (vi syntetiserer pro-usage + eksterne målinger, og er transparente om det).

---

## 2. Tech stack

| Lag | Valg | Begrundelse |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Matcher Olivers eksisterende stack; SSG/ISR er ideelt til SEO-affiliate |
| Styling | **Tailwind CSS** + shadcn/ui | Hurtig, konsistent, god til spec-tabeller/kort |
| Content | **MDX + Contentlayer** (eller Sanity hvis redaktionelt workflow ønskes senere) | Typede content-collections; start filbaseret, migrer til CMS ved behov |
| Rendering | **ISR** (revalidate pr. side-type) | Pro-data og priser ændrer sig; statisk med periodisk revalidation |
| Hosting | **Vercel** | ISR/edge out-of-the-box |
| Analytics | **GA4 + server-side tagging** (GTM server container) | Olivers domæne; konsent-gated |
| Consent | **Consent Mode v2** (CookieScript eller Cookiebot) | Lovpligtigt; Oliver har sat det op før |

**Arkitektur-princip (genbrug fra MetaOps):** function-services må aldrig branche på hvor produktet sælges. Én canonical `Mouse` + én `AffiliateOffer`-abstraktion; retailer-identitet lever kun i data, ikke i logik.

---

## 3. Canonical datamodel

Alle typer i `/lib/types.ts`. Content seedes som MDX/JSON og valideres mod Zod-skemaer ved build (fail-closed — mirror MetaOps-validatoren).

```ts
// --- Esport ---
interface Esport {
  slug: string;              // "cs2", "valorant", "lol", "fortnite", "apex", "ow2", "r6", "rocket-league"
  navn: string;              // "Counter-Strike 2"
  genre: "fps" | "moba" | "battle-royale" | "hero-shooter";
  musProfil: MouseProfile;   // hvad genren kræver af en mus
  aktiv: boolean;
}

// hvad genren "kræver" — driver finder-scoring og redaktionel vinkel
interface MouseProfile {
  vaegtVigtighed: 1 | 2 | 3 | 4 | 5;   // FPS = 5 (letvægt), MMO/MOBA lavere
  knapBehov: "minimal" | "medium" | "mange"; // FPS = minimal, MMO = mange
  wirelessForventet: boolean;
  typiskDpi: number[];                 // fx [400, 800] for FPS
}

// --- Pro player ---
interface Pro {
  slug: string;              // "zywoo", "s1mple", "donk"
  navn: string;
  esport: string;            // Esport.slug
  hold?: string;             // Team.slug
  land?: string;
  musSlug: string;           // Mouse.slug — den mus de bruger
  settings: {
    dpi: number;
    inGameSens: number;
    edpi: number;            // dpi * sens (den tal der faktisk betyder noget)
    pollingHz?: number;
  };
  kilde: string;             // "prosettings.net" | "liquipedia" — ALTID krediteret
  sidstVerificeret: string;  // ISO-dato — pro-gear skifter, dato skal vises
}

// --- Mouse ---
interface Mouse {
  slug: string;              // "logitech-g-pro-x-superlight-2"
  navn: string;
  brand: string;
  vaegtGram: number;
  formfaktor: "ergonomisk" | "symmetrisk" | "ambidextrous";
  greb: ("palm" | "claw" | "fingertip")[]; // hvilke greb den passer til
  haandStoerrelse: ("lille" | "medium" | "stor")[];
  wireless: boolean;
  sensor: string;
  maxDpi: number;
  pollingHz: number;
  prisNiveau: "budget" | "mid" | "flagship";
  offers: AffiliateOffer[]; // udfyldes af resolver, ikke redaktionelt
}

// --- Affiliate ---
interface AffiliateOffer {
  retailer: string;          // Retailer.slug
  produktUrl: string;        // deep link til produktet hos forhandler
  affiliateUrl: string;      // cloaked/tracked link (via /go/[id])
  prisDkk?: number;          // hentes hvis feed/API tilgængeligt, ellers null
  payoutPct: number;         // vores commission — driver "best offer"-valg
  inStock?: boolean;
}

interface Retailer {
  slug: string;              // "proshop", "computersalg", "coolshop", "maxgaming"
  navn: string;
  netvaerk: "partner-ads" | "adtraction" | "impact" | "daisycon" | "direkte";
  basePayoutPct: number;
  cookieDage: number;
}
```

---

## 4. Pro-data sourcing (vigtigt — læs før du bygger)

Indholdspræmissen er "hvad pros bruger". Rådataen findes hos **prosettings.net**, **proconfig.net** og **Liquipedia**.

**Regler:**
- **Krediter altid kilden** pr. pro-datapunkt (`Pro.kilde`) og vis `sidstVerificeret`-dato på siden. Pro-gear skifter med roster-moves og nye launches — udaterede data dræber troværdighed.
- **Skrab ikke aggressivt.** Behandl det som manuelt/semi-manuelt seedet data i v1 (MDX/JSON), ikke en live scraper. En evt. sync-pipeline senere skal respektere kilders ToS og rate-limits.
- Dataen er **faktuel** (usage-counts), så vores værdi er *dansk syntese + kontekst + køb-routing*, ikke reproduktion af deres tabeller.

**Seed-data til v1 (verificeret jul. 2026, CS2 som pilot — udvid pr. esport):**
- Konsensus-mus CS2: **Logitech G Pro X Superlight 2** (klart mest brugte), **Razer Viper V3 Pro** (bl.a. ZywOo), **ZOWIE EC2-DW** (billigere pro-grade indgang).
- 92% af CS2-pros kører 400 eller 800 DPI — brug det som redaktionelt anker ("du skal ikke over 800").
- Hver seed-pro skal have: mus, DPI, in-game sens, eDPI, kilde, dato.

---

## 5. Affiliate link-resolver

Central logik i `/lib/affiliate.ts`. **Ingen affiliate-URL hardcodes i content.**

```ts
// Vælg bedst-betalende in-stock tilbud pr. mus
function bestOffer(mouse: Mouse): AffiliateOffer | null {
  return mouse.offers
    .filter(o => o.inStock !== false)
    .sort((a, b) => b.payoutPct - a.payoutPct)[0] ?? null;
}
```

- Alle udgående links går via intern redirect: `/go/[offerId]` → logger klik (GA4 event `affiliate_click` med retailer, mouse, esport, placement) → 302 til `affiliateUrl`.
- Klik-tracking er konsent-gated (Consent Mode v2). Uden marketing-consent: stadig redirect, men ingen tracking.
- `rel="sponsored nofollow"` på alle affiliate-links (Google-krav + korrekt).
- Prioriteret retailer-pool: **Partner-ads (Proshop, Computersalg, Coolshop)** primær; **MaxGaming** for gaming-troværdighed; **Razer/Logitech/SteelSeries direkte** hvor payout er højere pr. SKU.

---

## 6. Finder-værktøjet (konverteringsmotor + SEO-magnet)

Interaktiv quiz på `/find-mus`. State i React (ingen browser-storage). Output: rangeret liste med best-offer-CTA pr. mus.

**Inputs:**
1. Hvilket spil? (esport-dropdown)
2. Greb? (palm / claw / fingertip / "ved ikke" → vis kort guide)
3. Håndstørrelse? (lille / medium / stor — med cm-guide)
4. Trådløs eller kablet? (ligeglad tilladt)
5. Budget? (budget / mid / flagship)

**Scoring (simpel vægtet match, ikke ML):**
```ts
function scoreMouse(m: Mouse, svar: FinderInput, esport: Esport): number {
  let score = 0;
  if (m.greb.includes(svar.greb)) score += 3;
  if (m.haandStoerrelse.includes(svar.haand)) score += 2;
  if (svar.wireless == null || m.wireless === svar.wireless) score += 1;
  if (m.prisNiveau === svar.budget) score += 2;
  // vægt letvægt op for FPS via esport.musProfil.vaegtVigtighed
  if (esport.musProfil.vaegtVigtighed >= 4 && m.vaegtGram <= 65) score += 2;
  // bonus hvis mus faktisk bruges af pros i den esport
  if (prosUsingMouse(m.slug, esport.slug) > 0) score += 3;
  return score;
}
```

Output-kort viser: mus, hvorfor den matcher, hvor mange pros i den esport bruger den, og **best-offer "Se pris hos [forhandler]"-knap**.

---

## 7. Sidestruktur & touchpoints

| Rute | Type | SEO-mål | Affiliate-touchpoint |
|---|---|---|---|
| `/` | Forside | brand + finder-indgang | finder-CTA |
| `/find-mus` | Finder-quiz | `find bedste gaming mus` | best-offer pr. resultat |
| `/[esport]` | Esport-hub | `bedste mus til cs2` | top-picks med "Se pris" |
| `/[esport]/pros` | Pro-oversigt | `cs2 pro mus` | mus-links pr. pro |
| `/pro/[slug]` | Pro-profil | `[pro] mus settings` | deres mus + best offer |
| `/mus/[slug]` | Mus-review | `[mus] test dansk` | best-offer + alternativer |
| `/sammenlign/[a]-vs-[b]` | Comparison | `[a] vs [b]` | begge mus med CTA |
| `/guides/greb` | Guide | `palm claw fingertip greb` | intern link til finder |
| `/blog` | Nyheder | roster-skift, nye launches | kon2ekstuelle links |
| `/om` + `/transparens` | Trust | E-E-A-T | lovpligtig affiliate-disclosure |

**Tekniske touchpoints:** nyhedsbrev-signup (pris-alert lead magnet), Consent Mode v2 banner, schema.org markup (se §8), intern link-graf (esport-hub ↔ pro ↔ mus ↔ comparison).

**Konverterings-touchpoints:** finder-resultat, top-picks på esport-hub, best-offer-knap på pro/mus-sider, comparison-tabeller, kontekstuelle in-content links.

---

## 8. SEO-krav (ikke til forhandling)

- **Schema.org** pr. sidetype: `Product` + `Review` + `AggregateRating` (mus-sider), `ItemList` (hubs/finder), `FAQPage` (guides), `BreadcrumbList` (alt).
- Statisk render alt indekserbart (SSG/ISR). Finder-tool skal have en indekserbar landing selv om quizzen er client-side.
- Danske hreflang/`lang="da"`. Ingen auto-oversat tekst — **native dansk** (se §9).
- Hurtige billeder (next/image, AVIF/WebP), lazy load under fold.
- Intern linking: hver mus linker til de esports+pros den optræder i, og omvendt.

---

## 9. Content-krav: NATIVE DANSK

- **Al content skrives på dansk fra bunden** — ikke oversat fra engelske pro-settings-sider. Det er hele forskellen fra churn-konkurrenterne (hverdagsfreak, fedegadgets, productpare m.fl. der åbenlyst kører oversat/AI-tyndt indhold og selv skriver "vi tester ikke fysisk").
- Dansk copywriting-konvention (jf. Olivers framework): parataktisk rytme, understatement, konkret frem for hypende. Undgå "verdens bedste mus"-superlativ-spam som konkurrenterne.
- Hver anbefaling er **deskriptiv, ikke præskriptiv**: "168 af 925 trackede CS2-pros kører denne" — ikke "den bedste mus i verden".
- Kode-identifikatorer, types og kommentarer på engelsk (standard). Prosa/UI/content på dansk.

---

## 10. Dansk jura & compliance

- **Markedsføringsloven:** affiliate-links skal være tydeligt markeret som reklame/annonce. Disclosure øverst på hver side med affiliate-links + en `/transparens`-side. Forbrugerombudsmanden håndhæver dette.
- **Consent Mode v2:** ingen ikke-essentielle cookies/tracking før consent. Affiliate-redirect må ske uden consent, men klik-*tracking* er gated.
- **Prisvisning:** hvis priser vises, skal de være aktuelle eller tydeligt tidsstemplet ("pris pr. [dato]"). Ellers vis kun "Se pris hos [forhandler]".

---

## 11. Faset build-plan

**Fase 1 — Fundament (pilot: CS2)**
- Next.js + TS + Tailwind + Contentlayer scaffold.
- Datamodel + Zod-validering + `/go/[id]` redirect + resolver.
- Seed CS2: ~10 mus, ~15 pros, 3 retailers (Proshop, Computersalg, MaxGaming).
- Sider: forside, `/cs2`, `/mus/[slug]`, `/pro/[slug]`.
- Consent Mode v2 + affiliate-disclosure + GA4.

**Fase 2 — Finder + dybde**
- `/find-mus` quiz + scoring.
- Comparison-sider + greb/håndstørrelse-guides.
- Schema.org fuldt udrullet.

**Fase 3 — Skalering**
- Udvid til Valorant, LoL, Fortnite, Apex (pr. esport = ny `Esport` + seed).
- Blog (roster-skift, nye launches) for friskhed-signal.
- Nyhedsbrev + pris-alert lead magnet.
- Brand-direkte affiliate (Razer/Logitech/SteelSeries) i resolver.

**Fase 4 — Optimering**
- A/B på CTA-placering (Olivers styrke).
- Evt. semi-automatisk pro-data-sync (respekter kilders ToS).
- Server-side tagging for robust tracking post-consent.

---

## 12. Åbne beslutninger (afklar med Oliver før relevant fase)

1. **Domæne** — vælg og lås.
2. **CMS-vej:** filbaseret MDX hele vejen, eller Sanity fra fase 2? (redaktionelt workflow vs. simplicitet)
3. **Esport-rækkefølge efter CS2:** Valorant først (størst mus-købsintent) — bekræft.
4. **Pris-data:** vise live priser (kræver feed/API pr. retailer) eller kun "Se pris"-knap i v1?
5. **Scope-udvidelse:** kun mus, eller "gear pr. rolle" (mus + musemåtte + tastatur) for højere kurvværdi? Anbefaling: mus i v1, udvid i fase 3.

---

## 13. Kontekst der ikke må tabes

- Affiliate-økonomien er tynd (2,5–5% pr. mus, engangs, elektronik har høj returrate). Derfor er **volumen via long-tail + finder-konvertering + evt. bundle-udvidelse** afgørende — ikke bredt "bedste gaming mus"-head-term (rødt hav).
- Konkurrenterne på dansk er mange men svage. Vind på **kvalitet, native dansk, pro-data-friskhed og et reelt værktøj** — ikke på at kopiere deres top-5-lister.