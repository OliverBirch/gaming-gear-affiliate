# Roadmap

Where ProSetups.dk stands and what's next. Phases are the big picture; for
live, always-accurate numbers (stub mice, missing offers, stale pros, price
coverage %) check `/admin` and `/admin/tickets` — those are computed from
data at build time and will drift out of sync with reality faster than this
file can be hand-updated, so this file doesn't try to duplicate them, with
one deliberate exception: the "Data completeness" section below, which the
user asked to be tracked here explicitly. Treat it as a dated snapshot, not
a live number — refresh it by recomputing (see its own note), not by
hand-editing individual percentages.

**How to keep this current:** after a session that finishes or meaningfully
advances a phase, flip its status and add one line to the Log below. Don't
put per-product counts here — link to `/admin` instead (except the Data
completeness snapshot, see above).

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

## Data completeness snapshot (2026-09-03)

Computed by walking the real transform-layer data (`pros`, `mice`,
`keyboards`, `headsets`, `monitors`, `mousepads`) against four axes — has an
image *file on disk*, has ≥1 retailer offer, has non-empty copy
(beskrivelse + fordele + ulemper), and isn't stale/unverified — then
averaging the axes that actually apply to that category. "Overall" is an
unweighted average of its row's columns, not a business-weighted score
(e.g. a mouse missing offers hurts its % the same as one missing a photo,
even though offers matter more) — read the columns, not just the last one,
before prioritizing work.

**Pros** (366 total) — offers/copy don't apply; "peripherals" replaces them.
Recomputed 2026-09-03:

| Image | Has peripheral entry | Full setup (4/4 fields) | Verified (≤90d) | Overall¹ |
|---|---|---|---|---|
| 94% (345/366) | 94% (343/366) | 89% (324/366) | 98% (357/366) | **95%** |

The image column **fell from a reported 100% to 94%, and the old number was
the wrong one.** 345 pros carry a `billede`, every one of which resolves to
a real file, and 21 carry none — the 2026-08-10 "100% (366/366)" counted
files in `public/images/pros/` without checking that a pro actually pointed
at each. `/admin` now reports this axis correctly (see the Log entry below),
so the number is measured rather than asserted from here on.

¹ Overall averages image/peripherals/verified (same three columns as the
original snapshot) — "full setup" is a stricter, newer sub-metric shown for
context, not folded into Overall, since the original methodology didn't
have it and changing what Overall means mid-snapshot would make the number
incomparable to its own history.

**Products:**

| Category | Image | Any offer | Real per-product offer¹ | Copy | Verified | Overall |
|---|---|---|---|---|---|---|
| Mice (55) | 73% (40/55) | 36% (20/55) | 36% (20/55) | 78% (43/55) | 0% (0/55)² | **47%** |
| Keyboards (8) | 63% (5/8) | 38% (3/8) | 25% (2/8) | 100% (8/8) | 0% (0/8)³ | **50%** |
| Headsets (12) | 100% (12/12) | 75% (9/12) | 50% (6/12) | 100% (12/12) | 100% (12/12) | **94%** |
| Monitors (5) | 80% (4/5) | 20% (1/5) | 20% (1/5) | 100% (5/5) | 100% (5/5) | **75%** |
| Mousepads (17) | 88% (15/17) | 24% (4/17) | 24% (4/17) | 100% (17/17) | 100% (17/17) | **78%** |

¹ New column, and the one that matters for Phase 4. "Any offer" counts a
generic category-*search* link as coverage; "real per-product offer" counts
only a link to the product's own page. The gap between the two columns is
the work left. Overall still averages the original four axes (image / any
offer / copy / verified) so it stays comparable to earlier snapshots — read
the real-offer column, not Overall, when prioritizing.
² Mice now *have* `kilde`/`sidstVerificeret` (added 2026-09-03) — the 0% is
a real, measured "aldrig verificeret" across all 55 rather than the previous
snapshot's "n/a, genuinely untracked". Nothing was backfilled; a date nobody
verified would be worse than an honest zero.
³ All 8 keyboards read as "aldrig verificeret" — not a few stale ones, the
entire category has zero verification-date tracking in practice.

**The "known dashboard bug" this section used to describe is gone**, and it
was already gone before 2026-09-03: `pros.ts` populates `billede` for 345
of 366 pros (the commits that closed the missing-pro-image backlog added
it), so `checkMissingImagesPros` reads a real signal and reports 21, not
366. The paragraph that claimed otherwise stood here long enough to send a
later session hunting a fix that didn't need writing — when a note here
describes a bug, re-check it against the code before acting on it.

**To refresh this snapshot:** re-run the same axes against current data
(image file existence, `offers.length`, offers with `generisk !== true` for
the real-offer column, non-empty beskrivelse/fordele/ulemper,
`sidstVerificeret` staleness) rather than incrementing numbers by hand.

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

  **Both of those were fixed 2026-09-03** — the matcher now treats Danish
  "trådløs" and English "wireless" as the same token, and a mousepad's own
  size names no longer read as a different SKU. `hyperx-cloud-ii-wireless`
  matched its Geek'd listing on the next run; `steelseries-qck-heavy`
  matched too. Both are name-matches rather than EAN-confirmed, so both sit
  in the `/admin/feeds` review queue rather than being applied.
- **Computersalg, Coolshop, Elgiganten, AVXperten, Dustin Home, Komplett,
  Billo** — ❌ **removed entirely, 2026-08-10.** Same failure mode as
  MaxGaming: placeholder entries in `retailers.ts` (category-search URLs
  with manually-typed or guessed prices) never backed by a real, feed-matched
  product feed. User: "you should only see partners i have xml feeds on as
  partners." See the 2026-08-10 Log entry.
