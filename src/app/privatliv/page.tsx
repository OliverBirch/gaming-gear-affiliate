import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description: "Læs om hvordan ProSetups.dk håndterer dine data og cookies.",
};

export default function PrivatlivPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Privatlivspolitik
      </h1>
      <div className="text-muted-foreground space-y-4">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            Vi bruger cookies til at forbedre din oplevelse og til
            affiliate-tracking. Vi indsamler kun ikke-essentielle data efter
            dit samtykke (Consent Mode v2). Du kan til enhver tid trække dit
            samtykke tilbage.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Google Analytics
          </h2>
          <p>
            Vi bruger Google Analytics 4 til at forstå hvordan siden bruges.
            Data anonymiseres, og der sendes kun data efter dit samtykke til
            analytics_storage.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Affiliate-tracking
          </h2>
          <p>
            Når du klikker på et affiliate-link, kan der sættes en cookie, så
            forhandleren kan registrere at købet kom fra os. Dette kræver dit
            samtykke til ad_storage.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Kontakt</h2>
          <p>
            Har du spørgsmål? Skriv til os på kontakt@prosetups.dk (kommende).
          </p>
        </section>
      </div>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              { "@type": "ListItem", position: 2, name: "Privatlivspolitik", item: "https://prosetups.dk/privatliv" },
            ],
          }),
        }}
      />
      <Script
        id="schema-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privatlivspolitik",
            description: "Læs om hvordan ProSetups.dk håndterer dine data og cookies.",
          }),
        }}
      />
    </div>
  );
}
