---
name: add-mouse
description: Use when the user types "add mouse", "create mouse", "tilføj mus", "complete mouse stub", or "færdiggør mus". Creates or completes mouse entries with specs from RTINGS, copy from multi-source synthesis, and offers from affiliate portals.
---

# Add Mouse

Walkthrough for creating a new mouse entry or completing a stub in ProSetups.dk.

## Two workflows

### Primary: Complete a stub from `mice-todo.ts`

The add-pro skill creates stubs when a pro uses a mouse not yet in the catalog. Read the stub from `src/data/mice-todo.ts` to get the slug, navn, and brand — then fill in the rest.

### Secondary: Add a mouse from scratch

Same steps, just no stub to clean up afterward.

## Data sources

### Specs (RTINGS → Techpowerup → manufacturer)

1. **RTINGS** — primary source. Independently verified weight, dimensions, LOD, sensor name, latency. Construct as `https://www.rtings.com/mouse/reviews/{brand}/{rtings-model}` where `{rtings-model}` is the RTINGS-specific URL slug (may differ from our internal slug — e.g. `asus/rog-harpe-ace-ii` vs `asus-rog-harpe-ace-2`). If the direct URL 404s, search `https://www.rtings.com/search?q={mouse-name}` and use the first result.
2. **Techpowerup** — fallback if RTINGS hasn't reviewed it. Also independently measured. Search `https://www.techpowerup.com/reviews/?manufacturer={Brand}&model={Model}`.
3. **Manufacturer page** — last resort. Warn that specs are unverified marketing numbers.

**Niche brands** (WLmouse, Ninjutso, Finalmouse, Vaxee, G-Wolves, Pwnage, Endgame Gear): RTINGS rarely covers these. Skip RTINGS and go directly to Techpowerup, then the manufacturer product page. Prosettings.net entries for pros using the mouse can also supply specs.

**Variant derivation:** If the mouse is a special edition, collab, or wired variant of an existing entry (e.g. SUPERSTRIKE = Superlight 2, Jinggg X = customized X2, Maya 8K = Maya X), start from the existing specs in `mice.ts` and only research what differs — polling rate, sensor, weight, switch type. This avoids re-fetching the same shape data.

| Field | Source | Notes |
|---|---|---|
| `vaegtGram` | RTINGS measured weight | Number, e.g. 60 |
| `laengdeMm`, `breddeMm`, `hoejdeMm` | RTINGS measured dimensions | In millimeters |
| `sensor` | RTINGS sensor section | e.g. "Hero 2", "Focus Pro 35K" |
| `maxDpi` | RTINGS / spec sheet | Number |
| `pollingHz` | RTINGS | Max polling rate, e.g. 4000 |
| `switchType` | RTINGS | `"optisk"` or `"mekanisk"` |
| `lodMm` | RTINGS LOD test | Lift-off distance in mm. Use 1.0 if unknown. |
| `batteritidTimer` | RTINGS / manufacturer | Hours. `null` if wired only. |
| `wireless`, `forbindelse` | RTINGS | `wireless: true/false`. For `forbindelse`: wired-only = `"Kabel"`. Wireless base = `"2,4 GHz"`. Add Bluetooth with `"2,4 GHz + Bluetooth"`. Add wired mode with `"2,4 GHz + Bluetooth + Kabel"`. Always separate with ` + `. |
| `knapper` | RTINGS / tech specs | Number of buttons |
| `softwarePaakraevet` | RTINGS | `true` if DPI/settings need software |
| `formfaktor` | RTINGS shape section | `"symmetrisk"`, `"ergonomisk"`, or `"ambidextrous"` |
| `greb` | RTINGS grip analysis | Array of `"palm"`, `"claw"`, `"fingertip"` |
| `haandStoerrelse` | RTINGS hand size recommendation | Array of `"lille"`, `"medium"`, `"stor"` |
| `prisNiveau` | Judged from typical price | `"budget"` (0–500 kr), `"mid"` (500–1000 kr), `"flagship"` (1000+ kr) |

### Copy — multi-source synthesis in Danish

Read the RTINGS review (and Techpowerup or retailer reviews if RTINGS is thin), then synthesize in Danish:

- **`beskrivelse`** — 1 tight paragraph. Mention the standout spec, what kind of player it's for, and ideally name-drop a known pro who uses it.
- **`fordele`** — 3–4 Danish bullet points. Be specific: mention grams, Hz, sensor name, battery hours.
- **`ulemper`** — 2–3 Danish bullet points. Honest weaknesses.

**Critical rule:** No price strings in copy. The CopyPoints Zod refine rejects `$` + digit patterns. Prices belong in `offers[].prisDkk` and `prices.json`.

Example from existing mice:
```ts
beskrivelse: "Razers letteste konkurrencemus. Med 55 gram og Razers Focus Pro-sensor er den et populært valg blandt CS2-pros - inklusive ZywOo.",
fordele: ["Kun 55 gram - ekstremt let", "Razers hurtigste sensor", "4000 Hz polling rate"],
ulemper: ["Høj pris", "Ikke velegnet til palm-greb", "Overfladen kan være glat for nogle"],
```

### Images

**Default: `billede: undefined`** — the mouse card renders the first letter of `brand` as a fallback. This is the correct starting state.

Only add an image if you can access a retailer product page (proshop.dk, maxgaming.dk) and download a verifiable product image. Save to `/public/images/mice/{slug}.{ext}` (use original extension — retain `.png`, `.jpg`, `.webp`). Do not guess or construct image URLs.

