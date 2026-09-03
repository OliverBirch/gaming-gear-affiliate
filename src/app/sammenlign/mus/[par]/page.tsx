import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CompareTable } from "@/components/compare/compare-table";
import { resolveCompareMice } from "@/lib/compare/resolve";
import { CURATED_PAIRS } from "@/lib/compare/curated-pairs";
import { breadcrumbList, productItemList, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ par: string }>;
}

function getPair(par: string) {
  return CURATED_PAIRS.find((p) => p.par === par);
}

export async function generateStaticParams() {
  return CURATED_PAIRS.map((p) => ({ par: p.par }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { par } = await params;
  const pair = getPair(par);
  if (!pair) return {};
  const [mouseA, mouseB] = resolveCompareMice([pair.a, pair.b]);
  if (!mouseA || !mouseB) return {};
  return buildMetadata({
    title: `${mouseA.navn} vs ${mouseB.navn} – sammenligning`,
    description: `Sammenlign ${mouseA.navn} og ${mouseB.navn}: vægt, sensor, greb, pro-brugere og danske priser.`,
    path: `/sammenlign/mus/${par}`,
  });
}

export default async function ComparePairPage({ params }: Props) {
  const { par } = await params;
  const pair = getPair(par);
  if (!pair) notFound();

  const [mouseA, mouseB] = resolveCompareMice([pair.a, pair.b]);
  if (!mouseA || !mouseB) notFound();

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
        <Link href="/sammenlign/mus" className="hover:text-primary transition-colors">
          Sammenlign
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {mouseA.navn} vs {mouseB.navn}
        </span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        {mouseA.navn} vs {mouseB.navn}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">{pair.verdict}</p>

      <CompareTable mouseA={mouseA} mouseB={mouseB} />

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/sammenlign/mus" className="text-muted-foreground hover:text-primary transition-colors">
          ← Sammenlign andre mus
        </Link>
        <Link href="/mus" className="text-muted-foreground hover:text-primary transition-colors">
          Alle mus
        </Link>
      </div>

      <script
        id="schema-compare-pair-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Mus", path: "/mus" },
              { name: "Sammenlign", path: "/sammenlign/mus" },
              { name: `${mouseA.navn} vs ${mouseB.navn}`, path: `/sammenlign/mus/${par}` },
            ])
          ),
        }}
      />
      <script
        id="schema-compare-pair-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productItemList({
              name: `${mouseA.navn} vs ${mouseB.navn}`,
              description: pair.verdict,
              products: [mouseA, mouseB],
              urlPrefix: "mus",
            })
          ),
        }}
      />
    </div>
  );
}
