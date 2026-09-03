import type { Metadata } from "next";
import { KeyboardCard } from "@/components/keyboard-card";
import { CategoryStatsSection } from "@/components/category-stats-section";
import { keyboards } from "@/data/keyboards";
import { computeKeyboardStats } from "@/lib/category-stats";
import { breadcrumbList, productItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Alle gaming-tastaturer - ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og anmeldelser af de bedste gaming-tastaturer. Sammenlign SteelSeries, Wooting, Razer, Corsair og flere.",
  path: "/tastaturer",
});

export default function TastaturerPage() {
  const sorted = [...keyboards].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );
  const stats = computeKeyboardStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle tastaturer</h1>
      <p className="text-muted-foreground mb-10">
        {keyboards.length} tastaturer i databasen sorteret efter popularitet blandt pros
      </p>

      <CategoryStatsSection stats={stats} linkPrefix="tastaturer" itemLabel="tastaturer" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((keyboard) => (
          <KeyboardCard key={keyboard.slug} keyboard={keyboard} />
        ))}
      </div>

      <script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Alle tastaturer", path: "/tastaturer" },
            ])
          ),
        }}
      />
      <script
        id="schema-keyboards-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productItemList({
              name: "Alle gaming-tastaturer",
              description: `${keyboards.length} gaming-tastaturer med specifikationer og priser`,
              products: sorted,
              urlPrefix: "tastaturer",
            })
          ),
        }}
      />
    </div>
  );
}
