# /cs2 Redesign Handoff - ProSetups.dk

> ## STATUS: LARGELY SUPERSEDED (updated 2026-07-21, 17:45)
>
> This document was written against the page as it existed around 14:30. Between then and 17:30 the
> project changed substantially: the pro dataset grew from 13 to 156, prices were scraped in,
> `src/app/cs2/page.tsx` was deleted and folded into `src/app/[esport]/page.tsx`, and R6 plus
> Valorant were added.
>
> **Sections 1, 2, 3.1 and 5.3 describe a page that no longer exists.** Do not implement from them.
>
> Still useful and unaffected: **Section 4 (the five references)** and **Section 6 (constraints)**.
>
> Shipped since, across that work and the follow-up implementation pass: dead `#alle-mus` anchors
> removed, fake DPI badges removed, percentages computed from real data, prices wired via
> `src/data/prices.json`, `bestOffer()` switched to price-ascending, `MouseCard` removed from the
> pro rows, routes consolidated, glow shadows stripped, trust strip added, `font-mono tabular-nums`
> applied, real pro photos wired into the settings table, a client-side filter added over the
> 88-row table, brand unified on ProSetups.dk, all em-dashes removed, and four mangled Danish
> strings repaired.
>
> Known open item: the site header nav overflows horizontally below roughly 500px.

**Date:** 2026-07-21
**Scope:** originally `src/app/cs2/page.tsx`; the live equivalent is now `src/app/[esport]/page.tsx`
**Mode:** Redesign - Overhaul of the visual language. Preserve IA, routes, Danish copy voice, and the dark base.
**Deliverable status:** superseded in part, see status block above.

---

## 1. Design read

> Reading this as: a Danish affiliate comparison page for competitive-FPS buyers, with a spec-forward engineering language, leaning toward native Tailwind v4 + Geist / Geist Mono + near-zero motion.

The audience is someone who already knows what eDPI means and is deciding between three mice. They are not being sold a lifestyle. They want: what do the pros actually use, what does it weigh, what does it cost, where do I buy it. The design job is to make that legible fast, and to look trustworthy enough that they click an affiliate link.

**Dials:**

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **5** | "Minimalistic, clean" caps this. Comparison content wants a predictable grid, not asymmetric drama. |
| `MOTION_INTENSITY` | **3** | Currently the page has hover glows and nothing else. Drop to honest static + hover states rather than half-built motion. |
| `VISUAL_DENSITY` | **5** | Higher than a normal minimal brief, because specs *are* the content here. Airy gallery spacing would waste the page. |

---

## 2. How this was audited

Read: `src/app/cs2/page.tsx`, `src/app/[esport]/page.tsx`, `src/components/mouse-card.tsx`, `src/components/site-header.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/types.ts`, `src/lib/affiliate.ts`, `src/data/mice.ts`, `src/data/pros.ts`. Pulled the rendered text of the live Vercel deployment.

**Caveat, stated plainly:** the browser tool would not return a screenshot for this page (three attempts, each timed out at 30s). Everything below is grounded in source code and the live DOM text, not in a visual capture. Layout judgements about *spacing and visual weight specifically* should be sanity-checked against the real page before acting on them. Everything in Section 3 is verifiable from the code and does not depend on seeing it.

---

## 3. Audit findings

### 3.1 Broken - fix regardless of which design direction you pick

These are not taste calls. They are defects.

1. **Both hero CTAs point at a dead anchor.** `cs2/page.tsx:69` and `:79` link to `/cs2#alle-mus`. There is no element with `id="alle-mus"` anywhere in the repo (verified by grep). The secondary hero CTA and the "Se alle" link both do nothing.

2. **The DPI badge grid is generated nonsense.** `cs2/page.tsx:132-137` runs `Array.from({length: 12})` and prints `` {i + 1}.5 + {i * 50} DPI ``. This renders twelve badges reading "1.5 + 0 DPI", "2.5 + 50 DPI" … "12.5 + 550 DPI". These are not DPI values, not sensitivity values, not anything. Delete outright.

3. **The percentages don't add up.** `cs2/page.tsx:148-156` claims 60% + 24% + 20%. That is 104%.

4. **The stat claims exceed the dataset.** The copy says "92% af CS2-pros" and "25+ trackede pro-indstillinger". `src/data/pros.ts` contains **13 pros total, 12 of them CS2**. The page renders only 6 of those 12 (`.slice(0, 6)`). Either grow the dataset to match the claim or rewrite the claim to match the data. Given `/om` and `/transparens` both promise sourced, credited data, shipping an inflated number here is the single biggest trust risk on the page.

