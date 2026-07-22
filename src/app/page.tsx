import Link from "next/link";
import Script from "next/script";
import { MouseCard } from "@/components/mouse-card";
import { KeyboardCard } from "@/components/keyboard-card";
import { MousepadCard } from "@/components/mousepad-card";
import { ProAvatar } from "@/components/pro-avatar";
import { mice } from "@/data/mice";
import { keyboards } from "@/data/keyboards";
import { mousepads } from "@/data/mousepads";
import { pros } from "@/data/pros";
import { esports } from "@/data/esports";
import { getBrands } from "@/data/brands";
import { guides } from "@/data/guides";
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
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Hvilken mus bruger{" "}
            <span className="text-primary">pros i esport</span>?
          </h1>
          <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Se pr&aelig;cis hvilke gaming-mus dine favorit CS2- og
            Valorant-pros bruger - med settings, eDPI og de bedste danske priser.
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
              href="/pros"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Se alle pros &rarr;
            </Link>
          </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Mest brugte mus p&aring; tv&aelig;rs af spil
          </h2>
          <Link
            href="/mus"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Se alle {mice.length}&nbsp;mus &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Tastaturer
          </h2>
          <Link
            href="/tastaturer"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Se alle {keyboards.length}&nbsp;tastaturer &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {keyboards.slice(0, 3).map((kb) => (
            <KeyboardCard key={kb.slug} keyboard={kb} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Musemåtter
          </h2>
          <Link
            href="/musemaatter"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Se alle {mousepads.length}&nbsp;musemåtter &rarr;
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mousepads.slice(0, 3).map((mp) => (
            <MousepadCard key={mp.slug} mousepad={mp} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">
          Mest sete pros
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
        <div className="mt-6 text-center">
          <Link
            href="/pros"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Se alle {pros.length} pros &rarr;
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-center">
          V&aelig;lg dit spil
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {esports.filter((e) => e.aktiv).map((e) => (
            <Link
              key={e.slug}
              href={`/${e.slug}`}
              className="group rounded-xl border border-border/50 bg-card p-7 hover:border-primary/30 transition-all duration-200"
            >
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {e.navn}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {e.beskrivelse}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">
                Se mus &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
          Mærker
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {getBrands().sort((a, b) => b.antalMus - a.antalMus).map((brand) => (
            <Link
              key={brand.slug}
              href={`/maerke/${brand.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-medium hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
            >
              {brand.logo && (
                <img src={brand.logo} alt="" className="h-5 w-auto object-contain" />
              )}
              {brand.navn}
              <span className="text-xs text-muted-foreground">{brand.antalMus}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">
          Købsguides
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Hjælp til at vælge den rigtige mus
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-xl border border-border/50 bg-card p-5 text-center hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200"
            >
              <div className="mb-2 text-2xl">{guide.emoji}</div>
              <h3 className="mb-1 font-semibold group-hover:text-primary transition-colors">{guide.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>
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
            name: "ProSetups.dk",
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
