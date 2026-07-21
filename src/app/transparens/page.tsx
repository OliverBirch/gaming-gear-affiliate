import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparens - affiliate og datakilder",
  description: "Læs om vores affiliate-partnerskaber, datakilder og hvordan vi tjener penge.",
};

export default function TransparensPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Transparens</h1>
      <div className="text-muted-foreground space-y-4">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Affiliate-links
          </h2>
          <p>
            Nogle links på denne side er affiliate-links. Hvis du klikker på et
            affiliate-link og foretager et køb, modtager vi en provision, uden
            ekstra omkostning for dig. Vi samarbejder med:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Proshop (Partner-ads)</li>
            <li>Computersalg (Partner-ads)</li>
            <li>MaxGaming (Adtraction)</li>
            <li>Coolshop (Partner-ads)</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Datakilder
          </h2>
          <p>
            Vores pro-data (mus, DPI, settings) stammer primært fra
            prosettings.net og Liquipedia. Alle data er krediteret med kilde og
            verificeringsdato. Pro-gear skifter med roster-moves og nye
            product-launches. Vi bestræber os på at holde data opdateret.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Ingen betalte placeringer
          </h2>
          <p>
            Vi modtager ikke betaling for at inkludere specifikke produkter.
            Vores anbefalinger er baseret på pro-usage-data og objektive specs.
          </p>
        </section>
      </div>
    </div>
  );
}
