import Link from "next/link";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { miceToAdd } from "@/data/mice-todo";
import { headsets } from "@/data/headsets";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { monitors } from "@/data/monitors";
import { retailers } from "@/data/retailers";
import { esports } from "@/data/esports";
import pricesJson from "@/data/prices.json";
import proPeripheralsRaw from "@/data/pros-peripherals.json";
import { match as mappingMatch } from "@/data/pros-peripherals-mapping";
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
  Package,
  Percent,
} from "lucide-react";
import {
  STALE_DAYS,
  daysAgo,
  dateLabel,
  checkStalePros,
  checkProductStaleness,
  checkNoOffers,
  computePriceCoverage,
  checkMissingPrices,
  checkMissingImagesMice,
  checkMissingImages,
  checkMissingImagesPros,
  checkEmptyCopyMice,
  checkOrphanedMice,
  checkMissingPeripherals,
  checkStubMice,
  checkUnmappedPeripherals,
  checkFeedAge,
  getStaleProsByAge,
  avgAgeByEsport,
  esportCounts as computeEsportCounts,
  buildHealthReport,
  type DashboardIssue,
} from "@/lib/data-health";

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

function StatCard({
  label,
  value,
  icon: Icon,
  warn,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  warn?: boolean;
}) {
  return (
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
}

function Table({
  headers,
  rows,
  empty,
  sourceFile,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
  sourceFile?: string;
}) {
  return (
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
              {sourceFile && <th className="text-right px-4 py-2.5 w-12" />}
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
}

export default function AdminDashboardPage() {
  const issues: DashboardIssue[] = [];

  function extractPeripheralValues(
    peripherals: Record<string, Record<string, string | null | undefined>>,
    field: string
  ): Record<string, string | undefined> {
    const out: Record<string, string | undefined> = {};
    for (const [proSlug, data] of Object.entries(peripherals)) {
      const val = data[field];
      if (val != null) out[proSlug] = String(val);
    }
    return out;
  }

  const pricedKeys = new Set(Object.keys(pricesJson.overrides));
  const mouseSlugs = new Set(mice.map((m) => m.slug));
  const proPeripheralKeys = new Set(Object.keys(proPeripheralsRaw));
  const peripheralsCast = proPeripheralsRaw as Record<string, Record<string, string | null | undefined>>;

  issues.push(...checkStalePros(pros));
  issues.push(...checkNoOffers(mice));
  issues.push(...checkMissingPrices(mice, pricedKeys));
  issues.push(...checkMissingImagesMice(mice));
  issues.push(...checkMissingImagesPros(pros));
  issues.push(...checkEmptyCopyMice(mice));
  issues.push(...checkOrphanedMice(pros, mouseSlugs));
  issues.push(...checkMissingPeripherals(pros, proPeripheralKeys));
  issues.push(...checkStubMice(mice));
  // Non-mice catalogs: surfaces "aldrig verificeret" for products whose
  // sidstVerificeret is null, instead of silently assuming a date.
  issues.push(...checkProductStaleness(keyboards, "keyboards"));
  issues.push(...checkProductStaleness(headsets, "headsets"));
  issues.push(...checkProductStaleness(monitors, "monitors"));
  issues.push(
    ...checkProductStaleness(
      mousepads.map((m) => ({ ...m, navn: `${m.brand} ${m.model}` })),
      "mousepads"
    )
  );
  // Non-mice catalogs: mice/pros already had missing-image tracking, the
  // other 3 categories were completely invisible on this dashboard.
  issues.push(...checkMissingImages(keyboards, "keyboards"));
  issues.push(...checkMissingImages(headsets, "headsets"));
  issues.push(...checkMissingImages(monitors, "monitors"));
  issues.push(
    ...checkMissingImages(
      mousepads.map((m) => ({ ...m, navn: `${m.brand} ${m.model}` })),
      "mousepads"
    )
  );

  const coverage = computePriceCoverage(mice, pricedKeys);
  const staleProsList = getStaleProsByAge(pros);
  const avgEsportAge = avgAgeByEsport(pros);
  const esportCountsData = computeEsportCounts(pros);

  const noOfferMice = mice.filter((m) => m.offers.length === 0);
  const miceWithoutPrice = mice.filter(
    (m) =>
      m.offers.length > 0 &&
      !m.offers.some((o) => pricedKeys.has(`${m.slug}__${o.retailer}`))
  );
  const miceNoImage = mice.filter((m) => !m.billede);
  const prosNoImage = pros.filter((p) => !p.billede);
  const keyboardsNoImage = keyboards.filter((k) => !k.billede);
  const monitorsNoImage = monitors.filter((m) => !m.billede);
  const mousepadsNoImage = mousepads.filter((m) => !m.billede);
  const miceEmptyDesc = mice.filter(
    (m) => !m.beskrivelse || m.beskrivelse.length < 10
  );
  const miceEmptyFordele = mice.filter((m) => m.fordele.length === 0);
  const miceEmptyUlemper = mice.filter((m) => m.ulemper.length === 0);

  const orphanedSlugs = [
    ...new Set(
      pros.map((p) => p.musSlug).filter((s) => !mouseSlugs.has(s))
    ),
  ];
  const prosWithoutPeripherals = pros.filter(
    (p) => !proPeripheralKeys.has(p.slug)
  );

  const lastFeedDate = daysAgo(pricesJson.scrapedAt);
  const feedCheck = checkFeedAge(pricesJson.scrapedAt);
  const stubMice = checkStubMice(mice);

  const topStale = staleProsList.slice(0, 10);
  const topNoPrice = miceWithoutPrice.slice(0, 5);

  const keyboardValues = extractPeripheralValues(peripheralsCast, "keyboard");
  const mousepadValues = extractPeripheralValues(peripheralsCast, "mousepad");
  const headsetValues = extractPeripheralValues(peripheralsCast, "headset");

  const keyboardUnmapped = checkUnmappedPeripherals(keyboardValues, (t) =>
    mappingMatch(t)
  );
  const mousepadUnmapped = checkUnmappedPeripherals(mousepadValues, (t) =>
    mappingMatch(t)
  );
  const headsetUnmapped = checkUnmappedPeripherals(headsetValues, (t) =>
    mappingMatch(t)
  );

  const reportJson = JSON.stringify(buildHealthReport(issues));

  return (
    <div>
      <script
        type="application/json"
        id="issues-data"
        dangerouslySetInnerHTML={{ __html: reportJson }}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Pris-feed opdateret {dateLabel(lastFeedDate)}
            {feedCheck.stale && (
              <span className="text-amber-500 font-medium ml-1">(forældet)</span>
            )}
            {" "}&middot; {pros.length}{" "}
            pros &middot; {mice.length} mus &middot; {headsets.length} headsets &middot;{" "}
            {keyboards.length} keyboards &middot; {mousepads.length} mousepads &middot;{" "}
            {monitors.length} skærme &middot;{" "}
            {retailers.length}{" "}
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
          value={staleProsList.length}
          icon={Clock}
          warn={staleProsList.length > 0}
        />
        <StatCard
          label="Stub-mus"
          value={stubMice.length}
          icon={Package}
          warn={stubMice.length > 0}
        />
        <StatCard
          label="Pris-dækning"
          value={`${coverage.pct}%`}
          icon={Percent}
          warn={coverage.pct < 80}
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
              {Object.entries(avgEsportAge)
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
            {staleProsList.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{staleProsList.length - 10} flere stale pros ikke vist
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
                sourceFile="src/data/mice.json"
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

          {topNoPrice.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden pris-data ({miceWithoutPrice.length})
              </h3>
              <Table
                headers={["Mus", "Tilbud"]}
                sourceFile="src/data/mice.json"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Keyboards uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {keyboardsNoImage.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {keyboards.length} keyboards
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Skærme uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {monitorsNoImage.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {monitors.length} skærme
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Musemåtter uden billede</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {mousepadsNoImage.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {mousepads.length} musemåtter
            </p>
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Stub-mus</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {stubMice.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              af {mice.length} mus
            </p>
          </div>
        </div>

        {stubMice.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Stub-mus der mangler data ({stubMice.length})
            </h3>
            <Table
              headers={["Mus", "Mærke"]}
              sourceFile="src/data/mice.json"
              rows={stubMice.map((s) => [
                <Link
                  key={s.slug}
                  href={`/mus/${s.slug}`}
                  className="text-primary hover:underline underline-offset-4"
                >
                  {s.label.replace(/ — stub.*$/, "")}
                </Link>,
                <span key="b" className="text-muted-foreground text-xs">
                  {String(s.context.brand ?? "")}
                </span>,
              ])}
              empty="Ingen stub-mus"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {miceEmptyFordele.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Mus uden fordele ({miceEmptyFordele.length})
              </h3>
              <Table
                headers={["Mus"]}
                sourceFile="src/data/mice.json"
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
                sourceFile="src/data/mice.json"
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

      {/* Periferi-mapping dækning */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          Periferi-mapping dækning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Keyboards ({keyboards.length} i katalog)
            </h3>
            <p
              className={`text-2xl font-bold tabular-nums ${
                keyboardUnmapped.pct < 50 ? "text-amber-500" : ""
              }`}
            >
              {keyboardUnmapped.pct}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {keyboardUnmapped.mapped} / {keyboardUnmapped.total} pros matchet
            </p>
            {keyboardUnmapped.topUnmapped.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Top umatchede
                </p>
                {keyboardUnmapped.topUnmapped.slice(0, 5).map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate mr-2 max-w-[180px]">
                      {t.text}
                    </span>
                    <span className="tabular-nums text-muted-foreground shrink-0">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Mousepads ({mousepads.length} i katalog)
            </h3>
            <p
              className={`text-2xl font-bold tabular-nums ${
                mousepadUnmapped.pct < 50 ? "text-amber-500" : ""
              }`}
            >
              {mousepadUnmapped.pct}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mousepadUnmapped.mapped} / {mousepadUnmapped.total} pros matchet
            </p>
            {mousepadUnmapped.topUnmapped.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Top umatchede
                </p>
                {mousepadUnmapped.topUnmapped.slice(0, 5).map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate mr-2 max-w-[180px]">
                      {t.text}
                    </span>
                    <span className="tabular-nums text-muted-foreground shrink-0">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Headsets ({headsets.length} i katalog)
            </h3>
            <p
              className={`text-2xl font-bold tabular-nums ${
                headsetUnmapped.pct < 50 ? "text-amber-500" : ""
              }`}
            >
              {headsetUnmapped.pct}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {headsetUnmapped.mapped} / {headsetUnmapped.total} pros matchet
            </p>
            {headsetUnmapped.topUnmapped.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Top umatchede
                </p>
                {headsetUnmapped.topUnmapped.slice(0, 5).map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate mr-2 max-w-[180px]">
                      {t.text}
                    </span>
                    <span className="tabular-nums text-muted-foreground shrink-0">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              {Object.entries(esportCountsData)
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
                            <SourceLink file="src/data/mice.json" />
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
