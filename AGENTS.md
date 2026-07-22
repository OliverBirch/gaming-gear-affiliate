<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ProSetups.dk — Project conventions

## Core focus
Answer one question: *"What gear does this pro use, where can I buy it in Denmark, and is this info current?"* Pro data is the moat; product categories serve the pro-data.

## Source of truth
- Zod schemas in `src/lib/types.ts` are canonical. Data files must conform — transform layers map raw JSON to schemas.
- Never edit raw data inline; create a transform layer (see `src/data/mousepads.ts` for the pattern).

## Product copy (CopyPoints)
- Prices belong in `offers[].prisDkk` or `prices.json` overrides. Do NOT write price strings (`$180`, `~$200`, `399 kr.`) into `fordele`/`ulemper` or `beskrivelse`. The CopyPoints Zod refine rejects `$` + digit patterns at validation.

## Retailers
- `RETAILER_SLUGS` is a closed Zod enum. Adding a retailer requires:
  1. Update the union in `types.ts`
  2. Add a matching entry in `retailers.ts` with real payout data
  3. Do NOT add a slug before the retailer entry exists

## Route naming
- Danish for routes and UI: `/tastaturer`, `/musemaatter`, `/maerke`, `/mus`. English for code identifiers.

## MaxGaming URL patterns
MaxGaming uses locale-prefixed URLs. Product pages are split by category (wireless vs wired).

| Product type | Wireless path | Wired path | Category page |
|---|---|---|---|
| Mice | `/dk/tradlose/{slug}` | `/dk/kablet-mus/{slug}` | `/dk/computertilbehor/computermus-tilbehor/gaming-mus` |
| Headsets | `/dk/tradlose-headset/{slug}` | `/dk/kablet-headset/{slug}` | `/dk/computertilbehor/headset-lyd/gaming-headset` |

**Discovery workflow:** DuckDuckGo `site:maxgaming.dk "product name"` → extract URL pattern → fetch category page (pagination via `?limit=48&page=N`) and grep for product links → fetch product page → extract `og:image` meta tag for product image.

**Product images URL pattern:** `https://www.maxgaming.dk/bilder/artiklar/{numeric-id}.jpg` (strip query params from og:image URL, keep extension).

Category pages are JS-rendered so product links don't appear in static HTML. Product pages are server-rendered — specs, prices, and og:image are extractable.

## Data workflows
- Use the `add-pro` skill to add pros — it handles pros.ts, peripherals, images, and stub mouse creation.
- Use the `add-mouse` skill to create mice or complete stubs — it sources specs from RTINGS, copy from reviews, and offers from affiliate portals.
- Unknown mice encountered during pro creation are tracked in `src/data/mice-todo.ts`. Visit `/admin/todo` to see the backlog.
- Pro data source is always `prosettings.net`. Mouse specs come from RTINGS → Techpowerup → manufacturer.
- `add-headset` skill mirrors `add-mouse` but for headsets (same flow: research specs → write Danish copy → find MaxGaming URL → add to JSON).

## Peripheral mapping gotchas
- `src/data/pros-peripherals-mapping.ts` uses substring matching to link free-text peripheral names to catalog slugs.
- Substring matching on short/common terms is too greedy: `"rog"` matches both "ROG Delta II" and "ROG Pelta" (different headsets). A match on `"delta"` + `"rog"` is better than `"rog"` alone.
- `"cloud ii"` matches "HyperX Cloud II" but also "HyperX Cloud Stinger II" (wrong product). Prefer matching `"cloud ii"` + excluding known false positives with `!includes("stinger")`.
- Always verify a handful of actual pro entries after adding a new pattern to catch false matches.

## Adding a new product category
When adding a new peripheral category (e.g. headsets, monitors) to the site:

1. **Schema** — `HeadsetSchema` (or `MonitorSchema`) already exists in `src/lib/types.ts` — skip this step
2. **Data file** — Create `src/data/{category}.json` with raw entries (prices in a `priser` key), then `src/data/{category}.ts` transform layer (modeled on `src/data/mousepads.ts` pattern — map raw JSON → typed array, build `offers` from `priser`, wire `proBrugere` via mapping)
3. **Card component** — Create `src/components/{category}-card.tsx` (modeled on `src/components/headset-card.tsx`)
4. **List route** — Create `src/app/{category}/page.tsx` with metadata, grid of cards, Schema.org markup
5. **Detail route** — Create `src/app/{category}/[slug]/page.tsx` with spec table, fordele/ulemper, price comparison, pro list, generateStaticParams, Schema.org Product + BreadcrumbList
6. **Mapping** — Add `match{Category}` + `get{Category}Slug` / `get{Category}ProSlugs` functions to `src/data/pros-peripherals-mapping.ts`
7. **Brand pages** — Add section to `src/app/maerke/[slug]/page.tsx` (filter brand, render cards, link to list)
8. **Pro pages** — Wire the slug into `src/app/pro/[slug]/page.tsx` so the free-text links to the catalog detail page
9. **Navigation** — Add dropdown entry to `src/components/site-header.tsx` (both desktop and mobile)
10. **Sitemap** — Add list page + all detail pages to `src/app/sitemap.ts`
11. **Dashboard** — Add stat card to `src/app/admin/page.tsx`

## Generation
- All content is statically generated at build time. Use `generateStaticParams` for dynamic routes. No runtime data fetching.

## Affiliate links
- Use `rel="sponsored nofollow"` on all outbound affiliate links.
- Route through `/api/redirect` for click logging.
- Prices resolve via: static `offers[].prisDkk` → `prices.json` overrides → no price shown.
