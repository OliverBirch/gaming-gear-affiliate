---
name: source-product-image
description: Use when sourcing/applying a product photo for any catalog category (mice, keyboards, headsets, monitors, mousepads) — "add an image", "find a product photo", "fix missing images", "work through the image backlog". Covers finding the backlog, verifying the correct product, background removal, and known sourcing gotchas.
---

# Source a product image

Workflow for filling in a missing `billede` field, for any of the 5 catalog
categories. Complements `add-mouse`/`add-headset`'s own "Images" sections —
this is the deeper reference for the sourcing + background-removal part,
and the only guidance that exists for keyboards/monitors/mousepads (they
have no dedicated add-* skill).

## 1. Find the backlog, prioritized correctly

`/admin` tracks missing images for all 5 categories (`checkMissingImages` in
`src/lib/data-health.ts`, generalized 2026-08-09 — previously mice-only).
Don't just work through a category's list top-to-bottom or pick by raw
per-category count — **cross-reference against real pro-usage first**:

- Mice: `pros.filter(p => p.musSlug === slug).length`
- Keyboards/headsets/monitors/mousepads: `get{Category}ProSlugs(slug).length`
  from `src/data/pros-peripherals-mapping.ts`

This matters: a mice-only missing-image view once made mice look like the
priority, but the real highest-impact gaps turned out to be non-mice
flagship products (a monitor used by 83 pros, a keyboard by 73, a headset
by 58 — all with zero photo) while the worst mouse gap topped out at 3 pro
users. Category-level counts alone are misleading.

## 2. Find the real product image

Search for the manufacturer's own product page first — it's most likely to
have a clean isolated packshot and confirms the correct SKU/colorway.
Fall back to a retailer's product-listing photo (Amazon-style listings are
usually plain white background per marketplace image guidelines).

**Reject:**
- Lifestyle/desk-scene shots (mouse + keyboard + headset + chair all in
  frame) — a real anti-pattern already found and fixed twice in this
  catalog (`logitech-g-pro-x-superlight-2`, and the default hero image on
  `razer-huntsman-v3-pro`'s own product page). If the gallery has multiple
  images, look for an isolated one instead of settling for image #1.
- Marketing graphics with retailer branding/watermarks/banners baked in.
- Corner-detail or folded-corner shots for mousepads — need the full
  top-down flat lay.

**Never source from maxgaming.dk** — not a real affiliate partner, removed
from the catalog 2026-08-08 (see AGENTS.md).

**Known-dead source:** `logitechg.com` is unreachable via WebFetch —
consistently returns `Parse Error: Header overflow` across every URL and
locale tried (en-us, da-dk, shop path, archive.org snapshot). Don't retry
it — go straight to a retailer CDN. Newegg's product-image URLs
(`c1.neweggimages.com/productimage/{size}/{sku}.jpg`, try `nb1280` for a
larger size than the default `nb640`) work cleanly and are easy to
correct-product-verify against the retailer's own listing text.

**Verify before downloading:** cross-check brand/model/colorway/variant
(wireless vs wired, size, layout) against the catalog entry's own fields.
The `hyperx-cloud-ii` vs `hyperx-cloud-ii-wireless` confusion is a known
trap (see AGENTS.md's peripheral-mapping gotchas) — applies to image
sourcing too, not just text matching.

## 3. Determine if background removal is needed

Check the source image's actual background:
- **Already alpha-transparent** (common from official CDNs — BenQ's Scene7
  server, Corsair's Cloudinary, Sony's Adobe Dynamic Media all serve real
  alpha when requested with `fmt=png-alpha` or similar) — verify with a
  quick pixel check (see step 4) and use directly, no processing needed.
- **Already near-black** (`rgb` close to the site's card background,
  `#0d0d0d`) — no processing needed, it'll blend on its own. Confirm with
  `sharp().raw()` and check the corner pixel value.
- **White/light studio background, high-contrast product** (a black/red
  headset on white, say) — safe to flood-fill with
  `scripts/remove-background.mjs`.
- **White/near-white product on a white/light background** — too risky
  for automated flood-fill, it can't tell product from backdrop. File a
  `bad-product-image` freshness ticket instead of guessing (see the 4+
  precedent tickets in `src/data/freshness-tasks.ts`, e.g.
  `g-wolves-hts-pro-4k-white-on-white-2026-08-08`).

## 4. Remove background correctly (when needed)

Use `scripts/remove-background.mjs` — border-seeded flood fill with a
two-threshold alpha fade:

```
node scripts/remove-background.mjs <input> <output> [--full=245] [--edge=200]
```

**Don't trust the defaults blindly — calibrate per image:**

1. Sample actual pixel luminance at the image border (definitely
   background) and at the product's darkest point, e.g.:
   ```js
   sharp(src).raw().toBuffer({resolveWithObject: true}).then(({data, info}) => {
     // print data[idx] at known border/product coordinates
   });
   ```
2. Set `--edge`/`--full` inside the real contrast gap you find. A smooth
   *gradient* studio backdrop (seen on Artisan's mousepad photography)
   needs a *narrow* band tucked into the gap between background-floor and
   product-ceiling (e.g. `--edge=100 --full=170`) — the default band
   (`200`–`245`) can span most of a wide gradient and leave a visible soft
   gray glow instead of a clean cutout. A flat white background with a
   sharp product edge tolerates the defaults fine.

**Verify the result by compositing against the site's actual dark card
background — never just eyeball it on a white canvas:**

```js
sharp({create: {width: W, height: H, channels: 3, background: '#0d0d0d'}})
  .composite([{input: outputPath}])
  .png().toFile(previewPath)
```

Then look at the preview. A halo, glow, or visible box edge means the
thresholds are wrong — retune and re-run before applying. This is the
step that catches gradient-background failures; they look completely
clean on white and only show up composited on the real dark background.

Also spot-check alpha directly: corner pixel should be `alpha === 0` for
a properly transparent PNG (`data[3]` from a raw buffer read).

## 5. Apply

- **Normalize before saving**, so the file matches the rest of the catalog
  instead of carrying whatever margin/aspect-ratio the source happened to
  have: `node scripts/normalize-image.mjs <input> <output>`. This trims
  the image to its content bounding box (needs real alpha transparency —
  run after step 4's background removal, or directly if the source was
  already alpha) and pads it onto a square canvas sized so the product's
  longest edge fills ~92% of the frame, capped at 1400px. Don't skip this
  even for a source that already looks tightly cropped — the point is
  every catalog image ending up at the same fill ratio, not just this one
  looking fine in isolation.
- Save to `public/images/{category}/{slug}.{ext}` — category folder names:
  `mice`, `keyboards`, `headsets`, `monitors`, `mousepads`. Prefer `.png`.
- Set `billede` in the **raw JSON** (`src/data/{category}.json`), not the
  `.ts` transform layer — it's a direct passthrough field. Some entries
  are missing the `billede` key entirely rather than having it as `null`;
  either works, but if adding the key fresh, insert it alphabetically
  (matches the existing key ordering in that file).

## 6. Verify

Run `tsc --noEmit`, `npm run validate-data`, `vitest run`, and a full
`next build` (prerenders every product page via `generateStaticParams` —
catches anything the other checks miss). Optionally spot-check via the dev
server: `curl` the `/_next/image?url=...` response for `200` +
`image/png`, and check `/admin`'s per-category "uden billede" stat card
dropped by one.
