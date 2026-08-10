import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPro } from "@/data/pros";
import { getMouse } from "@/data/mice";
import { getKeyboard } from "@/data/keyboards";
import { getMousepad } from "@/data/mousepads";
import { getHeadset } from "@/data/headsets";
import { getMonitor } from "@/data/monitors";
import { bestOffers } from "@/lib/affiliate";
import type { OfferableProduct } from "@/lib/types";
import { getProPeripherals } from "@/data/pros-peripherals";
import {
  getKeyboardSlug,
  getMousepadSlug,
  getHeadsetSlug,
  getMonitorSlug,
} from "@/data/pros-peripherals-mapping";
import { getTeamLogo } from "@/data/team-logos";
import { ProAvatar } from "@/components/pro-avatar";

interface Props {
  params: Promise<{ slug: string }>;
}

async function lowestPriceDkk(product: OfferableProduct): Promise<number | null> {
  const prices = (await bestOffers(product))
    .map((o) => o.prisDkk)
    .filter((p): p is number => p != null);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

type GearCard = {
  slot: string;
  href?: string;
  navn: string;
  brand?: string;
  billede?: string | null;
  badges?: string[];
  prisDkk?: number | null;
  featured?: boolean;
};

function GearItemCard({ item }: { item: GearCard }) {
  const cardClass = cn(
    "rounded-xl border border-border/50 bg-card p-5",
    item.featured && "sm:col-span-2",
    item.href &&
      "group hover:border-primary/30 hover:-translate-y-px transition-all duration-200"
  );

  const content = (
    <div
      className={cn(
        item.featured && "sm:grid sm:grid-cols-[200px_1fr] sm:gap-6 sm:items-start"
      )}
    >
      <div>
        <div className="mb-1 flex items-center justify-between gap-2 sm:hidden">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.slot}
          </span>
          {item.prisDkk != null && (
            <span className="text-xs font-semibold tabular-nums text-primary">
              fra {item.prisDkk} kr.
            </span>
          )}
        </div>
        <ProductImage
          src={item.billede}
          alt={item.navn}
          padding="sm"
          sizes={item.featured ? "400px" : "200px"}
          className={cn(
            "w-full rounded-lg bg-[#0d0d0d]",
            item.featured ? "h-40 sm:h-44" : "h-28"
          )}
        />
      </div>

      <div className={cn(!item.featured && "mt-3")}>
        <div className="mb-1 hidden items-center justify-between gap-2 sm:flex">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.slot}
          </span>
          {item.prisDkk != null && (
            <span className="text-xs font-semibold tabular-nums text-primary">
              fra {item.prisDkk} kr.
            </span>
          )}
        </div>
        <div
          className={cn(
            "font-semibold leading-snug",
            item.featured ? "text-xl" : "text-base",
            item.href && "group-hover:text-primary transition-colors"
          )}
        >
          {item.navn}
        </div>
        {item.brand && (
          <div className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{item.brand}</div>
        )}
        {item.badges && item.badges.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.badges.slice(0, item.featured ? 4 : 3).map((b) => (
              <Badge
                key={b}
                variant="outline"
                className="border-border/50 text-muted-foreground font-normal"
              >
                {b}
              </Badge>
            ))}
          </div>
        )}
        {item.href && item.featured && (
          <div className="mt-4 sm:mt-5">
            <span
              className={cn(
                buttonVariants({ variant: "cta", size: "sm" }),
                "pointer-events-none"
              )}
            >
              <span className="btn-main-text-container">
                <span className="btn-main-text">
                  {item.prisDkk != null
                    ? `Se bedste pris (fra ${item.prisDkk} kr.)`
                    : "Se produkt"}
                </span>
              </span>
            </span>
          </div>
        )}
        {!item.href && (
          <p className="mt-2 text-xs text-muted-foreground">Ikke i katalog endnu</p>
        )}
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) return {};
  return {
    title: `${pro.navn} setup — mus, DPI og priser i DK`,
    description: `Se ${pro.navn}s gaming-mus, DPI, in-game sens og øvrige udstyr. Find bedste pris hos danske forhandlere.`,
  };
}

