import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { brandSlug } from "@/data/brands";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMouse, mice } from "@/data/mice";
import { bestOffer } from "@/lib/affiliate";
import { breadcrumbList, productSchema, jsonLd } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/metadata";
import { formfaktorLabels, grebLabels, haandLabels, prisNiveauLabels } from "@/lib/product-labels";
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
  const mouse = getMouse(slug);
  if (!mouse) return {};
  return buildMetadata({
    title: `${mouse.navn} - specifikationer, fordele, og priser`,
    description: `Se komplette specifikationer for ${mouse.navn}: vægt, sensor, greb, og find den bedste pris hos Proshop eller Geek'd.`,
    path: `/mus/${mouse.slug}`,
    image: mouse.billede,
  });
}

export default async function MusPage({ params }: Props) {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) notFound();

  const similar = mice
    .filter(
      (m) =>
        m.slug !== mouse.slug &&
        m.formfaktor === mouse.formfaktor &&
        m.prisNiveau === mouse.prisNiveau &&
        m.proBrugere.length > 0
    )
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .slice(0, 3);

  const similarOffers = new Map(
    await Promise.all(similar.map(async (m) => [m.slug, await bestOffer(m)] as const))
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 pb-24 sm:pb-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/mus" className="hover:text-primary transition-colors">Mus</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{mouse.navn}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[1fr_280px] mb-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {mouse.navn}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-sans tabular-nums mb-4">
            <span className="text-foreground font-semibold">{mouse.vaegtGram}g</span>
            <span className="text-border/50">|</span>
            <span>{mouse.laengdeMm}×{mouse.breddeMm}×{mouse.hoejdeMm} mm</span>
            <span className="text-border/50">|</span>
            <span>{mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")}</span>
            <span className="text-border/50">|</span>
            <span>{mouse.forbindelse}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {mouse.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PriceCta product={mouse} />
            <Link
              href={`/sammenlign/mus?p=${mouse.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Sammenlign mus
            </Link>
          </div>
        </div>
        <ProductImage
          src={mouse.billede}
          alt={mouse.navn}
          priority
          sizes="280px"
          className="h-56 sm:h-64 w-full rounded-xl bg-[#0d0d0d]"
        />
      </div>

      <ProUsersBand productSlug={mouse.slug} proBrugere={mouse.proBrugere} categoryProducts={mice} />

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <SpecTable
          title="Specifikationer"
          rows={[
            ["Brand", mouse.brand, `/maerke/${brandSlug(mouse.brand)}`],
            ["Vægt", `${mouse.vaegtGram}g`],
            ["Mål", `${mouse.laengdeMm} × ${mouse.breddeMm} × ${mouse.hoejdeMm} mm`],
            ["Formfaktor", formfaktorLabels[mouse.formfaktor] ?? mouse.formfaktor],
            ["Forbindelse", mouse.forbindelse],
            ["Batteritid", mouse.batteritidTimer ? `${mouse.batteritidTimer} timer` : "-"],
            ["Switch-type", mouse.switchType === "optisk" ? "Optisk" : "Mekanisk"],
            ["Knapper", mouse.knapper],
            ["Greb", mouse.greb.map((g) => grebLabels[g] ?? g).join(", ")],
            ["Håndstørrelse", mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")],
            ["Sensor", mouse.sensor],
            ["Max DPI", mouse.maxDpi.toLocaleString("da-DK")],
            ["Polling rate", `${mouse.pollingHz} Hz`],
            ["LOD", `${mouse.lodMm} mm`],
            ["Software", mouse.softwarePaakraevet ? "Påkrævet" : "Valgfri"],
            ["Prisniveau", prisNiveauLabels[mouse.prisNiveau] ?? mouse.prisNiveau],
          ]}
        />

        <div className="space-y-8">
          <ProsConsList title="Fordele" items={mouse.fordele} variant="pro" />
          <ProsConsList title="Ulemper" items={mouse.ulemper} variant="con" />
        </div>
      </div>

      <PriceComparison product={mouse} pagePath={`/mus/${mouse.slug}`} />

      {similar.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-xl font-semibold">Sammenlign med</h2>
            <Link
              href={`/sammenlign/mus?p=${mouse.slug}`}
              className="text-sm text-primary hover:underline"
            >
              Åbn sammenligning
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {similar.map((m) => {
              const mOffer = similarOffers.get(m.slug) ?? null;
              return (
                <div
                  key={m.slug}
                  className="rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all duration-200 group flex flex-col"
                >
                  <Link href={`/mus/${m.slug}`} className="block flex-1">
                    <ProductImage
                      src={m.billede}
                      alt={m.navn}
                      sizes="150px"
                      className="h-28 w-full rounded-lg bg-[#0d0d0d] mb-3"
                    />
                    <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {m.navn}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.vaegtGram}g &middot; {m.proBrugere.length} pro{m.proBrugere.length > 1 ? "s" : ""}
                      {mOffer?.prisDkk && ` &middot; ${mOffer.prisDkk} kr.`}
                    </div>
                  </Link>
                  <Link
                    href={`/sammenlign/mus?p=${mouse.slug},${m.slug}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-3 w-full"
                    )}
                  >
                    Sammenlign side om side
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/mus"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle mus
        </Link>
        <Link
          href="/find-mus"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Find din mus
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbList([
              { name: "Forside", path: "/" },
              { name: "Mus", path: "/mus" },
              { name: mouse.navn, path: `/mus/${slug}` },
            ])
          ),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(productSchema(mouse)),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { mice } = await import("@/data/mice");
  return mice.map((mouse) => ({ slug: mouse.slug }));
}
