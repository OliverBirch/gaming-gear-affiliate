import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEsport } from "@/data/esports";
import { esports } from "@/data/esports";
import { pros } from "@/data/pros";
import { mice } from "@/data/mice";
import { ProAvatar } from "@/components/pro-avatar";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ esport: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { esport: string; slug: string }[] = [];
  for (const e of esports.filter((e) => e.aktiv)) {
    const teams = [...new Set(pros.filter((p) => p.esport === e.slug).map((p) => p.hold).filter(Boolean))].filter((h) => h !== "Free Agent" && h !== "Retired");
    for (const team of teams) {
      params.push({ esport: e.slug, slug: team!.toLowerCase().replace(/\s+/g, "-") });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { esport: esportSlug, slug } = await params;
  const esport = getEsport(esportSlug);
  if (!esport) return {};
  const teamNavn = slug.replace(/-/g, " ");
  const teamNavnProper = teamNavn.replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${teamNavnProper} ${esport.navn}-spillere og deres mus`,
    description: `Se hvilke mus ${teamNavnProper}-spillerne i ${esport.navn} bruger, deres DPI, eDPI og polling rate.`,
  };
}

export default async function TeamPage({ params }: Props) {
  const { esport: esportSlug, slug } = await params;
  const esport = getEsport(esportSlug);
  if (!esport) notFound();

  const teamNavn = slug.replace(/-/g, " ");
  const teamNavnProper = teamNavn.replace(/\b\w/g, (l) => l.toUpperCase());

  const teamPros = pros.filter(
    (p) => p.esport === esportSlug && p.hold?.toLowerCase() === teamNavn.toLowerCase()
  );
  if (teamPros.length === 0) notFound();

  const mouseDist: Record<string, { navn: string; slug: string; count: number }> = {};
  for (const p of teamPros) {
    const mouse = mice.find((m) => m.slug === p.musSlug);
    if (!mouseDist[p.musSlug]) {
      mouseDist[p.musSlug] = { navn: mouse?.navn ?? p.musSlug, slug: p.musSlug, count: 0 };
    }
    mouseDist[p.musSlug].count++;
  }

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pt-24 pb-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Forside</Link>
          <span className="mx-2">/</span>
          <Link href={`/${esportSlug}`} className="hover:text-primary transition-colors">{esport.navn}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{teamNavnProper}</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {teamNavnProper}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[65ch] mb-4">
          {teamPros.length} {teamPros.length === 1 ? "spiller" : "spillere"} p&aring; {teamNavnProper} i {esport.navn} og deres mus.
        </p>
      </section>

      <section className="pb-12">
        <div className="flex items-center gap-3 flex-wrap mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Spillere</h2>
          {Object.entries(mouseDist).map(([mSlug, data]) => (
            <Link key={mSlug} href={`/mus/${mSlug}`}>
              <Badge variant="secondary" className="text-xs">
                {data.navn} &times;{data.count}
              </Badge>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {teamPros.map((pro) => {
            const mouse = mice.find((m) => m.slug === pro.musSlug);
            return (
              <div
                key={pro.slug}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-colors duration-200"
              >
                <Link href={`/pro/${pro.slug}`} className="shrink-0">
                  <ProAvatar navn={pro.navn} slug={pro.slug} size="md" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/pro/${pro.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {pro.navn}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {pro.land && `${pro.land} \u00B7 `}
                    {pro.settings.dpi} DPI \u00B7 {pro.settings.edpi} eDPI
                    {pro.settings.pollingHz && ` \u00B7 ${pro.settings.pollingHz} Hz`}
                  </div>
                </div>
                {mouse && (
                  <Link
                    href={`/mus/${mouse.slug}`}
                    className="text-sm font-medium text-primary hover:underline underline-offset-4 shrink-0"
                  >
                    {mouse.navn}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
