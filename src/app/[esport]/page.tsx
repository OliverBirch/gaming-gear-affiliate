import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEsport } from "@/data/esports";
import { esports } from "@/data/esports";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import { pros } from "@/data/pros";
import { MouseCardCompact } from "@/components/mouse-card-compact";
import { MouseCarousel } from "@/components/mouse-carousel";
import { MouseShareBar } from "@/components/mouse-share-bar";
import { EsportProsTable, type EsportProRow } from "@/components/esport-pros-table";
import {
  computeEsportMouseStats,
  buildShareSegments,
  getTopKeyboards,
  getTopMousepads,
  getTopHeadsets,
  getTopMonitors,
} from "@/lib/esport-stats";
import { getProPeripherals } from "@/data/pros-peripherals";
import {
  getKeyboardSlug,
  getMousepadSlug,
  getHeadsetSlug,
  getMonitorSlug,
} from "@/data/pros-peripherals-mapping";

interface Props {
  params: Promise<{ esport: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) return {};
  return {
    title: `${esport.navn} pro-setups - mus og gear`,
    description: `Se præcis hvilke mus ${esport.navn}-pros bruger. Find den bedste mus med danske priser.`,
  };
}

export function generateStaticParams() {
  return esports.filter((e) => e.aktiv).map((e) => ({ esport: e.slug }));
}

