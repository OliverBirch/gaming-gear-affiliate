/**
 * Ticket definitions for manual-verification questions.
 *
 * These are static definitions built at SSG time. Ticket state
 * (status: pending/answered/applied, answer text) is stored in
 * Vercel KV under key `ticket:{id}`.
 *
 * Agent writes ticket definitions here when it needs help.
 * User answers at /admin/tickets → POST /api/resolve-ticket → KV.
 * Agent reads KV on next run, applies resolutions, marks applied.
 */

export interface FreshnessTicket {
  id: string;
  type:
    | "slug-mismatch"
    | "team-change"
    | "retired-pro"
    | "free-agent"
    | "missing-pro-image"
    | "stub-mouse-created"
    | "no-mouse-offers"
    | "peripheral-missing"
    | "no-retailer-coverage"
    | "bad-product-image";
  slug: string;
  label: string;
  question: string;
  context: {
    esport?: string;
    storedTeam?: string;
    liquipediaTeam?: string | null;
    liquipediaStatus?: string | null;
    liquipediaUrl?: string;
    sourceUrl?: string;
    /** Missing image: slug of the pro whose image couldn't be downloaded */
    proSlug?: string;
    /** Stub mouse: slug of the mouse stub that needs completion */
    mouseSlug?: string;
    /** Mouse details for context */
    mouseNavn?: string;
    /** Pro who triggered the need */
    sourcePro?: string;
    /** No-retailer-coverage: product slugs with no matched DK retailer offer */
    uncoveredSlugs?: string[];
    instructions: string;
  };
  createdAt: string;
}

export interface TicketState {
  status: "pending" | "answered" | "applied";
  answer: string | null;
  answeredAt: string | null;
  appliedAt: string | null;
}

