import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";
import { getTeamLogo } from "@/data/team-logos";

interface FeaturedPro {
  slug: string;
  navn: string;
  hold?: string | null;
  billede?: string | null;
}

interface Props {
  pros: FeaturedPro[];
}

export function HeroFeaturedPros({ pros }: Props) {
  if (pros.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-center gap-2">
        <span
          className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.717_0.176_22.6/0.8)]"
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top pros lige nu
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {pros.map((pro) => {
          const logo = getTeamLogo(pro.hold);
          return (
            <Link
              key={pro.slug}
              href={`/pro/${pro.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-border/40 bg-card/50 px-3.5 py-2.5 backdrop-blur-sm transition-all duration-200 hover:border-primary/35 hover:-translate-y-[1px] hover:bg-card/80"
            >
              <ProAvatar
                navn={pro.navn}
                slug={pro.slug}
                billede={pro.billede ?? undefined}
                size="sm"
              />
              <div className="min-w-0 pr-0.5">
                <div className="text-sm font-semibold leading-tight truncate max-w-[9rem] group-hover:text-primary transition-colors">
                  {pro.navn}
                </div>
                {pro.hold && (
                  <div className="text-[11px] text-muted-foreground truncate max-w-[9rem]">
                    {pro.hold}
                  </div>
                )}
              </div>
              {logo && (
                <img
                  src={logo}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain opacity-90 shrink-0 rounded-sm"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