5. **A price-comparison site with no prices.** `prisDkk` appears **zero times** in `src/data/mice.ts` (verified by grep). `MouseCard:126` renders `{offer.prisDkk && ...}`, so the price silently never appears. The buy button currently reads just "MaxGaming". The entire reason a user would trust this over prosettings.net is absent.

6. **`bestOffer()` optimises for your commission, not the user's price.** `src/lib/affiliate.ts:5-11` sorts by `payoutPct` descending. The "best offer" shown is the retailer that pays ProMus the most. On a site with a dedicated `/transparens` page this is a real editorial-integrity problem, not just a design one. Recommend sorting by `prisDkk` ascending once prices exist, with `payoutPct` as tiebreak only.

7. **Every mouse card is rendered two or three times.** The "CS2 Pro-indstillinger" section embeds a full `<MouseCard>` inside each pro row (`cs2/page.tsx:114`). Because 6 pros share 4 distinct mice, the G Pro X Superlight 2 card renders **three times** on one page. This is the dominant cause of the page feeling long and repetitive.

8. **Trust signals exist in the data and are rendered nowhere.** The `Pro` type carries `kilde` and `sidstVerificeret`. Only `/pro/[slug]` displays them. The CS2 page shows neither, despite `/om:21` explicitly promising "Vi krediterer altid kilden".

9. **Typo:** "esporm" should be "esport" in `src/app/[esport]/page.tsx:68`.

10. **`/[esport]/page.tsx` is a worse duplicate of `/cs2/page.tsx`.** Next.js resolves the static `/cs2` route first, so the dynamic version is dead for CS2 but live for every other esport, and it diverges badly: it is a client component, has no metadata, and uses letter-circle avatars. Any redesign should either delete the hardcoded `/cs2` route and generalise the dynamic one, or delete the dynamic one. Maintaining both guarantees drift.

### 3.2 Design problems

- **Cyan glow shadows are the strongest AI tell on the page.** `shadow-[0_0_20px_-5px_oklch(...)]` on the hero CTA, again on the card hover, again on the buy button. Neon outer-glow is exactly the "gamer default" that every reference in Section 4 deliberately avoids. It also fights the "minimalistic, clean" brief directly.

- **Geist Mono is loaded and never used.** `layout.tsx` wires up `--font-geist-mono`; `globals.css:11` maps it to `--font-mono`. Nothing on the page uses it. This page is *made of numbers* (60g, 400 DPI, 800 eDPI, 4000 Hz, 32K). That is a free, large upgrade sitting unused.

- **Letter-circle avatars.** `ProAvatar` renders "D", "Z", "S", "D", "R", "M". Two different pros both render "D" (donk, device), so the avatar carries no information at all. Either use real player photos (`Pro.billede` already exists in the type) or drop the avatar and let the name carry it.

- **The data model is rich; the page uses almost none of it.** `Mouse` carries `sensor`, `maxDpi`, `pollingHz`, `formfaktor`, `haandStoerrelse`, `fordele`, `ulemper`. The card surfaces weight, grip, and wireless only. Meanwhile the page invents fake spec badges (finding 3.1.2). It is under-using real data and over-using invented data at the same time.

- **Em-dashes throughout the Danish copy.** `&mdash;` in `MouseCard:90`, `cs2/page.tsx:129`, plus the page `<title>`. Replace with a regular hyphen or restructure the sentence.

- **No section-layout variety.** Three of four sections are "heading, then a grid of bordered cards on `bg-card`". Same border, same radius, same treatment. Nothing signals which section matters most.

---

## 4. Five references

Each was chosen because it solves a problem this page actually has, and each maps to a field already in the data model.

### 4.1 Analogue - https://www.analogue.co
**Take: product photography as the hero, near-monochrome restraint.**
Analogue sells retro gaming hardware and uses an almost gallery-like presentation. Neutral blacks, whites, greys; generous whitespace; large hero product images that dominate the viewport; accent colour held back so the hardware carries the page.

**Apply here:** the mouse product images already exist in `public/images/mice/` (10 files, jpg/png/webp). Right now they sit in a 144px-tall box behind a decorative `from-primary/[0.04]` gradient. Kill the gradient tint, give the product real space, let the object be the visual. This one change does more for "premium and clean" than any amount of CSS.

