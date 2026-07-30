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
    | "peripheral-missing";
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
      instructions: "Run add-mouse skill for 'pulsar-xlite-v4-es'. Sources: RTINGS → Techpowerup → Pulsar product page. Fill in specs (weight, dimensions, sensor, polling rate, switch type), write Danish copy (beskrivelse, fordele, ulemper), find MaxGaming/proshop.dk offers, download product image from MaxGaming CDN. Then resolve this ticket when complete.",
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
    id: "razer-deathadder-v3-pro-stub-2026-07-27",
    type: "stub-mouse-created",
    slug: "doc-cs",
    label: "razer-deathadder-v3-pro — mouse stub needs completion",
    question: "doc uses a Razer DeathAdder V3 Pro which does not exist in the mouse catalog. A stub was created. Run add-mouse to complete it.",
    context: {
      esport: "cs2",
      mouseSlug: "razer-deathadder-v3-pro",
      mouseNavn: "DeathAdder V3 Pro",
      sourcePro: "doc-cs",
      sourceUrl: "https://prosettings.net/players/doc/",
      instructions: "Run the add-mouse skill for razer-deathadder-v3-pro to fill in specs, copy, and offers.",
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
];
