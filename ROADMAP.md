# Roadmap

Where ProSetups.dk stands and what's next. Phases are the big picture; for
live, always-accurate numbers (stub mice, missing offers, stale pros, price
coverage %) check `/admin` and `/admin/tickets` — those are computed from
data at build time and will drift out of sync with reality faster than this
file can be hand-updated, so this file doesn't try to duplicate them.

**How to keep this current:** after a session that finishes or meaningfully
advances a phase, flip its status and add one line to the Log below. Don't
put per-product counts here — link to `/admin` instead.

Status legend: ✅ done · 🔄 in progress · ⬜ not started

---

## Phase 1 — Platform foundation ✅

Static Next.js site, Danish routes, Zod schemas as source of truth, generic
affiliate offer resolution, Schema.org JSON-LD, `/api/redirect` click
tracking, GA4 wiring. Five product categories built out (mice, keyboards,
mousepads, headsets, monitors), each with list + detail routes, brand pages,
and sitemap entries.

## Phase 2 — Pro data (the moat) ✅ (ongoing maintenance)

300+ pros across CS2, Valorant, and R6. Liquipedia integration for
team/roster tracking. Peripheral fuzzy-matching system linking free-text
gear to the catalog. Admin health dashboard, freshness-ticket system, and a
weekly re-verify routine keep this from going stale — see the "Data
freshness" checklist in `AGENTS.md`.

## Phase 3 — Real affiliate program integration 🔄

Partner-ads.com is wired up (`partnerid=57198`). Status per retailer:

- **Proshop** — ✅ real XML feed integrated (2026-08-07), re-verified against
  a *fresh* feed download and reconciled across all 5 categories
  (2026-08-08). The original "verified" list was itself partly contaminated
  — 6 of 14 mice marked verified in `scripts/proshop-ean-matches.json` had
  suspiciously sequential fabricated IDs (3173290–3173293), hand-typed
  placeholders despite the "verified" label. All 6 now point at real,
  feed-confirmed product URLs. 24 products total are now feed-verified with
  real per-product URLs (mice) or confirmed prices (keyboards/headsets/
  monitors/mousepads, which only ever show a generic category-page link, not
  a per-product one). 25 products that were never feed-matched (9 mice, 5
  keyboards, 7 headsets, 3 monitors, 7 mousepads — including some
  flagship-looking links like `razer-viper-v3-pro`/`v4-pro` that turned out
  to be guessed) had their Proshop offer removed rather than left unverified.
  See the 2026-08-08 Log entry for the full reconciliation.
- **Ultrashop** — partnership sunset 2026-08-08. All references removed
  (retailer entry, deeplink env, keyboard search URL, prices.json overrides,
  matching scripts). `logitech-g915-tkl` and `steelseries-apex-pro-tkl-gen-3`
  lost their verified Ultrashop offer as a result — back to whatever other
  coverage they have.
