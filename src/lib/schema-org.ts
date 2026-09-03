/**
 * Schema.org JSON-LD builders.
 *
 * The BreadcrumbList literal used to be hand-written on every list page,
 * detail page, brand page, pro page, esport hub and guide — 15+ independent
 * copies. That is how /headset's ItemList silently ended up emitting only
 * `name` while /mus emitted a full Product with brand and url. Build the
 * objects here so every page is structurally identical by construction.
 */

export const SITE_URL = "https://www.prosetups.dk";

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

/**
 * Product schema for a detail page, including its offer list. An empty
 * `offers` key is invalid for Google's Product rich-result eligibility, so
 * when nothing survives the in-stock filter the key is omitted entirely
 * rather than serialized as `offers: []` — the Product block itself (name/
 * brand/description/image) is still valid and useful with zero offers.
 */
export function productSchema(opts: {
  navn: string;
  brand: string;
  beskrivelse: string;
  billede?: string | null;
  offers: SchemaOffer[];
}) {
  const offers = opts.offers
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
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.navn,
    brand: { "@type": "Brand", name: opts.brand },
    description: opts.beskrivelse,
    image: opts.billede ? absoluteUrl(opts.billede) : undefined,
    ...(offers.length > 0 && { offers }),
  };
}

type ListedPerson = { slug: string; navn: string };

/** ItemList of Person entries — pro roster / all-pros listing pages. */
export function personItemList(opts: {
  name: string;
  description: string;
  people: ListedPerson[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    description: opts.description,
    numberOfItems: opts.people.length,
    itemListElement: opts.people.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: p.navn,
        url: absoluteUrl(`/pro/${p.slug}`),
      },
    })),
  };
}

type KnowsAboutProduct = { navn: string; brand: string };

/** Person schema for a pro's own page. */
export function personSchema(opts: {
  navn: string;
  slug: string;
  /** Team name, e.g. pro.hold. Rendered as an Organization, not a bare string. */
  affiliation?: string | null;
  knowsAbout?: KnowsAboutProduct[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.navn,
    url: absoluteUrl(`/pro/${opts.slug}`),
    ...(opts.affiliation && {
      affiliation: { "@type": "Organization", name: opts.affiliation },
    }),
    ...(opts.knowsAbout &&
      opts.knowsAbout.length > 0 && {
        knowsAbout: opts.knowsAbout.map((p) => ({
          "@type": "Product",
          name: p.navn,
          brand: { "@type": "Brand", name: p.brand },
        })),
      }),
  };
}

/**
 * Article schema for blog posts and guides. `datePublished` is optional —
 * guides carry no publish date in their data, and per this repo's "never
 * invent a date" rule (see sidstVerificeret/kilde), it must not be fabricated.
 */
export function articleSchema(opts: {
  headline: string;
  description: string;
  datePublished?: string;
  path: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: absoluteUrl(opts.path),
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    author: {
      "@type": "Organization",
      name: opts.authorName ?? "ProSetups.dk",
    },
    publisher: {
      "@type": "Organization",
      name: "ProSetups.dk",
    },
  };
}

/** FAQPage schema. Guard call sites with `items.length > 0` — some pages
 * legitimately have zero FAQ items and should emit no FAQPage at all rather
 * than one with an empty mainEntity. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Generic WebPage/AboutPage schema for static informational pages. */
export function webPageSchema(opts: {
  type?: "WebPage" | "AboutPage";
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    name: opts.name,
    description: opts.description,
  };
}

/** Serialize for a <script dangerouslySetInnerHTML> block. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value);
}
