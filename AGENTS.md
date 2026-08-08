<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ProSetups.dk — Project conventions

## Core focus
Answer one question: *"What gear does this pro use, where can I buy it in Denmark, and is this info current?"* Pro data is the moat; product categories serve the pro-data.

## Roadmap
`ROADMAP.md` tracks project phases (platform → pro data → real affiliate integration → full retailer coverage → launch) and a dated log of milestone sessions. After a session that finishes or meaningfully advances a phase, update it: flip the phase status and append one line to the Log. Don't put per-product counts there — that's what `/admin` and `/admin/tickets` are for; they're computed from data and won't drift like a hand-maintained count would.

## Source of truth
- Zod schemas in `src/lib/types.ts` are canonical. Data files must conform — transform layers map raw JSON to schemas.
- Never edit raw data inline; create a transform layer (see `src/data/mousepads.ts` for the pattern). Mice and keyboards deliberately diverge from that pattern's offer-building — see the `build-offers.ts` bullet below before "fixing" them to match.
- Every data module runs its schema at import time (`for (const x of built) XSchema.parse(x)`), including `pros.ts`. A build failure here means the data is wrong — fix the data, don't loosen the schema.
- **Never invent `sidstVerificeret` or `kilde`.** They are nullable; leave them null when unknown so `/admin` reports "aldrig verificeret". A default date silently claims a verification that never happened.

## Shared modules — use these, don't re-inline
- `src/lib/schema-org.ts` — all JSON-LD. `breadcrumbList`, `productItemList`, `productSchema`, `jsonLd`, plus `SITE_URL`/`absoluteUrl`. Hand-writing a `"@context"` literal in a page is how `/headset` ended up with no `brand` or `url` in its ItemList.
- `src/lib/product-labels.ts` — Danish enum labels. Note `prisNiveauLabels` ("Mellemklasse", for spec tables) and `prisNiveauLabelsShort` ("Mellem", for card badges) are both intentional; don't collapse them.
- `src/lib/affiliate.ts` — `getLowestPrice(product)`. Don't re-inline `reduce(…, Infinity)`.
- `src/lib/utils.ts` — `formatPriceDkk(n)` for the `"N kr."` suffix.
- `src/data/build-offers.ts` — `buildFlatOffers` for flat `{retailer: price}` maps (headsets, monitors). Payout rates differ per category by design: headsets pay elgiganten 2.5%, monitors 3.5%. Tests pin this. Mousepads keep their own builder — nested per-size prices.
- **Mice and keyboards don't use `buildFlatOffers` at all — by design, not oversight.** `mice.json` stores each mouse's `offers` array verbatim: individually-authored per-product URLs (`produktUrl`/`affiliateUrl`), not a generic category-search fallback. **These are not confirmed live links** — the site has no affiliate program hooked up yet, every outbound URL across the site is placeholder/provisional pending real verification — but they're still per-product, not machine-generated from a shared template, and that's what matters for the JSON format choice. Routing them through a `priser` map + `buildFlatOffers` would silently collapse per-product URLs into generic category search URLs across all 52 mice — don't do it, regardless of the URLs' current verification status. Keyboards are the opposite case: every entry's offers were already machine-generated from a retailer list (`kbOffers()` in `keyboards.ts`), so `keyboards.json` stores that retailer list (`"retailers": [...]`) and `kbOffers()` expands it at build time — don't store the expanded offer objects there either, that would just duplicate generated data.

## Tests
- `npm test` (Vitest). Coverage is deliberately narrow: affiliate offer/price resolution, the peripheral-matching false-positive traps, schema-org output.
- Peripheral matching is fuzzy substring matching over free text and is the most fragile logic in the repo. **Order is load-bearing** — `"cloud iii"` contains `"cloud ii"`, so the III branch must be checked first. Add a regression test with any new `match()` rule.

## Product copy (CopyPoints)
- Prices belong in `offers[].prisDkk` or `prices.json` overrides. Do NOT write price strings (`$180`, `~$200`, `399 kr.`) into `fordele`/`ulemper` or `beskrivelse`. The CopyPoints Zod refine rejects `$` + digit patterns at validation.

## Retailers
- `RETAILER_SLUGS` is a closed Zod enum. Adding a retailer requires:
  1. Update the union in `types.ts`
  2. Add a matching entry in `retailers.ts` with real payout data
  3. Do NOT add a slug before the retailer entry exists

## Route naming
- Danish for routes and UI: `/tastaturer`, `/musemaatter`, `/maerke`, `/mus`. English for code identifiers.

