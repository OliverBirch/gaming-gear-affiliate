import type { Metadata } from "next";
import Script from "next/script";
import { MousepadCard } from "@/components/mousepad-card";
import { CategoryStatsSection } from "@/components/category-stats-section";
import { mousepads } from "@/data/mousepads";
import { computeMousepadStats } from "@/lib/category-stats";

export const metadata: Metadata = {
  title: "Alle musemåtter - ProSetups.dk",
  description:
    "Se komplette specifikationer og priser på gaming-musemåtter. Sammenlign SteelSeries QcK, ZOWIE G-SR, Artisan og flere.",
};

export default function MusemaatterPage() {
  const sorted = [...mousepads].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );
  const stats = computeMousepadStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle musemåtter</h1>
      <p className="text-muted-foreground mb-10">
        {mousepads.length} musemåtter i databasen sorteret efter popularitet blandt pros
      </p>

      <CategoryStatsSection stats={stats} linkPrefix="musemaatter" itemLabel="musemåtter" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((mousepad) => (
          <MousepadCard key={mousepad.slug} mousepad={mousepad} />
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
              { "@type": "ListItem", position: 2, name: "Alle musemåtter", item: "https://prosetups.dk/musemaatter" },
            ],
          }),
        }}
      />
      <Script
        id="schema-mousepads-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle gaming-musemåtter",
            description: mousepads.length + " gaming-musemåtter med specifikationer og priser",
            itemListElement: mousepads.map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: m.brand + " " + m.model,
                url: "https://prosetups.dk/musemaatter/" + m.slug,
              },
            })),
            numberOfItems: mousepads.length,
          }),
        }}
      />
    </div>
  );
}
