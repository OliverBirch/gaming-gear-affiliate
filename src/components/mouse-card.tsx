import type { Mouse } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";

const grebLabels: Record<string, string> = {
  palm: "Palm",
  claw: "Claw",
  fingertip: "Fingertip",
};

export function MouseCard({ mouse }: { mouse: Mouse }) {
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200">
      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-[#0d0d0d]">
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
      </div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/mus/${mouse.slug}`}
            className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200"
          >
            {mouse.navn}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            {mouse.brand}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs font-mono tabular-nums text-muted-foreground">
        <span>{mouse.vaegtGram}g</span>
        <span className="text-border">|</span>
        <span>{mouse.pollingHz}Hz</span>
        <span className="text-border">|</span>
        <span>{(mouse.maxDpi / 1000).toFixed(0)}K DPI</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
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
            Traadloes
          </Badge>
        )}
      </div>

      {mouse.proBrugere.length > 0 && (
        <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">
          Bruges af{" "}
          <span className="text-foreground font-medium">
            {mouse.proBrugere.length}
          </span>{" "}
          pro{mouse.proBrugere.length > 1 ? "s" : ""} -{" "}
          {mouse.proBrugere
            .slice(0, 3)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(", ")}
          {mouse.proBrugere.length > 3 && " m.fl."}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        <Link
          href={`/mus/${mouse.slug}`}
          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Se detaljer &rarr;
        </Link>
        {offer && retailer && (
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-1.5 active:scale-[0.98] transition-transform duration-150"
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
            {retailer.navn}
            {offer.prisDkk && <>&nbsp;{offer.prisDkk} kr.</>}
          </a>
        )}
      </div>
    </div>
  );
}
