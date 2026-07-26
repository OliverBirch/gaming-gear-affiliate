"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShareSegment } from "@/lib/esport-stats";

interface Props {
  segments: ShareSegment[];
  uniqueCount: number;
  totalPros: number;
  compact?: boolean;
}

const SEGMENT_COLORS = [
  "var(--color-primary, oklch(0.65 0.18 210))",
  "oklch(0.65 0.22 145)",
  "oklch(0.70 0.20 70)",
  "oklch(0.60 0.20 290)",
  "oklch(0.65 0.22 20)",
  "oklch(0.70 0.18 190)",
  "oklch(0.65 0.20 330)",
  "oklch(0.50 0.15 40)",
  "oklch(0.40 0.02 0)",
];

export function MouseShareBar({
  segments,
  uniqueCount,
  totalPros,
  compact = false,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (segments.length === 0) return null;

  const cumLeft = segments.map((_, i) =>
    segments.slice(0, i).reduce((s, seg) => s + seg.pct, 0)
  );

  return (
    <div>
      <div className="relative">
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted/50">
          {segments.map((seg, i) => (
            <div
              key={seg.slug}
              className="h-full cursor-default transition-opacity duration-150 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${seg.pct}%`,
                backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                opacity: hovered !== null && hovered !== i ? 0.4 : 1,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>

        {hovered !== null && segments[hovered] && (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              top: 0,
              left: `${cumLeft[hovered] + segments[hovered].pct / 2}%`,
            }}
          >
            <div
              className="-mt-2 -translate-x-1/2 -translate-y-full rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{
                    backgroundColor:
                      SEGMENT_COLORS[hovered % SEGMENT_COLORS.length],
                  }}
                />
                <span className="text-sm font-medium">
                  {segments[hovered].navn}
                </span>
                {segments[hovered].slug !== "__andre__" && (
                  <span className="text-xs text-muted-foreground">
                    {segments[hovered].count} pros
                  </span>
                )}
                <span className="text-sm font-semibold text-primary">
                  {segments[hovered].pct}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {compact ? (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {uniqueCount} mus i meta &middot;{" "}
          {segments[0].navn} {segments[0].pct}% &middot;&nbsp;
          {segments[1] && `${segments[1].navn} ${segments[1].pct}%`}
        </div>
      ) : (
        <div className="mt-4 space-y-1.5">
          {segments.map((seg, i) => (
            <div key={seg.slug} className="flex items-center gap-3 text-sm">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{
                  backgroundColor:
                    SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                }}
              />
              {seg.slug !== "__andre__" ? (
                <Link
                  href={`/mus/${seg.slug}`}
                  className="hover:text-primary transition-colors truncate"
                >
                  {seg.navn}
                </Link>
              ) : (
                <span className="text-muted-foreground">{seg.navn}</span>
              )}
              <span className="ml-auto font-sans tabular-nums text-muted-foreground shrink-0">
                {seg.count} pros
              </span>
              <span className="font-sans tabular-nums text-primary w-8 text-right shrink-0">
                {seg.pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
