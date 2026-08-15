import type { Metadata } from "next";
import Script from "next/script";
import { MousepadCard } from "@/components/mousepad-card";
import { CategoryStatsSection } from "@/components/category-stats-section";
import { mousepads } from "@/data/mousepads";
import { computeMousepadStats } from "@/lib/category-stats";
import { breadcrumbList, productItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Alle musemåtter - ProSetups.dk",
  description:
    "Se komplette specifikationer og priser på gaming-musemåtter. Sammenlign SteelSeries QcK, ZOWIE G-SR, Artisan og flere.",
  path: "/musemaatter",
});

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
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Alle musemåtter", path: "/musemaatter" },
            ])
          ),
        }}
      />
      <Script
        id="schema-mousepads-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productItemList({
              name: "Alle gaming-musemåtter",
              description: `${mousepads.length} gaming-musemåtter med specifikationer og priser`,
              // Mousepads have brand + model rather than a single navn field.
              products: sorted.map((m) => ({
                slug: m.slug,
                navn: `${m.brand} ${m.model}`,
                brand: m.brand,
              })),
              urlPrefix: "musemaatter",
            })
          ),
        }}
      />
    </div>
  );
}
