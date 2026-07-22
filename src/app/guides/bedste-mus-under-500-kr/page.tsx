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
  title: "Bedste gaming-mus under 500 kr. i 2026 - ProSetups.dk",
  description: "Find den bedste gaming-mus til under 500 kroner. Budgetvenlige mus med pro-grade sensor og god kvalitet.",
};

const picks = [
  {
    slug: "logitech-g403-hero",
    label: "Bedste budgetvalg",
    begrundelse:
      "Logitech G403 Hero tilbyder Hero 25K-sensoren til en brøkdel af prisen på flagskibene. 87 gram er tungere end dyre mus, men build-kvaliteten og sensoren er pro-grade. Det bedste kompromis mellem pris og performance.",
  },
  {
    slug: "zowie-ec2-dw",
    label: "Bedste ergonomiske i klassen",
    begrundelse:
      "ZOWIE EC2-DW er i mellemklassen prismæssigt, men giver dig trådløs frihed og ZOWIEs legendariske byggekvalitet. Plug-and-play uden software, ideel til turneringsspillere.",
  },
  {
    slug: "pulsar-x2h",
    label: "Bedst til claw-greb",
    begrundelse:
      "Pulsar X2H er designet specifikt til claw-greb og har PAW3395 flagskibssensor, samme sensor som i mus til over 1000 kr. Fantastisk værdi for prisen.",
  },
  {
    slug: "vaxee-xe-wireless",
    label: "Bedste byggekvalitet",
    begrundelse:
      "Vaxee XE Wireless er skabt af tidligere ZOWIE-medarbejdere. Byggekvaliteten er exceptionel, og 3395-sensoren matcher langt dyrere mus. Et solidt valg i mellemklassen.",
  },
];

export default function BedsteMusUnder500() {
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
        <span className="text-foreground">Gaming-mus under 500 kr.</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
        Bedste gaming-mus under 500 kr.
      </h1>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-[65ch]">
        Du behøver ikke at bruge en formue på en gaming-mus. Der findes flere glimrende valg
        under 500 kroner, med sensorer og byggekvalitet der kan matche langt dyrere modeller.
        Her er vores bud på de bedste budget-mus til konkurrencespil.
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
                <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                  {mouse.prisNiveau === "budget" ? "Budget" : mouse.prisNiveau === "mid" ? "Mellemklasse" : "Flagship"}
                </Badge>
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
        <h2 className="text-xl font-semibold mb-4">Hvad får du for under 500 kr.?</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">God sensor:</strong> Selv budget-mus har i dag
            sensorer som PAW3395 og Hero 25K der tidligere kun fandtes i flagskibe. Du behøver
            ikke gå på kompromis med tracking-præcision.
          </div>
          <div>
            <strong className="text-foreground">Solide materialer:</strong> Byggekvaliteten på
            mellemklasse-mus er ofte på niveau med dyrere modeller. Forskellen er primært vægt,
            polling rate og ekstrafunktioner som RGB.
          </div>
          <div>
            <strong className="text-foreground">Hvad du giver afkald på:</strong> Lavere polling
            rate (1000Hz vs 4000Hz+), ofte tungere vægt, og sjældent trådløs. Til de fleste
            spillere gør det ingen praktisk forskel.
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Vil du se alle muligheder? Brug vores mus-finder.
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
              { "@type": "ListItem", position: 3, name: "Gaming-mus under 500 kr.", item: "https://prosetups.dk/guides/bedste-mus-under-500-kr" },
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
            headline: "Bedste gaming-mus under 500 kr.",
            description: "Find den bedste gaming-mus til under 500 kroner. Budgetvenlige mus med pro-grade sensor.",
          }),
        }}
      />
    </div>
  );
}
