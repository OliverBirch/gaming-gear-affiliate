import Link from "next/link";
import Script from "next/script";
import { MouseCard } from "@/components/mouse-card";
import { ProAvatar } from "@/components/pro-avatar";
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
    <>
    <div className="mx-auto max-w-5xl px-4">
      <section className="mb-24 pt-20 pb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight leading-tight">
            Hvilken mus bruger{" "}
            <span className="text-primary">pros i esport</span>?
          </h1>
          <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Se pr&aelig;cis hvilke gaming-mus dine favorit CS2-, Valorant- og
            LoL-pros bruger - med settings, eDPI og de bedste danske priser.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/find-mus"
              className={cn(
                  buttonVariants({ size: "lg" }),
                  "active:scale-[0.98] transition-transform duration-150"
                )}
            >
              Find din mus
            </Link>
            <Link
              href="/cs2"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              CS2 pros &rarr;
            </Link>
          </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Mest brugte mus hos CS2-pros
          </h2>
          <Link
            href="/cs2"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            Se alle CS2-mus &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">
          Mest sete pros i CS2
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pros.slice(0, 6).map((pro) => (
            <Link
              key={pro.slug}
              href={`/pro/${pro.slug}`}
              className="group flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
            >
              <ProAvatar navn={pro.navn} slug={pro.slug} />
              <div className="min-w-0">
                <div className="font-semibold truncate group-hover:text-primary transition-colors duration-200">
                  {pro.navn}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {pro.hold} &middot; {pro.settings.dpi} DPI &middot;{" "}
                  {pro.settings.edpi} eDPI
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20 text-center">
        <h2 className="mb-10 text-2xl font-bold tracking-tight">
          S&aring;dan fungerer det
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card p-7 text-center hover:border-primary/20 transition-colors duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
              1
            </div>
            <h3 className="mb-2 font-semibold">V&aelig;lg dit spil</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start med at v&aelig;lge hvilket esport du spiller. Vi har data
              p&aring; de st&oslash;rste spil.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-7 text-center hover:border-primary/20 transition-colors duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
              2
            </div>
            <h3 className="mb-2 font-semibold">Se hvad pros bruger</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se pr&aelig;cis hvilke mus, DPI og eDPI indstillinger pros i dit
              spil k&oslash;rer.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-7 text-center hover:border-primary/20 transition-colors duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
              3
            </div>
            <h3 className="mb-2 font-semibold">Find bedste pris</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vi viser dig den bedste danske pris - klik og k&oslash;b hos
              Proshop, MaxGaming eller Computersalg.
            </p>
          </div>
        </div>
      </section>
      </div>

      <Script
        id="schema-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ProMus.dk",
            url: "https://prosetups.dk",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://prosetups.dk/find-mus",
              },
              "query-input": "required",
            },
          }),
        }}
      />
    </>
  );
}
