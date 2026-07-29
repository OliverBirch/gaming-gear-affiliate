import type { Metadata } from "next";
import Script from "next/script";
import { MonitorCard } from "@/components/monitor-card";
import { monitors } from "@/data/monitors";

export const metadata: Metadata = {
  title: "Alle gaming-skærme - ProSetups.dk",
  description: "Se specifikationer, priser og pro-data for de bedste gaming-skærme. Sammenlign ZOWIE, ASUS, Alienware og flere.",
};

export default function SkaermePage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Alle skærme</h1>
        <p className="text-muted-foreground mb-10">
          {monitors.length} skærme i databasen sorteret efter prisniveau
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {monitors.map((monitor) => (
            <MonitorCard key={monitor.slug} monitor={monitor} />
          ))}
        </div>
      </div>

      <Script
        id="schema-skaerme-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Alle skærme", item: "https://prosetups.dk/skaerme" },
            ],
          }),
        }}
      />
      <Script
        id="schema-skaerme-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle gaming-skærme",
            description: monitors.length + " gaming-skærme med specifikationer og priser",
            itemListElement: monitors.map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: m.navn,
                brand: { "@type": "Brand", name: m.brand },
              },
            })),
          }),
        }}
      />
    </>
  );
}