export default async function ProPage({ params }: Props) {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) notFound();

  const mouse = getMouse(pro.musSlug);
  if (!mouse) notFound();

  const peri = getProPeripherals(pro.slug);
  const keyboardSlug = getKeyboardSlug(pro.slug);
  const mousepadSlug = getMousepadSlug(pro.slug);
  const headsetSlug = getHeadsetSlug(pro.slug);
  const monitorSlug = getMonitorSlug(pro.slug);

  const keyboard = keyboardSlug ? getKeyboard(keyboardSlug) : undefined;
  const mousepad = mousepadSlug ? getMousepad(mousepadSlug) : undefined;
  const headset = headsetSlug ? getHeadset(headsetSlug) : undefined;
  const monitor = monitorSlug ? getMonitor(monitorSlug) : undefined;

  const teamLogo = getTeamLogo(pro.hold);
  const teamHref = pro.hold
    ? `/${pro.esport}/hold/${pro.hold.toLowerCase().replace(/\s+/g, "-")}`
    : null;
  const verifiedLabel = new Date(pro.sidstVerificeret).toLocaleDateString("da-DK");

  const gear: GearCard[] = [
    {
      slot: "Mus",
      href: `/mus/${mouse.slug}`,
      navn: mouse.navn,
      brand: mouse.brand,
      billede: mouse.billede,
      badges: [
        `${mouse.vaegtGram}g`,
        mouse.sensor,
        mouse.wireless ? "Trådløs" : "Kablet",
      ],
      prisDkk: await lowestPriceDkk(mouse),
      featured: true,
    },
  ];

  if (keyboard || peri?.keyboard) {
    gear.push({
      slot: "Tastatur",
      href: keyboard ? `/tastaturer/${keyboard.slug}` : undefined,
      navn: keyboard?.navn ?? peri!.keyboard!,
      brand: keyboard?.brand,
      billede: keyboard?.billede,
      badges: keyboard
        ? [keyboard.formfaktor, keyboard.switchType, ...(keyboard.wireless ? ["Trådløs"] : [])]
        : undefined,
      prisDkk: keyboard ? await lowestPriceDkk(keyboard) : null,
    });
  }

  if (mousepad || peri?.mousepad) {
    const padNavn = mousepad
      ? [mousepad.brand, mousepad.model, mousepad.variant].filter(Boolean).join(" ")
      : peri!.mousepad!;
    gear.push({
      slot: "Musemåtte",
      href: mousepad ? `/musemaatter/${mousepad.slug}` : undefined,
      navn: padNavn,
      brand: mousepad?.brand,
      billede: mousepad?.billede,
      badges: mousepad ? [mousepad.type, mousepad.materiale] : undefined,
      prisDkk: mousepad ? await lowestPriceDkk(mousepad) : null,
    });
  }

  if (headset || peri?.headset) {
    gear.push({
      slot: "Headset",
      href: headset ? `/headset/${headset.slug}` : undefined,
      navn: headset?.navn ?? peri!.headset!,
      brand: headset?.brand,
      billede: headset?.billede,
      badges: headset
        ? [`${headset.vaegtGram}g`, headset.wireless ? "Trådløs" : "Kablet"]
        : undefined,
      prisDkk: headset ? await lowestPriceDkk(headset) : null,
    });
  }

  if (monitor || peri?.monitor) {
    gear.push({
      slot: "Skærm",
      href: monitor ? `/skaerme/${monitor.slug}` : undefined,
      navn: monitor?.navn ?? peri!.monitor!,
      brand: monitor?.brand,
      billede: monitor?.billede,
      badges: monitor
        ? [`${monitor.stoerrelseTommer}"`, monitor.oploesning, `${monitor.opdateringsHz} Hz`]
        : undefined,
      prisDkk: monitor ? await lowestPriceDkk(monitor) : null,
    });
  }

  const knowsAbout = [
    {
      "@type": "Product" as const,
      name: mouse.navn,
      brand: { "@type": "Brand" as const, name: mouse.brand },
    },
    ...(keyboard
      ? [
          {
            "@type": "Product" as const,
            name: keyboard.navn,
            brand: { "@type": "Brand" as const, name: keyboard.brand },
          },
        ]
      : []),
    ...(headset
      ? [
          {
            "@type": "Product" as const,
            name: headset.navn,
            brand: { "@type": "Brand" as const, name: headset.brand },
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Forside
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${pro.esport}`} className="hover:text-primary transition-colors">
          {pro.esport.toUpperCase()}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{pro.navn}</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-start gap-5">
        <ProAvatar navn={pro.navn} slug={pro.slug} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-border/50 text-muted-foreground uppercase tracking-wide"
            >
              {pro.esport}
            </Badge>
            {pro.hold && teamHref && (
              <Link
                href={teamHref}
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-2.5 py-0.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {teamLogo ? (
                  // Team logos are mixed svg/png from public; match home page pattern
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo} alt="" className="size-4 object-contain" />
                ) : null}
                {pro.hold}
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {pro.navn}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {[pro.land, `Verificeret ${verifiedLabel}`].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">
            <span className="text-foreground font-medium">{pro.settings.dpi}</span>
            {" "}DPI
            <span className="mx-2 text-border">·</span>
            <span className="text-foreground font-medium">{pro.settings.inGameSens}</span>
            {" "}sens

          </p>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="mb-5 text-lg font-semibold">Udstyr</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {gear.map((item) => (
            <GearItemCard key={item.slot} item={item} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
        </p>
      </section>

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://prosetups.dk/" },
              {
                "@type": "ListItem",
                position: 2,
                name: pro.esport.toUpperCase(),
                item: `https://prosetups.dk/${pro.esport}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: pro.navn,
                item: `https://prosetups.dk/pro/${pro.slug}`,
              },
            ],
          }),
        }}
      />
      <Script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: pro.navn,
            affiliation: pro.hold,
            knowsAbout,
          }),
        }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  const { pros } = await import("@/data/pros");
  return pros.map((p) => ({ slug: p.slug }));
}
