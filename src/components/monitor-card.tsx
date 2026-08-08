import type { Monitor } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffers } from "@/lib/affiliate";

export async function MonitorCard({ monitor }: { monitor: Monitor }) {
  const resolvedOffers = await bestOffers(monitor);
  const lowestPrice = resolvedOffers.reduce((min, o) => {
    if (o.prisDkk != null && o.prisDkk < min) return o.prisDkk;
    return min;
  }, Infinity);
  const hasPrice = lowestPrice !== Infinity;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <Link
        href={"/skaerme/" + monitor.slug}
        className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-[#0d0d0d]"
      >
        {monitor.billede ? (
          <Image
            src={monitor.billede}
            alt={monitor.navn}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl font-bold text-foreground/5">
              {monitor.navn.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </Link>

      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <Link
            href={"/skaerme/" + monitor.slug}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {monitor.navn}
          </Link>
          {" "}
          <span className="text-xs text-muted-foreground">
            {monitor.brand}
          </span>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
          {monitor.prisNiveau === "budget" ? "Budget" : monitor.prisNiveau === "mid" ? "Mellem" : "Flagship"}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
        <span>{monitor.stoerrelseTommer}&quot;</span>
        <span>{monitor.oploesning}</span>
        <span>{monitor.opdateringsHz} Hz</span>
        <span>{monitor.paneltype}</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-auto">
        {monitor.beskrivelse}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">
          {hasPrice ? `${lowestPrice} kr.` : "-"}
        </span>
        <Link
          href={"/skaerme/" + monitor.slug}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "text-xs"
          )}
        >
          Se specifikationer
        </Link>
      </div>
    </div>
  );
}
