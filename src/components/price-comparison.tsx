import Image from "next/image";
import { cn, formatPriceDkk } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AffiliateLink } from "@/components/affiliate-link";
import { getRetailer } from "@/data/retailers";
import { bestOffers, getLowestPrice } from "@/lib/affiliate";
import type { OfferableProduct } from "@/lib/types";

/** Shared "Sammenlign priser" label, with or without a known lowest price. */
function priceLabel(lowestPrice: number | null): string {
  return lowestPrice != null ? `Sammenlign priser (fra ${formatPriceDkk(lowestPrice)})` : "Sammenlign priser";
}

/** Hero CTA anchor scrolling down to the #priser price list. Renders nothing without offers. */
export async function PriceCta({ product }: { product: OfferableProduct }) {
  const allOffers = await bestOffers(product);
  if (allOffers.length === 0) return null;

  const label = priceLabel(await getLowestPrice(product));

  return (
    <a
      href="#priser"
      className={cn(
        buttonVariants({ variant: "cta", size: "lg" }),
        "gap-1.5 active:scale-[0.98] transition-transform duration-150"
      )}
    >
      <span className="btn-main-text-container">
        <span className="btn-main-text">{label}</span>
      </span>
    </a>
  );
}

/**
 * The #priser price list plus the sticky mobile bottom CTA bar. Bundled
 * together since the sticky bar is fixed-positioned and needs no separate
 * placement in the page layout. Renders nothing without offers.
 */
export async function PriceComparison({ product, pagePath }: { product: OfferableProduct; pagePath: string }) {
  const allOffers = await bestOffers(product);
  if (allOffers.length === 0) return null;

  const sorted = [...allOffers].sort((a, b) => (a.prisDkk ?? Infinity) - (b.prisDkk ?? Infinity));
  const lowest = await getLowestPrice(product);
  const ctaLabel = priceLabel(lowest);

  return (
    <>
      <div id="priser" className="rounded-xl border border-border/50 bg-card p-7 mb-8 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">
          Sammenlign priser{lowest != null ? ` (fra ${formatPriceDkk(lowest)})` : ""}
        </h2>
        <div className="space-y-3">
          {sorted.map((o) => {
            const r = getRetailer(o.retailer);
            if (!r) return null;
            const isLowest = o.prisDkk === lowest && lowest != null;
            return (
              <AffiliateLink
                key={o.retailer}
                retailer={o.retailer}
                produktUrl={o.produktUrl}
                affiliateUrl={o.affiliateUrl}
                productSlug={product.slug}
                pagePath={pagePath}
                network={r.netvaerk}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:border-primary/30 hover:-translate-y-px transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {r.logo && (
                    <Image
                      src={r.logo}
                      alt={r.navn}
                      width={20}
                      height={20}
                      className="rounded-sm object-contain"
                    />
                  )}
                  <div>
                    <span className="font-medium">{r.navn}</span>
                    {o.inStock === false && (
                      <span className="ml-2 text-xs text-destructive">Udsolgt</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {o.inStock !== false && o.prisDkk && (
                    <span className="text-xs text-muted-foreground">På lager</span>
                  )}
                  <span className={cn("text-lg font-bold tabular-nums", isLowest ? "text-purchase" : "text-primary")}>
                    {o.prisDkk ? formatPriceDkk(o.prisDkk) : "Se pris"}
                  </span>
                </div>
              </AffiliateLink>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md p-3 sm:hidden">
        <a
          href="#priser"
          className={cn(
            buttonVariants({ variant: "purchase", size: "default" }),
            "w-full gap-2 active:scale-[0.98] transition-transform duration-150 text-base"
          )}
        >
          {ctaLabel}
        </a>
      </div>
    </>
  );
}
