import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPro } from "@/data/pros";
import { getMouse } from "@/data/mice";
import { bestOffer } from "@/lib/affiliate";


interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) return {};
  return {
    title: `${pro.navn} — mus, settings og DPI`,
    description: `Se ${pro.navn}s gaming-mus, DPI, in-game sens og eDPI. Få den bedste pris på ${pro.navn}s mus hos danske forhandlere.`,
  };
}

export default async function ProPage({ params }: Props) {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) notFound();

  const mouse = getMouse(pro.musSlug);
  if (!mouse) notFound();

  const offer = bestOffer(mouse);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href={`/${pro.esport}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; Tilbage til {pro.esport.toUpperCase()}
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-5 mb-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 210 / 0.2), oklch(0.55 0.15 180 / 0.1))",
              color: "oklch(0.65 0.18 210)",
            }}
          >
            {pro.navn.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{pro.navn}</h1>
            <p className="text-muted-foreground">
              {pro.hold} &middot; {pro.land} &middot;{" "}
              {new Date(pro.sidstVerificeret).toLocaleDateString("da-DK")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="mb-5 text-lg font-semibold">Settings</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Mus", mouse.navn],
                ["DPI", `${pro.settings.dpi}`],
                ["In-game sens", `${pro.settings.inGameSens}`],
                ["eDPI", `${pro.settings.edpi}`],
                [
                  "Polling rate",
                  pro.settings.pollingHz ? `${pro.settings.pollingHz} Hz` : "\u2014",
                ],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 text-muted-foreground pr-4">{label}</td>
                  <td className="py-2.5 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-xs text-muted-foreground">
            Kilde: {pro.kilde} &middot; Sidst verificeret{" "}
            {new Date(pro.sidstVerificeret).toLocaleDateString("da-DK")}
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="mb-5 text-lg font-semibold">Om {pro.navn}s mus</h2>
          <Link
            href={`/mus/${mouse.slug}`}
            className="text-xl font-semibold block mb-3 hover:text-primary transition-colors"
          >
            {mouse.navn}
          </Link>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{mouse.vaegtGram}g</Badge>
            <Badge variant="outline" className="border-border/50 text-muted-foreground">{mouse.sensor}</Badge>
            {mouse.wireless && <Badge variant="outline" className="border-border/50 text-muted-foreground">Tr&aring;dl&oslash;s</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {mouse.beskrivelse}
          </p>
          <div className="flex gap-3">
            {offer && (
              <a
                href={offer.affiliateUrl}
                rel="sponsored nofollow"
                target="_blank"
                className={cn(
                  buttonVariants({}),
                  "shadow-[0_0_20px_-5px_oklch(0.65_0.18_210/0.5)] hover:shadow-[0_0_30px_-5px_oklch(0.65_0.18_210/0.7)] transition-shadow duration-300"
                )}
              >
                {offer.prisDkk
                  ? `Se pris ${offer.prisDkk} kr.`
                  : "Se pris"}
              </a>
            )}
            <Link
              href={`/mus/${mouse.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Se specs &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/mus/${mouse.slug}`}
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          Se flere detaljer om {mouse.navn} &rarr;
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { pros } = await import("@/data/pros");
  return pros.map((p) => ({ slug: p.slug }));
}
