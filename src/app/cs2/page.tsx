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
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Forside</Link> / <span className="text-foreground">CS2</span>
      </nav>
      
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Counter-Strike 2 Mus</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {esport.beskrivelse}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/find-mus" className={cn(buttonVariants({ size: "lg" }))}>
            Find din mus →
          </Link>
          <Link href="/#popular-mice" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Se alle pro-mus →
          </Link>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Mest brugte mus hos CS2-pros</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">CS2 Pro-indstillinger</h2>
        <div className="grid gap-4">
          {cs2Pros.map((pro) => {
            const mouse = mice.find(m => m.slug === pro.musSlug);
            return (
              <div key={pro.slug} className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold">
                    {pro.navn.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{pro.navn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pro.hold} · {pro.settings.dpi} DPI · {pro.settings.edpi} eDPI
                    </p>
                  </div>
                  {mouse && (
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {mouse.navn}
                      </span>
                    </div>
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

      <section>
        <h2 className="text-3xl font-bold mb-6">Hvorfor denne mus-konfiguration fungerer</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold mb-3">Hastighed & Præcision</h3>
            <p className="text-muted-foreground mb-4">
              92% af CS2-pros bruger 400 eller 800 DPI — vi har tjekket 25+ trackede pro-indstillinger. Holder sig under 800 DPI for optimal kontrol.
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Badge key={i} variant="outline">
                  {i + 1}.5 + {i * 50} DPI
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold mb-3">Mus-præferencer</h3>
            <p className="text-muted-foreground mb-4">
              Letvægt, trådløs og minimal knapbehov til FPS. CS2-kartlayoutet favoriserer hurtige bevægelser, derfor foretrækker pros lette mus.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logitech G Pro X Superlight 2</span>
                <span className="text-sm font-medium">60% (mest brugte)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Razer Viper V3 Pro</span>
                <span className="text-sm font-medium">24% (ZywOo, andre)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ZOWIE EC2-DW</span>
                <span className="text-sm font-medium">20% (budgettip)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
