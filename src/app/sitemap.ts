import type { MetadataRoute } from "next";
import { esports } from "@/data/esports";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { getBrands } from "@/data/brands";
import { guides } from "@/data/guides";

const BASE = "https://prosetups.dk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE}/find-mus`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE}/guides/greb`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/om`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE}/transparens`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE}/privatliv`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE}/mus`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/tastaturer`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/musemaatter`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/pros`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE}/guides`, changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  const esportPages = esports.filter((e) => e.aktiv).map((e) => ({
    url: `${BASE}/${e.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const teams = [
    ...new Set(
      pros
        .filter((p) => p.hold && p.hold !== "Free Agent" && p.hold !== "Retired" && p.hold !== "Content Creator")
        .map((p) => ({ esport: p.esport, slug: p.hold!.toLowerCase().replace(/\s+/g, "-") }))
    ),
  ];
  const teamPages = teams.map((t) => ({
    url: `${BASE}/${t.esport}/hold/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const mousePages = mice.map((m) => ({
    url: `${BASE}/mus/${m.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const keyboardPages = keyboards.map((k) => ({
    url: `${BASE}/tastaturer/${k.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const mousepadPages = mousepads.map((mp) => ({
    url: `${BASE}/musemaatter/${mp.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const proPages = pros.map((p) => ({
    url: `${BASE}/pro/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const brandPages = getBrands().map((b) => ({
    url: `${BASE}/maerke/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const guidePages = guides.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...esportPages,
    ...teamPages,
    ...mousePages,
    ...keyboardPages,
    ...mousepadPages,
    ...proPages,
    ...brandPages,
    ...guidePages,
  ];
}
