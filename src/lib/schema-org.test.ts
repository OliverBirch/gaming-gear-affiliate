import { describe, it, expect } from "vitest";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbList,
  productItemList,
  productSchema,
} from "./schema-org";

describe("absoluteUrl", () => {
  it("joins root-relative paths onto the site URL", () => {
    expect(absoluteUrl("/mus")).toBe(`${SITE_URL}/mus`);
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("tolerates paths without a leading slash", () => {
    expect(absoluteUrl("mus")).toBe(`${SITE_URL}/mus`);
  });
});

describe("breadcrumbList", () => {
  it("numbers positions from 1 and absolutizes each item", () => {
    const crumbs = breadcrumbList([
      { name: "Forside", path: "/" },
      { name: "Mus", path: "/mus" },
      { name: "Viper V3 Pro", path: "/mus/razer-viper-v3-pro" },
    ]);
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Forside", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Mus", item: `${SITE_URL}/mus` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Viper V3 Pro",
        item: `${SITE_URL}/mus/razer-viper-v3-pro`,
      },
    ]);
  });
});

describe("productItemList", () => {
  const products = [
    { slug: "a-one", navn: "A One", brand: "BrandA" },
    { slug: "b-two", navn: "B Two", brand: "BrandB" },
  ];

  // The /headset list page used to emit bare `name` entries with no Product,
  // brand, url or numberOfItems, while /mus emitted all of them. Building
  // every list page through this helper is what keeps them identical.
  it("gives every entry a full Product with brand and url", () => {
    const list = productItemList({
      name: "Alle headsets",
      description: "2 headsets",
      products,
      urlPrefix: "headset",
    });

    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "A One",
        brand: "BrandA",
        url: `${SITE_URL}/headset/a-one`,
      },
    });
    for (const entry of list.itemListElement) {
      expect(entry.item.url).toBeTruthy();
      expect(entry.item.brand).toBeTruthy();
    }
  });
});

describe("productSchema", () => {
  const base = {
    navn: "Test Mouse",
    brand: "TestBrand",
    beskrivelse: "En test-mus.",
  };

  it("absolutizes a relative image path", () => {
    const schema = productSchema({
      ...base,
      billede: "/images/mice/test.jpg",
      offers: [],
    });
    expect(schema.image).toBe(`${SITE_URL}/images/mice/test.jpg`);
  });

  it("omits image entirely when there is none", () => {
    expect(productSchema({ ...base, billede: null, offers: [] }).image).toBeUndefined();
  });

  it("drops out-of-stock offers", () => {
    const schema = productSchema({
      ...base,
      offers: [
        { retailer: "geekd", produktUrl: "https://a.test", prisDkk: 100, inStock: true },
        { retailer: "proshop", produktUrl: "https://b.test", prisDkk: 90, inStock: false },
      ],
    });
    expect(schema.offers).toHaveLength(1);
    expect(schema.offers[0].seller.name).toBe("geekd");
  });

  it("prefers the affiliate URL when present", () => {
    const schema = productSchema({
      ...base,
      offers: [
        {
          retailer: "geekd",
          produktUrl: "https://direct.test",
          affiliateUrl: "https://tracked.test",
          prisDkk: 100,
          inStock: true,
        },
      ],
    });
    expect(schema.offers[0].url).toBe("https://tracked.test");
  });

  it("omits currency when an offer carries no price", () => {
    const schema = productSchema({
      ...base,
      offers: [{ retailer: "geekd", produktUrl: "https://a.test", inStock: true }],
    });
    expect(schema.offers[0].price).toBeUndefined();
    expect(schema.offers[0].priceCurrency).toBeUndefined();
  });
});
