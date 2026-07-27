"use client";

import { useId, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EsportProRow {
  slug: string;
  navn: string;
  hold: string | null;
  musNavn: string | null;
  musSlug: string | null;
  keyboardNavn: string | null;
  keyboardSlug: string | null;
  mousepadNavn: string | null;
  mousepadSlug: string | null;
  headsetNavn: string | null;
  headsetSlug: string | null;
  monitorNavn: string | null;
}

interface Props {
  rows: EsportProRow[];
}

const ALL_FILTER = "__all__";
const PAGE_SIZE = 15;

function EsportFilterSelect({
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

function GearCell({ navn, slug, href }: { navn: string | null; slug: string | null; href: string }) {
  if (!navn) return <span className="text-sm text-muted-foreground/50">&mdash;</span>;
  if (!slug) return <span className="text-sm text-muted-foreground">{navn}</span>;
  return (
    <Link href={href} className="text-sm text-primary hover:underline underline-offset-4 truncate block">
      {navn}
    </Link>
  );
}

const HEADERS = [
  { label: "Spiller", hide: "" },
  { label: "Mus", hide: "" },
  { label: "Tastatur", hide: "lg" },
  { label: "Musemåtte", hide: "lg" },
  { label: "Headset", hide: "xl" },
  { label: "Skærm", hide: "xl" },
] as const;

export function EsportProsTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [holdFilter, setHoldFilter] = useState(ALL_FILTER);
  const [musFilter, setMusFilter] = useState(ALL_FILTER);
  const [page, setPage] = useState(1);
  const inputId = useId();

  const resetPage = useCallback(() => setPage(1), []);

  const filterOptions = useMemo(() => {
    const holds = [...new Set(rows.map((r) => r.hold).filter(Boolean))].sort() as string[];
    const mice = [...new Set(rows.map((r) => r.musNavn).filter(Boolean))].sort() as string[];
    return { holds, mice };
  }, [rows]);

  const hasActiveFilters = holdFilter !== ALL_FILTER || musFilter !== ALL_FILTER;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.navn.toLowerCase().includes(q) && !(r.hold?.toLowerCase().includes(q) ?? false)) return false;
      if (holdFilter !== ALL_FILTER && r.hold !== holdFilter) return false;
      if (musFilter !== ALL_FILTER && r.musNavn !== musFilter) return false;
      return true;
    });
  }, [rows, query, holdFilter, musFilter]);

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
          <EsportFilterSelect value={holdFilter} onValueChange={(v) => handleFilterChange(setHoldFilter, v)} label="Hold" options={filterOptions.holds} />
          <EsportFilterSelect value={musFilter} onValueChange={(v) => handleFilterChange(setMusFilter, v)} label="Mus" options={filterOptions.mice} />
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="h-8 rounded-lg border border-border/50 bg-card px-3 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors">Ryd filtre</button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
          <span>Spiller</span>
          <span>Mus</span>
          <span className="hidden lg:block">Tastatur</span>
          <span className="hidden lg:block">Musem&aring;tte</span>
        </div>
        <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
          <span>Spiller</span>
          <span>Mus</span>
          <span>Tastatur</span>
          <span>Musem&aring;tte</span>
          <span className="hidden xl:block">Headset</span>
          <span className="hidden xl:block">Sk&aelig;rm</span>
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
            {paginated.map((pro) => (
              <div key={pro.slug} className="grid grid-cols-[1fr_1fr_1fr_1fr] lg:grid-cols-6 gap-2 sm:gap-3 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150">
                <div className="flex items-center gap-3 min-w-0">
                  <ProAvatar navn={pro.navn} slug={pro.slug} />
                  <div className="min-w-0">
                    <Link href={`/pro/${pro.slug}`} className="font-medium truncate block hover:text-primary transition-colors duration-150 text-sm">{pro.navn}</Link>
                    <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>
                  </div>
                </div>
                <div className="flex items-center"><GearCell navn={pro.musNavn} slug={pro.musSlug} href={`/mus/${pro.musSlug ?? ""}`} /></div>
                <div className="hidden lg:flex items-center"><GearCell navn={pro.keyboardNavn} slug={pro.keyboardSlug} href={`/tastaturer/${pro.keyboardSlug ?? ""}`} /></div>
                <div className="hidden lg:flex items-center"><GearCell navn={pro.mousepadNavn} slug={pro.mousepadSlug} href={`/musemaatter/${pro.mousepadSlug ?? ""}`} /></div>
                <div className="hidden xl:flex items-center"><GearCell navn={pro.headsetNavn} slug={pro.headsetSlug} href={`/headset/${pro.headsetSlug ?? ""}`} /></div>
                <div className="hidden xl:flex items-center"><GearCell navn={pro.monitorNavn} slug={null} href="" /></div>
              </div>
            ))}

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