- **Geek'd** — ✅ onboarded 2026-08-08, EAN-verified and applied across all 5
  categories (2026-08-08). Gaming-specific Shopify retailer (geekd.dk), 1,279
  products, real payout (4%) and cookie window (40d) confirmed by the user.
  `scripts/match-geekd-eans.mjs` (adapted from the Proshop matcher) run
  against the real feed. **Mice** get real per-product URLs — 6 verified and
  applied: `logitech-g403-hero`, `razer-deathadder-v4-pro`,
  `logitech-g-pro-x-superlight-2c`, `razer-deathadder-v3`,
  `logitech-g-pro-x-superlight-2`, `logitech-g-pro-2-lightspeed`.
  **Keyboards/headsets/mousepads** now have `"geekd"` wired into their
  offer-builders (`KB_SEARCH_URLS` in `keyboards.ts`, `OFFER_CONFIG` in
  `headsets.ts`, `SEARCH_URLS`/allowlist in `mousepads.ts`, all pointing at
  Geek'd's real category-page URLs, confirmed live) — 1 keyboard
  (`logitech-g915-tkl`), 3 headsets (`razer-blackshark-v2-pro`,
  `logitech-g-pro-x`, `hyperx-cloud-iii`; a 4th, `logitech-g-pro-x-2`, also
  applied), and 1 mousepad (`steelseries-qck-large`) verified and applied.
  Two candidates were deliberately **not** applied: `hyperx-cloud-ii` was a
  confirmed false positive (feed's "Cloud II Trådløs" wireless listing
  matched our wired catalog entry when a separate `hyperx-cloud-ii-wireless`
  slug existed — the matcher only had ASCII-transliterated "tradlos" in
  `DISALLOWED_EXTRA`, not proper-Danish "trådløs"; fixed for future runs,
  but the correct wireless-slug match still needs a cross-language synonym
  fix, not yet done); `steelseries-qck-heavy` has an unresolved multi-size
  EAN ambiguity (catalog `ean` likely represents one size, feed EAN a
  different one) and was left for a future pass. Monitors: no Geek'd
  candidates found in this catalog's SKUs.
- **Computersalg, Coolshop, AVXperten, Dustin Home, Komplett, Billo** — ⬜
  retailer entries exist in `retailers.ts`, no real feed sourced yet.
