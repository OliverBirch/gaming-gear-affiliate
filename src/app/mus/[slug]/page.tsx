import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMouse } from "@/data/mice";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) return {};
  return {
    title: `${mouse.navn} — specifikationer, fordele, og priser`,
    description: `Se komplette specifikationer for ${mouse.navn}: vægt, sensor, greb, og find den bedste pris hos Proshop, MaxGaming eller Computersalg.`,
  };
}

export default async function MusPage({ params }: Props) {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) notFound();

  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; Tilbage til forsiden
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {mouse.navn}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{mouse.vaegtGram}g</Badge>
          <Badge variant="outline" className="border-border/50 text-muted-foreground">{mouse.sensor}</Badge>
          <Badge variant="outline" className="border-border/50 text-muted-foreground">{mouse.formfaktor}</Badge>
          {mouse.wireless && <Badge variant="outline" className="border-border/50 text-muted-foreground">Tr&aring;dl&oslash;s</Badge>}
          {mouse.proBrugere.length > 0 && (
            <Badge className="bg-primary/15 text-primary">
              {mouse.proBrugere.length} pro{mouse.proBrugere.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-10">
        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="text-xl font-semibold mb-4">Specifikationer</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Brand", mouse.brand],
                ["V&aelig;gt", `${mouse.vaegtGram}g`],
                ["Formfaktor", mouse.formfaktor],
                ["Sensor", mouse.sensor],
                ["Max DPI", mouse.maxDpi],
                ["Polling rate", `${mouse.pollingHz} Hz`],
                ["Prisniveau", mouse.prisNiveau],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 text-muted-foreground pr-4">{label}</td>
                  <td className="py-2.5 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-7">
          <h2 className="text-xl font-semibold mb-4">Greb</h2>
          <div className="flex flex-wrap gap-2">
            {mouse.greb.map((g) => (
              <Badge key={g} variant="outline" className="border-border/50 text-muted-foreground">
                {g === "palm" ? "Palm-greb" : g === "claw" ? "Claw-greb" : "Fingertip-greb"}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
        <h2 className="text-xl font-semibold mb-4">Fordele</h2>
        <ul className="space-y-2">
          {mouse.fordele.map((fordel, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">+</span>
              <span>{fordel}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ulemper</h2>
        <ul className="space-y-2">
          {mouse.ulemper.map((ulempe, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-destructive mt-0.5 shrink-0">&minus;</span>
              <span>{ulempe}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-7 mb-8">
        <h2 className="text-xl font-semibold mb-4">Hvem bruger den</h2>
        <p className="text-sm text-muted-foreground">
          {mouse.proBrugere.length > 0 ? (
            <>Bruges af {mouse.proBrugere.length} pro{mouse.proBrugere.length > 1 ? "s" : ""}:{" "}
              {mouse.proBrugere.map((pro, index) => (
                <span key={pro}>
                  {index > 0 && ", "}
                  <Link
                    href={`/pro/${pro}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {pro.charAt(0).toUpperCase() + pro.slice(1)}
                  </Link>
                </span>
              ))}
            </>
          ) : (
            <>Ingen pro-brugere fundet endnu.</>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        {offer && (
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(
              buttonVariants({ size: "lg" }),
              "shadow-[0_0_20px_-5px_oklch(0.65_0.18_210/0.5)] hover:shadow-[0_0_30px_-5px_oklch(0.65_0.18_210/0.7)] transition-shadow duration-300"
            )}
          >
            {offer.prisDkk
              ? `Se pris ${offer.prisDkk} kr. hos ${retailer?.navn ?? offer.retailer}`
              : "Se pris hos " + (retailer?.navn ?? offer.retailer)}
          </a>
        )}
        <Link
          href={`/`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Tilbage til forsiden
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { mice } = await import("@/data/mice");
  return mice.map((mouse) => ({ slug: mouse.slug }));
}
