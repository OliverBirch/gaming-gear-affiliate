import type { Metadata } from "next";
import Link from "next/link";
import { ProAvatar } from "@/components/pro-avatar";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { esports } from "@/data/esports";

export const metadata: Metadata = {
  title: "Alle pros",
  description: "Se alle CS2- og Valorant-pros på ProSetups.dk — deres mus, DPI, eDPI og settings.",
};

export default function ProsPage() {
  const esportPros = esports
    .filter((e) => e.aktiv)
    .map((e) => ({
      esport: e,
      pros: pros.filter((p) => p.esport === e.slug),
    }))
    .filter((e) => e.pros.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle pros</h1>
      <p className="text-muted-foreground mb-10">
        {pros.length} pros p&aring; tv&aelig;rs af{" "}
        {esportPros.length} spil
      </p>

      {esportPros.map(({ esport, pros: esportProList }) => (
        <section key={esport.slug} className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {esport.navn}
            </h2>
            <Link
              href={`/${esport.slug}`}
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Se alle &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50">
              <span>Spiller</span>
              <span>Indstillinger</span>
              <span>Mus</span>
            </div>
            {esportProList.map((pro) => {
              const mouse = mice.find((m) => m.slug === pro.musSlug);
              return (
                <Link
                  key={pro.slug}
                  href={`/pro/${pro.slug}`}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProAvatar navn={pro.navn} slug={pro.slug} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{pro.navn}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {pro.hold}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-muted-foreground sm:justify-end">
                    <span>{pro.settings.dpi} DPI</span>
                    <span className="text-border">|</span>
                    <span>{pro.settings.edpi} eDPI</span>
                    {pro.settings.pollingHz && (
                      <>
                        <span className="text-border">|</span>
                        <span>{pro.settings.pollingHz} Hz</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    {mouse ? (
                      <span className="text-sm font-medium text-primary">
                        {mouse.navn}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
