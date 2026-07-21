import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConsentBanner } from "@/components/consent-banner";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
      </head>
      <body className="min-h-full flex flex-col text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ConsentBanner />
        <AffiliateDisclosure />
      </body>
    </html>
  );
}
