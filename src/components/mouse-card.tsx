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
    <div className="group rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:border-primary/30 hover:shadow-[0_0_20px_-8px_oklch(0.65_0.18_210/0.3)] transition-all duration-200">
      <div className="relative mb-4 h-36 w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]">
        {mouse.billede ? (
          <Image
            src={mouse.billede}
            alt={mouse.navn}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl font-bold text-primary/10">
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
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {mouse.brand}
          </div>
        </div>
        <Badge
          className={cn(
            "shrink-0",
            mouse.prisNiveau === "flagship"
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {mouse.vaegtGram}g
        </Badge>
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
            Trådløs
          </Badge>
        )}
      </div>

      {mouse.proBrugere.length > 0 && (
        <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">
          Bruges af{" "}
          <span className="text-foreground font-medium">
            {mouse.proBrugere.length}
          </span>{" "}
          pro{mouse.proBrugere.length > 1 ? "s" : ""} &mdash;{" "}
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
              "shadow-[0_0_12px_-4px_oklch(0.65_0.18_210/0.3)] hover:shadow-[0_0_20px_-4px_oklch(0.65_0.18_210/0.5)] transition-shadow duration-300 gap-1.5"
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
