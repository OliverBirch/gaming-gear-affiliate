import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getKeyboard, keyboards } from "@/data/keyboards";
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
  const keyboard = getKeyboard(slug);
  if (!keyboard) return {};
  return {
    title: keyboard.navn + " - specifikationer, fordele og priser",
    description: "Se komplette specifikationer for " + keyboard.navn + ": switches, layout, polling rate og find den bedste pris.",
  };
}

export default async function TastaturPage({ params }: Props) {
  const { slug } = await params;
  const keyboard = getKeyboard(slug);
  if (!keyboard) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 pb-24 sm:pb-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/tastaturer" className="hover:text-primary transition-colors">Tastaturer</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{keyboard.navn}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[1fr_280px] mb-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {keyboard.navn}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-sans tabular-nums mb-4">
            <span className="text-foreground font-semibold">{keyboard.brand}</span>
            <span className="text-border/50">|</span>
            <span>{keyboard.formfaktor}</span>
            <span className="text-border/50">|</span>
            <span>{keyboard.forbindelse}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {keyboard.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PriceCta product={keyboard} />
          </div>
        </div>
        <ProductImage
          src={keyboard.billede}
          alt={keyboard.navn}
          priority
          sizes="280px"
          className="h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]"
        />
      </div>

      <ProUsersBand productSlug={keyboard.slug} proBrugere={keyboard.proBrugere} categoryProducts={keyboards} />

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <SpecTable
          title="Specifikationer"
          rows={[
            ["Brand", keyboard.brand],
            ["Layout", keyboard.layout],
            ["Switch-type", keyboard.switchType],
            ["Forbindelse", keyboard.forbindelse],
            ["Trådløs", keyboard.wireless ? "Ja" : "Nej"],
            ["Batteritid", keyboard.batteritidTimer ? keyboard.batteritidTimer + " timer" : "-"],
            ["Polling rate", keyboard.pollingHz >= 1000 ? (keyboard.pollingHz / 1000) + "K Hz" : keyboard.pollingHz + " Hz"],
            ["Taster", keyboard.taster],
            ["Formfaktor", keyboard.formfaktor],
            ["RGB", keyboard.rgb ? "Ja" : "Nej"],
            ["Hot-swappable", keyboard.hotSwappable ? "Ja" : "Nej"],
            ["Keycaps", keyboard.keycapMaterial ?? "-"],
            ["Prisniveau", prisNiveauLabels[keyboard.prisNiveau] ?? keyboard.prisNiveau],
          ]}
        />

        <div className="space-y-8">
          <ProsConsList title="Fordele" items={keyboard.fordele} variant="pro" />
          <ProsConsList title="Ulemper" items={keyboard.ulemper} variant="con" />
        </div>
      </div>

      <PriceComparison product={keyboard} pagePath={`/tastaturer/${keyboard.slug}`} />

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/tastaturer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle tastaturer
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Tastaturer", path: "/tastaturer" },
              { name: keyboard.navn, path: `/tastaturer/${slug}` },
            ])
          ),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(productSchema(keyboard)),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { keyboards } = await import("@/data/keyboards");
  return keyboards.map((k) => ({ slug: k.slug }));
}
