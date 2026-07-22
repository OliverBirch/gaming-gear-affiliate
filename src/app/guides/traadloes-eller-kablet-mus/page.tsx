import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { mice } from "@/data/mice";
import { pros } from "@/data/pros";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trådløs eller kablet mus? Hvad skal du vælge - ProSetups.dk",
  description: "Trådløs vs kablet gaming-mus: hvad er bedst til dig? Vi sammenligner latency, vægt, batteritid og pris, så du kan træffe det rigtige valg.",
};

const wireless = mice.filter((m) => m.wireless).sort((a, b) => b.proBrugere.length - a.proBrugere.length).slice(0, 3);
const wired = mice.filter((m) => !m.wireless).sort((a, b) => b.proBrugere.length - a.proBrugere.length).slice(0, 3);

// Was previously summing raw proBrugere counts across wireless mice and
// rendering the sum directly as a percentage, which produced 156% once the
// pro dataset grew past 100 tracked players. This divides by the actual
// total instead.
const wirelessProPct = Math.round(
  (pros.filter((p) => mice.find((m) => m.slug === p.musSlug)?.wireless).length / pros.length) * 100
);

const haandLabels: Record<string, string> = {
  lille: "Lille",
  medium: "Medium",
  stor: "Stor",
};

function MouseMini({ slug }: { slug: string }) {
  const mouse = mice.find((m) => m.slug === slug)!;
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <Link
      href={`/mus/${slug}`}
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="relative h-14 w-14 shrink-0 rounded-lg bg-[#0d0d0d] overflow-hidden">
        {mouse.billede && (
          <Image src={mouse.billede} alt={mouse.navn} fill className="object-contain p-2" sizes="56px" />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium group-hover:text-primary transition-colors truncate">
          {mouse.navn}
        </div>
        <div className="text-xs text-muted-foreground">
          {mouse.vaegtGram}g &middot; {mouse.proBrugere.length} pro{mouse.proBrugere.length > 1 ? "s" : ""}
          {offer?.prisDkk && ` &middot; ${offer.prisDkk} kr.`}
        </div>
      </div>
    </Link>
  );
}

export default function TraadloesEllerKablet() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Trådløs eller kablet mus?</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
        Trådløs eller kablet mus? Hvad skal du vælge
      </h1>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-[65ch]">
        Skal du vælge trådløs eller kablet gaming-mus? Svaret er ikke længere så entydigt,
        for moderne trådløs teknologi har indhentet kablet på stort set alle parametre.
        Her er hvad du skal vide.
      </p>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-6">
          <h2 className="text-lg font-bold mb-1">Trådløs</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {wirelessProPct}% af pros bruger trådløst
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Ingen kabel, fuld bevægelsesfrihed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Samme latency som kablet (moderne teknologi)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Lettere at transportere til LAN/turnering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">&minus;</span>
              <span>Skal oplades (70-95 timers batteri typisk)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">&minus;</span>
              <span>Dyrere end tilsvarende kablet model</span>
            </li>
          </ul>
          {wireless.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Populære trådløse mus:</div>
              {wireless.map((m) => (
                <MouseMini key={m.slug} slug={m.slug} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-lg font-bold mb-1">Kablet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Stadig et solidt valg: billigere og lettere
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Billigere, samme sensor til lavere pris</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Lettere, intet batteri</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">+</span>
              <span>Plug and play, aldrig løbetør for strøm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">&minus;</span>
              <span>Kabel kan skabe modstand og trække</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">&minus;</span>
              <span>Kræver kabel management for optimal oplevelse</span>
            </li>
          </ul>
          {wired.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Populære kablede mus:</div>
              {wired.map((m) => (
                <MouseMini key={m.slug} slug={m.slug} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-12">
        <h2 className="text-xl font-semibold mb-4">Hvad betyder latency i praksis?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Moderne trådløs teknologi som Logitech Lightspeed og Razer HyperSpeed har en
          latency på under 1 ms, det samme som de bedste kablede forbindelser. I blindtests
          kan selv professionelle spillere ikke skelne mellem kablet og trådløst.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Den største forskel i dag er pris og bekvemmelighed. Trådløse mus koster typisk
          200-400 kr. mere end deres kablede modstykker. Til gengæld slipper du for kabelrod.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-12">
        <h2 className="text-xl font-semibold mb-4">Ofte stillede spørgsmål</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-1">Er trådløse mus lige så gode som kablede til gaming?</h3>
            <p className="text-sm text-muted-foreground">
              Ja. Moderne trådløs teknologi har samme latency som kablet. Over 90% af CS2-pros
              og Valorant-pros bruger trådløse mus. Forskellen i dag er primært pris og
              bekvemmelighed, ikke performance.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Hvor ofte skal jeg oplade en trådløs gaming-mus?</h3>
            <p className="text-sm text-muted-foreground">
              De fleste trådløse gaming-mus holder 70-95 timer på en opladning. Hvis du spiller
              4 timer om dagen, skal du oplade cirka en gang hver 2-3 uge. De fleste har
              også hurtigopladning: 10 minutter giver flere timers spil.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Hvornår giver kablet stadig mening?</h3>
            <p className="text-sm text-muted-foreground">
              Hvis du har et stramt budget, eller hvis du vejer musen som en kritisk faktor.
              Kablede mus er typisk 5-10 gram lettere end deres trådløse modstykker (intet batteri),
              og du kan få samme sensor til en lavere pris.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Find den perfekte mus, uanset om den er trådløs eller kablet.
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
              { "@type": "ListItem", position: 3, name: "Trådløs eller kablet mus?", item: "https://prosetups.dk/guides/traadloes-eller-kablet-mus" },
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
            headline: "Trådløs eller kablet mus? Hvad skal du vælge",
            description: "Trådløs vs kablet gaming-mus: hvad er bedst til dig? Vi sammenligner latency, vægt, batteritid og pris.",
          }),
        }}
      />
    </div>
  );
}
