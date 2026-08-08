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
    id: "virtyy-missing-image-2026-07-27",
    type: "missing-pro-image",
    slug: "virtyy",
    label: "virtyy — pro image could not be downloaded",
    question: "Virtyy's player image is not hosted on prosettings.net CDN (all URL patterns failed). Needs manual sourcing.",
    context: {
      esport: "valorant",
      proSlug: "virtyy",
      sourceUrl: "https://prosettings.net/players/virtyy/",
      instructions: "Download virtyy's player photo (square, min 220x220px). Save as public/images/pros/virtyy.png. Acceptable sources: prosettings.net HTML page (right-click → save), Liquipedia, vlr.gg, or the player's Twitter/Twitch. Then resolve this ticket with the source URL used.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "t0oro-missing-image-2026-07-27",
    type: "missing-pro-image",
    slug: "t0oro",
    label: "tO0RO — pro page 404 on prosettings + no CDN image",
    question: "tO0RO's pro page at prosettings.net returns a 404 and no CDN image could be found. Needs manual sourcing.",
    context: {
      esport: "cs2",
      proSlug: "t0oro",
      sourceUrl: "https://prosettings.net/teams/virtus-pro/",
      instructions: "Download tO0RO's player photo (square, min 220x220px). Save as public/images/pros/t0oro.png. The prosettings.net player page is broken (404) — try Liquipedia, HLTV, or the player's social media (Twitter/Telegram). Then resolve this ticket with the source URL used.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "pulsar-xlite-v4-es-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "electronic",
    label: "pulsar-xlite-v4-es — mouse stub needs completion",
    question: "electronic uses a Pulsar Xlite V4 Es Medium which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "pulsar-xlite-v4-es",
      mouseNavn: "Xlite V4 Es Medium",
      sourcePro: "electronic",
      sourceUrl: "https://prosettings.net/players/electronic/",
      instructions: "Run add-mouse skill for 'pulsar-xlite-v4-es'. Sources: RTINGS → Techpowerup → Pulsar product page. Fill in specs (weight, dimensions, sensor, polling rate, switch type), write Danish copy (beskrivelse, fordele, ulemper), find proshop.dk/Geek'd offers (MaxGaming is not a retailer partner — do not source offers or images from there), download product image. Then resolve this ticket when complete.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-s1-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "laser",
    label: "zowie-s1 — mouse stub needs completion",
    question: "laser uses a ZOWIE S1 which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-s1",
      mouseNavn: "S1",
      sourcePro: "laser",
      sourceUrl: "https://prosettings.net/players/laser/",
      instructions: "Run the add-mouse skill for zowie-s1 to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-za13-dw-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "koala",
    label: "zowie-za13-dw — mouse stub needs completion",
    question: "koala uses a ZOWIE ZA13-DW which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-za13-dw",
      mouseNavn: "ZA13-DW",
      sourcePro: "koala",
      sourceUrl: "https://prosettings.net/players/koala/",
      instructions: "Run the add-mouse skill for zowie-za13-dw to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-ec3-cw-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "rdnzao",
    label: "zowie-ec3-cw — mouse stub needs completion",
    question: "rdnzao uses a ZOWIE EC3-CW which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-ec3-cw",
      mouseNavn: "EC3-CW",
      sourcePro: "rdnzao",
      sourceUrl: "https://prosettings.net/players/rdnzao/",
      instructions: "Run the add-mouse skill for zowie-ec3-cw to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-ec2-cw-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "wood7",
    label: "zowie-ec2-cw — mouse stub needs completion",
    question: "WOOD7 uses a ZOWIE EC2-CW which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-ec2-cw",
      mouseNavn: "EC2-CW",
      sourcePro: "wood7",
      sourceUrl: "https://prosettings.net/players/wood7/",
      instructions: "Run the add-mouse skill for zowie-ec2-cw to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "pulsar-zywoo-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "davih",
    label: "pulsar-zywoo-chosen-mouse-gen2 — mouse stub needs completion",
    question: "DaviH uses a Pulsar ZywOo The Chosen Mouse Gen.2 which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "valorant",
      mouseSlug: "pulsar-zywoo-chosen-mouse-gen2",
      mouseNavn: "ZywOo The Chosen Mouse Gen.2",
      sourcePro: "davih",
      sourceUrl: "https://prosettings.net/players/davih/",
      instructions: "Run the add-mouse skill for pulsar-zywoo-chosen-mouse-gen2 to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "pmm-zen-8k-mini-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "seven",
    label: "pmm-zen-8k-mini — mouse stub needs completion",
    question: "seven uses a PMM Zen 8K Mini (Viper V3 Pro mod) which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "valorant",
      mouseSlug: "pmm-zen-8k-mini",
      mouseNavn: "Zen 8K Mini",
      sourcePro: "seven",
      sourceUrl: "https://prosettings.net/players/seven/",
      instructions: "Run the add-mouse skill for pmm-zen-8k-mini to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "sony-inzone-mouse-a-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "qpert",
    label: "sony-inzone-mouse-a — mouse stub needs completion",
    question: "qpert uses a Sony INZONE Mouse-A which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "valorant",
      mouseSlug: "sony-inzone-mouse-a",
      mouseNavn: "INZONE Mouse-A",
      sourcePro: "qpert",
      sourceUrl: "https://prosettings.net/players/qpert/",
      instructions: "Run the add-mouse skill for sony-inzone-mouse-a to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "lamzu-thorn-v2-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "ara",
    label: "lamzu-thorn-v2 — mouse stub needs completion",
    question: "ara uses a Lamzu Thorn V2 which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "valorant",
      mouseSlug: "lamzu-thorn-v2",
      mouseNavn: "Thorn V2",
      sourcePro: "ara",
      sourceUrl: "https://prosettings.net/players/ara/",
      instructions: "Run the add-mouse skill for lamzu-thorn-v2 to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "fallen-gear-lobo-wireless-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "fallen",
    label: "fallen-gear-lobo-wireless — mouse stub needs completion",
    question: "FalleN uses a Fallen Gear Lobo Wireless which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "fallen-gear-lobo-wireless",
      mouseNavn: "Lobo Wireless",
      sourcePro: "fallen",
      sourceUrl: "https://prosettings.net/players/fallen/",
      instructions: "Run the add-mouse skill for fallen-gear-lobo-wireless to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "vaxee-np01s-wireless-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "exit",
    label: "vaxee-np01s-wireless — mouse stub needs completion",
    question: "exit uses a VAXEE ZYGEN NP-01S Wireless (original, not V2) which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "vaxee-np01s-wireless",
      mouseNavn: "ZYGEN NP-01S Wireless",
      sourcePro: "exit",
      sourceUrl: "https://prosettings.net/players/exit/",
      instructions: "Run the add-mouse skill for vaxee-np01s-wireless to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-ec3-dw-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "mhl",
    label: "zowie-ec3-dw — mouse stub needs completion",
    question: "mhL uses a ZOWIE EC3-DW (wireless) which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "zowie-ec3-dw",
      mouseNavn: "EC3-DW",
      sourcePro: "mhl",
      sourceUrl: "https://prosettings.net/players/mhl/",
      instructions: "Run the add-mouse skill for zowie-ec3-dw to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "lamzu-inca-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "peeping",
    label: "lamzu-inca — mouse stub needs completion",
    question: "Peeping uses a Lamzu Inca Black which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "lamzu-inca",
      mouseNavn: "Inca Black",
      sourcePro: "peeping",
      sourceUrl: "https://prosettings.net/players/peeping/",
      instructions: "Run the add-mouse skill for lamzu-inca to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "waizowl-ogm-cloud-8k-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "perfecto",
    label: "waizowl-ogm-cloud-8k — mouse stub needs completion",
    question: "Perfecto uses a Waizowl OGM Cloud 8K which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "waizowl-ogm-cloud-8k",
      mouseNavn: "OGM Cloud 8K",
      sourcePro: "perfecto",
      sourceUrl: "https://prosettings.net/players/perfecto/",
      instructions: "Run the add-mouse skill for waizowl-ogm-cloud-8k to fill in specs, copy, and offers.",
    },
    createdAt: "2026-07-27",
  },
  {
    id: "zowie-fk1-c-no-offers-2026-07-29",
    type: "no-mouse-offers",
    slug: "xantares",
    label: "zowie-fk1-c — ingen forhandlertilbud fundet",
    question: "ZOWIE FK1-C er en ældre kablet mus som ikke længere føres af proshop.dk eller maxgaming.dk. Find alternative forhandlere eller marker som udgået.",
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
    question: "Finalmouse Ultralight X Small sælges kun via begrænsede drops og føres ikke løbende hos proshop.dk eller maxgaming.dk. Find en aktiv forhandlerlink eller marker som drop-only.",
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
      "After matching the Proshop XML feed (partnerid=57198) against the catalog and removing MaxGaming entirely (2026-08-08 — it was never a real affiliate partner) plus every Proshop link/price that couldn't be confirmed against a fresh feed download, the zero-coverage list grew substantially: 33 mice (mostly boutique brands: Vaxee, Finalmouse, Fnatic, PMM, Waizowl, Fallen Gear, Sony Inzone, several ZOWIE regional SKUs, plus some flagship models whose old Proshop links turned out to be guessed/unverified — razer-viper-v3-pro, razer-viper-v4-pro, zowie-u2-dw, pulsar-x2, logitech-g-pro-x-superlight), 5 keyboards (wooting-80he, razer-huntsman-v3-pro, corsair-k100-rgb, keychron-k4-he, aula-f75-pro — all had proshop as their ONLY retailer, all unverified), 4 monitors (zowie-xl2566k, zowie-xl2546k, asus-rog-swift-pg27aqdm, alienware-aw2524h), and 14 mousepads (steelseries-qck-heavy, zowie-g-sr-iii/h-sr-iii/g-tr/g-sr-ii, artisan-ninja-fx-zero/fx-hien/type-99, logitech-g740/g640, vaxee-pa, xtrfy-gp4, fnatic-focus-3, corsair-mm250). For each: (1) check whether Geek'd/Computersalg/Coolshop/AVXperten/Dustin Home/Komplett/Billo (already in retailers.ts) carries it — if so, that retailer's own feed/API can supply a real offer (MaxGaming is not a retailer partner — do not source offers from there); (2) if genuinely no Danish retailer carries it, find the closest comparable in-catalog product to show as a substitute instead of a dead end.",
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
      "MaxGaming's old vaxee-xe-wireless URL 404'd; a site search on maxgaming.dk turned up zero listings for the mouse itself (only mouse skates/grips compatible with it). We have no MaxGaming XML feed to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer (Geek'd, Computersalg, Coolshop, AVXperten, Dustin Home, Komplett, Billo) carry it?",
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
      "MaxGaming's old fnatic-lamzu-maya-8k URL 404'd; a site search returned zero results for this Fnatic x Lamzu collab edition. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer carry this specific collab edition, or has it sold out permanently (limited collab drop)?",
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
      "MaxGaming's old g-wolves-hts-pro-4k URL 404'd; MaxGaming currently only stocks \"HTS Plus 4K\", a different tier from our catalog's \"HTS Pro 4K\" — not safe to assume they're interchangeable. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. Does any DK retailer carry the actual Pro tier?",
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
      "MaxGaming's old finalmouse-ultralight-x-large URL 404'd; MaxGaming's current Finalmouse lineup is all newer rebrand editions (ULX Prophecy, ULX Frostlord — both sold out; Starlight X Nightfall — coming soon), none of which are confirmed to be the same product as our catalog's plain \"Ultralight X Large\". No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed.",
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
      "MaxGaming's old pulsar-x2h URL 404'd; MaxGaming's current Pulsar X2H lineup is all newer generations (v3, CrazyLight, High Hump/eS) with different sensors than our catalog's PAW3395/1000Hz spec — not safe to assume interchangeable. No MaxGaming feed exists to auto-verify against, so the offer was removed rather than guessed. (pulsar-x2 has the same issue but kept its proshop offer.)",
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
];
