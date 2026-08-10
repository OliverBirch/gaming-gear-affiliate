import type { Mouse } from "@/lib/types";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { bestOffers } from "@/lib/affiliate";

interface Props {
  mouse: Mouse;
  rank?: number;
  sharePct?: number;
  proCount?: number;
}

export async function MouseCardCompact({ mouse, rank, sharePct, proCount }: Props) {
  const resolvedOffers = await bestOffers(mouse);
  const lowestPrice = resolvedOffers.reduce((min, o) => {
    if (o.prisDkk != null && o.prisDkk < min) return o.prisDkk;
    return min;
  }, Infinity);
  const hasPrice = lowestPrice !== Infinity;

  return (
    <Link
      href={`/mus/${mouse.slug}`}
      className="group relative flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200"
    >
      {rank && (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
          {rank}
        </div>
      )}

      <ProductImage
        src={mouse.billede}
        alt={mouse.navn}
        className="h-20 w-24 shrink-0 rounded-lg bg-[#0d0d0d]"
        padding="xs"
        sizes="96px"
      />

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200">
          {mouse.navn}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {mouse.brand}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{mouse.vaegtGram}g</span>
          {proCount != null && (
            <>
              <span className="text-border">|</span>
              <span className="tabular-nums">{proCount} pro{proCount !== 1 ? "s" : ""}</span>
            </>
          )}
          {sharePct != null && (
            <>
              <span className="text-border">|</span>
              <span className="tabular-nums text-primary font-medium">{sharePct}%</span>
            </>
          )}
          {hasPrice && (
            <>
              <span className="text-border">|</span>
              <span className="tabular-nums">{lowestPrice} kr.</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
