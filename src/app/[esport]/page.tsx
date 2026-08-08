import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { getEsport } from "@/data/esports";
import { esports } from "@/data/esports";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import { pros } from "@/data/pros";
import { guides } from "@/data/guides";
import { MouseCard } from "@/components/mouse-card";
import { MouseCardCompact } from "@/components/mouse-card-compact";
import { KeyboardCard } from "@/components/keyboard-card";
import { MousepadCard } from "@/components/mousepad-card";
import { HeadsetCard } from "@/components/headset-card";
import { MouseCarousel } from "@/components/mouse-carousel";
import { MouseShareBar } from "@/components/mouse-share-bar";
import { EsportProsTable, type EsportProRow } from "@/components/esport-pros-table";
import {
  EsportGearPanel,
  type EsportGearTab,
} from "@/components/esport-gear-panel";
import {
  computeEsportMouseStats,
  buildShareSegments,
  buildGearShareSegments,
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
import { getTeamLogo } from "@/data/team-logos";
import Image from "next/image";

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

function guideLinksForEsport(slug: string) {
  const specific = guides.filter((g) => g.spil === slug);
  const generic = guides.filter(
    (g) => g.spil == null && g.kategori === "mice" && g.featured
  );
  const seen = new Set<string>();
  const out: (typeof guides)[number][] = [];
  for (const g of [...specific, ...generic]) {
    if (seen.has(g.slug)) continue;
    seen.add(g.slug);
    out.push(g);
    if (out.length >= 3) break;
  }
  return out;
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
  const keyboardShare = buildGearShareSegments(
    esportPros,
    getKeyboardSlug,
    keyboards,
    "tastaturer"
  );
  const mousepadShare = buildGearShareSegments(
    esportPros,
    getMousepadSlug,
    mousepads.map((mp) => ({ slug: mp.slug, navn: `${mp.brand} ${mp.model}` })),
    "musemåtter"
  );
  const headsetShare = buildGearShareSegments(
    esportPros,
    getHeadsetSlug,
    headsets,
    "headsets"
  );
  const monitorShare = buildGearShareSegments(
    esportPros,
    getMonitorSlug,
    monitors,
    "skærme"
  );
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
    .filter(
      (x): x is { mouse: (typeof mice)[number]; share: (typeof shareData.segments)[number] } =>
        x != null
    );

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
      keyboardNavn: kb?.navn ?? peri?.keyboard ?? null,
      keyboardSlug: kbSlug ?? null,
      mousepadNavn: mp ? `${mp.brand} ${mp.model}` : (peri?.mousepad ?? null),
      mousepadSlug: mpSlug ?? null,
      headsetNavn: hs?.navn ?? peri?.headset ?? null,
      headsetSlug: hsSlug ?? null,
      monitorNavn: mon ? `${mon.brand} ${mon.navn}` : (peri?.monitor ?? null),
    };
  });

  const teams = [
    ...new Set(esportPros.map((p) => p.hold).filter(Boolean)),
  ]
    .sort()
    .filter((h) => h !== "Free Agent" && h !== "Retired") as string[];

  const dpiHint =
    esport.musProfil?.typiskDpi?.length === 2
      ? `${esport.musProfil.typiskDpi[0]}–${esport.musProfil.typiskDpi[1]} DPI`
      : null;

  const gearTabs: EsportGearTab[] = [];

  if (topKeyboards.length > 0 || keyboardShare.segments.length > 0) {
    gearTabs.push({
      id: "tastaturer",
      label: "Tastaturer",
      seAlleHref: "/tastaturer",
      seAlleLabel: "Se alle tastaturer →",
      kind: "keyboard",
      share: {
        segments: keyboardShare.segments,
        uniqueCount: keyboardShare.uniqueCount,
        totalPros: keyboardShare.totalPros,
        linkPrefix: "/tastaturer",
        itemLabel: "tastaturer",
      },
      cards: topKeyboards
        .map((item) => keyboards.find((k) => k.slug === item.slug))
        .filter((k): k is (typeof keyboards)[number] => k != null)
        .map((kb) => <KeyboardCard key={kb.slug} keyboard={kb} />),
    });
  }

  if (topMousepads.length > 0 || mousepadShare.segments.length > 0) {
    gearTabs.push({
      id: "musemaatter",
      label: "Musemåtter",
      seAlleHref: "/musemaatter",
      seAlleLabel: "Se alle musemåtter →",
      kind: "mousepad",
      share: {
        segments: mousepadShare.segments,
        uniqueCount: mousepadShare.uniqueCount,
        totalPros: mousepadShare.totalPros,
        linkPrefix: "/musemaatter",
        itemLabel: "musemåtter",
      },
      cards: topMousepads
        .map((item) => mousepads.find((p) => p.slug === item.slug))
        .filter((p): p is (typeof mousepads)[number] => p != null)
        .map((mp) => <MousepadCard key={mp.slug} mousepad={mp} />),
    });
  }

  if (topHeadsets.length > 0 || headsetShare.segments.length > 0) {
    gearTabs.push({
      id: "headset",
      label: "Headsets",
      seAlleHref: "/headset",
      seAlleLabel: "Se alle headsets →",
      kind: "headset",
      share: {
        segments: headsetShare.segments,
        uniqueCount: headsetShare.uniqueCount,
        totalPros: headsetShare.totalPros,
        linkPrefix: "/headset",
        itemLabel: "headsets",
      },
      cards: topHeadsets
        .map((item) => headsets.find((h) => h.slug === item.slug))
        .filter((h): h is (typeof headsets)[number] => h != null)
        .map((hs) => <HeadsetCard key={hs.slug} headset={hs} />),
    });
  }

  if (topMonitors.length > 0 || monitorShare.segments.length > 0) {
    gearTabs.push({
      id: "skaerme",
      label: "Skærme",
      seAlleHref: "/skaerme",
      seAlleLabel: "Se alle skærme →",
      kind: "monitor",
      share: {
        segments: monitorShare.segments,
        uniqueCount: monitorShare.uniqueCount,
        totalPros: monitorShare.totalPros,
        linkPrefix: "/skaerme",
        itemLabel: "skærme",
      },
      items: topMonitors,
    });
  }

  const relatedGuides = guideLinksForEsport(slug);
  const topMouseName = compactMice[0]?.mouse.navn;
  const topMousePct = compactMice[0]?.share.pct;

  const hasPros = proRows.length > 0;
  const hasBudget = tierStats.some((t) => t.topMice.length > 0);
  const hasGear = gearTabs.length > 0;
  const hasTeams = teams.length > 0;

  const jumpNav: { href: string; label: string }[] = [];
  if (hasPros) {
    jumpNav.push({
      href: "#pros",
      label: `Alle ${slug.toUpperCase()}-pros`,
    });
  }
  if (hasBudget) {
    jumpNav.push({ href: "#budget", label: "Mus efter budget" });
  }
  if (hasGear) {
    jumpNav.push({ href: "#gear", label: "Tastatur, headset m.m." });
  }
  if (hasTeams) {
    jumpNav.push({ href: "#hold", label: "Holdoversigt" });
  }

  const faqItems = [
    topMouseName
      ? {
          q: `Hvilken mus bruger flest ${esport.navn}-pros?`,
          a: topMousePct != null
            ? `Blandt de trackede ${esport.navn}-pros er ${topMouseName} den mest brugte (ca. ${topMousePct}%). Se den fulde fordeling og pro-listen på denne side.`
            : `Blandt de trackede ${esport.navn}-pros er ${topMouseName} den mest brugte. Se den fulde fordeling og pro-listen på denne side.`,
        }
      : null,
    {
      q: "Hvor ofte opdateres data?",
      a: lastVerified
        ? `Vi verificerer pro-setups løbende. Sidst verificeret blandt ${esport.navn}-pros: ${new Date(lastVerified).toLocaleDateString("da-DK")}.`
        : "Vi verificerer pro-setups løbende ud fra ProSettings.net og hold-data.",
    },
    {
      q: "Hvor køber jeg i Danmark?",
      a: "Produktkort og mus-sider viser danske forhandlerpriser via affiliate-links (fx Proshop). Klik dig videre fra mus eller pro-siden for aktuelle tilbud.",
    },
  ].filter((x): x is { q: string; a: string } => x != null);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        {/* ── 1. Hero ── */}
        <section className="px-4 pt-16 pb-10">
          <nav className="mb-5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Forside
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{esport.navn}</span>
          </nav>

          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-6 top-4 text-[64px] sm:text-[72px] font-black text-foreground/5 select-none leading-none">
              {slug.toUpperCase()}
            </div>

            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-[20ch]">
              {esport.navn} <span className="text-primary">Pro-setups</span>
            </h1>
            <p className="relative text-base text-muted-foreground leading-relaxed max-w-[55ch] mb-5">
              Se præcis hvilken mus {esport.navn}-pros bruger — verificeret, med
              danske priser.
            </p>
            <p className="relative text-xs text-muted-foreground mb-5">
              {count === 1 ? "1 pro" : <>{count} pros</>} tracket
              {lastVerified && (
                <>
                  {" "}
                  &middot; sidst verificeret{" "}
                  <span className="text-foreground">
                    {new Date(lastVerified).toLocaleDateString("da-DK")}
                  </span>
                </>
              )}
              {dpiHint && (
                <>
                  {" "}
                  &middot; typisk {dpiHint}
                  {esport.musProfil?.wirelessForventet ? " · trådløs letvægt" : null}
                </>
              )}
            </p>
            {jumpNav.length > 0 && (
              <nav
                aria-label="Gå til sektion"
                className="relative text-sm text-muted-foreground"
              >
                <span className="mr-1.5">Gå til sektion:</span>
                {jumpNav.map((item, i) => (
                  <span key={item.href}>
                    {i > 0 && <span className="mx-1.5 text-muted-foreground/40">·</span>}
                    <a
                      href={item.href}
                      className="font-medium text-primary hover:underline underline-offset-4"
                    >
                      {item.label}
                    </a>
                  </span>
                ))}
              </nav>
            )}
          </div>
        </section>

        {/* ── 2. Meta mice ── */}
        {(compactMice.length > 0 || shareData.segments.length > 0) && (
          <section id="mus" className="px-4 pb-12 scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">Mest brugte mus</h2>
              <Link
                href="/mus"
                className="text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                Se alle mus &rarr;
              </Link>
            </div>

            {compactMice.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
          </section>
        )}

        {/* ── 3. Pros table ── */}
        {hasPros && (
          <section id="pros" className="px-4 pb-16 scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {slug.toUpperCase()} Pros
              </h2>
              <p className="text-xs text-muted-foreground">
                {count === 1 ? "1 spiller" : `${count} spillere`} · klik for fuldt
                setup
              </p>
            </div>
            <EsportProsTable rows={proRows} />
          </section>
        )}

        {/* ── 4. Shop tiers ── */}
        {hasBudget && (
          <section id="budget" className="px-4 pb-16 scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Find en mus i dit budget
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Baseret på hvad {esport.navn}-pros faktisk bruger
                </p>
              </div>
              {slug === "cs2" || slug === "valorant" ? (
                <Link
                  href={`/guides/bedste-mus-til-${slug}`}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                >
                  Guide: bedste mus til {esport.navn} &rarr;
                </Link>
              ) : (
                <Link
                  href="/find-mus"
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                >
                  Find din mus &rarr;
                </Link>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {tierStats.map((tier) => {
                const tierMice = tier.topMice
                  .map((m) => mice.find((x) => x.slug === m.slug))
                  .filter((m): m is NonNullable<typeof m> => m != null);
                return (
                  <div key={tier.niveau}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-lg font-semibold">{tier.label}</h3>
                      <span className="text-xs text-muted-foreground">
                        {({ budget: "Under 500 kr.", mid: "500-1000 kr.", flagship: "1000+ kr." } as Record<string, string>)[tier.niveau]}
                      </span>
                    </div>
                    {tierMice.length > 0 ? (
                      <MouseCarousel
                        cards={tierMice.map((mouse, i) => (
                          <MouseCard
                            key={mouse.slug}
                            mouse={mouse}
                            rank={i + 1}
                            className="min-w-0 w-full shrink-0 snap-start"
                          />
                        ))}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Ingen pros i denne kategori
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 5. Tabbed other gear ── */}
        {hasGear && (
          <section id="gear" className="px-4 pb-16 scroll-mt-20">
            <h2 className="text-xl font-bold tracking-tight mb-6">
              Resten af setuppet
            </h2>
            <EsportGearPanel tabs={gearTabs} />
          </section>
        )}

        {/* ── 6. Hub footer: teams + guides + FAQ ── */}
        <section className="px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hasTeams && (
              <div
                id="hold"
                className="rounded-xl border border-border/50 bg-card p-5 scroll-mt-20"
              >
                <h2 className="font-semibold mb-3">
                  Hold i {slug.toUpperCase()}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teams.map((hold) => {
                    const holdSlug = hold.toLowerCase().replace(/\s+/g, "-");
                    const teamCount = esportPros.filter((p) => p.hold === hold).length;
                    const logo = getTeamLogo(hold);
                    return (
                      <Link
                        key={hold}
                        href={`/${slug}/hold/${holdSlug}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 text-sm font-medium hover:border-primary/30 transition-colors"
                      >
                        {logo ? (
                          <Image
                            src={logo}
                            alt=""
                            width={18}
                            height={18}
                            className="h-[18px] w-[18px] object-contain"
                          />
                        ) : null}
                        <span className="truncate max-w-[10rem]">{hold}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {teamCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="font-semibold mb-3">Guides &amp; finder</h2>
              <ul className="space-y-2 text-sm">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {g.title} &rarr;
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/find-mus"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Find din mus (quiz) &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5 sm:col-span-2 lg:col-span-1">
              <h2 className="font-semibold mb-3">FAQ</h2>
              <dl className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.q}>
                    <dt className="text-sm font-medium">{item.q}</dt>
                    <dd className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <Script
          id="schema-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Forside",
                  item: "https://prosetups.dk/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: esport.navn,
                  item: `https://prosetups.dk/${slug}`,
                },
              ],
            }),
          }}
        />
        {faqItems.length > 0 && (
          <Script
            id="schema-faq"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                  },
                })),
              }),
            }}
          />
        )}
      </div>
    </>
  );
}
