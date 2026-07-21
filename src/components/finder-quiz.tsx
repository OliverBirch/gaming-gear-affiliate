"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FinderInput } from "@/lib/types";
import { scoreMice, type ScoredMouse } from "@/lib/quiz-scoring";
import { bestOffer } from "@/lib/affiliate";
import { getRetailer } from "@/data/retailers";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Step =
  | "welcome"
  | "esport"
  | "greb"
  | "haand"
  | "wireless"
  | "budget"
  | "results";

type GrebOption = "palm" | "claw" | "fingertip" | "ved-ikke";

const esports = [{ slug: "cs2", navn: "CS2", beskrivelse: "Counter-Strike 2" }];

const grebOptions: { value: GrebOption; navn: string; beskrivelse: string }[] = [
  { value: "palm", navn: "Palm-greb", beskrivelse: "Hele hånden hviler på musen" },
  { value: "claw", navn: "Claw-greb", beskrivelse: "Håndfladen hviler, fingrene er krummet" },
  { value: "fingertip", navn: "Fingertip-greb", beskrivelse: "Kun fingerspidserne rører musen" },
  { value: "ved-ikke", navn: "Ved ikke", beskrivelse: "Jeg ved ikke hvilket greb jeg bruger" },
];

const haandOptions: { value: "lille" | "medium" | "stor"; navn: string }[] = [
  { value: "lille", navn: "Lille (under 17 cm)" },
  { value: "medium", navn: "Medium (17-20 cm)" },
  { value: "stor", navn: "Stor (over 20 cm)" },
];

const budgetOptions: { value: "budget" | "mid" | "flagship"; navn: string; beskrivelse: string }[] = [
  { value: "budget", navn: "Budget", beskrivelse: "Under 500 kr." },
  { value: "mid", navn: "Mellemklasse", beskrivelse: "500-1000 kr." },
  { value: "flagship", navn: "Flagship", beskrivelse: "Over 1000 kr." },
];

