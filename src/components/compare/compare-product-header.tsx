import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mouse } from "@/lib/types";
import { mouseLowestPriceLabel } from "@/lib/compare/mice";

export function CompareProductHeader({ mouse }: { mouse: Mouse }) {
  const priceLabel = mouseLowestPriceLabel(mouse);
  const proCount = mouse.proBrugere.length;

  return (
    <div className="flex flex-col items-center text-center gap-3 p-4 min-w-0">
      <Link
        href={`/mus/${mouse.slug}`}
        className="relative h-28 w-full max-w-[140px] rounded-lg bg-[#0d0d0d] overflow-hidden group"
      >
        {mouse.billede ? (
          <Image
            src={mouse.billede}
            alt={mouse.navn}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            sizes="140px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-3xl font-bold text-foreground/5">
              {mouse.navn.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
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
      <div className="h-28 w-full max-w-[140px] rounded-lg border border-dashed border-border/60 bg-muted/20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
