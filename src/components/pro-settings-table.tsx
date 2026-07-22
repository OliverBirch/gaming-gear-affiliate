"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProTableRow {
  slug: string;
  navn: string;
  hold: string | null;
  dpi: number;
  edpi: number;
  pollingHz: number | null;
  musSlug: string | null;
  musNavn: string | null;
}

interface Props {
  rows: ProTableRow[];
  /** Vises under tabellen sammen med datoen for sidste verificering. */
  kilde?: string;
  sidstVerificeret?: string;
}

const ALL_TEAM = "__all_team__";
const ALL_MOUSE = "__all_mouse__";
const ALL_DPI = "__all_dpi__";
const ALL_POLLING = "__all_polling__";

/**
 * Defineret udenfor ProSettingsTable, så komponenten ikke bliver gendannet ved
 * hver render. Ellers mister dropdownen sin tilstand, hver gang der tastes i søgefeltet.
 */
function FilterSelect({
  value,
  onValueChange,
  label,
  options,
  allValue,
  allLabel,
}: {
  value: string;
  onValueChange: (v: string) => void;
  label: string;
  options: string[];
  allValue: string;
  allLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v) onValueChange(v as string);
        }}
      >
        <SelectTrigger className="w-full sm:w-36 h-8 text-sm">
          {/* Base UI viser rå value som standard, så labelen slås op her. */}
          <SelectValue>
            {(v: unknown) => (v === allValue ? allLabel : String(v ?? allLabel))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={allValue}>{allLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProSettingsTable({ rows, kilde, sidstVerificeret }: Props) {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState(ALL_TEAM);
  const [mouseFilter, setMouseFilter] = useState(ALL_MOUSE);
  const [dpiFilter, setDpiFilter] = useState(ALL_DPI);
  const [pollingFilter, setPollingFilter] = useState(ALL_POLLING);
  const inputId = useId();

  const filterOptions = useMemo(() => {
    const teams = [...new Set(rows.map((r) => r.hold).filter(Boolean))].sort() as string[];
    const mice = [...new Set(rows.map((r) => r.musNavn).filter(Boolean))].sort() as string[];
    const dpis = [...new Set(rows.map((r) => r.dpi))].sort((a, b) => a - b);
    const pollings = [...new Set(rows.map((r) => r.pollingHz).filter((h): h is number => h != null))].sort((a, b) => a - b);
    return { teams, mice, dpis, pollings };
  }, [rows]);

  const hasActiveFilters = teamFilter !== ALL_TEAM || mouseFilter !== ALL_MOUSE || dpiFilter !== ALL_DPI || pollingFilter !== ALL_POLLING;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.navn.toLowerCase().includes(q) && !(r.hold?.toLowerCase().includes(q) ?? false) && !(r.musNavn?.toLowerCase().includes(q) ?? false)) return false;
      if (teamFilter !== ALL_TEAM && r.hold !== teamFilter) return false;
      if (mouseFilter !== ALL_MOUSE && r.musNavn !== mouseFilter) return false;
      if (dpiFilter !== ALL_DPI && r.dpi !== Number(dpiFilter)) return false;
      if (pollingFilter !== ALL_POLLING && r.pollingHz !== Number(pollingFilter)) return false;
      return true;
    });
  }, [rows, query, teamFilter, mouseFilter, dpiFilter, pollingFilter]);

  function clearFilters() {
    setQuery("");
    setTeamFilter(ALL_TEAM);
    setMouseFilter(ALL_MOUSE);
    setDpiFilter(ALL_DPI);
    setPollingFilter(ALL_POLLING);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-muted-foreground"
            >
              Søg spiller, hold eller mus
            </label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-72"
            />
          </div>

          <p className="text-xs text-muted-foreground tabular-nums">
            Viser <span className="text-foreground font-medium">{filtered.length}</span> af{" "}
            <span className="text-foreground font-medium">{rows.length}</span> pros
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <FilterSelect
            value={teamFilter}
            onValueChange={setTeamFilter}
            label="Hold"
            options={filterOptions.teams}
            allValue={ALL_TEAM}
            allLabel="Alle hold"
          />
          <FilterSelect
            value={mouseFilter}
            onValueChange={setMouseFilter}
            label="Mus"
            options={filterOptions.mice}
            allValue={ALL_MOUSE}
            allLabel="Alle mus"
          />
          <FilterSelect
            value={dpiFilter}
            onValueChange={setDpiFilter}
            label="DPI"
            options={filterOptions.dpis.map(String)}
            allValue={ALL_DPI}
            allLabel="Alle DPI"
          />
          <FilterSelect
            value={pollingFilter}
            onValueChange={setPollingFilter}
            label="Polling rate"
            options={filterOptions.pollings.map(String)}
            allValue={ALL_POLLING}
            allLabel="Alle Hz"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-8 rounded-lg border border-border/50 bg-card px-3 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              Ryd filtre
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
          <span>Spiller</span>
          <span>Indstillinger</span>
          <span>Mus</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {query.trim() ? (
                <>
                  Ingen pros matcher{" "}
                  <span className="text-foreground font-medium">
                    &laquo;{query.trim()}&raquo;
                  </span>
                  {hasActiveFilters ? " og de valgte filtre." : "."}
                </>
              ) : (
                "Ingen pros matcher de valgte filtre."
              )}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-sm text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
            >
              Nulstil alt
            </button>
          </div>
        ) : (
          filtered.map((pro) => (
            <div
              key={pro.slug}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ProAvatar navn={pro.navn} slug={pro.slug} />
                <div className="min-w-0">
                  <Link
                    href={`/pro/${pro.slug}`}
                    className="font-medium truncate block hover:text-primary transition-colors duration-150"
                  >
                    {pro.navn}
                  </Link>
                  <div className="text-xs text-muted-foreground truncate">
                    {pro.hold}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-sans tabular-nums text-muted-foreground sm:justify-end">
                <span>{pro.dpi} DPI</span>
                <span className="text-border">|</span>
                <span>{pro.edpi} eDPI</span>
                {pro.pollingHz != null && (
                  <>
                    <span className="text-border">|</span>
                    <span>{pro.pollingHz} Hz</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                {pro.musSlug && pro.musNavn ? (
                  <Link
                    href={`/mus/${pro.musSlug}`}
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    {pro.musNavn}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {kilde && (
        <p className="mt-3 text-xs text-muted-foreground">
          Kilde: {kilde}
          {sidstVerificeret &&
            ` - Sidst verificeret ${new Date(sidstVerificeret).toLocaleDateString("da-DK")}`}
        </p>
      )}
    </div>
  );
}
