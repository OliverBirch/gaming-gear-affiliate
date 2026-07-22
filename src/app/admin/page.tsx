import Link from "next/link";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { miceToAdd } from "@/data/mice-todo";
import { headsets } from "@/data/headsets";
import { retailers } from "@/data/retailers";
import { esports } from "@/data/esports";
import pricesJson from "@/data/prices.json";
import proPeripheralsRaw from "@/data/pros-peripherals.json";
import {
  AlertTriangle,
  Clock,
  ShoppingCart,
  ImageOff,
  FileText,
  Users,
  Link2,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

const OLD_MAXGAMING = /\/da\/tilbehoer\/mus\//;
const STALE_DAYS = 90;
const proPeripherals = proPeripheralsRaw as Record<string, unknown>;

function daysAgo(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function dateLabel(days: number): string {
  if (days === 0) return "i dag";
  if (days === 1) return "1 dag siden";
  return `${days} dage siden`;
}

interface DashboardIssue {
  type: string;
  severity: "high" | "medium" | "low";
  autoFixable: boolean;
  slug: string;
  label: string;
  file: string;
  context: Record<string, unknown>;
}

function SourceLink({ file }: { file: string }) {
  const vscodeUrl = `vscode://file/${process.cwd().replace(/\\/g, "/")}/${file}`;
  return (
    <a
      href={vscodeUrl}
      title={`Åbn ${file} i editor`}
      className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground ml-1.5"
    >
      <ExternalLink className="h-2.5 w-2.5" />
    </a>
  );
}

export default function AdminDashboardPage() {
  const issues: DashboardIssue[] = [];

  const prosWithAge = pros
    .map((p) => ({ ...p, ageDays: daysAgo(p.sidstVerificeret) }))
    .sort((a, b) => b.ageDays - a.ageDays);

  const stalePros = prosWithAge.filter((p) => p.ageDays > STALE_DAYS);
  const avgAgeByEsport: Record<string, { total: number; count: number }> = {};
  for (const p of prosWithAge) {
    if (!avgAgeByEsport[p.esport]) avgAgeByEsport[p.esport] = { total: 0, count: 0 };
    avgAgeByEsport[p.esport].total += p.ageDays;
    avgAgeByEsport[p.esport].count++;
  }

  for (const p of stalePros) {
    const sev = p.ageDays > 180 ? "high" : p.ageDays > 120 ? "medium" : "low";
    issues.push({
      type: "stale-pro",
      severity: sev,
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — ${dateLabel(p.ageDays)}`,
      file: "src/data/pros.ts",
      context: {
        esport: p.esport,
        ageDays: p.ageDays,
        sourceUrl: `https://prosettings.net/players/${p.slug}/`,
      },
    });
  }

  const allOffers = mice.flatMap((m) =>
    m.offers.map((o) => ({
      ...o,
      productSlug: m.slug,
      productNavn: m.navn,
    }))
  );
  const noOfferMice = mice.filter((m) => m.offers.length === 0);
  for (const m of noOfferMice) {
    issues.push({
      type: "no-offers",
      severity: "high",
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen tilbud`,
      file: "src/data/mice.ts",
      context: { brand: m.brand },
    });
  }

  const oldUrlOffers = allOffers.filter((o) => OLD_MAXGAMING.test(o.produktUrl));
  for (const o of oldUrlOffers) {
    issues.push({
      type: "broken-url",
      severity: "high",
      autoFixable: true,
      slug: o.productSlug,
      label: `${o.productNavn} — maxgaming URL forældet`,
      file: "src/data/mice.ts",
      context: {
        retailer: o.retailer,
        oldUrl: o.produktUrl,
        searchTerm: o.productSlug,
      },
    });
  }

  const pricedKeys = new Set(Object.keys(pricesJson.overrides));
  const offerKeys = allOffers.map((o) => `${o.productSlug}__${o.retailer}`);
  const covered = offerKeys.filter((k) => pricedKeys.has(k));
  const coveragePct =
    offerKeys.length > 0 ? Math.round((covered.length / offerKeys.length) * 100) : 0;
  const miceWithoutPrice = mice.filter(
    (m) =>
      m.offers.length > 0 &&
      !m.offers.some((o) => pricedKeys.has(`${m.slug}__${o.retailer}`))
  );
  for (const m of miceWithoutPrice) {
    issues.push({
      type: "missing-price",
      severity: "medium",
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen pris-data`,
      file: "src/data/mice.ts",
      context: {
        retailers: m.offers.map((o) => o.retailer),
      },
    });
  }

  const miceNoImage = mice.filter((m) => !m.billede);
  for (const m of miceNoImage) {
    const maxgamingOffer = m.offers.find((o) => o.retailer === "maxgaming");
    issues.push({
      type: "missing-image",
      severity: "low",
      autoFixable: !!maxgamingOffer,
      slug: m.slug,
      label: `${m.navn} — intet billede`,
      file: "src/data/mice.ts",
      context: {
        hasMaxgaming: !!maxgamingOffer,
        maxgamingUrl: maxgamingOffer?.produktUrl ?? null,
      },
    });
  }

  const prosNoImage = pros.filter((p) => !p.billede);
  for (const p of prosNoImage) {
    issues.push({
      type: "missing-pro-image",
      severity: "low",
      autoFixable: true,
      slug: p.slug,
      label: `${p.navn} — intet billede`,
      file: "src/data/pros.ts",
      context: {
        sourceUrl: `https://prosettings.net/players/${p.slug}/`,
      },
    });
  }

  const miceEmptyDesc = mice.filter(
    (m) => !m.beskrivelse || m.beskrivelse.length < 10
  );
  for (const m of miceEmptyDesc) {
    issues.push({
      type: "empty-description",
      severity: "medium",
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — tom beskrivelse`,
      file: "src/data/mice.ts",
      context: { brand: m.brand },
    });
  }

  const miceEmptyFordele = mice.filter((m) => m.fordele.length === 0);
  for (const m of miceEmptyFordele) {
    issues.push({
      type: "empty-fordele",
      severity: "medium",
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen fordele`,
      file: "src/data/mice.ts",
      context: { brand: m.brand },
    });
  }

  const miceEmptyUlemper = mice.filter((m) => m.ulemper.length === 0);
  for (const m of miceEmptyUlemper) {
    issues.push({
      type: "empty-ulemper",
      severity: "medium",
      autoFixable: false,
      slug: m.slug,
      label: `${m.navn} — ingen ulemper`,
      file: "src/data/mice.ts",
      context: { brand: m.brand },
    });
  }

  const esportCounts: Record<string, number> = {};
  for (const p of pros) esportCounts[p.esport] = (esportCounts[p.esport] || 0) + 1;

  const mouseSlugs = new Set(mice.map((m) => m.slug));
  const orphanedSlugs = [
    ...new Set(
      pros.map((p) => p.musSlug).filter((s) => !mouseSlugs.has(s))
    ),
  ];
  for (const slug of orphanedSlugs) {
    const users = pros.filter((p) => p.musSlug === slug).map((p) => p.slug);
    issues.push({
      type: "orphaned-mus",
      severity: "high",
      autoFixable: false,
      slug,
      label: `${slug} — mus findes ikke i kataloget`,
      file: "src/data/mice.ts",
      context: { usedBy: users },
    });
  }

  const proPeripheralKeys = new Set(Object.keys(proPeripherals));
  const prosWithoutPeripherals = pros.filter(
    (p) => !proPeripheralKeys.has(p.slug)
  );
  for (const p of prosWithoutPeripherals.slice(0, 50)) {
    issues.push({
      type: "missing-peripherals",
      severity: "low",
      autoFixable: false,
      slug: p.slug,
      label: `${p.navn} — ingen periferi-data`,
      file: "src/data/pros-peripherals.json",
      context: {
        esport: p.esport,
        sourceUrl: `https://prosettings.net/players/${p.slug}/`,
      },
    });
  }
  if (prosWithoutPeripherals.length > 50) {
    issues.push({
      type: "missing-peripherals-truncated",
      severity: "low",
      autoFixable: false,
      slug: "…",
      label: `+${prosWithoutPeripherals.length - 50} flere pros uden periferi-data`,
      file: "src/data/pros-peripherals.json",
      context: { total: prosWithoutPeripherals.length },
    });
  }

  const lastFeedDate = daysAgo(pricesJson.scrapedAt);

  const topStale = stalePros.slice(0, 10);
  const topOldUrls = oldUrlOffers.slice(0, 5);
  const topNoPrice = miceWithoutPrice.slice(0, 5);

  const issuesJson = JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      totalIssues: issues.length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
      autoFixable: issues.filter((i) => i.autoFixable).length,
    },
    issues,
  });

  const StatCard = ({
    label,
    value,
    icon: Icon,
    warn,
  }: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    warn?: boolean;
  }) => (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className={`h-4 w-4 ${warn ? "text-amber-500" : "text-muted-foreground"}`}
        />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-bold tabular-nums ${warn ? "text-amber-500" : ""}`}
      >
        {value}
      </p>
    </div>
  );

  const Table = ({
    headers,
    rows,
    empty,
    sourceFile,
  }: {
    headers: string[];
    rows: React.ReactNode[][];
    empty: string;
    sourceFile?: string;
  }) => (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {rows.length === 0 ? (
        <div className="px-5 py-4 text-sm text-muted-foreground italic flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {empty}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/50">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
              {sourceFile && (
                <th className="text-right px-4 py-2.5 w-12" />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5">
                    {cell}
                  </td>
                ))}
                {sourceFile && (
                  <td className="px-4 py-2.5 text-right">
                    <SourceLink file={sourceFile} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <script
        type="application/json"
        id="issues-data"
        dangerouslySetInnerHTML={{ __html: issuesJson }}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Dashboard
          </h1>
      <p className="text-muted-foreground text-sm">
          Pris-feed opdateret {dateLabel(lastFeedDate)} &middot; {pros.length}{" "}
          pros &middot; {mice.length} mus &middot; {headsets.length} headsets &middot; {retailers.length}{" "}
          retailers &middot; {issues.length} issues
          </p>
        </div>
        {miceToAdd.length > 0 && (
          <Link
            href="/admin/todo"
            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            <AlertTriangle className="h-4 w-4" />
            {miceToAdd.length} mus {miceToAdd.length === 1 ? "mangler" : "mangler"}{" "}
            data
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard
          label={`Stale pros (>${STALE_DAYS}d)`}
          value={stalePros.length}
          icon={Clock}
          warn={stalePros.length > 0}
        />
        <StatCard
          label="Mus uden billede"
          value={miceNoImage.length}
          icon={ImageOff}
          warn={miceNoImage.length > 0}
        />
        <StatCard
          label="Pris-dækning"
          value={`${coveragePct}%`}
          icon={ShoppingCart}
          warn={coveragePct < 80}
        />
        <StatCard
          label="Gamle URLs"
          value={oldUrlOffers.length}
          icon={Link2}
          warn={oldUrlOffers.length > 0}
        />
      </div>

      {/* Data Freshness */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Data friskhed
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Gennemsnitlig alder pr. esport
            </h3>
            <div className="space-y-1.5">
              {Object.entries(avgAgeByEsport)
                .sort(([, a], [, b]) => b.total / b.count - a.total / a.count)
                .map(([slug, data]) => {
                  const avg = Math.round(data.total / data.count);
                  const esport = esports.find((e) => e.slug === slug);
                  return (
                    <div
                      key={slug}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{esport?.navn ?? slug}</span>
                      <span
                        className={`tabular-nums font-medium ${
                          avg > STALE_DAYS ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {avg} dage
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <Table
              headers={["Pro", "Esport", "Sidst verificeret"]}
              sourceFile="src/data/pros.ts"
              rows={topStale.map((p) => [
                <Link
                  key={p.slug}
                  href={`/pro/${p.slug}`}
                  className="text-primary hover:underline underline-offset-4"
                >
                  {p.navn}
                </Link>,
                <span key="e" className="text-muted-foreground">
                  {esports.find((e) => e.slug === p.esport)?.navn ?? p.esport}
                </span>,
                <span
                  key="d"
                  className={`tabular-nums ${
                    p.ageDays > STALE_DAYS ? "text-red-500 font-medium" : "text-muted-foreground"
                  }`}
                >
                  {dateLabel(p.ageDays)}
                </span>,
              ])}
              empty="Alle pros er opdaterede"
            />
            {stalePros.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{stalePros.length - 10} flere stale pros ikke vist
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Offer Health */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          Tilbuds-sundhed
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {noOfferMice.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden tilbud ({noOfferMice.length})
              </h3>
              <Table
                headers={["Mus"]}
                sourceFile="src/data/mice.ts"
                rows={noOfferMice.map((m) => [
                  <Link
                    key={m.slug}
                    href={`/mus/${m.slug}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {m.navn}
                  </Link>,
                ])}
                empty="Alle mus har tilbud"
              />
            </div>
          )}

          {topOldUrls.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Gamle MaxGaming URLs ({oldUrlOffers.length})
              </h3>
              <Table
                headers={["Mus", "URL (forældet mønster)"]}
                sourceFile="src/data/mice.ts"
                rows={topOldUrls.map((o) => [
                  <Link
                    key={o.productSlug}
                    href={`/mus/${o.productSlug}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {o.productNavn}
                  </Link>,
                  <code
                    key="url"
                    className="text-xs text-red-500 break-all"
                  >
                    {o.produktUrl}
                  </code>,
                ])}
                empty="Ingen gamle URLs"
              />
              {oldUrlOffers.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{oldUrlOffers.length - 5} flere
                </p>
              )}
            </div>
          )}

          {topNoPrice.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden pris-data ({miceWithoutPrice.length})
              </h3>
              <Table
                headers={["Mus", "Tilbud"]}
                sourceFile="src/data/mice.ts"
                rows={topNoPrice.map((m) => [
                  <Link
                    key={m.slug}
                    href={`/mus/${m.slug}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {m.navn}
                  </Link>,
                  <span key="r" className="text-muted-foreground text-xs">
                    {m.offers.map((o) => o.retailer).join(", ")}
                  </span>,
                ])}
                empty="Alle mus har pris-data"
              />
              {miceWithoutPrice.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{miceWithoutPrice.length - 5} flere
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Content Quality */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Indholdskvalitet
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mus uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {miceNoImage.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {mice.length} mus
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pros uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {prosNoImage.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {pros.length} pros
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mus uden beskrivelse</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {miceEmptyDesc.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {mice.length} mus
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Headsets uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {headsets.filter((h) => !h.billede).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {headsets.length} headsets
            </p>
          </div>

          {miceEmptyFordele.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden fordele ({miceEmptyFordele.length})
              </h3>
              <Table
                headers={["Mus"]}
                sourceFile="src/data/mice.ts"
                rows={miceEmptyFordele.map((m) => [
                  <Link
                    key={m.slug}
                    href={`/mus/${m.slug}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {m.navn}
                  </Link>,
                ])}
                empty="Alle mus har fordele"
              />
            </div>
          )}

          {miceEmptyUlemper.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden ulemper ({miceEmptyUlemper.length})
              </h3>
              <Table
                headers={["Mus"]}
                sourceFile="src/data/mice.ts"
                rows={miceEmptyUlemper.map((m) => [
                  <Link
                    key={m.slug}
                    href={`/mus/${m.slug}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {m.navn}
                  </Link>,
                ])}
                empty="Alle mus har ulemper"
              />
            </div>
          )}
        </div>
      </section>

      {/* Pro Coverage */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Pro-dækning
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Pros pr. esport
            </h3>
            <div className="space-y-1.5">
              {Object.entries(esportCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([slug, count]) => {
                  const esport = esports.find((e) => e.slug === slug);
                  return (
                    <div
                      key={slug}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{esport?.navn ?? slug}</span>
                      <span className="tabular-nums font-medium text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {orphanedSlugs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Forældreløse mus-referencer ({orphanedSlugs.length})
              </h3>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Mus-slug
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Brugt af
                      </th>
                      <th className="text-right px-4 py-2.5 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {orphanedSlugs.map((slug) => {
                      const users = pros
                        .filter((p) => p.musSlug === slug)
                        .map((p) => p.slug);
                      return (
                        <tr
                          key={slug}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs text-red-500">
                            {slug}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">
                            {users.join(", ")}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <SourceLink file="src/data/mice.ts" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {prosWithoutPeripherals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Pros uden periferi-data ({prosWithoutPeripherals.length})
              </h3>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Pro
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Esport
                      </th>
                      <th className="text-right px-4 py-2.5 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {prosWithoutPeripherals.slice(0, 20).map((p) => (
                      <tr
                        key={p.slug}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/pro/${p.slug}`}
                            className="text-primary hover:underline underline-offset-4"
                          >
                            {p.navn}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                          {esports.find((e) => e.slug === p.esport)?.navn ??
                            p.esport}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <SourceLink file="src/data/pros-peripherals.json" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {prosWithoutPeripherals.length > 20 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{prosWithoutPeripherals.length - 20} flere
                </p>
              )}
            </div>
          )}

          {orphanedSlugs.length === 0 &&
            prosWithoutPeripherals.length === 0 && (
              <div className="rounded-lg border border-border/50 p-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">
                  Ingen huller i pro-dækningen
                </span>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
