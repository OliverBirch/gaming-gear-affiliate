import Link from "next/link";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { miceToAdd } from "@/data/mice-todo";
import { mice } from "@/data/mice";
import { headsets } from "@/data/headsets";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { findDuplicateSuggestions, isSlugTaken } from "@/lib/product-utils";

const existingCatalog = [
  ...mice.map((m) => ({ navn: m.navn, slug: m.slug })),
  ...headsets.map((h) => ({ navn: h.navn, slug: h.slug })),
  ...keyboards.map((k) => ({ navn: k.navn, slug: k.slug })),
  ...mousepads.map((mp) => ({ navn: mp.model, slug: mp.slug })),
];

export default function AdminTodoPage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
        Mus der mangler data
      </h1>
      <p className="text-muted-foreground mb-8">
        {miceToAdd.length} mus {miceToAdd.length === 1 ? "mangler" : "mangler"} komplette oplysninger
      </p>

      {miceToAdd.length === 0 ? (
        <p className="text-muted-foreground italic">
          Alle mus har data &mdash; intet at g&oslash;re!
        </p>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Mus</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Brand</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Brugt af</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Kilde</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Dublet?</th>
              </tr>
            </thead>
            <tbody>
              {miceToAdd.map((stub) => {
                const duplicates = [
                  ...findDuplicateSuggestions(stub.navn, existingCatalog),
                  ...(isSlugTaken(stub.slug, existingCatalog) ? [{ navn: stub.slug, slug: stub.slug, score: 1 }] : []),
                ].sort((a, b) => b.score - a.score);
                const topDup = duplicates[0];
                return (
                <tr key={stub.slug} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3 font-mono text-sm">
                    <Link
                      href={`/mus/${stub.slug}`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {stub.slug}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{stub.brand}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/pro/${stub.sourcePro}`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {stub.sourcePro}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={stub.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      prosettings.net
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-5 py-3">
                    {topDup ? (
                      <Link
                        href={`/mus/${topDup.slug}`}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {topDup.navn}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">&mdash;</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
