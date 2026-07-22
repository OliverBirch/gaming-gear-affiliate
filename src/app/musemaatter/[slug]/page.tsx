import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMousepad, mousepads } from "@/data/mousepads";
import { getRetailer } from "@/data/retailers";

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

const prisNiveauLabels: Record<string, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

export default async function MusemaattePage({ params }: Props) {
  const { slug } = await params;
  const mousepad = getMousepad(slug);
  if (!mousepad) notFound();

  const offer = mousepad.offers.filter((o) => o.inStock !== false)[0] ?? null;
  const retailer = offer ? getRetailer(offer.retailer) : null;

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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-mono tabular-nums mb-4">
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
            {offer && retailer && (
              <a
                href={offer.affiliateUrl ?? offer.produktUrl}
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
                  ? "Se pris fra " + offer.prisDkk + " kr. hos " + retailer.navn
                  : "Se pris hos " + retailer.navn}
              </a>
            )}
          </div>
        </div>
        <div className="relative h-52 sm:h-56 w-full rounded-xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02] overflow-hidden">
          {mousepad.billede ? (
            <Image
              src={mousepad.billede}
              alt={mousepad.brand + " " + mousepad.model}
              fill
              className="object-contain p-4"
              sizes="280px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-5xl font-bold text-primary/10">{mousepad.brand.charAt(0).toUpperCase()}</div>
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
                ["Brand", mousepad.brand],
                ["Model", mousepad.model],
                ["Glide-type", glideLabels[mousepad.type] ?? mousepad.type],
                ["Materiale", mousepad.materiale],
                ["Bund", mousepad.bund],
                ["Vaskbar", mousepad.vaskbar ? "Ja" : "Nej"],
                ["Prisniveau", prisNiveauLabels[mousepad.prisNiveau] ?? mousepad.prisNiveau],
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
            <h2 className="text-xl font-semibold mb-4">Tilgængelige størrelser</h2>
            <div className="space-y-3">
              {mousepad.størrelser.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <span className="font-medium">{s.navn}</span>
                  <span className="text-muted-foreground font-mono tabular-nums">
                    {s.breddeMm} &times; {s.laengdeMm} &times; {s.tykkelseMm} mm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h2 className="text-xl font-semibold mb-4">Fordele</h2>
            <ul className="space-y-2">
              {mousepad.fordele.map((fordel, index) => (
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
              {mousepad.ulemper.map((ulempe, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0">&minus;</span>
                  <span>{ulempe}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {mousepad.offers.filter((o) => o.inStock !== false).length > 1 && (
        <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
          <h2 className="text-xl font-semibold mb-4">Priser</h2>
          <div className="space-y-3">
            {mousepad.offers.filter((o) => o.inStock !== false).map((o) => {
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
                      {o.prisDkk ? "fra " + o.prisDkk + " kr." : "Se pris"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <Link href="/musemaatter" className={cn(buttonVariants({ variant: "outline" }))}>
          &larr; Alle musemåtter
        </Link>
      </div>

      {offer && retailer && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md p-3 sm:hidden">
          <a
            href={offer.affiliateUrl ?? offer.produktUrl}
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
              ? "Køb fra " + offer.prisDkk + " kr. hos " + retailer.navn
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
              { "@type": "ListItem", position: 2, name: "Musemåtter", item: "https://prosetups.dk/musemaatter" },
              { "@type": "ListItem", position: 3, name: mousepad.brand + " " + mousepad.model, item: "https://prosetups.dk/musemaatter/" + slug },
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
            name: mousepad.brand + " " + mousepad.model,
            brand: { "@type": "Brand", name: mousepad.brand },
            description: mousepad.beskrivelse,
            offers: mousepad.offers.filter((o) => o.inStock !== false).map((o) => ({
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
  const { mousepads } = await import("@/data/mousepads");
  return mousepads.map((m) => ({ slug: m.slug }));
}
