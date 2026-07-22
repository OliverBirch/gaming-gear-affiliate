import { mice } from "./mice";

const brandLogos: Record<string, string> = {
  logitech: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logitech_logo.svg/320px-Logitech_logo.svg.png",
  razer: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Razer_logo.svg/320px-Razer_logo.svg.png",
  zowie: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/BenQ_ZOWIE_logo.svg/320px-BenQ_ZOWIE_logo.svg.png",
};

export interface Brand {
  navn: string;
  slug: string;
  antalMus: number;
  antalPros: number;
  mestPopulaereMusSlug: string | null;
  mestPopulaereMusNavn: string | null;
  logo: string | null;
}

export function getBrands(): Brand[] {
  const brandMap = new Map<string, { navn: string; antalMus: number; pros: Set<string>; topMouse: { slug: string; navn: string; count: number } }>();

  for (const m of mice) {
    const key = m.brand.toLowerCase().replace(/\s+/g, "-");
    if (!brandMap.has(key)) {
      brandMap.set(key, { navn: m.brand, antalMus: 0, pros: new Set(), topMouse: { slug: m.slug, navn: m.navn, count: m.proBrugere.length } });
    }
    const entry = brandMap.get(key)!;
    entry.antalMus++;
    for (const pro of m.proBrugere) entry.pros.add(pro);
    if (m.proBrugere.length > entry.topMouse.count) {
      entry.topMouse = { slug: m.slug, navn: m.navn, count: m.proBrugere.length };
    }
  }

  return Array.from(brandMap.entries()).map(([slug, data]) => {
    return {
      navn: data.navn,
      slug,
      antalMus: data.antalMus,
      antalPros: data.pros.size,
      mestPopulaereMusSlug: data.topMouse.slug,
      mestPopulaereMusNavn: data.topMouse.navn,
      logo: brandLogos[slug] ?? null,
    };
  });
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export function brandSlug(navn: string): string {
  return navn.toLowerCase().replace(/\s+/g, "-");
}
