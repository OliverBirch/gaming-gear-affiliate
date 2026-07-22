import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { GuidesCard } from "./guides-card";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guides - ProSetups.dk",
  description: "Guides til gaming-mus, greb og setups. Find den bedste mus til CS2, Valorant og andre spil.",
};

export default function GuidesPage() {
  const featured = guides.filter((g) => g.featured);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Guides</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">Guides</h1>
      <p className="text-muted-foreground mb-10">
        Guides og anbefalinger til gaming-mus, greb og meget mere — baseret på data fra pros.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {featured.map((g) => (
          <GuidesCard key={g.slug} guide={g} />
        ))}
        {guides.filter((g) => !g.featured).map((g) => (
          <GuidesCard key={g.slug} guide={g} />
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
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://prosetups.dk/guides" },
            ],
          }),
        }}
      />
    </div>
  );
}
