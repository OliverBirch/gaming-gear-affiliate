import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { mice } from "@/data/mice";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { brandSlug } from "@/data/brands";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bedste mus til Valorant i 2026 - ProSetups.dk",
  description: "Find den bedste gaming-mus til Valorant. Se hvad pros som TenZ, aspas og sacy bruger, og find den perfekte mus til dit spil.",
};

const picks = [
  {
    slug: "logitech-g-pro-x-superlight-2",
    label: "Vores valg",
    begrundelse:
      "Den mest populære mus på tværs af alle spil — også i Valorant. Let, præcis og med lang batteritid. Brugt af aspas, leaf og mange flere.",
  },
  {
    slug: "razer-viper-v4-pro",
    label: "Bedste Razer",
    begrundelse:
      "49 gram og 8000 Hz polling rate. Valorant-pros som smoggy og twistzz sværger til den nyeste Viper-serie. Ekstremt let og responsiv.",
  },
  {
    slug: "razer-viper-v3-pro",
    label: "Populær blandt pros",
    begrundelse:
      "Razers letteste konkurrencemus med 55 gram. Brugt af TenZ, ZywOo og sacy. Et gennemtestet valg med masser af pro-data at støtte sig til.",
  },
  {
    slug: "zowie-u2-dw",
    label: "Bedste ZOWIE",
    begrundelse:
      "60 gram, 4000 Hz og driverløs opsætning. ZOWIEs nyeste flagskib er populær blandt Valorant-pros som nAts. Perfekt til claw-greb.",
  },
  {
    slug: "pulsar-tenz-signature-edition",
    label: "TenZ signaturmus",
    begrundelse:
      "Designet i samarbejde med TenZ selv. 47 gram og 8000 Hz polling rate. Et unikt valg hvis du vil have præcis hvad en af Valorants største stjerner bruger.",
  },
];

