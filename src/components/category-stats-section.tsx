"use client";

import { useState } from "react";
import Link from "next/link";
import { MouseShareBar } from "@/components/mouse-share-bar";
import { ProductCardCompact } from "@/components/product-card-compact";
import type { CategoryStatsSet } from "@/lib/category-stats";

interface Props {
  stats: Record<string, CategoryStatsSet>;
  linkPrefix: string;
  itemLabel: string;
}

const TABS = [
  { key: "alle", label: "Alle" },
  { key: "cs2", label: "CS2" },
  { key: "valorant", label: "Valorant" },
  { key: "r6", label: "R6" },
] as const;

export function CategoryStatsSection({ stats, linkPrefix, itemLabel }: Props) {
  const [active, setActive] = useState("alle");
  const current = stats[active];

  if (!current || current.segments.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={
              active === tab.key
                ? "px-3 py-1.5 text-sm rounded-lg border border-primary bg-primary text-primary-foreground font-medium transition-colors"
                : "px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">
          Mest brugte {itemLabel}
        </h2>
        <Link
          href={`/${linkPrefix}`}
          className="text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          Se alle &rarr;
        </Link>
      </div>

      {current.topProducts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {current.topProducts.map((product, i) => (
            <ProductCardCompact
              key={product.slug}
              href={`/${linkPrefix}/${product.slug}`}
              billede={product.billede}
              navn={product.navn}
              brand={product.brand}
              rank={i + 1}
              proCount={product.proCount}
              sharePct={product.sharePct}
            />
          ))}
        </div>
      )}

      <MouseShareBar
        segments={current.segments}
        uniqueCount={current.uniqueCount}
        totalPros={current.totalPros}
        compact
        linkPrefix={`/${linkPrefix}`}
        itemLabel={itemLabel}
      />
    </section>
  );
}
