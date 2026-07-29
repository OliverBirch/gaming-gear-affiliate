import { bestOffer } from "@/lib/affiliate";
import type { Mouse } from "@/lib/types";
import type { SpecRowDef, SpecValue } from "./types";

const formfaktorLabels: Record<string, string> = {
  ergonomisk: "Ergonomisk",
  symmetrisk: "Symmetrisk",
  ambidextrous: "Ambidextrous",
};

const grebLabels: Record<string, string> = {
  palm: "Palm",
  claw: "Claw",
  fingertip: "Fingertip",
};

const haandLabels: Record<string, string> = {
  lille: "Lille",
  medium: "Medium",
  stor: "Stor",
};

const prisLabels: Record<string, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

function fmt(value: SpecValue): string {
  if (value === null || value === undefined) return "–";
  if (typeof value === "boolean") return value ? "Ja" : "Nej";
  return String(value);
}

function lowestPrice(m: Mouse): number | null {
  const o = bestOffer(m);
  return o?.prisDkk ?? null;
}

export const mouseSpecRows: SpecRowDef<Mouse>[] = [
  {
    id: "brand",
    label: "Brand",
    group: "overview",
    getValue: (m) => m.brand,
    format: fmt,
    better: null,
  },
  {
    id: "formfaktor",
    label: "Formfaktor",
    group: "overview",
    getValue: (m) => formfaktorLabels[m.formfaktor] ?? m.formfaktor,
    format: fmt,
    better: null,
  },
  {
    id: "greb",
    label: "Greb",
    group: "overview",
    getValue: (m) => m.greb.map((g) => grebLabels[g] ?? g).join(", "),
    format: fmt,
    better: null,
  },
  {
    id: "haand",
    label: "Håndstørrelse",
    group: "overview",
    getValue: (m) => m.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", "),
    format: fmt,
    better: null,
  },
  {
    id: "prisniveau",
    label: "Prisniveau",
    group: "overview",
    getValue: (m) => prisLabels[m.prisNiveau] ?? m.prisNiveau,
    format: fmt,
    better: null,
  },
  {
    id: "vaegt",
    label: "Vægt",
    group: "size",
    getValue: (m) => m.vaegtGram,
    format: (v) => (typeof v === "number" ? `${v}g` : fmt(v)),
    better: "lower",
    emphasize: true,
  },
  {
    id: "maal",
    label: "Mål (L×B×H)",
    group: "size",
    getValue: (m) => `${m.laengdeMm} × ${m.breddeMm} × ${m.hoejdeMm} mm`,
    format: fmt,
    better: null,
  },
  {
    id: "knapper",
    label: "Knapper",
    group: "size",
    getValue: (m) => m.knapper,
    format: fmt,
    better: null,
  },
  {
    id: "sensor",
    label: "Sensor",
    group: "sensor",
    getValue: (m) => m.sensor,
    format: fmt,
    better: null,
  },
  {
    id: "maxDpi",
    label: "Max DPI",
    group: "sensor",
    getValue: (m) => m.maxDpi,
    format: (v) =>
      typeof v === "number" ? v.toLocaleString("da-DK") : fmt(v),
    better: "higher",
  },
  {
    id: "polling",
    label: "Polling rate",
    group: "sensor",
    getValue: (m) => m.pollingHz,
    format: (v) => (typeof v === "number" ? `${v} Hz` : fmt(v)),
    better: "higher",
  },
  {
    id: "lod",
    label: "LOD",
    group: "sensor",
    getValue: (m) => m.lodMm,
    format: (v) => (typeof v === "number" ? `${v} mm` : fmt(v)),
    better: "lower",
  },
  {
    id: "wireless",
    label: "Trådløs",
    group: "features",
    getValue: (m) => m.wireless,
    format: fmt,
    better: "true",
  },
  {
    id: "forbindelse",
    label: "Forbindelse",
    group: "features",
    getValue: (m) => m.forbindelse,
    format: fmt,
    better: null,
  },
  {
    id: "batteri",
    label: "Batteritid",
    group: "features",
    getValue: (m) => m.batteritidTimer,
    format: (v) => (typeof v === "number" ? `${v} timer` : "–"),
    better: "higher",
  },
  {
    id: "switch",
    label: "Switch-type",
    group: "features",
    getValue: (m) => (m.switchType === "optisk" ? "Optisk" : "Mekanisk"),
    format: fmt,
    better: null,
  },
  {
    id: "software",
    label: "Software påkrævet",
    group: "features",
    getValue: (m) => m.softwarePaakraevet,
    format: fmt,
    better: "false",
  },
  {
    id: "pros",
    label: "Pro-brugere",
    group: "social",
    getValue: (m) => m.proBrugere.length,
    format: (v) => (typeof v === "number" ? String(v) : fmt(v)),
    better: "higher",
    emphasize: true,
  },
  {
    id: "pris",
    label: "Laveste pris",
    group: "price",
    getValue: (m) => lowestPrice(m),
    format: (v) => (typeof v === "number" ? `${v} kr.` : "Se priser"),
    better: "lower",
    emphasize: true,
  },
];

export function mouseLowestPriceLabel(m: Mouse): string | null {
  const p = lowestPrice(m);
  return p != null ? `${p} kr.` : null;
}
