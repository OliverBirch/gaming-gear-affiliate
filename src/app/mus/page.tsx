import type { Metadata } from "next";
import { MouseCard } from "@/components/mouse-card";
import { CategoryStatsSection } from "@/components/category-stats-section";
import { mice } from "@/data/mice";
import { computeMusStats } from "@/lib/category-stats";
import { breadcrumbList, productItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Alle gaming-mus - ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og hvilke pros der bruger hver mus. Sammenlign Logitech, Razer, ZOWIE, Pulsar og flere.",
  path: "/mus",
});

export default function MusPage() {
  const sorted = [...mice].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );
  const stats = computeMusStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle mus</h1>
      <p className="text-muted-foreground mb-10">
        {mice.length} mus i databasen sorteret efter popularitet blandt pros
      </p>

      <CategoryStatsSection stats={stats} linkPrefix="mus" itemLabel="mus" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((mouse) => (
          <MouseCard key={mouse.slug} mouse={mouse} />
        ))}
      </div>

      <script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Alle mus", path: "/mus" },
            ])
          ),
        }}
      />
      <script
        id="schema-mice-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productItemList({
              name: "Alle gaming-mus",
              description: `${mice.length} gaming-mus med specifikationer, priser og pro-brugere`,
              products: sorted,
              urlPrefix: "mus",
            })
          ),
        }}
      />
    </div>
  );
}
