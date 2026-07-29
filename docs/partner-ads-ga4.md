# Partner-ads revenue → GA4 (without breaking PA tracking)

> **Handoff for smaller models:** read this whole file first, then code under
> Implementation map. Do **not** invent UTM on outbound links. Secrets live in
> env only (`.env.development.local` / Vercel) — never commit real keys.

## Status (2026-07-29) — what is done vs next

### Done in code

| Item | Location |
|------|----------|
| First-party redirect + `uid` store | `src/app/api/redirect/route.ts`, `src/lib/affiliate-tracking.ts` |
| Partner-ads deeplink URL builder (`uid` before `htmlurl`) | `src/lib/partner-ads.ts` |
| Sale callback → GA4 `affiliate_sale` (commission as value) | `src/app/api/partner-ads/callback/route.ts`, `src/lib/ga4-mp.ts` |
| Client `affiliate_click` + link component | `src/components/affiliate-link.tsx` |
| Product price CTAs use `AffiliateLink` | `mus`, `headset`, `tastaturer`, `musemaatter`, `skaerme` detail pages |
| Retailer **ultrashop** (Partner-ads) | `src/lib/types.ts` `RETAILER_SLUGS`, `src/data/retailers.ts` |
| Env template | `.env.example` |

### Config / account (human + env)

| Item | State |
|------|--------|
| `GA4_API_SECRET` | Set in local env (also set on Vercel for prod) |
| `PARTNER_ADS_API_KEY` | Set — Dataudtræk unique key for **XML only** (not used for link wrap yet) |
| `PARTNER_ADS_PARTNER_ID` | **`57198`** (publisher id from UltraShop deeplink) |
| `PARTNER_ADS_DEEPLINK_ULTRASHOP` | **`112168`** (`bannerid` in PA URL — deeplink material, not a visual banner) |
| Other programs (Proshop, Coolshop, …) | No deeplink ids yet |
| PA callback URL registered in dashboard | **Confirm** under Dataudtræk → Callback |
| Redis | `REDIS_URL` set locally |

### Not done (next work for smaller model)

1. **Confirm Partner-ads callback URL** is registered:
   `https://prosetups.dk/api/partner-ads/callback?uid=[uid]&ordre=[ordrenummer]&prov=[belob]&sum=[omprsalg]&prg=[cprogramid]&uid2=[uid2]`
2. **Mirror env on Vercel production** (`PARTNER_ADS_PARTNER_ID`, `PARTNER_ADS_DEEPLINK_ULTRASHOP`, `GA4_API_SECRET`, `REDIS_URL`, optional `PARTNER_ADS_API_KEY`).
3. **Add UltraShop offers** on products: `retailer: "ultrashop"`, real `produktUrl` on ultrashop.dk, optional `affiliateUrl`. Until offers exist, no UI hop uses UltraShop.
4. **Smoke-test:** click UltraShop CTA → Location host `partner-ads.com` with `partnerid=57198&bannerid=112168&uid=…&htmlurl=…`.
5. **Optional later:** poll XML feeds (`vissalg_xml`, `annulleringer_xml`) with `PARTNER_ADS_API_KEY` for reconcile; date format `YY-M-D` without leading zeros.
6. As more programs approve: set `PARTNER_ADS_DEEPLINK_<RETAILER>` only — do **not** embed banner images.

### Hard constraints (do not regress)

- No `utm_*` on Partner-ads or internal nav links; join key is **`uid` only**.
- Do not require analytics consent for `/api/redirect`.
- “bannerid” in PA URLs = deeplink material id; site never shows PA banner creatives.
- Adding a retailer: update `RETAILER_SLUGS` in `types.ts` **and** `retailers.ts` **and** allowlist in `affiliate-tracking.ts` **and** deeplink env map in `partner-ads.ts`.

---

## Context

ProSetups.dk has:

