import type { Metadata } from "next";
import { ProsTable } from "./pros-table";
import { pros } from "@/data/pros";
import { breadcrumbList, personItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Alle pros",
  description: "Se alle CS2- og Valorant-pros på ProSetups.dk - deres mus og udstyr.",
  path: "/pros",
});

export default function ProsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">Alle pros</h1>
      <p className="text-muted-foreground mb-10">
        {pros.length} pros p&aring; tv&aelig;rs af {new Set(pros.map((p) => p.esport)).size} spil
      </p>

      <ProsTable pros={pros} />

      <script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Alle pros", path: "/pros" },
            ])
          ),
        }}
      />
      <script
        id="schema-pros-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            personItemList({
              name: "Alle pros",
              description: `${pros.length} pros p\u00E5 tv\u00E6rs af ${new Set(pros.map((p) => p.esport)).size} spil`,
              people: pros,
            })
          ),
        }}
      />
    </div>
  );
}
