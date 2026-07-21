import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Find din gaming-mus",
  description:
    "Svar på 5 spørgsmål og find den bedste gaming-mus til dig baseret på dit spil, greb, håndstørrelse og budget.",
};

export default function FindMusPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Find din perfekte gaming-mus
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Svar på få spørgsmål, og få en skræddersyet anbefaling baseret på hvad
        pros bruger — med de bedste priser fra danske forhandlere.
      </p>
      <div className="rounded-lg border bg-card p-8 mb-8">
        <p className="text-muted-foreground mb-6">
          Finder-værktøjet er på vej! Indtil da kan du se hvilke mus pros bruger
          i{" "}
          <Link href="/cs2" className="text-primary hover:underline">
            CS2
          </Link>
          .
        </p>
        <Link href="/cs2" className={cn(buttonVariants({}))}>
          Se CS2-mus →
        </Link>
      </div>
    </div>
  );
}
