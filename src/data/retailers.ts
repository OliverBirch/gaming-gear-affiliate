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
  {
    slug: "komplett",
    navn: "Komplett",
    netvaerk: "adtraction",
    basePayoutPct: 2.5,
    cookieDage: 10,
    hjemmeside: "https://www.komplett.dk",
    harFeed: true,
    sidstFeedHentet: "2026-08-15",
  },
  {
    slug: "av-cables",
    navn: "AV-Cables",
    netvaerk: "adtraction",
    basePayoutPct: 4.2,
    cookieDage: 45,
    hjemmeside: "https://www.av-cables.dk",
    harFeed: true,
    sidstFeedHentet: "2026-08-15",
  },
];

export function getRetailer(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
