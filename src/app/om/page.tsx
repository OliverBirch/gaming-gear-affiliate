import type { Metadata } from "next";
import { breadcrumbList, webPageSchema, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Om ProSetups.dk",
  description: "Læs om ProSetups.dk - dansk esport-mus guide med pro-data og affiliate-priser.",
  path: "/om",
});

export default function OmPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Om ProSetups.dk</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>
          ProSetups.dk er en dansk guide til gaming-mus med fokus på hvad
          professionelle esport-spillere bruger. Vi samler data om mus, DPI,
          in-game sens og eDPI fra de største CS2-pros og gør det let at finde
          den rigtige mus til dit spil.
        </p>
        <p>
          Vores data stammer fra offentligt tilgængelige kilder om
          pro-spilleres udstyr. Vi viser dato for sidste verificering, fordi
          pro-gear skifter.
        </p>
        <p>
          Vi tester ikke selv mus fysisk. Vores værdi ligger i at syntetisere
          pro-data og give dig den bedste købsrute til danske forhandlere.
        </p>
      </div>

      <script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Om ProSetups.dk", path: "/om" },
            ])
          ),
        }}
      />
      <script
        id="schema-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageSchema({
              type: "AboutPage",
              name: "Om ProSetups.dk",
              description:
                "ProSetups.dk er en dansk guide til gaming-mus med fokus på hvad professionelle esport-spillere bruger.",
            })
          ),
        }}
      />
    </div>
  );
}
