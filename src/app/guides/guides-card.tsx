import Link from "next/link";
import type { GuideMeta } from "@/data/guides";

export function GuidesCard({ guide }: { guide: GuideMeta }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-3">
        {guide.spil && (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {guide.spil.toUpperCase()}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {guide.kategori === "mice" ? "Mus" : guide.kategori}
        </span>
      </div>
      <h2 className="font-semibold group-hover:text-primary transition-colors duration-200 mb-2">
        {guide.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {guide.description}
      </p>
    </Link>
  );
}