export const freshnessTickets: FreshnessTicket[] = [
  {
    id: "cned-slug-mismatch-2026-07-23",
    type: "slug-mismatch",
    slug: "cned",
    label: "cned — Liquipedia returned 404 for page \"Cned\"",
    question: "What is the correct Liquipedia Valorant page title for cned? The slug \"Cned\" returned a 404.",
    context: {
      esport: "valorant",
      storedTeam: "PCIFIC Esports",
      liquipediaUrl: "https://liquipedia.net/valorant/?search=cned",
      instructions: "Search Liquipedia for cned, find the correct page title, then tell the agent: \"resolve cned-slug-mismatch — the correct page is {title}\"",
    },
    createdAt: "2026-07-23",
  },
  {
    id: "zowie-fk1-c-no-offers-2026-07-29",
    type: "no-mouse-offers",
    slug: "xantares",
    label: "zowie-fk1-c — ingen forhandlertilbud fundet",
    question: "ZOWIE FK1-C er en ældre kablet mus som ikke længere føres af proshop.dk eller maxgaming.dk. Find alternative forhandlere eller marker som udgået. **Update 2026-08-15:** krydstjekket mod alle 4 rigtige feed-baserede forhandlere (Proshop, Geek'd, Komplett, AV-Cables) — ingen af dem har nogensinde matchet dette produkt i en feed-kørsel. ZOWIE har slet ikke nogen tilstedeværelse i Komplett eller AV-Cables' feeds. Genuint udækket indtil en ny forhandler onboardes eller FK1-DW-erstatningen bekræftes hos XANTARES.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-fk1-c",
      mouseNavn: "FK1-C",
      sourcePro: "xantares",
      sourceUrl: "https://prosettings.net/players/xantares/",
      instructions: "FK1-C er udgået og erstattet af FK1-DW (trådløs). Tjek om XANTARES har skiftet til FK1-DW, eller find brugtmarked/niche-forhandlere der stadig fører FK1-C.",
    },
    createdAt: "2026-07-29",
  },
  {
    id: "finalmouse-ultralight-x-small-no-offers-2026-07-29",
    type: "no-mouse-offers",
    slug: "nade",
    label: "finalmouse-ultralight-x-small — ingen forhandlertilbud fundet",
    question: "Finalmouse Ultralight X Small sælges kun via begrænsede drops og føres ikke løbende hos proshop.dk eller maxgaming.dk. Find en aktiv forhandlerlink eller marker som drop-only. **Update 2026-08-15:** krydstjekket mod Proshop/Geek'd's seneste feed-matches (aldrig matchet) og Komplett/AV-Cables' fulde feeds direkte (0 Finalmouse-produkter i nogen af dem). Bekræftet reel dæknings-mangel hos alle 4 onboardede forhandlere, ikke bare en forældet URL.",
    context: {
      esport: "r6",
      mouseSlug: "finalmouse-ultralight-x-small",
      mouseNavn: "Ultralight X Small",
      sourcePro: "nade",
      sourceUrl: "https://prosettings.net/players/nade/",
      instructions: "Finalmouse-produkter sælges via limited drops, ikke løbende lager. Tjek maxgaming.dk for en aktiv produktside (som for finalmouse-starlight-pro-small/finalmouse-ultralight-x-large), ellers lad offers stå tomme.",
    },
    createdAt: "2026-07-30",
  },
  {
    id: "proshop-feed-retailer-coverage-2026-08-07",
    type: "no-retailer-coverage",
    slug: "catalog",
    label: "33 mice + 5 keyboards + 4 monitors + 14 mousepads have zero DK retailer offers — find coverage or a substitute",
    question:
      "After matching the Proshop XML feed (partnerid=57198) against the catalog and removing MaxGaming entirely (2026-08-08 — it was never a real affiliate partner) plus every Proshop link/price that couldn't be confirmed against a fresh feed download, the zero-coverage list grew substantially: 33 mice (mostly boutique brands: Vaxee, Finalmouse, Fnatic, PMM, Waizowl, Fallen Gear, Sony Inzone, several ZOWIE regional SKUs, plus some flagship models whose old Proshop links turned out to be guessed/unverified — razer-viper-v3-pro, razer-viper-v4-pro, zowie-u2-dw, pulsar-x2, logitech-g-pro-x-superlight), 5 keyboards (wooting-80he, razer-huntsman-v3-pro, corsair-k100-rgb, keychron-k4-he, aula-f75-pro — all had proshop as their ONLY retailer, all unverified), 4 monitors (zowie-xl2566k, zowie-xl2546k, asus-rog-swift-pg27aqdm, alienware-aw2524h), and 14 mousepads (steelseries-qck-heavy, zowie-g-sr-iii/h-sr-iii/g-tr/g-sr-ii, artisan-ninja-fx-zero/fx-hien/type-99, logitech-g740/g640, vaxee-pa, xtrfy-gp4, fnatic-focus-3, corsair-mm250). For each: (1) check whether Geek'd/Computersalg/Coolshop/AVXperten/Dustin Home/Komplett/Billo (already in retailers.ts) carries it — if so, that retailer's own feed/API can supply a real offer (MaxGaming is not a retailer partner — do not source offers from there); (2) if genuinely no Danish retailer carries it, find the closest comparable in-catalog product to show as a substitute instead of a dead end. **Update 2026-08-15:** the 13 mouse stubs in this list (pulsar-xlite-v4-es, zowie-s1/za13-dw/ec3-cw/ec2-cw/ec3-dw, pulsar-zywoo-chosen-mouse-gen2, pmm-zen-8k-mini, sony-inzone-mouse-a, fallen-gear-lobo-wireless, vaxee-np01s-wireless, lamzu-inca, waizowl-ogm-cloud-8k) now have full specs and Danish copy (their `stub-mouse-created` tickets are resolved and removed) — sourced from manufacturer pages plus prosettings.net/eloshapes.com aggregators, since RTINGS is paywalled and TechPowerUp 403'd on every fetch for this whole batch. Offer coverage was re-checked directly against all 4 real feeds (Proshop, Geek'd, Komplett, AV-Cables) and remains genuinely zero for all 13 — they stay in `uncoveredSlugs` below, this is not stale. VAXEE NP-01S's maxDpi (3200) and the ZOWIE EC3-CW/DW width figures came from a single aggregator each and should be treated as lower-confidence than the rest. lamzu-thorn-v2 is unaffected (already had a Proshop offer) and was not re-added here.",
    context: {
      uncoveredSlugs: [
        // mice
        "razer-viper-v3-pro", "razer-viper-v4-pro", "zowie-u2-dw", "pulsar-x2",
        "logitech-g-pro-x-superlight", "finalmouse-starlight-pro-small",
        "wlmouse-beast-x-pro", "pulsar-jinggg-x", "ninjutso-sora-v2",
        "asus-rog-harpe-ace-2",
        "finalmouse-ultralight-x-small", "wlmouse-beast-x-max",
        "vaxee-outset-ax-wireless", "razer-viper-mini-signature-edition", "pulsar-susanto-x",
        "zowie-donk-mouse",
        "vaxee-np01s-v2-wireless", "zowie-ec1-c", "vaxee-xe-v2", "pulsar-xlite-v4-es",
        "zowie-s1", "zowie-za13-dw", "zowie-ec3-cw", "zowie-ec2-cw",
        "pulsar-zywoo-chosen-mouse-gen2", "pmm-zen-8k-mini", "sony-inzone-mouse-a",
        "fallen-gear-lobo-wireless", "vaxee-np01s-wireless",
        "zowie-ec3-dw", "lamzu-inca", "waizowl-ogm-cloud-8k", "zowie-fk1-c",
        // vaxee-xe-wireless, fnatic-lamzu-maya-8k, g-wolves-hts-pro-4k,
        // finalmouse-ultralight-x-large, pulsar-x2h moved to their own
        // no-mouse-offers tickets below (2026-08-08) — MaxGaming offer
        // removed after confirming it's genuinely not carried anymore,
        // not just a stale URL.

        // keyboards (2026-08-08 — proshop was the only, unverified retailer)
        "wooting-80he", "razer-huntsman-v3-pro", "corsair-k100-rgb",
        "keychron-k4-he", "aula-f75-pro",

        // monitors (2026-08-08)
        "zowie-xl2566k", "zowie-xl2546k", "asus-rog-swift-pg27aqdm",
        "alienware-aw2524h",

        // mousepads (2026-08-08)
        "steelseries-qck-heavy", "zowie-g-sr-iii", "zowie-h-sr-iii", "zowie-g-tr",
        "logitech-g740", "logitech-g640", "zowie-g-sr-ii",
        "artisan-ninja-fx-zero", "artisan-fx-hien", "artisan-type-99",
        "vaxee-pa", "xtrfy-gp4", "fnatic-focus-3", "corsair-mm250",
      ],
      instructions:
        "Same methodology as scripts/match-proshop-eans.mjs (exact-EAN pass first, then full-catalog-token-overlap fuzzy match with the extra-token allowlist — see that file's comments for why loose matching produced false positives before). For brands with no DK retail presence at all (most Finalmouse/PMM/Waizowl/Fallen Gear drops), don't leave the page empty — pick the closest substitute already in the catalog by form factor + weight + sensor tier and note it's a substitute, not the exact SKU. Keyboards/headsets/monitors/mousepads never store per-product URLs (only a generic category-page link per retailer) — a 'match' for those categories means confirming the retailer actually carries *a* unit of that exact product at *some* price, then wiring the category-page URL + payout into that file's SEARCH_URLS/allowedRetailers/payoutPct config (see how Geek'd was wired into keyboards.ts/headsets.ts/mousepads.ts on 2026-08-08 for the pattern) — not finding a per-product link.",
    },
    createdAt: "2026-08-07",
  },
  {
    id: "vaxee-xe-wireless-no-offers-2026-08-08",
    type: "no-mouse-offers",
    slug: "vaxee-xe-wireless",
    label: "vaxee-xe-wireless — MaxGaming offer removed, no replacement found",
    question:
      "MaxGaming's old vaxee-xe-wireless URL 404'd; a site search on maxgaming.dk turned up zero listings for the mouse itself (only mouse skates/grips compatible with it). We have no MaxGaming XML feed to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer (Geek'd, Computersalg, Coolshop, AVXperten, Dustin Home, Komplett, Billo) carry it? **Update 2026-08-15:** Computersalg/Coolshop/AVXperten/Dustin Home/Billo have since been purged as placeholder retailers (see retailer-purge-coverage ticket). Checked the 4 real remaining feed-based retailers: Proshop and Geek'd's own match reports show this was never matched; Komplett and AV-Cables' full feeds have zero VAXEE-brand products at all. Confirmed genuine zero coverage, not a stale link.",
    context: {
      mouseSlug: "vaxee-xe-wireless",
      mouseNavn: "XE Wireless",
      instructions: "Check the other onboarded retailers' feeds/sites for this product before falling back to a substitute mouse.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "fnatic-lamzu-maya-8k-no-offers-2026-08-08",
    type: "no-mouse-offers",
    slug: "fnatic-lamzu-maya-8k",
    label: "fnatic-lamzu-maya-8k — MaxGaming offer removed, no replacement found",
    question:
      "MaxGaming's old fnatic-lamzu-maya-8k URL 404'd; a site search returned zero results for this Fnatic x Lamzu collab edition. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer carry this specific collab edition, or has it sold out permanently (limited collab drop)? **Update 2026-08-15:** Proshop/Geek'd match reports show no match; Komplett and AV-Cables' full feeds carry zero Lamzu-brand products of any kind. Confirmed genuine zero coverage across all 4 real retailers — treat as a permanently-gone collab drop unless a new retailer surfaces it.",
    context: {
      mouseSlug: "fnatic-lamzu-maya-8k",
      mouseNavn: "Fnatic x Lamzu Maya 8K",
      instructions: "If this was a one-time collab drop that's permanently gone, consider pointing to the plain lamzu-maya-x as the closest in-catalog substitute instead of leaving offers empty.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "g-wolves-hts-pro-4k-no-offers-2026-08-08",
    type: "no-mouse-offers",
    slug: "g-wolves-hts-pro-4k",
    label: "g-wolves-hts-pro-4k — MaxGaming offer removed, no replacement found",
    question:
      "MaxGaming's old g-wolves-hts-pro-4k URL 404'd; MaxGaming currently only stocks \"HTS Plus 4K\", a different tier from our catalog's \"HTS Pro 4K\" — not safe to assume they're interchangeable. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer carry the actual Pro tier? **Update 2026-08-15:** Proshop/Geek'd never matched it; Komplett and AV-Cables' feeds have zero G-Wolves products. Confirmed genuine zero coverage across all 4 real retailers.",
    context: {
      mouseSlug: "g-wolves-hts-pro-4k",
      mouseNavn: "HTS Pro 4K",
      instructions: "Confirm whether G-Wolves' \"Pro\" and \"Plus\" 4K tiers are genuinely different SKUs (specs, price) before treating MaxGaming's Plus listing as a match.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "finalmouse-ultralight-x-large-no-offers-2026-08-08",
    type: "no-mouse-offers",
    slug: "finalmouse-ultralight-x-large",
    label: "finalmouse-ultralight-x-large — MaxGaming offer removed, no replacement found",
    question:
      "MaxGaming's old finalmouse-ultralight-x-large URL 404'd; MaxGaming's current Finalmouse lineup is all newer rebrand editions (ULX Prophecy, ULX Frostlord — both sold out; Starlight X Nightfall — coming soon), none of which are confirmed to be the same product as our catalog's plain \"Ultralight X Large\". No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. **Update 2026-08-15:** Proshop/Geek'd never matched it; Komplett and AV-Cables' feeds carry zero Finalmouse products at all. Confirmed genuine zero coverage across all 4 real retailers.",
    context: {
      mouseSlug: "finalmouse-ultralight-x-large",
      mouseNavn: "Ultralight X Large",
      instructions: "Finalmouse renames/relaunches this line frequently via limited drops (see the related finalmouse-ultralight-x-small and finalmouse-starlight-pro-small tickets). Check which current edition, if any, corresponds to our catalog entry before relinking.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "pulsar-x2h-no-offers-2026-08-08",
    type: "no-mouse-offers",
    slug: "pulsar-x2h",
    label: "pulsar-x2h — MaxGaming offer removed, no replacement found",
    question:
      "MaxGaming's old pulsar-x2h URL 404'd; MaxGaming's current Pulsar X2H lineup is all newer generations (v3, CrazyLight, High Hump/eS) with different sensors than our catalog's PAW3395/1000Hz spec — not safe to assume interchangeable. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. (pulsar-x2 has the same issue but kept its proshop offer.) **Update 2026-08-15:** Komplett's live feed does carry Pulsar X2H — but only \"Pulsar X2H CrazyLight Gamingmus 43g\" and \"Pulsar X2H CRAZYLIGHT Mini\", the same newer-generation rebrand MaxGaming had, not the original PAW3395/1000Hz SKU. Same interchangeability problem, confirmed independently on a second retailer. AV-Cables carries no Pulsar products. Proshop/Geek'd never matched it either.",
    context: {
      mouseSlug: "pulsar-x2h",
      mouseNavn: "X2H",
      instructions: "Either find where the original PAW3395 X2H is still sold, or update the catalog spec/offers to match whichever current Pulsar generation is actually being linked.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "vaxee-xe-wireless-wrong-image-2026-08-08",
    type: "bad-product-image",
    slug: "vaxee-xe-wireless",
    label: "vaxee-xe-wireless — product image is a marketing infographic, not a photo",
    question:
      "The current /images/mice/vaxee-xe-wireless.jpg is a full spec-sheet infographic (dev philosophy copy, latency charts, dimension diagrams) with no clean shot of the mouse itself. Neither Proshop nor Geek'd matched this product during the 2026-08-08 image-consistency pass, so it was never replaced.",
    context: {
      mouseSlug: "vaxee-xe-wireless",
      mouseNavn: "XE Wireless",
      instructions: "Source a real isolated product photo (manufacturer site, RTINGS, or a DK retailer listing) and replace the file, same as the add-mouse skill's image-sourcing step.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "g-wolves-hts-pro-4k-white-on-white-2026-08-08",
    type: "bad-product-image",
    slug: "g-wolves-hts-pro-4k",
    label: "g-wolves-hts-pro-4k — white mouse on white background, too risky to auto-remove",
    question:
      "This mouse is white/light-colored on a white studio background, so flood-fill background removal can't safely distinguish product edges from backdrop — it risks eating into the mouse's own silhouette. Left as-is (solid background) rather than risk a corrupted cutout.",
    context: {
      mouseSlug: "g-wolves-hts-pro-4k",
      mouseNavn: "HTS Pro 4K",
      instructions: "Needs either a manual/assisted cutout (proper matting tool, not flood-fill) or a replacement photo shot against a darker or more distinct backdrop.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "pulsar-jinggg-x-white-on-white-2026-08-08",
    type: "bad-product-image",
    slug: "pulsar-jinggg-x",
    label: "pulsar-jinggg-x — white mouse on white background, too risky to auto-remove",
    question:
      "Same issue as g-wolves-hts-pro-4k: white mouse on a white background, flood-fill can't reliably tell the two apart without risking damage to the product silhouette. Left as-is.",
    context: {
      mouseSlug: "pulsar-jinggg-x",
      mouseNavn: "JinGGG X",
      instructions: "Needs either a manual/assisted cutout (proper matting tool, not flood-fill) or a replacement photo shot against a darker or more distinct backdrop.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "ninjutso-sora-v2-white-on-white-2026-08-08",
    type: "bad-product-image",
    slug: "ninjutso-sora-v2",
    label: "ninjutso-sora-v2 — white mouse on white background, too risky to auto-remove",
    question:
      "Same issue as g-wolves-hts-pro-4k and pulsar-jinggg-x: white mouse on a white background, flood-fill can't reliably tell the two apart without risking damage to the product silhouette. Left as-is.",
    context: {
      mouseSlug: "ninjutso-sora-v2",
      mouseNavn: "Sora V2",
      instructions: "Needs either a manual/assisted cutout (proper matting tool, not flood-fill) or a replacement photo shot against a darker or more distinct backdrop.",
    },
    createdAt: "2026-08-08",
  },
  {
    id: "pulsar-x2h-white-on-white-2026-08-09",
    type: "bad-product-image",
    slug: "pulsar-x2h",
    label: "pulsar-x2h — translucent/white colorway on white background, too risky to auto-remove",
    question:
      "The current /images/mice/pulsar-x2h.jpg shows both colorways side by side; the right-hand frosted-white/clear variant sits on a white studio background with no reliable edge for flood-fill to key off — same risk as g-wolves-hts-pro-4k/pulsar-jinggg-x/ninjutso-sora-v2. Missed during the 2026-08-08 background-removal pass (not processed, not ticketed at the time) — caught during a 2026-08-09 follow-up audit that verified transparency pixel-by-pixel rather than trusting the prior pass's own report.",
    context: {
      mouseSlug: "pulsar-x2h",
      mouseNavn: "X2H",
      instructions: "Needs either a manual/assisted cutout (proper matting tool, not flood-fill) or a replacement photo shot against a darker or more distinct backdrop — ideally a single-colorway shot rather than the current side-by-side.",
    },
    createdAt: "2026-08-09",
  },
  {
    id: "zowie-u2-dw-white-on-white-2026-08-09",
    type: "bad-product-image",
    slug: "zowie-u2-dw",
    label: "zowie-u2-dw — white mouse on white background, too risky to auto-remove",
    question:
      "Same issue as g-wolves-hts-pro-4k/pulsar-jinggg-x/ninjutso-sora-v2: a glossy white mouse on a white studio background, flood-fill can't reliably tell the two apart without risking damage to the product silhouette. Missed during the 2026-08-08 background-removal pass (not processed, not ticketed at the time) — caught during a 2026-08-09 follow-up audit that verified transparency pixel-by-pixel rather than trusting the prior pass's own report.",
    context: {
      mouseSlug: "zowie-u2-dw",
      mouseNavn: "U2 DW",
      instructions: "Needs either a manual/assisted cutout (proper matting tool, not flood-fill) or a replacement photo shot against a darker or more distinct backdrop.",
    },
    createdAt: "2026-08-09",
  },
  {
    id: "r6-peripheral-no-source-2026-08-10",
    type: "peripheral-missing",
    slug: "catalog",
    label: "23 R6 pros have no prosettings.net page at all — no gear data source",
    question:
      "During a full pros-completeness push, 4 parallel research passes covered all 366 pros against prosettings.net (the mandated gear-data source per AGENTS.md). Of 49 R6 pros with zero peripheral data, 26 were successfully researched; these 23 have no prosettings.net page whatsoever — confirmed against the site's own R6 player-list pages (3 pages, ~57 players total), not just single-URL guesses, so this isn't a transient 404 or extraction miss. One additional pro, `monk`, has a prosettings.net page at that exact slug, but it resolves to a same-nickname Valorant player (Cloud9), not our R6 pro — a naming collision, not real data for this pro.",
    context: {
      esport: "r6",
      uncoveredSlugs: [
        "brid", "yuzus", "solotov", "vitaking", "cyber", "cameram4n",
        "sheppard", "monk", "deapek", "volpz", "anitun",
        "virtue", "p4", "canadian", "deadshot", "hungry", "scyther",
        "kantoraketti", "merc", "uuno", "xs3xycake", "shiinka", "t3b",
      ],
      instructions:
        "prosettings.net simply doesn't cover these players. Try Liquipedia (https://liquipedia.net/rainbowsix/{name}) or the team's own site/socials for gear data as a fallback source — this is a deliberate exception to the 'always prosettings.net' rule since prosettings has no page to be wrong about here. For `monk` specifically, search Liquipedia for the correct R6 player (Cloud9 roster) since the prosettings.net slug is taken by an unrelated Valorant player. Add findings to src/data/pros-peripherals.json under each proSlug key (monitor/keyboard/mousepad/headset, free text — the fuzzy-matching layer in pros-peripherals-mapping.ts resolves catalog slugs automatically from this). If a player genuinely has no public gear info anywhere, leave them out rather than guessing.",
    },
    createdAt: "2026-08-10",
  },
  {
    id: "partial-peripheral-fields-2026-08-10",
    type: "peripheral-missing",
    slug: "catalog",
    label: "12 pros (5 CS2, 7 Valorant) have specific gear fields confirmed absent on their prosettings.net page",
    question:
      "Same research pass as the R6 ticket above. These 12 pros DO have a prosettings.net page and most fields were found, but 16 specific fields (mostly `headset`) were double-checked directly against the live gear grid and confirmed genuinely not listed — not extraction misses. Prosettings.net just doesn't have every field for every player.",
    context: {
      uncoveredSlugs: [
        "cobra", "danistzz", "nython", "ricioli", "cairne",
        "cgrs", "koshmaras", "riens", "s0pp", "skuba", "seven", "qpert",
      ],
      instructions:
        "Missing fields per pro: cobra (headset), danistzz (headset), nython (headset), ricioli (keyboard), cairne (mousepad, headset), cgrs (monitor), koshmaras (monitor, mousepad — the earlier-recorded 'Pulsar PCMK 3' mousepad was corrected to keyboard this session after re-verifying against the live page, mousepad is now genuinely empty), riens (headset), s0pp (monitor, headset), skuba (headset), seven (keyboard), qpert (mousepad). Check Liquipedia or the player's socials for these specific fields, then update the relevant key in src/data/pros-peripherals.json (leave as null if still not found — don't guess a plausible-sounding product).",
    },
    createdAt: "2026-08-10",
  },
  {
    id: "retailer-purge-coverage-2026-08-10",
    type: "no-retailer-coverage",
    slug: "catalog",
    label: "4 headsets + 2 mice still have zero offers after Computersalg/Coolshop/Elgiganten/AVXperten/Dustin Home/Komplett/Billo were purged",
    question:
      "Same cleanup as the 2026-08-08 MaxGaming removal, applied to 7 more retailers that turned out to be placeholder entries in retailers.ts (category-search URLs with manually-typed or guessed prices) rather than real, feed-matched partnerships — confirmed by the user, who only wants retailers with an actual XML feed treated as partners. Removing them (RETAILER_SLUGS, retailers.ts, every category's offer-builder wiring, priser/offers entries, prices.json overrides, ALLOWED_REDIRECT_HOSTS) dropped 7 products to zero offers, since these placeholder retailers were their only price source and neither Proshop nor Geek'd had matched them. **Update 2026-08-15:** a real \"Komplett\" retailer (Adtraction feed, distinct from the removed placeholder) was onboarded and its EAN matcher found a genuine per-product offer for steelseries-arctis-nova-pro-wireless (2090 kr, in stock) — removed from the list below. The remaining 6 are still uncovered: hyperx-cloud-ii (58 pros — the catalog's most pro-used headset), hyperx-cloud-ii-wireless, corsair-hs80-rgb-usb, sony-inzone-h9-ii, zowie-ec2-dw, zowie-fk2-dw. A new partner, Shark Gaming (Adtraction feed), was evaluated the same session but not onboarded — their affiliate program only pays commission on their own house-brand SKUs, not the third-party brands their feed lists, and the catalog carries none of their house brand.",
    context: {
      uncoveredSlugs: [
        "hyperx-cloud-ii",
        "hyperx-cloud-ii-wireless",
        "corsair-hs80-rgb-usb",
        "sony-inzone-h9-ii",
        "zowie-ec2-dw",
        "zowie-fk2-dw",
      ],
      instructions:
        "Check whether Proshop, Geek'd, Komplett, or AV-Cables' feed carries any of these (re-run scripts/match-proshop-eans.mjs / scripts/match-geekd-eans.mjs / scripts/match-komplett-eans.mjs / scripts/match-avcables-eans.mjs against a fresh download — none of the 6 have matched any feed so far). hyperx-cloud-ii is the highest-priority gap by far given its pro-usage count. If no feed matches, this is a genuine zero-coverage product until a new real retailer partnership is onboarded (see AGENTS.md's retailer-onboarding checklist) — don't relink a category-search URL as a substitute, that's the exact pattern being removed here. **Update 2026-08-17:** traced why hyperx-cloud-ii specifically has never matched match-komplett-eans.mjs — Komplett's title \"Hyperx Cloud 2 (II) Gaming Headset (gun metal)\" tokenizes to include a bare \"2\", which the matcher's isDangerous() check flags as a disallowed extra token (leading-digit rule) unless the EAN ground-truth escape hatch fires; hyperx-cloud-ii has no `ean` recorded in headsets.json, so the escape hatch can't fire and the match is rejected — same failure shape the script's own comments document for the Arctis Nova Pro Wireless PS5 case. Populating a trustworthy `ean` for hyperx-cloud-ii (and the other 5 slugs) would let the next feed run match on ground truth instead of wording. Did not add one this session — no reliable source reachable (retailer product pages 403/timeout blocked WebFetch, no browser extension connected, manufacturer datasheet PDF cert-blocked, and Cloud II ships in multiple colorways with distinct EANs so a search-snippet number risks being both unverified and the wrong colorway). Also confirmed a Proshop DKK price surfaced via web search (1208 kr) doesn't reconcile against the NOK/SEK listings for the same SKU (~530-565 kr converted) and shouldn't be trusted or used. **Correction, same day:** the \"2\"-token/missing-EAN theory above was a hypothesis reasoned from reading the matcher's code, not from actually running it — built the real shared matcher (src/lib/feed-sync/) later this session and ran it against Komplett's actual feed (6,230 items). Ground truth: hyperx-cloud-ii's diagnostic is `not-in-feed` — no feed row for it exists at all (Komplett carries Cloud III, Cloud Alpha, Cloud Stinger 2/3, but genuinely no Cloud II SKU right now), confirming the direct grep finding from earlier this session, not the token-rejection theory. The matcher run did surface one real, useful thing for this ticket: **corsair-hs80-rgb-usb now has a clean name/brand match in Komplett's feed** — \"Corsair HS80 RGB Gaming Headset (carbon)\", 709 kr, in stock, EAN 840006644484 — not EAN-ground-truth-confirmed only because headsets.json has no `ean` recorded for this slug (not because of a token conflict). This is a genuine new-match candidate awaiting human review, not yet applied anywhere. The run also re-confirmed steelseries-arctis-nova-pro-wireless's existing offer (2090 kr, EAN-confirmed) and hyperx-cloud-iii's existing Komplett offer exactly as already committed, which is a good sign the matcher reproduces known-good data correctly.",
    },
    createdAt: "2026-08-10",
  },
];
