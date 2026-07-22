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
  title: "Bedste mus til CS2 i 2026 - ProSetups.dk",
  description: "Find den bedste gaming-mus til Counter-Strike 2. Vi har analyseret hvad CS2-pros bruger og fundet de bedste valg til alle budgetter.",
};

const picks = [
  {
    slug: "logitech-g-pro-x-superlight-2",
    label: "Vores valg",
    begrundelse:
      "Den mest brugte mus blandt CS2-pros. 60 grams vægt, 4000 Hz polling og Hero 2-sensoren gør den til det oplagte førstevalg. Over 80 CS2-pros bruger den, herunder donk, device og sh1ro.",
  },
  {
    slug: "razer-viper-v3-pro",
    label: "Bedste alternativ",
    begrundelse:
      "55 gram og Razers Focus Pro-sensor. ZywOo sværger til denne. Et glimrende valg hvis du foretrækker en lettere mus eller Razers software-økosystem.",
  },
  {
    slug: "zowie-ec2-dw",
    label: "Bedste ergonomiske",
    begrundelse:
      "Den trådløse EC2-DW giver klassisk ZOWIE-komfort med moderne trådløs teknologi. Ideel til palm/claw-greb, brugt af jabbi, NertZ og brollan.",
  },
  {
    slug: "razer-deathadder-v3",
    label: "Bedst til palm-greb",
    begrundelse:
      "Razers letteste ergonomiske mus (63g). Perfekt til palm-greb og store hænder. Spinx, karrigan og ropz bruger den.",
  },
  {
    slug: "g-wolves-hts-pro-4k",
    label: "Godt budgetvalg",
    begrundelse:
      "47 gram og 4000 Hz polling rate til en fornuftig pris. m0NESY bruger denne. Kræver dog små til mellemstore hænder.",
  },
];

export default function BedsteMusTilCS2() {
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
        <span className="text-foreground">Bedste mus til CS2</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
        Bedste mus til CS2 i 2026
      </h1>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-[65ch]">
        Counter-Strike 2 stiller store krav til din mus. Letvægt, høj polling rate og præcis
        tracking er afgørende for at kunne ramme dine skud. Vi har analyseret hvad over 200
        CS2-pros bruger og fundet de bedste valg, uanset om du er på budget eller klar til
        et flagskib.
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
                  #{i + 1} · {label}
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
        <h2 className="text-xl font-semibold mb-4">Hvad skal du kigge efter i en CS2-mus?</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Vægt (60-80g):</strong> Lette mus giver hurtigere
            flicks og mindre træthed over lange sessioner. De fleste CS2-pros bruger mus under 70g.
          </div>
          <div>
            <strong className="text-foreground">Polling rate (1000-4000Hz):</strong> Højere polling
            rate betyder mindre forsinkelse mellem dine bevægelser og skærmen. 4000Hz bliver
            standard blandt pros.
          </div>
          <div>
            <strong className="text-foreground">Greb:</strong> Vælg en mus der passer til dit greb.
            Palm-greb kræver ergonomisk eller større symmetrisk mus. Claw og fingertip fungerer
            bedst med mindre, symmetriske mus.
          </div>
          <div>
            <strong className="text-foreground">Trådløs:</strong> Moderne trådløse mus har samme
            latency som kablede. Batteritid på 70-95 timer betyder ugentlig opladning.
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-12">
        <h2 className="text-xl font-semibold mb-4">Ofte stillede spørgsmål</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-1">Hvilken mus bruger flest CS2-pros?</h3>
            <p className="text-sm text-muted-foreground">
              Logitech G Pro X Superlight 2 er den mest brugte mus blandt CS2-pros med over 60
              trackede spillere. Donk, device og sh1ro er blandt brugerne.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Er trådløse mus gode nok til CS2?</h3>
            <p className="text-sm text-muted-foreground">
              Ja. Over 90% af CS2-pros bruger trådløse mus. Moderne teknologi som Logitech
              Lightspeed og Razer HyperSpeed har samme latency som kablede forbindelser.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Hvad betyder polling rate for CS2?</h3>
            <p className="text-sm text-muted-foreground">
              Polling rate er hvor ofte musen rapporterer sin position til computeren. 1000Hz =
              hver ms, 4000Hz = hver 0.25ms. Højere polling rate giver mere præcis tracking,
              især ved hurtige flicks.
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
              { "@type": "ListItem", position: 3, name: "Bedste mus til CS2", item: "https://prosetups.dk/guides/bedste-mus-til-cs2" },
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
            headline: "Bedste mus til CS2 i 2026",
            description: "Find den bedste gaming-mus til Counter-Strike 2. Vi har analyseret hvad CS2-pros bruger og fundet de bedste valg til alle budgetter.",
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
            name: "Bedste mus til CS2",
            description: "Anbefalede gaming-mus til Counter-Strike 2",
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