export default function BedsteMusTilValorant() {
  const sortedMice = picks.map((p) => ({
    ...p,
    mouse: mice.find((m) => m.slug === p.slug)!,
  }));

  const haandLabels: Record<string, string> = {
    lille: "Lille",
    medium: "Medium",
    stor: "Stor",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Bedste mus til Valorant</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
        Bedste mus til Valorant i 2026
      </h1>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-[65ch]">
        Valorant kræver præcis aim og hurtige reaktioner. Den rigtige mus gør en mærkbar forskel,
        især når du skal ramme de præcise headshots med Vandal eller Sheriff. Vi har samlet de
        bedste valg baseret på hvad Valorant-pros rent faktisk bruger.
      </p>

      <div className="space-y-10 mb-16">
        {sortedMice.map(({ mouse, label, begrundelse }, i) => {
          const offer = bestOffer(mouse);
          const retailer = offer ? getRetailer(offer.retailer) : null;
          const isTop = i === 0;

          return (
            <div
              key={mouse.slug}
              className={cn(
                "rounded-xl border p-6 sm:p-8",
                isTop
                  ? "border-primary/40 bg-primary/[0.03]"
                  : "border-border/50 bg-card"
              )}
            >
              <div className="flex items-start gap-2 mb-4 flex-wrap">
                <Badge
                  className={cn(
                    "text-xs",
                    isTop
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  #{i + 1} — {label}
                </Badge>
                {mouse.proBrugere.length > 0 && (
                  <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                    {mouse.proBrugere.length} pro{mouse.proBrugere.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-[160px_1fr] items-start">
                <Link
                  href={`/mus/${mouse.slug}`}
                  className="relative h-32 w-full rounded-lg bg-[#0d0d0d] overflow-hidden"
                >
                  {mouse.billede && (
                    <Image
                      src={mouse.billede}
                      alt={mouse.navn}
                      fill
                      className="object-contain p-4"
                      sizes="160px"
                    />
                  )}
                </Link>

                <div>
                  <Link
                    href={`/mus/${mouse.slug}`}
                    className="text-xl font-bold hover:text-primary transition-colors"
                  >
                    {mouse.navn}
                  </Link>
                  <Link
                    href={`/maerke/${brandSlug(mouse.brand)}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {mouse.brand}
                  </Link>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                      {mouse.vaegtGram}g
                    </Badge>
                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                      {mouse.pollingHz}Hz
                    </Badge>
                    {mouse.haandStoerrelse.length > 0 && (
                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                        {mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")}
                      </Badge>
                    )}
                    {mouse.wireless && (
                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                        Trådløs
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {begrundelse}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/mus/${mouse.slug}`}
                      className="text-sm text-primary hover:underline underline-offset-4"
                    >
                      Se specs &rarr;
                    </Link>
                    {offer && retailer && (
                      <a
                        href={offer.affiliateUrl}
                        rel="sponsored nofollow"
                        target="_blank"
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "gap-1.5 active:scale-[0.98] transition-transform duration-150"
                        )}
                      >
                        {retailer.logo && (
                          <Image
                            src={retailer.logo}
                            alt={retailer.navn}
                            width={14}
                            height={14}
                            className="rounded-sm object-contain"
                          />
                        )}
                        {offer.prisDkk
                          ? `Køb ${offer.prisDkk} kr.`
                          : `Køb hos ${retailer.navn}`}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-12">
        <h2 className="text-xl font-semibold mb-4">Hvad skal du kigge efter i en Valorant-mus?</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Letvægt (under 65g):</strong> Valorant handler om
            præcise micro-adjustments og hurtige flicks. En let mus reducerer træthed og giver
            bedre kontrol i lange sessioner.
          </div>
          <div>
            <strong className="text-foreground">Høj polling rate:</strong> 4000Hz eller helst 8000Hz
            giver mærkbart glattere tracking i Valorant. Flere og flere pros skifter til 8K Hz.
          </div>
          <div>
            <strong className="text-foreground">Greb:</strong> Claw og fingertip er dominerende i
            Valorant. Vælg en symmetrisk mus hvis du bruger et af disse greb.
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-12">
        <h2 className="text-xl font-semibold mb-4">Ofte stillede spørgsmål</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-1">Hvilken mus bruger TenZ?</h3>
            <p className="text-sm text-muted-foreground">
              TenZ har sin egen signaturmus fra Pulsar — Pulsar TenZ Signature Edition. Den vejer
              47 gram og har 8000 Hz polling rate. Han brugte tidligere Razer Viper V3 Pro.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Hvad er den mest populære mus i Valorant?</h3>
            <p className="text-sm text-muted-foreground">
              Logitech G Pro X Superlight 2 er den mest brugte på tværs af alle esport, men Razer Viper V3 Pro
              og den nyere Viper V4 Pro er også ekstremt populære blandt Valorant-pros.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Er 8000 Hz polling rate nødvendigt til Valorant?</h3>
            <p className="text-sm text-muted-foreground">
              Ikke nødvendigt, men det giver en mærkbar forskel i glathed. Flere top-pros som
              TenZ og smoggy bruger 8000 Hz mus. Det kræver dog en kraftig CPU.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Ikke sikker på hvilken mus der passer dig? Brug vores finder.
        </p>
        <Link
          href="/find-mus"
          className={cn(buttonVariants({ size: "lg" }), "active:scale-[0.98] transition-transform duration-150")}
        >
          Find din mus
        </Link>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://prosetups.dk/guides" },
              { "@type": "ListItem", position: 3, name: "Bedste mus til Valorant", item: "https://prosetups.dk/guides/bedste-mus-til-valorant" },
            ],
          }),
        }}
      />
      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Bedste mus til Valorant i 2026",
            description: "Find den bedste gaming-mus til Valorant. Se hvad pros som TenZ, aspas og sacy bruger.",
          }),
        }}
      />
      <Script
        id="schema-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Bedste mus til Valorant",
            description: "Anbefalede gaming-mus til Valorant",
            itemListElement: sortedMice.map(({ mouse }, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: mouse.navn,
                brand: mouse.brand,
                url: `https://prosetups.dk/mus/${mouse.slug}`,
              },
            })),
            numberOfItems: sortedMice.length,
          }),
        }}
      />
    </div>
  );
}
