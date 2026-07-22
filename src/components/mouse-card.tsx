import type { Mouse } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { brandSlug } from "@/data/brands";

const grebLabels: Record<string, string> = {
  palm: "Palm",
  claw: "Claw",
  fingertip: "Fingertip",
};

const formfaktorLabels: Record<string, string> = {
  ergonomisk: "Ergonomisk",
  symmetrisk: "Symmetrisk",
  ambidextrous: "Ambidextrous",
};

const haandLabels: Record<string, string> = {
  lille: "Lille",
  medium: "Medium",
  stor: "Stor",
};

export function MouseCard({ mouse, rank }: { mouse: Mouse; rank?: number }) {
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <Link
        href={`/mus/${mouse.slug}`}
        className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-[#0d0d0d]"
      >
        {mouse.billede ? (
          <Image
            src={mouse.billede}
            alt={mouse.navn}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl font-bold text-foreground/5">
              {mouse.navn.charAt(0).toUpperCase()}
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
            href={`/mus/${mouse.slug}`}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {mouse.navn}
          </Link>
          <Link
            href={`/maerke/${brandSlug(mouse.brand)}`}
            className="text-xs text-muted-foreground mt-0.5 hover:text-primary transition-colors"
          >
            {mouse.brand}
          </Link>
        </div>
        {mouse.proBrugere.length > 0 && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold tabular-nums leading-none text-primary">
              {mouse.proBrugere.length}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              pro{mouse.proBrugere.length > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs font-mono tabular-nums text-muted-foreground flex-wrap">
        <span className="text-foreground font-semibold">{mouse.vaegtGram}g</span>
        <span className="text-border/50">/</span>
        <span>{mouse.pollingHz}Hz</span>
        <span className="text-border/50">/</span>
        <span>{mouse.haandStoerrelse.map((h) => haandLabels[h] ?? h).join(", ")}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge
          className={cn(
            "text-xs border-0",
            mouse.formfaktor === "ergonomisk"
              ? "bg-sky-500/10 text-sky-400"
              : "bg-amber-500/10 text-amber-400"
          )}
        >
          {formfaktorLabels[mouse.formfaktor]}
        </Badge>
        {mouse.greb.map((g) => (
          <Badge
            key={g}
            variant="outline"
            className="text-xs border-border/50 text-muted-foreground"
          >
            {grebLabels[g] ?? g}
          </Badge>
        ))}
        {mouse.wireless && (
          <Badge
            variant="outline"
            className="text-xs border-border/50 text-muted-foreground"
          >
            Trådløs
          </Badge>
        )}
      </div>

      {mouse.proBrugere.length > 0 && (
        <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">
          Bruges af{" "}
          {mouse.proBrugere
            .slice(0, 3)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(", ")}
          {mouse.proBrugere.length > 3 && (
            <>
              {" "}&amp;{" "}
              <span className="text-foreground font-medium">
                {mouse.proBrugere.length - 3} flere
              </span>
            </>
          )}
        </p>
      )}

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
              ? `Køb ${offer.prisDkk} kr.`
              : `Køb hos ${retailer.navn}`}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        ) : (
          <Link
            href={`/mus/${mouse.slug}`}
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
