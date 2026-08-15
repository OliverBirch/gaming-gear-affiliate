/**
 * Schema.org JSON-LD builders.
 *
 * The BreadcrumbList literal used to be hand-written on every list page,
 * detail page, brand page, pro page, esport hub and guide — 15+ independent
 * copies. That is how /headset's ItemList silently ended up emitting only
 * `name` while /mus emitted a full Product with brand and url. Build the
 * objects here so every page is structurally identical by construction.
 */

export const SITE_URL = "https://prosetups.dk";

/** Absolute URL from a site-root-relative path. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}

/** Site-wide Organization identity — used once, in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ProSetups.dk",
    url: SITE_URL,
    description: "Dansk pro-setup guide med esport-gear, settings og affiliate-priser.",
  };
}

/**
 * Site-wide WebSite identity — used once, in the root layout. No
 * `potentialAction` SearchAction: the site has no GET-based search URL
 * (`/find-mus` is a client-side quiz, not a query endpoint), so adding one
 * would advertise a capability that doesn't exist.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ProSetups.dk",
    url: SITE_URL,
    inLanguage: "da-DK",
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

type ListedProduct = {
  slug: string;
  navn: string;
  brand: string;
};

/**
 * ItemList for a category listing page. Every entry carries a full Product
 * (name, brand, url) — previously only some pages did.
 */
export function productItemList(opts: {
  name: string;
  description: string;
  products: ListedProduct[];
  /** Route segment the detail pages live under, e.g. "mus". */
  urlPrefix: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    description: opts.description,
    numberOfItems: opts.products.length,
    itemListElement: opts.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.navn,
        brand: p.brand,
        url: absoluteUrl(`/${opts.urlPrefix}/${p.slug}`),
      },
    })),
  };
}

type SchemaOffer = {
  retailer: string;
  produktUrl: string;
  affiliateUrl?: string;
  prisDkk?: number | null;
  inStock?: boolean;
};

/** Product schema for a detail page, including its offer list. */
export function productSchema(opts: {
  navn: string;
  brand: string;
  beskrivelse: string;
  billede?: string | null;
  offers: SchemaOffer[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.navn,
    brand: { "@type": "Brand", name: opts.brand },
    description: opts.beskrivelse,
    image: opts.billede ? absoluteUrl(opts.billede) : undefined,
    offers: opts.offers
      .filter((o) => o.inStock !== false)
      .map((o) => ({
        "@type": "Offer",
        url: o.affiliateUrl ?? o.produktUrl,
        price: o.prisDkk ?? undefined,
        priceCurrency: o.prisDkk ? "DKK" : undefined,
        availability: o.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: o.retailer },
      })),
  };
}

/** Serialize for a <Script dangerouslySetInnerHTML> block. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value);
}
