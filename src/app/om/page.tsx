import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om ProMus.dk",
  description: "Læs om ProMus.dk — dansk esport-mus guide med pro-data og affiliate-priser.",
};

export default function OmPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Om ProMus.dk</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>
          ProMus.dk er en dansk guide til gaming-mus med fokus på hvad
          professionelle esport-spillere bruger. Vi samler data om mus, DPI,
          in-game sens og eDPI fra de største CS2-pros og gør det let at finde
          den rigtige mus til dit spil.
        </p>
        <p>
          Vores data stammer fra offentligt tilgængelige kilder som
          prosettings.net og Liquipedia. Vi krediterer altid kilden og viser
          dato for sidste verificering, fordi pro-gear skifter.
        </p>
        <p>
          Vi tester ikke selv mus fysisk. Vores værdi ligger i at syntetisere
          pro-data og give dig den bedste købsrute til danske forhandlere.
        </p>
      </div>
    </div>
  );
}
