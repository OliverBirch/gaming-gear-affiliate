import type { Mousepad } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRetailer } from "@/data/retailers";

const glideLabels: Record<string, string> = {
  speed: "Speed",
  control: "Control",
  hybrid: "Balanced",
};

const glideColors: Record<string, string> = {
  speed: "bg-blue-500/10 text-blue-400",
  control: "bg-green-500/10 text-green-400",
  hybrid: "bg-amber-500/10 text-amber-400",
};

function bestMousepadOffer(keyboard: Mousepad) {
  const inStock = keyboard.offers.filter((o) => o.inStock !== false);
  return inStock.length > 0 ? inStock[0] : null;
}

export function MousepadCard({ mousepad, rank }: { mousepad: Mousepad; rank?: number }) {
  const offer = bestMousepadOffer(mousepad);
  const retailer = offer ? getRetailer(offer.retailer) : null;
  const sizeCount = mousepad.størrelser.length;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <Link
        href={"/musemaatter/" + mousepad.slug}
        className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/[0.04] to-primary/[0.02] flex items-center justify-center"
      >
        <div className="text-5xl font-bold text-primary/10 select-none">
          {mousepad.brand.charAt(0).toUpperCase()}
        </div>
        {rank && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
            {rank}
          </div>
        )}
      </Link>

      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <Link
            href={"/musemaatter/" + mousepad.slug}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {mousepad.brand} {mousepad.model}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            {mousepad.materiale} &middot; {sizeCount} størrelse{sizeCount > 1 ? "r" : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs font-mono tabular-nums text-muted-foreground flex-wrap">
        <span className="text-foreground font-semibold">
          {mousepad.materiale === "stof" ? "Stof" : mousepad.materiale}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge className={cn("text-xs border-0", glideColors[mousepad.type] ?? glideColors.hybrid)}>
          {glideLabels[mousepad.type] ?? glideLabels.hybrid}
        </Badge>
        <Badge
          className={cn(
            "text-xs border-0",
            mousepad.prisNiveau === "budget"
              ? "bg-green-500/10 text-green-400"
              : mousepad.prisNiveau === "mid"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-sky-500/10 text-sky-400"
          )}
        >
          {mousepad.prisNiveau === "budget" ? "Budget" : mousepad.prisNiveau === "mid" ? "Mellem" : "Flagship"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed line-clamp-2">
        {mousepad.beskrivelse}
      </p>

      <div className="mt-auto pt-2">
        {offer && retailer ? (
          <a
            href={offer.affiliateUrl ?? offer.produktUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full gap-1.5 active:scale-[0.98] transition-transform duration-150"
            )}
          >
            {retailer.logo && (
              <Image
                src={retailer.logo}
                alt={retailer.navn}
                width={16}
                height={16}
                className="rounded-sm object-contain"
              />
            )}
            {offer.prisDkk
              ? "Køb fra " + offer.prisDkk + " kr."
              : "Køb hos " + retailer.navn}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        ) : (
          <Link
            href={"/musemaatter/" + mousepad.slug}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
          >
            Se detaljer
          </Link>
        )}
      </div>
    </div>
  );
}
