import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { miceToAdd } from "@/data/mice-todo";

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
              </tr>
            </thead>
            <tbody>
              {miceToAdd.map((stub) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
