"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { GearTopItem, ShareSegment } from "@/lib/esport-stats";
import { MouseShareBar } from "@/components/mouse-share-bar";
import { cn } from "@/lib/utils";

export type EsportGearTab =
  | {
      id: string;
      label: string;
      seAlleHref: string;
      seAlleLabel: string;
      kind: "keyboard";
      share: {
        segments: ShareSegment[];
        uniqueCount: number;
        totalPros: number;
        linkPrefix: string;
        itemLabel: string;
      };
      cards: ReactNode[];
    }
  | {
      id: string;
      label: string;
      seAlleHref: string;
      seAlleLabel: string;
      kind: "mousepad";
      share: {
        segments: ShareSegment[];
        uniqueCount: number;
        totalPros: number;
        linkPrefix: string;
        itemLabel: string;
      };
      cards: ReactNode[];
    }
  | {
      id: string;
      label: string;
      seAlleHref: string;
      seAlleLabel: string;
      kind: "headset";
      share: {
        segments: ShareSegment[];
        uniqueCount: number;
        totalPros: number;
        linkPrefix: string;
        itemLabel: string;
      };
      cards: ReactNode[];
    }
  | {
      id: string;
      label: string;
      seAlleHref: string;
      seAlleLabel: string;
      kind: "monitor";
      share: {
        segments: ShareSegment[];
        uniqueCount: number;
        totalPros: number;
        linkPrefix: string;
        itemLabel: string;
      };
      items: GearTopItem[];
    };

interface Props {
  tabs: EsportGearTab[];
}

function tabItemCount(t: EsportGearTab): number {
  return t.kind === "monitor" ? t.items.length : t.cards.length;
}

export function EsportGearPanel({ tabs }: Props) {
  const available = tabs.filter((t) => tabItemCount(t) > 0 || t.share.segments.length > 0);

  const [activeId, setActiveId] = useState(available[0]?.id ?? "");
  const active = available.find((t) => t.id === activeId) ?? available[0];

  if (!active) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Gear-kategorier"
        className="flex flex-wrap gap-1 mb-5 border-b border-border/50"
      >
        {available.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`gear-tab-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "px-3 py-2 text-sm transition-colors -mb-px border-b-2",
                isActive
                  ? "font-semibold text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`gear-tab-${active.id}`}
        className="scroll-mt-20"
        id={active.id}
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-xs text-muted-foreground">Top blandt pros</p>
          <Link
            href={active.seAlleHref}
            className="text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0"
          >
            {active.seAlleLabel}
          </Link>
        </div>

        <div className="mb-6">
          <MouseShareBar
            segments={active.share.segments}
            uniqueCount={active.share.uniqueCount}
            totalPros={active.share.totalPros}
            linkPrefix={active.share.linkPrefix}
            itemLabel={active.share.itemLabel}
            compact
          />
        </div>

        {active.kind === "keyboard" && active.cards.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.cards}
          </div>
        )}

        {active.kind === "mousepad" && active.cards.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.cards}
          </div>
        )}

        {active.kind === "headset" && active.cards.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.cards}
          </div>
        )}

        {active.kind === "monitor" && active.items.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="space-y-3">
              {active.items.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.navn}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.brand}</div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                    {item.pros} pro{item.pros > 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Link
            href={active.seAlleHref}
            className="text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            {active.seAlleLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
