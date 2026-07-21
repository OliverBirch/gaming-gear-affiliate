import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getMouse } from "@/data/mice";
import { getProsByMouse } from "@/data/pros";
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
    title: `${mouse.navn} — test, specs og priser`,
    description: `Se ${mouse.navn} specifikationer, vægt, sensor, og hvilke CS2-pros der bruger den. Sammenlign priser hos Proshop, MaxGaming og Computersalg.`,
  };
}

export default async function MousePage({ params }: Props) {
  const { slug } = await params;
  const mouse = getMouse(slug);
  if (!mouse) notFound();

  const pros = getProsByMouse(slug);
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/cs2"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tilbage til CS2
      </Link>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="mb-1 text-3xl font-bold tracking-tight">
            {mouse.navn}
          </h1>
          <p className="text-muted-foreground">{mouse.brand}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Badge variant="secondary">{mouse.vaegtGram}g</Badge>
          <Badge variant="secondary">{mouse.sensor}</Badge>
          <Badge variant="secondary">{mouse.pollingHz}Hz</Badge>
          <Badge variant="secondary">{mouse.formfaktor}</Badge>
          {mouse.wireless && <Badge>Trådløs</Badge>}
        </div>
      </div>

      <p className="mb-8 text-muted-foreground max-w-2xl">
        {mouse.beskrivelse}
      </p>

      {offer && retailer && (
        <div className="mb-8 rounded-lg border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Bedste pris</p>
            <p className="text-lg font-semibold">
              {offer.prisDkk ? `${offer.prisDkk} kr.` : "Se pris"} hos {retailer.navn}
            </p>
          </div>
          <a
            href={offer.affiliateUrl}
            rel="sponsored nofollow"
            target="_blank"
            className={cn(buttonVariants({}))}
          >
            Se pris hos {retailer.navn} →
          </a>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2 mb-8">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Specifikationer</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Vægt", `${mouse.vaegtGram}g`],
                ["Sensor", mouse.sensor],
                ["Max DPI", mouse.maxDpi.toLocaleString()],
                ["Polling rate", `${mouse.pollingHz} Hz`],
                ["Forbindelse", mouse.wireless ? "Trådløs" : "Kablet"],
                ["Formfaktor", mouse.formfaktor],
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

        <div>
          <h2 className="mb-3 text-lg font-semibold">Greb og håndstørrelse</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Greb</p>
              <div className="flex flex-wrap gap-1">
                {mouse.greb.map((g) => (
                  <Badge key={g} variant="outline">{g}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Håndstørrelse</p>
              <div className="flex flex-wrap gap-1">
                {mouse.haandStoerrelse.map((h) => (
                  <Badge key={h} variant="outline">{h}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <h2 className="mb-3 text-lg font-semibold">Fordele & ulemper</h2>
          <div className="space-y-2">
            {mouse.fordele.map((f) => (
              <p key={f} className="text-sm text-green-700 dark:text-green-400">
                + {f}
              </p>
            ))}
            {mouse.ulemper.map((u) => (
              <p key={u} className="text-sm text-red-700 dark:text-red-400">
                − {u}
              </p>
            ))}
          </div>
        </div>
      </div>

      {pros.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Pros der bruger {mouse.navn} ({pros.length})
          </h2>
          <div className="rounded-lg border">
            {pros.map((pro, i) => (
              <Link
                key={pro.slug}
                href={`/pro/${pro.slug}`}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors ${
                  i < pros.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold shrink-0">
                  {pro.navn.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{pro.navn}</div>
                  <div className="text-xs text-muted-foreground">
                    {pro.hold} · {pro.settings.dpi} DPI ·{" "}
                    {pro.settings.edpi} eDPI
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Sens: {pro.settings.inGameSens}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const { mice } = await import("@/data/mice");
  return mice.map((m) => ({ slug: m.slug }));
}
