import type { Pro } from "@/lib/types";
import Link from "next/link";

export function ProRow({ pro, isLast }: { pro: Pro; isLast: boolean }) {
  return (
    <Link
      href={`/pro/${pro.slug}`}
      className={`group flex items-center gap-4 px-5 py-4 hover:bg-card/80 transition-all duration-200 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.18 210 / 0.2), oklch(0.55 0.15 180 / 0.1))",
          color: "oklch(0.65 0.18 210)",
        }}
      >
        {pro.navn.charAt(0).toUpperCase()}
      </div>
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
