import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getMousepad, mousepads } from "@/data/mousepads";
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
  const mp = getMousepad(slug);
  if (!mp) return {};
  return {
    title: mp.brand + " " + mp.model + " - specifikationer, fordele og priser",
    description: "Se komplette specifikationer for " + mp.brand + " " + mp.model + ": glide-type, materiale, størrelser og find den bedste pris.",
  };
}

const glideLabels: Record<string, string> = {
  speed: "Speed",
  control: "Control",
  hybrid: "Balanced",
};

const glideColors: Record<string, string> = {
  speed: "bg-blue-500/10 text-blue-400",
  control: "bg-green-500/10 text-green-400",
  hybrid: "bg-amber-500/10 text-amber-400",
};

export default async function MusemaattePage({ params }: Props) {
  const { slug } = await params;
  const mousepad = getMousepad(slug);
  if (!mousepad) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 pb-24 sm:pb-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/musemaatter" className="hover:text-primary transition-colors">Musemåtter</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{mousepad.brand} {mousepad.model}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[1fr_280px] mb-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {mousepad.brand} {mousepad.model}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-sans tabular-nums mb-4">
            <span className="text-foreground font-semibold">{mousepad.brand}</span>
            <span className="text-border/50">|</span>
            <span>{mousepad.materiale}</span>
            <span className="text-border/50">|</span>
            <span>{mousepad.størrelser.length} størrelser</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {mousepad.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={cn("text-sm border-0 px-3 py-1", glideColors[mousepad.type] ?? glideColors.hybrid)}>
              {glideLabels[mousepad.type] ?? glideLabels.hybrid}
            </Badge>
            {mousepad.vaskbar && (
              <span className="text-xs text-muted-foreground">Vaskbar</span>
            )}
          </div>
          <div className="mt-4">
            <PriceCta product={mousepad} />
          </div>
        </div>
        <ProductImage
          src={mousepad.billede}
          alt={`${mousepad.brand} ${mousepad.model}`}
          priority
          sizes="280px"
          className="h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]"
        />
      </div>

      <ProUsersBand productSlug={mousepad.slug} proBrugere={mousepad.proBrugere} categoryProducts={mousepads} />

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <SpecTable
          title="Specifikationer"
          rows={[
            ["Brand", mousepad.brand],
            ["Model", mousepad.model],
            ["Glide-type", glideLabels[mousepad.type] ?? mousepad.type],
            ["Materiale", mousepad.materiale],
            ["Bund", mousepad.bund],
            ["Vaskbar", mousepad.vaskbar ? "Ja" : "Nej"],
            ["Prisniveau", prisNiveauLabels[mousepad.prisNiveau] ?? mousepad.prisNiveau],
          ]}
        />

        <div className="space-y-8">
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-xl font-semibold mb-4">Tilgængelige størrelser</h2>
            <div className="space-y-3">
              {mousepad.størrelser.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <span className="font-medium">{s.navn}</span>
                  <span className="text-muted-foreground font-sans tabular-nums">
                    {s.breddeMm} &times; {s.laengdeMm} &times; {s.tykkelseMm} mm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ProsConsList title="Fordele" items={mousepad.fordele} variant="pro" />
          <ProsConsList title="Ulemper" items={mousepad.ulemper} variant="con" />
        </div>
      </div>

      <PriceComparison product={mousepad} pagePath={`/musemaatter/${mousepad.slug}`} />

      <div className="flex flex-wrap gap-4 pt-2">
        <Link href="/musemaatter" className={cn(buttonVariants({ variant: "outline" }))}>
          &larr; Alle musemåtter
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Musemåtter", path: "/musemaatter" },
              { name: `${mousepad.brand} ${mousepad.model}`, path: `/musemaatter/${slug}` },
            ])
          ),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productSchema({ ...mousepad, navn: `${mousepad.brand} ${mousepad.model}` })
          ),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { mousepads } = await import("@/data/mousepads");
  return mousepads.map((m) => ({ slug: m.slug }));
}
