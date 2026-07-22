import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMouse, mice } from "@/data/mice";
import { bestOffer, bestOffers } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { getPro } from "@/data/pros";
import { ProAvatar } from "@/components/pro-avatar";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) return {};
  return {
    title: `${mouse.navn} - specifikationer, fordele, og priser`,
    description: `Se komplette specifikationer for ${mouse.navn}: vægt, sensor, greb, og find den bedste pris hos Proshop, MaxGaming eller Computersalg.`,
  };
}

const formfaktorLabels: Record<string, string> = {
  ergonomisk: "Ergonomisk",
  symmetrisk: "Symmetrisk",
  ambidextrous: "Ambidextrous",
};

const haandLabels: Record<string, string> = {
  lille: "Lille",
  medium: "Medium",
  stor: "Stor",
};

export default async function MusPage({ params }: Props) {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) notFound();

  const offer = bestOffer(mouse);
  const allOffers = bestOffers(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  const proUsers = mouse.proBrugere
    .map((s) => getPro(s))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .slice(0, 24);

  const maxProCount = Math.max(...mice.map((m) => m.proBrugere.length));
  const popularityPct = Math.round((mouse.proBrugere.length / maxProCount) * 100);

  const sortedByProCount = [...mice].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );
  const rank = sortedByProCount.findIndex((m) => m.slug === mouse.slug) + 1;

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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-mono tabular-nums mb-4">
            <span className="text-foreground font-semibold">{mouse.vaegtGram}g</span>
            <span className="text-border/50">|</span>
            <span>{mouse.pollingHz} Hz</span>
            <span className="text-border/50">|</span>
            <span>{mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")}</span>
            <span className="text-border/50">|</span>
            <span>{mouse.wireless ? "Trådløs" : "Kablet"}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {mouse.beskrivelse}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {offer && retailer && (
              <a
                href={offer.affiliateUrl}
                rel="sponsored nofollow"
                target="_blank"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-1.5 active:scale-[0.98] transition-transform duration-150"
                )}
              >
                {retailer.logo && (
                  <Image
                    src={retailer.logo}
                    alt={retailer.navn}
                    width={18}
                    height={18}
                    className="rounded-sm object-contain"
                  />
                )}
                {offer.prisDkk
                  ? `Se pris ${offer.prisDkk} kr. hos ${retailer.navn}`
                  : `Se pris hos ${retailer.navn}`}
              </a>
            )}
            {mouse.proBrugere.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg font-bold tabular-nums text-primary">
                  {mouse.proBrugere.length}
                </span>
                <span className="text-muted-foreground">
                  pro{mouse.proBrugere.length > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground/50">#{rank} mest populære</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02] overflow-hidden">
          {mouse.billede ? (
            <Image
              src={mouse.billede}
              alt={mouse.navn}
              fill
              className="object-contain p-4"
              sizes="280px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-5xl font-bold text-primary/10">{mouse.navn.charAt(0).toUpperCase()}</div>
            </div>
          )}
        </div>
      </div>

      {proUsers.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">
              Bruges af <span className="text-primary">{mouse.proBrugere.length}</span> pro{mouse.proBrugere.length > 1 ? "s" : ""}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>#{rank} mest populære</span>
              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${popularityPct}%` }}
                />
              </div>
              <span>{popularityPct}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {proUsers.map((pro) => (
              <Link
                key={pro.slug}
                href={`/pro/${pro.slug}`}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30 transition-colors duration-150"
              >
                <ProAvatar navn={pro.navn} slug={pro.slug} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{pro.navn}</div>
                  <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="text-xl font-semibold mb-4">Specifikationer</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Brand", mouse.brand],
                ["Vægt", `${mouse.vaegtGram}g`],
                ["Formfaktor", formfaktorLabels[mouse.formfaktor] ?? mouse.formfaktor],
                ["Forbindelse", mouse.wireless ? "Trådløs" : "Kablet"],
                ["Greb", mouse.greb.map((g) => grebLabel(g)).join(", ")],
                ["Håndstørrelse", mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")],
                ["Sensor", mouse.sensor],
                ["Max DPI", mouse.maxDpi.toLocaleString("da-DK")],
                ["Polling rate", `${mouse.pollingHz} Hz`],
                ["Prisniveau", mouse.prisNiveau === "budget" ? "Budget" : mouse.prisNiveau === "mid" ? "Mellemklasse" : "Flagship"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 text-muted-foreground pr-4 whitespace-nowrap">{label}</td>
                  <td className="py-2.5 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-xl font-semibold mb-4">Fordele</h2>
            <ul className="space-y-2">
              {mouse.fordele.map((fordel, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">+</span>
                  <span>{fordel}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-xl font-semibold mb-4">Ulemper</h2>
            <ul className="space-y-2">
              {mouse.ulemper.map((ulempe, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0">&minus;</span>
                  <span>{ulempe}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {allOffers.length > 1 && (
        <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
          <h2 className="text-xl font-semibold mb-4">Priser</h2>
          <div className="space-y-3">
            {allOffers.map((o) => {
              const r = getRetailer(o.retailer);
              if (!r) return null;
              return (
                <a
                  key={o.retailer}
                  href={o.affiliateUrl ?? o.produktUrl}
                  rel="sponsored nofollow"
                  target="_blank"
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {r.logo && (
                      <Image
                        src={r.logo}
                        alt={r.navn}
                        width={20}
                        height={20}
                        className="rounded-sm object-contain"
                      />
                    )}
                    <span className="font-medium">{r.navn}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-primary">
                    {o.prisDkk ? `${o.prisDkk} kr.` : "Se pris"}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sammenlign med</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {similar.map((m) => {
              const mOffer = bestOffer(m);
              const mRetailer = mOffer ? getRetailer(mOffer.retailer) : null;
              return (
                <Link
                  key={m.slug}
                  href={`/mus/${m.slug}`}
                  className="rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="relative h-24 w-full rounded-lg bg-[#0d0d0d] overflow-hidden mb-3">
                    {m.billede ? (
                      <Image
                        src={m.billede}
                        alt={m.navn}
                        fill
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        sizes="150px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-3xl font-bold text-foreground/5">{m.navn.charAt(0).toUpperCase()}</div>
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {m.navn}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {m.vaegtGram}g &middot; {m.proBrugere.length} pro{m.proBrugere.length > 1 ? "s" : ""}
                    {mOffer?.prisDkk && ` &middot; ${mOffer.prisDkk} kr.`}
                  </div>
                </Link>
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

      {offer && retailer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md p-3 sm:hidden">
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(
              buttonVariants({ size: "default" }),
              "w-full gap-2 active:scale-[0.98] transition-transform duration-150 text-base"
            )}
          >
            {retailer.logo && (
              <Image
                src={retailer.logo}
                alt={retailer.navn}
                width={18}
                height={18}
                className="rounded-sm object-contain"
              />
            )}
            {offer.prisDkk
              ? `Køb ${offer.prisDkk} kr. hos ${retailer.navn}`
              : `Køb hos ${retailer.navn}`}
          </a>
        </div>
      )}

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Mus", item: "https://prosetups.dk/mus" },
              { "@type": "ListItem", position: 3, name: mouse.navn, item: `https://prosetups.dk/mus/${slug}` },
            ],
          }),
        }}
      />
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: mouse.navn,
            brand: { "@type": "Brand", name: mouse.brand },
            description: mouse.beskrivelse,
            image: mouse.billede ? `https://prosetups.dk${mouse.billede}` : undefined,
            offers: mouse.offers.filter((o) => o.inStock !== false).map((o) => ({
              "@type": "Offer",
              url: o.affiliateUrl ?? o.produktUrl,
              price: o.prisDkk ?? undefined,
              priceCurrency: o.prisDkk ? "DKK" : undefined,
              availability: o.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: o.retailer },
            })),
          }),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { mice } = await import("@/data/mice");
  return mice.map((mouse) => ({ slug: mouse.slug }));
}

function grebLabel(g: string): string {
  return g === "palm" ? "Palm" : g === "claw" ? "Claw" : "Fingertip";
}