### Offers

Offers tell the system which retailers to track for this product. Prices come from the Adtraction XML feed, NOT from this skill.

For each retailer where the mouse is available:

1. Search **Partner-ads** or **Adtraction** affiliate portal for the product
2. Copy the product URL and affiliate URL
3. Use `basePayoutPct` from `src/data/retailers.ts` for the retailer's default rate
4. Add to the `offers[]` array:

```ts
offers: [
  {
    retailer: "proshop",
    produktUrl: "https://www.proshop.dk/...",
    affiliateUrl: "https://www.proshop.dk/...",
    payoutPct: 3.5,
    inStock: true,
  },
  {
    retailer: "maxgaming",
    produktUrl: "https://www.maxgaming.dk/...",
    affiliateUrl: "https://www.maxgaming.dk/...",
    payoutPct: 4.0,
    inStock: true,
  },
],
```

Valid retailer slugs (from `RETAILER_SLUGS`): `proshop`, `computersalg`, `maxgaming`, `coolshop`, `elgiganten`, `avxperten`, `dustinhome`, `komplett`, `billo`.

**Do NOT add `prisDkk` to offers.** Prices are populated by the Adtraction XML feed writing to `prices.json`. The feed matches on `{productSlug}__{retailerSlug}`.

Typical retailers per price tier:
- **Flagship / mid**: proshop + maxgaming (minimum two)
- **Budget**: proshop + coolshop + computersalg
- Always add every retailer where the product is available

## Step-by-step

### 1. Check for stub

If completing a stub: read `src/data/mice-todo.ts` for the `MouseStub` entry. This gives you the slug, navn, brand, and which pro needs it.

**Before starting, run the fuzzy duplicate check:**
```ts
import { findDuplicateSuggestions, isSlugTaken } from "@/lib/product-utils";
```
Pass the stub slug to `isSlugTaken(existingCatalog)` and `findDuplicateSuggestions(stub.navn, existingCatalog)`. If any existing product scores ≥ 0.5, verify it's actually a new product before proceeding — the stub may already exist under a slightly different slug/name.

If a completed entry already exists or the stub appears twice, deduplicate first — edit out the duplicate stub entry or skip if already done.

**When multiple stubs exist:** Group by brand and launch parallel research agents. Derive variant specs from existing entries where possible (see variant derivation above). Write all entries to `mice.ts` in a single edit pass rather than one at a time.

### 2. Source specs

Construct the RTINGS URL using the pattern in Data Sources above — search if the direct URL 404s.

If RTINGS hasn't reviewed it → try Techpowerup → manufacturer page (warn if manufacturer-only).

For niche brands (WLmouse, Ninjutso, Finalmouse, etc.) or variants of existing entries: skip RTINGS search entirely and go to Techpowerup/manufacturer directly.

### 3. Write copy

Read the RTINGS review prose (and Techpowerup/reterailers if available). Write fordele, ulemper, beskrivelse in Danish. No price language in copy.

### 4. Find offers

For each applicable retailer:
- Find the product page on the retailer's site
- Find the affiliate link in Partner-ads/Adtraction
- Use the retailer's `basePayoutPct` from `retailers.ts`

If a retailer doesn't carry the product, skip it.

### 5. Save image (optional)

Only if a product image was sourced from a retailer page (see Images section above). Save to `/public/images/mice/{slug}.{ext}`. Most entries ship with `billede: undefined` as the default — that's expected.

### 6. Add entry to `src/data/mice.ts`

Insert the complete entry into the `rawMice[]` array. Use the `MiceSansProBrugere` type — `proBrugere` is auto-derived from `pros.ts`.

If replacing a stub: replace the entire stub entry with the complete entry.

Maintain roughly alphabetical order by slug within the array. Follow the existing entry pattern exactly.

### 7. Clean up stub

If this was completing a stub: remove the entry from `src/data/mice-todo.ts`.

### 8. Verify

Run `npm run build`. Zod validation catches missing or mistyped fields.

If RTINGS wasn't available and specs came from manufacturer → warn: "Specs are manufacturer claims, not independently verified."

## Edge cases

### Mouse not on any retailer
Can't add offers. Add the mouse with empty `offers: []` and warn.

### Mouse not on RTINGS or Techpowerup
Use manufacturer specs. Warn that specs are unverified.

### Stub already removed from mice-todo.ts
Someone already completed it. Skip, report nothing to do.

### New esport-only brand (niche)
Same process — specs from wherever available, even if sparse. Better incomplete data than a missing entry blocking pros from rendering.

## What this skill does NOT handle

- **Price data** — `prisDkk` in offers or `prices.json` comes from Adtraction XML feed ingestion
- **New retailers** — requires updating `RETAILER_SLUGS` union in `types.ts` + `retailers.ts` entry
- **Other product categories** — keyboards, mousepads, headsets, monitors are separate skills
- **Blog posts** — product analysis articles live in `src/data/blog/`

## Key reference files

- `src/lib/types.ts` — MouseSchema, AffiliateOfferSchema, CopyPoints validation
- `src/data/mice.ts` — Existing mouse entries (pattern reference)
- `src/data/mice-todo.ts` — Stub tracking (read for stubs, clean up after completion)
- `src/data/retailers.ts` — Retailer slugs and base payout percentages
- `src/data/prices.ts` + `prices.json` — Price override system (feed-populated, do not edit)
