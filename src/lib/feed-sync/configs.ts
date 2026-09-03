import type { RetailerSlug } from "@/lib/types";
import type { ProductCategory, RetailerFeedConfig } from "./types";

/**
 * Ported verbatim from the original scripts/match-{retailer}-eans.mjs —
 * each mapping was tuned against real false positives (see comments below),
 * not re-derived. Only the shape changed (typed config object instead of a
 * standalone script's module-level consts).
 */

// Proshop's kategorinavn is a flat, whole-catalog taxonomy (not gaming-specific
// like Geek'd's), so mapping is coarser — "Mus" covers every mouse Proshop
// sells, not just gaming ones. Brand + token overlap does the real filtering.
const PROSHOP_FEED_CAT_TO_OUR: Record<string, ProductCategory[]> = {
  mus: ["mus"],
  tastatur: ["tastaturer"],
  hovedtelefonerheadset2: ["headset"],
  "musemaatte tilbehoer": ["musemaatter"],
  skaerm: ["skaerme"],
};

// Geek'd (Shopify, geekd.dk) uses a hierarchical, gaming-specific taxonomy —
// "Gaming Udstyr > Gamer Mus > Trådløs Mus" — unlike Proshop's flat one.
// "Mus Tilbehør" / "Musefødder" are accessories (grips, feet), not mice —
// deliberately excluded to avoid the accessory-vs-product confusion class of
// bug (see match-proshop-eans.mjs's Wooting Travel Case 80HE incident).
const GEEKD_FEED_CAT_TO_OUR: Record<string, ProductCategory[]> = {
  "gaming udstyr > gamer mus > trådløs mus": ["mus"],
  "gaming udstyr > gamer mus": ["mus"],
  "gaming udstyr > gamer tastatur > mekanisk tastatur": ["tastaturer"],
  "gaming udstyr > gamer tastatur > trådløs tastatur": ["tastaturer"],
  "gaming udstyr > gamer tastatur": ["tastaturer"],
  "gaming udstyr > gamer headset > trådløst headset": ["headset"],
  "gaming udstyr > gamer headset": ["headset"],
  "gaming udstyr > gamer musemåtte > stor måsemåtte": ["musemaatter"],
  "gaming udstyr > gamer musemåtte": ["musemaatter"],
  "gaming udstyr > gamer skærm": ["skaerme"],
};

// Komplett's g:product_type is a full breadcrumb ("Gaming > Spiludstyr >
// Gamingmus"). Mapped on the leaf segment only, allow-listing just the
// gaming-relevant and general hardware leaves (accessory leaves like
// "Tilbehør til gamingheadset" are deliberately left unmapped).
const KOMPLETT_FEED_CAT_TO_OUR: Record<string, ProductCategory[]> = {
  gamingmus: ["mus"],
  mus: ["mus"],
  keyboards: ["tastaturer"],
  gamingheadset: ["headset"],
  headset: ["headset"],
  gamingmusemåtte: ["musemaatter"],
  musemåtter: ["musemaatter"],
  gamingskærme: ["skaerme"],
  skærme: ["skaerme"],
};

// AV-Cables' g:product_type breadcrumb uses its own taxonomy, mapped from a
// manual survey of the feed's category leaves. AV-Cables carries no
// standalone gaming monitors (only mounting brackets), so there is
// deliberately no "skaerme" entry here — a real catalog gap, not an oversight.
const AVCABLES_FEED_CAT_TO_OUR: Record<string, ProductCategory[]> = {
  "gamer mus": ["mus"],
  "gaming mus": ["mus"],
  "computer mus": ["mus"],
  "gamer tastatur": ["tastaturer"],
  "tastatur med ledning": ["tastaturer"],
  "trådløst tastatur": ["tastaturer"],
  "gamer headset": ["headset"],
  "trådløst computer headset": ["headset"],
  "computer headset med kabel": ["headset"],
  "gamer musemåtte": ["musemaatter"],
  musemåtte: ["musemaatter"],
};

function normalizeKey(s: string): string {
  return s.toLowerCase().trim();
}

/** Komplett/AV-Cables map on the last breadcrumb segment only. */
function leafCategory(raw: string): string {
  const parts = raw
    .split(">")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? normalizeKey(parts[parts.length - 1]) : "";
}

// Proshop and Geek'd both file some monitors under the panel/OEM brand
// rather than the sub-brand our catalog uses (ZOWIE monitors as "BenQ",
// Alienware monitors as "Dell"). Feed brand -> extra catalog brands to
// also search. Ported from both original scripts' identical tables.
const MONITOR_OEM_BRAND_ALIAS = { benq: ["zowie"], dell: ["alienware"] };

export const FEED_CONFIGS: Record<RetailerSlug, RetailerFeedConfig> = {
  proshop: {
    retailer: "proshop",
    mapFeedCategory: (raw) => PROSHOP_FEED_CAT_TO_OUR[normalizeKey(raw)] ?? [],
    brandAliasFeedToCatalog: MONITOR_OEM_BRAND_ALIAS,
  },
  geekd: {
    retailer: "geekd",
    mapFeedCategory: (raw) => GEEKD_FEED_CAT_TO_OUR[normalizeKey(raw)] ?? [],
    brandAliasFeedToCatalog: MONITOR_OEM_BRAND_ALIAS,
  },
  komplett: {
    retailer: "komplett",
    mapFeedCategory: (raw) => KOMPLETT_FEED_CAT_TO_OUR[leafCategory(raw)] ?? [],
  },
  "av-cables": {
    retailer: "av-cables",
    mapFeedCategory: (raw) => AVCABLES_FEED_CAT_TO_OUR[leafCategory(raw)] ?? [],
    // AV-Cables files HyperX products under its corporate parent brand
    // ("Kingston") rather than the HyperX brand our catalog uses.
    brandAliasFeedToCatalog: { kingston: ["hyperx"] },
  },
};

/** Adapter + feed-URL wiring per retailer — netvaerk in retailers.ts already
 * distinguishes partner-ads (Proshop/Geek'd) from adtraction
 * (Komplett/AV-Cables); mirrored here since run.ts also needs the feed URL
 * env var name, which retailers.ts doesn't carry. Text decoding isn't
 * listed here — each adapter already hardcodes its own encoding
 * (partner-ads-xml.ts: latin1, google-shopping-rss.ts: utf-8) once handed a
 * real Buffer chunk, so it's implied by `adapter`, not a separate setting. */
export const FEED_TRANSPORT: Record<
  RetailerSlug,
  {
    adapter: "partner-ads" | "google-shopping";
    feedUrlEnv: string;
    /** Geek'd's titles all end in a site-branding suffix that would
     * otherwise skew tokenization. */
    stripTitleSuffix?: RegExp;
  }
> = {
  proshop: { adapter: "partner-ads", feedUrlEnv: "PARTNER_ADS_FEED_URL_PROSHOP" },
  geekd: {
    adapter: "partner-ads",
    feedUrlEnv: "PARTNER_ADS_FEED_URL_GEEKD",
    stripTitleSuffix: /-\s*GEEKD\.dk\s*$/i,
  },
  komplett: { adapter: "google-shopping", feedUrlEnv: "ADTRACTION_FEED_URL_KOMPLETT" },
  "av-cables": { adapter: "google-shopping", feedUrlEnv: "ADTRACTION_FEED_URL_AVCABLES" },
};
