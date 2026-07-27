import { Users, Mouse } from "lucide-react";
import type { Esport } from "@/lib/types";

interface Props {
  proCount: number;
  setupCount: number;
  esports: Esport[];
}

export function HeroStatsBand({
  proCount,
  setupCount,
  esports,
}: Props) {
  const activeEsports = esports.filter((e) => e.aktiv);

  const columns = [
    {
      icon: Users,
      value: `${proCount}+`,
      label: "Pros",
    },
    {
      icon: Mouse,
      value: `${setupCount}+`,
      label: "Setups",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 w-full gap-y-8 gap-x-4 sm:gap-x-0">
        {columns.map((col, i) => (
          <div
            key={col.label}
            className="flex flex-col items-center text-center relative"
          >
            <div className="flex flex-col items-center gap-2.5">
              <col.icon className="size-5 text-primary" strokeWidth={1.75} />
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {col.value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
                  {col.label}
                </div>
              </div>
            </div>
            {i < columns.length - 1 && (
              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-border/50" />
            )}
          </div>
        ))}

        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Data fra
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            {activeEsports.map((e) => {
              if (!e.decal) return null;
              return (
                <img
                  key={e.slug}
                  src={e.decal}
                  alt={e.navn}
                  className="h-4 w-auto object-contain opacity-80"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
