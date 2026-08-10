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
    harFeed: true,
    sidstFeedHentet: "2026-08-08",
  },
  {
    slug: "geekd",
    navn: "Geek'd",
    netvaerk: "partner-ads",
    basePayoutPct: 4.0,
    cookieDage: 40,
    hjemmeside: "https://geekd.dk",
    harFeed: true,
    sidstFeedHentet: "2026-08-08",
  },
];

export function getRetailer(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
