import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getKeyboard } from "@/data/keyboards";
import { getRetailer } from "@/data/retailers";
import { bestOffer, bestOffers } from "@/lib/affiliate";

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

const prisNiveauLabels: Record<string, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

export default async function TastaturPage({ params }: Props) {
  const { slug } = await params;
  const keyboard = getKeyboard(slug);
  if (!keyboard) notFound();

  const offer = bestOffer(keyboard);
  const allOffers = bestOffers(keyboard);
  const retailer = offer ? getRetailer(offer.retailer) : null;

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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-mono tabular-nums mb-4">
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
                  ? "Se pris " + offer.prisDkk + " kr. hos " + retailer.navn
                  : "Se pris hos " + retailer.navn}
              </a>
            )}
          </div>
        </div>
        <div className="relative h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02] overflow-hidden">
          {keyboard.billede ? (
            <Image
              src={keyboard.billede}
              alt={keyboard.navn}
              fill
              className="object-contain p-4"
              sizes="280px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-5xl font-bold text-primary/10">{keyboard.navn.charAt(0).toUpperCase()}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="text-xl font-semibold mb-4">Specifikationer</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
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
              ].map((row) => {
                const [label, value] = row;
                return (
                  <tr key={label} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground pr-4 whitespace-nowrap">{label}</td>
                    <td className="py-2.5 font-medium">{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-xl font-semibold mb-4">Fordele</h2>
            <ul className="space-y-2">
              {keyboard.fordele.map((fordel, index) => (
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
              {keyboard.ulemper.map((ulempe, index) => (
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
                    <div>
                      <span className="font-medium">{r.navn}</span>
                      {o.inStock === false && (
                        <span className="ml-2 text-xs text-destructive">Udsolgt</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.inStock !== false && (
                      <span className="text-xs text-muted-foreground">På lager</span>
                    )}
                    <span className="text-lg font-bold tabular-nums text-primary">
                      {o.prisDkk ? o.prisDkk + " kr." : "Se pris"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/tastaturer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          &larr; Alle tastaturer
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
              ? "Køb " + offer.prisDkk + " kr. hos " + retailer.navn
              : "Køb hos " + retailer.navn}
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
              { "@type": "ListItem", position: 2, name: "Tastaturer", item: "https://prosetups.dk/tastaturer" },
              { "@type": "ListItem", position: 3, name: keyboard.navn, item: "https://prosetups.dk/tastaturer/" + slug },
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
            name: keyboard.navn,
            brand: { "@type": "Brand", name: keyboard.brand },
            description: keyboard.beskrivelse,
            image: keyboard.billede ? "https://prosetups.dk" + keyboard.billede : undefined,
            offers: keyboard.offers.filter((o) => o.inStock !== false).map((o) => ({
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
  const { keyboards } = await import("@/data/keyboards");
  return keyboards.map((k) => ({ slug: k.slug }));
}
