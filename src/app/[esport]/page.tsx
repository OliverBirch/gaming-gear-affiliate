import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEsport } from "@/data/esports";
import { esports } from "@/data/esports";
import { mice } from "@/data/mice";
import { pros } from "@/data/pros";
import { MouseCard } from "@/components/mouse-card";
import { ProSettingsTable, type ProTableRow } from "@/components/pro-settings-table";

interface Props {
  params: Promise<{ esport: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) return {};
  return {
    title: `${esport.navn} mus - bedste mus til ${esport.navn}`,
    description: `Se præcis hvilke mus ${esport.navn}-pros bruger. Find den perfekte mus med de bedste danske priser.`,
  };
}

export function generateStaticParams() {
  return esports.filter((e) => e.aktiv).map((e) => ({ esport: e.slug }));
}

function computeStats(esportSlug: string) {
  const esportPros = pros.filter((p) => p.esport === esportSlug);
  const count = esportPros.length;

  const lastVerified = esportPros.reduce((latest, p) => {
    return p.sidstVerificeret > latest ? p.sidstVerificeret : latest;
  }, esportPros[0]?.sidstVerificeret ?? "");

  const dpiDist: Record<number, number> = {};
  for (const p of esportPros) {
    dpiDist[p.settings.dpi] = (dpiDist[p.settings.dpi] ?? 0) + 1;
  }

  // Sorteret efter hvor mange pros der bruger værdien, ikke efter DPI-tallet.
  const dpiRanked = Object.entries(dpiDist)
    .map(([dpi, num]) => ({ dpi: Number(dpi), num }))
    .sort((a, b) => b.num - a.num || b.dpi - a.dpi);

  const mouseShare: Record<string, { navn: string; count: number; pct: number }> = {};
  for (const p of esportPros) {
    const mouseName = mice.find((m) => m.slug === p.musSlug)?.navn ?? p.musSlug;
    if (!mouseShare[p.musSlug]) {
      mouseShare[p.musSlug] = { navn: mouseName, count: 0, pct: 0 };
    }
    mouseShare[p.musSlug].count++;
  }
  for (const key of Object.keys(mouseShare)) {
    mouseShare[key].pct = Math.round((mouseShare[key].count / count) * 100);
  }

  const uniqueMouseSlugs = [...new Set(esportPros.map((p) => p.musSlug))];
  const esportMice = uniqueMouseSlugs
    .map((slug) => mice.find((m) => m.slug === slug))
    .filter((m): m is NonNullable<typeof m> => m != null);

  return { count, lastVerified, dpiRanked, mouseShare, esportPros, esportMice };
}

export default async function EsportPage({ params }: Props) {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) notFound();

  const { count, lastVerified, dpiRanked, mouseShare, esportPros, esportMice } = computeStats(slug);

  const popularMice = [...esportMice]
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .slice(0, 3);

  const proRows: ProTableRow[] = esportPros.map((pro) => {
    const mouse = mice.find((m) => m.slug === pro.musSlug);
    return {
      slug: pro.slug,
      navn: pro.navn,
      hold: pro.hold ?? null,
      dpi: pro.settings.dpi,
      edpi: pro.settings.edpi,
      pollingHz: pro.settings.pollingHz ?? null,
      musSlug: mouse?.slug ?? null,
      musNavn: mouse?.navn ?? null,
    };
  });

  const sortedMouseShare = Object.entries(mouseShare)
    .sort(([, a], [, b]) => b.count - a.count);

  return (
    <>
    <div className="mx-auto max-w-5xl">
      <section className="px-4 pt-24 pb-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{esport.navn}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-[20ch]">
          {esport.navn} <span className="text-primary">Mus</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[65ch] mb-8">
          {esport.beskrivelse}
        </p>
        <Link
          href="/find-mus"
          className={cn(
            buttonVariants({ size: "lg" }),
            "active:scale-[0.98] transition-transform duration-150"
          )}
        >
          Find din mus
        </Link>
      </section>

      <div className="px-4 pb-12">
        <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-4 py-1">
          <span className="text-foreground font-medium tabular-nums">{count}</span> {slug.toUpperCase()}-pros tracket
          {" - "}Kilde: ProSettings.net
          {lastVerified && ` - Sidst verificeret: ${new Date(lastVerified).toLocaleDateString("da-DK")}`}
        </p>
      </div>

      {popularMice.length > 0 && (
        <section className="px-4 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Mest brugte mus hos {slug.toUpperCase()}-pros
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularMice.map((mouse) => (
              <MouseCard key={mouse.slug} mouse={mouse} />
            ))}
          </div>
        </section>
      )}

      {count > 0 && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Hold i {slug.toUpperCase()}</h2>
          <div className="flex flex-wrap gap-3">
            {[...new Set(esportPros.map((p) => p.hold).filter(Boolean))].sort().filter((h) => h !== "Free Agent" && h !== "Retired").map((hold) => {
              const holdSlug = hold!.toLowerCase().replace(/\s+/g, "-");
              const teamCount = esportPros.filter((p) => p.hold === hold).length;
              return (
                <Link
                  key={hold}
                  href={`/${slug}/hold/${holdSlug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-medium hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
                >
                  {hold}
                  <span className="text-xs text-muted-foreground font-sans tabular-nums">
                    {teamCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {esportPros.length > 0 && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6">{slug.toUpperCase()} Pro-indstillinger</h2>
          <ProSettingsTable
            rows={proRows}
            kilde="ProSettings.net"
            sidstVerificeret={lastVerified}
          />
        </section>
      )}

      {count > 0 && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Hvorfor denne konfiguration fungerer</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-7">
              <h3 className="text-xl font-semibold mb-3">DPI-fordeling</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                {dpiRanked.length > 0 &&
                  `${dpiRanked[0].num} af ${count} ${slug.toUpperCase()}-pros bruger ${dpiRanked[0].dpi} DPI. Det er den mest udbredte indstilling blandt de trackede spillere.`}
              </p>
              <div className="space-y-2">
                {dpiRanked.map(({ dpi, num }) => (
                  <div key={dpi} className="flex items-center gap-3">
                    <span className="text-sm font-sans tabular-nums w-16">{dpi} DPI</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(num / count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-sans tabular-nums text-muted-foreground w-8 text-right">
                      {Math.round((num / count) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-7">
              <h3 className="text-xl font-semibold mb-3">Mus-præferencer</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                {esport.genre === "fps"
                  ? "Letvægt, trådløs og minimal knapbehov til FPS. Pros i dette spil foretrækker lette mus til hurtige bevægelser."
                  : "Pros i dette spil har forskellige præferencer afhængigt af deres rolle og spillestil."}
              </p>
              <div className="space-y-3">
                {sortedMouseShare.map(([mouseSlug, data]) => (
                  <div key={mouseSlug} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/mus/${mouseSlug}`}
                        className="text-sm hover:text-primary transition-colors truncate"
                      >
                        {data.navn}
                      </Link>
                      {data.count > 1 && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {data.count} pros
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-sans tabular-nums text-primary shrink-0 ml-3">
                      {data.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
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
              { "@type": "ListItem", position: 2, name: esport.navn, item: `https://prosetups.dk/${slug}` },
            ],
          }),
        }}
      />
      </div>
    </>
  );
}
