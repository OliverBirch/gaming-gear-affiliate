import type { Keyboard } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRetailer } from "@/data/retailers";

function bestKeyboardOffer(keyboard: Keyboard) {
  const inStock = keyboard.offers.filter((o) => o.inStock !== false);
  return inStock.length > 0 ? inStock[0] : null;
}

export function KeyboardCard({ keyboard, rank }: { keyboard: Keyboard; rank?: number }) {
  const offer = bestKeyboardOffer(keyboard);
  const retailer = offer ? getRetailer(offer.retailer) : null;

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

      <div className="flex items-center gap-2 mb-3 text-xs font-mono tabular-nums text-muted-foreground flex-wrap">
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
        {offer && retailer ? (
          <a
            href={offer.affiliateUrl}
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
              ? "Køb " + offer.prisDkk + " kr."
              : "Køb hos " + retailer.navn}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
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
