import type { Readable } from "stream";
import type { NormalizedFeedItem } from "../types";

/** Proshop + Geek'd (both Partner-Ads) — the same retailer-custom XML
 * dialect: <produkt>/kategorinavn/brand/produktnavn/ean/nypris/lagerantal/
 * billedurl/vareurl (product URL via a `?htmlurl=` query param), served
 * latin1-encoded. Streams chunk-by-chunk scanning for complete
 * <produkt>...</produkt> blocks, mirroring scripts/match-proshop-eans.mjs's
 * existing (already-correct) streaming approach.
 */

export interface PartnerAdsAdapterOptions {
  /** Geek'd's titles all end in a site-branding suffix (" - GEEKD.dk") that
   * would otherwise skew token counts or hide a real trailing variant
   * marker — stripped here when supplied. */
  stripTitleSuffix?: RegExp;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
}

function field(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}

/** Both observed real-world conventions for this field: a raw stock count
 * (Proshop) or an explicit "in_stock"/"out_of_stock" status string
 * (Geek'd's Shopify-sourced feed) — treated as out of stock only on an
 * unambiguous empty/zero/negative signal, in stock otherwise. */
function parseStockField(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (v === "" || v === "0" || v === "out_of_stock" || v === "false") return false;
  return true;
}

function parseItem(block: string, options: PartnerAdsAdapterOptions): NormalizedFeedItem | null {
  const productType = decodeEntities(field(block, "kategorinavn"));
  const brand = decodeEntities(field(block, "brand"));
  const rawTitle = decodeEntities(field(block, "produktnavn"));
  const title = options.stripTitleSuffix ? rawTitle.replace(options.stripTitleSuffix, "").trim() : rawTitle;
  const gtin = field(block, "ean");
  const priceRaw = field(block, "nypris");
  const parsedPrice = priceRaw ? parseFloat(priceRaw.replace(/[^\d.]/g, "")) : NaN;
  const lagerantal = field(block, "lagerantal");
  const vareurl = decodeEntities(field(block, "vareurl"));

  let produktUrl: string | null;
  try {
    produktUrl = new URL(vareurl).searchParams.get("htmlurl");
  } catch {
    return null;
  }
  if (!produktUrl || !brand || !title || !gtin) return null;

  return {
    brand,
    title,
    gtin,
    priceDkk: Number.isFinite(parsedPrice) ? parsedPrice : null,
    inStock: parseStockField(lagerantal),
    productType,
    produktUrl,
    affiliateUrl: vareurl,
  };
}

export async function parsePartnerAdsXml(
  stream: Readable,
  options: PartnerAdsAdapterOptions = {}
): Promise<NormalizedFeedItem[]> {
  const items: NormalizedFeedItem[] = [];
  let buffer = "";

  function processBuffer(isFinal: boolean): void {
    let startIdx: number;
    while ((startIdx = buffer.indexOf("<produkt>")) !== -1) {
      const endIdx = buffer.indexOf("</produkt>", startIdx);
      if (endIdx === -1) {
        if (isFinal) break;
        buffer = buffer.slice(startIdx);
        return;
      }
      const block = buffer.slice(startIdx, endIdx + "</produkt>".length);
      buffer = buffer.slice(endIdx + "</produkt>".length);
      const item = parseItem(block, options);
      if (item) items.push(item);
    }
    if (isFinal) buffer = "";
  }

  for await (const chunk of stream) {
    // Feed is latin1-encoded. A Buffer chunk (e.g. from a fetch() response
    // body) needs explicit latin1 decoding; a chunk that's already a string
    // (e.g. createReadStream(path, { encoding: "latin1" }) for local/offline
    // testing) is used as-is.
    buffer += Buffer.isBuffer(chunk) ? chunk.toString("latin1") : (chunk as string);
    processBuffer(false);
  }
  processBuffer(true);

  return items;
}
