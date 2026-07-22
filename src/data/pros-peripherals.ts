import prosPeripherals from "./pros-peripherals.json";
import type { ProPeripherals } from "@/lib/types";

export type { ProPeripherals };

/**
 * monitor/keyboard/mousepad/headset are free-text product names (scraped
 * display strings). *Slug fields resolve to a real catalog entry (mice.ts's
 * proBrugere pattern) once one exists for that category - only fill them in
 * once a matching slug is confirmed, never guess a slug from the free text.
 */
export function getProPeripherals(slug: string): ProPeripherals | null {
  const d = (prosPeripherals as Record<string, ProPeripherals>)[slug];
  return d ?? null;
}
