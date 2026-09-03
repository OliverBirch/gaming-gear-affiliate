import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { headsets } from "@/data/headsets";
import { monitors } from "@/data/monitors";
import { mousepads } from "@/data/mousepads";
import type { CatalogItem } from "./types";

/**
 * Flattens the 5 built category modules into one matcher-ready list.
 * Reads the built @/data/* arrays (post-Zod-parse, post-transform-layer),
 * not the raw *.json files the original CLI scripts read directly - this
 * way matching runs against exactly what the site renders, not a stale or
 * pre-validation view of the catalog.
 */
export function loadCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];

  for (const m of mice) {
    items.push({ slug: m.slug, navn: m.navn, brand: m.brand, category: "mus", ean: m.ean ?? null });
  }
  for (const k of keyboards) {
    items.push({ slug: k.slug, navn: k.navn, brand: k.brand, category: "tastaturer", ean: k.ean ?? null });
  }
  for (const h of headsets) {
    items.push({ slug: h.slug, navn: h.navn, brand: h.brand, category: "headset", ean: h.ean ?? null });
  }
  for (const mo of monitors) {
    items.push({ slug: mo.slug, navn: mo.navn, brand: mo.brand, category: "skaerme", ean: mo.ean ?? null });
  }
  for (const p of mousepads) {
    items.push({ slug: p.slug, navn: p.model, brand: p.brand, category: "musemaatter", ean: p.ean ?? null });
  }

  return items;
}
