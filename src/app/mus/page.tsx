import type { Metadata } from "next";
import Link from "next/link";
import { MouseCard } from "@/components/mouse-card";
import { mice } from "@/data/mice";

export const metadata: Metadata = {
  title: "Alle gaming-mus — ProSetups.dk",
  description:
    "Se komplette specifikationer, priser og hvilke pros der bruger hver mus. Sammenlign Logitech, Razer, ZOWIE, Pulsar og flere.",
};

export default function MusPage() {
  const sorted = [...mice].sort(
    (a, b) => b.proBrugere.length - a.proBrugere.length
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Alle mus</h1>
      <p className="text-muted-foreground mb-10">
        {mice.length} mus i databasen sorteret efter popularitet blandt pros
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((mouse) => (
          <MouseCard key={mouse.slug} mouse={mouse} />
        ))}
      </div>
    </div>
  );
}