- **Shark Gaming (Adtraction)** — investigated 2026-08-10, **not onboarded**.
  Real product feed exists, but their affiliate program only pays commission
  on Shark Gaming's own house-brand SKUs, not the third-party brands
  (Razer, Logitech, etc.) their feed lists — and the catalog carries zero
  Shark Gaming-branded products. Dead end until/unless that changes.
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
pages show the real photo, list cards still show a monogram. *(Fixed since:
`mousepad-card.tsx` renders `billede` through `ProductImage` like every
other category's card — verified 2026-09-03.)*

**2026-08-09 follow-up audit:** a user report ("white background was never
removed from packshots") prompted a pixel-level re-check of all 97 catalog
products (not trusting the prior pass's own count). The 36 fixes were real
— verified via direct alpha-channel inspection — but 2 mice slipped through
the 2026-08-08 accounting entirely: `pulsar-x2h` and `zowie-u2-dw`, both
still flat white-background JPGs. Opened both — same white-on-white risk
class as the 4 already-ticketed cases (glossy/translucent white product on
white backdrop, no safe flood-fill edge) — filed as `bad-product-image`
tickets rather than guessing, instead of attempting an unsafe auto-cutout.
Also confirmed the flood-fill script itself was never committed to the
repo (no file in `scripts/`, no `sharp` in `package.json`) — it was run ad
hoc in the prior session and isn't reproducible; left as a known gap, not
rebuilt, since there's no currently-safe candidate image to run it on.

**Missing-image accounting, done properly (2026-08-09):** the "61 products"
figure above was mice-only visibility — `/admin`'s `checkMissingImagesMice`
never had non-mice siblings, so keyboards/monitors/mousepads were invisible
on the dashboard entirely (headsets had a raw stat card but weren't in the
tracked issues list). Generalized `checkMissingImagesMice` into a category-
agnostic `checkMissingImages` in `data-health.ts` and wired it into
`/admin` for all 5 categories, plus added the missing stat cards. Full,
now-visible picture of products with zero `billede` (distinct from the
61-figure background-removal boundary above, which only covered products a
feed had already matched): **52 products** — 27 mice, 5 keyboards, 4
headsets, 4 monitors, 13 mousepads (1 additional mouse,
`logitech-g-pro-x-superlight`, has an `ean` but was never feed-matched).
Cross-referenced against real pro-usage counts (`musSlug` for mice,
`get{Category}ProSlugs()` from the peripheral-mapping module for the rest)
to find priority — and the picture inverts sharply from what the mice-only
view suggested: the highest-impact gaps aren't mice (max 3 pro users) but
flagship non-mice products with dozens: `zowie-xl2566k` (83 pros, monitor),
`wooting-80he` (73, keyboard), `hyperx-cloud-ii` (58, headset — the
catalog's most pro-used headset with zero photo), `zowie-xl2546k` (46,
monitor), `artisan-ninja-fx-zero` (43, mousepad), `razer-huntsman-v3-pro`
(36, keyboard). None of these have a dedicated sourcing skill the way mice
(`add-mouse`) and headsets (`add-headset`) do — keyboards/monitors/
mousepads follow the same manufacturer/RTINGS/retailer pattern manually.
**All 6 of the above sourced and applied same day** — see the
2026-08-09 (cont.) log entry below for sourcing details, the new
`scripts/remove-background.mjs`, and the remaining 46-product backlog.

## Phase 4 — Full DK retailer coverage 🔄

Goal: every catalog product has at least one real, priced, verified DK
retailer offer — or, where no DK retailer carries it, a documented closest
substitute instead of a dead end.

Currently open as a tracked ticket (recounted 2026-09-03): **35 mice, 5
keyboards, 3 headsets, 4 monitors, 13 mousepads** have zero retailer offers
of any kind, and a further 4 (1 keyboard, 3 headsets) have only a generic
category-search link. Mostly boutique brands — Vaxee,
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
- **2026-08-09** — User reported white backgrounds still visible on some
  packshots. Investigated with a pixel-level audit rather than trusting the
  prior session's own count: the 36 fixes held up, but `pulsar-x2h` and
  `zowie-u2-dw` had been missed and left unticketed — filed as
  `bad-product-image` tickets (see Phase 3 log above for detail). Then
  widened scope per a follow-up request to plan the rest of the catalog's
  image work: found `/admin` only ever tracked missing images for mice
  (plus a stray headset stat card) — keyboards, monitors, and mousepads
  were completely invisible. Generalized `checkMissingImagesMice` into
  `checkMissingImages` in `data-health.ts`, wired it into `/admin` for all
  5 categories with matching stat cards. `tsc`, `vitest` (44 passed), and
  `validate-data` all pass. Full accounting: 52 products have zero
  `billede`. Prioritized by real pro-usage (`musSlug` / peripheral-mapping
  `get{Category}ProSlugs()`) — the priority order inverts from what mice-
  only visibility suggested: `zowie-xl2566k` (83 pros), `wooting-80he`
  (73), `hyperx-cloud-ii` (58), `zowie-xl2546k` (46), `artisan-ninja-fx-zero`
  (43), and `razer-huntsman-v3-pro` (36) are the highest-impact gaps, all
  non-mice, all currently at zero photos.
- **2026-08-09 (cont.)** — Sourced and applied the top 6 highest-priority
  images identified above (all confirmed-correct products, verified against
  the catalog's brand/model/formfaktor before applying): `zowie-xl2566k` and
  `zowie-xl2546k` from BenQ's own Scene7 image server (already alpha-
  transparent at the source); `wooting-80he` from wooting.io's official
  product CDN (already alpha-transparent); `razer-huntsman-v3-pro` from
  razer.com — rejected the page's default hero image (a full lifestyle desk
  scene with mouse/headset/chair in frame, same anti-pattern flagged for
  `logitech-g-pro-x-superlight-2` back in the 2026-08-08 pass) in favor of
  an isolated packshot from the same gallery, already near-black
  (`rgb(17,17,17)`, close enough to the site's `#0d0d0d` card background)
  so no transparency processing needed. `hyperx-cloud-ii` and
  `artisan-ninja-fx-zero` needed real background removal (black/red
  headset and black cloth pad, both on light studio backgrounds) — since
  the prior session's flood-fill script was never committed (see the
  2026-08-09 follow-up audit above), wrote and committed a real one this
  time: `scripts/remove-background.mjs`, border-seeded BFS flood fill with
  a two-threshold alpha fade, `sharp` added as an actual `devDependency`
  (`^0.34.5`) instead of relying on it being present transitively. Verified
  the default thresholds against `hyperx-cloud-ii` (clean) but had to
  retune per-image for `artisan-ninja-fx-zero`: its studio photo used a
  smooth gray gradient backdrop rather than flat white, and the default
  two-threshold fade band (200–245) spanned most of that gradient, leaving
  a visible soft gray glow around the pad instead of a clean cutout —
  fixed by sampling actual pixel values to confirm the true background/
  product contrast gap (background never dipped below 184, product topped
  out around 30) and narrowing the fade band into that gap
  (`--edge=100 --full=170`) for a near-hard cutout. Every result verified
  two ways before applying: pixel-sampled alpha at the corners (confirms
  real transparency, not just visual-inspection-that-happens-to-look-white)
  and composited against the site's actual `#0d0d0d` card background
  (catches the kind of gradient-halo failure above that a plain white-
  canvas preview would hide). All 6 applied to their category JSON files;
  `tsc`, `vitest` (44 passed), `validate-data`, and a full `next build`
  (which prerenders every product page via `generateStaticParams`) all
  pass; spot-checked all 6 via the dev server (`/_next/image` responses,
  200 + correct content-type for each) and confirmed `/admin`'s new
  per-category stat cards dropped by exactly one per fixed product
  (headsets 4→3, keyboards 5→3, monitors 4→2, mousepads 13→12). Remaining
  **46 products** (26 mice, 3 keyboards, 3 headsets, 2 monitors, 12
  mousepads) still have zero image — see Phase 3 above for the full list,
  now ranked by pro-usage for whoever picks this up next.
- **2026-08-09 (cont.)** — Continued down the prioritized backlog: sourced
  and applied 10 more images, working strictly in pro-usage order down to
  4 pros. Mousepads: `vaxee-pa` (15, VAXEE's own EU CDN, already
  transparent), `artisan-type-99` (13, same JP Gaming source and gray-
  gradient-backdrop issue as `artisan-ninja-fx-zero` — reused the same
  `--edge=100 --full=170` fix), `zowie-g-sr-iii` and `zowie-g-tr` (11 and
  7, BenQ's own CDN, already transparent), `logitech-g740` and
  `logitech-g640` (6 and 5) — `logitechg.com` itself was unreachable via
  fetch tooling for both (`Parse Error: Header overflow` on every URL
  variant tried, including a Danish-locale page and an archive.org
  snapshot attempt), so sourced from Newegg's product-image CDN instead;
  `g740`'s specific photo left a faint compression-halo ring around the
  cutout even after retuning thresholds tighter (`--edge=140 --full=180`)
  — accepted as a known minor cosmetic imperfection rather than spending
  further effort chasing a cleaner source for a 6-pro product, `g640`'s
  higher-quality source photo had no such issue. `zowie-h-sr-iii` (4,
  BenQ CDN). Headsets — **all 3 remaining headsets closed out**:
  `hyperx-cloud-ii-wireless` (6, hyperx.com, explicitly verified against
  the wired Cloud II to avoid the wired/wireless confusion flagged in
  `AGENTS.md`'s peripheral-matching gotchas), `sony-inzone-h9-ii` (6,
  PlayStation Direct's own Adobe Dynamic Media CDN), `corsair-hs80-rgb-usb`
  (4, Corsair's own Cloudinary CDN, already transparent). Every image
  verified correct-product-and-colorway before applying (cross-checked
  brand/model/wireless-or-not against each catalog entry), and every
  background-removed result composited against the site's actual
  `#0d0d0d` card background before acceptance, same verification standard
  as the first batch. `tsc`, `vitest` (44 passed), `validate-data`, and a
  full `next build` all pass. Remaining backlog: **36 products** (26 mice,
  3 keyboards, 0 headsets, 2 monitors, 5 mousepads).
- **2026-08-09 (cont.)** — Third image-sourcing pass, continuing down the
  same pro-usage-ordered backlog to the 2–3 pro tier. Also created a
  checked-in skill (`.opencode/skills/source-product-image/SKILL.md`)
  capturing the sourcing/verification technique from the first two passes
  — dark-card composite verification, pixel-sampled threshold calibration,
  the `logitechg.com` dead-end, lifestyle-shot/promo-badge rejection — so
  the next session doesn't have to relearn it. 10 more products applied:
  mice `vaxee-outset-ax-wireless` (3, VAXEE EU CDN, already transparent),
  `pulsar-zywoo-chosen-mouse-gen2` (2, Pulsar's own CDN — pink is the
  only colorway this signature edition ships in, already transparent),
  `zowie-ec1-c` and `zowie-za13-dw` (2 each, BenQ CDN, already
  transparent), `vaxee-np01s-v2-wireless` (2 — VAXEE's own gallery photo
  was a 6-colorway lineup shot, not a single isolated product photo, so
  sourced the "deep blue" solo shot from ProSettings.net instead, the
  colorway their own review calls out as what pros actually run),
  `logitech-g-pro-x-superlight` (2, `logitechg.com` dead end confirmed
  again — Newegg source, black colorway cross-checked against a white-
  colorway listing found first to make sure the right SKU got applied).
  Mousepads: `zowie-g-sr-ii` (3 — note the *current* BenQ site only lists
  G-SR III now, II is discontinued there; sourced from Respawn Gaming
  instead), `artisan-fx-hien` (3, same JP Gaming gray-gradient source and
  `--edge=100 --full=170` fix as the first two Artisan pads), `xtrfy-gp4`
  (2, Cherry Xtrfy's official site — cropped out a "Designed in Sweden"
  flag badge sitting in the photo's whitespace before background removal,
  since it would've survived as a floating opaque graphic otherwise).
  Monitor: `alienware-aw2524h` (2 — Dell's own site only had the AW2524HF
  AMD FreeSync SKU findable, not the AW2524H Nvidia G-Sync SKU the catalog
  actually specifies; sourced from a DisplayNinja review photo instead
  and cropped off the site's decorative border frame first). Every image
  cross-checked against the catalog entry's own spec fields (wireless/
  colorway/SKU) before applying — the AW2524H/HF and G-Pro-X-Superlight
  color mix-ups were both caught this way before download, not after.
  `tsc`, `vitest` (44 passed), `validate-data`, and a full `next build`
  all pass. Remaining backlog: **26 products** (20 mice, 3 keyboards, 0
  headsets, 1 monitor, 2 mousepads) — everything left is at 1 pro user or
  fewer, aside from 3 zero-pro keyboards with no pro-usage signal to sort
  by at all.
- **2026-08-10** — User reported a new partner, Shark Gaming (Adtraction
  feed). Investigated the feed (236 products, mostly PC components/
  accessories, ~61 gaming-peripheral items) and found only 5 real overlaps
  with the catalog (`razer-viper-v3-pro`, `razer-gigantus-v2` EAN-confirmed;
  `razer-deathadder-v3`, `logitech-g-pro-x-2`, `razer-huntsman-v3-pro` name-
  matched). User then clarified Shark Gaming's affiliate program only pays
  commission on their own house-brand SKUs, not the third-party brands their
  feed lists — the catalog carries none — so onboarding was declined; see
  Phase 3 above.

  Separately, user pointed out `retailers.ts` still listed 7 retailers
  (Computersalg, Coolshop, Elgiganten, AVXperten, Dustin Home, Komplett,
  Billo) that were never backed by a real feed — the same failure mode as
  MaxGaming, just not yet cleaned up. Audited the actual impact before
  removing anything: headsets were the highest-risk category (all 12 had a
  Computersalg/Elgiganten price, several as their *only* price source);
  monitors turned out to carry zero real prices from any of the 7 despite
  being wired to accept them (dead code, no data fallout); mousepads had 34
  occurrences of these retailer keys but all except 2 products were already
  `null` (no displayed-price impact at all). User approved removing all 7
  and accepting the fallout.

  Executed: `RETAILER_SLUGS` shrunk to `["proshop", "geekd"]`;
  `retailers.ts` down to those 2 entries; every category transform's offer-
  builder (`headsets.ts`, `monitors.ts`, `mousepads.ts`, `keyboards.ts`)
  trimmed to match; `ALLOWED_REDIRECT_HOSTS` and `partner-ads.ts`'s
  `DEEPLINK_ENV` cut to the 2 real retailers plus the now-unused generic
  network-tracking hosts removed; `.env.example` trimmed; test fixtures
  (`build-offers.test.ts`, `affiliate.test.ts`) rewritten to stop referencing
  purged retailers, the now-meaningless "elgiganten payout differs by
  category" test deleted outright since no real elgiganten offer exists
  anywhere anymore. **7 products dropped to zero offers**, all in headsets/
  mice, confirmed by reading full offer arrays rather than trusting a
  pattern match: `hyperx-cloud-ii` (58 pros — the catalog's most pro-used
  headset), `hyperx-cloud-ii-wireless`, `corsair-hs80-rgb-usb`,
  `steelseries-arctis-nova-pro-wireless`, `sony-inzone-h9-ii`, `zowie-ec2-dw`,
  `zowie-fk2-dw`. Two mice that looked at risk from the initial retailer-
  name grep (`logitech-g403-hero`, `logitech-g-pro-x-superlight-2c`) turned
  out to have a surviving Geek'd offer once their full `offers[]` arrays were
  read, not just the matched line. Filed a consolidated `no-retailer-
  coverage` ticket (`retailer-purge-coverage-2026-08-10`) for the 7 zero-
  offer products. Also fixed one stale SEO description on `/mus/[slug]`
  that named Computersalg as a price source.

  Added a `harFeed`/`sidstFeedHentet` pair to `RetailerSchema` (nullable,
  never-invent — same idiom as `kilde`/`sidstVerificeret`) so a retailer's
  real-partner status is now structured data, not just prose knowledge — and
  built `/admin/partnerships`, a new dashboard page listing every retailer
  with its feed status, last-sync date, payout, cookie window, and live
  offer count, plus a `checkRetailerFeedMismatch` health check
  (`data-health.ts`) that flags any `harFeed: false` retailer that somehow
  still has live offers — a permanent guardrail against this exact mistake
  recurring as new retailers get added. `tsc`, `vitest` (42 passed),
  `validate-data`, and a full `next build` (610 pages, `/admin/partnerships`
  included) all pass; dev-server spot-check confirmed the dashboard renders
  correctly (2 live partners, 37 products with a live-feed offer, 0
  mismatches) and `hyperx-cloud-ii` shows no price rather than a broken or
  fake one.

  Unrelated same-session item: added the Impact.com site-verification meta
  tag (`verification.other` in `layout.tsx`'s metadata) and deployed it to
  production in isolation — stashed the in-progress image-sourcing work
  first so its known broken-image-path bug (found by the same session's
  ultrareview run — ~26 `billede` fields pointing at files that exist on
  disk but were never `git add`ed) didn't ship. That bug turned out to be a
  staging gap, not a real one — all 26 files existed on disk untracked;
  verified every `billede` path across all 5 categories resolves to a real
  file, then committed the retailer purge + dashboard + restored image work
  together (`5a851d7`, pushed to `origin/master`).
- **2026-08-10 (cont.)** — Added a "Data completeness" snapshot to this file
  (see above Phase 2), computed by walking real data across four axes
  (image, offers, copy, verification) per category rather than eyeballing —
  the user asked for this to be tracked here explicitly, a deliberate
  exception to this file's usual "don't duplicate `/admin`" rule. Surfaced a
  real dashboard bug along the way: `/admin`'s "Pros uden billede" stat
  checks `p.billede`, a field `pros.ts` never populates (confirmed via
  `grep` — zero matches) since pro images actually resolve through
  `pro-avatar.tsx`'s slug-derived fallback — so that stat has been silently
  reading 366/366 (the whole roster) as missing an image regardless of
  reality. Not fixed in this pass (flagged as a follow-up), but worked
  around it to get the real number: checked `public/images/pros/` directly.

  Then acted on the finding: ran `scripts/download-pro-images.mjs` (already
  existed, unused until now) against all 366 pros. 274 already had a file;
  of the 92 that didn't, **87 downloaded successfully** from prosettings.net
  (direct CDN URL or og:image fallback), 5 failed (`cs910`, `t0oro`,
  `forsaken`, `zmjkk`, `xs3xycake`) — `t0oro` already had a ticket from
  2026-07-27, filed new `missing-pro-image` tickets for the other 4. Wrote
  `billede: "/images/pros/{slug}.png"` into each of the 87 pros' `pros.ts`
  entries (the downloader only fetches files, doesn't touch the data —
  matched the field-insertion point structurally, right before each pro's
  `musSlug` line, rather than assuming a fixed offset, after a first regex-
  based attempt silently matched zero lines due to CRLF line endings and had
  to be rewritten using plain string comparison). Pro image completeness:
  75% → 99% (361/366) by real file count; 5 pros remain with no image
  (`cs910`, `t0oro`, `forsaken`, `zmjkk`, `xs3xycake`), all now ticketed.
  `tsc`, `vitest` (42 passed), `validate-data`, and a full `next build` all
  pass.
- **2026-08-10 (cont. 2)** — User: "work on finishing pros completeness...
  complete setups and images." Scope was much bigger than the 92-image gap:
  69 pros had zero peripheral entry in `pros-peripherals.json` (49 R6, 20
  CS2, 0 Valorant) and 11 more had an entry with null fields — 80 pros
  total needing prosettings.net research. Split the work across 4 parallel
  general-purpose agents (CS2, R6×2, Valorant-gaps), each fetching
  `prosettings.net/players/{slug}/` per AGENTS.md's mandated source and
  attempting an image download too. Agents were instructed not to touch the
  shared data files themselves (`pros-peripherals.json`, `pros.ts`,
  `freshness-tasks.ts`) — only to write per-pro image files (safe, no
  collision risk) and report structured findings back for a single
  sequential compile pass, avoiding 4-way write races on shared files.

  Results: CS2 — 20/20 pros got full-or-near-full data (79 of 85 possible
  fields), 25/25 images. R6 batch 1 — 14/25 pros found (10 had no
  prosettings.net page, `monk` turned out to be a same-nickname Valorant
  player collision, not our R6 pro), 14 images. R6 batch 2 — 12/24 found
  (12 genuinely absent, verified against prosettings' own ~57-player R6
  roster listing, not just guessed URLs), 13 images including `xs3xycake`
  via a Liquipedia fallback after prosettings came up empty. Valorant — 3 of
  11 requested null fields filled; the agent also caught and flagged 3 stale
  entries while it was on the live pages (`koshmaras`'s recorded "mousepad"
  was actually mislabeled — it's a keyboard on the current page, and there's
  no mousepad listed at all; `s0pp` and `skuba` had outdated keyboard/
  mousepad models) — corrected those instead of leaving them stale. Plus
  `forsaken`/`zmjkk` images, both of which had failed the automated pass.

  Merged all 4 batches into `pros-peripherals.json` (297 → 343 entries).
  Then ran a full idempotent sync of `billede` fields against actual files
  in `public/images/pros/` (not just "new" ones from today) — this
  incidentally fixed the broader dashboard bug flagged in the previous log
  entry: 279 pros had a real image file but no `billede` field at all
  (the original 274-pro backlog from before any of this session's work,
  never linked). `/admin`'s "Pros uden billede" stat card should now read
  the real number instead of 366/366. Image completeness: **100%**
  (366/366) — the last 5 gaps (`cs910`, `t0oro`, `forsaken`, `zmjkk`,
  `xs3xycake`) all closed. Peripheral completeness: 297 → 343 pros with an
  entry (81% → 94%); 324 pros now have all 4 fields filled (88.5%, a new
  stricter sub-metric). Filed 2 consolidated tickets for what's left: 23 R6
  pros with no prosettings.net page at all, and 12 pros (5 CS2, 7 Valorant)
  with specific fields confirmed genuinely absent on their page (checked
  directly, not extraction misses) — both need a fallback source (Liquipedia,
  socials) if pursued further. `tsc`, `vitest` (42 passed), `validate-data`,
  and a full `next build` all pass.
- **2026-08-15** — Onboarded two new Adtraction retailers: **Komplett**
  (2.5% payout, 10-day cookie) and **AV-Cables** (4.2% payout, 45-day
  cookie), both confirmed by the user, not guessed. Unlike Proshop/Geek'd
  (whose `affiliateUrl` today is just a copy of `produktUrl`, no real
  tracking), Adtraction's product feed embeds a genuine per-product tracking
  redirect in its `<link>` field — confirmed end-to-end by curling one
  sample per retailer: both return a 200 with a meta-refresh landing exactly
  on the expected `komplett.dk`/`av-cables.dk` product page. Added both
  tracking hosts (`go.adt231.net`, `do.av-cables.dk`) plus the two retailer
  domains to `ALLOWED_REDIRECT_HOSTS`.

  Built `scripts/match-komplett-eans.mjs` and `scripts/match-avcables-eans.mjs`
  (adapted from the Proshop matcher's normalize/tokenize/DISALLOWED_EXTRA
  heuristics — Google-Shopping RSS format instead of Proshop's custom XML,
  so `<item>`/`g:` fields and a per-retailer `g:product_type` category map
  had to be rebuilt from scratch). Found and fixed two new false-positive
  classes this surfaced: a `ps5`/`xbox`-plus-digit token (e.g. "PS5") wasn't
  caught by the existing bare `"ps"`/`"xbox"` markers or the leading-digit
  check — confirmed via a real false positive (Razer BlackShark V3 Pro PS5
  matching the PC-standalone catalog entry); patching that then wrongly
  excluded a *genuine* match (SteelSeries Arctis Nova Pro Wireless, titled
  "PC/PS5", exact EAN match) as collateral, fixed by letting an exact
  catalog-EAN match override the wording heuristic entirely (ground truth
  beats a guess). Also found AV-Cables files HyperX products under its
  corporate parent brand ("Kingston") rather than "HyperX" — added as a
  brand alias after confirming via an exact-EAN block.

  Ran both against full feeds (Komplett 6,860 items, AV-Cables 5,697 items)
  and manually cross-checked every candidate against the catalog's own
  recorded EAN before applying anything. Applied **9 of 13 Komplett
  candidates** and **1 of 1 AV-Cables candidate** — all 10 had an exact
  EAN match against the catalog's own recorded barcode. Excluded 3 Komplett
  candidates with a mismatched EAN despite a name-token match
  (`razer-blackshark-v3-pro`, `logitech-g-pro-x`, `steelseries-qck-large` —
  each looks like a color/bundle/regional-SKU variant, not verifiable as
  the same physical product without more digging).

  Applied to **6 mice** (`logitech-g-pro-x-superlight-2-dex`,
  `razer-deathadder-v3-hyperspeed`, `razer-deathadder-v4-pro`,
  `razer-deathadder-v3`, `pulsar-tenz-signature-edition`,
  `logitech-g403-hero` — 2 flagged `inStock: false` per the feed's real
  stock status) directly into `mice.json`'s existing `offers[]`, no code
  change needed. **Headsets** needed a schema extension first — added an
  optional `offers` field to `RawHeadset`/`headsets.json`, merged into the
  built `offers` array alongside `buildFlatOffers`'s generic-URL output in
  `headsets.ts` — then applied to `hyperx-cloud-iii` (both Komplett and
  AV-Cables), `steelseries-arctis-nova-pro-wireless`, and `asus-rog-delta-ii`
  (Komplett only). **Keyboards/mousepads/monitors got zero verified matches
  this round** (AV-Cables barely stocks the boutique/pro-tier brands this
  catalog focuses on — mostly Trust/Deltaco/Plexgear generic gear instead —
  and neither feed had a keyboard/mousepad/monitor hit that survived EAN
  verification) — deliberately left their schema unchanged rather than add
  an unused `offers` field with nothing to put in it; revisit once a re-run
  finds real candidates.

  Coverage this session, by category (Komplett / AV-Cables, of catalog
  total): mus 6/55 (10.9%) / 0/55 (0%); headset 3/12 (25%) / 1/12 (8.3%);
  tastaturer, musemaatter, skaerme 0% for both. Catalog-wide: Komplett
  9/97 (9.3%), AV-Cables 1/97 (1.0%) — real but partial, most of the
  gap is boutique-brand SKUs neither generalist retailer stocks. Flipped
  both retailers' `harFeed`/`sidstFeedHentet` in `retailers.ts` to
  `true`/`2026-08-15` now that a real EAN-match run has happened. `tsc`,
  `vitest` (42 passed), `validate-data`, and a full `next build` all pass.
- **2026-08-15 (cont.)** — SEO foundation pass: added canonical URLs, Twitter
  card meta, and Organization/WebSite JSON-LD — none existed before. New
  `src/lib/metadata.ts` (`buildMetadata()`) replaces hand-rolled
  `{title, description}` exports across all 29 metadata-bearing pages;
  unified the three independently-hardcoded `SITE_URL` copies
  (`schema-org.ts`, `layout.tsx`, `sitemap.ts`) into one export.
  `organizationSchema()`/`websiteSchema()` added to `schema-org.ts`,
  replacing `layout.tsx`'s inline hand-rolled Organization script. No
  `potentialAction` SearchAction added — confirmed the site has no real
  query-based search endpoint to back it. `robots: {index: false, follow:
  false}` (pre-launch, Phase 5) confirmed intentional with the user and left
  untouched. `tsc`, `vitest`, and `build` all pass.
- **2026-08-15 (cont.)** — Audited `/admin/tickets` for stale/resolved
  entries. Removed 8 after direct verification (not assumption): 6
  `missing-pro-image` (virtyy, t0oro, cs910, forsaken, zmjkk, xs3xycake —
  all confirmed to already have a real image file on disk), 2
  `bad-product-image` "upscaled" tickets (pulsar-zywoo-chosen-mouse-gen2,
  zowie-xl2566k — confirmed both already background-removed/transparent).
  Updated the `retailer-purge-coverage-2026-08-10` ticket to drop
  `steelseries-arctis-nova-pro-wireless`, resolved via the Komplett offer
  added earlier this session. Mechanical fix: wired the `billede` field for
  6 mice whose product image already existed on disk but was never linked
  (`pulsar-susanto-x`, `pulsar-xlite-v4-es`, `pmm-zen-8k-mini`,
  `fallen-gear-lobo-wireless`, `lamzu-inca`, `waizowl-ogm-cloud-8k`).
- **2026-08-15 (cont.)** — Completed all 14 remaining `stub-mouse-created`
  tickets (mice with zero specs/copy, created while scraping prosettings.net
  pro-gear pages): pulsar-xlite-v4-es, zowie-s1/za13-dw/ec3-cw/ec2-cw/ec3-dw,
  pulsar-zywoo-chosen-mouse-gen2, pmm-zen-8k-mini, sony-inzone-mouse-a,
  lamzu-thorn-v2, fallen-gear-lobo-wireless, vaxee-np01s-wireless,
  lamzu-inca, waizowl-ogm-cloud-8k. Split research across 4 parallel agents
  (ZOWIE, Pulsar, Lamzu, misc-niche) since RTINGS is now paywalled and
  TechPowerUp 403'd on every fetch across the whole batch — sourced from
  manufacturer pages plus prosettings.net/eloshapes.com aggregators instead,
  with per-field flags wherever only a single source existed.

  One real catalog finding: **pmm-zen-8k-mini is not a standalone mouse** —
  it's a shell-only mod-kit for the Razer Viper V3 Pro, sold without
  sensor/switches/battery (buyer supplies their own Viper internals). Wrote
  only the shell's own real specs (weight, dimensions, copy explaining the
  mod-kit nature) and left sensor/maxDpi/pollingHz/knapper/battery/
  connection at their stub "unknown" values rather than carrying over the
  donor mouse's specs, which an earlier research pass had initially
  conflated with the shell's own listing.

  Judgment calls made explicit rather than silently absorbed: VAXEE
  NP-01S's `maxDpi: 3200` is single-source (one review, unusually low for
  its PAW3395 sensor's 26K ceiling, could not cross-verify — TechPowerUp
  403'd). ZOWIE EC3-CW/DW's `breddeMm` used prosettings.net's 60.9mm
  grip-width figure over eloshapes.com's 66mm widest-point figure, matching
  the existing `zowie-ec2-dw` catalog entry's own measurement convention
  for internal comparability. Lamzu Thorn V2/Inca and Waizowl OGM Cloud 8K
  specs came off maxgaming.com — AGENTS.md bans MaxGaming as an offer/
  price/image source, not a spec source, so this is within the letter of
  that rule, but flagging it since it's the same domain. `kilde`/
  `sidstVerificeret` left null for all 14 — `MouseSchema` has no
  verification-tracking fields at all (confirmed in `types.ts`), consistent
  with the Phase 2 snapshot's existing footnote on this.

  Offers: confirmed genuine zero DK retailer coverage for 13 of the 14 by
  checking directly against all 4 real feed-based retailers (Proshop/
  Geek'd match reports, Komplett/AV-Cables full feeds) rather than
  assuming — none matched. `lamzu-thorn-v2` keeps its existing Proshop
  offer, untouched. Removed all 14 `stub-mouse-created` tickets (resolved);
  the 13 still-uncovered mice remain tracked in the existing catalog-wide
  `no-retailer-coverage` ticket, with an update note there confirming the
  re-check. Cleaned up `mice-todo.ts`, removing the 14 completed entries
  (per the `add-mouse` skill's step 7). `tsc`, `vitest` (42 passed),
  `validate-data`, and a full `next build` all pass.

  Mouse-category copy completeness: 29/55 (53%) → 43/55 (78%) by direct
  count — the Data completeness snapshot above is dated 2026-08-10 and not
  re-run this pass (see its own note on refreshing by recomputation, not
  hand-editing).

  **Scope note:** `pulsar-susanto-x` remains a genuine stub (still zero
  specs) — it was never among the 14 tracked `stub-mouse-created` tickets,
  so it fell outside this pass; no ticket currently tracks it either.
- **2026-08-16** — Fixed the Critical/High findings from the 2026-08-15 SEO
  audit artifact (55/100 score). The site-wide `noindex`/`robots.txt` block
  (Phase 5, pre-launch) was confirmed intentional again and left untouched,
  along with its two dependent findings (`X-Robots-Tag` header, AI-crawler
  robots.txt allow-listing) — both need the same three-layer unblock at
  launch (robots.txt **and** the response header **and** the layout's
  `<meta>` tag together, per the audit's own warning that fixing one without
  the others leaves crawlers blocked). LCP/critical-CSS was deferred by
  explicit user choice — GTM already loads `afterInteractive`, so the real
  cause is one global Tailwind bundle with no critical-CSS split, a bigger
  investigation than this pass. The audit's "no canonical tags" finding
  turned out to be stale: `buildMetadata()` already sets
  `alternates.canonical` on all ~29 routes — confirmed, no work needed.

  **Fixed:** (1) All ~60 JSON-LD `<Script>` call sites across 32 files
  switched from `next/script` (default `afterInteractive`, client-injected —
  invisible to any crawler that doesn't run JS) to plain
  `<script dangerouslySetInnerHTML>`, which Next inlines into static server
  HTML. Verified empirically post-build by grepping `.next/server/app/**`
  for `application/ld+json` — JSON-LD text is now physically present in the
  prerendered HTML on every sampled route. (2) The 19 pages that hand-wrote
  raw `JSON.stringify` JSON-LD instead of `schema-org.ts`'s builders were
  migrated; added 5 new builders (`personSchema`, `personItemList`,
  `articleSchema`, `faqSchema`, `webPageSchema`) to cover Person/Article/FAQ/
  WebPage shapes the existing builders didn't. Homepage's duplicate `WebSite`
  block (hand-rolled, redundant with `layout.tsx`'s site-wide one) was
  removed rather than migrated. (3) `productSchema()` now omits the `offers`
  key entirely instead of serializing `offers: []` when nothing survives the
  in-stock filter (34/55 mice were emitting the invalid empty array) — kept
  the rest of the Product block (name/brand/description/image) since that's
  still valid with zero offers. (4) `SITE_URL` moved from apex
  (`prosetups.dk`) to `www.prosetups.dk`, matching what the audit found
  production actually serving from (apex 308-redirects to www) — user
  confirmed www is correct and that this has no effect on local dev.
  (5) Sitemap dedup: `sitemap.ts`'s team-page section built its `Set` over
  freshly-constructed object literals, which never dedupes (`Set` uses
  reference equality) — ~255 of 850 entries were exact duplicates. Root
  cause was deeper than one dedup bug: the sitemap's own team filter
  (excluded `"Content Creator"`, no esport-active filter) disagreed with
  `[esport]/hold/[slug]/page.tsx`'s `generateStaticParams` filter (opposite
  on both counts), so the sitemap was also listing pages that don't exist.
  Extracted both into one shared `getTeamPages()` (`src/data/pro-teams.ts`)
  so they can't drift again. Also found and fixed a second, unrelated
  duplicate: `/guides/greb` was hardcoded in `sitemap.ts`'s static-pages list
  *and* separately generated from the `guides` data array (it's a real guide
  entry there) — removed the hardcoded copy. Sitemap: 850 → 596 unique
  entries (then 606 after adding the new compare-pair pages below). Added
  regression tests (`src/data/pro-teams.test.ts`, `src/app/sitemap.test.ts`)
  asserting both global URL uniqueness and that the sitemap's team-page URLs
  exactly match `getTeamPages()`'s output. (6) Stub product pages (zero
  offers or zero core specs) get a per-page `generateMetadata` `robots:
  {index: false, follow: true}` override via a new `buildMetadata({robots})`
  param and shared `isStubOffers()` predicate (`src/lib/product-status.ts`)
  — noindexed on their own merits so they stay excluded once the Phase 5
  block eventually lifts, `follow: true` so internal links still get
  crawled. Confirmed via build output: a known-stub mouse
  (`pulsar-es-fs-1`) renders `noindex, follow`; a non-stub mouse
  (`logitech-g-pro-x-superlight-2`) still inherits the layout's site-wide
  `noindex, nofollow` unchanged. Applied to all 5 product categories, not
  just mice. Paired with a UI fix: literal `0g`/`0×0×0mm`/`0 knapper`
  spec-table values (and `PriceComparison` rendering nothing at all with no
  offers) now show "Specs kommer snart" / "Ingen tilbud endnu" instead.
  (7) Pro pages now state gear as a sentence per item (`"{pro} bruger en
  {brand} {model}"`) inside each `GearItemCard`, not just a card grid with
  no prose — the literal query pattern ("what mouse does X use") the site
  exists to answer, previously answered nowhere in page text. Includes
  Danish en/et article agreement per slot and a brand-prefix guard (skips
  prepending when the product name already carries the brand, e.g.
  mousepads). Verified in prerendered HTML. (8) `/sammenlign/mus` was an
  empty shell with zero indexable pair URLs (canonical always collapsed
  every `?p=` combination onto the bare picker page). Added 10 curated
  static pages (`/sammenlign/mus/[par]`) among 5 mice that are both
  pro-popular and have real offers/specs (avoided pairing in the several
  top-pro-count mice that are themselves stub/zero-offer), each with a
  pre-filled `CompareTable` and a short catalog-grounded verdict paragraph.
  Wired into `sitemap.ts`, linked from a new "Populære sammenligninger"
  section on the picker page, and from `/mus/[slug]`'s "Sammenlign side om
  side" link when the pairing is curated (falls back to the `?p=` form
  otherwise) — the missing internal link was caught and fixed after an
  advisor review flagged the pages were otherwise unreachable from anywhere
  on the site.

  `tsc`, `vitest` (48 passed, up from 42 — 6 new tests), `npm run lint`
  (clean of new issues — all pre-existing warnings/errors predate this
  session, confirmed via `git show HEAD`), and a full `next build` (626
  pages, up from 610) all pass.

  **Completion vs. the audit:** Critical — 2/2 addressable items fixed (the
  3rd, the robots block, is the intentional Phase 5 gate, not a defect).
  High — 6/9 resolved (5 fixed + canonical tags confirmed already
  implemented), 3/9 deferred by design (2 tied to the same Phase 5 block,
  1 — LCP/critical-CSS — deferred by explicit user choice). Medium/Low
  findings (thin guide content, duplicate title suffix, missing affiliate
  disclosure, no visible author/methodology copy, duplicate-stat guide
  content) are untouched — out of scope for this pass, not yet ticketed.
- **2026-08-16 (cont.)** — Picked up the deferred LCP/critical-CSS finding
  (homepage LCP 5.1s lab/mobile, hero `<h1>` waiting ~2.6s render delay
  behind a render-blocking stylesheet). Two premises from the original
  audit turned out to need correcting, verified against a real production
  build rather than assumed: the "16KB stylesheet" is the **gzip** size of
  one shared 87,340-byte-raw CSS chunk (`08e1w_hhfm454.css`, identical
  across all ~626 prerendered routes since `cssChunking: true` already
  merges all site CSS into one file) — the audit's core claim held up.
  Separately, `tw-animate-css` and `shadcn/tailwind.css` (suspected dead
  weight bypassing Tailwind's tree-shaking, since they're `@import`ed
  wholesale) turned out to already be correctly tree-shaken — both are
  written in Tailwind v4's own `@utility` directive syntax, not plain
  finished CSS, confirmed by grepping known-unused utility names
  (`shimmer`, `scroll-fade*`) against the actual built CSS and finding them
  absent. No vendor-CSS trimming work was needed.

  **Fix applied:** enabled Next 16.2.10's `experimental.inlineCss` flag
  (`next.config.ts`) — confirmed via the installed version's own bundled
  docs (`node_modules/next/dist/docs/`), not assumed from general Next
  knowledge, per `AGENTS.md`'s standing warning that this Next version's
  APIs may differ from training data. Replaces the render-blocking
  `<link rel="stylesheet">` with an inlined `<style>` in the initial server
  HTML. Verified structurally post-build (link count 1→0, `<style>` count
  0→1, containing the full 87,373-byte compiled CSS) on the homepage plus
  `/mus` and `/pro/s1mple`. Flagged explicitly as experimental/not-GA in
  this Next version, global-only (no per-route opt-out), production-build-
  only (no effect in `next dev`), and duplicating CSS bytes once into the
  inlined `<style>` and again into the embedded RSC payload — judged an
  acceptable tradeoff for a search-entry content site where most sessions
  are single-page arrivals rather than deep return navigation. A
  Chrome-driven before/after LCP number was planned as supporting evidence
  but skipped — the `claude-in-chrome` browser extension wasn't connected
  in this environment; the structural build-output check was the plan's
  primary gate regardless, not this.

  **Investigated and explicitly declined**, to avoid it being re-attempted
  blind later: extracting the ~110-line `.btn-main` CTA-button animation
  block out of `globals.css` into a scoped CSS Module. The homepage doesn't
  use `.btn-main`, but `page.tsx` statically imports `buttonVariants` from
  the same `button.tsx` file that defines it — a CSS side-effect import
  isn't pruned by JS tree-shaking, and `cssChunking: true` would likely
  fold a new CSS Module back into the same shared chunk anyway. Real
  savings ≈ zero; real risk non-zero, since 6 files hand-roll `.btn-main`'s
  inner markup as raw class-name strings instead of rendering
  `<Button variant="cta">`, with nothing tying them to the component —
  `src/app/guides/bedste-mus-til-cs2/page.tsx`,
  `bedste-mus-til-valorant/page.tsx`, `bedste-mus-under-500-kr/page.tsx`,
  `traadloes-eller-kablet-mus/page.tsx`, `src/app/pro/[slug]/page.tsx`,
  `src/components/finder-quiz.tsx`, `src/components/price-comparison.tsx`.
  Logged as a separate **code-health** follow-up (not performance) — should
  render `<Button variant="cta">` instead of duplicating its markup.

  `tsc`, `vitest run` (48 passed), `npm run lint` (same 18 pre-existing
  issues as before this change, confirmed unrelated via `git show HEAD`),
  and a full `next build` (626 pages) all pass.
- **2026-08-16 (cont. 2)** — Closed out the "missing affiliate disclosure"
  Medium finding from the SEO audit. Investigation found disclosure copy
  already existed in 3 places (a global footer-adjacent note, `/transparens`,
  a finder-quiz end screen) but none of them next to an actual outbound
  affiliate link — `PriceComparison`/`PriceCta`
  (`src/components/price-comparison.tsx`), the one component shared by all
  5 product detail templates and the genuine click-through point for every
  affiliate link on the site (guide pages link internally to `/mus/[slug]`,
  not out to a retailer directly), showed zero disclosure copy anywhere near
  the price list, CTA button, or sticky mobile bar.

  Added a personal, signed disclosure line directly above the "Sammenlign
  priser" heading in `PriceComparison`'s `#priser` card — user (Oliver, who
  runs the site) opted for first-person/signed copy over formal boilerplate
  ("— Oliver her, som driver ProSetups.dk. Køber du via links herunder, får
  jeg en lille kommission (ingen ekstra omkostning for dig). Tak for
  opbakningen!") rather than legal-style phrasing — satisfies "clear and
  conspicuous" disclosure just as well and doubles as a lightweight author
  signal (the audit's separate "no visible author" Medium finding) without
  building a full byline system. Scoped to price/CTA only per explicit
  choice — the existing global footer component and `/om` keep their
  existing formal/collective voice, untouched. Correctly absent on products
  with zero offers (verified on `hyperx-cloud-ii`, `wooting-80he`,
  `zowie-xl2566k` — all hit the pre-existing "Ingen tilbud endnu" branch,
  nothing to disclose when there's no link) and present wherever a real
  offer exists (verified on `logitech-g-pro-x-superlight-2`,
  `hyperx-cloud-iii`).

  **Found and fixed along the way**: `/transparens`'s retailer list was
  hardcoded and stale — still named Computersalg and Coolshop, both removed
  from the site entirely on 2026-08-10, and missing Komplett/AV-Cables,
  added as real partners on 2026-08-15. A transparency page naming wrong
  partners undermines the point of disclosure, so this was treated as
  in-scope rather than a separate ticket. Now derived from
  `src/data/retailers.ts` (`retailers.filter(r => r.harFeed)`) instead of a
  hand-written list, so it can't silently drift out of sync the next time a
  partner is added or removed — same "compute it, don't hand-maintain it"
  reasoning this file already applies to per-product counts. Verified in
  rebuilt HTML: Proshop/Geek'd/Komplett/AV-Cables all present, Computersalg/
  Coolshop gone. Incidental fix: replacing the hardcoded `Geek'd` JSX text
  with data-driven `{r.navn}` also happened to clear a pre-existing
  `react/no-unescaped-entities` lint error on that line (18→17 problems;
  one unrelated pre-existing error remains on `src/app/page.tsx:326`, same
  "Geek'd" apostrophe pattern, untouched — not part of this fix's scope).

  `tsc`, `vitest run` (48 passed), `npm run lint` (17, down from 18),
  and a full `next build` (626 pages) all pass.
- **2026-08-16 (cont. 3)** — User decision: stop naming specific affiliate
  retailers and specific data-source sites in public copy, while keeping
  the underlying disclosures general. `/transparens`'s "Affiliate-links"
  section (which, as of the previous log entry, dynamically listed the 4
  real retailer partners) now reads as a plain disclosure sentence with no
  named retailers; its "Datakilder" section (prosettings.net/Liquipedia)
  was removed entirely, per explicit user choice, rather than generalized.

  Grepped for the same specific names across every user-facing page (not
  just `/transparens`) and found the identical pattern in **5 more spots**
  — generalized all of them for consistency, since leaving specifics
  elsewhere would just recreate what was being asked to remove: `/om`'s
  "data stammer fra prosettings.net og Liquipedia" line, `mus/[slug]`'s
  meta description ("...hos Proshop eller Geek'd"), the homepage's feature
  blurb ("...hos Proshop, Geek'd eller Computersalg" — Computersalg was
  also stale, removed 2026-08-10), `[esport]`'s FAQ-schema answer ("via
  affiliate-links (fx Proshop)"), and `finder-quiz.tsx`'s results screen
  ("Proshop, Computersalg og Coolshop" — both Computersalg and Coolshop
  stale, both removed 2026-08-10). All now read generically ("danske
  forhandlere" / no named example).

  **Deliberately not touched**: the functional retailer names/logos shown
  in `PriceComparison`'s actual price-list rows (a user needs to know which
  store they're buying from before clicking) — confirmed these are the
  only "Proshop"/"Geek'd" mentions left in any rebuilt page's HTML, and
  they're the product's core function, not editorial copy. Also not
  touched: `kilde`/`sidstVerificeret` data-provenance fields, `/admin/
  partnerships`, `AGENTS.md`'s internal sourcing-workflow docs — the
  site's own data-quality tracking, not public disclosure text; removing
  those would work against this repo's existing data-integrity
  conventions and isn't what the request was about.

  `tsc`, `vitest run` (48 passed), `npm run lint` (16, 0 errors — down
  from 17/1, the last pre-existing unescaped-apostrophe error on
  `page.tsx` cleared along with the "Geek'd" mention it was attached to),
  and a full `next build` (626 pages) all pass.
- **2026-08-16 (cont. 4)** — Two related fixes. **Brand-consistent product
  names**: user noticed some products' `navn` includes the brand and some
  don't. Investigation (3 parallel Explore agents, one per category group)
  found it was far more one-sided than "some do, some don't" — only 1 of 55
  mice, 0 of 8 keyboards, 0 of 12 headsets, and 0 of 5 monitors already had
  brand in `navn`. Mousepads were already fine — no stored `navn` field at
  all, every render site already builds `${brand} ${model}` fresh.

  Normalized all 4 categories with a one-off script (`${brand} ${navn}`
  prepend, skipped when `navn` already contains the brand anywhere —
  `.includes()`, not `.startsWith()`, to correctly skip
  `fnatic-lamzu-maya-8k` whose navn contains "Lamzu" mid-string, not as a
  prefix). First attempt round-tripped the JSON through
  `JSON.stringify(data, null, 2)` and introduced unrelated formatting noise
  (collapsed multi-line empty `offers: []` arrays, reformatted nested-array
  indentation) — caught via `git diff --stat` showing 489 changed lines in
  `mice.json` for what should have been 53 one-line edits, reverted, redone
  as a surgical per-line regex replacement instead. Final diff: exactly 78
  insertions/78 deletions across the 4 files, matching the 78 changed
  entries 1:1. No special-casing needed for the ASUS/ROG or Sony/INZONE
  sub-brand cases — `${brand} ${navn}` produces a legitimate real product
  name either way ("ASUS ROG Delta II", "Sony INZONE H9 II").

  Monitors were the one category where code already explicitly
  concatenated brand into `navn` at several call sites — fixed all of them
  so the now-brand-inclusive `navn` doesn't double up:
  `skaerme/[slug]/page.tsx`'s `generateMetadata` title/description, `<h1>`,
  and the `productSchema({...monitor, navn: `${brand} ${navn}`})` override
  (collapsed to a plain `productSchema(monitor)` call), plus
  `[esport]/page.tsx`'s `monitorNavn` field. Incidental fix: this also
  closes an existing list-vs-detail schema discrepancy on monitors — the
  list page's `ItemList` schema was already passing `navn` un-concatenated
  while the detail page's `Product` schema concatenated it, so the same
  product's JSON-LD `name` disagreed between the two pages; both now agree.

  **Decision, not silently made**: left the ~6 card components
  (`mouse-card.tsx`, `mouse-card-compact.tsx`, `keyboard-card.tsx`,
  `headset-card.tsx`, `monitor-card.tsx`, `product-card-compact.tsx`) and
  every detail page's `SpecTable` "Brand" row showing `navn` and `brand` as
  separate adjacent elements — now mildly redundant text ("Logitech G Pro
  X Superlight 2" title + "Logitech" chip right below) but not a doubled
  substring, and the chip is a real nav affordance to `/maerke/{slug}`, not
  just repeated text. Rewriting 6 card components was judged bigger/riskier
  than what was asked; flagged for the user to revisit if they'd rather
  trim it. `productSchema()`'s JSON-LD `Product.name` containing brand text
  alongside the separate `Product.brand.name` field is likewise left as-is
  — a common, valid schema.org pattern, not a bug.

  **Moved the pro-page gear sentence out of the cards.** The per-item
  "{pro} bruger en {brand} {model}" sentence added inside each
  `GearItemCard` earlier this session was cluttering the card UI (user
  feedback, mid-session). Removed it from inside the cards; added one new
  section after the gear grid on `src/app/pro/[slug]/page.tsx`, rendering
  the same sentences (one per gear item, not merged into a single
  grammatically-joined list — merging would make the "endnu ikke i
  kataloget" qualifier ambiguous about which item it refers to, and
  separate entity+product sentences are better for AI-citability anyway)
  in a small `text-xs text-muted-foreground` block. Still real, visible,
  crawlable text — not hidden/`display:none`, which would read as cloaking
  to search engines. Verified in rebuilt HTML: gone from inside
  `GearItemCard`, present once (not duplicated) in the new bottom block on
  a sampled pro page, now correctly brand-prefixed for every gear item.

  `tsc`, `vitest run` (48 passed — confirms no test hardcoded a real
  product `navn`, as all 3 research agents predicted), `npm run lint` (16,
  0 errors), and a full `next build` (626 pages) all pass.
- **2026-08-22** — Built the missing orchestrator for `src/lib/feed-sync/`
  (adapters, catalog, matcher, diagnostics, existing-offers had all been
  built previously but never wired together — `existing-offers.ts`'s own
  comment named the missing file: `src/lib/feed-sync/run.ts`). New:
  `src/lib/feed-sync/configs.ts` (per-retailer `FEED_CAT_TO_OUR` category
  maps + brand aliases, ported verbatim from `scripts/match-{retailer}-eans.mjs`,
  not re-derived), `run.ts` (fetches each retailer's live feed URL, runs it
  through the matcher, writes `price:{slug}__{retailer}` for
  already-verified pairs and `feedcandidate:{retailer}:{slug}` for new ones
  — never auto-applying a new pairing), `POST /api/feed-sync/run?retailer=X`
  (one retailer per call, optional `FEED_SYNC_SECRET` gate, `dryRun`
  support), and a "Kør sync nu" button on `/admin/feeds` per retailer card.
  Fixed a real correctness trap along the way: `fetch()`'s body yields raw
  `Uint8Array` chunks, not `Buffer` — both existing adapters silently
  mishandle that (mojibake on Proshop/Geek'd's latin1 feed, broken
  `.toString()` on the Adtraction RSS one), so `run.ts` wraps each chunk in
  a real `Buffer` via a small async generator before handing it to the
  adapter, keeping true streaming rather than buffering Komplett's
  ~6,230-item feed whole. All 4 retailers' real feed URLs (provided by the
  user — direct-hosted, no login-gated export needed) went into
  `.env.development.local`, not committed.

  **Ground-truth regression check** (dry-run diffed against
  `scripts/{retailer}-ean-matches.json` before trusting a live write, per
  the plan's own verification gate): Proshop 25→30 matched, Geek'd 14→14,
  Komplett 13→14, AV-Cables 1→1 (clean, zero drift). Every loss was traced
  to a specific cause, not random breakage — `zowie-xl2586x-plus` is
  genuinely gone from Proshop's feed; Komplett retired
  `steelseries-arctis-nova-pro-wireless`'s old EAN (`...058032`) in favor of
  a renamed "Arctis Nova Pro WL" line under new EANs
  (`...068574`/`...068550`) — our catalog's EAN is now stale, a real
  follow-up, not a matcher bug; Geek'd's 4 losses split into 2 correct
  rejections (a colorway/EAN mismatch on `logitech-g-pro-2-lightspeed`, and
  the known wired-vs-wireless Cloud II false-positive class already
  documented in `AGENTS.md`) and 2 real matcher false negatives —
  `razer-blackshark-v2-pro` and `logitech-g-pro-x-2` are both wireless-only
  product lines (no wired variant exists), so the shared `DISALLOWED_EXTRA`
  ban on "trådløst"/"wireless" incorrectly rejects them. Not fixed this
  session — the ban-list is shared across all 4 retailers specifically to
  prevent wired/wireless mismatches elsewhere, so loosening it needs a
  product-line-aware rule, not a blanket removal. Flagged as a follow-up,
  along with the stale Komplett EAN.

  User reviewed the findings and chose to run all 4 retailers live rather
  than hold any back. Live run wrote 42 `price:*` refreshes + 17
  `feedcandidate:*` entries to Redis — exactly matching the 59-item total
  matched count (30+14+14+1) across all 4 retailers, confirmed by a direct
  Redis scan. `/admin/feeds` now shows real `FeedRunSummary` data instead
  of "ALDRIG KØRT" for the first time. `tsc`, `vitest run` (54 passed, up
  from 48 — 6 new tests in `run.test.ts`), and `npm run lint` all pass; full
  `next build` was already re-verified earlier this session before the live
  run (626+ pages, `/api/feed-sync/run` registers as dynamic).

  **Not done, flagged for follow-up:** no cron/schedule triggers this yet —
  runs are manual via the admin button or a direct `POST` for now. The
  Komplett stale-EAN and Geek'd wireless-ban items above are real,
  actionable gaps, not blockers. A separate "add a new retailer from the
  admin UI" request came up mid-session and was deliberately deferred —
  `RETAILER_SLUGS` is a closed enum precisely because category-mapping
  tuning and payout verification need a human pass per retailer (the
  MaxGaming/Ultrashop/7-placeholder-retailer cleanups are exactly what
  skipping that step causes); revisit as its own task if wanted.
- **2026-08-22 (cont.)** — Closed the review-to-catalog gap the previous
  entry left open: `/admin/feeds`'s 17 pending candidates had no way to
  actually get applied short of hand-editing JSON. Added an "Anvend" button
  per candidate row, backed by a new `POST /api/feed-sync/apply` (re-reads
  the candidate from Redis rather than trusting client-supplied price/URL
  for a write into committed data) and `src/lib/feed-sync/apply.ts`.
  User's framing going in: the human keeps the match-judgment call
  (one click after checking the linked product page), the code only
  automates the mechanical JSON write — mirrors why candidates were never
  auto-applied in the first place.

  **Category support is real, not uniform** — checked each category's
  actual offer-storage mechanics before writing anything, since assuming
  they were alike would have been wrong: mice and headsets both have a raw
  `offers[]` field for individually-authored per-product URLs (headsets'
  own code comment already named this exact use case: "used for retailers
  ...whose feed gives a real per-product tracking link"), so both append
  there with `payoutPct` sourced from `retailers.ts`'s `basePayoutPct`
  (verified against mice.json's existing komplett/av-cables offers, which
  already use exactly those rates: 2.5/4.2). Mousepads only render a price
  for proshop/geekd (hardcoded in `mousepads.ts`'s `buildOffers()`) with no
  per-product-URL slot at all, so those two retailers write through
  `priser` (generic search link, not the feed's real URL — deliberately,
  not a bug) and every other retailer (the one pending `komplett |
  musemaatter` candidate) is rejected with an explicit unsupported-error
  rather than silently dropped. Keyboards (no per-product-URL storage
  mechanism) and monitors (offer-builder only wired for proshop) have zero
  pending candidates today, so both are marked unsupported rather than
  guessed at.

  **Avoided a repeat of this session's own documented incident:** a prior
  pass this session hand-typed the brand-prefix script's file rewrite via
  `JSON.parse` → mutate → `JSON.stringify(data, null, 2)` and produced a
  489-line diff for what should've been ~50 one-line edits (collapsed
  pre-existing multi-line empty arrays, reformatted nesting). Before
  trusting the same round-trip pattern here, empirically diffed
  `JSON.stringify(JSON.parse(file), null, 2)` against each target file
  (CRLF-normalized): `headsets.json` and `monitors.json` are byte-identical
  to that round-trip today; `mice.json` and `mousepads.json` are not (a
  handful of pre-existing multi-line-formatted entries elsewhere in each
  file would get incidentally reformatted). Verified live against a real
  candidate rather than trusting the theory alone: applied
  `steelseries-arctis-nova-pro-wireless`'s pending Proshop candidate
  through the real running route, diffed the file before/after outside
  git — exactly the 8 new lines for the new offer, `mice.json` untouched.
  Also added `redisDel` (missing from `src/lib/redis.ts` — only
  get/mget/keys/set existed) so an applied candidate's key actually clears
  instead of lingering until its 3-day TTL, and
  `invalidateOfferKeysCache()` on `feed-sync/existing-offers.ts` so a
  same-process sync run afterward sees the new offer as trusted rather than
  reading a stale cached key set.

  Also added loading skeletons (new `src/components/ui/skeleton.tsx`,
  standard shadcn pulse pattern) to `ProductImage` and `ProAvatar` — the
  two components rendering meaningful product/pro photos site-wide.
  Small fixed-size icons (retailer/brand/team logos, all under 40px) were
  left alone as not worth the treatment. `priority` (LCP-critical) images
  skip the fade-in entirely, so this doesn't work against the earlier
  `inlineCss` LCP fix. Not visually verified in-browser — the
  `claude-in-chrome` extension wasn't connected this session; worth a
  manual check with network throttling.

  `tsc`, `vitest run` (61 passed, up from 54 — 7 new tests in
  `apply.test.ts`), and `npm run lint` (11 pre-existing warnings, 0 new, 0
  errors — confirmed via `git status` that every flagged file is untouched
  this session) all pass. Full `next build` clean.
- **2026-08-22 (cont. 2)** — User asked directly: "why can't Komplett show
  mousepads?" Answer was a real schema gap, not policy — `mousepads.ts`'s
  offer-builder hardcodes `["proshop","geekd"]` with no slot for a real
  per-product URL. User's response: every category should behave like
  mice — individually-authored real offers, not a generic category-search
  fallback. Surfaced the actual blast radius before touching anything:
  **37 of 42 non-mouse products** (7/12 headsets, 5/5 monitors, 17/17
  mousepads, 8/8 keyboards) would drop to zero offers immediately if the
  fallbacks were removed outright, since none of them have any real
  per-product data yet — keyboards in particular have never had a real
  price or URL at all, only a generic category-search link. User chose the
  non-destructive path once they saw the numbers: give every category the
  `offers[]` capability now, remove each category's fallback only once
  real data actually backs it — nothing goes dark today.

  Added the same additive `offers?: AffiliateOffer[]` raw-JSON field
  headsets.ts already had to `monitors.ts`, `mousepads.ts`, and
  `keyboards.ts` — each category's existing generic-fallback offer
  (`buildFlatOffers`/`buildOffers`/`kbOffers`) stays first in the array,
  unchanged, with any real applied offers appended after. Simplified
  `feed-sync/apply.ts` accordingly: it now treats every category
  identically (append to `offers[]`, `payoutPct` from `retailers.ts`'s
  `basePayoutPct`) instead of special-casing mousepads through `priser` —
  which also directly resolves the original question: the one pending
  `komplett | musemaatter` candidate can now be applied with its real
  product link.

  **`keyboards.json` needed a one-time normalization first.** The same
  byte-identical-round-trip check run before the original apply.ts (see
  previous entry) now had to cover 2 more files: `monitors.json` was
  already clean, but `keyboards.json` wasn't — all 8 entries store
  `"retailers": ["x"]` inline, and a naive round-trip would have expanded
  every one of them to multi-line as unrelated noise (confirmed: 37
  differing lines for what should be a 1-keyboard change). Normalized it
  once as an isolated, explicit write — verified `JSON.stringify(before)
  === JSON.stringify(after)` (zero data change) before writing, then
  re-ran the round-trip check to confirm it's now stable. `mice.json` and
  `mousepads.json` turned out to already be round-trip-safe (unclear why
  they weren't earlier this session — re-verified fresh rather than
  trusting the earlier result).

  `tsc`, `vitest run` (62 passed), `npm run lint` (0 new issues), and a
  full `next build` (same page count, all categories compile) all pass.
  **Not done:** the actual data-sourcing work this unlocks — 37 products
  across 4 categories still show only their generic-fallback offer until
  someone runs feed-sync candidates through Anvend or manually sources
  real per-product links, the same way mice/some headsets already have.

- **2026-09-03** — Session opened with ~2,000 lines of uncommitted work in
  the tree: the whole `src/lib/feed-sync/` subsystem, its API routes and
  `/admin/feeds` UI, the Redis wiring, `product-status.ts`, `pro-teams.ts`,
  `/sammenlign/mus/[par]`, **and the 474 ROADMAP lines documenting the
  2026-08-15 → 2026-08-22 sessions**. All four validation layers passed, so
  it was committed as-is rather than reconstructed. One scratch file
  (`feed-sync/__check2.test.ts`, a console.log debugging harness that hit
  the live network from inside `npm test`) was dropped instead.

  **Closed the gap that kept 4 categories at zero real offers.** Feed-sync's
  `hasExistingOffer` counted a generic category-*search* fallback as a
  human-verified offer, so the products that most needed a real
  per-product URL were exactly the ones that never produced a review
  candidate. `AffiliateOffer` now carries an optional `generisk` flag, set
  by the three offer builders (`buildFlatOffers`, `kbOffers`, mousepads'
  `buildOffers`) and never by hand — an offer read verbatim from a raw
  `offers[]` array is individually authored, so absent means real and no
  existing data changed. `mergeOffers()` drops a retailer's fallback once
  that retailer has a real offer (both surviving would resolve the same
  `price:{slug}__{retailer}` override behind two different URLs and render
  as duplicate rows). `run.ts` now has three cases instead of two: no offer
  → candidate; generic-only → refresh *and* candidate; real per-product
  offer → refresh only. Nothing is auto-applied — the review gate is
  untouched.

  Ran the four live feeds (Proshop 261k items, Geek'd 7.3k, Komplett 6.3k,
  AV-Cables 5.6k, zero errors). Candidates went **4 → 20**. Applied the 13
  EAN-confirmed ones: `asus-rog-azoth-96-he`, `steelseries-qck-large`,
  `hyperx-cloud-iii`, `zowie-xl2586x-plus`, `asus-rog-delta-ii`,
  `zowie-ec2-dw`, `zowie-fk2-dw`, `logitech-g-pro-x`, `pulsar-es-saturn-pro`
  (Proshop); `steelseries-qck-large`, `logitech-g915-tkl`,
  `logitech-g-pro-x` (Geek'd); `razer-viper-v3-pro` (Komplett). Products
  with at least one real per-product offer: **28/97 → 33/97**; keyboards
  0 → 2, monitors 0 → 1, mousepads 3 → 4. The 7 name-matched (not
  EAN-confirmed) candidates were left in `/admin/feeds` for a human call —
  that gate exists precisely for matches a barcode didn't confirm.

  **Two matcher gaps from 2026-08-08 closed.** Danish feed titles vs English
  catalog names: "Trådløs" and "Wireless" are now the same token, so the 8
  products with "Wireless" in their name can match their own Danish listing
  (`hyperx-cloud-ii-wireless` did, immediately) while the wired sibling
  still correctly rejects it. And a mousepad is one product sold as several
  sized SKUs: `MousepadSchema.størrelser` entries take an optional per-size
  `ean`, `CatalogItem` carries every known EAN plus its own size names, and
  a feed token naming one of the product's *own* sizes no longer reads as a
  different SKU. The matched size rides through to `/admin/feeds` so a
  reviewer sees which size a price refers to before applying it. No
  per-size EANs are populated yet — recording one nobody verified would
  fake a confirmation.

  **Mice joined the verification model.** `MouseSchema` gains nullable
  `kilde`/`sidstVerificeret` — it was the one category with no staleness
  concept at all — and `/admin` staleness-checks mice. Nothing backfilled:
  all 55 read "aldrig verificeret", which is the honest state rather than
  clean-by-omission.

  **Image health checks hardened.** `checkMissingImages` /
  `checkMissingImagesPros` can now tell "no `billede`" apart from "`billede`
  points at a file that isn't there" (`broken-image` / `broken-pro-image`);
  the checks stay pure, `/admin` walks `public/images` at build time and
  passes the paths in. Zero broken paths across pros and all 5 catalogs
  today — this is the regression guard for the failure that already
  happened once (a pro image saved as `.webp` while `pros.ts` said `.png`).

  **Two ROADMAP notes were wrong and are corrected in place** rather than
  contradicted from down here: the "Known dashboard bug" paragraph under
  the completeness snapshot (`pros.ts` does populate `billede`, for 345 of
  366 — later commits fixed it and the note stood), and the
  "`/musemaatter` list page doesn't render `billede`" line (it does, via
  `ProductImage`). A stale known-bug note costs a later session a real
  detour; both were verified against the code before rewriting.

  New tests: `data-health.test.ts` (6), `feed-sync/matcher.test.ts` (8),
  `mergeOffers` coverage in `build-offers.test.ts` (3), plus two new
  `run.test.ts` cases pinning the generic-only behavior. 87 pass.
  `validate-data`, `lint` (0 errors) and a full `next build` all pass.
