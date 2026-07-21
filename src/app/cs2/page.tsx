import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEsport } from "@/data/esports";
import { mice } from "@/data/mice";
import { pros } from "@/data/pros";
import { MouseCard } from "@/components/mouse-card";

export const metadata: Metadata = {
  title: "CS2 mus — bedste mus til Counter-Strike 2",
  description: "Se præcis hvilke mus CS2-pros bruger: Logitech G Pro X Superlight 2, Razer Viper V3 Pro og flere. Find den perfekte mus med de bedste danske priser.",
};

export default function Cs2Page() {
  const esport = getEsport("cs2");
  if (!esport) return null;
  
  const popularMice = mice
    .filter(m => m.proBrugere.length > 0)
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .slice(0, 3);
  
  const cs2Pros = pros
    .filter(p => p.esport === "cs2")
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">CS2</span>
      </nav>
      
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Counter-Strike 2 <span className="text-primary">Mus</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          {esport.beskrivelse}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/find-mus"
            className={cn(
              buttonVariants({ size: "lg" }),
              "shadow-[0_0_20px_-5px_oklch(0.65_0.18_210/0.5)] hover:shadow-[0_0_30px_-5px_oklch(0.65_0.18_210/0.7)] transition-shadow duration-300"
            )}
          >
            Find din mus
          </Link>
          <Link href="/cs2#alle-mus" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Se alle pro-mus &rarr;
          </Link>
        </div>
      </div>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Mest brugte mus hos CS2-pros</h2>
          <Link href="/cs2#alle-mus" className="text-sm text-primary hover:underline underline-offset-4">
            Se alle &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold tracking-tight mb-8">CS2 Pro-indstillinger</h2>
        <div className="grid gap-4">
          {cs2Pros.map((pro) => {
            const mouse = mice.find(m => m.slug === pro.musSlug);
            return (
              <div key={pro.slug} className="rounded-xl border border-border/50 bg-card p-6 hover:border-primary/20 transition-colors duration-200">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.18 210 / 0.2), oklch(0.55 0.15 180 / 0.1))",
                      color: "oklch(0.65 0.18 210)",
                    }}
                  >
                    {pro.navn.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{pro.navn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pro.hold} &middot; {pro.settings.dpi} DPI &middot; {pro.settings.edpi} eDPI
                    </p>
                  </div>
                  {mouse && (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                      {mouse.navn}
                    </Badge>
                  )}
                </div>
                
                {mouse && (
                  <div className="mt-4">
                    <MouseCard mouse={mouse} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Hvorfor denne mus-konfiguration fungerer</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h3 className="text-xl font-semibold mb-3">Hastighed &amp; Pr&aelig;cision</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              92% af CS2-pros bruger 400 eller 800 DPI &mdash; vi har tjekket 25+ trackede pro-indstillinger. Holder sig under 800 DPI for optimal kontrol.
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Badge key={i} variant="outline" className="border-border/50 text-muted-foreground">
                  {i + 1}.5 + {i * 50} DPI
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card p-7">
            <h3 className="text-xl font-semibold mb-3">Mus-pr&aelig;ferencer</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Letv&aelig;gt, tr&aring;dl&oslash;s og minimal knapbehov til FPS. CS2-kartlayoutet favoriserer hurtige bev&aelig;gelser, derfor foretr&aelig;kker pros lette mus.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logitech G Pro X Superlight 2</span>
                <span className="text-sm font-medium text-primary">60% (mest brugte)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Razer Viper V3 Pro</span>
                <span className="text-sm font-medium text-primary">24% (ZywOo, andre)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ZOWIE EC2-DW</span>
                <span className="text-sm font-medium text-primary">20% (budgettip)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
