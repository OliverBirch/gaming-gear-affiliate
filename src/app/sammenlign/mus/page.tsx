import type { Metadata } from "next";
import Link from "next/link";
import { ComparePicker } from "@/components/compare/compare-picker";
import { CompareTable } from "@/components/compare/compare-table";
import {
  mousePickerOptions,
  parseCompareSlugs,
  resolveCompareMice,
} from "@/lib/compare/resolve";
import { CURATED_PAIRS, findCuratedPair } from "@/lib/compare/curated-pairs";
import { getMouse } from "@/data/mice";
import { breadcrumbList, productItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

interface Props {
  searchParams: Promise<{ p?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const slugs = parseCompareSlugs(sp.p);
  const selected = resolveCompareMice(slugs);

  // Canonical points at the bare comparison page for most `?p=` pairs, so
  // they consolidate their signal onto one indexed URL instead of
  // fragmenting across unbounded query-string variants — except the small
  // curated set, which has its own static, indexable page and should
  // canonicalize there instead of back to the generic picker.
  if (selected.length === 2) {
    const curated = findCuratedPair(selected[0].slug, selected[1].slug);
    if (curated) {
      return buildMetadata({
        title: `${selected[0].navn} vs ${selected[1].navn} – sammenligning`,
        description: `Sammenlign ${selected[0].navn} og ${selected[1].navn}: vægt, sensor, greb, pro-brugere og danske priser.`,
        path: `/sammenlign/mus/${curated.par}`,
      });
    }
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

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Populære sammenligninger</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CURATED_PAIRS.map((p) => {
            const a = getMouse(p.a);
            const b = getMouse(p.b);
            if (!a || !b) return null;
            return (
              <Link
                key={p.par}
                href={`/sammenlign/mus/${p.par}`}
                className="rounded-lg border border-border/50 px-4 py-2.5 text-sm hover:border-primary/30 hover:text-primary transition-colors"
              >
                {a.navn} vs {b.navn}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/mus" className="text-muted-foreground hover:text-primary transition-colors">
          ← Alle mus
        </Link>
        <Link href="/find-mus" className="text-muted-foreground hover:text-primary transition-colors">
          Find din mus
        </Link>
      </div>

      <script
        id="schema-compare-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Mus", path: "/mus" },
              { name: "Sammenlign", path: "/sammenlign/mus" },
            ])
          ),
        }}
      />
      {mouseA && mouseB && (
        <script
          id="schema-compare-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              productItemList({
                name: `${mouseA.navn} vs ${mouseB.navn}`,
                description: `Sammenligning af ${mouseA.navn} og ${mouseB.navn}`,
                products: [mouseA, mouseB],
                urlPrefix: "mus",
              })
            ),
          }}
        />
      )}
    </div>
  );
}
