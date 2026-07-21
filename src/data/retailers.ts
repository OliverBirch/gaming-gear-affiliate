import type { Retailer } from "@/lib/types";

export const retailers: Retailer[] = [
  {
    slug: "proshop",
    navn: "Proshop",
    netvaerk: "partner-ads",
    basePayoutPct: 3.5,
    cookieDage: 30,
    hjemmeside: "https://www.proshop.dk",
  },
  {
    slug: "computersalg",
    navn: "Computersalg",
    netvaerk: "partner-ads",
    basePayoutPct: 3.0,
    cookieDage: 30,
    hjemmeside: "https://www.computersalg.dk",
  },
  {
    slug: "maxgaming",
    navn: "MaxGaming",
    netvaerk: "adtraction",
    basePayoutPct: 4.0,
    cookieDage: 60,
    hjemmeside: "https://www.maxgaming.dk",
  },
  {
    slug: "coolshop",
    navn: "Coolshop",
    netvaerk: "partner-ads",
    basePayoutPct: 3.0,
    cookieDage: 30,
    hjemmeside: "https://www.coolshop.dk",
  },
];

export function getRetailer(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
