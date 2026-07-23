import brandRegistry from "./brands.json";
import { mice } from "./mice";

export interface Brand {
  navn: string;
  slug: string;
  antalMus: number;
  antalPros: number;
  mestPopulaereMusSlug: string | null;
  mestPopulaereMusNavn: string | null;
  logo: string | null;
  beskrivelse: string | null;
}

const registryMap = new Map<string, (typeof brandRegistry.brands)[number]>();
const aliasToSlug = new Map<string, string>();

for (const entry of brandRegistry.brands) {
  registryMap.set(entry.slug, entry);
  for (const alias of entry.aliases) {
    aliasToSlug.set(alias.toLowerCase(), entry.slug);
  }
}

export function normalizeBrandName(raw: string): string {
  const slug = aliasToSlug.get(raw.toLowerCase());
  if (!slug) return raw;
  return registryMap.get(slug)!.navn;
}

export function getBrands(): Brand[] {
  const mouseStats = new Map<string, { antalMus: number; pros: Set<string>; topMouse: { slug: string; navn: string; count: number } }>();

  for (const m of mice) {
    const key = m.brand.toLowerCase().replace(/\s+/g, "-");
    if (!mouseStats.has(key)) {
      mouseStats.set(key, { antalMus: 0, pros: new Set(), topMouse: { slug: m.slug, navn: m.navn, count: m.proBrugere.length } });
    }
    const entry = mouseStats.get(key)!;
    entry.antalMus++;
    for (const pro of m.proBrugere) entry.pros.add(pro);
    if (m.proBrugere.length > entry.topMouse.count) {
      entry.topMouse = { slug: m.slug, navn: m.navn, count: m.proBrugere.length };
    }
  }

  return Array.from(registryMap.values()).map((entry) => {
    const stats = mouseStats.get(entry.slug);
    return {
      navn: entry.navn,
      slug: entry.slug,
      antalMus: stats?.antalMus ?? 0,
      antalPros: stats?.pros.size ?? 0,
      mestPopulaereMusSlug: stats?.topMouse.slug ?? null,
      mestPopulaereMusNavn: stats?.topMouse.navn ?? null,
      logo: entry.logo ?? null,
      beskrivelse: entry.beskrivelse ?? null,
    };
  });
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export function brandSlug(navn: string): string {
  return navn.toLowerCase().replace(/\s+/g, "-");
}
