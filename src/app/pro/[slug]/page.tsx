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
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tilbage til {pro.esport.toUpperCase()}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold shrink-0">
            {pro.navn.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pro.navn}</h1>
            <p className="text-muted-foreground">
              {pro.hold} · {pro.land} ·{" "}
              {new Date(pro.sidstVerificeret).toLocaleDateString("da-DK")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Settings</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Mus", mouse.navn],
                ["DPI", `${pro.settings.dpi}`],
                ["In-game sens", `${pro.settings.inGameSens}`],
                ["eDPI", `${pro.settings.edpi}`],
                [
                  "Polling rate",
                  pro.settings.pollingHz ? `${pro.settings.pollingHz} Hz` : "—",
                ],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground pr-4">{label}</td>
                  <td className="py-2 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">
            Kilde: {pro.kilde} · Sidst verificeret{" "}
            {new Date(pro.sidstVerificeret).toLocaleDateString("da-DK")}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Om {pro.navn}s mus</h2>
          <Link
            href={`/mus/${mouse.slug}`}
            className="text-xl font-semibold hover:underline block mb-2"
          >
            {mouse.navn}
          </Link>
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="secondary">{mouse.vaegtGram}g</Badge>
            <Badge variant="secondary">{mouse.sensor}</Badge>
            {mouse.wireless && <Badge>Trådløs</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {mouse.beskrivelse}
          </p>
          <div className="flex gap-2">
            {offer && (
              <a
                href={offer.affiliateUrl}
                rel="sponsored nofollow"
                target="_blank"
                className={cn(buttonVariants({}))}
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
              Se specs →
            </Link>
          </div>
        </div>
      </div>

      <Link
        href={`/mus/${mouse.slug}`}
        className="text-sm text-primary hover:underline"
      >
        Se flere detaljer om {mouse.navn} →
      </Link>
    </div>
  );
}

export async function generateStaticParams() {
  const { pros } = await import("@/data/pros");
  return pros.map((p) => ({ slug: p.slug }));
}
