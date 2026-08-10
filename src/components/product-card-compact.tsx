import Link from "next/link";
import { ProductImage } from "@/components/product-image";

interface Props {
  href: string;
  billede?: string | null;
  navn: string;
  brand: string;
  rank: number;
  proCount: number;
  sharePct: number;
}

export function ProductCardCompact({ href, billede, navn, brand, rank, proCount, sharePct }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:-translate-y-[1px] transition-all duration-200"
    >
      <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
        {rank}
      </div>

      <ProductImage
        src={billede}
        alt={navn}
        className="h-20 w-24 shrink-0 rounded-lg bg-[#0d0d0d]"
        padding="xs"
        sizes="96px"
      />

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200">
          {navn}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {brand}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{proCount} pro{proCount !== 1 ? "s" : ""}</span>
          <span className="text-border">|</span>
          <span className="tabular-nums text-primary font-medium">{sharePct}%</span>
        </div>
      </div>
    </Link>
  );
}
