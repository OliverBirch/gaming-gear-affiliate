import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { MouseCard } from "@/components/mouse-card";
import { KeyboardCard } from "@/components/keyboard-card";
import { MousepadCard } from "@/components/mousepad-card";
import { HeadsetCard } from "@/components/headset-card";
import { getBrand, getBrands } from "@/data/brands";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { headsets } from "@/data/headsets";
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
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            {m.navn}
          </a>
        ))}
      </div>

      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          {brand.navn} mus
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brandMice.map((mouse, i) => (
            <MouseCard key={mouse.slug} mouse={mouse} rank={i + 1} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/mus"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Se alle mus &rarr;
          </Link>
        </div>
      </section>

      {(() => {
        const brandKeyboards = keyboards.filter(
          (k) => k.brand.toLowerCase() === brand.navn.toLowerCase()
        );
        return brandKeyboards.length > 0 ? (
          <section className="mb-14">
            <h2 className="text-xl font-bold tracking-tight mb-6">
              {brand.navn} tastaturer
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brandKeyboards.map((kb) => (
                <KeyboardCard key={kb.slug} keyboard={kb} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/tastaturer"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Se alle tastaturer &rarr;
              </Link>
            </div>
          </section>
        ) : null;
      })()}

      {(() => {
        const brandMousepads = mousepads.filter(
          (mp) => mp.brand.toLowerCase() === brand.navn.toLowerCase()
        );
        return brandMousepads.length > 0 ? (
          <section className="mb-14">
            <h2 className="text-xl font-bold tracking-tight mb-6">
              {brand.navn} musemåtter
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brandMousepads.map((mp) => (
                <MousepadCard key={mp.slug} mousepad={mp} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/musemaatter"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Se alle musemåtter &rarr;
              </Link>
            </div>
          </section>
        ) : null;
      })()}

      {(() => {
        const brandHeadsets = headsets.filter(
          (h) => h.brand.toLowerCase() === brand.navn.toLowerCase()
        );
        return brandHeadsets.length > 0 ? (
          <section className="mb-14">
            <h2 className="text-xl font-bold tracking-tight mb-6">
              {brand.navn} headsets
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brandHeadsets.map((hs) => (
                <HeadsetCard key={hs.slug} headset={hs} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/headset"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Se alle headsets &rarr;
              </Link>
            </div>
          </section>
        ) : null;
      })()}

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
