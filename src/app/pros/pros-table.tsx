"use client";

import { useId, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Keyboard, Headphones, Monitor, MousePointer, Square } from "lucide-react";
import { ProAvatar } from "@/components/pro-avatar";
import { mice } from "@/data/mice";
import { esports } from "@/data/esports";
import { getProPeripherals } from "@/data/pros-peripherals";
import {
  getKeyboardSlug,
  getMousepadSlug,
  getHeadsetSlug,
  getMonitorSlug,
} from "@/data/pros-peripherals-mapping";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Pro } from "@/lib/types";

const ALL_FILTER = "__all__";
const PAGE_SIZE = 15;

interface Props {
  pros: Pro[];
}

function FilterSelect({
  value,
  onValueChange,
  label,
  options,
}: {
  value: string;
  onValueChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => { if (v) onValueChange(v); }}>
        <SelectTrigger className="w-full sm:w-36 h-8 text-sm">
          <SelectValue>
            {(v: unknown) => (v === ALL_FILTER ? `Alle ${label.toLowerCase()}` : String(v ?? `Alle ${label.toLowerCase()}`))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER}>Alle {label.toLowerCase()}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function GearCell({ navn, slug, basePath }: { navn: string | null; slug: string | null | undefined; basePath: string }) {
  if (!navn) return <span className="text-sm text-muted-foreground/50">&mdash;</span>;
  if (!slug) return <span className="text-sm text-muted-foreground">{navn}</span>;
  return (
    <Link href={`/${basePath}/${slug}`} className="text-sm text-primary hover:underline underline-offset-4 truncate block">
      {navn}
    </Link>
  );
}

function MouseCell({ navn, slug }: { navn: string | null; slug: string | null }) {
  if (!navn || !slug) return <span className="text-sm text-muted-foreground">&mdash;</span>;
  return (
    <Link href={`/mus/${slug}`} className="text-sm text-primary hover:underline underline-offset-4 truncate block">
      {navn}
    </Link>
  );
}

export function ProsTable({ pros }: Props) {
  const [query, setQuery] = useState("");
  const [esportFilter, setEsportFilter] = useState(ALL_FILTER);
  const [holdFilter, setHoldFilter] = useState(ALL_FILTER);
  const [musFilter, setMusFilter] = useState(ALL_FILTER);
  const [page, setPage] = useState(1);
  const inputId = useId();
  const resetPage = useCallback(() => setPage(1), []);

  const rows = useMemo(() => {
    return pros.map((pro) => {
      const mouse = mice.find((m) => m.slug === pro.musSlug);
      const peri = getProPeripherals(pro.slug);
      return {
        pro,
        mouseNavn: mouse?.navn ?? null,
        mouseSlug: mouse?.slug ?? null,
        keyboardNavn: peri?.keyboard ?? null,
        keyboardSlug: getKeyboardSlug(pro.slug) ?? null,
        mousepadNavn: peri?.mousepad ?? null,
        mousepadSlug: getMousepadSlug(pro.slug) ?? null,
        headsetNavn: peri?.headset ?? null,
        headsetSlug: getHeadsetSlug(pro.slug) ?? null,
        monitorNavn: peri?.monitor ?? null,
        monitorSlug: getMonitorSlug(pro.slug) ?? null,
      };
    });
  }, [pros]);

  const filterOptions = useMemo(() => {
    const esportNames = [...new Set(rows.map((r) => r.pro.esport))].map(
      (slug) => esports.find((e) => e.slug === slug)?.navn ?? slug
    ).sort();
    const holds = [...new Set(rows.map((r) => r.pro.hold).filter(Boolean))].sort() as string[];
    const mouseNames = [...new Set(rows.map((r) => r.mouseNavn).filter(Boolean))].sort() as string[];
    return { esportNames, holds, mouseNames };
  }, [rows]);

  const hasActiveFilters = esportFilter !== ALL_FILTER || holdFilter !== ALL_FILTER || musFilter !== ALL_FILTER;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.pro.navn.toLowerCase().includes(q) && !(r.pro.hold?.toLowerCase().includes(q) ?? false)) return false;
      const esportNavn = esports.find((e) => e.slug === r.pro.esport)?.navn ?? r.pro.esport;
      if (esportFilter !== ALL_FILTER && esportNavn !== esportFilter) return false;
      if (holdFilter !== ALL_FILTER && r.pro.hold !== holdFilter) return false;
      if (musFilter !== ALL_FILTER && r.mouseNavn !== musFilter) return false;
      return true;
    });
  }, [rows, query, esportFilter, holdFilter, musFilter, esports]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(start, end);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    resetPage();
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    resetPage();
  }

  function clearFilters() {
    setQuery("");
    setEsportFilter(ALL_FILTER);
    setHoldFilter(ALL_FILTER);
    setMusFilter(ALL_FILTER);
    resetPage();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">Søg spiller eller hold</label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={handleQueryChange}
              autoComplete="off"
              className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-72"
            />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            Viser <span className="text-foreground font-medium">{filtered.length > 0 ? start + 1 : 0}</span>&ndash;<span className="text-foreground font-medium">{end}</span> af{" "}
            <span className="text-foreground font-medium">{filtered.length}</span> pros
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <FilterSelect value={esportFilter} onValueChange={(v) => handleFilterChange(setEsportFilter, v)} label="Spil" options={filterOptions.esportNames} />
          <FilterSelect value={holdFilter} onValueChange={(v) => handleFilterChange(setHoldFilter, v)} label="Hold" options={filterOptions.holds} />
          <FilterSelect value={musFilter} onValueChange={(v) => handleFilterChange(setMusFilter, v)} label="Mus" options={filterOptions.mouseNames} />
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="h-8 rounded-lg border border-border/50 bg-card px-3 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors">Ryd filtre</button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
          <span>Spiller</span>
          <span>Mus</span>
          <span>Tastatur</span>
          <span>Musem&aring;tte</span>
          <span className="hidden xl:block">Headset</span>
          <span className="hidden xl:block">Sk&aelig;rm</span>
        </div>
        <div className="hidden sm:grid lg:hidden grid-cols-[1fr_1fr_1fr_1fr] gap-3 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
          <span>Spiller</span>
          <span>Mus</span>
          <span className="hidden sm:block">Tastatur</span>
          <span className="hidden sm:block">Musem&aring;tte</span>
        </div>

        {paginated.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {query.trim() ? (
                <>Ingen pros matcher <span className="text-foreground font-medium">&laquo;{query.trim()}&raquo;</span>{hasActiveFilters ? " og de valgte filtre." : "."}</>
              ) : "Ingen pros matcher de valgte filtre."}
            </p>
            <button type="button" onClick={clearFilters} className="mt-3 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-sm text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]">Nulstil alt</button>
          </div>
        ) : (
          <>
            {paginated.map((row) => {
              const { pro } = row;
              return (
                <div key={pro.slug}>
                  {/* Desktop row */}
                  <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProAvatar navn={pro.navn} slug={pro.slug} />
                      <div className="min-w-0">
                        <Link href={`/pro/${pro.slug}`} className="font-medium truncate block hover:text-primary transition-colors duration-150 text-sm">{pro.navn}</Link>
                        <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>
                      </div>
                    </div>
                    <div className="flex items-center"><MouseCell navn={row.mouseNavn} slug={row.mouseSlug} /></div>
                    <div className="flex items-center"><GearCell navn={row.keyboardNavn} slug={row.keyboardSlug} basePath="tastaturer" /></div>
                    <div className="flex items-center"><GearCell navn={row.mousepadNavn} slug={row.mousepadSlug} basePath="musemaatter" /></div>
                    <div className="hidden xl:flex items-center"><GearCell navn={row.headsetNavn} slug={row.headsetSlug} basePath="headset" /></div>
                    <div className="hidden xl:flex items-center"><GearCell navn={row.monitorNavn} slug={row.monitorSlug ?? null} basePath="skaerme" /></div>
                  </div>

                  {/* Tablet row */}
                  <div className="hidden sm:grid lg:hidden grid-cols-[1fr_1fr_1fr_1fr] gap-3 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProAvatar navn={pro.navn} slug={pro.slug} />
                      <div className="min-w-0">
                        <Link href={`/pro/${pro.slug}`} className="font-medium truncate block hover:text-primary transition-colors duration-150 text-sm">{pro.navn}</Link>
                        <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>
                      </div>
                    </div>
                    <div className="flex items-center"><MouseCell navn={row.mouseNavn} slug={row.mouseSlug} /></div>
                    <div className="hidden sm:flex items-center"><GearCell navn={row.keyboardNavn} slug={row.keyboardSlug} basePath="tastaturer" /></div>
                    <div className="hidden sm:flex items-center"><GearCell navn={row.mousepadNavn} slug={row.mousepadSlug} basePath="musemaatter" /></div>
                  </div>

                  {/* Mobile card */}
                  <div className="sm:hidden rounded-xl border border-border/50 p-5 mx-0.5 mt-3 hover:bg-muted/20 transition-colors duration-150">
                    <div className="flex items-center gap-3 mb-4">
                      <ProAvatar navn={pro.navn} slug={pro.slug} />
                      <div className="min-w-0">
                        <Link href={`/pro/${pro.slug}`} className="font-medium block hover:text-primary transition-colors duration-150">{pro.navn}</Link>
                        {pro.hold && <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>}
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {row.mouseNavn && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MousePointer className="h-3 w-3 text-primary" />
                            Mus
                          </span>
                          <MouseCell navn={row.mouseNavn} slug={row.mouseSlug} />
                        </div>
                      )}
                      {row.keyboardNavn && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Keyboard className="h-3 w-3 text-primary" />
                            Tastatur
                          </span>
                          <GearCell navn={row.keyboardNavn} slug={row.keyboardSlug} basePath="tastaturer" />
                        </div>
                      )}
                      {row.mousepadNavn && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Square className="h-3 w-3 text-primary" />
                            Musemåtte
                          </span>
                          <GearCell navn={row.mousepadNavn} slug={row.mousepadSlug} basePath="musemaatter" />
                        </div>
                      )}
                      {row.monitorNavn && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Monitor className="h-3 w-3 text-primary" />
                            Monitor
                          </span>
                          <GearCell navn={row.monitorNavn} slug={row.monitorSlug ?? null} basePath="skaerme" />
                        </div>
                      )}
                      {row.headsetNavn && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Headphones className="h-3 w-3 text-primary" />
                            Headset
                          </span>
                          <GearCell navn={row.headsetNavn} slug={row.headsetSlug} basePath="headset" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground tabular-nums">Side {safePage} af {totalPages}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium hover:border-primary hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:pointer-events-none">&larr; Forrige</button>
                  <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium hover:border-primary hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:pointer-events-none">Næste &rarr;</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Kilde: ProSettings.net</p>
    </div>
  );
}
