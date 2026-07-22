import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Grebsguide - palm, claw og fingertip",
  description:
    "Lær forskellen på palm, claw og fingertip greb. Find ud af hvilket greb du bruger, og hvilken mus der passer til dig.",
};

export default function GrebGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Grebsguide: palm, claw og fingertip
      </h1>
      <p className="mb-8 text-muted-foreground">
        Dit greb er afgørende for hvilken mus der passer dig. Her er de tre
        primære grebstyper.
      </p>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Palm-greb</h2>
        <p className="text-muted-foreground mb-3">
          Hele håndfladen hviler på musen. Fingrene ligger fladt på knapperne.
          Det mest afslappede og præcise greb, men kræver en større mus.
        </p>
        <p className="text-sm text-muted-foreground">
          Bedst til: Ergonomiske mus som Razer DeathAdder eller ZOWIE EC-serien.
        </p>
      </section>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Claw-greb</h2>
        <p className="text-muted-foreground mb-3">
          Håndfladen hviler bag på musen, mens fingrene buer som en klo over
          knapperne. Giver hurtigere klik og er populært blandt FPS-pros.
        </p>
        <p className="text-sm text-muted-foreground">
          Bedst til: Symmetriske mus som Logitech G Pro X Superlight 2 eller
          Pulsar X2H.
        </p>
      </section>

      <section className="mb-8 rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Fingertip-greb</h2>
        <p className="text-muted-foreground mb-3">
          Kun fingerspidserne rører musen, mens håndfladen svæver over den.
          Giver mest fri bevægelighed, men mindre kontrol.
        </p>
        <p className="text-sm text-muted-foreground">
          Bedst til: Letvægtsmus som Finalmouse Starlight eller Razer Viper V3
          Pro.
        </p>
      </section>

      <p className="text-center">
        <Link href="/find-mus" className="text-primary hover:underline">
          Brug finderen til at matche dit greb med en mus →
        </Link>
      </p>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Grebsguide", item: "https://prosetups.dk/guides/greb" },
            ],
          }),
        }}
      />
      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Grebsguide: palm, claw og fingertip",
            description:
              "Lær forskellen på palm, claw og fingertip greb. Find ud af hvilket greb du bruger, og hvilken mus der passer til dig.",
          }),
        }}
      />
    </div>
  );
}