### 4.2 Teenage Engineering - https://teenage.engineering
**Take: numbers rendered as the design language.**
Scandinavian minimalism, black/white/greyscale, alphanumeric product naming (EP-133, PO-12) treated typographically. Specs are not footnotes, they are the aesthetic. Products shot as standalone objects with no lifestyle staging.

**Apply here:** this is the fix for the unused Geist Mono. `60g`, `4000 Hz`, `32K DPI`, `800 eDPI` set in mono at a confident size, tabular-aligned across cards, becomes the visual identity. It also suits a Danish site: TE is the closest reference to a Nordic design register.

### 4.3 Rocket Jump Ninja - https://www.rocketjumpninja.com
**Take: hand-measurement as the primary axis, and domain credibility.**
The definitive gaming-mouse review site. Its central tool is a mouse search driven by **hand measurements**, and its rankings sort by mouse size. It leads with "200+ mouse reviews" and "25+ years FPS experience" as the trust anchor.

**Apply here:** `Mouse.haandStoerrelse` (`lille` / `medium` / `stor`) and `Mouse.greb` are already in the schema and already populated. RJN proves that grip and hand-size are the axes buyers actually decide on, ahead of brand. Surface them harder, and route the hero CTA into `/find-mus` around exactly those two questions.

### 4.4 ProSettings - https://prosettings.net/lists/cs2/
**Take: the data completeness. Reject the visual density.**
Your direct competitor and, per `/om`, one of your own data sources. Roughly 15 columns per player: team, role, mouse, polling Hz, DPI, sensitivity, eDPI, zoom sens, monitor, resolution, mousepad, keyboard. Grouped by team. Explicit "we update as soon as possible" living-database framing.

**Apply here:** two lessons pulling in opposite directions, both useful. (a) Their data model is more complete than yours; `ProSettings.pollingHz` is optional in your schema and unused on the page. (b) Their presentation is a wall of table. **Your differentiation is being the readable one.** Don't out-table them. Out-design them, and match them on sourcing rigour by actually rendering `kilde` and `sidstVerificeret`.

### 4.5 Wooting - https://wooting.io
**Take: a gaming-peripheral brand that reads as engineering, not as "gamer".**
Clean modular grid, restrained sans-serif, neutral backgrounds, product photography over stylised renders. Critically: it leads with technical specifications ("Analog Hall Effect", "Ultra Low Latency", "8kHz Polling Rate") rather than neon and lifestyle imagery. RGB appears only as a documented product feature, never as site chrome.

**Apply here:** this is the tone target and the direct argument for deleting the cyan glows. Wooting proves you can be unmistakably a gaming brand while using zero neon in the interface. Keep the cyan as a functional accent (links, active state, one primary CTA). Never as ambient light.

---

## 5. Proposed direction

**One line:** dark, quiet, spec-led. Mono numerals as the identity. Product photography does the visual work. Cyan reduced from ambient glow to a functional accent used once per view.

### 5.1 Tokens

Keep the existing oklch scale in `globals.css` - the neutrals are good and the dark base is right. Change only these:

- **Remove every `shadow-[0_0_Npx...]` glow.** Replace hover elevation with a border-colour shift plus a 1px tinted shadow at most.
- **Accent discipline:** cyan `oklch(0.65 0.18 210)` stays, but restricted to: the single primary CTA, link hover, and active nav. It should appear at most three times per viewport. Currently it is on every card hover, every buy button, and the hero glow simultaneously.
- **Radius:** pick one. Currently `rounded-lg` (image box), `rounded-xl` (cards), `rounded-full` (badges) coexist without a rule. Proposed rule, documented and followed: **cards 12px, inner media 8px, badges and pills full.**
- **Add `font-mono` usage:** every numeric spec gets `font-mono tabular-nums`.

### 5.2 Typography

| Role | Treatment |
|---|---|
| H1 | `text-4xl md:text-5xl tracking-tight`, max 2 lines. Do not scale past this - the headline is 3 words in Danish. |
| H2 | `text-2xl tracking-tight`. Current value is fine. |
| Body | `text-base text-muted-foreground leading-relaxed max-w-[65ch]` |
| **Specs** | **`font-mono tabular-nums`** - this is the new signature. Weight, DPI, eDPI, Hz, price. |

Geist stays as the sans. It is already loaded, it is the correct neutral, and the brief is explicitly minimal so Inter-adjacent neutrality is the right call here rather than a character face.

### 5.3 Section plan