- GA4 measurement ID `G-BPNT90SDZ3` + Consent Mode defaults in `src/app/layout.tsx`
- Partner-ads retailers include Proshop, Computersalg, Coolshop, BilligHærdware (**billo**), **UltraShop** (`ultrashop`) in `src/data/retailers.ts`
- Outbound clicks routed through `/api/redirect` (first-party hop + `uid`)
- Partner-ads sale callback at `/api/partner-ads/callback` → GA4 Measurement Protocol

Goal: Partner-ads remains the source of truth for commissions; GA4 gets click and (when callback fires) commission revenue attributed via `uid`. **GA4 / UTM must never rewrite or replace Partner-ads tracking.**

---

## 1. How Partner-ads works (source of truth for money)

Partner-ads is a Danish multi-merchant affiliate network. Commission is **not** measured by Google Analytics. It is measured by Partner-ads + the merchant.

### Click → cookie → sale chain

```text
User on prosetups.dk
  → clicks /api/redirect?... (first-party hop)
  → server mints uid, stores click context, builds Partner-ads URL
  → Partner-ads records click, sets tracking cookie, redirects to merchant
  → user buys on merchant within cookie window
  → merchant conversion matches Partner-ads cookie
  → Partner-ads hits our callback with commission
  → we push affiliate_sale to GA4 Measurement Protocol
```

### Official Partner-ads rules

| Topic | Rule |
|--------|------|
| Tracking | Payment only after user clicks *your* PA material, then completes sale/lead on advertiser site. |
| Deeplink | Supported and recommended (`htmlurl`). |
| SubIDs | Only **`uid`** and **`uid2`** (lowercase). Never use `utm_*` for PA attribution. |
| `uid` placement | If deeplinking with `htmlurl`, **`uid` must come *before* `htmlurl`**. |
| Cookie window | Per program (~30 days for many DK shops). |
| Callback | **Dataudtræk / API → Callback** — PA GETs your URL on conversion. |
| Sales API | **Dataudtræk / API** Unique Key for pull/reconcile. |

### Callback registration (Partner-ads dashboard)

```text
https://prosetups.dk/api/partner-ads/callback?uid=[uid]&ordre=[ordrenummer]&prov=[belob]&sum=[omprsalg]&prg=[cprogramid]&uid2=[uid2]
```

| Placeholder | Meaning |
|-------------|---------|
| `[uid]` / `[uid2]` | Values set on the click |
| `[ordrenummer]` | Order / lead id |
| `[belob]` / `[belob2]` | Commission incl. / excl. VAT |
| `[omprsalg]` | Order total incl. VAT |
| `[cprogramid]` | Partner-ads program id |

### Tracking URL shape

Built by `src/lib/partner-ads.ts`:

```text
https://www.partner-ads.com/dk/klikbanner.php?partnerid=...&bannerid=...
  &uid=...
  &uid2=...
  &htmlurl=https%3A%2F%2Fwww.proshop.dk%2F...
```

Config via env (see below). Missing banner/partner id → redirect still logs the click but sends the user to the merchant/deeplink URL without a PA hop (no commission until configured).

---

## 2. What GA4 can and cannot do alone

| Capability | GA4 alone | With this stack |
|------------|-----------|-----------------|
| Sessions, source/medium, pages | Yes | Yes |
| Affiliate outbound clicks | Event on site | `affiliate_click` |
| Real sale / commission | **No** | Callback → `affiliate_sale` via MP |
| Attribute commission to content | Partial | `uid` joins click row ↔ sale |

---

## 3. Hard rules: GA4 / UTM must not interfere

### Protect Partner-ads (money)

1. Always hop through Partner-ads tracking links for PA merchants when config is present.
2. Do not strip/reorder `partnerid`, `bannerid`, `htmlurl`, `uid`, `uid2`.
3. Do not use `utm_*` as PA subids — only `uid` / `uid2`.
4. Deeplink order: `uid` before `htmlurl`.
5. Do not gate the PA redirect on analytics consent.

