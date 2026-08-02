import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";
import { getPro } from "@/data/pros";

interface CategoryEntry {
  slug: string;
  proBrugere: string[];
}

interface ProUsersBandProps {
  productSlug: string;
  proBrugere: string[];
  /** Every product in the same category, for the rank/popularity calculation. */
  categoryProducts: CategoryEntry[];
}

/** "Bruges af N pro'er" card with rank + popularity bar. Renders nothing without pro users. */
export function ProUsersBand({ productSlug, proBrugere, categoryProducts }: ProUsersBandProps) {
  const proUsers = proBrugere
    .map((s) => getPro(s))
    .filter((p): p is NonNullable<ReturnType<typeof getPro>> => p != null)
    .slice(0, 24);

  if (proUsers.length === 0) return null;

  const maxProCount = Math.max(...categoryProducts.map((p) => p.proBrugere.length));
  const popularityPct = Math.round((proBrugere.length / maxProCount) * 100);
  const sortedByProCount = [...categoryProducts].sort((a, b) => b.proBrugere.length - a.proBrugere.length);
  const rank = sortedByProCount.findIndex((p) => p.slug === productSlug) + 1;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">
          Bruges af <span className="text-primary">{proBrugere.length}</span> pro{proBrugere.length > 1 ? "s" : ""}
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>#{rank} mest populære</span>
          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${popularityPct}%` }} />
          </div>
          <span>{popularityPct}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {proUsers.map((pro) => (
          <Link
            key={pro.slug}
            href={`/pro/${pro.slug}`}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30 transition-colors duration-150"
          >
            <ProAvatar navn={pro.navn} slug={pro.slug} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{pro.navn}</div>
              <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
