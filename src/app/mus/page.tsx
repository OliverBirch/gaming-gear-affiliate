import type { Metadata } from "next";
import Script from "next/script";
import { MouseCard } from "@/components/mouse-card";
import { mice } from "@/data/mice";

export const metadata: Metadata = {
  title: "Alle gaming-mus - ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og hvilke pros der bruger hver mus. Sammenlign Logitech, Razer, ZOWIE, Pulsar og flere.",
};

export default function MusPage() {
  const sorted = [...mice].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle mus</h1>
      <p className="text-muted-foreground mb-10">
        {mice.length} mus i databasen sorteret efter popularitet blandt pros
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((mouse) => (
          <MouseCard key={mouse.slug} mouse={mouse} />
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
              { "@type": "ListItem", position: 2, name: "Alle mus", item: "https://prosetups.dk/mus" },
            ],
          }),
        }}
      />
      <Script
        id="schema-mice-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle gaming-mus",
            description: `${mice.length} gaming-mus med specifikationer, priser og pro-brugere`,
            itemListElement: sorted.map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: m.navn,
                brand: m.brand,
                url: `https://prosetups.dk/mus/${m.slug}`,
              },
            })),
            numberOfItems: mice.length,
          }),
        }}
      />
    </div>
  );
}
