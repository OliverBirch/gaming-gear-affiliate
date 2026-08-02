import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getHeadset, headsets } from "@/data/headsets";
import { breadcrumbList, productSchema, jsonLd } from "@/lib/schema-org";
import { prisNiveauLabels } from "@/lib/product-labels";
import { ProductImage } from "@/components/product-image";
import { ProUsersBand } from "@/components/pro-users-band";
import { SpecTable } from "@/components/spec-table";
import { ProsConsList } from "@/components/pros-cons-list";
import { PriceCta, PriceComparison } from "@/components/price-comparison";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headset = getHeadset(slug);
  if (!headset) return {};
  return {
    title: headset.navn + " - specifikationer, fordele og priser",
    description: "Se komplette specifikationer for " + headset.navn + ": vægt, driver, forbindelse og find den bedste pris.",
  };
}

export default async function HeadsetPage({ params }: Props) {
  const { slug } = await params;
  const headset = getHeadset(slug);
  if (!headset) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 pb-24 sm:pb-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/headset" className="hover:text-primary transition-colors">Headsets</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{headset.navn}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[1fr_280px] mb-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {headset.navn}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-sans tabular-nums mb-4">
            <span className="text-foreground font-semibold">{headset.brand}</span>
            <span className="text-border/50">|</span>
            <span>{headset.wireless ? "Trådløs" : "Kablet"}</span>
            <span className="text-border/50">|</span>
            <span>{headset.vaegtGram}g</span>
            <span className="text-border/50">|</span>
            <span>{headset.driverStoerrelseMm ? headset.driverStoerrelseMm + " mm" : "-"}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {headset.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PriceCta product={headset} />
          </div>
        </div>
        <ProductImage
          src={headset.billede}
          alt={headset.navn}
          priority
          sizes="280px"
          className="h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]"
        />
      </div>

      <ProUsersBand productSlug={headset.slug} proBrugere={headset.proBrugere} categoryProducts={headsets} />

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <SpecTable
          title="Specifikationer"
          rows={[
            ["Brand", headset.brand],
            ["Forbindelse", headset.forbindelse],
            ["Trådløs", headset.wireless ? "Ja" : "Nej"],
            ["Batteritid", headset.batteritidTimer ? headset.batteritidTimer + " timer" : "-"],
            ["Vægt", headset.vaegtGram + " g"],
            ["Driver", headset.driverStoerrelseMm ? headset.driverStoerrelseMm + " mm" : "-"],
            ["Mikrofon", headset.mikrofon ? "Ja" : "Nej"],
            ["Aftagelig mikrofon", headset.aftagelig === null ? "-" : headset.aftagelig ? "Ja" : "Nej"],
            ["Surround sound", headset.surroundSound ? "Ja" : "Nej"],
            ["Prisniveau", prisNiveauLabels[headset.prisNiveau] ?? headset.prisNiveau],
          ]}
        />

        <div className="space-y-8">
          <ProsConsList title="Fordele" items={headset.fordele} variant="pro" />
          <ProsConsList title="Ulemper" items={headset.ulemper} variant="con" />
        </div>
      </div>

      <PriceComparison product={headset} pagePath={`/headset/${headset.slug}`} />

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/headset"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle headsets
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Headsets", path: "/headset" },
              { name: headset.navn, path: `/headset/${slug}` },
            ])
          ),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(productSchema(headset)),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { headsets } = await import("@/data/headsets");
  return headsets.map((h) => ({ slug: h.slug }));
}
