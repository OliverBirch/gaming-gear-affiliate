import type { Retailer } from "@/lib/types";

export const retailers: Retailer[] = [
  {
    slug: "proshop",
    navn: "Proshop",
    netvaerk: "partner-ads",
    basePayoutPct: 3.5,
    cookieDage: 30,
    logo: "/images/retailers/proshop.png",
    hjemmeside: "https://www.proshop.dk",
  },
  {
    slug: "computersalg",
    navn: "Computersalg",
    netvaerk: "partner-ads",
    basePayoutPct: 3.0,
    cookieDage: 30,
    logo: "/images/retailers/computersalg.png",
    hjemmeside: "https://www.computersalg.dk",
  },
  {
    slug: "maxgaming",
    navn: "MaxGaming",
    netvaerk: "adtraction",
    basePayoutPct: 4.0,
    cookieDage: 60,
    logo: "/images/retailers/maxgaming.svg",
    hjemmeside: "https://www.maxgaming.dk",
  },
  {
    slug: "coolshop",
    navn: "Coolshop",
    netvaerk: "partner-ads",
    basePayoutPct: 3.0,
    cookieDage: 30,
    logo: "/images/retailers/coolshop.png",
    hjemmeside: "https://www.coolshop.dk",
  },
  {
    slug: "elgiganten",
    navn: "Elgiganten",
    netvaerk: "impact",
    basePayoutPct: 2.5,
    cookieDage: 30,
    hjemmeside: "https://www.elgiganten.dk",
  },
  {
    slug: "avxperten",
    navn: "AVXperten",
    netvaerk: "adtraction",
    basePayoutPct: 4.0,
    cookieDage: 60,
    hjemmeside: "https://www.avxperten.dk",
  },
  {
    slug: "dustinhome",
    navn: "Dustin Home",
    netvaerk: "daisycon",
    basePayoutPct: 2.0,
    cookieDage: 30,
    hjemmeside: "https://www.dustinhome.dk",
  },
  {
    slug: "komplett",
    navn: "Komplett",
    netvaerk: "adtraction",
    basePayoutPct: 3.0,
    cookieDage: 60,
    hjemmeside: "https://www.komplett.dk",
  },
  {
    slug: "billo",
    navn: "BilligHærdware",
    netvaerk: "partner-ads",
    basePayoutPct: 2.5,
    cookieDage: 30,
    hjemmeside: "https://www.billo.dk",
  },
];

export function getRetailer(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
