"use client";

import { useState, useEffect } from "react";
import { RETAILER_SLUGS, type RetailerSlug } from "@/lib/types";
import { getRetailer } from "@/data/retailers";
import type { FeedCandidate, FeedRunSummary } from "@/lib/feed-sync/types";
import {
  Rss,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface FeedStatus {
  runs: Record<RetailerSlug, FeedRunSummary | null>;
  candidates: FeedCandidate[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RunCard({
  retailer,
  run,
  running,
  onRun,
}: {
  retailer: RetailerSlug;
  run: FeedRunSummary | null;
  running: boolean;
  onRun: (retailer: RetailerSlug) => void;
}) {
  const navn = getRetailer(retailer)?.navn ?? retailer;
  const hasErrors = (run?.errors.length ?? 0) > 0;

  return (
    <div
      className={`rounded-lg border p-4 ${
        !run
          ? "border-border/50 bg-card opacity-70"
          : hasErrors
            ? "border-red-500/30 bg-red-50/5"
            : "border-border/50 bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{navn}</span>
        <div className="flex items-center gap-2">
          {!run ? (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              ALDRIG KØRT
            </span>
          ) : hasErrors ? (
            <span className="text-[10px] font-medium text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full">
              FEJL
            </span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              OK
            </span>
          )}
          <button
            type="button"
            onClick={() => onRun(retailer)}
            disabled={running}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Kør sync nu
          </button>
        </div>
      </div>

      {!run ? (
        <p className="text-xs text-muted-foreground">Ingen feed-kørsel registreret endnu.</p>
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            {formatDate(run.fetchedAt)}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{run.itemCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Feed-rækker</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-emerald-600">{run.matchedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Matchet</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-amber-600">{run.unmatchedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ikke matchet</p>
            </div>
          </div>
          {hasErrors && (
            <div className="mt-3 pt-3 border-t border-red-500/20 space-y-1">
              {run.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  {e}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CandidateRow({
  candidate,
  applying,
  applyError,
  onApply,
}: {
  candidate: FeedCandidate;
  applying: boolean;
  applyError: string | null;
  onApply: (candidate: FeedCandidate) => void;
}) {
  const navn = getRetailer(candidate.retailer)?.navn ?? candidate.retailer;
  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2.5 font-mono text-xs">{candidate.slug}</td>
      <td className="px-4 py-2.5 text-muted-foreground text-xs">{navn}</td>
      <td className="px-4 py-2.5 text-xs max-w-[280px] truncate" title={candidate.feedTitle}>
        {candidate.feedTitle}
        {candidate.matchedSize && (
          <span
            className="ml-1.5 rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-500"
            title="Prisen gælder denne størrelse — ikke hele produktet"
          >
            {candidate.matchedSize}
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 tabular-nums text-xs">
        {candidate.priceDkk != null ? `${candidate.priceDkk} kr.` : "—"}
      </td>
      <td className="px-4 py-2.5 text-xs">
        {candidate.inStock ? (
          <span className="text-emerald-600">På lager</span>
        ) : (
          <span className="text-muted-foreground">Udsolgt</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-xs">
        {candidate.eanConfirmed ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> EAN
          </span>
        ) : (
          <span className="text-muted-foreground">Navn-match</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(candidate.discoveredAt)}</td>
      <td className="px-4 py-2.5 text-right">
        <a
          href={candidate.produktUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          Se <ExternalLink className="h-3 w-3" />
        </a>
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => onApply(candidate)}
            disabled={applying}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Anvend
          </button>
          {applyError && <span className="text-[10px] text-red-600 max-w-[160px] text-right">{applyError}</span>}
        </div>
      </td>
    </tr>
  );
}

export default function FeedsPage() {
  const [status, setStatus] = useState<FeedStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<RetailerSlug | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({});

  const refresh = () =>
    fetch("/api/feed-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setError("Kunne ikke hente feed-status."));

  useEffect(() => {
    refresh();
  }, []);

  const runSync = async (retailer: RetailerSlug) => {
    setRunning(retailer);
    try {
      await fetch(`/api/feed-sync/run?retailer=${retailer}`, { method: "POST" });
      await refresh();
    } catch {
      setError(`Kunne ikke køre sync for ${retailer}.`);
    } finally {
      setRunning(null);
    }
  };

  const applyCandidate = async (candidate: FeedCandidate) => {
    const rowKey = `${candidate.retailer}__${candidate.slug}`;
    setApplying(rowKey);
    setApplyErrors((prev) => ({ ...prev, [rowKey]: "" }));
    try {
      const res = await fetch("/api/feed-sync/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ retailer: candidate.retailer, slug: candidate.slug }),
      });
      const body = await res.json();
      if (!res.ok) {
        setApplyErrors((prev) => ({ ...prev, [rowKey]: body.error ?? "Ukendt fejl" }));
        return;
      }
      // Success removes the row entirely on the next fetch (candidate key
      // is gone from Redis) — that disappearance is the confirmation, no
      // separate "applied" state needed.
      await refresh();
    } catch {
      setApplyErrors((prev) => ({ ...prev, [rowKey]: "Netværksfejl" }));
    } finally {
      setApplying(null);
    }
  };

  const candidates = status?.candidates ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Feeds</h1>
        <p className="text-muted-foreground text-sm">
          Retailer-feed-kørsler og kandidater til gennemgang. Kandidater anvendes aldrig automatisk —
          tjek linket til produktet, og klik &quot;Anvend&quot; for at gemme det i kataloget.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-50/10 px-4 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!status && !error && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Henter feed-status…
        </div>
      )}

      {status && (
        <>
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Rss className="h-5 w-5 text-muted-foreground" />
              Feed-kørsler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RETAILER_SLUGS.map((retailer) => (
                <RunCard
                  key={retailer}
                  retailer={retailer}
                  run={status.runs[retailer]}
                  running={running === retailer}
                  onRun={runSync}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              Kandidater til gennemgang ({candidates.length})
            </h2>

            {candidates.length === 0 ? (
              <div className="rounded-lg border border-border/50 p-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">
                  Ingen ventende kandidater — enten er intet fundet endnu, eller alt er allerede gennemgået.
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Retailer
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Feed-titel
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Pris
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Lager
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Match
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Fundet
                      </th>
                      <th className="text-right px-4 py-2.5 w-16" />
                      <th className="text-right px-4 py-2.5 w-24" />
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => {
                      const rowKey = `${c.retailer}__${c.slug}`;
                      return (
                        <CandidateRow
                          key={rowKey}
                          candidate={c}
                          applying={applying === rowKey}
                          applyError={applyErrors[rowKey] || null}
                          onApply={applyCandidate}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
