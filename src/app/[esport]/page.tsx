import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MouseCard } from "@/components/mouse-card";
import { ProRow } from "@/components/pro-row";
import { getEsport } from "@/data/esports";
import { getProsByEsport } from "@/data/pros";
import { getMiceByEsport } from "@/data/mice";

interface Props {
  params: Promise<{ esport: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) return {};
  return {
    title: `Bedste mus til ${esport.navn}`,
    description: `Se hvilke gaming-mus ${esport.navn}-pros bruger. Komplet oversigt over settings, DPI, eDPI og de bedste priser hos danske forhandlere.`,
  };
}

export default async function EsportPage({ params }: Props) {
  const { esport: slug } = await params;
  const esport = getEsport(slug);
  if (!esport) notFound();

  const pros = getProsByEsport(slug);
  const mice = getMiceByEsport(slug);

  const uniqueMice = mice.filter(
    (m, i, arr) => arr.findIndex((x) => x.slug === m.slug) === i
  );

  const topMice = [...uniqueMice]
    .sort((a, b) => b.proBrugere.length - a.proBrugere.length)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Bedste mus til {esport.navn}
      </h1>
      <p className="mb-8 text-muted-foreground max-w-2xl">
        {esport.beskrivelse}
      </p>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Top 3 mus i {esport.navn}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topMice.map((mouse) => (
            <MouseCard key={mouse.slug} mouse={mouse} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Pros i {esport.navn} ({pros.length})
        </h2>
        {pros.length === 0 ? (
          <p className="text-muted-foreground">
            Vi har ikke data på pros i {esport.navn} endnu. Kigger du på CS2?
          </p>
        ) : (
          <div className="rounded-lg border">
            {pros.map((pro, i) => (
              <ProRow key={pro.slug} pro={pro} isLast={i === pros.length - 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const { esports } = await import("@/data/esports");
  return esports.map((e) => ({ esport: e.slug }));
}
