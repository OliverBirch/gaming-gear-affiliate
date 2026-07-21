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

  const getProCount = () => {
    return mouse.proBrugere.length;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tilbage til forsiden
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {mouse.navn}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{mouse.vaegtGram}g</Badge>
          <Badge variant="secondary">{mouse.sensor}</Badge>
          <Badge variant="secondary">{mouse.formfaktor}</Badge>
          {mouse.wireless && <Badge>Trådløs</Badge>}
          {mouse.proBrugere.length > 0 && (
            <Badge variant="default">
              {mouse.proBrugere.length} pro{ mouse.proBrugere.length > 1 ? "s" : "" }
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Specifikationer</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Brand", mouse.brand],
                ["Vægt", `${mouse.vaegtGram}g`],
                ["Formfaktor", mouse.formfaktor],
                ["Sensor", mouse.sensor],
                ["Max DPI", mouse.maxDpi],
                ["Polling rate", `${mouse.pollingHz} Hz`],
                ["Prisniveau", mouse.prisNiveau],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground pr-4">{label}</td>
                  <td className="py-2 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Greb</h2>
          <div className="flex flex-wrap gap-2">
            {mouse.greb.map((g) => (
              <Badge key={g} variant="outline">
                {g === "palm" ? "Palm-greb" : g === "claw" ? "Claw-greb" : "Fingertip-greb"}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Fordele</h2>
        <ul className="list-disc pl-5 space-y-2">
          {mouse.fordele.map((fordel, index) => (
            <li key={index} className="text-sm">{fordel}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border bg-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ulemper</h2>
        <ul className="list-disc pl-5 space-y-2">
          {mouse.ulemper.map((ulempe, index) => (
            <li key={index} className="text-sm">{ulempe}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Hvem bruger den</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {mouse.proBrugere.length > 0 ? (
            <>Bruger af {mouse.proBrugere.length} pro{ mouse.proBrugere.length > 1 ? "s" : "" }
              {mouse.proBrugere.map((pro, index) => (
                <Link
                  key={pro}
                  href={`/pro/${pro}`}
                  className="text-primary hover:underline"
                >
                  {index > 0 && ", "}
                  {pro.charAt(0).toUpperCase() + pro.slice(1)}
                </Link>
              ))}
            </>
          ) : (
            <>. Ingen pro-brugere fundet endnu.</>
          )}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        {offer && (
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(buttonVariants({ size: "lg" }))}
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
