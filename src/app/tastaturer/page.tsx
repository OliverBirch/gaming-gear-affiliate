import type { Metadata } from "next";
import Script from "next/script";
import { KeyboardCard } from "@/components/keyboard-card";
import { keyboards } from "@/data/keyboards";

export const metadata: Metadata = {
  title: "Alle gaming-tastaturer - ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og anmeldelser af de bedste gaming-tastaturer. Sammenlign SteelSeries, Wooting, Razer, Corsair og flere.",
};

export default function TastaturerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle tastaturer</h1>
      <p className="text-muted-foreground mb-10">
        {keyboards.length} tastaturer i databasen sorteret efter prisniveau
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {keyboards.map((keyboard) => (
          <KeyboardCard key={keyboard.slug} keyboard={keyboard} />
        ))}
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Alle tastaturer", item: "https://prosetups.dk/tastaturer" },
            ],
          }),
        }}
      />
      <Script
        id="schema-keyboards-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle gaming-tastaturer",
            description: keyboards.length + " gaming-tastaturer med specifikationer og priser",
            itemListElement: keyboards.map((k, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: k.navn,
                brand: k.brand,
                url: "https://prosetups.dk/tastaturer/" + k.slug,
              },
            })),
            numberOfItems: keyboards.length,
          }),
        }}
      />
    </div>
  );
}
