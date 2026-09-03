import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConsentBanner } from "@/components/consent-banner";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import GrainGradient from "@/components/GrainGradient";
import { SITE_URL, jsonLd, organizationSchema, websiteSchema } from "@/lib/schema-org";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - ProSetups.dk",
    default: "ProSetups.dk - Hvilket gear bruger pros i esport?",
  },
  description:
    "Se præcis hvilket gear CS2-, Valorant- og R6-pros bruger. Settings, eDPI og danske priser.",
  metadataBase: new URL(SITE_URL),
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
  robots: {
    index: false,
    follow: false,
  },
  verification: {
    other: {
      "impact-site-verification": "613c916f-c1ca-40b4-85ac-b47f47e7f54c",
    },
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
      suppressHydrationWarning
      className={`dark ${spaceGrotesk.variable} h-full antialiased`}
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
          src="https://www.googletagmanager.com/gtag/js?id=G-BPNT90SDZ3"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BPNT90SDZ3');`,
          }}
        />
        <script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }}
        />
        <script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema()) }}
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
      </body>
    </html>
  );
}