## Data workflows
- Use the `add-pro` skill to add pros — it handles pros.ts, peripherals, images, and stub mouse creation.
- Use the `add-mouse` skill to create mice or complete stubs — it sources specs from RTINGS, copy from reviews, and offers from affiliate portals.
- Unknown mice encountered during pro creation are tracked in `src/data/mice-todo.ts`. Visit `/admin/todo` to see the backlog.
- Pro gear source is always `prosettings.net`. Mouse specs come from RTINGS → Techpowerup → manufacturer.
- Pro team/hold source is **Liquipedia API** (`src/lib/liquipedia.ts`), not prosettings.net. Liquipedia is more accurate for roster tracking with full transfer history and covers CS2, Valorant, and R6.
- `add-headset` skill mirrors `add-mouse` but for headsets (same flow: research specs → write Danish copy → find a real per-product retailer URL → add to JSON). MaxGaming is **not** a retailer partner — removed from the catalog 2026-08-08, do not source offers, prices, or images from maxgaming.dk.
- **Incomplete data tickets:** When creating pros or products with missing data (no image, stub mouse, no offers, missing peripherals), append a `FreshnessTicket` to `src/data/freshness-tasks.ts`. Tickets appear in `/admin/tickets` for manual follow-up. See the ticket types: `missing-pro-image`, `stub-mouse-created`, `no-mouse-offers`, `peripheral-missing`.
- **Delegating small jobs:** Small, mechanical, self-contained jobs (boilerplate, a standalone script, a repetitive data transform) can be offloaded to the user's opencode/deepseek-v4-pro subscription instead of Claude usage — see the `delegate-deepseek` skill. Always confirm with the user first; deepseek is review-only, never given write access.

## Team logos
- Team logos are sourced from **ProSettings.net** CDN (`prosettings.net/wp-content/uploads/{slug}.svg` or `.png`).
- Download via `node scripts/fetch-team-logos.mjs`. Run after adding new teams or when logos appear stale.
- `src/data/team-logos.ts` maps normalized hold names → local file paths in `public/images/teams/`.
- Missing teams fall back to monogram placeholders from `scripts/_gen-team-monograms.mjs`.
- To add a logo: find the team's ProSettings slug from `https://prosettings.net/teams/{slug}/`, add the mapping to `fetch-team-logos.mjs` and `team-logos.ts`, then re-run the fetch script.

## Liquipedia API for team data

Liquipedia is the primary source for pro team/roster data. Use the fetch utility in `src/lib/liquipedia.ts`:

- **CS2:** `https://liquipedia.net/counterstrike/api.php?action=parse&page={slug}&format=json&prop=text&section=0`
- **Valorant:** `https://liquipedia.net/valorant/api.php?action=parse&page={slug}&format=json&prop=text&section=0`
- **R6:** `https://liquipedia.net/rainbowsix/api.php?action=parse&page={slug}&format=json&prop=text&section=0`

The infobox contains structured `Team:`, `Status:`, `Nationality:`, and `History` fields. Liquipedia content is CC-BY-SA licensed — credit via the `kilde` field alongside prosettings.net.

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

## Data freshness (weekly cadence)

Keeping pro gear data and prices current is the site's primary value. Follow this routine:

### Weekly checklist (15–40 min)

1. **Open** `/admin` — scan high-severity issues
2. **Fix auto-fixable:** run `fix-issues` skill for `broken-url`, `missing-image`, `missing-pro-image`
3. **Re-verify stale pros:** run `re-verify-pros` skill — priority tier-1 first (`src/data/freshness-priority.ts`), then oldest stale from admin
4. **Complete 1 stub mouse** if any exist in `mice-todo.ts` (use `add-mouse` skill)
5. **Spot-check prices:** update top 5 mouse prices into `prices.json` if feed isn't live yet
6. **Run `npm run build`** — verifies Zod validation passes

### When admin flags issues

| Issue type | Severity | Skill |
|---|---|---|
| `stale-pro` | high/med | `re-verify-pros` |
| `stub-mouse` | high | `add-mouse` |
| `no-offers` | high | Research product + add offers |
| `broken-url` | high | `fix-issues` (auto-fixable) |
| `missing-price` | medium | `prices.json` override |
| `feed-stale` | medium | Refresh `prices.json.scrapedAt` |
| `orphaned-mus` | high | `add-mouse` (create missing mouse) |
| `missing-image` | low | `fix-issues` (auto-fixable) |
| `empty-description` / `empty-fordele` / `empty-ulemper` | medium | `add-mouse` |
| `missing-peripherals` | low | `add-pro` step 3 |
| `product-stale` | low | Re-verify product specs |
| `unmapped-peripheral` | low | Add `match()` rule in mapping |

### Validation layers

1. **TypeScript** — `next build` checks all types
2. **Zod parse** — Runs at module level in `mice.ts`, `keyboards.ts`, `mousepads.ts`, `headsets.ts` (build fails if data doesn't match schema)
3. **CopyPoints** — Zod refine rejects `$` + digit in `fordele`/`ulemper`/`beskrivelse`
4. **JSON validation** — `npm run validate-data` checks `prices.json`, CopyPoints in JSON files, required fields
5. **Admin health** — `/admin` generates a full issue report at build time (SSG)

### Key reference files for freshness

- `src/lib/data-health.ts` — Pure health-check functions (stale, offers, prices, copy, stubs, mapping)
- `src/data/freshness-priority.ts` — Tier-1 CS2/Valorant/R6 priority lists
- `scripts/validate-data.mjs` — Standalone JSON validation (CopyPoints, schema checks)
- `scripts/scrape.mjs` — **Deprecated** (wrong schema, DO NOT USE)
- `.opencode/skills/re-verify-pros/SKILL.md` — Batch re-verify workflow
