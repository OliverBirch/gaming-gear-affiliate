"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem("consent-given");
  });

  function acceptAll() {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "consent_update",
        consent: {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
          functionality_storage: "granted",
          security_storage: "granted",
        },
      });
    }
    localStorage.setItem("consent-given", "true");
    setVisible(false);
  }

  function acceptEssential() {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "consent_update",
        consent: {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
          functionality_storage: "granted",
          security_storage: "granted",
        },
      });
    }
    localStorage.setItem("consent-given", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Vi bruger cookies til at forbedre din oplevelse og til affiliate-tracking.
          Læs mere på{" "}
          <Link href="/privatliv" className="underline">
            privatlivssiden
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0 max-sm:w-full max-sm:flex-col">
          <Button variant="outline" size="sm" onClick={acceptEssential} className="max-sm:w-full">
            Kun nødvendige
          </Button>
          <Button size="sm" onClick={acceptAll} className="max-sm:w-full">
            Acceptér alle
          </Button>
        </div>
      </div>
    </div>
  );
}
