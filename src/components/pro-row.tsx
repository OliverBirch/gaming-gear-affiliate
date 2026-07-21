import type { Pro } from "@/lib/types";
import Link from "next/link";

export function ProRow({ pro, isLast }: { pro: Pro; isLast: boolean }) {
  return (
    <Link
      href={`/pro/${pro.slug}`}
      className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors ${
        !isLast ? "border-b" : ""
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold shrink-0">
        {pro.navn.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{pro.navn}</div>
        <div className="text-xs text-muted-foreground truncate">
          {pro.hold} · {pro.land}
        </div>
      </div>
      <div className="hidden sm:block text-sm text-muted-foreground text-right shrink-0">
        <div>{pro.settings.dpi} DPI</div>
        <div className="text-xs">{pro.settings.edpi} eDPI</div>
      </div>
      <div className="text-sm font-medium text-right shrink-0">
        {pro.settings.inGameSens}
        <span className="text-xs text-muted-foreground ml-1">sens</span>
      </div>
    </Link>
  );
}
