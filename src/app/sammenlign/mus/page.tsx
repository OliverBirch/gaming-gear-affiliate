import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ComparePicker } from "@/components/compare/compare-picker";
import { CompareTable } from "@/components/compare/compare-table";
import {
  mousePickerOptions,
  parseCompareSlugs,
  resolveCompareMice,
} from "@/lib/compare/resolve";
import { buildMetadata } from "@/lib/metadata";

interface Props {
  searchParams: Promise<{ p?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const slugs = parseCompareSlugs(sp.p);
  const selected = resolveCompareMice(slugs);

  // Canonical always points at the bare comparison page (matches
  // sitemap.ts) — not the specific `?p=` pair, so every mouse combination
  // consolidates its signal onto one indexed URL instead of fragmenting
  // across unbounded query-string variants.
  if (selected.length === 2) {
    return buildMetadata({
      title: `${selected[0].navn} vs ${selected[1].navn} – sammenligning`,
      description: `Sammenlign ${selected[0].navn} og ${selected[1].navn}: vægt, sensor, greb, pro-brugere og danske priser.`,
      path: "/sammenlign/mus",
    });
  }

  return buildMetadata({
    title: "Sammenlign gaming-mus – specs, pros og priser",
    description:
      "Sammenlign to gaming-mus side om side: vægt, sensor, greb, pro-brugere og laveste danske pris.",
    path: "/sammenlign/mus",
  });
}

export default async function SammenlignMusPage({ searchParams }: Props) {
  const sp = await searchParams;
  const slugs = parseCompareSlugs(sp.p);
  const selected = resolveCompareMice(slugs);
  const mouseA = selected[0] ?? null;
  const mouseB = selected[1] ?? null;
  const options = mousePickerOptions();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Forside
        </Link>
        <span className="mx-2">/</span>
        <Link href="/mus" className="hover:text-primary transition-colors">
          Mus
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Sammenlign</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Sammenlign mus
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Vælg to gaming-mus og se specs, pro-brug og danske priser side om side.
        {mouseA && mouseB
          ? ` Du sammenligner ${mouseA.navn} med ${mouseB.navn}.`
          : " Priser og tilbud finder du på produktsiderne."}
      </p>

      <ComparePicker
        slugA={mouseA?.slug ?? null}
        slugB={mouseB?.slug ?? null}
        options={options}
      />

      <CompareTable mouseA={mouseA} mouseB={mouseB} />

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/mus" className="text-muted-foreground hover:text-primary transition-colors">
          ← Alle mus
        </Link>
        <Link href="/find-mus" className="text-muted-foreground hover:text-primary transition-colors">
          Find din mus
        </Link>
      </div>

      <Script
        id="schema-compare-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Mus", item: "https://prosetups.dk/mus" },
              {
                "@type": "ListItem",
                position: 3,
                name: "Sammenlign",
                item: "https://prosetups.dk/sammenlign/mus",
              },
            ],
          }),
        }}
      />
      {mouseA && mouseB && (
        <Script
          id="schema-compare-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${mouseA.navn} vs ${mouseB.navn}`,
              numberOfItems: 2,
              itemListElement: [mouseA, mouseB].map((m, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Product",
                  name: m.navn,
                  brand: m.brand,
                  url: `https://prosetups.dk/mus/${m.slug}`,
                },
              })),
            }),
          }}
        />
      )}
    </div>
  );
}