export default async function EsportPage({ params }: Props) {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) notFound();

  const esportPros = pros.filter((p) => p.esport === slug);
  const count = esportPros.length;
  const lastVerified = esportPros.reduce((latest, p) => {
    return p.sidstVerificeret > latest ? p.sidstVerificeret : latest;
  }, esportPros[0]?.sidstVerificeret ?? "");

  const { tierStats } = computeEsportMouseStats(esportPros);
  const shareData = buildShareSegments(esportPros);
  const topKeyboards = getTopKeyboards(esportPros);
  const topMousepads = getTopMousepads(esportPros);
  const topHeadsets = getTopHeadsets(esportPros);
  const topMonitors = getTopMonitors(esportPros);

  const compactMice = shareData.segments
    .slice(0, 3)
    .map((seg) => {
      const mouse = mice.find((m) => m.slug === seg.slug);
      return mouse ? { mouse, share: seg } : null;
    })
    .filter((x): x is { mouse: NonNullable<typeof mice[number]>; share: (typeof shareData.segments)[number] } => x != null);

  const proRows: EsportProRow[] = esportPros.map((pro) => {
    const mouse = mice.find((m) => m.slug === pro.musSlug);
    const peri = getProPeripherals(pro.slug);
    const kbSlug = getKeyboardSlug(pro.slug);
    const mpSlug = getMousepadSlug(pro.slug);
    const hsSlug = getHeadsetSlug(pro.slug);
    const monSlug = getMonitorSlug(pro.slug);
    const mon = monSlug ? monitors.find((m) => m.slug === monSlug) : undefined;
    const kb = kbSlug ? keyboards.find((k) => k.slug === kbSlug) : undefined;
    const mp = mpSlug ? mousepads.find((pad) => pad.slug === mpSlug) : undefined;
    const hs = hsSlug ? headsets.find((h) => h.slug === hsSlug) : undefined;
    return {
      slug: pro.slug,
      navn: pro.navn,
      hold: pro.hold ?? null,
      musNavn: mouse?.navn ?? null,
      musSlug: mouse?.slug ?? null,
      keyboardNavn: kb?.navn ?? (peri?.keyboard ?? null),
      keyboardSlug: kbSlug ?? null,
      mousepadNavn: mp ? `${mp.brand} ${mp.model}` : (peri?.mousepad ?? null),
      mousepadSlug: mpSlug ?? null,
      headsetNavn: hs?.navn ?? (peri?.headset ?? null),
      headsetSlug: hsSlug ?? null,
      monitorNavn: mon ? `${mon.brand} ${mon.navn}` : (peri?.monitor ?? null),
    };
  });

  const teams = [...new Set(esportPros.map((p) => p.hold).filter(Boolean))].sort().filter(
    (h) => h !== "Free Agent" && h !== "Retired"
  ) as string[];

  const hasOtherGear = topKeyboards.length > 0 || topMousepads.length > 0 || topHeadsets.length > 0 || topMonitors.length > 0;

  return (
    <>
    <div className="mx-auto max-w-5xl">
      {/* ── ATF ── */}
      <section className="px-4 pt-16 pb-10">
        <nav className="mb-5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{esport.navn}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-[20ch]">
          {esport.navn} <span className="text-primary">Pro-setups</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[65ch] mb-6">
          Se pr&aelig;cis hvilken mus {esport.navn}-pros bruger — og hvor du k&oslash;ber den i Danmark.
        </p>

        <p className="text-xs text-muted-foreground mb-8">
          {count === 1 ? "1 pro" : <>{count} pros</>} tracket{lastVerified && <> &middot; sidst verificeret <span className="text-foreground">{new Date(lastVerified).toLocaleDateString("da-DK")}</span></>}
        </p>

        {compactMice.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Mest brugte mus</h2>
            <Link href="/mus" className="text-xs font-semibold text-primary hover:underline underline-offset-4">Se alle &rarr;</Link>
          </div>
        )}

        {compactMice.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {compactMice.map(({ mouse, share }, i) => (
              <MouseCardCompact
                key={mouse.slug}
                mouse={mouse}
                rank={i + 1}
                sharePct={share.pct}
                proCount={share.count}
              />
            ))}
          </div>
        )}

        <MouseShareBar
          segments={shareData.segments}
          uniqueCount={shareData.uniqueCount}
          totalPros={shareData.totalPros}
          compact
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#pros" className={cn(buttonVariants({ size: "lg" }), "gap-2 active:scale-[0.98] transition-transform duration-150")}>
            Se alle pros &darr;
          </a>
          <Link href="/find-mus" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>Find din mus</Link>
        </div>
      </section>

      {/* ── Tier carousels ── */}
      {tierStats.some((t) => t.topMice.length > 0) && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">Mest brugte mus efter prisniveau</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {tierStats.map((tier) => {
              const tierMice = tier.topMice
                .map((m) => mice.find((x) => x.slug === m.slug))
                .filter((m): m is NonNullable<typeof m> => m != null);
              return (
                <div key={tier.niveau} className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{tier.label}</h3>
                    <span className="text-xs text-muted-foreground tabular-nums">{tier.pros} / {tier.totalPros} pros</span>
                  </div>
                  {tierMice.length > 0 ? <MouseCarousel mice={tierMice} rank /> : <p className="text-sm text-muted-foreground italic">Ingen pros i denne kategori</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Andet gear ── */}
      {hasOtherGear && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">Andet gear hos {slug.toUpperCase()}-pros</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topKeyboards.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tastatur</h3>
                <div className="space-y-2">
                  {topKeyboards.map((item) => (
                    <Link key={item.slug} href={item.href} className="flex items-center justify-between group">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.navn}</div>
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{item.pros} pro{item.pros > 1 ? "s" : ""}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {topMousepads.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Musem&aring;tte</h3>
                <div className="space-y-2">
                  {topMousepads.map((item) => (
                    <Link key={item.slug} href={item.href} className="flex items-center justify-between group">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.navn}</div>
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{item.pros} pro{item.pros > 1 ? "s" : ""}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {topHeadsets.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Headset</h3>
                <div className="space-y-2">
                  {topHeadsets.map((item) => (
                    <Link key={item.slug} href={item.href} className="flex items-center justify-between group">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.navn}</div>
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{item.pros} pro{item.pros > 1 ? "s" : ""}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {topMonitors.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sk&aelig;rm</h3>
                <div className="space-y-2">
                  {topMonitors.map((item) => (
                    <Link key={item.slug} href={item.href} className="flex items-center justify-between group">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.navn}</div>
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{item.pros} pro{item.pros > 1 ? "s" : ""}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Pros table ── */}
      {proRows.length > 0 && (
        <section id="pros" className="px-4 pb-20 scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6">{slug.toUpperCase()} Pros</h2>
          <EsportProsTable rows={proRows} />
        </section>
      )}

      {/* ── Teams ── */}
      {teams.length > 0 && (
        <section className="px-4 pb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Hold i {slug.toUpperCase()}</h2>
          <div className="flex flex-wrap gap-3">
            {teams.map((hold) => {
              const holdSlug = hold.toLowerCase().replace(/\s+/g, "-");
              const teamCount = esportPros.filter((p) => p.hold === hold).length;
              return (
                <Link key={hold} href={`/${slug}/hold/${holdSlug}`} className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-medium hover:border-primary/30 hover:bg-card/80 transition-all duration-200">
                  {hold}
                  <span className="text-xs text-muted-foreground font-sans tabular-nums">{teamCount}</span>
                </Link>
              );
            })}
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
