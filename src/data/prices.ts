import pricesData from "./prices.json";

const prices: Record<string, number> = pricesData.prices;

export function getPrice(mouseSlug: string, retailerSlug: string): number | null {
  const key = `${mouseSlug}__${retailerSlug}`;
  return prices[key] ?? null;
}