const grebLabels: Record<string, string> = {
  palm: "Palm",
  claw: "Claw",
  fingertip: "Fingertip",
};

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Spørgsmål {step} af {total - 1}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ResultCard({ scored, index }: { scored: ScoredMouse; index: number }) {
  const mouse = scored.mouse;
  const offer = bestOffer(mouse);
  const retailer = offer ? getRetailer(offer.retailer) : null;

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:border-primary/30">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0 bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]">
          {mouse.billede && (
            <Image
              src={mouse.billede}
              alt={mouse.navn}
              fill
              className="object-contain p-4"
              sizes="192px"
            />
          )}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{mouse.navn}</h3>
              <p className="text-xs text-muted-foreground">{mouse.brand}</p>
            </div>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Match: {scored.score > 0 ? "+" : ""}{scored.score}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
              {mouse.vaegtGram}g
            </Badge>
            {mouse.greb.map((g) => (
              <Badge key={g} variant="outline" className="text-xs border-border/50 text-muted-foreground">
                {grebLabels[g] ?? g}
              </Badge>
            ))}
            {mouse.wireless && (
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                Trådløs
              </Badge>
            )}
            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
              {mouse.prisNiveau === "budget" ? "Budget" : mouse.prisNiveau === "mid" ? "Mellem" : "Flagship"}
            </Badge>
          </div>

          {mouse.proBrugere.length > 0 && (
            <p className="text-sm text-muted-foreground/80 mb-3 leading-relaxed">
              Bruges af{" "}
              <span className="text-foreground font-medium">
                {mouse.proBrugere.length}
              </span>{" "}
              pro{mouse.proBrugere.length > 1 ? "s" : ""} -{" "}
              {mouse.proBrugere
                .slice(0, 3)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(", ")}
              {mouse.proBrugere.length > 3 && " m.fl."}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <Link
              href={`/mus/${mouse.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Se detaljer &rarr;
            </Link>
            {offer && retailer && (
              <a
                href={offer.affiliateUrl}
                rel="sponsored nofollow"
                target="_blank"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 active:scale-[0.98] transition-transform duration-150 shrink-0"
                )}
              >
                {retailer.logo && (
                  <Image
                    src={retailer.logo}
                    alt={retailer.navn}
                    width={16}
                    height={16}
                    className="rounded-sm object-contain"
                  />
                )}
                Køb hos {retailer.navn}
                {offer.prisDkk && <>&nbsp;{offer.prisDkk} kr.</>}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinderQuiz() {
  const [step, setStep] = useState<Step>("welcome");
  const [input, setInput] = useState<FinderInput>({
    esport: "cs2",
    greb: "ved-ikke",
    haand: "medium",
    wireless: null,
    budget: "mid",
  });

  const results = useMemo(() => {
    if (step !== "results") return [];
    return scoreMice(input);
  }, [step, input]);

  const totalSteps = 6;

  function next() {
    const order: Step[] = ["welcome", "esport", "greb", "haand", "wireless", "budget", "results"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) {
      setStep(order[idx + 1]);
    }
  }

  function back() {
    const order: Step[] = ["welcome", "esport", "greb", "haand", "wireless", "budget", "results"];
    const idx = order.indexOf(step);
    if (idx > 0) {
      setStep(order[idx - 1]);
    }
  }

  if (step === "welcome") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <span className="text-3xl">🎮</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Find din perfekte gaming-mus
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Svar på 5 spørgsmål, så matcher vi dig med den bedste mus baseret på hvad pros bruger.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          Vi sammenligner priser fra Proshop, MaxGaming, Computersalg og Coolshop.
        </p>
        <button onClick={next} className={cn(buttonVariants({ size: "lg" }), "text-base px-10")}>
          Kom i gang
        </button>
      </div>
    );
  }

  if (step === "results") {
    const topResults = results.slice(0, 3);
    const total = results.length;

    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Dine anbefalinger
          </h2>
          <p className="text-muted-foreground">
            Baseret på dine svar har vi fundet de {topResults.length} bedste mus til dig ud af {total} mulige.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {topResults.map((scored, i) => (
            <ResultCard key={scored.mouse.slug} scored={scored} index={i} />
          ))}
        </div>

        <div className="text-center space-y-4">
          <button onClick={() => setStep("welcome")} className={cn(buttonVariants({ variant: "outline" }))}>
            Start forfra
          </button>
          <p className="text-xs text-muted-foreground">
            Priser og tilgængelighed opdateres løbende. Links er affiliate-links - det koster dig intet ekstra.
          </p>
        </div>
      </div>
    );
  }

  const stepNumber = ["esport", "greb", "haand", "wireless", "budget"].indexOf(step) + 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar step={stepNumber} total={totalSteps} />

      {step === "esport" && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Hvilket spil spiller du?</h2>
          <p className="text-sm text-muted-foreground mb-6">Vælg det spil, du primært spiller.</p>
          <div className="space-y-3">
            {esports.map((e) => (
              <button
                key={e.slug}
                onClick={() => { setInput((p) => ({ ...p, esport: e.slug })); next(); }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-200",
                  input.esport === e.slug
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <div className="font-medium">{e.navn}</div>
                <div className="text-sm text-muted-foreground">{e.beskrivelse}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "greb" && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Hvilket greb bruger du?</h2>
          <p className="text-sm text-muted-foreground mb-6">Hvordan holder du din mus?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grebOptions.map((g) => (
              <button
                key={g.value}
                onClick={() => { setInput((p) => ({ ...p, greb: g.value })); next(); }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-200",
                  input.greb === g.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <div className="font-medium">{g.navn}</div>
                <div className="text-sm text-muted-foreground">{g.beskrivelse}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              &larr; Tilbage
            </button>
          </div>
        </div>
      )}

      {step === "haand" && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Hvad er din håndstørrelse?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Mål fra håndrod til langefinger.
          </p>
          <div className="space-y-3">
            {haandOptions.map((h) => (
              <button
                key={h.value}
                onClick={() => { setInput((p) => ({ ...p, haand: h.value })); next(); }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-200",
                  input.haand === h.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <div className="font-medium">{h.navn}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              &larr; Tilbage
            </button>
          </div>
        </div>
      )}

      {step === "wireless" && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Foretrækker du trådløs?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Trådløse mus har længere latenstid i dag, men kabel er billigere.
          </p>
          <div className="space-y-3">
            {[
              { value: true as const, navn: "Ja", beskrivelse: "Trådløs - ingen kabelrod" },
              { value: false as const, navn: "Nej", beskrivelse: "Kablet - billigere og lettere" },
              { value: null, navn: "Ligeglad", beskrivelse: "Det betyder ikke noget for mig" },
            ].map((w) => (
              <button
                key={String(w.value)}
                onClick={() => { setInput((p) => ({ ...p, wireless: w.value })); next(); }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-200",
                  input.wireless === w.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <div className="font-medium">{w.navn}</div>
                <div className="text-sm text-muted-foreground">{w.beskrivelse}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              &larr; Tilbage
            </button>
          </div>
        </div>
      )}

      {step === "budget" && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Hvad er dit budget?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Hvor meget vil du give for en mus?
          </p>
          <div className="space-y-3">
            {budgetOptions.map((b) => (
              <button
                key={b.value}
                onClick={() => { setInput((p) => ({ ...p, budget: b.value })); next(); }}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-200",
                  input.budget === b.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <div className="font-medium">{b.navn}</div>
                <div className="text-sm text-muted-foreground">{b.beskrivelse}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              &larr; Tilbage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
