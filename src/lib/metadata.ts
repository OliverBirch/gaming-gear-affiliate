import type { Metadata } from "next";
import { absoluteUrl } from "./schema-org";

/**
 * Shared page-metadata builder. Every page previously hand-rolled its own
 * `{ title, description }` object with no canonical URL, no per-page
 * OpenGraph image/url, and no Twitter card — the same "structurally
 * identical by construction" gap schema-org.ts already closed for JSON-LD.
 * Root-layout fields (openGraph.siteName/locale/type, alternates.languages)
 * still apply automatically via Next's metadata merging.
 */
export function buildMetadata(opts: {
  /** Omit to inherit the root layout's title (e.g. the homepage — an
   * explicit string here would run through the layout's title template
   * a second time, doubling the "- ProSetups.dk" suffix). */
  title?: string;
  description?: string;
  /** Site-root-relative path, e.g. "/mus" or `/mus/${slug}`. */
  path: string;
  /** Site-root-relative image path, e.g. a product's `billede` field. */
  image?: string | null;
  /** Per-page override, e.g. `{ index: false, follow: true }` for a stub
   * product page. Replaces (not merges with) the root layout's `robots` —
   * the layout's site-wide noindex is a separate, intentional pre-launch
   * block; this exists so a stub page stays noindexed on its own merits
   * once that block eventually lifts. */
  robots?: Metadata["robots"];
}): Metadata {
  const url = absoluteUrl(opts.path);
  const images = opts.image ? [absoluteUrl(opts.image)] : undefined;
  return {
    ...(opts.title !== undefined && { title: opts.title }),
    ...(opts.description !== undefined && { description: opts.description }),
    ...(opts.robots !== undefined && { robots: opts.robots }),
    alternates: { canonical: url },
    openGraph: {
      ...(opts.title !== undefined && { title: opts.title }),
      ...(opts.description !== undefined && { description: opts.description }),
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      ...(opts.title !== undefined && { title: opts.title }),
      ...(opts.description !== undefined && { description: opts.description }),
      images,
    },
  };
}
