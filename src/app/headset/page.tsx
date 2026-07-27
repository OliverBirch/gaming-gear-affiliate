import type { Metadata } from "next";
import Script from "next/script";
import { HeadsetCard } from "@/components/headset-card";
import { CategoryStatsSection } from "@/components/category-stats-section";
import { headsets } from "@/data/headsets";
import { computeHeadsetStats } from "@/lib/category-stats";

export const metadata: Metadata = {
  title: "Alle gaming-headsets - ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og anmeldelser af de bedste gaming-headsets. Sammenlign HyperX, Logitech, Razer, SteelSeries og flere.",
};

export default function HeadsetListPage() {
  const sorted = [...headsets].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );
  const stats = computeHeadsetStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle headsets</h1>
      <p className="text-muted-foreground mb-10">
        {headsets.length} headsets i databasen sorteret efter popularitet blandt pros
      </p>

      <CategoryStatsSection stats={stats} linkPrefix="headset" itemLabel="headsets" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((headset) => (
          <HeadsetCard key={headset.slug} headset={headset} />
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
              { "@type": "ListItem", position: 2, name: "Alle headsets", item: "https://prosetups.dk/headset" },
            ],
          }),
        }}
      />
      <Script
        id="schema-headsets-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle gaming-headsets",
            description: headsets.length + " gaming-headsets med specifikationer og priser",
            itemListElement: headsets.map((h, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: h.navn,
            })),
          }),
        }}
      />
    </div>
  );
}