**Hero.** Keep the breadcrumb. Keep the H1 and the one-paragraph intro (it is currently 31 words - trim to under 20). **One** primary CTA: "Find din mus" into `/find-mus`. Delete the secondary CTA rather than fix its dead anchor - it duplicates the intent of the "Se alle" link further down. Kill the 10%-opacity background image and the gradient scrim; either commit to a real hero visual or run clean on `bg-background`. Cap top padding at `pt-24`.

**Trust strip (new, small).** Directly under the hero, one line: how many pros tracked, primary source, last-verified date. Pulled from real data, not written by hand. This is where the RJN/ProSettings credibility lesson lands, and it replaces the inflated "92% / 25+" claims with numbers that are true.

**Mest brugte mus (top 3).** The main event. Three cards, but redesigned: product image at real size on a plain surface, name, brand, then a mono spec row (`60g · 4000Hz · 32K`), pro-count, price, buy. This is the only section that gets the primary cyan CTA.

**CS2 Pro-indstillinger.** **Remove the embedded `MouseCard` entirely.** This is the single highest-impact change on the page. Replace each row with a compact line: player, team, mono settings block (DPI / eDPI / Hz), and the mouse name as a *text link* to `/mus/[slug]`. Show all 12 CS2 pros, not 6, since each row is now roughly a tenth of its current height. That also retires the broken "Se alle" link by making it unnecessary. Add source and verified-date per row or once for the section.

**Hvorfor denne konfiguration fungerer.** Keep the two-column idea, rewrite the contents. Left: delete the twelve fake DPI badges, replace with a single honest statistic derived from `pros.ts` at build time (for example the actual DPI distribution across the 12 tracked players). Right: the mouse-share breakdown, with percentages that sum correctly and are computed from `proBrugere` rather than typed by hand.

Both panels should compute from data. Every hardcoded number currently in this section is either wrong or unverifiable.

### 5.4 Motion

At `MOTION_INTENSITY: 3`, ship hover and active states only, and ship them well. No scroll reveals, no entry animations, no infinite loops. Card hover = border colour shift plus `-translate-y-[1px]`. Button active = `scale-[0.98]`. That is the whole motion budget, and it is the honest choice for this brief. Do not half-build scroll animation.

---

## 6. Constraints for whoever implements this

Hard rules for this page. Failing any of these means it is not done.

- Zero em-dashes (`—`) in any visible string, including `<title>`. Regular hyphen or restructure.
- Zero outer-glow shadows.
- Every number on the page is either computed from `src/data/` or is verifiably real. No hardcoded percentages.
- No `MouseCard` inside the pro-settings rows.
- One radius system, documented in a comment, applied everywhere.
- Cyan appears at most three times per viewport.
- Every CTA label fits one line at desktop and no two CTAs share an intent.
- Nav stays on one line, height stays under 80px (currently fine at `py-3`).
- Mobile collapse declared explicitly per grid section.
- Page stays dark end to end. No section inverts.
- Keep the `dark` class strategy already on `<html>`; do not introduce a competing theming approach.

---

## 7. Decisions needed from Oliver

1. **Prices.** Nothing about the affiliate value proposition works until `prisDkk` is populated. Is that manual entry, a scraper, or a retailer feed? This gates the redesign's core section, so it is the first question.
2. **`bestOffer()` ranking.** Confirm the switch from commission-ranked to price-ranked. It costs revenue per click and buys credibility. Given you built a `/transparens` page, I read you as wanting the credibility, but it is your call.
3. **Pro dataset size.** Grow past 12 CS2 pros, or scale the copy down to what 12 supports? Affects whether the trust strip reads as strong or thin.
4. **`/cs2` vs `/[esport]`.** Generalise the good static page into the dynamic route and delete the hardcoded one, or keep `/cs2` bespoke as the flagship? Recommend generalising - the duplicate has already diverged.
5. **Player photos.** `Pro.billede` exists but is unpopulated. Real photos, or drop avatars entirely? Recommend dropping them for now over shipping letter-circles.

---

## 8. Suggested sequence

1. Defect pass: dead anchors, fake DPI badges, broken percentages, typo, em-dashes. Small, safe, immediately visible.
2. Strip the glows, unify the radius, apply `font-mono tabular-nums` to all numerics.
3. Rebuild the pro-settings section as compact rows. Biggest single improvement.
4. Rebuild `MouseCard` around real product photography and a mono spec row.
5. Populate prices, flip `bestOffer()`, add the trust strip.
6. Resolve the `/cs2` vs `/[esport]` duplication.

Steps 1-4 need no new data and can ship independently. Steps 5-6 depend on the decisions in Section 7.
