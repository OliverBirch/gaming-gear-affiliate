import Link from "next/link";
import { retailers } from "@/data/retailers";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import { mousepads } from "@/data/mousepads";
import {
  countOffersByRetailer,
  checkRetailerFeedMismatch,
  daysAgo,
  dateLabel,
} from "@/lib/data-health";
import {
  Handshake,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ShoppingCart,
} from "lucide-react";

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

export default function PartnershipsPage() {
  const offerCounts = countOffersByRetailer([
    mice,
    keyboards,
    headsets,
    monitors,
    mousepads,
  ]);
  const mismatches = checkRetailerFeedMismatch(retailers, offerCounts);
  const mismatchBySlug = new Set(mismatches.map((m) => m.slug));

  const liveCount = retailers.filter((r) => r.harFeed).length;
  const productsWithLiveOffer = retailers
    .filter((r) => r.harFeed)
    .reduce((sum, r) => sum + (offerCounts[r.slug] ?? 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          Partnerskaber
        </h1>
        <p className="text-muted-foreground text-sm">
          Kun forhandlere med et bekræftet, feed-matchet produktkatalog tælles
          som reelle partnere — resten er ikke tilføjet til {"retailers.ts"}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <StatCard
          label="Live-feed partnere"
          value={liveCount}
          icon={Handshake}
        />
        <StatCard
          label="Tilbud fra live partnere"
          value={productsWithLiveOffer}
          icon={ShoppingCart}
        />
        <StatCard
          label="Uoverensstemmelser"
          value={mismatches.length}
          icon={AlertTriangle}
          warn={mismatches.length > 0}
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Percent className="h-5 w-5 text-muted-foreground" />
          Forhandlere
        </h2>

        <div className="rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Forhandler
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Netværk
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Feed-status
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Sidst hentet
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Payout
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Cookie
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Aktive tilbud
                </th>
              </tr>
            </thead>
            <tbody>
              {retailers.map((r) => (
                <tr
                  key={r.slug}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">
                    {r.navn}
                    {mismatchBySlug.has(r.slug) && (
                      <AlertTriangle className="inline h-3.5 w-3.5 text-amber-500 ml-1.5" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {r.netvaerk}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.harFeed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Live
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Placeholder
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {r.sidstFeedHentet
                      ? dateLabel(daysAgo(r.sidstFeedHentet))
                      : "Aldrig"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {r.basePayoutPct}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {r.cookieDage}d
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                    {offerCounts[r.slug] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mismatches.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50/10 p-4">
            <p className="text-sm font-medium text-amber-500 mb-1">
              Uoverensstemmelser fundet
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {mismatches.map((m) => (
                <li key={m.slug}>{m.label}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground mt-6">
        <Link href="/admin" className="hover:text-foreground underline underline-offset-4">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
