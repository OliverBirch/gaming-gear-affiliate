import Link from "next/link";
import { MouseCard } from "@/components/mouse-card";
import { mice } from "@/data/mice";
import { pros } from "@/data/pros";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const popularMice = mice
    .filter((m) => m.proBrugere.length > 0)
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Hvilken mus bruger pros i esport?
        </h1>
        <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
          Se præcis hvilke gaming-mus dine favorit CS2-, Valorant- og
          LoL-pros bruger — med settings, eDPI og de bedste danske priser.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/find-mus" className={cn(buttonVariants({ size: "lg" }))}>
            Find din mus
          </Link>
          <Link href="/cs2" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            CS2 pros →
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold">Mest brugte mus hos CS2-pros</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/cs2" className={cn(buttonVariants({ variant: "link" }))}>
            Se alle CS2-mus →
          </Link>
        </div>
      </section>

      <section className="mb-16 rounded-lg bg-muted p-8">
        <h2 className="mb-4 text-2xl font-semibold">Mest sete pros i CS2</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pros.slice(0, 6).map((pro) => (
            <Link
              key={pro.slug}
              href={`/pro/${pro.slug}`}
              className="flex items-center gap-3 rounded-md border bg-background p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                {pro.navn.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{pro.navn}</div>
                <div className="text-xs text-muted-foreground">
                  {pro.hold} · {pro.settings.dpi} DPI ·{" "}
                  {pro.settings.edpi} eDPI
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-semibold">Sådan fungerer det</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-3 text-3xl font-bold text-primary">1</div>
            <h3 className="mb-2 font-medium">Vælg dit spil</h3>
            <p className="text-sm text-muted-foreground">
              Start med at vælge hvilket esport du spiller. Vi har data på de
              største spil.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-3 text-3xl font-bold text-primary">2</div>
            <h3 className="mb-2 font-medium">Se hvad pros bruger</h3>
            <p className="text-sm text-muted-foreground">
              Se præcis hvilke mus, DPI og eDPI indstillinger pros i dit spil
              kører.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-3 text-3xl font-bold text-primary">3</div>
            <h3 className="mb-2 font-medium">Find bedste pris</h3>
            <p className="text-sm text-muted-foreground">
              Vi viser dig den bedste danske pris — klik og køb hos Proshop,
              MaxGaming eller Computersalg.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
