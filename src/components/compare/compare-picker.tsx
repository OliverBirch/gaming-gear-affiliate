"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildCompareUrl } from "@/lib/compare/resolve";

const EMPTY = "__empty__";

type Option = { slug: string; navn: string };

export function ComparePicker({
  slugA,
  slugB,
  options,
}: {
  slugA: string | null;
  slugB: string | null;
  options: Option[];
}) {
  const router = useRouter();

  const update = useCallback(
    (nextA: string | null, nextB: string | null) => {
      const slugs = [nextA, nextB].filter((s): s is string => Boolean(s));
      router.replace(buildCompareUrl(slugs), { scroll: false });
    },
    [router]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      <PickerSlot
        label="Mus A"
        value={slugA}
        exclude={slugB}
        options={options}
        onChange={(slug) => update(slug, slugB)}
      />
      <PickerSlot
        label="Mus B"
        value={slugB}
        exclude={slugA}
        options={options}
        onChange={(slug) => update(slugA, slug)}
      />
    </div>
  );
}

function PickerSlot({
  label,
  value,
  exclude,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  exclude: string | null;
  options: Option[];
  onChange: (slug: string | null) => void;
}) {
  const filtered = options.filter((o) => o.slug !== exclude);
  const current = value ?? EMPTY;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={current}
        onValueChange={(v) => {
          if (v == null || v === EMPTY) onChange(null);
          else onChange(v);
        }}
      >
        <SelectTrigger className="w-full h-9">
          <SelectValue>
            {(v: unknown) => {
              if (v === EMPTY || v == null) return "Vælg en mus…";
              const opt = options.find((o) => o.slug === v);
              return opt?.navn ?? String(v);
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={EMPTY}>Vælg en mus…</SelectItem>
          {filtered.map((o) => (
            <SelectItem key={o.slug} value={o.slug}>
              {o.navn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
