import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMonitor, monitors } from "@/data/monitors";
import { bestOffers, bestOffer } from "@/lib/affiliate";
import { AffiliateLink } from "@/components/affiliate-link";
import { getRetailer } from "@/data/retailers";
import { breadcrumbList, productSchema, jsonLd } from "@/lib/schema-org";

interface Props {
  params: Promise<{ slug: string }>;
}

const prisNiveauLabels: Record<string, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

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

export function generateStaticParams() {
  return monitors.map((m) => ({ slug: m.slug }));
}

export default async function SkaermPage({ params }: Props) {
  const { slug } = await params;
  const monitor = getMonitor(slug);
  if (!monitor) notFound();

  const allOffers = bestOffers(monitor);
  const offer = bestOffer(monitor);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
          <span className="mx-2">/</span>
          <Link href="/skaerme" className="hover:text-primary transition-colors">Skærme</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{monitor.navn}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl bg-[#0d0d0d]">
            {monitor.billede ? (
              <Image
                src={monitor.billede}
                alt={monitor.navn}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-8xl font-bold text-foreground/5">{monitor.navn.charAt(0).toUpperCase()}</div>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {monitor.brand} {monitor.navn}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{monitor.stoerrelseTommer}&quot;</Badge>
              <Badge variant="secondary">{monitor.oploesning}</Badge>
              <Badge variant="secondary">{monitor.opdateringsHz} Hz</Badge>
              <Badge variant="secondary">{paneltypeLabels[monitor.paneltype]}</Badge>
              <Badge variant="outline">{prisNiveauLabels[monitor.prisNiveau]}</Badge>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{monitor.beskrivelse}</p>

            {allOffers.length > 0 && (
              <div className="space-y-2 mb-6">
                {allOffers.map((o) => {
                  const r = getRetailer(o.retailer);
                  return (
                    <AffiliateLink
                      key={o.retailer}
                      retailer={o.retailer}
                      produktUrl={o.produktUrl}
                      affiliateUrl={o.affiliateUrl}
                      productSlug={monitor.slug}
                      pagePath={`/skaerme/${monitor.slug}`}
                      network={r?.netvaerk}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm transition-colors duration-150",
                        o.inStock === false ? "opacity-50 pointer-events-none" : "hover:border-primary/40 hover:bg-primary/[0.02]"
                      )}
                    >
                      <span className="font-medium">{r?.navn ?? o.retailer}</span>
                      <span className="font-semibold tabular-nums">
                        {o.prisDkk != null ? `${o.prisDkk} kr.` : "Ikke på lager"}
                      </span>
                    </AffiliateLink>
                  );
                })}
              </div>
            )}

            {offer && (
              <AffiliateLink
                retailer={offer.retailer}
                produktUrl={offer.produktUrl}
                affiliateUrl={offer.affiliateUrl}
                productSlug={monitor.slug}
                pagePath={`/skaerme/${monitor.slug}`}
                network={getRetailer(offer.retailer)?.netvaerk}
                className={cn(buttonVariants(), "w-full active:scale-[0.98] transition-transform duration-150")}
              >
                {offer.inStock === false
                  ? "Se hos " + (getRetailer(offer.retailer)?.navn ?? offer.retailer)
                  : "Køb hos " +
                    (getRetailer(offer.retailer)?.navn ?? offer.retailer) +
                    (offer.prisDkk ? " - " + offer.prisDkk + " kr." : "")}
              </AffiliateLink>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-lg font-semibold mb-4">Specifikationer</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
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
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground pr-4 w-1/2">{label}</td>
                    <td className="py-2.5 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            {monitor.fordele.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-7 mb-6">
                <h2 className="text-lg font-semibold mb-4">Fordele</h2>
                <ul className="space-y-2">
                  {monitor.fordele.map((fordel, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-primary shrink-0">+</span>
                      <span className="text-muted-foreground">{fordel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {monitor.ulemper.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-7">
                <h2 className="text-lg font-semibold mb-4">Ulemper</h2>
                <ul className="space-y-2">
                  {monitor.ulemper.map((ulempe, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-red-400 shrink-0">&minus;</span>
                      <span className="text-muted-foreground">{ulempe}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/skaerme"
            className={cn(buttonVariants({ variant: "outline" }), "text-sm")}
          >
            &larr; Alle skærme
          </Link>
        </div>
      </div>

      <Script
        id="schema-skaerm-breadcrumb"
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
        id="schema-skaerm-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            productSchema({ ...monitor, navn: `${monitor.brand} ${monitor.navn}` })
          ),
        }}
      />
    </>
  );
}
