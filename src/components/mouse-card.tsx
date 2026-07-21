import type { Mouse } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";

export function MouseCard({ mouse }: { mouse: Mouse }) {
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="rounded-lg border bg-card p-5 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div>
          <Link
            href={`/mus/${mouse.slug}`}
            className="font-semibold hover:underline leading-tight"
          >
            {mouse.navn}
          </Link>
          <div className="text-xs text-muted-foreground">{mouse.brand}</div>
        </div>
        <Badge variant={mouse.prisNiveau === "flagship" ? "default" : "secondary"}>
          {mouse.vaegtGram}g
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {mouse.greb.map((g) => (
          <Badge key={g} variant="outline" className="text-xs">
            {g}
          </Badge>
        ))}
        {mouse.wireless && (
          <Badge variant="outline" className="text-xs">
            Trådløs
          </Badge>
        )}
      </div>

      {mouse.proBrugere.length > 0 && (
        <p className="text-sm text-muted-foreground mb-3">
          Bruges af {mouse.proBrugere.length} pro{
            mouse.proBrugere.length > 1 ? "s" : ""
          }{" "}
          —{" "}
          {mouse.proBrugere
            .slice(0, 3)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(", ")}
          {mouse.proBrugere.length > 3 && " m.fl."}
        </p>
      )}



      <div className="mt-auto flex items-center justify-between">
        <Link
          href={`/mus/${mouse.slug}`}
          className="text-sm text-primary hover:underline"
        >
          Se detaljer
        </Link>
        {offer && (
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Se pris hos {retailer?.navn ?? offer.retailer}
            {offer.prisDkk && ` — ${offer.prisDkk} kr.`}
          </a>
        )}
      </div>
    </div>
  );
}
