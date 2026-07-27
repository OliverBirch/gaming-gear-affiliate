import type { Metadata } from "next";
import Script from "next/script";
import { ProsTable } from "./pros-table";
import { pros } from "@/data/pros";

export const metadata: Metadata = {
  title: "Alle pros",
  description: "Se alle CS2- og Valorant-pros på ProSetups.dk - deres mus og udstyr.",
};

export default function ProsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">Alle pros</h1>
      <p className="text-muted-foreground mb-10">
        {pros.length} pros p&aring; tv&aelig;rs af {new Set(pros.map((p) => p.esport)).size} spil
      </p>

      <ProsTable pros={pros} />

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Alle pros", item: "https://prosetups.dk/pros" },
            ],
          }),
        }}
      />
      <Script
        id="schema-pros-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle pros",
            description: `${pros.length} pros p\u00E5 tv\u00E6rs af ${new Set(pros.map((p) => p.esport)).size} spil`,
            itemListElement: pros.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                name: p.navn,
                url: `https://prosetups.dk/pro/${p.slug}`,
              },
            })),
            numberOfItems: pros.length,
          }),
        }}
      />
    </div>
  );
}
