import prosPeripherals from "./pros-peripherals.json";

export interface ProPeripherals {
  monitor: string | null;
  keyboard: string | null;
  mousepad: string | null;
  headset: string | null;
}

export function getProPeripherals(slug: string): ProPeripherals | null {
  const d = (prosPeripherals as Record<string, ProPeripherals>)[slug];
  return d ?? null;
}
