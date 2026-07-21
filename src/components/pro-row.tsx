import type { Pro } from "@/lib/types";
import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";

export function ProRow({ pro, isLast }: { pro: Pro; isLast: boolean }) {
  return (
    <Link
      href={`/pro/${pro.slug}`}
      className={`group flex items-center gap-4 px-5 py-4 hover:bg-card/80 transition-all duration-200 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      <ProAvatar navn={pro.navn} slug={pro.slug} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate group-hover:text-primary transition-colors duration-200">
          {pro.navn}
        </div>
        <div className="text-xs text-muted-foreground/70 truncate">
          {pro.hold} &middot; {pro.land}
        </div>
      </div>
      <div className="hidden sm:block text-sm text-right shrink-0">
        <div className="text-muted-foreground">{pro.settings.dpi} DPI</div>
        <div className="text-xs text-muted-foreground/60">{pro.settings.edpi} eDPI</div>
      </div>
      <div className="text-sm font-medium text-right shrink-0 text-muted-foreground">
        {pro.settings.inGameSens}
        <span className="text-xs text-muted-foreground/60 ml-1">sens</span>
      </div>
    </Link>
  );
}
