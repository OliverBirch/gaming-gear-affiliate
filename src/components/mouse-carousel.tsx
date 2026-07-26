"use client";

import { useRef } from "react";
import type { Mouse } from "@/lib/types";
import { MouseCard } from "@/components/mouse-card";

interface Props {
  mice: Mouse[];
  rank?: boolean;
}

export function MouseCarousel({ mice, rank }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  if (mice.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const gap = 20;
    const cardW = ref.current.clientWidth;
    ref.current.scrollBy({
      left: dir === "left" ? -(cardW + gap) : cardW + gap,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1"
        style={{ scrollSnapType: "x mandatory", msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {mice.map((mouse, i) => (
          <div
            key={mouse.slug}
            className="min-w-0 w-full shrink-0 snap-start"
          >
            <MouseCard mouse={mouse} rank={rank ? i + 1 : undefined} />
          </div>
        ))}
      </div>
      {mice.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Forrige"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-9 w-9 rounded-full border border-border/50 bg-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-150 hidden sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Næste"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 h-9 w-9 rounded-full border border-border/50 bg-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-150 hidden sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
