import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPro } from "@/data/pros";
import { getMouse } from "@/data/mice";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { ProAvatar } from "@/components/pro-avatar";


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
          <ProAvatar navn={pro.navn} size="lg" />
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
          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]">
            {mouse.billede ? (
              <Image
                src={mouse.billede}
                alt={mouse.navn}
                fill
                className="object-contain p-4"
                sizes="300px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-5xl font-bold text-primary/10">
                  {mouse.navn.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
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
            {offer && (() => {
              const retailer = getRetailer(offer.retailer);
              return (
                <a
                  href={offer.affiliateUrl}
                  rel="sponsored nofollow"
                  target="_blank"
                  className={cn(
                    buttonVariants({}),
                    "shadow-[0_0_20px_-5px_oklch(0.65_0.18_210/0.5)] hover:shadow-[0_0_30px_-5px_oklch(0.65_0.18_210/0.7)] transition-shadow duration-300 gap-1.5"
                  )}
                >
                  {retailer?.logo && (
                    <Image
                      src={retailer.logo}
                      alt={retailer.navn}
                      width={16}
                      height={16}
                      className="rounded-sm object-contain"
                    />
                  )}
                  {offer.prisDkk
                    ? `Se pris ${offer.prisDkk} kr.`
                    : "Se pris"}
                </a>
              );
            })()}
            <Link
              href={`/mus/${mouse.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Se specs &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center pb-12">
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
