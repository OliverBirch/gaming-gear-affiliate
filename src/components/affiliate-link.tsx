"use client";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import type { RetailerSlug } from "@/lib/types";
import { buildRedirectHref } from "@/lib/affiliate-href";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AffiliateLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "rel" | "target"
> & {
  retailer: RetailerSlug;
  produktUrl: string;
  affiliateUrl?: string | null;
  productSlug?: string;
  /** Override path stored on the click (defaults to current pathname). */
  pagePath?: string;
  network?: string;
  children: ReactNode;
};

/**
 * Outbound offer link: first-party /api/redirect + optional GA4 affiliate_click.
 * Never adds utm_* — Partner-ads uses uid injected server-side.
 */
export function AffiliateLink({
  retailer,
  produktUrl,
  affiliateUrl,
  productSlug,
  pagePath,
  network,
  children,
  onClick,
  className,
  ...rest
}: AffiliateLinkProps) {
  // Only use the server-provided pagePath in href (avoids hydration mismatch).
  // gtag may still read window.location on click for richer reporting.
  const href = buildRedirectHref({
    retailer,
    productSlug,
    produktUrl,
    affiliateUrl,
    pagePath,
  });

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Fire analytics only when available; never block navigation if gtag missing/denied.
    try {
      const path =
        pagePath ??
        (typeof window !== "undefined" ? window.location.pathname : undefined);
      window.gtag?.("event", "affiliate_click", {
        retailer,
        network: network ?? "unknown",
        product_slug: productSlug,
        link_id: productSlug ? `${productSlug}__${retailer}` : retailer,
        page_path: path,
        // Do not set value here as "revenue" — real value comes from PA callback.
        transport_type: "beacon",
      });
    } catch {
      // ignore
    }
    onClick?.(e);
  }

  return (
    <a
      href={href}
      rel="sponsored nofollow"
      target="_blank"
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