- **MaxGaming (Adtraction)** — ❌ **removed entirely, 2026-08-08.** Confirmed
  by the user to never have been a real affiliate partner ("old
  infrastructure we used to test with"). Removed from `RETAILER_SLUGS`,
  `retailers.ts`, `ALLOWED_REDIRECT_HOSTS`, every category's data files, all
  9 `prices.json` overrides, the admin dashboard's old-URL health check and
  image-autofix feature (`data-health.ts`), test fixtures, and user-facing
  copy. It had been the hardcoded `fallbackRetailer` for headsets/monitors
  and keyboards' `kbOffers()` was actively *synthesizing* a fake
  maxgaming.dk search URL for any unrecognized retailer — both removed
  outright (no offer shown when nothing's verified, rather than a synthetic
  fallback link). Paired with the Geek'd wiring above so the categories that
  lost their only offer weren't all left empty.

Every outbound link across the site remains placeholder/unverified until a
network confirms live click tracking — that's a real milestone to hit, not
just a data-quality task.

**Product image consistency 🔄** — `match-proshop-images.mjs` now covers the
whole catalog (not just missing-image products, via an `IMAGES_MISSING_ONLY`
opt-in flag to restore the old scope), reusing the same exact-EAN-first
matching as the price/link work. First pass (2026-08-08): 36 of 97 products
got a fresh, feed-verified product photo — 32 from Proshop, 4 from Geek'd
(reusing `scripts/geekd-ean-matches.json`'s `imageUrl`, `hyperx-cloud-ii`
excluded since that specific match is already known-wrong for pricing).
Several replaced genuinely inconsistent art — `logitech-g-pro-x-superlight-2`
had a full desk-scene lifestyle photo, `razer-viper-v4-pro` had a product
*box* shot, not the mouse — with a clean isolated product photo matching the
rest of the catalog's style. All 36 fetched photos have since had their
white studio backgrounds removed (flood-fill + alpha fade) so they blend
into the site's dark cards; see the Log for the corruption this surfaced
and fixed along the way. A follow-up sweep of the *rest* of the catalog's
existing photos found one more safe case (`wlmouse-beast-x-pro`, black
mouse on white, now also transparent) plus 4 that need human judgment
rather than automated flood-fill — `vaxee-xe-wireless`'s image is actually
a marketing infographic, not a product photo, and `g-wolves-hts-pro-4k`/
`pulsar-jinggg-x`/`ninjutso-sora-v2` are white-on-white shots where
flood-fill risks eating into the product silhouette. All 4 filed as
`bad-product-image` tickets (new ticket type) in `/admin/tickets` rather
than guessed at automatically. **61 products still have no feed-verified
image source** (same boundary as the price/link work — neither feed
matched them); tracked as a follow-up, not yet a ticket of its own. The
`/musemaatter` list page also doesn't render `billede` at all yet
(unrelated pre-existing gap, found during this pass) — mousepad detail
pages show the real photo, list cards still show a monogram.

## Phase 4 — Full DK retailer coverage ⬜

Goal: every catalog product has at least one real, priced, verified DK
retailer offer — or, where no DK retailer carries it, a documented closest
substitute instead of a dead end.

Currently open as a tracked ticket: **33 mice, 5 keyboards, 4 monitors, 14
mousepads** have zero retailer offers (mostly boutique brands — Vaxee,
Finalmouse, Fnatic, PMM, Waizowl, Fallen Gear, Sony Inzone, assorted ZOWIE
regional SKUs — plus several products whose only offer turned out to be an
unverified/fake link removed 2026-08-08). See `/admin/tickets` → "No
retailer coverage" for the current list and method.

## Phase 5 — Launch readiness ⬜

- Affiliate program(s) confirmed live: real clicks tracked, real commissions
  attributed, not just placeholder URLs.
- Phase 4 substantially closed (coverage or documented substitute for every
  product).
- Freshness routine running unattended on its weekly cadence without manual
  rescue sessions.

---

## Log

- **2026-08-07** — Proshop XML feed (partner-ads, partnerid 57198)
  integrated: exact-EAN + strict fuzzy matcher built, 10 EANs harvested into
  the catalog, images/prices/offers wired for ~16 products across
  mice/keyboards/headsets/monitors. Found and fixed a duplicate stub
  (`razer-deathadder-v3-pro`) misdirecting two pros. Found and fixed a class
  of silently-inert price overrides (three different offer-resolution
  patterns across mice/keyboards/headsets/monitors — see `affiliate.ts` /
  `build-offers.ts`). Opened the retailer-coverage ticket for Phase 4.
- **2026-08-07 (cont.)** — Started working the retailer-coverage ticket:
  cross-checked the old, unapplied `ultrashop-ean-matches.json` against known
  EANs and applied the 2 that verified clean, including real DK coverage for
  `logitech-g915-tkl` (confirmed absent from Proshop's own feed — removed the
  stale `proshop` retailer tag it had been carrying). Found and fixed a third
  instance of the silently-inert-override bug class: `kbOffers()` hardcoded
  `inStock: true` on every generated keyboard offer, which meant a
  `prices.json` `inStock: false` override could never actually apply. Added
  a verified Ultrashop keyboard category URL (confirmed live via fetch, not
  guessed).
- **2026-08-08** — Ultrashop partnership sunset; all references removed
  (see Phase 3). Onboarded Geek'd as a new Partner-ads retailer (4% payout,
  40-day cookie, confirmed by user — not guessed). Iteratively hardened the
  Proshop matcher's extra-token logic against real ground truth: switched
  from an allowlist to a default-allow/known-dangerous-marker design (an
  allowlist can't keep up with a 270k-product catalog's colorway
  vocabulary), then found and fixed several new false-positive classes this
  surfaced — keyboard/headset layout-region words (ANSI/Fransk), console-
  platform variants (FOR PS), product-type confusion (Cloud II vs Cloud
  Earbuds II), bundle/accessory confusion (wrist-rest bundle, travel case
  reusing a keyboard's model code), and two more Danish-character
  transliteration bugs (blå, håndledsstøtte) of the same kind found earlier.
  Applied 7 more verified products to the catalog as a result.
- **2026-08-08 (cont.)** — Ran and verified `match-geekd-eans.mjs` against
  the real Geek'd feed (9,637 products) for the first time. Found and fixed
  a category-mapping typo (`møsemåtte`→`måsemåtte`) that was silently
  dropping 126 of 183 mousepad candidates — confirmed via a full category
  census against the feed, not just the one known instance. Added
  ground-truth EAN cross-checking (comparing the feed's EAN against each
  catalog product's own recorded `ean`) as a review step alongside manual
  name comparison; it caught a real false positive (`steelseries-arctis-
  nova-pro-wireless` matched to an Xbox-specific "Nova Pro X Wireless" SKU
  with a different EAN) that the token-based matcher alone had missed —
  added bare `"x"` to `DISALLOWED_EXTRA` as a result. Also learned the
  ground-truth check needs EAN normalization: a `hyperx-cloud-iii` "mismatch"
  turned out to be the same EAN with/without a leading zero, not a real
  conflict. All 6 mice candidates passed review clean on the first pass
  (0 rejections) — the Proshop-tuned `DISALLOWED_EXTRA` list transferred to
  Geek'd's Shopify-style naming without further hardening needed for mice.
  Applied all 6 to the catalog (`ean` added where missing, `geekd` offer +
  `prices.json` override for each) — see Phase 3 for the list and the
  explicit scope decision to defer keyboards/headsets/mousepads/monitors
  until their offer-builders are wired for a `"geekd"` retailer.
- **2026-08-08 (cont.)** — Re-verified outbound links flagged as stale,
  starting from a user report on one product page. Found the root cause
  wasn't one bad link: 11 mice used an old `/da/tilbehoer/mus/{slug}`
  MaxGaming URL pattern (all 404, confirmed with a real browser user-agent
  — curl's default UA was getting a misleading 403 from Proshop on the same
  check, a false alarm). Fixed 5 with verified live replacements
  (`logitech-g-pro-x-superlight-2`, `razer-viper-v3-pro`, `zowie-ec2-dw`,
  `finalmouse-starlight-pro-small`, `lamzu-maya-x`); the other 6 turned out
  to be genuinely no longer carried by MaxGaming at all (discontinued,
  superseded generation, or wrong tier — not just a URL change), so those
  offers were removed rather than guessed, with 5 freshness tickets opened
  (the 6th, `pulsar-x2`, kept its Proshop offer). Also found and fixed the
  same stale-pattern bug at the category level for monitors and mousepads
  (`maxgaming` and `coolshop` category-listing URLs), which silently affects
  every product in those categories at once. **Superseded same day**: the
  MaxGaming URL fixes made here (the 5 replacements + the category-page
  fixes) are moot now that MaxGaming is confirmed fake and slated for full
  removal — see below. Left as-is rather than reverted, since the removal
  itself is paused; a future session doing the removal will delete these
  along with everything else MaxGaming.
- **2026-08-08 (cont.)** — User clarified MaxGaming has no real affiliate
  deal at all ("old infrastructure we used to test with") and the same
  applies to Proshop links never confirmed against the real feed. Two
  Explore agents scoped the full removal (see Phase 3 bullets for MaxGaming
  and Proshop above for the complete findings — zero-coverage fallout,
  fabricated-ID mice, generic-category-page contamination across
  keyboards/headsets/monitors/mousepads). User decided: apply the removal
  to all categories, not just mice, and pair it with wiring Geek'd into
  keyboards/headsets/mousepads to recover real coverage instead of leaving
  those categories empty. Paused, then approved for execution same day —
  see the next entry.
- **2026-08-08 (cont.)** — Executed the MaxGaming removal + Proshop
  re-verification + Geek'd wiring in full. MaxGaming: removed from the type
  system, retailer config, redirect allowlist, all 5 category data files (16
  mice + all keyboards/headsets/monitors/mousepads offers), 9 price
  overrides, the admin dashboard's dedicated old-URL health check, 3 test
  fixture files, and 6 user-facing copy locations + the AGENTS.md workflow
  section documenting it. `buildFlatOffers`/`mousepads.ts`'s synthetic
  "fallback offer when nothing's priced" behavior was removed entirely as
  part of this — a product with zero verified retailers now shows no offer,
  not a fake one. Proshop: downloaded a fresh feed (not the stale local
  copy) and re-ran the matcher (now with the same htmlurl-extraction/
  ground-truth-EAN/collision-check hardening built for Geek'd); reconciled
  every product currently claiming a Proshop offer against the fresh
  25-match result — 24 fixed with real feed-confirmed URLs/prices (including
  all 6 of the fabricated-ID mice found earlier — real matches existed for
  all of them), 25 removed as never-verified. Geek'd: wired into
  keyboards.ts/headsets.ts/mousepads.ts (real, live-verified category-page
  URLs), applied 1 keyboard + 4 headsets + 1 mousepad.
  **A scripting mistake mid-pass**: an initial line-based removal script for
  mice.json's Proshop offers had a logic bug (it associated offers with the
  wrong mouse, since `"slug"` appears *after* `"offers"` in this file's key
  order, not before) — it silently stripped 5 mice's *correct* Proshop
  offers while leaving 5 *incorrect* ones in place. Caught immediately via a
  full before/after reconciliation against the fresh-match baseline (not
  trusting the script's own success output) and hand-fixed; a second,
  larger removal (mice.json's per-product URL fixes, plus keyboards/
  headsets/monitors/mousepads' simpler single-line price removals) was done
  with dry-run verification first after that. Updated the consolidated
  no-retailer-coverage ticket (`freshness-tasks.ts`) to the current accurate
  zero-coverage list: 33 mice, 5 keyboards, 4 monitors, 14 mousepads — up
  from ~27 mice before this pass, since being honest about verification
  status surfaces gaps that generic/fake links had been silently papering
  over. `npm run build` + `vitest` + `validate-data` all pass; spot-checked
  rendered pages for the geekd/proshop fixes and confirmed the two
  now-zero-coverage examples (`hyperx-cloud-ii`) correctly show no offer.
- **2026-08-08 (cont.)** — Product image consistency pass, prompted by a
  request to get more uniform product photography across the catalog.
  Validated the approach on the top 3 mice by pro-usage count before going
  wide: `logitech-g-pro-x-superlight-2`'s image was a full lifestyle desk
  scene (monitor, keyboard, headset all in frame) and `razer-viper-v4-pro`'s
  was a sealed retail *box*, neither a photo of the product alone — both
  replaced with clean isolated shots from Proshop's feed; the third
  (`razer-viper-v3-pro`) already had a good isolated shot, confirming the
  EAN matcher finds the right product rather than just a plausible one.
  Extended `match-proshop-images.mjs` to re-match every catalog product
  (previously gap-filling only, missing-image products), re-ran against a
  fresh feed: 32 exact-EAN matches, all applied. Reused
  `scripts/geekd-ean-matches.json` (already carries `imageUrl` per match)
  as a fallback for 4 more products Proshop didn't cover, explicitly
  excluding `hyperx-cloud-ii` since that match is the same wired/wireless
  false positive already known from the pricing pass. Downloaded all 36,
  handled extension changes (old file removed when the new one's extension
  differs), and updated each product's `billede` field via a script that
  scanned the raw text between consecutive `"slug"` lines. **That script's
  "doesn't depend on key order" claim was wrong** — it silently corrupted
  `headsets.json` (7 targets + 1 uninvolved product got each other's
  `billede` values, chained one-object-off) and `mousepads.json` (3
  uninvolved products) in files where `slug` is the *first* key, because the
  scan window then captured the wrong object's own field first. Caught and
  fixed in the same 2026-08-08 session (see below) before it reached a
  commit. 61 products remain without a verified image source from either
  feed. Build/tests/validate-data all pass; confirmed via the dev server
  (restarted, since Next.js dev doesn't reliably hot-pick-up JSON data
  changes) that the new images actually render.
- **2026-08-08 (cont.)** — Background removal + corruption fix. Added a
  flood-fill script (`sharp`, border-seeded BFS treating near-white pixels
  as background, two-threshold smooth alpha fade to avoid drop-shadow
  halos) to strip the white studio backdrops from the 36 freshly-fetched
  photos, since they read as white boxes against the site's dark cards.
  Validated on 3 sample mice before running wider. Applying it surfaced the
  `billede`-field corruption described above via a full slug-vs-filename
  audit across all 5 category files: `headsets.json` (8 mismatches) and
  `mousepads.json` (3 mismatches, all non-target casualties) were wrong;
  `mice.json`/`keyboards.json`/`monitors.json` were unaffected. Fixed by
  reconstructing the corruption chain (each target's write had landed on
  the *preceding* object in file order) and cross-checking the recovered
  values against `proshop-image-matches.json`/`geekd-ean-matches.json`;
  restored the 4 uninvolved casualties to `null` via `git show HEAD:...`.
  Also found the original bg-removal pass had, as a side effect of reading
  through the then-corrupted `billede` pointers, skipped 2 files entirely
  and double-processed 1 — fixed by re-running removal on the skipped
  files and re-fetching+reprocessing the double-processed one from
  Proshop. Separately found 13 more products (8 mice, 2 keyboards, 3
  mousepads) whose `billede` still pointed at a pre-removal `.jpg`/`.webp`
  extension while the actual file had already been renamed to `.png` —
  fixed those too, but only after a second scripting mistake (a
  slug-tracking regex that got confused by mice.json's key order and wrote
  7 wrong products' `billede` fields) was caught via diff review and
  reverted before it could compound. Full audit (slug-match + on-disk
  existence + orphan sweep) now shows zero issues across all 5 files;
  `tsc`/`build`/`vitest`/`validate-data` all pass; spot-checked 5 pages via
  the dev server (2 headsets, 1 mousepad detail, 1 mouse, the headset list)
  and confirmed correct products with clean transparent backgrounds. Along
  the way noticed `mousepad-card.tsx` (the `/musemaatter` list view) never
  reads `billede` at all — every mousepad card shows a brand-initial
  monogram regardless of whether a photo exists. Pre-existing, unrelated to
  this pass, not yet fixed — worth a follow-up ticket since mousepads now
  have the same feed-verified photos as every other category but nothing
  surfaces them on the list page (detail pages render them correctly).
- **2026-08-08 (cont.)** — Extended background removal beyond the 36
  freshly-fetched photos to the rest of the catalog's existing images.
  Surveyed all 44 products with a photo for actual transparency (not just
  file extension): 36 already fixed, 1 (`logitech-g-pro-x` headset)
  correctly left alone since its background is a genuine dark studio shot,
  not white. Of the remaining 7 old, never-touched mouse images:
  `wlmouse-beast-x-pro` was a clean black-mouse-on-white case, background-
  removed and applied the same way as the rest. `finalmouse-starlight-pro-
  small` already has a dark background, no action needed. The other 5 got
  filed as tickets instead of an automated attempt: `vaxee-xe-wireless`'s
  file turned out to be a marketing infographic (dev-philosophy copy,
  latency charts), not a product photo at all — no amount of background
  removal fixes that. `g-wolves-hts-pro-4k`, `pulsar-jinggg-x`, and
  `ninjutso-sora-v2` are white-or-light mice shot on white backgrounds,
  where flood-fill can't reliably tell product from backdrop and risks
  cutting into the product itself — left as-is rather than risk a
  corrupted image. Added a `bad-product-image` ticket type (extending the
  closed `FreshnessTicket["type"]` union, plus its `ICONS`/`LABELS` entries
  in `/admin/tickets` — `tsc`'s `Record<...>` exhaustiveness check catches
  a missing entry at compile time) and filed all 4. Build/tests/
  validate-data pass; spot-checked the new render on the dev server.
