import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mouse } from "@/lib/types";
import { mouseLowestPriceLabel } from "@/lib/compare/mice";

export async function CompareProductHeader({ mouse }: { mouse: Mouse }) {
  const priceLabel = await mouseLowestPriceLabel(mouse);
  const proCount = mouse.proBrugere.length;

  return (
    <div className="flex flex-col items-center text-center gap-3 p-4 min-w-0">
      <Link href={`/mus/${mouse.slug}`} className="relative block w-full max-w-[160px]">
        <ProductImage
          src={mouse.billede}
          alt={mouse.navn}
          padding="sm"
          sizes="160px"
          className="h-32 w-full rounded-lg bg-[#0d0d0d]"
        />
      </Link>
      <div className="min-w-0 w-full">
        <Link
          href={`/mus/${mouse.slug}`}
          className="font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2"
        >
          {mouse.navn}
        </Link>
        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
          {proCount} pro{proCount === 1 ? "" : "s"}
          {priceLabel ? ` · fra ${priceLabel}` : ""}
        </p>
      </div>
      <Link
        href={`/mus/${mouse.slug}#priser`}
        className={cn(buttonVariants({ variant: "purchase", size: "sm" }), "w-full max-w-[160px]")}
      >
        Se priser
      </Link>
    </div>
  );
}

export function CompareEmptyHeader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 p-4 min-h-[200px] text-muted-foreground">
      <div className="h-32 w-full max-w-[160px] rounded-lg border border-dashed border-border/60 bg-muted/20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
