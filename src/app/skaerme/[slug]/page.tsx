import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMonitor, monitors } from "@/data/monitors";
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

const paneltypeLabels: Record<string, string> = {
  TN: "TN",
  IPS: "IPS",
  VA: "VA",
  OLED: "OLED",
};

const adaptiveSyncLabels: Record<string, string> = {
  ingen: "Ingen",
  "g-sync": "G-Sync",
  freesync: "FreeSync",
  begge: "G-Sync + FreeSync",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const monitor = getMonitor(slug);
  if (!monitor) return {};
  return {
    title: `${monitor.brand} ${monitor.navn} - specifikationer og priser`,
    description: `Se komplette specifikationer for ${monitor.brand} ${monitor.navn}: ${monitor.stoerrelseTommer}", ${monitor.opdateringsHz} Hz, ${monitor.paneltype}-panel og find den bedste pris.`,
  };
}

export default async function SkaermPage({ params }: Props) {
  const { slug } = await params;
  const monitor = getMonitor(slug);
  if (!monitor) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 pb-24 sm:pb-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/skaerme" className="hover:text-primary transition-colors">Skærme</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{monitor.navn}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[1fr_280px] mb-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {monitor.brand} {monitor.navn}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{monitor.stoerrelseTommer}&quot;</Badge>
            <Badge variant="secondary">{monitor.oploesning}</Badge>
            <Badge variant="secondary">{monitor.opdateringsHz} Hz</Badge>
            <Badge variant="secondary">{paneltypeLabels[monitor.paneltype]}</Badge>
            <Badge variant="outline">{prisNiveauLabels[monitor.prisNiveau]}</Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {monitor.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PriceCta product={monitor} />
          </div>
        </div>
        <ProductImage
          src={monitor.billede}
          alt={monitor.navn}
          priority
          sizes="280px"
          className="h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]"
        />
      </div>

      <ProUsersBand productSlug={monitor.slug} proBrugere={monitor.proBrugere} categoryProducts={monitors} />

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <SpecTable
          title="Specifikationer"
          rows={[
            ["Mærke", monitor.brand],
            ["Model", monitor.navn],
            ["Størrelse", monitor.stoerrelseTommer + '"'],
            ["Opløsning", monitor.oploesning],
            ["Opdateringshastighed", monitor.opdateringsHz + " Hz"],
            ["Paneltype", paneltypeLabels[monitor.paneltype]],
            ["Responstid", monitor.responstidMs != null ? monitor.responstidMs + " ms" : "-"],
            ["Adaptive Sync", adaptiveSyncLabels[monitor.adaptiveSync]],
            ["Buet", monitor.buet ? "Ja" : "Nej"],
            ["Prisniveau", prisNiveauLabels[monitor.prisNiveau]],
          ]}
        />

        <div className="space-y-8">
          <ProsConsList title="Fordele" items={monitor.fordele} variant="pro" />
          <ProsConsList title="Ulemper" items={monitor.ulemper} variant="con" />
        </div>
      </div>

      <PriceComparison product={monitor} pagePath={`/skaerme/${monitor.slug}`} />

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/skaerme"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle skærme
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Skærme", path: "/skaerme" },
              { name: monitor.navn, path: `/skaerme/${slug}` },
            ])
          ),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productSchema({ ...monitor, navn: `${monitor.brand} ${monitor.navn}` })
          ),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { monitors } = await import("@/data/monitors");
  return monitors.map((m) => ({ slug: m.slug }));
}
