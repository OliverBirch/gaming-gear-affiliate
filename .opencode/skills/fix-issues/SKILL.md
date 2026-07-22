---
name: fix-issues
description: Use when the user types "fix issues", "fix dashboard", "ret issues", or wants to resolve problems surfaced by the admin dashboard. Reads the embedded issues.json from /admin, triages auto-fixable vs needs-human, and fixes what it can.
---

# Fix Issues

Automated issue resolution driven by the admin dashboard's embedded `issues.json`.

## How it works

The `/admin` page embeds a `<script type="application/json" id="issues-data">` block with all detected issues. This skill reads that JSON and fixes auto-fixable issues. Issues requiring human decisions are reported with context.

## Step-by-step

### 1. Fetch the issues

Read the admin page (local file or deployed URL) and extract the JSON from the `<script id="issues-data">` block. Parse it into an array of `DashboardIssue` objects:

```ts
interface DashboardIssue {
  type: string;
  severity: "high" | "medium" | "low";
  autoFixable: boolean;
  slug: string;
  label: string;
  file: string;
  context: Record<string, unknown>;
}
```

### 2. Triage

Sort by severity (high → medium → low), then by auto-fixable first.

### 3. Fix auto-fixable issues

#### `broken-url` (Maxgaming URL uses old `/da/tilbehoer/mus/` pattern)

1. Fetch `https://www.maxgaming.dk/dk/computertilbehor/computermus-tilbehor/gaming-mus` (and subsequent pages if not found)
2. Grep the HTML for `href="/dk/tradlose/{search-term}"` where `searchTerm` comes from `context.searchTerm`
3. Match by brand/model name to find the correct new URL
4. Edit `src/data/mice.ts`: find the offer with `retailer: "maxgaming"` for this slug and replace both `produktUrl` and `affiliateUrl` with `https://www.maxgaming.dk{found-href}`
5. If not found on any page, log a warning

#### `missing-image` (mouse product image)

1. Check `context.hasMaxgaming` and `context.maxgamingUrl`
2. If `hasMaxgaming: true`: fetch the product page, extract `<meta property="og:image" content="...">`
3. Download the image to `/public/images/mice/{slug}.{ext}` (preserve extension, strip query params)
4. Edit `src/data/mice.ts`: change `billede: undefined` to `billede: "/images/mice/{slug}.{ext}"`
5. If `hasMaxgaming: false`: skip — no retailer product page accessible for image extraction

#### `missing-pro-image` (pro player avatar)

1. Fetch `https://prosettings.net/players/{slug}/`
2. Look for `<link rel="preload" as="image" href="...">` in `<head>`
3. If the href contains `placeholder-`: skip (no custom photo — ProAvatar fallback is correct)
4. Download the image to `public/images/pros/{slug}.png` (always save as .png)
5. Edit `src/data/pros.ts`: add `billede: "/images/pros/{slug}.png"` to the pro's entry
6. If the preload tag isn't found, try the URL chain:
   - `https://prosettings.net/wp-content/uploads/{slug}-220x220-fitcontain-q99-gb283-s1.png`
   - `https://prosettings.net/wp-content/uploads/{slug}-1-220x220-fitcontain-q99-gb283-s1.png`

### 4. Report needs-human issues

For each non-auto-fixable issue, report the type, slug, label, and which skill or action is needed:

| Issue type | Action |
|---|---|
| `stale-pro` | Run `add-pro` skill with the pro's slug. Source: `context.sourceUrl` |
| `missing-peripherals` | Run `add-pro` skill step 3 (fetch player detail page for peripherals) |
| `no-offers` | Research product on Partner-ads/Adtraction. Requires human + browser access |
| `missing-price` | Price data comes from Adtraction XML feed → `prices.json`. Requires feed ingestion |
| `empty-description` | Run `add-mouse` skill with the slug to write Danish copy |
| `empty-fordele` / `empty-ulemper` | Run `add-mouse` skill to write copy |
| `orphaned-mus` | Run `add-mouse` skill to create the missing mouse entry |

### 5. Verify

Run `npm run build`. Fix any type errors or validation failures.

## Key reference files

- `src/app/admin/page.tsx` — Dashboard with embedded issues JSON
- `src/data/mice.ts` — Mouse entries (offer URLs, billede)
- `src/data/pros.ts` — Pro entries (billede, sidstVerificeret)
- `src/data/pros-peripherals.json` — Peripheral data
- `.opencode/skills/add-pro/SKILL.md` — Pro creation/update workflow
- `.opencode/skills/add-mouse/SKILL.md` — Mouse creation/completion workflow
