import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";

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
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {pros.map((pro) => (
          <Link
            key={pro.slug}
            href={`/pro/${pro.slug}`}
            className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/40 px-4 py-3 transition-all duration-200 hover:border-primary/30 hover:-translate-y-[1px] hover:bg-card/70"
          >
            <ProAvatar
              navn={pro.navn}
              slug={pro.slug}
              billede={pro.billede ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate max-w-[120px]">
                {pro.navn}
              </div>
              {pro.hold && (
                <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {pro.hold}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
