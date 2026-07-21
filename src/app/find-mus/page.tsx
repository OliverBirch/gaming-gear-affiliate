import type { Metadata } from "next";
import Script from "next/script";
import FinderQuiz from "@/components/finder-quiz";

export const metadata: Metadata = {
  title: "Find din gaming-mus",
  description:
    "Svar på 5 spørgsmål og find den bedste gaming-mus til dig baseret på dit spil, greb, håndstørrelse og budget.",
};

export default function FindMusPage() {
  return (
    <>
      <FinderQuiz />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Hvilket greb bruger du på din mus?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Palm-greb: hele hånden hviler på musen. Claw-greb: håndfladen hviler, fingrene er krummet. Fingertip-greb: kun fingerspidserne rører musen.",
                },
              },
              {
                "@type": "Question",
                name: "Hvilken håndstørrelse har du?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Lille (under 17 cm), Medium (17-20 cm) eller Stor (over 20 cm) målt fra håndrod til langefinger.",
                },
              },
              {
                "@type": "Question",
                name: "Hvad koster en god gaming-mus?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Budget: under 500 kr. Mellemklasse: 500-1000 kr. Flagship: over 1000 kr. Pros bruger typisk flagskibsmus som Logitech G Pro X Superlight 2 og Razer Viper V3 Pro.",
                },
              },
              {
                "@type": "Question",
                name: "Hvilken mus bruger CS2-pros?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "De mest populære mus blandt CS2-pros er Logitech G Pro X Superlight 2, Razer Viper V3 Pro og ZOWIE EC2-DW. Over 60% af trackede pros bruger Logitech G Pro X Superlight 2.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
