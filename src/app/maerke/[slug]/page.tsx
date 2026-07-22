import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { MouseCard } from "@/components/mouse-card";
import { getBrand, getBrands } from "@/data/brands";
import { mice } from "@/data/mice";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  return {
    title: `${brand.navn} mus - se alle modeller og priser`,
    description: `Se alle ${brand.navn} gaming-mus i vores database. Sammenlign specs, priser og se hvilke pros der bruger ${brand.navn}.`,
  };
}

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const brandMice = mice
    .filter((m) => m.brand.toLowerCase() === brand.navn.toLowerCase())
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length);

  const totalProsUsing = brandMice.reduce((sum, m) => sum + m.proBrugere.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{brand.navn}</span>
      </nav>

      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/50 overflow-hidden">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.navn}
                width={36}
                height={36}
                className="object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {brand.navn.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {brand.navn}
            </h1>
            <p className="text-muted-foreground">
              {brand.antalMus} mus &middot; {totalProsUsing} pro{totalProsUsing > 1 ? "s" : ""}
              {brand.mestPopulaereMusNavn && ` · Mest populær: ${brand.mestPopulaereMusNavn}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-8">
        <span className="text-sm font-medium text-muted-foreground">Hop til:</span>
        {brandMice.map((m) => (
          <a
            key={m.slug}
            href={`/mus/${m.slug}`}
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            {m.navn}
          </a>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brandMice.map((mouse, i) => (
          <MouseCard key={mouse.slug} mouse={mouse} rank={i + 1} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/mus"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle mus
        </Link>
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
              { "@type": "ListItem", position: 2, name: brand.navn, item: `https://prosetups.dk/maerke/${slug}` },
            ],
          }),
        }}
      />
    </div>
  );
}
