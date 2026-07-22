---
name: add-pro
description: Use when the user types "add pro" or "tilføj pro" or asks to add a new esports player/pro to the site. Walks through sourcing data from prosettings.net, editing pros.ts, peripherals, and handling unknown mice.
---

# Add Pro

Walkthrough for adding a new esports pro to ProSetups.dk.

## Data source

**Single source of truth:** `https://prosettings.net/lists/{esport}/` (pick the right esport page).

If the player is not listed on prosettings.net → **skip and report**. Do not fall back to other sources.

### Per-player detail page

For peripherals (monitor, keyboard, mousepad, headset), open the player's individual page on prosettings.net (click their row in the table).

## Step-by-step

### 1. Source the data

From the prosettings.net table, extract:

| Field | Source | Notes |
|---|---|---|
| `navn` | Display name column | Use exact spelling |
| `slug` | Derived from navn | Lowercase, alphanumeric + hyphens only. Matches the URL-friendly handle. |
| `hold` | Team column | e.g. "Team Spirit" |
| `land` | Flag + country | Danish country names: Rusland, Frankrig, Ukraine, Danmark, etc. |
| `musSlug` | Mouse column | Map the mouse name to the internal slug in `mice.ts`. If the mouse doesn't exist → see step 4. |
| `dpi` | DPI column | Number |
| `inGameSens` | Sensitivity column | Number (use `.` for decimal) |
| `pollingHz` | Polling rate column | Number. If missing from prosettings, omit the field. |
| `edpi` | Computed | `Math.round(dpi * inGameSens)` |
| `monitor` | Player detail page | Free text from prosettings |
| `keyboard` | Player detail page | Free text from prosettings |
| `mousepad` | Player detail page | Free text from prosettings |
| `headset` | Player detail page | Free text from prosettings |
| `sidstVerificeret` | Today | ISO format `YYYY-MM-DD` |
| `kilde` | Always | `"prosettings.net"` |

### 2. Add pro to `src/data/pros.ts`

Insert the entry into the `pros[]` array. Maintain alphabetical-ish order by slug within the same esport.

```ts
{
  slug: "donk",
  navn: "donk",
  esport: "cs2",
  hold: "Team Spirit",
  land: "Rusland",
  musSlug: "logitech-g-pro-x-superlight-2",
  settings: { dpi: 800, inGameSens: 1.25, edpi: 1000, pollingHz: 4000 },
  kilde: "prosettings.net",
  sidstVerificeret: "2026-07-15",
},
```

**Required fields:** `slug`, `navn`, `esport`, `musSlug`, `settings` (dpi, inGameSens, edpi), `kilde`, `sidstVerificeret`.

**Optional fields:** `hold`, `land`, `billede`, `tastaturSlug`, `musemaatteSlug`, `settings.pollingHz`.

The `esport` slug must match an entry in `src/data/esports.ts` (currently `cs2`, `valorant`, `r6`).
The `musSlug` must match a slug in `src/data/mice.ts` — if not, see step 4.

### 3. Add peripheral data

**If available**, add an entry to `src/data/pros-peripherals.json`:

```json
"donk": {
  "monitor": "ZOWIE XL2586X+",
  "keyboard": "Wooting 80HE Frost",
  "mousepad": "SteelSeries QcK Large Black",
  "headset": "HyperX Cloud II"
}
```

If the monitor/keyboard/mousepad/headset text can be mapped to a catalog product slug, add a `match()` rule in `src/data/pros-peripherals-mapping.ts`. Follow the existing pattern:

```ts
if (lower.includes("wooting") && lower.includes("80he")) return "wooting-80he";
```

If peripherals are missing from prosettings → **warn but proceed** with what's available.

### 4. Unknown mouse

If the pro's mouse slug does not exist in `src/data/mice.ts`:

1. **Add a stub entry** to `src/data/mice.ts` with `// STUB — needs completion` comment. Use placeholder values:
   ```ts
   // STUB — needs completion. Tracked in mice-todo.ts
   {
     slug: "new-mouse-slug",
     navn: "Mouse Name from Prosettings",
     brand: "Brand from Prosettings",
     vaegtGram: 0,
     laengdeMm: 0,
     breddeMm: 0,
     hoejdeMm: 0,
     formfaktor: "symmetrisk",
     greb: [],
     haandStoerrelse: [],
     wireless: false,
     forbindelse: "",
     batteritidTimer: null,
     sensor: "",
     maxDpi: 0,
     pollingHz: 0,
     switchType: "mekanisk",
     knapper: 0,
     lodMm: 0,
     softwarePaakraevet: false,
     prisNiveau: "mid",
     billede: undefined,
     offers: [],
     beskrivelse: "",
     fordele: [],
     ulemper: [],
     proBrugere: [],
   },
   ```

2. **Add a todo entry** to `src/data/mice-todo.ts`:
   ```ts
   { slug: "new-mouse-slug", navn: "Mouse Name", brand: "Brand", sourcePro: "pro-slug", sourceUrl: "https://prosettings.net/..." },
   ```

3. Report in output: **"Mouse `{slug}` created as a stub. Run the mouse-add skill to complete it."**

### 5. Add player image

Player avatars live on prosettings.net's CDN. **Download as `/public/images/pros/{slug}.png`** — always save as `.png` regardless of source format.

Try URLs in this order until one downloads successfully (200, non-empty body):

1. `https://prosettings.net/wp-content/uploads/{slug}-220x220-fitcontain-q99-gb283-s1.png`
2. `https://prosettings.net/wp-content/uploads/{slug}-1-220x220-fitcontain-q99-gb283-s1.png`
3. `https://prosettings.net/wp-content/uploads/{slug}.png`
4. `https://prosettings.net/wp-content/uploads/{slug}.webp`

**Detect before downloading:** Fetch the player's individual detail page and look for `<link rel="preload" as="image" href="...">` in the `<head>`. The `href` reveals the exact upload filename — use it directly instead of guessing.

**Skip if:** The preload `href` contains `placeholder-` (generic silhouette, not a real photo). ProAvatar will render the player's initial letter instead.

If the preload tag isn't found, fall through the URL chain above. If none work, skip — ProAvatar handles missing images gracefully.

### 6. Verify

- Run `npm run build` — Zod validation catches missing required fields or type errors.
- Check the pro renders at `/pro/{slug}`.

## Key reference files

- `src/lib/types.ts` — Zod schemas (ProSchema, ProSettingsSchema, etc.)
- `src/data/pros.ts` — Pro data array
- `src/data/pros-peripherals.json` — Free-text peripheral data
- `src/data/pros-peripherals-mapping.ts` — Text-to-catalog slug mapping
- `src/data/mice-todo.ts` — Incomplete mouse tracking
- `src/data/mice.ts` — Mouse catalog (check if mouse exists)
- `src/data/esports.ts` — Valid esport slugs
