import type { Headset } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffers } from "@/lib/affiliate";

export function HeadsetCard({ headset, rank }: { headset: Headset; rank?: number }) {
  const resolvedOffers = bestOffers(headset);
  const lowestPrice = resolvedOffers.reduce((min, o) => {
    if (o.prisDkk != null && o.prisDkk < min) return o.prisDkk;
    return min;
  }, Infinity);
  const hasPrice = lowestPrice !== Infinity;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <Link
        href={"/headset/" + headset.slug}
        className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-[#0d0d0d]"
      >
        {headset.billede ? (
          <Image
            src={headset.billede}
            alt={headset.navn}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl font-bold text-foreground/5">
              {headset.navn.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        {rank && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
            {rank}
          </div>
        )}
      </Link>

      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <Link
            href={"/headset/" + headset.slug}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {headset.navn}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            {headset.brand}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs font-sans tabular-nums text-muted-foreground flex-wrap">
        <span className="text-foreground font-semibold">
          {headset.wireless ? "Trådløs" : "Kablet"}
        </span>
        <span className="text-border/50">/</span>
        <span>{headset.vaegtGram}g</span>
        <span className="text-border/50">/</span>
        <span>{headset.driverStoerrelseMm ? headset.driverStoerrelseMm + " mm" : "-"}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {headset.surroundSound && (
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            Surround
          </Badge>
        )}
        {headset.mikrofon && (
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            Mikrofon
          </Badge>
        )}
        <Badge
          className={cn(
            "text-xs border-0",
            headset.prisNiveau === "budget"
              ? "bg-green-500/10 text-green-400"
              : headset.prisNiveau === "mid"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-sky-500/10 text-sky-400"
          )}
        >
          {headset.prisNiveau === "budget" ? "Budget" : headset.prisNiveau === "mid" ? "Mellem" : "Flagship"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed line-clamp-2">
        {headset.beskrivelse}
      </p>

      <div className="mt-auto pt-2">
        {hasPrice ? (
          <Link
            href={"/headset/" + headset.slug}
            className={cn(
              buttonVariants({ variant: "purchase", size: "sm" }),
              "w-full active:scale-[0.98] transition-transform duration-150"
            )}
          >
            {"Se bedste pris (fra " + lowestPrice + " kr.)"}
          </Link>
        ) : (
          <Link
            href={"/headset/" + headset.slug}
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
