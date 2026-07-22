# HANDOVER — Dansk esport-mus ekspertside (affiliate)

> **Til:** Claude Code
> **Fra:** Oliver
> **Projekttype:** SEO-drevet affiliate-site, dansksproget, niche = "hvilken mus bruger pros i hver esport"
> **Arbejdstitel / domæne:** `[DOMÆNE]` — forslag: `promus.dk`, `esportgear.dk`, `promus.gg`. Vælg og lås før build.

---

> **Current state — July 2026**
> This document has been rewritten to reflect the live architecture.
> The original Phase 1-4 build plan, Contentlayer/MDX references,
> and Next.js 15 specifics are superseded.
>
> ---
>
> **2026-07-22 update:**
> - Nav restructured: Pros is primary nav item, Udstyr and Guides are dropdowns
> - Mousepads and keyboards added as full product sections with Zod schemas
> - Site aims to answer: "What gear does this pro use, where can I buy it in Denmark, and is this info current?"

## Core focus

One question: **"What gear does this pro use, where can I buy it
in Denmark, and is this info current?"**

Pro data is the moat. Product categories (mice, keyboards, mousepads)
exist to serve pro-gear queries. Every product page is a fulfillment
step after the pro-data.

## Architecture

**Framework:** Next.js 16 (App Router) + TypeScript
**Styling:** Tailwind CSS + shadcn/ui
**Rendering:** Full static generation (SSG) — `generateStaticParams`
on all dynamic routes
**Hosting:** Vercel

### Data model (src/lib/types.ts)

All product categories share a common pattern: Zod schema per category,
CopyPoints validator on fordele/ulemper, AffiliateOfferSchema for
pricing, and an OfferableProduct interface that lets
src/lib/affiliate.ts resolve offers generically across categories.

Closed enums enforced by Zod:
- `RETAILER_SLUGS` — only proshop, computersalg, maxgaming, coolshop.
  Adding a retailer requires changes to both types.ts and retailers.ts.
- `prisNiveau` — budget | mid | flagship
- Category-specific enums (formfaktor, switchType, glide type, etc.)

CopyPoints: prices belong in offers[].prisDkk or prices.json overrides.
Price literals in prose copy (fordele/ulemper) are rejected at validation.

### Pro data

80+ pros across CS2, Valorant, R6. Each pro has:
- musSlug linking to a Mouse entry
- Settings (DPI, sensitivity, eDPI, polling Hz)
- kilde + sidstVerificeret
- Peripheral data in pros-peripherals.json (free-text product names
  for keyboard, mousepad, monitor, headset — with *Slug fields
  reserved for confirmed catalog matches, never guessed)

### Affiliate system (src/lib/affiliate.ts)

Generic OfferableProduct interface resolves bestOffer/bestOffers
across all product categories. Prices come from:
1. Static offers[].prisDkk (if set)
2. prices.json overrides (keyed by productSlug__retailerSlug)
3. Fallback: no price shown, "Se pris hos [forhandler]" CTA only

All outbound affiliate links use rel="sponsored nofollow" and
route through an internal redirect.

### Retailers

| Slug | Network |
|---|---|
| proshop | partner-ads |
| computersalg | partner-ads |
| maxgaming | impact |
| coolshop | partner-ads |

## Navigation

**Desktop:** Pros → CS2 \| Valorant \| R6 → Udstyr ▼ → Guides ▼
**Mobile:** Same structure with native <details> accordions for dropdowns

## Route structure

| Route | Content |
|---|---|
| / | Home — hero, popular mice, pros, esports, brands |
| /pros | Pro directory |
| /pro/[slug] | Pro detail + settings + peripherals |
| /mus | Mouse listing |
| /mus/[slug] | Mouse detail |
| /tastaturer | Keyboard listing |
| /tastaturer/[slug] | Keyboard detail |
| /musemaatter | Mousepad listing |
| /musemaatter/[slug] | Mousepad detail |
| /[esport] | Esport hub (cs2, valorant, r6) |
| /[esport]/hold/[slug] | Team page |
| /maerke/[slug] | Brand page (mice + keyboards + mousepads) |
| /guides/* | Buying guides |
| /find-mus | Mouse finder quiz |
| /blog/* | Blog posts |

## Site conventions

- **Danish naming** for all routes and UI text (`/tastaturer`,
  `/musemaatter`, `/maerke`). Code identifiers on English.
- **Static generation** everywhere. No runtime ISR/fetching.
- **Schema.org JSON-LD** on listing pages (ItemList, BreadcrumbList)
  and detail pages (Product, BreadcrumbList).
- **Build output** verified: ~300 static pages, clean TypeScript.