### Protect GA4 (attribution)

1. Never add `utm_*` on internal site links.
2. UTMs only on inbound marketing URLs into prosetups.dk.
3. Outbound click tracking must not rewrite the page URL with UTMs.

### Safe coexistence

```text
Inbound UTMs (optional) → prosetups.dk (GA4 session)
  → affiliate_click (if analytics allowed)
  → /api/redirect (uid, no utm)
  → Partner-ads (uid in PA params only)
  → merchant
  → sale → callback → GA4 Measurement Protocol
```

---

## 4. Implementation map

| Piece | Path |
|--------|------|
| Research (this doc) | `docs/partner-ads-ga4.md` |
| PA URL builder | `src/lib/partner-ads.ts` |
| Click store + outbound URL | `src/lib/affiliate-tracking.ts` |
| GA4 MP helper | `src/lib/ga4-mp.ts` |
| Outbound redirect | `src/app/api/redirect/route.ts` |
| Sale callback | `src/app/api/partner-ads/callback/route.ts` |
| Client link + gtag | `src/components/affiliate-link.tsx` |
| Redis TTL | `src/lib/redis.ts` |

### GA4 events

| Event | When | Key params |
|-------|------|------------|
| `affiliate_click` | Client, before leave | `retailer`, `network`, `product_slug`, `link_id` |
| `affiliate_sale` | Server MP on callback | `transaction_id`, `value`=commission DKK, `currency`=`DKK`, order total as custom |

Primary **value** = **commission** (`prov`), not order GMV.

---

## 5. Environment variables

```bash
# Partner-ads publisher id (from PA dashboard), e.g. 57198
PARTNER_ADS_PARTNER_ID=

# Dataudtræk unique key (XML only — not required for clicks)
PARTNER_ADS_API_KEY=

# Per-program DEEPLINK material id (text/product links only — no on-site banners).
# In PA’s URL this is still the query param `bannerid`; it is not a visual banner.
# Get it from the program’s deeplink / textlink in Reklamemateriale or Deeplink generator.
PARTNER_ADS_DEEPLINK_PROSHOP=
PARTNER_ADS_DEEPLINK_COMPUTERSALG=
PARTNER_ADS_DEEPLINK_COOLSHOP=
PARTNER_ADS_DEEPLINK_BILLO=
PARTNER_ADS_DEEPLINK_ULTRASHOP=

# GA4 Measurement Protocol (Admin → Data streams → Measurement Protocol API secrets)
GA4_MEASUREMENT_ID=G-BPNT90SDZ3
GA4_API_SECRET=

# Optional: shared secret query param if you append it to the callback URL
PARTNER_ADS_CALLBACK_SECRET=

# Redis (click uid → client_id mapping; falls back to in-memory)
REDIS_URL=
```

### Partner-ads dashboard setup

1. Approve programs (Proshop, Coolshop, …).
2. Copy deeplink banner id per program into env.
3. Register callback URL under **Dataudtræk / API → Callback**.
4. Create GA4 MP API secret; set `GA4_API_SECRET`.
5. In GA4: custom dimensions for `retailer`, `network`, `product_slug`, `pa_program_id`; mark `affiliate_sale` as conversion if desired.

---

## 6. Partial vendor access

- Clicks are logged for all retailers.
- Only retailers with `PARTNER_ADS_PARTNER_ID` + deeplink material id get a real PA tracking hop.
- We never embed Partner-ads banner creatives — only product/text CTAs via deeplink.
- Only sales that fire the callback produce GA4 revenue events.
- Payout truth remains the Partner-ads dashboard; GA4 is for content/channel ROI.

---

## 7. What not to do

- Do not put bare Proshop URLs in the UI as the primary click target when PA is configured (use `AffiliateLink` → `/api/redirect`).
- Do not append `utm_source=prosetups` on outbound in place of `uid`.
- Do not use internal UTMs between site pages.
- Do not require cookie consent for the redirect itself.
