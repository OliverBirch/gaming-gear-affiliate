import type { Metadata } from "next";
import FinderQuiz, { type MousePriceInfo } from "@/components/finder-quiz";
import { mice } from "@/data/mice";
import { bestOffers } from "@/lib/affiliate";
import { breadcrumbList, faqSchema, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Find din gaming-mus",
  description:
    "Svar på 5 spørgsmål og find den bedste gaming-mus til dig baseret på dit spil, greb, håndstørrelse og budget.",
  path: "/find-mus",
});

export default async function FindMusPage() {
  // FinderQuiz is a client component: it scores mice from arbitrary quiz
  // answers, so we can't know in advance which mice it'll show. Resolve
  // prices for the whole (small) catalog server-side instead and hand the
  // result down as a plain prop.
  const priceMap: Record<string, MousePriceInfo> = Object.fromEntries(
    await Promise.all(
      mice.map(async (m) => {
        const offers = await bestOffers(m);
        const lowestPrice = offers.reduce((min, o) => {
          if (o.prisDkk != null && o.prisDkk < min) return o.prisDkk;
          return min;
        }, Infinity);
        return [m.slug, { hasOffers: offers.length > 0, lowestPrice: lowestPrice === Infinity ? null : lowestPrice }];
      })
    )
  );

  const faqItems = [
    {
      q: "Hvilket greb bruger du på din mus?",
      a: "Palm-greb: hele hånden hviler på musen. Claw-greb: håndfladen hviler, fingrene er krummet. Fingertip-greb: kun fingerspidserne rører musen.",
    },
    {
      q: "Hvilken håndstørrelse har du?",
      a: "Lille (under 17 cm), Medium (17-20 cm) eller Stor (over 20 cm) målt fra håndrod til langefinger.",
    },
    {
      q: "Hvad koster en god gaming-mus?",
      a: "Budget: under 500 kr. Mellemklasse: 500-1000 kr. Flagship: over 1000 kr. Pros bruger typisk flagskibsmus som Logitech G Pro X Superlight 2 og Razer Viper V3 Pro.",
    },
    {
      q: "Hvilken mus bruger CS2-pros?",
      a: "De mest populære mus blandt CS2-pros er Logitech G Pro X Superlight 2, Razer Viper V3 Pro og ZOWIE EC2-DW. Over 60% af trackede pros bruger Logitech G Pro X Superlight 2.",
    },
  ];

  return (
    <>
      <script
        id="schema-find-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Find din mus", path: "/find-mus" },
            ])
          ),
        }}
      />
      <FinderQuiz priceMap={priceMap} />
      <script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqItems)) }}
      />
    </>
  );
}
