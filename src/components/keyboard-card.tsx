import type { Keyboard } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffers } from "@/lib/affiliate";

export function KeyboardCard({ keyboard, rank }: { keyboard: Keyboard; rank?: number }) {
  const resolvedOffers = bestOffers(keyboard);
  const lowestPrice = resolvedOffers.reduce((min, o) => {
    if (o.prisDkk != null && o.prisDkk < min) return o.prisDkk;
    return min;
  }, Infinity);
  const hasPrice = lowestPrice !== Infinity;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <Link
        href={"/tastaturer/" + keyboard.slug}
        className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-[#0d0d0d]"
      >
        {keyboard.billede ? (
          <Image
            src={keyboard.billede}
            alt={keyboard.navn}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl font-bold text-foreground/5">
              {keyboard.navn.charAt(0).toUpperCase()}
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
            href={"/tastaturer/" + keyboard.slug}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {keyboard.navn}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            {keyboard.brand}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs font-sans tabular-nums text-muted-foreground flex-wrap">
        <span className="text-foreground font-semibold">
          {keyboard.switchType.includes("Hall") ? "HE" : keyboard.switchType.includes("Optical") ? "Opt" : "Mek"}
        </span>
        <span className="text-border/50">/</span>
        <span>{keyboard.formfaktor}</span>
        <span className="text-border/50">/</span>
        <span>{keyboard.pollingHz >= 1000 ? (keyboard.pollingHz / 1000) + "K Hz" : keyboard.pollingHz + " Hz"}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {keyboard.wireless && (
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            Trådløs
          </Badge>
        )}
        {keyboard.hotSwappable && (
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            Hot-swap
          </Badge>
        )}
        <Badge
          className={cn(
            "text-xs border-0",
            keyboard.prisNiveau === "budget"
              ? "bg-green-500/10 text-green-400"
              : keyboard.prisNiveau === "mid"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-sky-500/10 text-sky-400"
          )}
        >
          {keyboard.prisNiveau === "budget" ? "Budget" : keyboard.prisNiveau === "mid" ? "Mellem" : "Flagship"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed line-clamp-2">
        {keyboard.beskrivelse}
      </p>

      <div className="mt-auto pt-2">
        {resolvedOffers.length > 0 ? (
          <Link
            href={"/tastaturer/" + keyboard.slug}
            className={cn(
              buttonVariants({ variant: "purchase", size: "sm" }),
              "w-full active:scale-[0.98] transition-transform duration-150"
            )}
          >
            {hasPrice ? "Se bedste pris (fra " + lowestPrice + " kr.)" : "Se bedste pris"}
          </Link>
        ) : (
          <Link
            href={"/tastaturer/" + keyboard.slug}
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
