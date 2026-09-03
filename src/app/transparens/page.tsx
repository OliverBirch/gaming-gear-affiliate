import type { Metadata } from "next";
import { breadcrumbList, webPageSchema, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Transparens",
  description: "Læs om affiliate-links på ProSetups.dk og hvordan vi tjener penge.",
  path: "/transparens",
});

export default function TransparensPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Transparens</h1>
      <div className="text-muted-foreground space-y-4">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Affiliate-links
          </h2>
          <p>
            Nogle links på denne side er affiliate-links til danske
            forhandlere. Hvis du klikker på et affiliate-link og foretager et
            køb, modtager vi en provision, uden ekstra omkostning for dig.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Ingen betalte placeringer
          </h2>
          <p>
            Vi modtager ikke betaling for at inkludere specifikke produkter.
            Vores anbefalinger er baseret på pro-usage-data og objektive specs.
          </p>
        </section>
      </div>

      <script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Transparens", path: "/transparens" },
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
              name: "Transparens",
              description:
                "Læs om affiliate-links på ProSetups.dk og hvordan vi tjener penge.",
            })
          ),
        }}
      />
    </div>
  );
}
