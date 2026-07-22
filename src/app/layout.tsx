import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConsentBanner } from "@/components/consent-banner";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import GrainGradient from "@/components/GrainGradient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - ProSetups.dk",
    default: "ProSetups.dk - Hvilken mus bruger pros i dansk esport?",
  },
  description:
    "Se hvilken gaming-mus dine favorit CS2-pros bruger. Find den bedste mus til dit spil med vores finder-værktøj. Priser fra Proshop, MaxGaming og Computersalg.",
  metadataBase: new URL("https://prosetups.dk"),
  alternates: {
    languages: {
      da: "/",
    },
  },
  openGraph: {
    locale: "da_DK",
    siteName: "ProSetups.dk",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'granted',
  'security_storage': 'granted',
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);`,
          }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');`,
          }}
        />
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ProSetups.dk",
              url: "https://prosetups.dk",
              description:
                "Dansk esport-mus guide med pro-data, settings og affiliate-priser.",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col text-foreground">
        {/*
          Dimmed well below the component's stock palette: the background is a
          warm haze behind the content, not a feature. The coral accent is the
          only thing on the page allowed to be bright.
        */}
        <GrainGradient
          fixed
          vars={{
            red1: "#2a0a0e",
            red2: "#1a0507",
            red3: "#341016",
            red4: "#110405",
          }}
        />
        {/*
          GrainGradient sits at z-index 0, so in-flow content needs its own
          stacking position or it paints behind the background.
        */}
        <div className="relative z-10 flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <AffiliateDisclosure />
        </div>
        <ConsentBanner />
      </body>
    </html>
  );
}
