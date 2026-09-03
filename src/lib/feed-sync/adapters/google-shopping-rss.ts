import type { Readable } from "stream";
import type { NormalizedFeedItem } from "../types";

/** Komplett + AV-Cables (both Adtraction) — real Google Shopping RSS:
 * <item>/g:brand/g:gtin/g:price/g:availability/g:product_type (breadcrumb),
 * <link> wrapping the real product URL as a `?url=` query param.
 *
 * Streams chunk-by-chunk and scans for complete <item>...</item> blocks
 * rather than reading the whole feed into memory + one global regex exec
 * (the original scripts/match-komplett-eans.mjs's approach) — a
 * multi-megabyte feed read whole risks a serverless function's memory
 * ceiling; this never holds more than the trailing partial block.
 */

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

function parseItem(block: string): NormalizedFeedItem | null {
  const productType = decodeEntities(field(block, "g:product_type"));
  const brand = decodeEntities(field(block, "g:brand"));
  const title = decodeEntities(field(block, "title"));
  const gtin = field(block, "g:gtin");
  const priceRaw = field(block, "g:price");
  const parsedPrice = priceRaw ? parseFloat(priceRaw.replace(/[^\d.]/g, "")) : NaN;
  const availability = field(block, "g:availability");

  // The feed occasionally appends stray unencoded breadcrumb text after the
  // real tracking URL inside <link> (space-separated, not part of the URL) —
  // take only the first whitespace-delimited token as the actual link.
  const linkRaw = decodeEntities(field(block, "link")).split(/\s+/)[0] || "";

  let produktUrl: string | null;
  try {
    produktUrl = new URL(linkRaw).searchParams.get("url");
  } catch {
    return null;
  }
  if (!produktUrl || !brand || !title || !gtin) return null;

  return {
    brand,
    title,
    gtin,
    priceDkk: Number.isFinite(parsedPrice) ? parsedPrice : null,
    inStock: availability === "in_stock",
    productType,
    produktUrl,
    affiliateUrl: linkRaw,
  };
}

export async function parseGoogleShoppingRss(stream: Readable): Promise<NormalizedFeedItem[]> {
  const items: NormalizedFeedItem[] = [];
  let buffer = "";

  function processBuffer(isFinal: boolean): void {
    let startIdx: number;
    while ((startIdx = buffer.indexOf("<item>")) !== -1) {
      const endIdx = buffer.indexOf("</item>", startIdx);
      if (endIdx === -1) {
        if (isFinal) break;
        buffer = buffer.slice(startIdx);
        return;
      }
      const block = buffer.slice(startIdx, endIdx + "</item>".length);
      buffer = buffer.slice(endIdx + "</item>".length);
      const item = parseItem(block);
      if (item) items.push(item);
    }
    if (isFinal) buffer = "";
  }

  for await (const chunk of stream) {
    buffer += typeof chunk === "string" ? chunk : (chunk as Buffer).toString("utf-8");
    processBuffer(false);
  }
  processBuffer(true);

  return items;
}
