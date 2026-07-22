import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Keyboard, Headphones, Monitor, MousePointer, Square } from "lucide-react";
import { ProAvatar } from "@/components/pro-avatar";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { esports } from "@/data/esports";
import { getProPeripherals } from "@/data/pros-peripherals";
import { getKeyboardSlug, getMousepadSlug } from "@/data/pros-peripherals-mapping";

export const metadata: Metadata = {
  title: "Alle pros",
  description: "Se alle CS2- og Valorant-pros på ProSetups.dk - deres mus og udstyr.",
};

function HeaderCell({ icon: Icon, label, className }: { icon: React.ComponentType<{ className?: string }>; label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground ${className ?? ""}`}>
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
      <span className="ml-0.5 text-muted-foreground/30">&#9650;&#9660;</span>
    </div>
  );
}

export default function ProsPage() {
  const esportPros = esports
    .filter((e) => e.aktiv)
    .map((e) => ({
      esport: e,
      pros: pros.filter((p) => p.esport === e.slug),
    }))
    .filter((e) => e.pros.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">Alle pros</h1>
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
              className="text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Se alle &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(180px,1fr)_minmax(170px,1.4fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)] gap-3 px-6 py-3.5 bg-muted/50 border-b border-border/50">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Spiller</span>
              <HeaderCell icon={MousePointer} label="Mus" />
              <HeaderCell icon={Keyboard} label="Tastatur" />
              <HeaderCell icon={Square} label="Musemåtte" />
              <HeaderCell icon={Headphones} label="Headset" className="hidden lg:flex" />
              <HeaderCell icon={Monitor} label="Monitor" />
            </div>

            {esportProList.map((pro, idx) => {
              const mouse = mice.find((m) => m.slug === pro.musSlug);
              const peri = getProPeripherals(pro.slug);
              const kbSlug = getKeyboardSlug(pro.slug);
              const mpSlug = getMousepadSlug(pro.slug);

              const row = (
                <Link
                  href={`/pro/${pro.slug}`}
                  className="group grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(170px,1.4fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)] gap-3 px-6 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProAvatar navn={pro.navn} slug={pro.slug} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{pro.navn}</div>
                      {pro.hold && (
                        <div className="text-xs text-muted-foreground truncate leading-tight">{pro.hold}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center min-w-0">
                    {mouse ? (
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-150 truncate">
                        {mouse.navn}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">&mdash;</span>
                    )}
                  </div>

                  <div className="flex items-center min-w-0">
                    {peri?.keyboard ? (
                      <span className="text-sm text-muted-foreground truncate">{peri.keyboard}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">&mdash;</span>
                    )}
                  </div>

                  <div className="flex items-center min-w-0">
                    {peri?.mousepad ? (
                      <span className="text-sm text-muted-foreground truncate">{peri.mousepad}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">&mdash;</span>
                    )}
                  </div>

                  <div className="items-center min-w-0 hidden lg:flex">
                    <span className="text-sm text-muted-foreground truncate">{peri?.headset ?? "\u2014"}</span>
                  </div>

                  <div className="flex items-center min-w-0">
                    <span className="text-sm text-muted-foreground truncate">{peri?.monitor ?? "\u2014"}</span>
                  </div>
                </Link>
              );

              const card = (
                <Link
                  key={`card-${pro.slug}`}
                  href={`/pro/${pro.slug}`}
                  className={`block rounded-xl border border-border/50 p-5 hover:bg-muted/20 transition-colors duration-150 ${idx > 0 ? "mt-3" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <ProAvatar navn={pro.navn} slug={pro.slug} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{pro.navn}</div>
                      {pro.hold && <div className="text-xs text-muted-foreground truncate">{pro.hold}</div>}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {mouse && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MousePointer className="h-3 w-3 text-primary" />
                          Mus
                        </span>
                        <span className="text-sm font-medium text-right truncate max-w-[60%]">{mouse.navn}</span>
                      </div>
                    )}
                    {peri?.keyboard && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Keyboard className="h-3 w-3 text-primary" />
                          Tastatur
                        </span>
                        <span className="text-sm text-muted-foreground text-right truncate max-w-[60%]">{peri.keyboard}</span>
                      </div>
                    )}
                    {peri?.mousepad && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Square className="h-3 w-3 text-primary" />
                          Musemåtte
                        </span>
                        <span className="text-sm text-muted-foreground text-right truncate max-w-[60%]">{peri.mousepad}</span>
                      </div>
                    )}
                    {peri?.monitor && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Monitor className="h-3 w-3 text-primary" />
                          Monitor
                        </span>
                        <span className="text-sm text-muted-foreground text-right truncate max-w-[60%]">{peri.monitor}</span>
                      </div>
                    )}
                    {peri?.headset && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Headphones className="h-3 w-3 text-primary" />
                          Headset
                        </span>
                        <span className="text-sm text-muted-foreground text-right truncate max-w-[60%]">{peri.headset}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );

              return (
                <div key={pro.slug}>
                  <div className="hidden md:block">{row}</div>
                  <div className="md:hidden">{card}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Alle pros", item: "https://prosetups.dk/pros" },
            ],
          }),
        }}
      />
      <Script
        id="schema-pros-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alle pros",
            description: `${pros.length} pros p\u00E5 tv\u00E6rs af ${esportPros.length} spil`,
            itemListElement: pros.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                name: p.navn,
                url: `https://prosetups.dk/pro/${p.slug}`,
              },
            })),
            numberOfItems: pros.length,
          }),
        }}
      />
    </div>
  );
}
