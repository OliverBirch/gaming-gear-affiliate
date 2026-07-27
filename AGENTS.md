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
| Keyboards | `/dk/gaming-tastatur/{slug}` | Same (all wired) | `/dk/computertilbehor/tastatur-og-tilbehor/gaming-tastatur` |

**Discovery workflow:** DuckDuckGo `site:maxgaming.dk "product name"` → extract URL pattern → fetch category page (pagination via `?limit=48&page=N`) and grep for product links → fetch product page → extract `og:image` meta tag for product image.

**Product images URL pattern:** `https://www.maxgaming.dk/bilder/artiklar/{numeric-id}.jpg` (strip query params from og:image URL, keep extension).

Category pages are JS-rendered so product links don't appear in static HTML. Product pages are server-rendered — specs, prices, and og:image are extractable.

## Data workflows
- Use the `add-pro` skill to add pros — it handles pros.ts, peripherals, images, and stub mouse creation.
- Use the `add-mouse` skill to create mice or complete stubs — it sources specs from RTINGS, copy from reviews, and offers from affiliate portals.
- Unknown mice encountered during pro creation are tracked in `src/data/mice-todo.ts`. Visit `/admin/todo` to see the backlog.
- Pro gear source is always `prosettings.net`. Mouse specs come from RTINGS → Techpowerup → manufacturer.
- Pro team/hold source is **Liquipedia API** (`src/lib/liquipedia.ts`), not prosettings.net. Liquipedia is more accurate for roster tracking with full transfer history and covers CS2, Valorant, and R6.
- `add-headset` skill mirrors `add-mouse` but for headsets (same flow: research specs → write Danish copy → find MaxGaming URL → add to JSON).

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
