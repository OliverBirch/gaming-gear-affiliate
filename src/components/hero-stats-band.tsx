import { Users, Package, Gamepad2 } from "lucide-react";
import type { Esport } from "@/lib/types";

interface Props {
  proCount: number;
  productCount: number;
  esports: Esport[];
}

export function HeroStatsBand({ proCount, productCount, esports }: Props) {
  const activeEsports = esports.filter((e) => e.aktiv);

  const columns = [
    {
      icon: Users,
      value: `${proCount}+`,
      label: "Pros",
    },
    {
      icon: Package,
      value: `${productCount}+`,
      label: "Produkter",
    },
    {
      icon: Gamepad2,
      value: `${activeEsports.length}+`,
      label: "Esports",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 w-full gap-y-6 gap-x-4">
          {columns.map((col, i) => (
            <div
              key={col.label}
              className="flex flex-col items-center text-center relative"
            >
              <div className="flex flex-col items-center gap-3">
                <col.icon className="size-5 text-primary" />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {col.value}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
                    {col.label}
                  </div>
                </div>
              </div>
              {i < columns.length && (
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-border/40 -mr-4" />
              )}
            </div>
          ))}

          <div className="flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5">
                {activeEsports.map((e) => (
                  <span
                    key={e.slug}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {e.navn}
                  </span>
                ))}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
                Data fra
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
